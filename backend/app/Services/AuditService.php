<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Log;

class AuditService
{
    /**
     * Log an audit event. Wrapped in try/catch so audit failures never break requests.
     *
     * @param int|null $userId
     * @param string $action
     * @param string $status  'success' | 'failure'
     * @param array $metadata
     */
    public static function log(?int $userId, string $action, string $status = 'success', array $metadata = []): void
    {
        try {
            AuditLog::create([
                'user_id' => $userId,
                'action'  => $action,
                'status'  => $status,
                'metadata' => $metadata,
            ]);
        } catch (\Exception $e) {
            Log::warning('AuditService: Failed to write audit log', [
                'error'   => $e->getMessage(),
                'action'  => $action,
                'user_id' => $userId,
            ]);
        }
    }
}
