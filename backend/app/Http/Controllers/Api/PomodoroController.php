<?php

namespace App\Http\Controllers\Api;

use App\Models\PomodoroSession;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PomodoroController extends BaseApiController
{
    /**
     * ポモドーロセッション開始
     */
    public function start(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'task_id' => 'nullable|exists:tasks,id',
            'session_type' => 'required|in:work,short_break,long_break',
            'planned_duration_minutes' => 'required|integer|min:1|max:60',
        ]);

        // タスクが指定されている場合、ユーザーのタスクか確認
        if ($validated['task_id']) {
            $task = Task::where('id', $validated['task_id'])
                ->where('user_id', $request->user()->id)
                ->firstOrFail();
        }

        $session = PomodoroSession::create([
            'user_id' => $request->user()->id,
            'task_id' => $validated['task_id'],
            'session_type' => $validated['session_type'],
            'planned_duration_minutes' => $validated['planned_duration_minutes'],
            'actual_duration_minutes' => 0,
            'started_at' => now(),
        ]);

        return $this->created($session->load('task'), 'ポモドーロセッションを開始しました');
    }

    /**
     * ポモドーロセッション終了
     */
    public function end(Request $request, PomodoroSession $session): JsonResponse
    {
        $this->authorize('update', $session);

        $validated = $request->validate([
            'actual_duration_minutes' => 'required|integer|min:0',
            'was_completed' => 'required|boolean',
            'interruptions_count' => 'integer|min:0',
            'notes' => 'nullable|string|max:1000',
        ]);

        $session->update([
            ...$validated,
            'ended_at' => now(),
        ]);

        // タスクの実際の時間を更新
        if ($session->task && $session->session_type === 'work') {
            $session->task->increment('actual_minutes', $validated['actual_duration_minutes']);
        }

        return $this->updated($session->load('task'), 'ポモドーロセッションを終了しました');
    }

    /**
     * セッション履歴取得
     */
    public function sessions(Request $request): JsonResponse
    {
        $sessions = $request->user()->pomodoroSessions()
            ->with('task')
            ->orderBy('started_at', 'desc')
            ->paginate(20);

        return $this->paginated($sessions, 'セッション履歴を取得しました');
    }

    /**
     * アクティブセッション取得
     */
    public function active(Request $request): JsonResponse
    {
        $activeSession = $request->user()->pomodoroSessions()
            ->whereNull('ended_at')
            ->with('task')
            ->first();

        return $this->success([
            'active_session' => $activeSession
        ]);
    }
}