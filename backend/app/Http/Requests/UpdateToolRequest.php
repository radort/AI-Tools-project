<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateToolRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $tool = $this->route('tool');
        return $this->user() && $tool->created_by === $this->user()->id;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'url' => 'sometimes|required|url',
            'docs_url' => 'nullable|url',
            'video_url' => 'nullable|url',
            'difficulty' => 'sometimes|required|in:beginner,intermediate,advanced',
            'categories' => 'sometimes|array',
            'categories.*' => 'exists:categories,id',
            'roles' => 'sometimes|array',
            'roles.*' => 'exists:roles,id',
        ];
    }
}
