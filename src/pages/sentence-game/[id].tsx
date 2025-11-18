import React, { useEffect, useState, useRef } from 'react';
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import { type languageFile } from "../api/languages";
import { speak } from "~/utils/tts";

// Web Speech API types
interface SpeechRecognitionEvent {
    resultIndex: number;
    results: {
        isFinal: boolean;
        0: { transcript: string };
        length: number;
        [key: number]: { transcript: string };
    }[];
}

interface SpeechRecognitionErrorEvent {
    error: string;
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start: () => void;
    stop: () => void;
    onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
    onend: ((this: SpeechRecognition, ev: Event) => void) | null;
    onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
    onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
}

interface SpeechRecognitionConstructor {
    new(): SpeechRecognition;
}

interface IWindow extends Window {
    webkitSpeechRecognition: SpeechRecognitionConstructor;
    SpeechRecognition: SpeechRecognitionConstructor;
}

function SentenceGame() {
    const [languageData, setLanguageData] = useState<languageFile>();
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    // const [timer, setTimer] = useState(10); // Timer removed
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [feedback, setFeedback] = useState<{ valid: boolean; reason: string; followUpQuestion?: string } | null>(null);
    const [gameState, setGameState] = useState<"playing" | "validating" | "answering_followup" | "validating_answer" | "result">("playing");
    const [answerFeedback, setAnswerFeedback] = useState<{ valid: boolean; feedback: string } | null>(null);

    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const router = useRouter();
    const { id } = router.query;

    // Fetch data
    useEffect(() => {
        const fetchData = async () => {
            if (id) {
                const res = await fetch(`/api/languages/${id as string}`);
                if (res.status === 200) {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    const d = await res.json();
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
                    setLanguageData(d.data);
                }
            }
        };
        void fetchData();
    }, [id]);

    // Speech Recognition Setup
    useEffect(() => {
        const { webkitSpeechRecognition, SpeechRecognition } = window as unknown as IWindow;
        const SpeechRecognitionConstructor = SpeechRecognition || webkitSpeechRecognition;

        if (SpeechRecognitionConstructor) {
            const recognition = new SpeechRecognitionConstructor();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'es-ES'; // Spanish

            recognition.onstart = () => {
                console.log("Speech recognition started");
            };

            recognition.onend = () => {
                console.log("Speech recognition ended");
            };

            recognition.onresult = (event: SpeechRecognitionEvent) => {
                console.log("Results coming in")
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    const result = event.results[i];
                    if (result?.isFinal && result[0]) {
                        finalTranscript += result[0].transcript;
                    } else if (result && result[0]) {
                        // interim
                        setTranscript(result[0].transcript);
                    }
                }
                if (finalTranscript) {
                    setTranscript(finalTranscript);
                }
            };

            recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
                console.error("Speech recognition error", event.error);
                // alert(`Speech recognition error: ${event.error}`); // Suppress alert for better UX
                setIsListening(false);
            };

            recognitionRef.current = recognition;
        } else {
            alert("Speech Recognition API not supported in this browser. Please use Chrome, Edge, or Safari.");
        }
    }, []);

    const startListening = () => {
        if (recognitionRef.current) {
            try {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
                recognitionRef.current.start();
                setIsListening(true);
                setTranscript("");
            } catch (e) {
                console.error(e);
            }
        }
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            recognitionRef.current.stop();
            setIsListening(false);
        }
    };

    const handleCheckSentence = async () => {
        stopListening();
        setGameState("validating");

        if (!languageData) return;

        const currentWord = languageData.spec.data[currentWordIndex];

        try {
            const res = await fetch("/api/validate-sentence", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    targetWord: currentWord?.spanish,
                    userSentence: transcript
                }),
            });
            const data = (await res.json()) as { valid: boolean; reason: string; followUpQuestion?: string };
            setFeedback(data);

            if (data.valid && data.followUpQuestion) {
                setGameState("answering_followup");
                setTranscript(""); // Clear for answer
                speak(data.followUpQuestion);
            } else {
                setGameState("result");
            }
        } catch (e) {
            console.error(e);
            setFeedback({ valid: false, reason: "Error validating." });
            setGameState("result");
        }
    };

    const handleCheckAnswer = async () => {
        stopListening();
        setGameState("validating_answer");

        if (!feedback?.followUpQuestion) return;

        try {
            const res = await fetch("/api/validate-answer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    question: feedback.followUpQuestion,
                    answer: transcript
                }),
            });
            const data = (await res.json()) as { valid: boolean; feedback: string };
            setAnswerFeedback(data);
            setGameState("result");
        } catch (e) {
            console.error(e);
            setAnswerFeedback({ valid: false, feedback: "Error validating answer." });
            setGameState("result");
        }
    };

    const nextWord = () => {
        if (!languageData) return;
        setCurrentWordIndex((prev) => (prev + 1) % languageData.spec.data.length);
        // setTimer(10);
        setTranscript("");
        setFeedback(null);
        setAnswerFeedback(null);
        setGameState("playing");
    };

    if (!languageData) return <div className="text-white text-center mt-20">Loading...</div>;

    const currentWord = languageData.spec.data[currentWordIndex];

    return (
        <>
            <Head>
                <title>Sentence Game - {languageData.name}</title>
            </Head>
            <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#003333] to-[#15162c] text-white p-4">
                <div className="w-full max-w-2xl flex flex-col items-center gap-8">
                    <div className="flex justify-between w-full items-center">
                        <Link href="/" className="text-blue-400 hover:underline">Home</Link>
                        {/* <div className="text-xl font-bold">Timer: {timer}s</div> */}
                    </div>

                    <div className="text-center">
                        {gameState === "answering_followup" || gameState === "validating_answer" || (gameState === "result" && feedback?.followUpQuestion) ? (
                            <>
                                <h2 className="text-2xl text-gray-300 mb-2">Answer this question:</h2>
                                <h1 className="text-4xl font-bold text-yellow-400 mb-4">{feedback?.followUpQuestion}</h1>
                                <button onClick={() => speak(feedback?.followUpQuestion || "")} className="text-sm text-blue-400 hover:underline">
                                    🔊 Replay Question
                                </button>
                            </>
                        ) : (
                            <>
                                <h2 className="text-2xl text-gray-300 mb-2">Use this word in a sentence:</h2>
                                <h1 className="text-6xl font-bold text-yellow-400 mb-4">{currentWord?.spanish}</h1>
                                <p className="text-xl text-gray-400">({currentWord?.english})</p>
                            </>
                        )}
                    </div>

                    <div className="w-full bg-white/10 rounded-xl p-6 min-h-[150px] flex flex-col items-center justify-center relative">
                        {transcript ? (
                            <p className="text-2xl text-center">{transcript}</p>
                        ) : (
                            <p className="text-gray-500 italic">
                                {gameState === "answering_followup" ? "Speak your answer..." : "Your sentence will appear here..."}
                            </p>
                        )}

                        {(gameState === "playing" || gameState === "answering_followup") && (
                            <button
                                onClick={isListening ? stopListening : startListening}
                                className={`mt-4 rounded-full p-4 transition-colors ${isListening ? 'bg-red-500 animate-pulse' : 'bg-blue-600 hover:bg-blue-700'}`}
                            >
                                {isListening ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H9a1 1 0 01-1-1v-4z" /></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                                )}
                            </button>
                        )}
                    </div>

                    <div className="flex gap-4">
                        {gameState === "playing" && (
                            <button onClick={() => void handleCheckSentence()} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg text-xl transition-colors">
                                Check Sentence
                            </button>
                        )}

                        {gameState === "answering_followup" && (
                            <button onClick={() => void handleCheckAnswer()} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg text-xl transition-colors">
                                Check Answer
                            </button>
                        )}

                        {(gameState === "validating" || gameState === "validating_answer") && (
                            <div className="text-xl animate-pulse">Validating...</div>
                        )}

                        {gameState === "result" && (
                            <div className="flex flex-col items-center gap-4 w-full">
                                {/* Sentence Feedback */}
                                <div className={`p-4 rounded-lg w-full text-center ${feedback?.valid ? 'bg-green-900/50' : 'bg-red-900/50'}`}>
                                    <h3 className="font-bold mb-2">Sentence Check:</h3>
                                    <div className={`text-2xl font-bold ${feedback?.valid ? 'text-green-400' : 'text-red-400'}`}>
                                        {feedback?.valid ? "Correct!" : "Incorrect"}
                                    </div>
                                    <p className="text-center max-w-lg mx-auto">{feedback?.reason}</p>
                                </div>

                                {/* Answer Feedback (if applicable) */}
                                {answerFeedback && (
                                    <div className={`p-4 rounded-lg w-full text-center ${answerFeedback.valid ? 'bg-green-900/50' : 'bg-red-900/50'}`}>
                                        <h3 className="font-bold mb-2">Answer Check:</h3>
                                        <div className={`text-2xl font-bold ${answerFeedback.valid ? 'text-green-400' : 'text-red-400'}`}>
                                            {answerFeedback.valid ? "Correct!" : "Incorrect"}
                                        </div>
                                        <p className="text-center max-w-lg mx-auto">{answerFeedback.feedback}</p>
                                    </div>
                                )}

                                <button onClick={nextWord} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg mt-4">
                                    Next Word
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="w-full mt-4">
                        <textarea
                            className="w-full bg-black/20 rounded p-2 text-white placeholder-gray-500 border border-gray-700"
                            placeholder={gameState === "answering_followup" ? "Or type your answer here..." : "Or type your sentence here..."}
                            value={transcript}
                            onChange={(e) => setTranscript(e.target.value)}
                            disabled={gameState !== "playing" && gameState !== "answering_followup"}
                        />
                    </div>

                </div>
            </main>
        </>
    );
}

export default SentenceGame;
