<?php

namespace App\Http\Middleware;

use App\Models\AuditLog;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class ApiRequestLogger
{
    /**
     * Log every API request and its response time.
     * Writes to Laravel's log channel and stores in audit_logs for protected routes.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $startTime = microtime(true);

        /** @var Response $response */
        $response = $next($request);

        $duration = round((microtime(true) - $startTime) * 1000, 2); // ms

        $statusCode = $response->getStatusCode();
        $userId = $request->user()?->id;

        $logContext = [
            'method' => $request->method(),
            'path' => $request->path(),
            'status' => $statusCode,
            'duration_ms' => $duration,
            'ip' => $request->ip(),
            'user_id' => $userId,
        ];

        // Log to filesystem
        if ($statusCode >= 500) {
            Log::error('API request error', $logContext);
        } elseif ($statusCode >= 400) {
            Log::warning('API request client error', $logContext);
        } else {
            Log::info('API request', $logContext);
        }

        // Store in audit_logs for authenticated users on significant endpoints
        if ($userId && $this->shouldAudit($request)) {
            try {
                AuditLog::create([
                    'user_id' => $userId,
                    'action' => 'api_request',
                    'status' => $statusCode >= 400 ? 'failure' : 'success',
                    'metadata' => [
                        'method' => $request->method(),
                        'path' => $request->path(),
                        'http_status' => $statusCode,
                        'duration_ms' => $duration,
                    ],
                ]);
            } catch (\Exception $e) {
                // Never let audit logging break the response
                Log::warning('ApiRequestLogger: Failed to write audit log', ['error' => $e->getMessage()]);
            }
        }

        return $response;
    }

    /**
     * Only audit-log routes that are worth tracking in the DB.
     */
    private function shouldAudit(Request $request): bool
    {
        $auditedPaths = ['decision', 'api-key'];
        $path = $request->path();

        foreach ($auditedPaths as $pattern) {
            if (str_contains($path, $pattern)) {
                return true;
            }
        }

        return false;
    }
}
