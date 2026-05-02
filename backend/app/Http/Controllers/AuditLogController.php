<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\AuditLog;
use App\Services\AuditService;

class AuditLogController extends Controller
{
    /**
     * GET /api/audit-logs — User sees own logs (paginated)
     */
    public function index(Request $request)
    {
        $query = $request->user()->auditLogs();

        // Optional filters
        if ($request->has('action')) {
            $query->where('action', $request->input('action'));
        }

        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        $logs = $query->latest()->paginate(20);

        return response()->json($logs);
    }

    /**
     * GET /api/admin/audit-logs — Admin sees all logs (paginated, filterable)
     */
    public function adminIndex(Request $request)
    {
        $query = AuditLog::with('user:id,name,email');

        // Optional filters
        if ($request->has('user_id')) {
            $query->where('user_id', $request->input('user_id'));
        }

        if ($request->has('action')) {
            $query->where('action', $request->input('action'));
        }

        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->has('from')) {
            $query->where('created_at', '>=', $request->input('from'));
        }

        if ($request->has('to')) {
            $query->where('created_at', '<=', $request->input('to'));
        }

        $logs = $query->latest()->paginate(50);

        return response()->json($logs);
    }

    /**
     * DELETE /api/admin/audit-logs/{log} — Admin can delete a log entry
     */
    public function destroy(Request $request, AuditLog $log)
    {
        $logId = $log->id;
        $log->delete();

        AuditService::log(
            $request->user()->id,
            'audit_log_deleted',
            'success',
            ['deleted_log_id' => $logId]
        );

        return response()->json(['message' => 'Audit log entry deleted.']);
    }
}
