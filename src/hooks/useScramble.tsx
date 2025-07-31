"use client";

import { useState, useEffect, useRef } from "react";
import React from 'react';

interface ScrambleProps {
    text: string;
    speed?: number;
    scrambleChars?: string;
    revealColor?: string;
    scrambleColor?: string;
}

export const useScramble = ({
                                text,
                                speed = 50,
                                scrambleChars = '▓▒░',
                                revealColor = 'white',
                                scrambleColor = '#666'
                            }: ScrambleProps) => {
    const [displayText, setDisplayText] = useState<React.ReactNode>('');
    const [isDone, setIsDone] = useState(false);
    const intervalRef = useRef<any>(null);

    useEffect(() => {
        let frame = 0;
        setDisplayText('');
        setIsDone(false);

        intervalRef.current = setInterval(() => {
            const scrambleIndex = Math.floor(frame / 2);

            const newTextArray = text.split('').map((char: string, index: number) => {
                if (char === ' ') return <span key={index}> </span>;
                if (index <= scrambleIndex) {
                    return <span key={index} style={{ color: revealColor, opacity: 1 }}>{text[index]}</span>;
                }
                const randomScrambleIndex = Math.floor(Math.random() * scrambleChars.length);
                return <span key={index} style={{ color: scrambleColor, opacity: 0.7 }}>{scrambleChars[randomScrambleIndex]}</span>;
            });

            setDisplayText(<>{newTextArray}</>);

            if (scrambleIndex >= text.length) {
                setDisplayText(text);
                setIsDone(true);
                clearInterval(intervalRef.current);
            }
            frame++;
        }, speed);

        return () => clearInterval(intervalRef.current);
    }, [text, speed, scrambleChars, revealColor, scrambleColor]);

    return { displayText, isAnimationDone: isDone };
};