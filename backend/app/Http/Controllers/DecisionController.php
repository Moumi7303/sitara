<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Decision;
use App\Services\DecisionService;
use App\Services\StreamingService;
use App\Services\AuditService;
use App\Jobs\ProcessDecision;
use Illuminate\Support\Facades\Cache;

use App\Http\Requests\StoreDecisionRequest;
use Illuminate\Support\Facades\DB;

class DecisionController extends Controller
{
    protected DecisionService $decisionService;
    protected StreamingService $streamingService;

    public function __construct(DecisionService $decisionService, StreamingService $streamingService)
    {
        $this->decisionService = $decisionService;
        $this->streamingService = $streamingService;
    }

    /**
     * GET /api/decisions — paginated list of decisions
     * Admin sees all; user/viewer sees own only.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Decision::class);

        $user = $request->user();

        if ($user->isAdmin()) {
            $decisions = Decision::with('output')->latest()->paginate(15);
        } else {
            $decisions = $user->decisions()->with('output')->latest()->paginate(15);
        }

        return response()->json($decisions);
    }

    /**
     * GET /api/decisions/{id} — single decision with output
     */
    public function show(Request $request, Decision $decision)
    {
        $this->authorize('view', $decision);

        $decision->load('output');
        return response()->json($decision);
    }

    /**
     * POST /api/decision — Create and process a decision via Groq AI
     */
    public function store(StoreDecisionRequest $request)
    {
        $this->authorize('create', Decision::class);

        \Log::info('Incoming Request to /api/decision', $request->all());
        $validated = $request->validated();
        $query = $this->sanitizeInput($validated['query']);
        $domain = $validated['domain'] ?? $this->decisionService->classifyDomain($query);

        // --- Redis Cache Check ---
        $cacheKey = 'decision:' . $request->user()->id . ':' . md5($domain . '|' . $query);

        if ($cached = Cache::get($cacheKey)) {
            AuditService::log(
                $request->user()->id,
                'decision_retrieval',
                'success',
                ['source' => 'cache', 'domain' => $domain]
            );

            return response()->json([
                'message' => 'Decision retrieved from cache',
                'cached' => true,
                'decision' => $cached,
            ]);
        }

        // --- Persistent Storage (Transaction) ---
        return DB::transaction(function () use ($request, $query, $domain, $cacheKey) {
            try {
                $decision = $request->user()->decisions()->create([
                    'domain' => $domain,
                    'query'  => $query,
                    'status' => 'pending',
                ]);
                \Log::info('Database insert success: Decision created', ['decision_id' => $decision->id]);
            } catch (\Exception $e) {
                \Log::error('Database insert failure: Decision failed', ['error' => $e->getMessage()]);
                throw $e;
            }

            AuditService::log(
                $request->user()->id,
                'decision_creation',
                'success',
                ['decision_id' => $decision->id, 'domain' => $domain]
            );

            // --- Async Queue Mode ---
            if ($request->boolean('async')) {
                ProcessDecision::dispatch($decision);

                return response()->json([
                    'message'     => 'Decision queued for processing.',
                    'decision_id' => $decision->id,
                    'status'      => 'pending',
                    'stream_url'  => url("/api/decisions/{$decision->id}/stream"),
                ], 202);
            }

            // --- Synchronous Mode ---
            try {
                $output = $this->decisionService->processDecision($decision);

                if (!$output) {
                    throw new \Exception('Processing failed');
                }

                $result = $decision->load('output');
                Cache::put($cacheKey, $result, now()->addHour());

                AuditService::log(
                    $request->user()->id,
                    'decision_processing',
                    'success',
                    ['decision_id' => $decision->id]
                );

                return response()->json([
                    'message'  => 'Decision processed successfully',
                    'cached'   => false,
                    'decision' => $result,
                ], 201);

            } catch (\Exception $e) {
                AuditService::log(
                    $request->user()->id,
                    'decision_processing',
                    'failure',
                    ['decision_id' => $decision->id, 'error' => $e->getMessage()]
                );

                return response()->json([
                    'error'       => 'Failed to process decision.',
                    'decision_id' => $decision->id,
                    'status'      => 'failed',
                ], 422);
            }
        });
    }

    /**
     * PUT /api/decisions/{decision} — Update decision metadata
     */
    public function update(Request $request, Decision $decision)
    {
        $this->authorize('update', $decision);

        $validated = $request->validate([
            'domain' => 'sometimes|string|max:50',
            'query'  => 'sometimes|string|max:2000',
        ]);

        $decision->update($validated);

        AuditService::log(
            $request->user()->id,
            'decision_updated',
            'success',
            ['decision_id' => $decision->id, 'fields' => array_keys($validated)]
        );

        return response()->json([
            'message'  => 'Decision updated successfully.',
            'decision' => $decision->load('output'),
        ]);
    }

    /**
     * DELETE /api/decisions/{decision} — Delete a decision and its output
     */
    public function destroy(Request $request, Decision $decision)
    {
        $this->authorize('delete', $decision);

        $decisionId = $decision->id;

        // Delete output first (child), then decision
        $decision->output()?->delete();
        $decision->delete();

        AuditService::log(
            $request->user()->id,
            'decision_deleted',
            'success',
            ['decision_id' => $decisionId]
        );

        return response()->json(['message' => 'Decision deleted successfully.']);
    }

    /**
     * POST /api/decisions/{id}/rerun — Re-run an existing decision
     */
    public function rerun(Request $request, Decision $decision)
    {
        $this->authorize('update', $decision);

        $output = $this->decisionService->reRunDecision($decision);

        if (!$output) {
            return response()->json(['error' => 'Failed to re-run decision'], 422);
        }

        AuditService::log(
            $request->user()->id,
            'decision_rerun',
            'success',
            ['decision_id' => $decision->id]
        );

        return response()->json([
            'message' => 'Decision re-run completed successfully',
            'decision' => $decision->load('output')
        ]);
    }

    /**
     * GET /api/decisions/{id}/stream — SSE streaming endpoint.
     */
    public function stream(Request $request, Decision $decision)
    {
        $this->authorize('view', $decision);

        return $this->streamingService->streamDecisionResponse($decision);
    }

    /**
     * Sanitize user input.
     */
    private function sanitizeInput(string $input): string
    {
        $input = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', '', $input);
        $input = strip_tags($input);
        $input = preg_replace('/\s{3,}/', ' ', $input);
        return trim($input);
    }
}
