<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

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
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'estimated_minutes' => 'required|integer|min:1|max:480',
            'priority' => 'in:low,medium,high,urgent',
            'day_of_week' => 'in:todo,monday,tuesday,wednesday,thursday,friday,saturday,sunday',
            'tags' => 'nullable|array',
            'due_date' => 'nullable|date',
        ];
    }

    /**
     * Get custom error messages.
     */
    public function messages(): array
    {
        return [
            'title.required' => 'タスクのタイトルは必須です',
            'title.max' => 'タイトルは255文字以内で入力してください',
            'estimated_minutes.required' => '見積時間は必須です',
            'estimated_minutes.min' => '見積時間は1分以上で設定してください',
            'estimated_minutes.max' => '見積時間は480分（8時間）以内で設定してください',
            'priority.in' => '優先度が不正です',
            'day_of_week.in' => '曜日の指定が不正です',
            'due_date.date' => '期限日は正しい日付形式で入力してください',
        ];
    }
}