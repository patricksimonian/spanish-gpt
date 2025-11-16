import { useEffect, useState } from 'react';
import { adjustFontSizeByTextLength } from '~/utils/font';

function Flashcard({ front, back }: { front: string, back: string }) {
  const [flipped, setFlipped] = useState(false);
  useEffect(() => {
    setFlipped(false);
  }, [front, back])
  const handleClick = () => {

    setFlipped(!flipped);
  };

  return (
    <div
      className={`relative border bg-white rounded-lg w-48 h-64 `}
      onClick={handleClick}
    >
      <div className={`absolute m-4 flex-grow top-0 left-0 right-0 bottom-0 flex justify-center items-center text-center text-3xl font-bold text-blue-700 transition-transform transform ${flipped ? 'hidden' : 'visible'}`} style={{ fontSize: adjustFontSizeByTextLength(front, 30, 24, 12), backfaceVisibility: 'hidden', transform: flipped ? 'rotateY(180deg)' : '' }}>{front}</div>
      <div className={`m-4 flex-grow-1 absolute top-0 left-0 right-0 bottom-0 flex justify-center items-center text-center  text-black transition-transform transform ${flipped ? 'visible' : 'hidden'}
        }`} style={{ fontSize: adjustFontSizeByTextLength(back, 30, 24, 12), backfaceVisibility: 'hidden', transform: flipped ? '' : 'rotateY(180deg)' }}>{back}</div>
    </div>
  );
}


export default Flashcard;
