// import { expect, test } from "vitest";
// import userEvent from "@testing-library/user-event";
// import { fail } from "assert";
import { render, screen } from "@testing-library/react";
import { user } from "../../vitest.setup";
import { Card, Skill } from "../domain/card";
import { vi } from "vitest";
import App from "../App";

// ------------------------------
// useAuthをモックしてログイン済みにする。
vi.mock("../providers/AuthProvider", async (importOriginal) => {
  // importOriginalを使い、既存のエクスポート（AuthProviderなど）を維持しつつ、useAuthだけ上書き
  const actual = await importOriginal();
  return {
    ...(typeof actual === "object" && actual !== null ? actual : {}),
    useAuth: () => ({
      user: { id: "test-user", email: "test@test.com" },
    }),
  };
});

// ------------------------------
const inputCardId1: string = "sample1"; //検索名刺ID
const inputCardName1: string = "one";
const inputCardDescription1: string = "oneです";
const inputCardSkill1: string = "React";
const inputCardId2: string = "sample2"; //検索名刺ID
const inputCardName2: string = "two";
const inputCardDescription2: string = "twoです";
const inputCardSkill2: string = "TypeScript";

const inputCardId3: string = "sample3"; //登録名刺ID
const inputCardId4: string = "sample4"; //登録名刺ID

const sKills = [
  new Skill(1, "React"),
  new Skill(2, "TypeScript"),
  new Skill(3, "GITHUB"),
];

// mock 検索で使用
const mockCardStore = new Map<string, Card>();
mockCardStore.set(
  inputCardId1,
  new Card(inputCardId1, inputCardName1, inputCardDescription1, "", "", "", [
    { skill_id: 1, name: inputCardSkill1 },
  ])
);
mockCardStore.set(
  inputCardId2,
  new Card(
    inputCardId2,
    inputCardName2,
    inputCardDescription2,
    "sato-1234",
    "sattoon",
    "doinaka_it",
    [{ skill_id: 2, name: inputCardSkill2 }]
  )
);

// mock スキル情報取得
const mockGetSkills = vi.fn().mockImplementation(() => {
  return Promise.resolve(sKills);
});

// mock 指定card情報取得
const mockFindCard = vi.fn().mockImplementation((cardId: string) => {
  // ここで検索処理
  const result = mockCardStore.get(cardId);

  // 0件エラー。data が null なら見つからなかった
  if (!result) {
    return Promise.resolve({
      success: true,
      message: `${cardId} に一致する名刺IDは見つかりませんでした。`,
      data: null,
    });
  }

  return Promise.resolve({
    success: true,
    message: "",
    data: result,
  });
});

// mock 指定card情報取得
type FormData = {
  card_id: string; // 4~39文字、先頭半角英数字、ハイフン、アンダーバー
  name: string; // 1~30文字
  description: string; //  1~500文字
  skill_id: number; //1 ~ 127
  github_id: string | null; // 1~39文字、先頭と末が半角英数字、ハイフン
  qiita_id: string | null; // 1~39文字、先頭が半角英数字、ハイフン
  x_id: string | null; // 4~15文字、アンダーバー
};
const mockCreateUserWithSkill = vi.fn().mockImplementation((req: FormData) => {
  console.log(req);
  // skill_idに一致するスキル名をsKillsから取得
  const skillObj = sKills.find(
    (skill) => skill.skill_id === Number(req.skill_id)
  );
  const skillName = skillObj ? skillObj.name : "";

  if (mockCardStore.has(req.card_id)) {
    // 重複エラー処理
    console.error("既にその名刺IDで登録されております");
    return {
      success: false,
      message: `既にその名刺IDで登録されております`,
    };
  }

  mockCardStore.set(
    req.card_id,
    new Card(
      req.card_id,
      req.name,
      req.description,
      req.github_id,
      req.qiita_id,
      req.x_id,
      [{ skill_id: req.skill_id, name: skillName }]
    )
  );

  return {
    success: true,
    message: "",
  };
});

// mock必須設定 cards.repository.ts をモック化する
vi.mock("../modules/card/cards.repository", () => {
  return {
    getSkills: () => mockGetSkills(),
    findCard: (cardId: string) => mockFindCard(cardId),
    createUserWithSkill: (req: FormData) => mockCreateUserWithSkill(req),
  };
});

