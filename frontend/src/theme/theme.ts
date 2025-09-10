import { createTheme } from "@mui/material";

/**
 * アプリケーション全体で使用する統一テーマ
 * Dashboard画面の色合い（#030213）をメインカラーとして全画面に適用
 */
export const appTheme = createTheme({
  // カラーパレット設定
  palette: {
    mode: "light", // ライトモード
    primary: {
      main: "#030213", // メインカラー（濃い紺色）
    },
    secondary: {
      main: "#3b82f6", // セカンダリカラー（青色）
    },
    background: {
      default: "#ffffff", // アプリケーション背景色
      paper: "#ffffff", // Paper要素の背景色
    },
  },
  // 形状設定
  shape: {
    borderRadius: 10, // 全体の角丸半径を10pxに統一
  },
  // タイポグラフィ設定
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  // コンポーネント別スタイルオーバーライド
  components: {
    // ボタンコンポーネントのスタイル
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none", // テキストの大文字変換を無効化
        },
        // Containedボタンのスタイル
        contained: {
          backgroundColor: "#030213", // 背景色をメインカラーに設定
          color: "#ffffff", // 文字色を白に設定
          "&:hover": {
            backgroundColor: "#0a0a1f", // ホバー時の背景色（少し明るく）
          },
        },
        // Outlinedボタンのスタイル
        outlined: {
          borderColor: "#030213", // 境界線色をメインカラーに設定
          color: "#030213", // 文字色をメインカラーに設定
          "&:hover": {
            borderColor: "#0a0a1f", // ホバー時の境界線色
            backgroundColor: "rgba(3, 2, 19, 0.04)", // ホバー時の薄い背景色
          },
        },
      },
    },
    // テキストフィールドコンポーネントのスタイル
    MuiTextField: {
      styleOverrides: {
        root: {
          // アウトライン形式の入力フィールド
          "& .MuiOutlinedInput-root": {
            "&.Mui-focused fieldset": {
              borderColor: "#030213", // フォーカス時の境界線色をメインカラーに
            },
          },
          // ラベルのフォーカス時スタイル
          "& .MuiInputLabel-root.Mui-focused": {
            color: "#030213", // フォーカス時のラベル色をメインカラーに
          },
        },
      },
    },
    // Paperコンポーネントのスタイル
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)", // 統一された軽い影効果
        },
      },
    },
  },
});
