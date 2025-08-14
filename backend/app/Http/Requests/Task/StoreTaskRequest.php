<?php

namespace App\Http\Requests\Task;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTaskRequest extends FormRequest
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
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'estimated_minutes' => ['required', 'integer', 'min:1', 'max:480'],
            'priority' => ['nullable', Rule::in(['low', 'medium', 'high', 'urgent'])],
            'day_of_week' => ['nullable', Rule::in(['todo', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:50'],
            'due_date' => ['nullable', 'date', 'after_or_equal:today'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'title.required' => 'タスクタイトルは必須です。',
            'title.max' => 'タスクタイトルは255文字以内で入力してください。',
            'description.max' => '説明は1000文字以内で入力してください。',
            'estimated_minutes.required' => '予定時間は必須です。',
            'estimated_minutes.min' => '予定時間は1分以上で設定してください。',
            'estimated_minutes.max' => '予定時間は480分（8時間）以内で設定してください。',
            'priority.in' => '優先度が不正です。',
            'day_of_week.in' => '曜日が不正です。',
            'tags.array' => 'タグは配列形式で指定してください。',
            'tags.*.max' => 'タグは50文字以内で入力してください。',
            'due_date.date' => '有効な日付を入力してください。',
            'due_date.after_or_equal' => '期限は今日以降の日付を指定してください。',
        ];
    }
}