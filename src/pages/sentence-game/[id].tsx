import React, { useEffect, useState, useRef } from 'react';
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import { type languageFile } from "../api/languages";

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
    const [timer, setTimer] = useState(10);
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [feedback, setFeedback] = useState<{ valid: boolean; reason: string } | null>(null);
    const [gameState, setGameState] = useState<"playing" | "validating" | "result">("playing");

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

    // Timer logic
    useEffect(() => {
        // if (gameState === "playing" && timer > 0) {
        //     const interval = setInterval(() => setTimer((t) => t - 1), 1000);
        //     return () => clearInterval(interval);
        // }
        // else if (timer === 0 && gameState === "playing") {
        //     setGameState("result");
        //     setFeedback({ valid: false, reason: "Time's up!" });
        //     stopListening();
        // }
    }, [timer, gameState]);

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
                alert(`Speech recognition error: ${event.error}`); // Alert user for visibility
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

    const handleCheck = async () => {
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
            const data = (await res.json()) as { valid: boolean; reason: string };
            setFeedback(data);
            setGameState("result");
        } catch (e) {
            console.error(e);
            setFeedback({ valid: false, reason: "Error validating." });
            setGameState("result");
        }
    };

    const nextWord = () => {
        if (!languageData) return;
        setCurrentWordIndex((prev) => (prev + 1) % languageData.spec.data.length);
        setTimer(10);
        setTranscript("");
        setFeedback(null);
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
                        <div className="text-xl font-bold">Timer: {timer}s</div>
                    </div>

                    <div className="text-center">
                        <h2 className="text-2xl text-gray-300 mb-2">Use this word in a sentence:</h2>
                        <h1 className="text-6xl font-bold text-yellow-400 mb-4">{currentWord?.spanish}</h1>
                        <p className="text-xl text-gray-400">({currentWord?.english})</p>
                    </div>

                    <div className="w-full bg-white/10 rounded-xl p-6 min-h-[150px] flex flex-col items-center justify-center relative">
                        {transcript ? (
                            <p className="text-2xl text-center">{transcript}</p>
                        ) : (
                            <p className="text-gray-500 italic">Your sentence will appear here...</p>
                        )}

                        {gameState === "playing" && (
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
                            <button onClick={() => void handleCheck()} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg text-xl transition-colors">
                                Check Sentence
                            </button>
                        )}

                        {gameState === "validating" && (
                            <div className="text-xl animate-pulse">Validating...</div>
                        )}

                        {gameState === "result" && (
                            <div className="flex flex-col items-center gap-4">
                                <div className={`text-2xl font-bold ${feedback?.valid ? 'text-green-400' : 'text-red-400'}`}>
                                    {feedback?.valid ? "Correct!" : "Incorrect"}
                                </div>
                                <p className="text-center max-w-lg">{feedback?.reason}</p>
                                <button onClick={nextWord} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg mt-4">
                                    Next Word
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="w-full mt-4">
                        <textarea
                            className="w-full bg-black/20 rounded p-2 text-white placeholder-gray-500 border border-gray-700"
                            placeholder="Or type your sentence here..."
                            value={transcript}
                            onChange={(e) => setTranscript(e.target.value)}
                            disabled={gameState !== "playing"}
                        />
                    </div>

                </div>
            </main>
        </>
    );
}

export default SentenceGame;
