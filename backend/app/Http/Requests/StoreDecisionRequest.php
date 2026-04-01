<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreDecisionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Use Laravel's standard auth middleware in routes
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'domain' => 'nullable|string|in:career,tech,business,personal',
            'query'  => 'required|string|min:10|max:5000',
            'async'  => 'nullable|boolean',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'query.required' => 'A decision query is required.',
            'query.min'      => 'Please describe your decision in at least 10 characters.',
            'domain.in'      => 'Selected domain must be one of: career, tech, business, or personal.',
        ];
    }
}
