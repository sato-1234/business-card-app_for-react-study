import { memo, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { Card } from "../../domain/card";
import { deleteCard, getCards } from "../../modules/card/cards.repository";

import styled from "styled-components";
import { Trash2 } from "lucide-react"; // Pencilは一旦なし
import Loading from "./atoms/Loading";

const CardListDiv = styled.div`
  > h2 {
    text-align: center;
  }
  > p {
    text-align: center;
    padding-top: 20px;
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

  const [cardsData, setCardsData] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [zero, setZero] = useState("");

  useEffect(() => {
    const fetchCardsData = async () => {
      try {
        setLoading(true);

        const { success, message, data } = await getCards();

        if (success == true && data.length == 0) {
          setZero(message);
          return;
        }

        setCardsData(data);
      } catch (e) {
        // 予期せぬエラー（ネットワーク切断など）
        console.error("データの取得中に予期せぬエラーが発生しました:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchCardsData();
  }, []);

  const deleteSelectCard = async (card_id: string) => {
    const result = confirm("本当に削除しますか？");
    if (result) {
      try {
        const deleteId = await deleteCard(card_id);
        //一致しないIDすべて
        //setCardsData(list.filter((v) => v.id !== res.id));
        setCardsData((prev) => prev.filter((v) => v.card_id !== deleteId));
      } catch (err) {
        console.error(err);
        alert("削除に失敗しました。");
      }
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <CardListDiv>
      <h2>作成名刺一覧</h2>
      {cardsData.length > 0 ? (
        <ul>
          {cardsData?.map((card) => (
            <li key={card.card_id}>
              <Link to={`/cards/${card.card_id}`}>{card.card_id}</Link>
              {/* <Pencil className="pencil" data-testid="edit-card" /> */}
              <Trash2
                className="pencil"
                data-testid="delete-card"
                onClick={() => deleteSelectCard(card.card_id)}
              />
              <time dateTime="">作成日:2025-01-01</time>
            </li>
          ))}
        </ul>
      ) : (
        <p>{zero}</p>
      )}
      <div className="addLink">
        新規名刺登録は<Link to="/cards/register">こちら</Link>
      </div>
    </CardListDiv>
  );
});

export default CardList;
