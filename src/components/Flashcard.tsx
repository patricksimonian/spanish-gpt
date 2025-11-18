import { useEffect, useState } from 'react';
import { adjustFontSizeByTextLength } from '~/utils/font';

function Flashcard({ front, back, context: initialContext }: { front: string, back: string, context?: string }) {
  const [flipped, setFlipped] = useState(false);
  const [context, setContext] = useState(initialContext);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFlipped(false);
    setContext(initialContext);
  }, [front, back, initialContext])

  const handleClick = () => {
    setFlipped(!flipped);
  };

  const handleGetContext = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLoading(true);
    try {
      const res = await fetch("/api/generate-context", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ english: back, spanish: front }),
      });
      const data = await res.json();
      if (data.context) {
        setContext(data.context);
      }
    } catch (error) {
      console.error("Failed to get context", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`relative border bg-white rounded-lg w-48 h-64 `}
      onClick={handleClick}
    >
      <div className={`absolute m-4 flex-grow top-0 left-0 right-0 bottom-0 flex flex-col justify-center items-center text-center text-3xl font-bold text-blue-700 transition-transform transform ${flipped ? 'hidden' : 'visible'}`} style={{ backfaceVisibility: 'hidden', transform: flipped ? 'rotateY(180deg)' : '' }}>
        <div style={{ fontSize: adjustFontSizeByTextLength(front, 30, 24, 12) }}>{front}</div>
        {context && <div className="mt-4 text-sm text-gray-600 italic">{context}</div>}
        {!context && (
          <button
            onClick={handleGetContext}
            disabled={loading}
            className="mt-4 text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Get Context"}
          </button>
        )}
      </div>
      <div className={`m-4 flex-grow-1 absolute top-0 left-0 right-0 bottom-0 flex flex-col justify-center items-center text-center  text-black transition-transform transform ${flipped ? 'visible' : 'hidden'}
        }`} style={{ backfaceVisibility: 'hidden', transform: flipped ? '' : 'rotateY(180deg)' }}>
        <div style={{ fontSize: adjustFontSizeByTextLength(back, 30, 24, 12) }}>{back}</div>
        {context && <div className="mt-4 text-sm text-gray-600 italic">{context}</div>}
        {!context && (
          <button
            onClick={handleGetContext}
            disabled={loading}
            className="mt-4 text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Get Context"}
          </button>
        )}
      </div>
    </div>
  );
}


export default Flashcard;
