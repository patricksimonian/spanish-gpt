import React from 'react';
import Flashcard from './Flashcard';


function FlashcardGrid({ cards, viewSide }: { cards: Array<{ spanish: string, english: string }>, viewSide: "english" | "spanish" }) {
  const front = viewSide
  const back = viewSide === "english" ? "spanish" : "english"
  return (
    <div className="flex flex-wrap justify-center">
      {cards.map((card, index) => (
        <div key={index} className="m-4">
          <Flashcard front={card[front]} back={card[back]} />
        </div>
      ))}
    </div>
  );
}

export default FlashcardGrid;
