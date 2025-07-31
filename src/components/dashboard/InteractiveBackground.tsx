"use client";

import React, { useCallback } from 'react';
import Particles from "react-tsparticles";
import type { Container, Engine } from "tsparticles-engine";
import { loadSlim } from "tsparticles-slim";
import { MantineColorScheme } from '@mantine/core';

interface InteractiveBackgroundProps {
    colorScheme: MantineColorScheme;
}

export function InteractiveBackground({ colorScheme }: InteractiveBackgroundProps) {
    const particlesInit = useCallback(async (engine: Engine) => {
        await loadSlim(engine);
    }, []);

    const isDark = colorScheme === 'dark';

    const bgColor = isDark ? "#2B2A33" : "#FDF5E6";
    const particleColor = isDark ? "#C0B283" : "#5D5D5D";
    const linkOpacity = isDark ? 0.5 : 0.4;

    const particleOptions = {
        background: {
            color: {
                value: bgColor,
            },
        },
        fpsLimit: 120,
        interactivity: {
            events: {
                onHover: {
                    enable: true,
                    mode: "grab",
                },
                resize: true,
            },
            modes: {
                grab: {
                    distance: 150,
                    links: {
                        opacity: 0.5,
                    }
                },
            },
        },
        particles: {
            color: {
                value: particleColor,
            },
            links: {
                color: particleColor,
                distance: 150,
                enable: true,
                opacity: linkOpacity,
                width: 1,
            },
            move: {
                direction: "none",
                enable: true,
                outModes: {
                    default: "bounce",
                },
                random: true,
                speed: 0.5,
                straight: false,
            },
            number: {
                density: {
                    enable: true,
                    area: 800,
                },
                value: 60,
            },
            opacity: {
                value: 0.3,
            },
            shape: {
                type: "circle",
            },
            size: {
                value: { min: 1, max: 2 },
            },
        },
        detectRetina: true,
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }}>
            <Particles
                id="tsparticles"
                init={particlesInit}
                options={particleOptions as any}
            />
        </div>
    );
};