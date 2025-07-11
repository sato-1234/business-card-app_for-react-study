# 学習記録一覧アプリ（React アウトプット学習用）

**Qiita 記事**
https://qiita.com/Sicut_study/items/7d8c6f309dddda1a3961

の課題４ の内容にそって、アウトプットしました。そのため不要なコメントも残しています。

**デプロイ先**
https://business-card-app-995b2.web.app/

## 1. vite で環境構築（React、TypeScript を選択）

```
node -v
npm -v
npm create vite@latest
npm i
npm run dev
```

## 2. supabase で、プロジェクト作成後、ログイン機能実装

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
```

ログイン機能後のディレクトリ構成（一部省略）

```
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
```

## 3. .env は push しないので GITHUB の Secrets で設定

Settings 　 → 　 secrets and variables 　 → 　 Actions 　 → 　 New repository secrets

```
Name *   : SUPABASE_URL_BUSINESS_CARD_APP
Secret * : .envに記述した値

Name *   : SUPABASE_ANON_BUSINESS_CARD_APP
Secret * : .envに記述した値
```

## 4. cards テーブル作成

| colum_name  | data_type      | null     | other                               |
| ----------- | -------------- | -------- | ----------------------------------- |
| card_id     | varchar        | not null | PK,                                 |
| auth_id     | UUID           | not null | PK, FK（auth.users.id）             |
| name        | varchar        | not null |                                     |
| description | text           | not null |                                     |
| github_id   | varchar        | null     |                                     |
| qiita_id    | varchar        | null     |                                     |
| x_id        | varchar        | null     |                                     |
| create_id   | timestamptzone | not null | Asia/Tokyo (デフォルト値として設定) |

```sql
-- "cards" テーブルを作成します(UIで一つずつ設定するのは手間のため)
CREATE TABLE public.cards (
  -- カラム定義
  card_id     varchar   NOT NULL,
  auth_id     uuid      NOT NULL DEFAULT auth.uid(),
  name        varchar   NOT NULL,
  description text      NOT NULL,
  github_id   varchar, -- NULLを許容する場合は NOT NULL を省略
  qiita_id    varchar,
  x_id        varchar,
  created_at  timestamptz NOT NULL DEFAULT (now() AT TIME ZONE 'Asia/Tokyo'),

  -- 制約定義
  -- card_id と auth_id の組み合わせを主キーに設定（複合主キー）
  CONSTRAINT cards_pkey PRIMARY KEY (card_id, auth_id),

  -- auth_id を auth.users テーブルの id カラムにリンクさせる外部キー制約
  -- ON DELETE CASCADE を付けると、認証ユーザーが削除された際に、そのユーザーのカードも自動的に削除されます
  CONSTRAINT cards_auth_id_fkey FOREIGN KEY (auth_id) REFERENCES auth.users (id) ON DELETE CASCADE

   -- card_id: 4~39文字、半角英数字、ハイフン、アンダーバーのみ
  CONSTRAINT check_card_id_format CHECK (
    card_id ~ '^[a-zA-Z0-9][a-zA-Z0-9_-]{3,38}$'
  ),

  -- name: 1~30文字
  CONSTRAINT check_name_length CHECK (
    length(name) BETWEEN 1 AND 30
  ),

  -- description: 1~500文字
  CONSTRAINT check_description_length CHECK (
    length(description) BETWEEN 1 AND 500
  ),

  -- github_id: nullでない場合、1~39文字、先頭と末尾が英数字、間は英数字とハイフン
  CONSTRAINT check_github_id_format CHECK (
    github_id IS NULL OR github_id ~ '^[a-zA-Z0-9]([a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$'
  ),

  -- qiita_id: nullでない場合、1~39文字、先頭が英数字、間は英数字とハイフン
  -- (GitHubのルールと似ているが、末尾のルールが少し緩い)
  CONSTRAINT check_qiita_id_format CHECK (
    qiita_id IS NULL OR qiita_id ~ '^[a-zA-Z0-9][a-zA-Z0-9-]{0,38}$'
  ),

  -- x_id: nullでない場合、4~15文字、英数字とアンダーバーのみ
  CONSTRAINT check_x_id_format CHECK (
    x_id IS NULL OR x_id ~ '^[a-zA-Z0-9_]{4,15}$'
  )
);

