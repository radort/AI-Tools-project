<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreToolRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() !== null; // Anyone logged in can create tools
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'url' => 'required|url',
            'docs_url' => 'nullable|url',
            'video_url' => 'nullable|url',
            'difficulty' => 'required|in:beginner,intermediate,advanced',
            'categories' => 'required|array',
            'categories.*' => 'exists:categories,id',
            'roles' => 'required|array',
            'roles.*' => 'exists:roles,id',
        ];
    }
}
