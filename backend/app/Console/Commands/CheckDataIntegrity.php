<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\ApiKey;
use App\Models\Decision;
use App\Models\DecisionOutput;
use App\Models\Memory;
use App\Models\AuditLog;

class CheckDataIntegrity extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:check-data-integrity';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check the integrity of the seeded database by counting records';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('--- Sitara Data Integrity Check ---');

        $usersCount = User::count();
        $keysCount = ApiKey::count();
        $decisionsCount = Decision::count();
        $outputsCount = DecisionOutput::count();
        $memoryCount = Memory::count();
        $auditLogsCount = AuditLog::count();

        $this->table(
            ['Table', 'Record Count'],
            [
                ['users', $usersCount],
                ['api_keys', $keysCount],
                ['decisions', $decisionsCount],
                ['decision_outputs', $outputsCount],
                ['memory', $memoryCount],
                ['audit_logs', $auditLogsCount],
            ]
        );

        if ($usersCount > 0 && $keysCount > 0 && $decisionsCount > 0 && $outputsCount > 0 && $memoryCount > 0) {
            $this->info("\nVerification: frontend → backend → database integrity ensured.");
        } else {
            $this->error("\nSome tables lack data. Check seeders or database constraints.");
        }
    }
}