-- (オプション) テーブルとカラムにコメントを追加して、後から分かりやすくする
COMMENT ON TABLE public.cards IS 'ユーザーが作成する名刺情報';
COMMENT ON COLUMN public.cards.card_id IS 'ユーザーが設定する名刺ID';
COMMENT ON COLUMN public.cards.auth_id IS '所有者を示す認証ユーザーID';
```

**RLS ポリシー（RLS 有効で認証外部キーの設定も有効になる）**

認証ユーザーが自身で作成した名刺情報のみを操作できるように設定しています。

```sql
-- SELECT：認証ユーザーが自分のデータのみを閲覧できるようにする
alter policy "Enable users to view their own data only"
on "public"."cards"
to authenticated
using (
   (( SELECT auth.uid() AS uid) = auth_id)
);

    -- INSERT：認証ユーザーのみ挿入を有効にする (自身の認証IDを挿入する)
alter policy "Enable insert for authenticated users only"
on "public"."cards"
to authenticated
with check (
   (( SELECT auth.uid() AS uid) = auth_id)
);

-- UPDATE：認証ユーザーが自分のデータだけを更新できるようにする
alter policy "Enable users to update their own data only"
on "public"."cards"
to authenticated
using (
  (( SELECT auth.uid() AS uid) = auth_id)
)
with check (
  (( SELECT auth.uid() AS uid) = auth_id)
);

--DELETE：認証ユーザーが自分のデータだけを削除できるようにする
alter policy "Enable delete for users based on id"
on "public"."cards"
to authenticated
using (
  (( SELECT auth.uid() AS uid) = auth_id)
);
```

テストデータの例

```sql
INSERT INTO cards (card_id, auth_id, name, description, github_id, qiita_id, x_id) VALUES (
    'sample_id',
    '認証ユーザーのUUID',
    'テスト太郎',
    '<h1>テスト太郎の自己紹介</h1>',
    'your_github_ID',
    'your_Qiita_ID',
    'your_X_ID'
)
```

## 5. skill テーブル作成

新規名刺登録時に、画面のセレクトボックスにスキル一覧を表示させるために使用します

| column_name | data_type | null     | other           |
| ----------- | --------- | -------- | --------------- |
| skill_id    | int8      | not-null | PK, Is Identity |
| name        | varchar   | not-null | Unique          |

```sql
-- "skill" テーブルを作成します
CREATE TABLE public.skill (
  -- カラム定義
  -- GENERATED BY DEFAULT AS IDENTITY で、データ挿入時に自動で連番が振られます
  skill_id  bigint  NOT NULL GENERATED BY DEFAULT AS IDENTITY,
  name      varchar NOT NULL,

  -- 制約定義
  -- skill_id を主キーに設定します
  CONSTRAINT skill_pkey PRIMARY KEY (skill_id),

  -- name カラムの値が重複しないようにユニーク制約を設定します
  CONSTRAINT skill_name_key UNIQUE (name),

  -- skill_id: 1 ~ 127
  CONSTRAINT check_skill_id_range CHECK (
    skill_id BETWEEN 1 AND 127
  )
);

-- (オプション) テーブルとカラムにコメントを追加して、後から分かりやすくする
COMMENT ON TABLE public.skill IS 'スキルのマスターデータ';
COMMENT ON COLUMN public.skill.skill_id IS 'スキルを一意に識別するID（自動採番）';
COMMENT ON COLUMN public.skill.name IS 'スキル名（例: React, TypeScript）';
```

**RLS ポリシー**

認証ユーザーであれば、スキル一覧を閲覧できるように設定しています。

```sql
-- SELECT：認証されたユーザーのみ選択を有効にする
alter policy "Enable select for authenticated users only"
on "public"."skill"
to authenticated
using (
  true
);

-- INSERT,UPDATE,DELETE 操作禁止（ポリシーなし）
```

テストデータの例

```sql
INSERT INTO skill (name) VALUES
 ('React'),
 ('TypeScript'),
 ('Github')
