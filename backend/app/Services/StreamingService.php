<?php

namespace App\Services;

use App\Models\Decision;
use App\Services\DecisionService;
use App\Services\ResponseParserService;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\StreamedResponse;

class StreamingService
{
    protected DecisionService $decisionService;
    protected ResponseParserService $responseParser;

    public function __construct(DecisionService $decisionService, ResponseParserService $responseParser)
    {
        $this->decisionService = $decisionService;
        $this->responseParser = $responseParser;
    }

    /**
     * Create a StreamedResponse that emits SSE events from Groq streaming.
     *
     * SSE Events emitted:
     *   event: processing  — initial handshake
     *   event: streaming   — each text chunk from Groq
     *   event: completed   — final structured JSON output
     *   event: error       — on failure
     */
    public function streamDecisionResponse(Decision $decision): StreamedResponse
    {
        return new StreamedResponse(function () use ($decision) {

            // Disable output buffering for real-time streaming
            if (ob_get_level()) {
                ob_end_clean();
            }

            // SSE Headers sent by the response constructor; set no-cache here
            header('Cache-Control: no-cache');
            header('X-Accel-Buffering: no'); // Disable nginx buffering

            // Emit processing started
            $this->emit('processing', ['status' => 'started', 'decision_id' => $decision->id]);

            try {
                $generator = $this->decisionService->streamDecision($decision);

                if (!$generator) {
                    $this->emit('error', ['message' => 'No API key available. Please add a Groq API key.']);
                    return;
                }

                $fullContent = '';

                foreach ($generator as $chunk) {
                    $fullContent .= $chunk;
                    $this->emit('streaming', ['chunk' => $chunk]);
                }

                // Try to parse the accumulated content into structured JSON
                $parsed = $this->responseParser->parseResponse($fullContent);

                if ($parsed) {
                    // Save the output to DB
                    if (!$decision->output) {
                        $decision->output()->create($parsed);
                    }
                    $decision->update(['status' => 'completed']);

                    $this->emit('completed', array_merge(
                        ['decision_id' => $decision->id, 'status' => 'completed'],
                        $parsed
                    ));
                } else {
                    // Streaming succeeded but JSON parsing failed: return raw
                    $decision->update(['status' => 'completed']);
                    $this->emit('completed', [
                        'decision_id' => $decision->id,
                        'status' => 'completed',
                        'raw_response' => $fullContent,
                    ]);
                }

            } catch (\Exception $e) {
                Log::error('StreamingService: Error during stream', [
                    'decision_id' => $decision->id,
                    'error' => $e->getMessage(),
                ]);
                $decision->update(['status' => 'failed']);
                $this->emit('error', ['message' => 'An error occurred during processing.']);
            }

        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache',
            'Connection' => 'keep-alive',
            'X-Accel-Buffering' => 'no',
        ]);
    }

    /**
     * Emit a single SSE event.
     */
    private function emit(string $event, array $data): void
    {
        echo "event: {$event}\n";
        echo "data: " . json_encode($data) . "\n\n";

        if (ob_get_level() > 0) {
            ob_flush();
        }
        flush();
    }
}
