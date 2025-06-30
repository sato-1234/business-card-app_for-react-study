import { memo } from "react";
import styled from "styled-components";

import { Link } from "react-router-dom";

const Page404Div = styled.div`
  .Page404 {
    display: flex;
    height: calc(100vh - 103px);
    /* text-align: center; */
    justify-content: center;
    align-items: center;
    div {
      text-align: center;
      h2 {
        font-size: 24px;
        padding-bottom: 20px;
      }
      p,
      a {
        font-size: 20px;
      }
      p {
        padding-bottom: 20px;
        line-height: 2;
      }
    }
  }
  @media screen and (max-width: 600px) {
    .Page404 > div > {
      p,
      a {
        font-size: 16px;
      }
    }
  }
`;

const Page404 = memo(() => {
  console.log("404");

  return (
    <>
      <meta
        name="description"
        content="お探しのページが見つかりませんでした。ホームへ移動してください"
      />
      <meta name="robots" content="noindex,follow"></meta>

      <Page404Div>
        <div className="Page404">
          <div>
            <h2>Not Found</h2>
            <p>
              お探しのページが見つかりませんでした。
              <br />
              ホームへ移動してください。
            </p>
            <Link to="/">ホームへ</Link>
          </div>
        </div>
      </Page404Div>
    </>
  );
});

export default Page404;
