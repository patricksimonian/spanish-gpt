import React from 'react';
import Flashcard from './Flashcard';

function FlashcardGrid({ cards }: { cards: Array<{spanish: string, english: string}>}) {
  return (
    <div className="flex flex-wrap">
      {cards.map((card, index) => (
        <div key={index} className="m-4">
          <Flashcard front={card.english} back={card.spanish} />
        </div>
      ))}
    </div>
  );
}

export default FlashcardGrid;