import { useState } from 'react';

function Flashcard({ spanish, english, handleCardCorrect, handleCardIncorrect }: { spanish: string, english: string,handleCardCorrect: Function, handleCardIncorrect: Function}) {
    const [flipped, setFlipped] = useState(false);
  
    const handleClick = () => {
    console.log('flipoped')
      setFlipped(!flipped);
    };
  
    return (
      <div
        className={`relative border bg-white rounded-lg w-48 h-64 flex justify-center items-center break-words pb-4`}
        onClick={handleClick}
      >
        <div className={`absolute left-0 top-0 bottom-0 right-0  text-3xl font-bold text-blue-700 transition-transform transform ${flipped ? 'hidden' : 'visible'}`} style={{backfaceVisibility: 'hidden', transform: flipped ? 'rotateY(180deg)': ''}}>{spanish}</div>
        <div className={`absolute left-0 top-0 bottom-0 right-0 text-3xl text-black transition-transform transform ${flipped ? 'visible': 'hidden'}
        }`} style={{backfaceVisibility: 'hidden', transform: flipped ? '': 'rotateY(180deg)'}}>{english}</div>
      </div>
    );
  }
  

export default Flashcard;
