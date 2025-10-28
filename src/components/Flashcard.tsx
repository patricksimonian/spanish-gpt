import { useEffect, useState } from 'react';

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
      <div className={`absolute flex-grow top-0 left-0 right-0 bottom-0 flex justify-center items-center text-center text-3xl font-bold text-blue-700 transition-transform transform ${flipped ? 'hidden' : 'visible'}`} style={{ backfaceVisibility: 'hidden', transform: flipped ? 'rotateY(180deg)' : '' }}>{front}</div>
      <div className={`${back.length > 12 ? "text-xl" : "text-3xl"} flex-grow-1 absolute top-0 left-0 right-0 bottom-0 flex justify-center items-center text-center  text-black transition-transform transform ${flipped ? 'visible' : 'hidden'}
        }`} style={{ backfaceVisibility: 'hidden', transform: flipped ? '' : 'rotateY(180deg)' }}>{back}</div>
    </div>
  );
}


export default Flashcard;
