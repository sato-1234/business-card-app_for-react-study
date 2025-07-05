import { Navigate, Outlet } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../providers/AuthProvider";
import { memo } from "react";

const LayoutMain = styled.main`
  margin: 40px auto;
  width: 400px;
  @media screen and (max-width: 450px) {
    width: calc(100% - 40px);
    padding: 0 20px;
  }
`;

const Layout = memo(() => {
  console.log("Layout");

  const { user } = useAuth();
  // ログインしていない場合、ログインページにリダイレクト
  if (!user) return <Navigate replace to="/signin" />;

  return (
    <LayoutMain>
      <Outlet />
    </LayoutMain>
  );
});

export default Layout;
