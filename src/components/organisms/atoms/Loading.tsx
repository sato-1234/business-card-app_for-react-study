import { memo } from "react";
import styled from "styled-components";

const LoaderDiv = styled.div`
  /* HTML: <div class="loader"></div>
   https://css-loaders.com/spinner/
*/
  width: 166px;
  margin: 0 auto;
  position: relative;
  > .loaderText {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #25b09b;
    font-weight: bold;
  }
  > .loader {
    width: 150px;
    padding: 8px;
    aspect-ratio: 1;
    border-radius: 50%;
    background: #25b09b;
    --_m: conic-gradient(#0000 10%, #000), linear-gradient(#000 0 0) content-box;
    -webkit-mask: var(--_m);
    mask: var(--_m);
    -webkit-mask-composite: source-out;
    mask-composite: subtract;
    animation: l3 1s infinite linear;
  }
  @keyframes l3 {
    to {
      transform: rotate(1turn);
    }
  }
`;

const Loading = memo(() => {
  return (
    <LoaderDiv>
      <div className="loaderText" data-testid="loader-text">
        Loading...
      </div>
      <div className="loader"></div>
    </LoaderDiv>
  );
});

export default Loading;