// -------------------------
describe("Appコンポーネントの動作確認", () => {
  // 各テストの共通の初期化（クリーン処理は「vitest.setup.ts」に記載済み）
  beforeEach(() => {
    // mockCardStore.clear(); // 各テスト前にリセット
    // Homeのパスへ移動してレンダリングする。以下で指定パスでテスト可能
    window.history.pushState({}, "", "/"); // ← ここを追加
    render(<App />);
  });

  describe("トップページのテスト", () => {
    test("タイトルが表示されている", () => {
      const homeTitle = screen.getByTestId("home-title");
      expect(homeTitle).toBeVisible();
      expect(homeTitle).toHaveTextContent(/^デジタル名刺$/);
    });

    test("IDを入力してボタンを押すと/cards/:idに遷移する", async () => {
      console.log("遷移前のURL:", window.location.href);

      const inputCardId = screen.getByTestId("input-card-id");
      const viewButton = screen.getByTestId("view-button");
      await user.type(inputCardId, inputCardId2);
      await user.click(viewButton);

      // 遷移後の要素が現れるのを待つ
      await screen.findByTestId("card-name");
      console.log("遷移後のURL:", window.location.href);
      expect(window.location.href).toBe(
        `http://localhost:3000/cards/${inputCardId2}`
      );
    });

    test("IDを入力しないでボタンを押すとエラーメッセージが表示される", async () => {
      const viewButton = screen.getByTestId("view-button");
      await user.click(viewButton);

      const error = await screen.findByTestId("error");
      expect(error).toBeVisible();
      expect(error).toHaveTextContent(/^IDの形式が正しくありません$/);
    });

    test("新規登録はこちらを押すと/cards/registerに遷移する", async () => {
      console.log("遷移前のURL:", window.location.href);

      const register = screen.getByTestId("register");
      await user.click(register);

      console.log("遷移後のURL:", window.location.href);
      expect(window.location.href).toBe("http://localhost:3000/cards/register");
    });
  });

  describe("名刺カードのテスト", () => {
    beforeEach(async () => {
      const inputCardId = screen.getByTestId("input-card-id");
      const viewButton = screen.getByTestId("view-button");
      await user.type(inputCardId, inputCardId2);
      await user.click(viewButton);

      await screen.findByTestId("card-name");
    });

    test("名前が表示されている", () => {
      const cardName = screen.getByTestId("card-name");
      expect(cardName).toBeVisible();
      expect(cardName).toHaveTextContent(new RegExp(`^${inputCardName2}$`));
    });

    test("自己紹介が表示されている", () => {
      const description = screen.getByTestId("description");
      expect(description).toBeVisible();
      expect(description).toHaveTextContent(
        new RegExp(`^${inputCardDescription2}$`)
      );
    });

    test("技術が表示されている", () => {
      const skill = screen.getByTestId("skill");
      expect(skill).toBeVisible();
      expect(skill).toHaveTextContent(new RegExp(`^${inputCardSkill2}$`));
    });

    test("Githubアイコンが表示されている", () => {
      const githubId = screen.getByTestId("github-id");
      expect(githubId).toBeVisible();
    });

    test("Qiitaのアイコンが表示されている", () => {
      const qiitaId = screen.getByTestId("qiita-id");
      expect(qiitaId).toBeVisible();
    });

    test("Twitterのアイコンが表示されている", () => {
      const xId = screen.getByTestId("x-id");
      expect(xId).toBeVisible();
    });

    test("戻るボタンをクリックすると/に遷移する", async () => {
      console.log("遷移前のURL:", window.location.href);

      const back = screen.getByTestId("back");
      await user.click(back);

      console.log("遷移後のURL:", window.location.href);
      expect(window.location.href).toBe("http://localhost:3000/");
    });
  });

  describe("名刺登録ページのテスト", () => {
    beforeEach(async () => {
      const register = screen.getByTestId("register");
      await user.click(register);
    });

    test("タイトルが表示されている", () => {
      const registrationTitle = screen.getByTestId("registration-title");
      expect(registrationTitle).toBeVisible();
      expect(registrationTitle).toHaveTextContent(/^新規名刺登録$/);
    });

    test("全項目入力して登録ボタンを押すと/に遷移する", async () => {
      console.log("遷移前のURL:", window.location.href);

      await user.type(
        screen.getByLabelText("好きな英単語（半角英数字と「-」「_」）*"),
        inputCardId3
      );
      await user.type(screen.getByLabelText("お名前*"), "テスト太郎");
      await user.type(screen.getByLabelText("自己紹介*"), "自己紹介テキスト");
      await user.selectOptions(screen.getByLabelText("好きな技術*"), "1");
      await user.type(screen.getByLabelText("GITHUB ID"), "githubtest");
      await user.type(screen.getByLabelText("Qiita ID"), "qiitatest");
      await user.type(screen.getByLabelText("X ID"), "xtest");

      const register = screen.getByTestId("register");
      await user.click(register);

      console.log("遷移後のURL:", window.location.href);
      expect(window.location.href).toBe("http://localhost:3000/");
    });

    test("IDがないときにエラーメッセージがでる", async () => {
      const register = screen.getByTestId("register");
      await user.click(register);

      const errorCardId = await screen.findByTestId("error-card-id");
      const errorName = await screen.findByTestId("error-name");
      const errorDescription = await screen.findByTestId("error-description");

      expect(errorCardId).toBeVisible();
      expect(errorName).toBeVisible();
      expect(errorDescription).toBeVisible();
      expect(errorCardId).toHaveTextContent(/^名刺IDは必須です$/);
      expect(errorName).toHaveTextContent(/^お名前は必須です$/);
      expect(errorDescription).toHaveTextContent(/^自己紹介は必須です$/);
    });

    test("オプションを入力しなくても登録ができる", async () => {
      await user.type(
        screen.getByLabelText("好きな英単語（半角英数字と「-」「_」）*"),
        inputCardId4
      );
      await user.type(screen.getByLabelText("お名前*"), "テスト太郎");
      await user.type(screen.getByLabelText("自己紹介*"), "自己紹介テキスト");
      await user.selectOptions(screen.getByLabelText("好きな技術*"), "1");

      const register = screen.getByTestId("register");
      await user.click(register);

      expect(window.location.href).toBe("http://localhost:3000/");
    });
  });
});
