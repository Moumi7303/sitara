<?php

namespace Database\Seeders;

use App\Models\Decision;
use App\Models\DecisionOutput;
use Illuminate\Database\Seeder;

class DecisionOutputSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $decision1 = Decision::where('query', 'like', '%quantum computing%')->first();

        if ($decision1) {
            DecisionOutput::create([
                'decision_id' => $decision1->id,
                'recommendation' => 'Wait for market stabilization but evaluate top 3 startups.',
                'key_factors' => ['Market volatility', 'Technology maturity', 'Capital availability'],
                'pros' => ['High potential ROI', 'Early adopter advantage'],
                'cons' => ['Distant profitability', 'High risk of failure'],
                'risks' => ['Regulatory changes', 'Hardware limitations'],
                'alternatives' => ['Invest in AI hardware', 'Traditional tech ETFs']
            ]);
        }

        $decision2 = Decision::where('query', 'like', '%frontend to full-stack%')->first();

        if ($decision2) {
            DecisionOutput::create([
                'decision_id' => $decision2->id,
                'recommendation' => 'Yes, transition to full-stack to increase versatility.',
                'key_factors' => ['Market demand', 'Salary potential', 'Learning curve'],
                'pros' => ['Higher compensation', 'More job opportunities'],
                'cons' => ['Steep learning curve', 'Context switching'],
                'risks' => ['Burnout', 'Jack of all trades syndrome'],
                'alternatives' => ['Specialize in advanced frontend like WebGL']
            ]);
        }
    }
}
