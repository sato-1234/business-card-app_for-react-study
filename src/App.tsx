import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./providers/AuthProvider";
import Home from "./pages/Home";
import Signin from "./pages/Signin";
import Signup from "./pages/Signup";
import Signout from "./pages/Signout";
import Heder from "./components/organisms/Heder";
import Page404 from "./pages/Page404";
import { COPYRIGHT } from "./config/constants";

import styled from "styled-components";

const Footer = styled.footer`
  width: 100%;
  margin: 0;
  position: absolute;
  bottom: 0;
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
          <Route path="/" element={<Home />}></Route>
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
