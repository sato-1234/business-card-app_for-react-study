# 学習記録一覧アプリ（React アウトプット学習用）

**Qiita 記事**
https://qiita.com/Sicut_study/items/7d8c6f309dddda1a3961

の課題 4 の内容にそって、アウトプットしました。そのため不要なコメントも残しています。

**デプロイ先**
https://XXXX

## 2025/06/30：課題４ 実装中

1. vite で環境構築（React、TypeScript を選択）

```
node -v
npm -v
npm create vite@latest
npm i
npm run dev
```

2. supabase で、プロジェクト作成後、ログイン機能実装

テーブル型を再取得して database.types.ts を作成

```
npx supabase login
npx supabase gen types --lang=typescript --project-id "project-idを入力" --schema public > database.types.ts
```

実装に必要なパッケージインストール

```
npm i @supabase/supabase-js
npm i react-router-dom
npm i styled-components
npm i react-hook-form
npm i lucide-react
```

ログイン機能後のディレクトリ構成（一部省略）
├── 省略・・・
├── src/
│ ├── components/
│ │ └── organisms/
│ │ └── Heder.tsx // 共通タイトルとナビメニュー
│ ├── config/
│ │ └── constants.ts // 共通定数（例：サイトのタイトル名等）
│ ├── lib/
│ │ └── supabase.ts // supabase 接続設定
│ ├── modules/
│ │ ├── auth/
│ │ │ └── user.repository.ts // ログイン機能処理
│ ├── pages/
│ │ ├── Home.tsx // ログイン後
│ │ ├── Page404.tsx
│ │ ├── Signin.tsx // ログイン前
│ │ ├── Signout.tsx // ログイン前
│ │ └── Signup.tsx // ログイン後
│ ├── providers/
│ │ └── AuthProvider.tsx // ログイン有無の管理
│ ├── App.tsx
│ ├── index.css
│ ├── main.tsx
│ └── vite-env.d.ts
└── .env // supabase に接続するための環境変数
└── .gitignore // .env 等は push しないようにする
└── database.types.ts // supabase 上のテーブル型定義
└── 省略・・・

3. users テーブル作成
   (RLS 有効、Foreign key は「auth_id → auth.users.id」)

| column_name | data_type                | other                   |
| ----------- | ------------------------ | ----------------------- |
| auth_id     | UUID                     | Primary Key,Foreign key |
| user_id     | varchar                  | Primary Key,Unique      |
| name        | varchar                  | not-null                |
| description | text                     | not-null                |
| github_id   | varchar                  |                         |
| qiita_id    | varchar                  |                         |
| x_id        | varchar                  |                         |
| create_id   | timestamp with time zone | Asia/Tokyo              |

「users」にテストデータを INSERT

```
INSERT INTO users (auth_id, user_id, name, description, github_id, qiita_id,x_id) VALUES
 ('作成したアカウントのUUID','sample_id', 'テスト太郎', '<h1>テスト太郎の自己紹介</h1>','あなたのgithubのID','あなたのQiitaのID','あなたのXのID')
```

4. user_skill 中間テーブル作成
   (Foreign key は「user_id → users.user_id」)
   (Foreign key は「skill_id → skill.skill_id」)

| column_name | data_type | other                   |
| ----------- | --------- | ----------------------- |
| id          | int8      | Primary Key,Is Identity |
| user_id     | varchar   | Primary Key,Foreign key |
| skill_id    | int8      | Primary Key,Foreign key |

5. skill テーブル作成

| column_name | data_type | other                   |
| ----------- | --------- | ----------------------- |
| skill_id    | int8      | Primary Key,Is Identity |
| name        | varchar   | Unique                  |

「skill」にテストデータを INSERT

```
INSERT INTO skill (name) VALUES
 ('React'),
 ('TypeScript'),
 ('Github')
```

「user_skill」にテストデータを INSERT

```
INSERT INTO user_skill (user_id, skill_id) VALUES
 ('sample_id', 1)
```

## 使用技術

| カテゴリ       | 技術                            |
| -------------- | ------------------------------- |
| フロントエンド | React 19.1.0 / TypeScript 5.8.3 |
| データベース   | Supabase                        |
| 環境構築       | vite                            |
| CI/CD          | Github Actions                  |
| インフラ       | Fireabse                        |

---

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default tseslint.config([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs["recommended-typescript"],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```
