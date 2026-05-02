<?php

namespace App\Policies;

use App\Models\ApiKey;
use App\Models\User;

class ApiKeyPolicy
{
    /**
     * Admin can view all API keys; users/viewers can only view their own.
     */
    public function viewAny(User $user): bool
    {
        return true; // Filtering handled in controller
    }

    /**
     * Admin or owner can view a specific API key.
     */
    public function view(User $user, ApiKey $apiKey): bool
    {
        return $user->isAdmin() || $apiKey->user_id === $user->id;
    }

    /**
     * Admin and regular users can create API keys. Viewers cannot.
     */
    public function create(User $user): bool
    {
        return !$user->isViewer();
    }

    /**
     * Admin or owner can update. Viewers cannot.
     */
    public function update(User $user, ApiKey $apiKey): bool
    {
        if ($user->isViewer()) {
            return false;
        }

        return $user->isAdmin() || $apiKey->user_id === $user->id;
    }

    /**
     * Admin or owner can delete. Viewers cannot.
     */
    public function delete(User $user, ApiKey $apiKey): bool
    {
        if ($user->isViewer()) {
            return false;
        }

        return $user->isAdmin() || $apiKey->user_id === $user->id;
    }
}
