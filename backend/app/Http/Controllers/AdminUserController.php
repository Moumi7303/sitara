<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Services\AuditService;
use Illuminate\Support\Facades\Hash;

class AdminUserController extends Controller
{
    /**
     * GET /api/admin/users — List all users (paginated)
     */
    public function index(Request $request)
    {
        $query = User::query();

        // Optional filters
        if ($request->has('role')) {
            $query->where('role', $request->input('role'));
        }

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->latest()->paginate(20);

        return response()->json($users);
    }

    /**
     * GET /api/admin/users/{user} — View any user's profile
     */
    public function show(User $user)
    {
        $user->loadCount(['decisions', 'apiKeys', 'memories']);

        return response()->json($user);
    }

    /**
     * PUT /api/admin/users/{user} — Update a user's role or profile
     */
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name'  => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:users,email,' . $user->id,
            'role'  => 'sometimes|string|in:' . implode(',', User::VALID_ROLES),
        ]);

        $oldRole = $user->role;
        $user->update($validated);

        AuditService::log(
            $request->user()->id,
            'admin_user_update',
            'success',
            [
                'target_user_id' => $user->id,
                'fields_changed' => array_keys($validated),
                'role_change' => isset($validated['role']) ? "{$oldRole} → {$validated['role']}" : null,
            ]
        );

        return response()->json([
            'message' => 'User updated successfully.',
            'user' => $user,
        ]);
    }

    /**
     * DELETE /api/admin/users/{user} — Delete a user
     */
    public function destroy(Request $request, User $user)
    {
        // Prevent self-deletion
        if ($user->id === $request->user()->id) {
            return response()->json(['error' => 'You cannot delete your own account.'], 403);
        }

        $userId = $user->id;
        $userEmail = $user->email;

        $user->delete();

        AuditService::log(
            $request->user()->id,
            'admin_user_deleted',
            'success',
            ['deleted_user_id' => $userId, 'deleted_email' => $userEmail]
        );

        return response()->json(['message' => 'User deleted successfully.']);
    }
}
