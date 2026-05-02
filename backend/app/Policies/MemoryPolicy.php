<?php

namespace App\Policies;

use App\Models\Memory;
use App\Models\User;

class MemoryPolicy
{
    /**
     * Admin can view all memories; users/viewers can only view their own.
     */
    public function viewAny(User $user): bool
    {
        return true; // Filtering handled in controller
    }

    /**
     * Admin or owner can view a specific memory.
     */
    public function view(User $user, Memory $memory): bool
    {
        return $user->isAdmin() || $memory->user_id === $user->id;
    }

    /**
     * Admin and regular users can create memories. Viewers cannot.
     */
    public function create(User $user): bool
    {
        return !$user->isViewer();
    }

    /**
     * Admin or owner can update. Viewers cannot.
     */
    public function update(User $user, Memory $memory): bool
    {
        if ($user->isViewer()) {
            return false;
        }

        return $user->isAdmin() || $memory->user_id === $user->id;
    }

    /**
     * Admin or owner can delete. Viewers cannot.
     */
    public function delete(User $user, Memory $memory): bool
    {
        if ($user->isViewer()) {
            return false;
        }

        return $user->isAdmin() || $memory->user_id === $user->id;
    }
}
