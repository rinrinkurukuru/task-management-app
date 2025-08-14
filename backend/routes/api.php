<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\PomodoroController;
use App\Http\Controllers\Api\PreferencesController;
use App\Http\Controllers\Api\AnalyticsController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// 公開エンドポイント
Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
});

// ヘルスチェック
Route::get('health', function () {
    return response()->json([
        'status' => 'OK',
        'timestamp' => now()->toISOString(),
        'laravel_version' => app()->version(),
        'php_version' => PHP_VERSION
    ]);
});

// 認証が必要なエンドポイント
Route::middleware('auth:sanctum')->group(function () {
    
    // 認証情報
    Route::prefix('auth')->group(function () {
        Route::get('user', [AuthController::class, 'user']);
        Route::post('logout', [AuthController::class, 'logout']);
    });
    
    // タスク管理
    Route::apiResource('tasks', TaskController::class);
    Route::patch('tasks/{task}/move', [TaskController::class, 'move']);
    
    // ポモドーロ機能
    Route::prefix('pomodoro')->group(function () {
        Route::post('start', [PomodoroController::class, 'start']);
        Route::post('{session}/end', [PomodoroController::class, 'end']);
        Route::get('sessions', [PomodoroController::class, 'sessions']);
        Route::get('active', [PomodoroController::class, 'active']);
    });
    
    // ユーザー設定
    Route::get('preferences', [PreferencesController::class, 'show']);
    Route::put('preferences', [PreferencesController::class, 'update']);
    
    // 分析データ
    Route::prefix('analytics')->group(function () {
        Route::get('time', [AnalyticsController::class, 'timeAnalysis']);
        Route::get('productivity', [AnalyticsController::class, 'productivity']);
        Route::get('weekly-summary', [AnalyticsController::class, 'weeklySummary']);
    });
});