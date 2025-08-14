<?php

namespace App\Http\Requests\Task;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTaskRequest extends FormRequest
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
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string', 'max:1000'],
            'estimated_minutes' => ['sometimes', 'integer', 'min:1', 'max:480'],
            'priority' => ['sometimes', Rule::in(['low', 'medium', 'high', 'urgent'])],
            'status' => ['sometimes', Rule::in(['todo', 'in_progress', 'completed', 'cancelled'])],
            'tags' => ['sometimes', 'nullable', 'array'],
            'tags.*' => ['string', 'max:50'],
            'due_date' => ['sometimes', 'nullable', 'date'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'title.max' => 'タスクタイトルは255文字以内で入力してください。',
            'description.max' => '説明は1000文字以内で入力してください。',
            'estimated_minutes.min' => '予定時間は1分以上で設定してください。',
            'estimated_minutes.max' => '予定時間は480分（8時間）以内で設定してください。',
            'priority.in' => '優先度が不正です。',
            'status.in' => 'ステータスが不正です。',
            'tags.array' => 'タグは配列形式で指定してください。',
            'tags.*.max' => 'タグは50文字以内で入力してください。',
            'due_date.date' => '有効な日付を入力してください。',
        ];
    }
}