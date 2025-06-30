import { supabase } from "../../lib/supabase";

// サインアップ（API取得のため非同期）
export const signup = async (name: string, email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } }, //email と password以外はoptionsで追加できる
  });
  // エラーハンドリング必須
  if (error != null || data.user == null) {
    // throw new Error(error?.message);
    return {
      success: false,
      message: error?.message ?? "登録に失敗しました。",
    };
  }
  return { success: true };
};

// サインイン
export const signin = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error != null || data.user == null) {
    // throw new Error(error?.message);
    return {
      success: false,
      message: error?.message ?? "ログインに失敗しました。",
    };
  }
  const userName = data.user?.user_metadata?.name;
  return { success: true, message: userName };
};

// サインアウト
export const signout = async () => {
  // supabaseのセッション情報削除してログアウト状態にする
  const { error } = await supabase.auth.signOut();
  if (error != null) throw new Error(error.message);
  return true;
};
