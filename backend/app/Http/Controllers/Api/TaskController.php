<?php

namespace App\Http\Controllers\Api;

use App\Models\Task;
use App\Http\Requests\Api\StoreTaskRequest;
use App\Http\Requests\Api\UpdateTaskRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TaskController extends BaseApiController
{
    /**
     * タスク一覧取得
     */
    public function index(Request $request): JsonResponse
    {
        $query = $request->user()->tasks();

        // フィルタリング
        if ($request->has('day_of_week')) {
            $query->where('day_of_week', $request->day_of_week);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $tasks = $query
            ->orderBy('position')
            ->orderBy('created_at', 'desc')
            ->get();

        return $this->success($tasks);
    }

    /**
     * タスク作成
     */
    public function store(StoreTaskRequest $request): JsonResponse
    {
        $validated = $request->validated();

        // 新しいタスクの位置を設定
        $lastPosition = $request->user()->tasks()
            ->where('day_of_week', $validated['day_of_week'] ?? 'todo')
            ->max('position') ?? 0;

        $task = $request->user()->tasks()->create([
            ...$validated,
            'position' => $lastPosition + 1,
        ]);

        return $this->created($task, 'タスクを作成しました');
    }

    /**
     * タスク詳細取得
     */
    public function show(Request $request, Task $task): JsonResponse
    {
        $this->authorize('view', $task);

        return $this->success($task->load(['pomodoroSessions', 'timeEstimates']));
    }

    /**
     * タスク更新
     */
    public function update(UpdateTaskRequest $request, Task $task): JsonResponse
    {
        $this->authorize('update', $task);

        $validated = $request->validated();

        // 完了時刻の自動設定
        if (isset($validated['status']) && $validated['status'] === 'completed' && !$task->completed_at) {
            $validated['completed_at'] = now();
        }

        $task->update($validated);

        return $this->updated($task, 'タスクを更新しました');
    }

    /**
     * タスク削除
     */
    public function destroy(Request $request, Task $task): JsonResponse
    {
        $this->authorize('delete', $task);

        $task->delete();

        return $this->deleted('タスクを削除しました');
    }

    /**
     * タスク移動（Kanbanボード間）
     */
    public function move(Request $request, Task $task): JsonResponse
    {
        $this->authorize('update', $task);

        $validated = $request->validate([
            'day_of_week' => 'required|in:todo,monday,tuesday,wednesday,thursday,friday,saturday,sunday',
            'position' => 'required|integer|min:0',
        ]);

        // 移動先の位置調整
        $targetTasks = $request->user()->tasks()
            ->where('day_of_week', $validated['day_of_week'])
            ->where('id', '!=', $task->id)
            ->orderBy('position')
            ->get();

        // 新しい位置に挿入するため、既存タスクの位置を調整
        foreach ($targetTasks as $index => $targetTask) {
            if ($index >= $validated['position']) {
                $targetTask->update(['position' => $index + 1]);
            }
        }

        $task->update($validated);

        return $this->updated($task, 'タスクを移動しました');
    }
}