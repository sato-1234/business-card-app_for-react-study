import { memo, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DOMPurify from "dompurify";

import type { Card } from "../../domain/card";
import { findCard } from "../../modules/card/cards.repository";

import styled from "styled-components";
import Loading from "./atoms/Loading";
import { SiX, SiGithub } from "@icons-pack/react-simple-icons";

const CardDetailDiv = styled.div`
  > .card {
    padding: 20px;
    box-shadow: var(--box-shadow);
    border-radius: 10px;
    > dl {
      > dt {
        padding: 10px 0 0;
        font-weight: bold;
      }
      > dd > h1 {
        font-weight: normal;
        font-size: 16px;
        color: #8f3232;
      }
    }
    > ul {
      padding-top: 10px;
      display: flex;
      > li {
        flex: 1;
        text-align: center;
        > a {
          display: inline-block;
          > svg {
            width: 24px;
            height: 24px;
            color: #000;
          }
          > img {
            width: 28px;
            height: 28px;
          }
        }
      }
    }
    @media screen and (max-width: 450px) {
      padding: 10px;
    }
  }
  > .back {
    display: block;
    width: 100%;
    padding: 10px 0;
    margin-top: 40px;
    text-align: center;
    text-decoration: none;
    border-radius: 10px;
    border: none;
    color: #fff;
    background-color: var(--bg-color2);
  }
`;

const CardDetail = memo(() => {
  console.log("CardDetail");

  // React（JSX）はデフォルトでXSS攻撃に対する基本的な防御機能を持っているため、多くの場合、特別なエスケープ処理は不要
  const { id } = useParams();
  const navigate = useNavigate();

  // (オプション) 取得したIDを使ってデータをフェッチする
  const [cardData, setCardData] = useState<Card | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // idが半角英数字と「-」「_」のみで構成されているかチェック
    // idがない、または形式が不正な場合は、ここで処理を中断
    if (!id || !/^[a-zA-Z0-9-_]+$/.test(id)) {
      console.error("IDの形式が無効です:", id);
      navigate("/", { replace: true });
      return;
    }

    // idが変わるたびにデータを再取得します
    const fetchCardData = async () => {
      try {
        setLoading(true);

        const { success, message, data } = await findCard(id);

        if (success == true && data == null) {
          setError(message);
          return;
        }

        setCardData(data);
      } catch (error) {
        // 予期せぬエラー（ネットワーク切断など）
        console.error("データの取得中に予期せぬエラーが発生しました:", error);
        navigate("/", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    fetchCardData();
  }, [id, navigate]); // useEffectでフック系（use）を使用している場合、依存になるので記載

  if (loading) {
    return <Loading />;
  }

  if (!cardData) {
    return (
      <CardDetailDiv>
        <p>{error}</p>
        {/* <Link to="/" className="back" data-testid="back">
          戻る
        </Link> */}
        <button
          className="back"
          data-testid="back"
          onClick={() => navigate("/", { replace: true })}
        >
          ホームに戻る
        </button>
      </CardDetailDiv>
    );
  }

  // このサニタイズ処理は、コンポーネントが再レンダリングされるたびに実行される
  const cleanHtml = DOMPurify.sanitize(cardData.description || "", {
    ALLOWED_TAGS: ["h1"],
  });

  return (
    <CardDetailDiv>
      <div className="card">
        <h2 data-testid="card-name">{cardData.name}</h2>
        <dl>
          <dt>自己紹介</dt>
          <dd
            data-testid="description"
            dangerouslySetInnerHTML={{ __html: cleanHtml }}
          />
          <dt>好きな技術</dt>
          <dd>
            {cardData.skills?.map((skill, index) => (
              <span data-testid="skill" key={index}>
                {skill.name}
              </span>
            ))}
          </dd>
        </dl>
        {(cardData.github_id || cardData.qiita_id || cardData.x_id) && (
          <ul>
            {cardData.github_id && (
              <li>
                <a
                  href={`https://github.com/${cardData.github_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <SiGithub data-testid="github-id" />
                </a>
              </li>
            )}
            {cardData.qiita_id && (
              <li>
                <a
                  href={`https://qiita.com/${cardData.qiita_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src="/icons/qiita.png"
                    alt="qiita"
                    data-testid="qiita-id"
                  />
                </a>
              </li>
            )}
            {cardData.x_id && (
              <li>
                <a
                  href={`https://twitter.com/${cardData.x_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <SiX data-testid="x-id" />
                </a>
              </li>
            )}
          </ul>
        )}
      </div>
      <button
        className="back"
        data-testid="back"
        onClick={() => navigate("/", { replace: true })}
      >
        ホームに戻る
      </button>
    </CardDetailDiv>
  );
});

export default CardDetail;