```

## 6. card_skill 中間テーブル作成

※PKFK は複合外部キーの略

| column_name | data_type | null     | other                                           |
| ----------- | --------- | -------- | ----------------------------------------------- |
| auth_id     | uuid      | not-null | PK,FK(auth.users.id),PKFK(public.cards.auth_id) |
| card_id     | varchar   | not-null | PK,PKFK(public.cards.card_id)                   |
| skill_id    | int8      | not-null | PK,FK(public.skill.skill_id)                    |

```sql
CREATE TABLE public.card_skill (
  -- カラム定義
  auth_id   uuid    NOT NULL DEFAULT auth.uid(),
  card_id   varchar NOT NULL,
  skill_id  bigint  NOT NULL, -- int8 は bigint に対応します

  -- 制約定義
  -- 3つのカラムの組み合わせを主キーに設定（複合主キー）
  -- これにより、(auth_id, card_id, skill_id) の組み合わせの重複が自動的に防がれます
  CONSTRAINT card_skill_pkey PRIMARY KEY (auth_id, card_id, skill_id),

  -- auth_id を auth.users テーブルの id カラムにリンクさせる外部キー制約
  -- ON DELETE CASCADE: 認証ユーザーが削除されたら、この中間テーブルの関連行も自動削除
  CONSTRAINT card_skill_auth_id_fkey FOREIGN KEY (auth_id) REFERENCES auth.users (id) ON DELETE CASCADE,

  -- card_id,auth_id を cards テーブルの card_id,auth_id カラムにリンクさせる外部キー制約
  -- ON DELETE CASCADE: cardsテーブルの行が削除されたら、この中間テーブルの関連行も自動削除
  -- この外部キーは、cardsテーブルの(card_id, auth_id)という複合主キーを参照しています
  CONSTRAINT card_skill_card_id_fkey FOREIGN KEY (card_id, auth_id) REFERENCES public.cards (card_id, auth_id) ON DELETE CASCADE,

  -- skill_id を skill テーブルの skill_id カラムにリンクさせる外部キー制約
  -- ON DELETE CASCADE: skillテーブルの行が削除されたら、この中間テーブルの関連行も自動削除
  CONSTRAINT card_skill_skill_id_fkey FOREIGN KEY (skill_id) REFERENCES public.skill (skill_id) ON DELETE CASCADE
);

-- (オプション) テーブルとカラムにコメントを追加
COMMENT ON TABLE public.card_skill IS 'カードとスキルの関連を定義する中間テーブル';
COMMENT ON COLUMN public.card_skill.auth_id IS '所有者を示す認証ユーザーID';
COMMENT ON COLUMN public.card_skill.card_id IS '関連するカードのID';
COMMENT ON COLUMN public.card_skill.skill_id IS '関連するスキルのID';
```

**RLS ポリシー**

認証ユーザーが自身で作成した情報のみを操作できるように設定しています。

```sql
-- SELECT：認証ユーザーが自分のデータのみを閲覧できるようにする
alter policy "Enable users to view their own data only"
on "public"."card_skill"
to authenticated
using (
    (( SELECT auth.uid() AS uid) = auth_id)
);

-- INSERT：認証ユーザーのみ挿入を有効にする(自身の認証IDを挿入する)
alter policy "Enable insert for authenticated users only"
on "public"."card_skill"
to authenticated
with check (
    (( SELECT auth.uid() AS uid) = auth_id)
);

-- UPDATE：認証ユーザーが自分のデータのみを更新できるようにする
alter policy "Enable users to update their own data only"
on "public"."card_skill"
to authenticated
using (
    (( SELECT auth.uid() AS uid) = auth_id)
)
with check (
    (( SELECT auth.uid() AS uid) = auth_id)
);

-- DELETE：認証ユーザーが自分のデータのみを削除できるようにする
alter policy "Enable delete for users based on user_id"
on "public"."card_skill"
to authenticated
using (
    (( SELECT auth.uid() AS uid) = auth_id)
);
```

テストデータの例

```sql
INSERT INTO card_skill (auth_id, card_id, skill_id) VALUES
 ('認証されたUUID','sample_id', 1)
```

## 7. 新規名刺登録 かつ 中間テーブルを更新するデータベース関数 (RPC)

```sql
/*
　GUI（SQL Editorでない場合）、Begin～endまでを記述だが、その場合セキュリティ警告がでた↓↓
　「Detects functions where the search_path parameter is not set.」
 　そのため、SQL Editorで「SET search_path TO public」を指定
*/

