<?php

namespace App\Jobs;

use App\Models\Decision;
use App\Models\AuditLog;
use App\Services\DecisionService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Bus\Queueable as BusQueueable;
use Illuminate\Support\Facades\Log;

class ProcessDecision implements ShouldQueue
{
    use Queueable, InteractsWithQueue;

    /**
     * Max retry attempts before marking decision as failed.
     */
    public int $tries = 3;

    /**
     * Timeout per attempt in seconds.
     */
    public int $timeout = 120;

    public function __construct(
        public readonly Decision $decision
    ) {}

    /**
     * Execute the queued decision processing job.
     */
    public function handle(DecisionService $decisionService): void
    {
        Log::channel('stack')->info('ProcessDecision job started', [
            'decision_id' => $this->decision->id,
            'user_id' => $this->decision->user_id,
            'domain' => $this->decision->domain,
            'attempt' => $this->attempts(),
        ]);

        $result = $decisionService->processDecision($this->decision);

        if ($result) {
            Log::info('ProcessDecision job completed successfully', [
                'decision_id' => $this->decision->id,
                'confidence_score' => $result['confidence_score'] ?? null,
            ]);

            AuditLog::create([
                'user_id' => $this->decision->user_id,
                'action' => 'decision_queued_completed',
                'status' => 'success',
                'metadata' => [
                    'decision_id' => $this->decision->id,
                    'domain' => $this->decision->domain,
                    'attempt' => $this->attempts(),
                ],
            ]);
        } else {
            Log::error('ProcessDecision job failed to get AI result', [
                'decision_id' => $this->decision->id,
                'attempt' => $this->attempts(),
            ]);
        }
    }

    /**
     * Handle a job failure after all retries are exhausted.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('ProcessDecision job permanently failed', [
            'decision_id' => $this->decision->id,
            'error' => $exception->getMessage(),
        ]);

        $this->decision->update(['status' => 'failed']);

        AuditLog::create([
            'user_id' => $this->decision->user_id,
            'action' => 'decision_queued_failed',
            'status' => 'failure',
            'metadata' => [
                'decision_id' => $this->decision->id,
                'error' => $exception->getMessage(),
            ],
        ]);
    }
}
