<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use App\Models\UserPreferences;
use App\Http\Requests\Api\RegisterRequest;
use App\Http\Requests\Api\LoginRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends BaseApiController
{
    /**
     * ユーザー登録
     */
    public function register(RegisterRequest $request): JsonResponse
    {

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'timezone' => $request->timezone ?? 'Asia/Tokyo',
        ]);

        // デフォルトのユーザー設定を作成
        UserPreferences::create([
            'user_id' => $user->id,
            'work_duration_minutes' => 25,
            'short_break_minutes' => 5,
            'long_break_minutes' => 15,
            'sessions_until_long_break' => 4,
            'daily_goal_sessions' => 8,
        ]);

        $token = $user->createToken('auth-token')->plainTextToken;

        return $this->created([
            'user' => $user,
            'token' => $token
        ], 'ユーザー登録が完了しました');
    }

    /**
     * ログイン
     */
    public function login(LoginRequest $request): JsonResponse
    {

        if (!Auth::attempt($request->only('email', 'password'))) {
            return $this->validationError([
                'email' => ['認証情報が正しくありません。']
            ]);
        }

        $user = User::where('email', $request->email)->first();
        $token = $user->createToken('auth-token')->plainTextToken;

        return $this->success([
            'user' => $user->load('preferences'),
            'token' => $token
        ], 'ログインしました');
    }

    /**
     * ユーザー情報取得
     */
    public function user(Request $request): JsonResponse
    {
        return $this->success([
            'user' => $request->user()->load('preferences')
        ]);
    }

    /**
     * ログアウト
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return $this->success(null, 'ログアウトしました');
    }
}