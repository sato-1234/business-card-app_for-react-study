import { memo, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import type { Card } from "../../domain/card";
import { getCards } from "../../modules/card/cards.repository";

import styled from "styled-components";
import { Pencil, Trash2 } from "lucide-react";
import Loading from "./atoms/Loading";

const CardListDiv = styled.div`
  > h2 {
    text-align: center;
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
  > .addLink {
    padding: 20px 0 0;
    text-align: center;
    > a {
      cursor: pointer;
      color: blue;
    }
  }
  @media screen and (max-width: 450px) {
    time {
      display: none;
    }
  }
`;

const CardList = memo(() => {
  console.log("CardsList");

  const [cardsData, setCardsData] = useState<Card[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCardsData = async () => {
      try {
        setLoading(true);

        const { success, message, data } = await getCards();

        if (success == true && data == null) {
          setError(message);
          return;
        }

        setCardsData(data);
      } catch (error) {
        // 予期せぬエラー（ネットワーク切断など）
        console.error("データの取得中に予期せぬエラーが発生しました:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCardsData();
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <CardListDiv>
      <h2>作成名刺一覧</h2>
      <ul>
        {cardsData?.map((card) => (
          <li key={card.card_id}>
            <Link to={`/cards/${card.card_id}`}>{card.name}</Link>
            {/* <Pencil className="pencil" data-testid="edit-card" /> */}
            <Trash2 className="pencil" data-testid="delete-card" />
            <time dateTime="">作成日:2025-01-01</time>
          </li>
        ))}
      </ul>
      <div className="addLink">
        新規名刺登録は<Link to="/cards/register">こちら</Link>
      </div>
    </CardListDiv>
  );
});

export default CardList;
