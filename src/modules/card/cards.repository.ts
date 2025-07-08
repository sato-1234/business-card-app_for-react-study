import { supabase } from "../../lib/supabase";
import { Card, Skill } from "../../domain/card";

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

// 型をCard型で返す。非同期のため返値Promise<Card[]>
export async function getCards() {
  // Supabaseは cardsテーブルと skill テーブルの間に card_skillという中間テーブルがあることを、データベースに設定されたForeign Key制約から自動的に推測し、内部でJOIN処理を行う。
  // もしリレーションが起動しない場合、skill: card_skill (skill (skill_id,name))と明示的に指定すること
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

  if (error && error.code !== "PGRST116") {
    // console.error("予期せぬデータベースエラー:", error);
    throw new Error(error?.message);
  }

  // 2. 「0件エラー」
  if (!data) {
    return {
      success: true,
      message: "名刺がはまだ登録されていません。",
      data: [],
    };
  }

  const res = data.map((card) => {
    return new Card(
      card.card_id,
      card.name,
      card.description,
      card.github_id,
      card.qiita_id,
      card.x_id,
      card.skills
    );
  });

  return {
    success: true,
    message: "",
    data: res,
  };
}

export async function getSkills() {
  const { data, error } = await supabase.from("skill").select();
  if (error != null) {
    // console.error("予期せぬデータベースエラー:", error);
    throw new Error(error?.message);
  }
  const res = data.map((skill) => {
    return new Skill(skill.skill_id, skill.name);
  });

  return res;
}

export async function findCard(cardId: string) {
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
  // ネットワークエラーやサーバーダウンなど、本当に予期せぬエラー
  if (error && error.code !== "PGRST116") {
    // console.error("Supabase Error:", message);
    throw new Error(error?.message);
  }

  // 0件エラー。data が null なら見つからなかった
  if (!data) {
    return {
      success: true,
      message: `${cardId} に一致する名刺IDは見つかりませんでした。`,
      data: null,
    };
  }

  return {
    success: true,
    message: "",
    data: new Card(
      data.card_id,
      data.name,
      data.description,
      data.github_id,
      data.qiita_id,
      data.x_id,
      data.skills
    ),
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
  // DB側の制約対策。""とnullは異なるため
  // 制約で正規表現を使用しているため、""の場合エラーになる
  const params = {
    ...req,
    // もし空文字なら null に、そうでなければ元の値のままにする
    github_id: req.github_id === "" ? null : req.github_id,
    qiita_id: req.qiita_id === "" ? null : req.qiita_id,
    x_id: req.x_id === "" ? null : req.x_id,
  };

  const { data, error } = await supabase.rpc("create_card_with_skill", {
    params, // params: params の意味
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
      message: "",
    };
  } else {
    return {
      success: data,
      message: `既にその名刺IDで登録されております`,
    };
  }
}

// cardsテーブルのレコード削除すると、関連テーブルのレコードは制約で自動削除
export async function deleteCard(card_id: string) {
  // 制約があるため中間テーブルの削除処理不要
  const { data, error } = await supabase
    .from("cards")
    .delete()
    .eq("card_id", card_id)
    .select()
    .single();
  // ポリシーで設定しているため以下は不要
  // .eq('auth_id', (await supabase.auth.getSession()).data.session.user.id); // 所有者チェック

  if (error != null) throw new Error(error.message);
  if (!data) throw new Error("削除されたデータが見つかりません");

  return data.card_id;
}

export async function editCard() {}
