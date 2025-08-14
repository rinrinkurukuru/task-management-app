<?php

namespace App\Http\Requests\Task;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class MoveTaskRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'day_of_week' => ['required', Rule::in(['todo', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])],
            'position' => ['required', 'integer', 'min:0'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'day_of_week.required' => '移動先の曜日を指定してください。',
            'day_of_week.in' => '曜日が不正です。',
            'position.required' => '位置を指定してください。',
            'position.integer' => '位置は整数で指定してください。',
            'position.min' => '位置は0以上で指定してください。',
        ];
    }
}