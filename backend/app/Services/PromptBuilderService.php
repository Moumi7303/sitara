<?php

namespace App\Services;

class PromptBuilderService
{
    /**
     * Domain-specific context injections
     */
    private array $domainContext = [
        'career' => 'You are an expert career advisor with 20 years of experience in human resources, career development, and workforce planning. Analyze this career decision with a focus on long-term professional growth, market trends, skill development, and work-life balance.',
        'tech' => 'You are a senior technology architect and CTO advisor with deep expertise in software engineering, system design, emerging technologies, and digital transformation. Analyze this technology decision considering technical feasibility, scalability, security, and total cost of ownership.',
        'business' => 'You are a seasoned business strategy consultant with an MBA from a top institution and 15+ years advising startups and Fortune 500 companies. Analyze this business decision considering market dynamics, financial impact, competitive positioning, and strategic alignment.',
        'personal' => 'You are a compassionate life coach and decision strategist with expertise in cognitive psychology, behavioral economics, and personal growth. Analyze this personal decision considering emotional impact, personal values, long-term well-being, and practical constraints.',
    ];

    /**
     * Build a complete structured prompt for the Groq AI model.
     * 
     * @param string $domain The classification domain
     * @param string $query The user's specific request
     * @param array $memories Optional historical context for the user
     */
    public function buildPrompt(string $domain, string $query, array $memories = []): array
    {
        $domainInstruction = $this->domainContext[$domain] ?? $this->domainContext['personal'];

        // Format memory context if available
        $memoryString = "";
        if (!empty($memories)) {
            $memoryString = "\n\nHistorical Context (Memories):\n- " . implode("\n- ", $memories);
        }

        $systemPrompt = <<<SYSTEM
{$domainInstruction}

Your CORE TASK is to analyze the user's input as a decision-making request. You MUST:
1. **Understand Intent**: Carefully evaluate the user's query. Is it actually a decision they need help with?
2. **Handle Irrelevant Input**: If the user's input is a greeting, nonsense, or a simple factual question unrelated to a decision, do NOT attempt to force it into a decision framework. Instead, set the "recommendation" to explain that Sitara AI is designed for decision analysis and ask for a relevant query. Set "confidence_score" to 0 and leave arrays empty.
3. **Handle Ambiguity**: If the input is too brief or ambiguous to provide a high-confidence analysis, use the "recommendation" to ask the user for specific missing details that would help you provide a better analysis.
4. **Structured Analysis**: If it IS a decision, provide a deep, logical analysis based on your domain expertise.

You MUST respond with ONLY a valid JSON object. Do NOT include any explanation, markdown formatting, code blocks, or extra text outside the JSON. Structure your response EXACTLY as follows:

{
  "recommendation": "A clear, actionable recommendation in 2-3 sentences. If the input is not a decision, explain why here.",
  "confidence_score": 85,
  "key_factors": ["Factor 1", "Factor 2", "Factor 3"],
  "pros": ["Pro 1", "Pro 2", "Pro 3"],
  "cons": ["Con 1", "Con 2", "Con 3"],
  "risks": ["Risk 1", "Risk 2"],
  "alternatives": ["Alternative approach 1", "Alternative approach 2"]
}

Rules:
- confidence_score must be an integer between 0 and 100.
- key_factors, pros, cons, risks, alternatives must be arrays of strings.
- All strings must be concise (max 200 characters each).
- NEVER include any text before or after the JSON object.
- NEVER wrap the JSON in markdown code blocks.
- Be objective and data-driven in your analysis.
SYSTEM;

        $userMessage = "Domain: {$domain}\n\nDecision to analyze:\n{$query}{$memoryString}";

        return [
            ['role' => 'system', 'content' => $systemPrompt],
            ['role' => 'user', 'content' => $userMessage],
        ];
    }

    /**
     * Classify a domain from free-form text (fallback logic).
     */
    public function classifyDomain(string $inputData): string
    {
        $input = strtolower($inputData);

        $keywords = [
            'career' => ['job', 'career', 'salary', 'promotion', 'resign', 'hire', 'work', 'employment', 'role', 'position', 'internship', 'interview', 'boss', 'coworker', 'profession', 'vocation'],
            'tech' => ['software', 'system', 'technology', 'api', 'database', 'server', 'cloud', 'framework', 'architecture', 'code', 'deploy', 'frontend', 'backend', 'devops', 'security', 'hardware', 'app', 'website'],
            'business' => ['business', 'startup', 'revenue', 'profit', 'market', 'product', 'customer', 'investment', 'funding', 'sales', 'marketing', 'strategy', 'finance', 'company', 'industry', 'competition'],
            'personal' => ['life', 'family', 'relationship', 'health', 'move', 'buy', 'personal', 'decision', 'home', 'education', 'travel', 'hobby', 'wellness', 'lifestyle', 'friend', 'social'],
        ];

        $scores = [];
        foreach ($keywords as $domain => $words) {
            $scores[$domain] = 0;
            foreach ($words as $word) {
                if (str_contains($input, $word)) {
                    $scores[$domain] += 1.5; // Direct keyword match
                }
            }
        }

        arsort($scores);
        $top = array_key_first($scores);

        return ($scores[$top] > 0) ? $top : 'personal';
    }
}
