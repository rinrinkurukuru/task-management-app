<?php

namespace Tests\Feature\Api;

use Tests\TestCase;
use App\Models\User;
use App\Models\Task;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

class TaskControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private User $otherUser;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->user = User::factory()->create();
        $this->otherUser = User::factory()->create();
    }

    /**
     * @test
     */
    public function 認証されていないユーザーはタスク一覧を取得できない()
    {
        $response = $this->getJson('/api/tasks');

        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
                'message' => '認証が必要です'
            ]);
    }

    /**
     * @test
     */
    public function 認証済みユーザーは自分のタスク一覧を取得できる()
    {
        Sanctum::actingAs($this->user);
        
        $tasks = Task::factory()->count(3)->create([
            'user_id' => $this->user->id,
            'day_of_week' => 'monday'
        ]);
        
        Task::factory()->count(2)->create([
            'user_id' => $this->otherUser->id
        ]);

        $response = $this->getJson('/api/tasks');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true
            ])
            ->assertJsonCount(3, 'data');
    }

    /**
     * @test
     */
    public function 曜日でタスクをフィルタリングできる()
    {
        Sanctum::actingAs($this->user);
        
        Task::factory()->count(2)->create([
            'user_id' => $this->user->id,
            'day_of_week' => 'monday'
        ]);
        
        Task::factory()->count(3)->create([
            'user_id' => $this->user->id,
            'day_of_week' => 'tuesday'
        ]);

        $response = $this->getJson('/api/tasks?day_of_week=monday');

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data');
    }

    /**
     * @test
     */
    public function ステータスでタスクをフィルタリングできる()
    {
        Sanctum::actingAs($this->user);
        
        Task::factory()->count(2)->create([
            'user_id' => $this->user->id,
            'status' => 'completed'
        ]);
        
        Task::factory()->count(1)->create([
            'user_id' => $this->user->id,
            'status' => 'in_progress'
        ]);

        $response = $this->getJson('/api/tasks?status=completed');

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data');
    }

    /**
     * @test
     */
    public function 有効なデータでタスクを作成できる()
    {
        Sanctum::actingAs($this->user);

        $taskData = [
            'title' => 'テストタスク',
            'description' => 'テストの説明',
            'estimated_minutes' => 60,
            'priority' => 'high',
            'day_of_week' => 'monday',
            'tags' => ['tag1', 'tag2'],
            'due_date' => '2024-12-31'
        ];

        $response = $this->postJson('/api/tasks', $taskData);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'タスクを作成しました'
            ]);

        $this->assertDatabaseHas('tasks', [
            'user_id' => $this->user->id,
            'title' => 'テストタスク',
            'estimated_minutes' => 60
        ]);
    }

    /**
     * @test
     */
    public function 必須項目が不足している場合はタスクを作成できない()
    {
        Sanctum::actingAs($this->user);

        $taskData = [
            'description' => 'タイトルなし'
        ];

        $response = $this->postJson('/api/tasks', $taskData);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'バリデーションエラー'
            ])
            ->assertJsonValidationErrors(['title', 'estimated_minutes']);
    }

    /**
     * @test
     */
    public function 自分のタスクの詳細を取得できる()
    {
        Sanctum::actingAs($this->user);
        
        $task = Task::factory()->create([
            'user_id' => $this->user->id
        ]);

        $response = $this->getJson("/api/tasks/{$task->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'id' => $task->id,
                    'title' => $task->title
                ]
            ]);
    }

    /**
     * @test
     */
    public function 他人のタスクの詳細は取得できない()
    {
        Sanctum::actingAs($this->user);
        
        $task = Task::factory()->create([
            'user_id' => $this->otherUser->id
        ]);

        $response = $this->getJson("/api/tasks/{$task->id}");

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'message' => 'This action is unauthorized.'
            ]);
    }

    /**
     * @test
     */
    public function 自分のタスクを更新できる()
    {
        Sanctum::actingAs($this->user);
        
        $task = Task::factory()->create([
            'user_id' => $this->user->id,
            'title' => '古いタイトル',
            'status' => 'todo'
        ]);

        $updateData = [
            'title' => '新しいタイトル',
            'status' => 'in_progress'
        ];

        $response = $this->putJson("/api/tasks/{$task->id}", $updateData);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'タスクを更新しました'
            ]);

        $this->assertDatabaseHas('tasks', [
            'id' => $task->id,
            'title' => '新しいタイトル',
            'status' => 'in_progress'
        ]);
    }

    /**
     * @test
     */
    public function タスクを完了にすると完了時刻が設定される()
    {
        Sanctum::actingAs($this->user);
        
        $task = Task::factory()->create([
            'user_id' => $this->user->id,
            'status' => 'in_progress',
            'completed_at' => null
        ]);

        $response = $this->putJson("/api/tasks/{$task->id}", [
            'status' => 'completed'
        ]);

        $response->assertStatus(200);

        $task->refresh();
        $this->assertNotNull($task->completed_at);
    }

    /**
     * @test
     */
    public function 自分のタスクを削除できる()
    {
        Sanctum::actingAs($this->user);
        
        $task = Task::factory()->create([
            'user_id' => $this->user->id
        ]);

        $response = $this->deleteJson("/api/tasks/{$task->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'タスクを削除しました'
            ]);

        $this->assertDatabaseMissing('tasks', [
            'id' => $task->id
        ]);
    }

    /**
     * @test
     */
    public function タスクを別の曜日に移動できる()
    {
        Sanctum::actingAs($this->user);
        
        $task = Task::factory()->create([
            'user_id' => $this->user->id,
            'day_of_week' => 'monday',
            'position' => 1
        ]);

        Task::factory()->create([
            'user_id' => $this->user->id,
            'day_of_week' => 'tuesday',
            'position' => 0
        ]);

        $moveData = [
            'day_of_week' => 'tuesday',
            'position' => 0
        ];

        $response = $this->patchJson("/api/tasks/{$task->id}/move", $moveData);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'タスクを移動しました'
            ]);

        $this->assertDatabaseHas('tasks', [
            'id' => $task->id,
            'day_of_week' => 'tuesday',
            'position' => 0
        ]);
    }

    /**
     * @test
     */
    public function 無効な曜日にはタスクを移動できない()
    {
        Sanctum::actingAs($this->user);
        
        $task = Task::factory()->create([
            'user_id' => $this->user->id
        ]);

        $moveData = [
            'day_of_week' => 'invalid_day',
            'position' => 0
        ];

        $response = $this->patchJson("/api/tasks/{$task->id}/move", $moveData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['day_of_week']);
    }
}