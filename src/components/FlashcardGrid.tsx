import React from 'react';
import Flashcard from './Flashcard';
import {  vocabularyInterface } from '~/pages';

function FlashcardGrid({ cards, handleCardCorrect, handleCardIncorrect }: { cards: Array<vocabularyInterface>,handleCardCorrect: Function, handleCardIncorrect: Function}) {
  return (
    <div className="flex flex-wrap justify-center">
      {cards.map((card, index) => (
        <div key={index} className="m-4">
          <Flashcard english={card.english} spanish={card.spanish}  handleCardCorrect={handleCardCorrect} handleCardIncorrect={handleCardIncorrect} />
        </div>
      ))}
    </div>
  );
}

export default FlashcardGrid;