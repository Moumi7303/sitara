<?php

namespace App\Services;

use App\Models\Decision;
use App\Models\AuditLog;
use Illuminate\Support\Facades\Log;

class DecisionService
{
    protected GroqService $groqService;
    protected PromptBuilderService $promptBuilder;
    protected ResponseParserService $responseParser;

    public function __construct(
        GroqService $groqService,
        PromptBuilderService $promptBuilder,
        ResponseParserService $responseParser
    ) {
        $this->groqService = $groqService;
        $this->promptBuilder = $promptBuilder;
        $this->responseParser = $responseParser;
    }

    /**
     * Orchestrates the full decision processing pipeline.
     * Returns the structured output array or null on failure.
     */
    public function processDecision(Decision $decision): ?array
    {
        $decision->update(['status' => 'processing']);

        try {
            // 1. Resolve API key for the user
            $apiKey = $this->groqService->resolveApiKey($decision->user_id);

            if (!$apiKey) {
                Log::error('DecisionService: No API key available for user', ['user_id' => $decision->user_id]);
                $decision->update(['status' => 'failed']);
                return null;
            }

            // 2. Fetch memory context (retrieve past user insights)
            $memories = $decision->user->memories()
                ->latest()
                ->limit(5)
                ->pluck('context')
                ->toArray();

            // 3. Build structured prompt with memories
            $messages = $this->promptBuilder->buildPrompt(
                $decision->domain, 
                $decision->getAttribute('query'), 
                $memories
            );

            // 4. Send to Groq and get parsed structured result
            $parsed = $this->groqService->sendRequest($messages, $apiKey);

            if (!$parsed) {
                Log::error('DecisionService: AI returned no valid response', ['decision_id' => $decision->id]);
                $decision->update(['status' => 'failed']);
                return null;
            }

            // 4. Extract confidence score and update decision
            $confidenceScore = $parsed['confidence_score'] ?? null;
            unset($parsed['confidence_score']); // Remove from output data

            // 5. Store the decision output and update decision status/score
            $decision->output()->updateOrCreate(['decision_id' => $decision->id], $parsed);
            $decision->update([
                'status' => 'completed',
                'confidence_score' => $confidenceScore
            ]);

            // 6. Store new memory for future context
            $decision->user->memories()->create([
                'context' => "On " . now()->toFormattedDateString() . ", for a {$decision->domain} query: '{$decision->getAttribute('query')}', the recommendation was: {$parsed['recommendation']}"
            ]);

            // 7. Log the action
            AuditLog::create([
                'user_id' => $decision->user_id,
                'action' => 'decision_completed',
                'details' => [
                    'decision_id' => $decision->id,
                    'domain' => $decision->domain,
                    'confidence_score' => $confidenceScore,
                ],
            ]);

            return array_merge($parsed, ['confidence_score' => $confidenceScore]);

        } catch (\Exception $e) {
            Log::error('DecisionService: Unexpected error', [
                'decision_id' => $decision->id,
                'error' => $e->getMessage(),
            ]);
            $decision->update(['status' => 'failed']);
            return null;
        }
    }

    /**
     * Re-runs an existing decision analysis.
     */
    public function reRunDecision(Decision $decision): ?array
    {
        Log::info('DecisionService: Re-running decision', ['decision_id' => $decision->id]);
        
        // Clear old output first to ensure a fresh start
        $decision->output()->delete();
        $decision->update(['confidence_score' => null, 'status' => 'pending']);

        return $this->processDecision($decision);
    }

    /**
     * Return the streaming generator and update decision status.
     * Caller is responsible for consuming the generator inside an SSE response.
     */
    public function streamDecision(Decision $decision): ?\Generator
    {
        $apiKey = $this->groqService->resolveApiKey($decision->user_id);

        if (!$apiKey) {
            $decision->update(['status' => 'failed']);
            return null;
        }

        $decision->update(['status' => 'processing']);

        // Fetch memory context for streaming too
        $memories = $decision->user->memories()
            ->latest()
            ->limit(5)
            ->pluck('context')
            ->toArray();

        $messages = $this->promptBuilder->buildPrompt(
            $decision->domain, 
            $decision->getAttribute('query'), 
            $memories
        );

        return $this->groqService->streamRequest($messages, $apiKey);
    }

    /**
     * Proxied domain classification from PromptBuilderService.
     */
    public function classifyDomain(string $inputData): string
    {
        return $this->promptBuilder->classifyDomain($inputData);
    }
}
