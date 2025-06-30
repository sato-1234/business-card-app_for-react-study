import { memo, useCallback, useEffect, useLayoutEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import styled from "styled-components";
import { Pencil, Trash2 } from "lucide-react";

// import {
//   getStudy,
//   createStudy,
//   deleteStudy,
//   editStudy,
// } from "../modules/study/study.repository";
// import { Study } from "../domain/study";
import { useAuth } from "../providers/AuthProvider";
// import Modal from "../components/organisms/Modal";

const HomeMain = styled.main`
  margin: 40px auto;
  width: 400px;
  padding: 20px;
  box-sizing: border-box;
  box-shadow: 0px 5px 15px 0px rgba(0, 0, 0, 0.35);
  background-color: var(--bg-color);
  border-radius: 5px;
  > h2 {
    text-align: center;
    padding-bottom: 20px;
  }
  > form {
    padding: 20px;
    background-color: #fff;
    border-radius: 10px;
    > input {
      width: 100%;
      padding: 10px;
      border-color: var(--border-color);
      border-radius: 5px;
      box-sizing: border-box;
    }
    > button {
      margin-top: 20px;
      width: 100%;
      padding: 10px;
      border-radius: 5px;
      background-color: var(--bg-color2);
      border: none;
      color: #fff;
    }
  }
  > .addLink {
    padding: 20px 0;
    text-align: center;
    > a {
      cursor: pointer;
      color: blue;
    }
  }
  > ul {
    padding: 10px 0;
    > li {
      display: flex;
      line-height: 1.5;
      padding: 10px 0;
      border-bottom: 1px solid var(--border-color2);
      > a {
        width: 170px;
        flex-grow: 3;
      }
      > time {
        font-size: 14px;
        padding: 3px 0 0 10px;
      }
      .lucide {
        width: 16px;
        padding-left: 10px;
        cursor: pointer;
      }
    }
  }
  @media screen and (max-width: 450px) {
    margin: 40px 20px;
    width: calc(100% - 40px);
    padding: 10px;
    time {
      display: none;
    }
  }
`;

const Home = memo(() => {
  console.log("Home");

  const { user } = useAuth();
  // ログインしていない場合、ログインページにリダイレクト
  if (!user) return <Navigate replace to="/signin" />;

  return (
    <HomeMain>
      <h2>デジタル名刺</h2>
      <form>
        <p>名刺ID入力</p>
        <input type="text" />
        <button>名刺を見る</button>
      </form>
      <div className="addLink">
        新規名刺登録は<a>こちら</a>
      </div>
      <h3>作成した名刺一覧</h3>
      <ul>
        <li>
          <a>名刺ああああああああああああ1</a>
          <Pencil className="pencil" data-testid="edit-card" />
          <Trash2 className="pencil" data-testid="delete-card" />
          <time dateTime="">作成日:2025-01-01</time>
        </li>
        <li>
          <a>名刺2</a>
          <Pencil className="pencil" data-testid="edit-card" />
          <Trash2 className="pencil" data-testid="delete-card" />
          <time dateTime="">作成日:2025-01-01</time>
        </li>
      </ul>
    </HomeMain>
  );
});

export default Home;
