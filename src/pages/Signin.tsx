import { Link, Navigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import styled from "styled-components";

import { signin } from "../modules/auth/user.repository";
import { useAuth } from "../providers/AuthProvider";
import { memo } from "react";

const SigninMain = styled.main`
  width: 300px;
  padding: 0 10px;
  margin: 0 auto;
  > h2 {
    text-align: center;
    padding: 20px 0;
  }
  > form > label {
    display: block;
    width: 100%;
    padding-bottom: 20px;
    > input {
      width: 100%;
      box-sizing: border-box;
      padding: 0 5px;
      line-height: 40px;
      border-radius: 4px;
      border-color: var(--border-color2);
    }
    > p {
      color: red;
    }
  }
  form > div.button {
    text-align: center;
    > button {
      padding: 5px 15px;
      border-radius: 4px;
      border-color: var(--text-color);
    }
  }
  > p {
    padding-top: 20px;
  }
`;

type FormData = {
  email: string;
  password: string;
};

const Signin = memo(() => {
  console.log("Signin");

  const { register, handleSubmit, formState } = useForm<FormData>();

  const { user } = useAuth();

  // ログインしている場合、ホームにリダイレクト
  if (user) return <Navigate replace to="/" />;

  const onSubmit = async (data: FormData) => {
    const result = await signin(data.email, data.password);
    if (!result.success) {
      alert(`ログイン失敗: ${result.message}`);
      return;
    }
    return <Navigate replace to="/" />;
  };

  /* 残りタスク 
       ①、バック：バリデエーション実装(next.jsにした場合は、メール重複エラー等)
  */

  return (
    <SigninMain>
      <h2>ログイン</h2>

      <form onSubmit={handleSubmit(onSubmit)}>
        <label>
          <input
            {...register("email", {
              required: "メールアドレスは必須です",
              maxLength: {
                value: 255,
                message: "255文字以内で入力してください",
              },
              pattern: {
                value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                message:
                  "メールアドレスの形式が正しくありません（記号はドット、アンダーバー、ハイフンのみ使用可能です）",
              },
            })}
            placeholder="メールアドレスを入力してください"
          />
          {formState.errors.email && <p>{formState.errors.email.message}</p>}
        </label>

        <label>
          <input
            {...register("password", {
              required: "パスワードは必須です",
              minLength: {
                value: 8,
                message: "8文字以上で入力してください。",
              },
              maxLength: {
                value: 30,
                message: "30文字以内で入力してください。",
              },
              pattern: {
                value:
                  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[_-])[A-Za-z\d_-]{8,}$/,
                message: "パスワードの形式が正しくありません",
              },
            })}
            placeholder="パスワードを入力してください"
          />
          {formState.errors.password && (
            <p>{formState.errors.password.message}</p>
          )}
        </label>

        <div className="button">
          <button>送信</button>
        </div>
      </form>

      <p>
        ※メールアドレスは送信可能なメールアドレス形式で、記号はアンダーバー・ハイフン・ドットのみ使用可能です。
      </p>
      <p>
        ※パスワードは半角英数字8文字以上の小文字・大文字・数字・記号（アンダーバーまたはハイフン）を含めてください。
      </p>
      <p>
        アカウントがない場合は、<Link to="/signup">こちら</Link>
        から新規登録してください。
      </p>
    </SigninMain>
  );
});

export default Signin;
