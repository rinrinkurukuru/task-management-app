<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class AuthControllerRegisterTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    /**
     * 正常な登録のテスト
     */
    public function test_user_can_register_with_valid_data(): void
    {
        $data = [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ];

        $response = $this->postJson('/api/auth/register', $data);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'user' => [
                    'id',
                    'name',
                    'email',
                    'timezone',
                    'created_at',
                    'updated_at',
                ],
                'token',
            ])
            ->assertJson([
                'message' => 'ユーザー登録が完了しました',
                'user' => [
                    'name' => 'Test User',
                    'email' => 'test@example.com',
                    'timezone' => 'Asia/Tokyo',
                ],
            ]);

        // ユーザーがデータベースに存在することを確認
        $this->assertDatabaseHas('users', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'timezone' => 'Asia/Tokyo',
        ]);

        // パスワードがハッシュ化されていることを確認
        $user = User::where('email', 'test@example.com')->first();
        $this->assertTrue(password_verify('password123', $user->password));

        // デフォルトのユーザー設定が作成されていることを確認
        $this->assertDatabaseHas('user_preferences', [
            'user_id' => $user->id,
            'work_duration_minutes' => 25,
            'short_break_minutes' => 5,
            'long_break_minutes' => 15,
            'sessions_until_long_break' => 4,
            'daily_goal_sessions' => 8,
        ]);

        // トークンが返されていることを確認
        $this->assertNotNull($response->json('token'));
    }

    /**
     * カスタムタイムゾーンでの登録テスト
     */
    public function test_user_can_register_with_custom_timezone(): void
    {
        $data = [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'timezone' => 'America/New_York',
        ];

        $response = $this->postJson('/api/auth/register', $data);

        $response->assertStatus(201)
            ->assertJson([
                'user' => [
                    'timezone' => 'America/New_York',
                ],
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'test@example.com',
            'timezone' => 'America/New_York',
        ]);
    }

    /**
     * nameが未入力の場合のバリデーションエラーテスト
     */
    public function test_registration_fails_when_name_is_missing(): void
    {
        $data = [
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ];

        $response = $this->postJson('/api/auth/register', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }

    /**
     * nameが255文字を超える場合のバリデーションエラーテスト
     */
    public function test_registration_fails_when_name_exceeds_255_characters(): void
    {
        $data = [
            'name' => str_repeat('a', 256),
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ];

        $response = $this->postJson('/api/auth/register', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }

    /**
     * emailが未入力の場合のバリデーションエラーテスト
     */
    public function test_registration_fails_when_email_is_missing(): void
    {
        $data = [
            'name' => 'Test User',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ];

        $response = $this->postJson('/api/auth/register', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    /**
     * emailが無効な形式の場合のバリデーションエラーテスト
     */
    public function test_registration_fails_when_email_is_invalid(): void
    {
        $data = [
            'name' => 'Test User',
            'email' => 'invalid-email',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ];

        $response = $this->postJson('/api/auth/register', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    /**
     * emailが既に登録済みの場合のバリデーションエラーテスト
     */
    public function test_registration_fails_when_email_already_exists(): void
    {
        // 既存のユーザーを作成
        User::factory()->create([
            'email' => 'existing@example.com',
        ]);

        $data = [
            'name' => 'Test User',
            'email' => 'existing@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ];

        $response = $this->postJson('/api/auth/register', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    /**
     * passwordが未入力の場合のバリデーションエラーテスト
     */
    public function test_registration_fails_when_password_is_missing(): void
    {
        $data = [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password_confirmation' => 'password123',
        ];

        $response = $this->postJson('/api/auth/register', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    /**
     * passwordが8文字未満の場合のバリデーションエラーテスト
     */
    public function test_registration_fails_when_password_is_too_short(): void
    {
        $data = [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'pass123',
            'password_confirmation' => 'pass123',
        ];

        $response = $this->postJson('/api/auth/register', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    /**
     * passwordとpassword_confirmationが一致しない場合のバリデーションエラーテスト
     */
    public function test_registration_fails_when_password_confirmation_does_not_match(): void
    {
        $data = [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'different123',
        ];

        $response = $this->postJson('/api/auth/register', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    /**
     * 境界値テスト: nameが255文字ちょうどの場合
     */
    public function test_registration_succeeds_when_name_is_exactly_255_characters(): void
    {
        $data = [
            'name' => str_repeat('a', 255),
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ];

        $response = $this->postJson('/api/auth/register', $data);

        $response->assertStatus(201);

        $this->assertDatabaseHas('users', [
            'name' => str_repeat('a', 255),
            'email' => 'test@example.com',
        ]);
    }

    /**
     * 境界値テスト: passwordが8文字ちょうどの場合
     */
    public function test_registration_succeeds_when_password_is_exactly_8_characters(): void
    {
        $data = [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'pass1234',
            'password_confirmation' => 'pass1234',
        ];

        $response = $this->postJson('/api/auth/register', $data);

        $response->assertStatus(201);

        $user = User::where('email', 'test@example.com')->first();
        $this->assertTrue(password_verify('pass1234', $user->password));
    }

    /**
     * 特殊文字を含むnameでの登録テスト
     */
    public function test_registration_succeeds_with_special_characters_in_name(): void
    {
        $data = [
            'name' => 'Test User <script>alert("test")</script>',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ];

        $response = $this->postJson('/api/auth/register', $data);

        $response->assertStatus(201);

        // 特殊文字がそのまま保存されることを確認（Laravelは自動的にエスケープ）
        $this->assertDatabaseHas('users', [
            'name' => 'Test User <script>alert("test")</script>',
            'email' => 'test@example.com',
        ]);
    }

    /**
     * 複数のバリデーションエラーが同時に発生する場合のテスト
     */
    public function test_registration_fails_with_multiple_validation_errors(): void
    {
        $data = [
            'name' => '',
            'email' => 'invalid-email',
            'password' => 'short',
            'password_confirmation' => 'different',
        ];

        $response = $this->postJson('/api/auth/register', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'email', 'password']);
    }

    /**
     * SQLインジェクション対策のテスト
     */
    public function test_registration_is_safe_from_sql_injection(): void
    {
        $data = [
            'name' => "Test'; DROP TABLE users; --",
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ];

        $response = $this->postJson('/api/auth/register', $data);

        $response->assertStatus(201);

        // テーブルが削除されていないことを確認
        $this->assertDatabaseHas('users', [
            'email' => 'test@example.com',
        ]);
    }

    /**
     * トークンが実際に認証に使用できることのテスト
     */
    public function test_returned_token_can_be_used_for_authentication(): void
    {
        $data = [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ];

        $response = $this->postJson('/api/auth/register', $data);
        $token = $response->json('token');

        // トークンを使用して認証が必要なエンドポイントにアクセス
        $userResponse = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/auth/user');

        $userResponse->assertStatus(200)
            ->assertJson([
                'user' => [
                    'email' => 'test@example.com',
                ],
            ]);
    }
}