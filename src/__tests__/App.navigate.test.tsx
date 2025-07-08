import { render, screen } from "@testing-library/react";
import { user } from "../../vitest.setup";
import { vi } from "vitest";
import { MemoryRouter, Routes, Route } from "react-router-dom";

import Layout from "../pages/Layout";
import Home from "../pages/Home";
import CardDetail from "../components/organisms/CardDetail";

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
// モックナビゲート用意
// このモックは<Link>や<a>タグは対象ではないので注意
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(typeof actual === "object" && actual !== null ? actual : {}),
    useNavigate: () => mockNavigate,
  };
});

// -------------------------
describe("Appコンポーネントの動作確認", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    render(
      <MemoryRouter initialEntries={["/cards/sample2"]}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="/cards/:id" element={<CardDetail />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );
  });

  describe("名刺カードのテストを書く", () => {
    beforeEach(async () => {
      await screen.findByTestId("back");
    });

    test("戻るボタンをクリックすると/に遷移する（モック版）", async () => {
      await user.click(screen.getByTestId("back"));
      expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
    });
  });
});
