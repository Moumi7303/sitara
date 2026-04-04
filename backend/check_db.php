<?php

use Illuminate\Support\Facades\DB;

$tables = ['users', 'api_keys', 'decisions', 'decision_outputs', 'memory', 'audit_logs'];

echo PHP_EOL . '--- Sitara DB Verification ---' . PHP_EOL;
foreach ($tables as $table) {
    try {
        $count = DB::table($table)->count();
        echo str_pad($table, 20) . ': ' . $count . ' records' . PHP_EOL;
    } catch (\Exception $e) {
        echo str_pad($table, 20) . ': ERROR - ' . $e->getMessage() . PHP_EOL;
    }
}
echo PHP_EOL . 'Done.' . PHP_EOL;
