-- データベースの文字セット設定
ALTER DATABASE task_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- タイムゾーンの設定
SET time_zone = '+09:00';

-- 初期設定完了ログ
SELECT 'Database initialized successfully' as message;