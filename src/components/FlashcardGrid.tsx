import React from 'react';
import Flashcard from './Flashcard';

function FlashcardGrid({ cards }) {
  return (
    <div className="flex flex-wrap justify-center">
      {cards.map((card, index) => (
        <div key={index} className="m-4">
          <Flashcard english={card.english} spanish={card.spanish} />
        </div>
      ))}
    </div>
  );
}

export default FlashcardGrid;