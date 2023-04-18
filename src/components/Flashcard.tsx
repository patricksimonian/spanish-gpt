import { useState } from 'react';

function Flashcard({ spanish, english }: {spanish: string, english: string}) {
    const [flipped, setFlipped] = useState(false);
  
    const handleClick = () => {
    console.log('flipoped')
      setFlipped(!flipped);
    };
  
    return (
      <div
        className={`border bg-white rounded-lg w-48 h-64 flex justify-center items-center break-words`}
        onClick={handleClick}
      >
        <div className={`text-3xl font-bold text-blue-700 transition-transform transform ${flipped ? 'hidden' : 'visible'}`} style={{backfaceVisibility: 'hidden', transform: flipped ? 'rotateY(180deg)': ''}}>{spanish}</div>
        <div className={`text-3xl text-black transition-transform transform ${flipped ? 'visible': 'hidden'}
        }`} style={{backfaceVisibility: 'hidden', transform: flipped ? '': 'rotateY(180deg)'}}>{english}</div>
      </div>
    );
  }
  

export default Flashcard;
