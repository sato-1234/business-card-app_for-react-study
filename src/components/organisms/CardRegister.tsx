import styled from "styled-components";
import { useForm } from "react-hook-form";
import { memo, useEffect, useState } from "react";
import {
  createUserWithSkill,
  getSkills,
} from "../../modules/card/cards.repository";
import { useNavigate } from "react-router-dom";

const CardRegisterDiv = styled.div`
  padding: 20px;
  box-shadow: var(--box-shadow);
  border-radius: 10px;
  > h2 {
    text-align: center;
  }
  > form > label {
    padding: 10px 0 0;
    > .error {
      color: red;
    }
    > input,
    > textarea,
    > select {
      width: 100%;
      padding: 10px;
      box-sizing: border-box;
      border-radius: 5px;
      border-color: var(--border-color);
    }
    > textarea {
      height: 300px;
    }
  }
  > form > .button {
    padding: 20px 0 0;
    text-align: center;
    button {
      width: 60px;
      padding: 5px;
      border-radius: 5px;
      border: none;
      background-color: var(--bg-color3);
      color: #fff;
    }
  }
  @media screen and (max-width: 450px) {
    padding: 10px;
  }
`;

// type Props = {
//   type: string;
//   editTarget: Study | null;
//   onClose: () => void;
//   onSubmitForm: (data: FormData) => void;
// };

type FormData = {
  card_id: string; // 8~39文字、先頭半角英数字、ハイフン、アンダーバー
  name: string;
  description: string;
  skill_id: number;
  github_id: string | null; // 1~39文字、先頭末半角英数字、ハイフン
  qiita_id: string | null; // 1~39文字、先頭半角英数字、ハイフン
  x_id: string | null; // 4~15文字、アンダーバー
};

const CardRegister = memo(() => {
  console.log("CardRegister");

  const navigate = useNavigate();
  const [skills, setSkills] = useState<{ skill_id: number; name: string }[]>(
    []
  );
  const { register, handleSubmit, formState } = useForm<FormData>();

  useEffect(() => {
    const fetchSkillsData = async () => {
      const data = await getSkills();
      setSkills(data);
    };
    fetchSkillsData();
  }, []);

  const onSubmit = async (data: FormData) => {
    const processedData = {
      ...data,
      skill_id: Number(data.skill_id),
    };

    try {
      const result = await createUserWithSkill(processedData);
      if (result.success) {
        navigate("/", { replace: true });
      } else {
        alert(result.message);
      }
    } catch (error) {
      alert(`Unexpected error : ${error}`);
    }
  };

  return (
    <CardRegisterDiv>
      <h2>新規名刺登録</h2>
      <form onSubmit={handleSubmit(onSubmit)} data-testid="registration-form">
        <label>
          <p>好きな英単語（半角英数字と「-」「_」）*</p>
          <input
            type="text"
            {...register("card_id", {
              required: "名刺IDは必須です",
              minLength: {
                value: 4,
                message: "4文字以上で入力してください",
              },
              maxLength: {
                value: 39,
                message: "39文字以内で入力してください",
              },
              pattern: {
                value: /^[a-zA-Z0-9][a-zA-Z0-9-_]*$/,
                message:
                  "名刺ID形式が正しくありません（先頭は半角英数字で、記号はアンダーバーとハイフンのみ使用可能です）",
              },
            })}
            placeholder="名刺IDを入力"
          />
          {formState.errors.card_id && (
            <p className="error">{formState.errors.card_id.message}</p>
          )}
        </label>
        <label>
          <p>お名前*</p>
          <input
            type="text"
            {...register("name", {
              required: "お名前は必須です",
              maxLength: {
                value: 30,
                message: "30文字以内で入力してください",
              },
            })}
          />
          {formState.errors.name && (
            <p className="error">{formState.errors.name.message}</p>
          )}
        </label>
        <label>
          <p>自己紹介*</p>
          <textarea
            {...register("description", {
              required: "自己紹介は必須です",
              maxLength: {
                value: 500,
                message: "500文字以内で入力してください",
              },
            })}
            placeholder="<h1>タグも使用できます"
          />
          {formState.errors.description && (
            <p className="error">{formState.errors.description.message}</p>
          )}
        </label>
        <label>
          <p>好きな技術*</p>
          <select
            {...register("skill_id", {
              required: "選択は必須です",
              validate: (value) =>
                skills.some((skill) => skill.skill_id == value) ||
                "不正な選択肢です",
            })}
            defaultValue=""
          >
            <option value="" disabled>
              選択してください
            </option>
            {skills.map((opt) => (
              <option key={opt.skill_id} value={opt.skill_id}>
                {opt.name}
              </option>
            ))}
          </select>
          {formState.errors.skill_id && (
            <p className="error">{formState.errors.skill_id.message}</p>
          )}
        </label>
        <label>
          <p>GITHUB ID</p>
          <input
            type="text"
            {...register("github_id", {
              required: "GITHUB_IDは必須です",
              maxLength: {
                value: 39,
                message: "39文字以内で入力してください",
              },
              pattern: {
                value: /^[a-zA-Z0-9](?:[a-zA-Z0-9\-]{0,37}[a-zA-Z0-9])?$/,
                message:
                  "GITHUB_ID形式が正しくありません（先頭と末は半角英数字で、記号はハイフンのみ使用可能です）",
              },
            })}
          />
          {formState.errors.github_id && (
            <p className="error">{formState.errors.github_id.message}</p>
          )}
        </label>
        <label>
          <p>Qiita ID</p>
          <input
            type="text"
            {...register("qiita_id", {
              required: "Qiita_IDは必須です",
              maxLength: {
                value: 39,
                message: "39文字以内で入力してください",
              },
              pattern: {
                value: /^[a-zA-Z0-9](?:[a-zA-Z0-9\-]{0,38})$/,
                message:
                  "Qiita_ID形式が正しくありません（先頭は半角英数字で、記号はハイフンのみ使用可能です）",
              },
            })}
          />
          {formState.errors.qiita_id && (
            <p className="error">{formState.errors.qiita_id.message}</p>
          )}
        </label>
        <label>
          <p>X ID</p>
          <input
            type="text"
            {...register("x_id", {
              required: "X_IDは必須です",
              minLength: {
                value: 4,
                message: "4文字以上で入力してください",
              },
              maxLength: {
                value: 15,
                message: "15文字以内で入力してください",
              },
              pattern: {
                value: /^[a-zA-Z0-9_]{1,15}$/,
                message:
                  "X_ID形式が正しくありません（記号はアンダーバーのみ使用可能です）",
              },
            })}
          />
          {formState.errors.x_id && (
            <p className="error">{formState.errors.x_id.message}</p>
          )}
        </label>
        <div className="button">
          <button>登録</button>
        </div>
      </form>
    </CardRegisterDiv>
  );
});

export default CardRegister;
