import { useState, useContext, createContext, useEffect } from "react";
import { supabase } from "../lib/supabase";
import type { User } from "@supabase/supabase-js";

// 型定義を明確に
type AuthContextType = {
  user: User | null;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // アプリの初回ロード時にセッション(ブラウザ側の値)の有無をチェック
    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
    };
    loadSession();

    // 認証状態の変化を監視
    // onAuthStateChange() の返り値（subscription）自体は同期的なので、await不要
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
  );
};

// 万が一プロバイダーの外で使用した場合、初期値のnullを返すので例外エラーにできる
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
