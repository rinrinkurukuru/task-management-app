<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Task;
use App\Models\UserPreferences;

class TaskSeeder extends Seeder
{
    public function run(): void
    {
        // デモユーザー作成
        $user = User::create([
            'name' => 'デモユーザー',
            'email' => 'demo@example.com',
            'password' => bcrypt('password123'),
            'settings' => [
                'default_work_duration' => 25,
                'default_break_duration' => 5
            ]
        ]);

        // ユーザー設定作成
        UserPreferences::create([
            'user_id' => $user->id,
            'work_duration_minutes' => 25,
            'short_break_minutes' => 5,
            'long_break_minutes' => 15,
            'daily_goal_sessions' => 8
        ]);

        // サンプルタスク作成
        $tasks = [
            [
                'title' => 'データベース設計',
                'description' => 'タスク管理アプリのDB設計とマイグレーション作成',
                'estimated_minutes' => 120,
                'priority' => 'high',
                'day_of_week' => 'monday',
                'position' => 1
            ],
            [
                'title' => 'API エンドポイント作成',
                'description' => 'タスクCRUD用のRESTful API作成',
                'estimated_minutes' => 90,
                'priority' => 'high',
                'day_of_week' => 'monday',
                'position' => 2
            ],
            [
                'title' => 'Reactコンポーネント開発',
                'description' => 'Kanbanボードのドラッグ&ドロップ機能実装',
                'estimated_minutes' => 150,
                'priority' => 'medium',
                'day_of_week' => 'tuesday',
                'position' => 1
            ],
            [
                'title' => 'ポモドーロタイマー実装',
                'description' => 'タイマー機能とセッション記録',
                'estimated_minutes' => 75,
                'priority' => 'medium',
                'day_of_week' => 'wednesday',
                'position' => 1
            ],
            [
                'title' => '時間分析機能',
                'description' => '見積vs実績の分析グラフ作成',
                'estimated_minutes' => 60,
                'priority' => 'low',
                'day_of_week' => 'friday',
                'position' => 1
            ]
        ];

        foreach ($tasks as $taskData) {
            Task::create(array_merge($taskData, [
                'user_id' => $user->id,
                'tags' => ['開発', 'アプリ']
            ]));
        }
    }
}