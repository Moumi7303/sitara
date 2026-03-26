<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

class ResponseParserService
{
    /**
     * Required keys in the AI response schema
     */
    private array $requiredKeys = [
        'recommendation',
        'confidence_score',
        'key_factors',
        'pros',
        'cons',
        'risks',
        'alternatives',
    ];

    /**
     * Try to extract and parse a structured JSON response from AI output.
     * Handles markdown-wrapped JSON, bare JSON objects, and edge cases.
     */
    public function parseResponse(string $rawResponse): ?array
    {
        $cleaned = $this->extractJson($rawResponse);

        if ($cleaned === null) {
            Log::warning('ResponseParser: Could not extract JSON from AI response', ['raw' => $rawResponse]);
            return null;
        }

        $decoded = json_decode($cleaned, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            Log::warning('ResponseParser: JSON decode error', [
                'error' => json_last_error_msg(),
                'cleaned' => $cleaned,
            ]);
            return null;
        }

        if (!$this->validateSchema($decoded)) {
            Log::warning('ResponseParser: Schema validation failed', ['decoded' => $decoded]);
            return null;
        }

        return $this->sanitize($decoded);
    }

    /**
     * Extract a JSON object from the raw text (handles markdown code blocks too).
     */
    private function extractJson(string $text): ?string
    {
        // Strip markdown code fences: ```json ... ``` or ``` ... ```
        if (preg_match('/```(?:json)?\s*([\s\S]*?)```/i', $text, $matches)) {
            return trim($matches[1]);
        }

        // Find the first { ... } block in the response
        $start = strpos($text, '{');
        $end = strrpos($text, '}');

        if ($start !== false && $end !== false && $end > $start) {
            return substr($text, $start, $end - $start + 1);
        }

        return null;
    }

    /**
     * Validate that all required keys exist and have the correct types.
     */
    private function validateSchema(array $data): bool
    {
        foreach ($this->requiredKeys as $key) {
            if (!array_key_exists($key, $data)) {
                return false;
            }
        }

        if (!is_string($data['recommendation']) || empty($data['recommendation'])) {
            return false;
        }

        if (!is_numeric($data['confidence_score']) || $data['confidence_score'] < 0 || $data['confidence_score'] > 100) {
            return false;
        }

        $arrayKeys = ['key_factors', 'pros', 'cons', 'risks', 'alternatives'];
        foreach ($arrayKeys as $key) {
            if (!is_array($data[$key])) {
                return false;
            }
        }

        return true;
    }

    /**
     * Sanitize and normalize the parsed response.
     */
    private function sanitize(array $data): array
    {
        return [
            'recommendation' => strip_tags(substr(trim($data['recommendation']), 0, 1000)),
            'confidence_score' => (int) min(100, max(0, $data['confidence_score'])),
            'key_factors' => $this->sanitizeArray($data['key_factors']),
            'pros' => $this->sanitizeArray($data['pros']),
            'cons' => $this->sanitizeArray($data['cons']),
            'risks' => $this->sanitizeArray($data['risks']),
            'alternatives' => $this->sanitizeArray($data['alternatives']),
        ];
    }

    /**
     * Sanitize an array of strings.
     */
    private function sanitizeArray(array $items): array
    {
        return array_values(array_filter(
            array_map(fn($item) => strip_tags(substr(trim((string) $item), 0, 200)), $items),
            fn($item) => !empty($item)
        ));
    }
}