-- この関数はReact側から名刺データとスキルIDを受け取り、関連テーブルに書き込む
CREATE OR REPLACE FUNCTION public.create_card_with_skill(params json)
RETURNS boolean
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO public
AS $$
begin
  -- 1. cardsテーブルに新しい名刺情報を挿入
  -- 静的SQLのため、->>でJSONから取り出した値もプレースホルダと同様に安全に扱われる
  -- ON CONFLICT を追加し、同じユーザーが同じ名刺を複数回登録できないようにする
  -- CONFLICTの場合、INSERTしないので、複合キー「card_id,auth_id」重複制約エラーにならない
  INSERT INTO public.cards (card_id, name, description, github_id, qiita_id, x_id)
  VALUES (
    params->>'card_id',
    params->>'name',
    params->>'description',
    params->>'github_id',
    params->>'qiita_id',
    params->>'x_id'
  )
  ON CONFLICT (card_id, auth_id) DO NOTHING; -- コンフリクト

  -- 2. 複合キー「card_id,auth_id」重複の場合（コンフリクトしたい場合）、何も登録なしでfalseを返す
  IF NOT FOUND THEN
  -- 直前のINSERTで何も挿入されなかった場合
  RETURN false;
  END IF;

  -- 3. user_skill中間テーブルにマッピングを挿入
  -- 複合キー「auth_id, card_id, skill_id」のため、同じスキルの登録はできない
  INSERT INTO public.card_skill (card_id, skill_id)
  VALUES (
    params->>'card_id',
    (params->>'skill_id')::int8
  ); -- 「auth_id, card_id, skill_id」重複の場合、制約エラーで処理はなしになる（トランザクション処理）

  RETURN true; -- React側でエラーハンドリングしたいので返り値設定
