<?php

namespace App\Policies;

use App\Models\Tool;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class ToolPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Tool $tool): bool
    {
        return $tool->status === 'approved' ||
               $user->id === $tool->created_by ||
               $user->hasRole(['admin', 'owner']);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return true; // Anyone can create tools
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Tool $tool): bool
    {
        return $user->id === $tool->created_by ||
               $user->hasRole(['admin', 'owner']);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Tool $tool): bool
    {
        return $user->id === $tool->created_by ||
               $user->hasRole(['admin', 'owner']);
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Tool $tool): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Tool $tool): bool
    {
        return false;
    }

    public function approve(User $user): bool
    {
        return $user->hasRole(['admin', 'owner']);
    }

    public function reject(User $user): bool
    {
        return $user->hasRole(['admin', 'owner']);
    }

    public function viewPending(User $user): bool
    {
        return $user->hasRole(['admin', 'owner']);
    }
}
