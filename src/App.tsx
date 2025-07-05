import { BrowserRouter, Routes, Route } from "react-router-dom";
import styled from "styled-components";

import { AuthProvider } from "./providers/AuthProvider";
import { COPYRIGHT } from "./config/constants";

import Layout from "./pages/layout";
import Home from "./pages/Home";
import Page404 from "./pages/Page404";
import Signin from "./pages/Signin";
import Signup from "./pages/Signup";
import Signout from "./pages/Signout";
import Heder from "./components/organisms/Heder";
import CardList from "./components/organisms/CardList";
import CardDetail from "./components/organisms/CardDetail";
import CardRegister from "./components/organisms/CardRegister";

const Footer = styled.footer`
  width: stretch;
  width: -webkit-fill-available; /* Chrome, Safari */
  width: -moz-available; /* Firefox */
  margin: 0;
  line-height: 40px;
  font-size: 14px;
  text-align: center;
`;

function App() {
  console.log("App");

  return (
    <BrowserRouter>
      <AuthProvider>
        <Heder />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="/cards" element={<CardList />} />
            <Route path="/cards/register" element={<CardRegister />} />
            <Route path="/cards/:id" element={<CardDetail />} />
          </Route>
          <Route path="/signin" element={<Signin />}></Route>
          <Route path="/signup" element={<Signup />}></Route>
          <Route path="/signout" element={<Signout />}></Route>
          <Route path="/*" element={<Page404 />}></Route>
        </Routes>
        <Footer>
          <p className="copyRight">
            <small>{COPYRIGHT}</small>
          </p>
        </Footer>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
