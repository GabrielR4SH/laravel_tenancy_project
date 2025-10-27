<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:8'],
            'organization_name' => [Rule::requiredIf(fn () => !$this->filled('organization_id')), 'string', 'max:255'],
            'organization_id' => [Rule::requiredIf(fn () => !$this->filled('organization_name')), 'integer', 'exists:organizations,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'organization_name.required_without' => 'O nome da organização é obrigatório se não fornecer o ID.',
            'organization_id.required_without' => 'O ID da organização é obrigatório se não fornecer o nome.',
            'organization_id.exists' => 'A organização selecionada não existe.',
        ];
    }
}
