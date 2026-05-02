<?php

namespace App\Policies;

use App\Models\Decision;
use App\Models\User;

class DecisionPolicy
{
    /**
     * Admin can view all decisions; users/viewers can only view their own.
     */
    public function viewAny(User $user): bool
    {
        return true; // Filtering is handled in the controller query
    }

    /**
     * Admin or owner can view a specific decision.
     */
    public function view(User $user, Decision $decision): bool
    {
        return $user->isAdmin() || $decision->user_id === $user->id;
    }

    /**
     * Admin and regular users can create decisions. Viewers cannot.
     */
    public function create(User $user): bool
    {
        return !$user->isViewer();
    }

    /**
     * Admin or owner can update. Viewers cannot.
     */
    public function update(User $user, Decision $decision): bool
    {
        if ($user->isViewer()) {
            return false;
        }

        return $user->isAdmin() || $decision->user_id === $user->id;
    }

    /**
     * Admin or owner can delete. Viewers cannot.
     */
    public function delete(User $user, Decision $decision): bool
    {
        if ($user->isViewer()) {
            return false;
        }

        return $user->isAdmin() || $decision->user_id === $user->id;
    }
}
