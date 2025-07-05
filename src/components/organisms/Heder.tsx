import { Link } from "react-router-dom";
import styled from "styled-components";

import { useAuth } from "../../providers/AuthProvider";
import { memo } from "react";

const AppHeader = styled.header`
  display: flex;
  justify-content: flex-start;
  line-height: 60px;
  padding: 0 10px;
  border-bottom: 1px solid var(--border-color2);
  > h1 {
    text-align: center;
    font-size: 1.6rem;
    > a {
      text-decoration: none;
      color: var(--text-color);
    }
  }
  > nav {
    margin-left: auto;
    > a {
      margin-left: 10px;
      text-decoration: none;
    }
  }
  @media screen and (max-width: 600px) {
    display: block;
    line-height: 1;
    > h1 {
      padding: 10px 0;
    }
    > nav {
      padding: 0 0 10px;
      > a {
        width: 50%;
        margin: 0;
        display: inline-block;
        text-align: center;
      }
      > .smarPhone {
        width: 100%;
      }
    }
  }
`;

const Heder = memo(() => {
  console.log("Heder");

  const { user } = useAuth();
  return (
    <AppHeader>
      <h1>
        <Link to={user ? "/" : "/signin"}>名刺管理アプリ</Link>
      </h1>
      <nav>
        {user ? (
          <>
            <Link to="/cards">名刺一覧</Link>
            <Link to="/signout">ログアウト</Link>
          </>
        ) : (
          <>
            <Link to="/signup">アカウント作成</Link>
            <Link to="/signin">ログイン</Link>
          </>
        )}
      </nav>
    </AppHeader>
  );
});

export default Heder;
