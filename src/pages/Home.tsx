import { memo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";

const HomeDiv = styled.div`
  padding: 20px;
  box-sizing: border-box;
  box-shadow: var(--box-shadow);
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
      box-sizing: border-box;
      border-color: var(--border-color);
      border-radius: 5px;
    }
    > p.error {
      color: red;
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
    padding: 20px 0 0;
    text-align: center;
    > a {
      cursor: pointer;
      color: blue;
    }
  }
  @media screen and (max-width: 450px) {
    padding: 10px;
  }
`;

const InfoText = styled.p`
  padding-top: 20px;
`;

const Home = memo(() => {
  console.log("Home");

  const [id, setId] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // フォームのデフォルト送信を防止
    const isValidId = /^[a-zA-Z0-9][a-zA-Z0-9_-]{3,38}$/.test(id);
    if (isValidId) {
      navigate(`/cards/${id}`, { replace: true });
      return;
    } else {
      setError("IDの形式が正しくありません");
    }
  };

  return (
    <>
      <HomeDiv>
        <h2 data-testid="home-title">デジタル名刺</h2>
        <form onSubmit={handleSubmit}>
          <p>名刺ID入力</p>
          <input
            type="text"
            value={id}
            onChange={(e) => setId(e.target.value)}
            data-testid="input-card-id"
          />
          {error && (
            <p className="error" data-testid="error">
              {error}
            </p>
          )}
          <button data-testid="view-button">名刺を見る</button>
        </form>
        <div className="addLink">
          新規名刺登録は
          <Link to="/cards/register" data-testid="register">
            こちら
          </Link>
        </div>
      </HomeDiv>
      <InfoText>
        ※IDの形式は4～39文字以内、半角英数字、ハイフン、アンダーバーが入力可能です。先頭には記号は使用できません。
      </InfoText>
    </>
  );
});

export default Home;
