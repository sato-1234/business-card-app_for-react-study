import { supabase } from "../../lib/supabase";
// import { User } from "../../domain/users";

/* cardsテーブル　Supabaseのロールの設定
  SELECT : ログイン(認証)後、自分で作成したレコードのみ参照可能
  INSERT : ログイン(認証)後、レコードの挿入が可能
  UPDATE : ログイン(認証)後、自分で作成したレコードのみ更新可能
  DELETE : ログイン(認証)後、自分で作成したレコードのみ削除可能
*/

/* skillテーブル　Supabaseのロールの設定
  SELECT : ログイン(認証)後、閲覧可能
  INSERT : 禁止
  UPDATE : 禁止
  DELETE : 禁止
*/

/* card_skillテーブル(中間テーブル)　Supabaseのロールの設定
  SELECT : ログイン(認証)後、自分で作成したレコードのみ参照可能
  INSERT : ログイン(認証)後、レコードの挿入が可能
  UPDATE : ログイン(認証)後、自分で作成したレコードのみ更新可能
  DELETE : ログイン(認証)後、自分で作成したレコードのみ削除可能
*/

// 型をUser型で返す。非同期のため返値Promise<User[]>
export async function getCards() {
  const { data, error } = await supabase.from("cards").select(
    `
        card_id,
        name,
        description,
        github_id,
        qiita_id,
        x_id,
        skills: skill (skill_id,name)
      `
  );
  // 2. 「0件エラー」
  if (!data) {
    return {
      success: true,
      message: "名刺がはまだ登録されていません。",
      data: null,
    };
  }

  return {
    success: true,
    message: null,
    data,
  };
}

export async function getSkills() {
  const { data, error } = await supabase.from("skill").select();
  if (error != null) {
    // console.error("予期せぬデータベースエラー:", error);
    throw new Error(error?.message);
  }
  return data;
}

export async function findCard(cardId: string) {
  // Supabaseは cardsテーブルと skill テーブルの間に card_skillという中間テーブルがあることを、データベースに設定されたForeign Key制約から自動的に推測し、内部でJOIN処理を行う。
  // もしリレーションが起動しない場合、skill: card_skill (skill (skill_id,name))と明示的に指定すること

  // ①cardsテーブルからcardIdに一致する一件のユーザーレコードを取得
  // ②card_skillテーブルの中から、card_idであるレコードをすべて探す(そのためskillsは配列になる)
  const { data, error } = await supabase
    .from("cards")
    .select(
      `
        card_id,
        name,
        description,
        github_id,
        qiita_id,
        x_id,
        skills: skill (skill_id,name)
      `
    )
    .eq("card_id", cardId)
    .single();

  // エラーが存在し、かつそれが「0件エラー」ではない場合
  // (ネットワークエラーやサーバーダウンなど、本当に予期せぬエラー)
  if (error && error.code !== "PGRST116") {
    console.error("予期せぬデータベースエラー:", error);
    return {
      success: false,
      message: error?.message ?? "予期せぬデータベースエラー",
      data: null,
    };
  }

  // 2. 「0件エラー」
  // data が null なら「見つからなかった」
  if (!data) {
    return {
      success: true,
      message: `${cardId} に一致する名刺IDは見つかりませんでした。`,
      data: null,
    };
  }

  return {
    success: true,
    message: null,
    data,
  };
}

type FormData = {
  card_id: string; // 4~39文字、先頭半角英数字、ハイフン、アンダーバー
  name: string; // 1~30文字
  description: string; //  1~500文字
  skill_id: number; //1 ~ 127
  github_id: string | null; // 1~39文字、先頭と末が半角英数字、ハイフン
  qiita_id: string | null; // 1~39文字、先頭が半角英数字、ハイフン
  x_id: string | null; // 4~15文字、アンダーバー
};
// export async function createCard(req: FormData) {
//   // reqオブジェクトから skill を除外し、残りを insertData として受け取る
//   const { skill_id, ...insertData } = req;
//   const { data, error } = await supabase
//     .from("users")
//     .insert([insertData])
//     .select()
//     .single();

//   if (error != null) throw new Error(error.message);
//   if (!data) throw new Error("作成されたデータが見つかりません");

//   return true;
// }
export async function createUserWithSkill(req: FormData) {
  const { data, error } = await supabase.rpc("create_card_with_skill", {
    params: req,
  });

  if (error != null) {
    return {
      success: false,
      message: `RPC Error: ${error}`,
    };
  }

  if (data) {
    return {
      success: data,
      message: null,
    };
  } else {
    return {
      success: data,
      message: `既にその名刺IDで登録されております`,
    };
  }
}

export async function editCard() {}

// テーブルが空になると、IDのAutoIncrementはリセットされない
export async function deleteCard() {}
