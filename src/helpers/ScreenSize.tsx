import { useState, useEffect } from "react";

type TypeSizeScreen = {
  width: number;
  height: number;
};
function ScreenSize(): TypeSizeScreen {
  const [size, setSize] = useState<TypeSizeScreen>(getSize);

  useEffect(() => {
    function handleResize() {
      setSize(getSize());
    }
    if(typeof window !== 'undefined'){
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  function getSize(): TypeSizeScreen {
    if(typeof window !== 'undefined'){
      return {
        width: window.innerWidth,
        height: window.innerHeight,
      };
    } else {
      return {
        width: 0,
        height: 0
      }
    }
  }

  return size;
}

export default ScreenSize;