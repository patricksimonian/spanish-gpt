import { adjustFontSizeByTextLength } from "~/utils/font";
import Link from "next/link";

export default function Pack({ name, id, numCards }: { name: string, id: string, numCards: number }) {
    return (
        <div className="flex relative max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20">
            <h3 className={`font-bold`} style={{ fontSize: adjustFontSizeByTextLength(name, 30, 24, 12) }}>{name}</h3>
            <div className="mr-3 flex gap-2">
                <Link href={`/flashcards/${id}`} className="text-blue-500 hover:underline">Flashcards</Link>
                <Link href={`/sentence-game/${id}`} className="text-purple-500 hover:underline">Sentence Game</Link>
                <span className="absolute bottom-0 z-10 right-0 text-[10px] text-white pr-2 pb-0.5">{numCards}</span>
            </div>
        </div>
    )
}
