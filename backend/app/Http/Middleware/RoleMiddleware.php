<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * Accepts one or more roles: role:admin or role:admin,user
     * Returns 403 if the authenticated user's role is not in the allowed list.
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthenticated.'], 401);
        }

        if (!in_array($user->role, $roles, true)) {
            return response()->json([
                'error' => 'Forbidden. You do not have the required role to access this resource.',
                'required_roles' => $roles,
                'your_role' => $user->role,
            ], 403);
        }

        return $next($request);
    }
}
