import React from 'react';
import Flashcard from './Flashcard';


function FlashcardGrid({ cards, viewSide }: { cards: Array<{ spanish: string, english: string, context?: string }>, viewSide: "english" | "spanish" }) {
  const front = viewSide
  const back = viewSide === "english" ? "spanish" : "english"
  return (
    <div className="flex flex-wrap justify-center">
      {cards.map((card, index) => (
        <div key={index} className="m-4">
          <Flashcard front={card[front]} back={card[back]} context={card.context} />
        </div>
      ))}
    </div>
  );
}

export default FlashcardGrid;
