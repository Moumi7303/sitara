<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class PromoteUserCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'user:role {email : The email of the user} {role : The role to assign (admin, user, viewer)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Change a user\'s role';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->argument('email');
        $role = $this->argument('role');

        if (!in_array($role, User::VALID_ROLES)) {
            $this->error("Invalid role: {$role}. Valid roles are: " . implode(', ', User::VALID_ROLES));
            return 1;
        }

        $user = User::where('email', $email)->first();

        if (!$user) {
            $this->error("User not found with email: {$email}");
            return 1;
        }

        $oldRole = $user->role;
        $user->role = $role;
        $user->save();

        $this->info("Successfully updated user {$user->name} ({$user->email}) from '{$oldRole}' to '{$role}'.");
        return 0;
    }
}
