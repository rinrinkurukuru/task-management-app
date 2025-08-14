<?php

namespace App\Http\Requests\Pomodoro;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StartSessionRequest extends FormRequest
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
            'task_id' => ['nullable', 'exists:tasks,id'],
            'session_type' => ['required', Rule::in(['work', 'short_break', 'long_break'])],
            'planned_duration_minutes' => ['required', 'integer', 'min:1', 'max:60'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'task_id.exists' => '指定されたタスクが存在しません。',
            'session_type.required' => 'セッションタイプは必須です。',
            'session_type.in' => 'セッションタイプが不正です。',
            'planned_duration_minutes.required' => '予定時間は必須です。',
            'planned_duration_minutes.min' => '予定時間は1分以上で設定してください。',
            'planned_duration_minutes.max' => '予定時間は60分以内で設定してください。',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            if ($this->task_id) {
                $task = \App\Models\Task::find($this->task_id);
                if ($task && $task->user_id !== $this->user()->id) {
                    $validator->errors()->add('task_id', '他のユーザーのタスクにはアクセスできません。');
                }
            }
        });
    }
}