end;
$$;
```

念のため SQL Editor でリフレッシュ

```
NOTIFY pgrst, 'reload schema';
```

type ファイルも更新

```
npx supabase gen types --lang=typescript --project-id "project-idを入力" --schema public > database.types.ts
```

## 8. 名刺 ID 入力後　 → 　名刺表示処理

## 9. 新規登録、削除処理

実装に必要なパッケージインストール

```
npm i react-hook-form
npm i simple-icons @icons-pack/react-simple-icons
npm i dompurify
npm i --save-dev @types/dompurify
```

新規登録で cards テーブル更新後、card_skill テーブル更新する処理は RPC 関数「create_card_with_skill」を使用

削除は cards テーブルレコード削除後、制約で関連する card_skill テーブルのレコードは自動で削除される

## 10. 自動テスト処理、GITHUB ACTION 連携

テスト用パッケージインストール

```
npm i -D vitest @testing-library/react @testing-library/dom @testing-library/jest-dom @testing-library/user-event jsdom
```

package.json 一部編集

```json
{
  // 省略　・・・
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "test": "vitest" //追加
  }
  // 省略　・・・
}
```

tsconfig.app.json 一部編集

```json
{
  "compilerOptions": {
    // 省略　・・・

    /* vitest用 */
    "types": ["vitest/globals"]
  },
  "include": ["src", "vitest.setup.ts"]
}
```

vite.config.ts 一部編集

```ts
// 'vite' → 'vitest/config'に変更。「test:」の型が使用できないため
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    // 追加
    environment: "jsdom", // 仮想DOM環境でテスト（ブラウザのような環境）
    globals: true, // describe / it / expect をグローバルに使える
    setupFiles: ["./vitest.setup.ts"], // クリーン用、配列にすること！
  },
});
```

vitest.setup.ts を新規作成。

テストでのグローバル（共通）設定。

```ts
// import { afterEach } from 'vitest';
import { cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

export const user = userEvent.setup();

afterEach(() => {
  cleanup();
});
```

テストフォルダ「\_\_tests\_\_」にテストファイル作成し、テストコード実装完了後、「.github/workflows」を作成

```yml
# .github/workflows/test.yml にpush後自動テスト設定
name: Run Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    # if: false # 自動テストなしにする場合、コメントを外す
    runs-on: ubuntu-latest

    steps:
      - name: Check out the repository
        uses: actions/checkout@v4

      - name: Node.js Setup
        uses: actions/setup-node@v4
        with:
          node-version: 22.16.0

      - name: Install Dependencies
        run: npm install

      - name: Set environment variables
        run: |
          echo "VITE_SUPABASE_URL=${{ secrets.SUPABASE_URL_BUSINESS_CARD_APP }}" >> .env
          echo "VITE_SUPABASE_ANON_KEY=${{ secrets.SUPABASE_ANON_BUSINESS_CARD_APP }}" >> .env

      - name: test run
        run: npm run test
```

## 11. Fireabse にデプロイ後、Github Actions(Push)で CI/CD 設定

```
// Fireabseプロジェクト作成し、WEBアプリにFireabse追加
npm install firebase
npm install -g firebase-tools

firebase login
firebase init
? Are you ready to proceed? y
? Hosting: Configure files for Firebase Hosting and (optionally) set up GitHub Action deploys を選択（space → Enter）
? Please select an option: Use an existing project(既存のプロジェクト選択)
? What do you want to use as your public directory? dist
? Configure as a single-page app (rewrite all urls to /index.html)? y
? Set up automatic builds and deploys with GitHub? n

// distフォルダにビルド
npm run build

// firebase デプロイ
firebase deploy

// FirebaseとGitHubを連携
firebase init hosting:github
? Are you ready to proceed? y
? リポジトリ選択（すでに表示されている場合、Enter）
? Set up the workflow to run a build script before every deploy? y
? What script should be run before every deploy? npmの場合「npm ci && npm run build」
? Set up automatic deployment to your site's live channel when a PR is merged? y
? What is the name of the GitHub branch associated with your site's live channel? main
```

firebase-hosting-merge.yml に自動テストの内容を記述

```yml
# This file was auto-generated by the Firebase CLI
# https://github.com/firebase/firebase-tools

name: Deploy to Firebase Hosting on merge
on:
  push:
    branches:
      - main
permissions:
  contents: read
jobs:
  build_and_deploy:
    #if: false # デプロイしない場合、この行のコメントは外す
    runs-on: ubuntu-latest
    steps:
      - name: Check out repository
        uses: actions/checkout@v4

      - name: Install dependencies
        run: npm ci

      # run: | echoでセーフティ機構が変数にマスク。ログが「**」になる
      - name: Set environment variables
        run: |
          echo "VITE_SUPABASE_URL=${{ secrets.SUPABASE_URL_BUSINESS_CARD_APP }}" >> .env
          echo "VITE_SUPABASE_ANON_KEY=${{ secrets.SUPABASE_ANON_BUSINESS_CARD_APP }}" >> .env

      - name: Run unit tests
        run: npm run test

      - name: Build
        run: npm run build

      - name: Deploy to Firebase Hosting (Live)
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT_BUSINESS_CARD_APP_995B2 }}
          channelId: live
          projectId: business-card-app-995b2
```

firebase-hosting-pull-request.yml に自動テストの内容を記述

```
# This file was auto-generated by the Firebase CLI
# https://github.com/firebase/firebase-tools

name: Deploy to Firebase Hosting on PR
on: pull_request
permissions:
  checks: write
  contents: read
  pull-requests: write
jobs:
  build_and_preview:
    if: ${{ github.event.pull_request.head.repo.full_name == github.repository }} # if: false でデプロイを止める
    runs-on: ubuntu-latest
    steps:
      - name: Check out repository
        uses: actions/checkout@v4

      - name: Install dependencies
        run: npm ci

      - name: Set environment variables
        run: |
          echo "VITE_SUPABASE_URL=${{ secrets.SUPABASE_URL_BUSINESS_CARD_APP }}" >> .env
          echo "VITE_SUPABASE_ANON_KEY=${{ secrets.SUPABASE_ANON_BUSINESS_CARD_APP }}" >> .env

      - name: Run unit tests
        run: npm run test

      - name: Build
        run: npm run build

      - name: Deploy preview to Firebase Hosting
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT_BUSINESS_CARD_APP_995B2 }}
          projectId: business-card-app-995b2
```

---

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
