import { supabase } from "../../lib/supabase";
// import { User } from "../../domain/users";

/* Supabase上のロールの設定
  SELECT : ログイン(トークン発行)後、自分で作成したレコードのみ閲覧可能
  INSERT : ログイン(トークン発行)後、レコードの作成が可能
  UPDATE : ログイン(トークン発行)後、自分で作成したレコードのみ更新可能
  DELETE : ログイン(トークン発行)後、自分で作成したレコードのみ削除可能
*/

// 型をStudy型で返す。非同期のため返値Promise<User[]>
export async function getUser() {}

export async function createUser() {}

export async function editUser() {}

// テーブルが空になると、IDのAutoIncrementはリセットされない
// 今回はUUIDのため考慮なし
export async function deleteUser() {}
