<?php

namespace App\Services;

use App\Models\ApiKey;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GroqService
{
    protected string $baseUrl;
    protected EncryptionService $encryptionService;
    protected ResponseParserService $responseParser;

    // Default model to use (stable, high quality)
    const DEFAULT_MODEL = 'llama-3.3-70b-versatile';

    // Max number of retries if JSON response is invalid
    const MAX_RETRIES = 2;

    public function __construct(EncryptionService $encryptionService, ResponseParserService $responseParser)
    {
        $this->baseUrl = config('services.groq.base_url', env('GROQ_API_BASE_URL', 'https://api.groq.com/openai/v1'));
        $this->encryptionService = $encryptionService;
        $this->responseParser = $responseParser;
    }

    /**
     * Resolve the API key to use: user-stored key or fallback to env master key.
     */
    public function resolveApiKey(int $userId): ?string
    {
        $apiKey = ApiKey::where('user_id', $userId)
            ->where('status', true)
            ->latest()
            ->first();

        if ($apiKey) {
            // Record usage timestamp
            $apiKey->update(['last_used_at' => now()]);
            return $this->encryptionService->decryptKey($apiKey->encrypted_key);
        }

        // Fallback to master key from config (works with config:cache)
        $masterKey = config('services.groq.api_key');
        if (!empty($masterKey)) {
            return $masterKey;
        }

        return null;
    }

    /**
     * Validate an API key against Groq (using a lightweight model call).
     */
    public function validateApiKey(string $plainKey): bool
    {
        try {
            $request = Http::withToken($plainKey)
                ->timeout(10);

            if (config('app.debug')) {
                $request = $request->withoutVerifying();
            }

            $response = $request->post("{$this->baseUrl}/chat/completions", [
                    'model' => 'gemma2-9b-it',
                    'messages' => [['role' => 'user', 'content' => 'Hi']],
                    'max_tokens' => 5,
                ]);

            return $response->status() !== 401;
        } catch (\Exception $e) {
            Log::warning('GroqService: API key validation failed', ['error' => $e->getMessage()]);
            return false;
        }
    }

    /**
     * Send a non-streaming request to Groq API.
     * Returns the parsed structured JSON or null on failure after retries.
     */
    public function sendRequest(array $messages, string $apiKey, string $model = self::DEFAULT_MODEL): ?array
    {
        $attempt = 0;

        while ($attempt <= self::MAX_RETRIES) {
            $attempt++;

            try {
                $request = Http::withToken($apiKey)
                    ->timeout(60);

                if (config('app.debug')) {
                    $request = $request->withoutVerifying();
                }

                $response = $request->post("{$this->baseUrl}/chat/completions", [
                        'model' => $model,
                        'messages' => $messages,
                        'temperature' => 0.3,
                        'max_tokens' => 1024,
                        'stream' => false,
                    ]);

                if (!$response->successful()) {
                    Log::error('GroqService: API error', [
                        'status' => $response->status(),
                        'body' => $response->body(),
                        'attempt' => $attempt,
                    ]);

                    if ($response->status() === 429) {
                        // Rate limited by Groq, wait before retry
                        sleep(2 * $attempt);
                        continue;
                    }

                    return null;
                }

                $content = $response->json('choices.0.message.content', '');
                $parsed = $this->responseParser->parseResponse($content);

                if ($parsed !== null) {
                    return $parsed;
                }

                Log::warning('GroqService: Invalid JSON response, retrying', [
                    'attempt' => $attempt,
                    'raw_content' => $content,
                ]);

            } catch (\Exception $e) {
                Log::error('GroqService: Request exception', [
                    'error' => $e->getMessage(),
                    'attempt' => $attempt,
                ]);

                if ($attempt > self::MAX_RETRIES) {
                    return null;
                }

                sleep($attempt);
            }
        }

        return null;
    }

    /**
     * Send a streaming request to Groq API.
     * Yields chunks of text as they arrive via a generator.
     *
     * @return \Generator<string>
     */
    public function streamRequest(array $messages, string $apiKey, string $model = self::DEFAULT_MODEL): \Generator
    {
        try {
            $request = Http::withToken($apiKey)
                ->timeout(120)
                ->withOptions([
                    'stream' => true,
                ]);

            if (config('app.debug')) {
                $request = $request->withoutVerifying();
            }

            $response = $request->post("{$this->baseUrl}/chat/completions", [
                    'model' => $model,
                    'messages' => $messages,
                    'temperature' => 0.3,
                    'max_tokens' => 1024,
                    'stream' => true,
                ]);

            if (!$response->successful()) {
                Log::error('GroqService: Stream request failed', [
                    'status' => $response->status(),
                ]);
                return;
            }

            $body = $response->toPsrResponse()->getBody();
            $buffer = '';

            while (!$body->eof()) {
                $chunk = $body->read(4096);
                $buffer .= $chunk;

                // Process complete SSE lines
                while (($newlinePos = strpos($buffer, "\n")) !== false) {
                    $line = substr($buffer, 0, $newlinePos);
                    $buffer = substr($buffer, $newlinePos + 1);
                    $line = trim($line);

                    if (empty($line) || $line === 'data: [DONE]') {
                        continue;
                    }

                    if (str_starts_with($line, 'data: ')) {
                        $jsonStr = substr($line, 6);
                        $data = json_decode($jsonStr, true);

                        if (json_last_error() === JSON_ERROR_NONE) {
                            $delta = $data['choices'][0]['delta']['content'] ?? null;
                            if ($delta !== null) {
                                yield $delta;
                            }
                        }
                    }
                }
            }
        } catch (\Exception $e) {
            Log::error('GroqService: Stream exception', ['error' => $e->getMessage()]);
        }
    }
}
