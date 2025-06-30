import { memo, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { signout } from "../modules/auth/user.repository";
import styled from "styled-components";
import { useAuth } from "../providers/AuthProvider";

const SignupDiv = styled.div`
  display: flex;
  justify-content: center; // 横方向中央
  align-items: center; // 縦方向中央
  height: 100vh; // 画面全体の高さに広げる
`;

const Signout = memo(() => {
  console.log("Signout");

  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const doSignout = async () => {
      // 2秒待機。デバック用
      // await new Promise((resolve) => setTimeout(resolve, 2000));
      await signout();
      navigate("/signin"); // ログアウト後にログインページなどに遷移
    };
    doSignout();
  }, [navigate]);

  // ログインしていない場合、ログインページにリダイレクト
  if (!user) return <Navigate replace to="/signin" />;

  return <SignupDiv>ログアウト中です...</SignupDiv>;
});

export default Signout;
