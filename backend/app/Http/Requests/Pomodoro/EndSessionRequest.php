<?php

namespace App\Http\Requests\Pomodoro;

use Illuminate\Foundation\Http\FormRequest;

class EndSessionRequest extends FormRequest
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
            'actual_duration_minutes' => ['required', 'integer', 'min:0', 'max:120'],
            'was_completed' => ['required', 'boolean'],
            'interruptions_count' => ['nullable', 'integer', 'min:0', 'max:100'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'actual_duration_minutes.required' => '実際の時間は必須です。',
            'actual_duration_minutes.min' => '実際の時間は0分以上で入力してください。',
            'actual_duration_minutes.max' => '実際の時間は120分以内で入力してください。',
            'was_completed.required' => '完了ステータスは必須です。',
            'was_completed.boolean' => '完了ステータスはtrue/falseで指定してください。',
            'interruptions_count.min' => '中断回数は0以上で入力してください。',
            'interruptions_count.max' => '中断回数は100以下で入力してください。',
            'notes.max' => 'メモは1000文字以内で入力してください。',
        ];
    }
}