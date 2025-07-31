"use client";

import React, { useRef, useState } from 'react';
import {
    Card, Stack, Box, Group, Text, Badge,
    Button, useMantineColorScheme, Tooltip, rem
} from '@mantine/core';
import { IconUsers, IconClipboardCopy, IconCheck } from '@tabler/icons-react';

interface Room {
    id: string;
    name: string;
    players: number;
    maxPlayers: number;
}

interface RoomCardProps {
    room: Room;
    onJoin: (roomId: string) => void;
}

export function RoomCard({ room, onJoin }: RoomCardProps) {
    const { colorScheme } = useMantineColorScheme();
    const isFull = room.players >= room.maxPlayers;
    const cardRef = useRef<HTMLDivElement>(null);
    const glowRef = useRef<HTMLDivElement>(null);
    const [copied, setCopied] = useState(false);

    const handleMouseMove = (e: React.MouseEvent) => {
        const card = cardRef.current;
        const glow = glowRef.current;
        if (!card || !glow) return;

        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = -(y - centerY) / 20;
        const rotateY = (x - centerX) / 20;

        const glowX = (x / rect.width) * 100;
        const glowY = (y / rect.height) * 100;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        glow.style.background = `radial-gradient(circle at ${glowX}% ${glowY}%, rgba(255, 215, 100, 0.15), transparent 60%)`;
    };

    const handleMouseLeave = () => {
        const card = cardRef.current;
        const glow = glowRef.current;
        if (!card || !glow) return;
        card.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
        glow.style.background = 'transparent';
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(room.id);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch (err) {
            console.error("Failed to copy room ID:", err);
        }
    };

    const glassCardStyle: React.CSSProperties = {
        position: 'relative',
        background: colorScheme === 'dark' ? 'rgba(30, 30, 40, 0.6)' : 'rgba(255, 255, 255, 0.6)',
        backdropFilter: 'blur(12px) saturate(1.2)',
        border: `1px solid ${colorScheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
        transition: 'transform 0.1s ease-out',
        willChange: 'transform',
        transformStyle: 'preserve-3d',
        overflow: 'hidden',
        cursor: 'pointer',
    };

    const glowLayerStyle: React.CSSProperties = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        background: 'transparent',
        transition: 'background 0.2s ease',
    };

    const contentStyle: React.CSSProperties = {
        position: 'relative',
        zIndex: 1,
    };

    return (
        <Card
            p="lg"
            radius="md"
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={glassCardStyle}
        >
            <div ref={glowRef} style={glowLayerStyle} />
            <div style={contentStyle}>
                <Stack justify="space-between" h="100%">
                    <Box>
                        <Group justify="space-between" align="center">
                            <Text fw={700} size="xl" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.7)' }}>
                                {room.name}
                            </Text>
                            <Tooltip label={copied ? "Copied!" : "Click to copy"} withArrow>
                                <Badge
                                    variant="light"
                                    color={copied ? "teal" : "yellow"}
                                    onClick={handleCopy}
                                    style={{ cursor: 'pointer' }}
                                    rightSection={copied ? <IconCheck size={14} /> : <IconClipboardCopy size={14} />}
                                >
                                    ID: {room.id}
                                </Badge>
                            </Tooltip>
                        </Group>
                        <Group mt="sm" c="dimmed">
                            <IconUsers size={20} />
                            <Text size="md">{room.players} / {room.maxPlayers} players</Text>
                        </Group>
                    </Box>
                    <Button
                        fullWidth
                        mt="lg"
                        radius="md"
                        disabled={isFull}
                        onClick={() => onJoin(room.id)}
                        variant="gradient"
                        gradient={{ from: isFull ? 'gray' : 'cyan', to: isFull ? 'dark' : 'blue', deg: 90 }}
                    >
                        {isFull ? "Full" : "Join Room"}
                    </Button>
                </Stack>
            </div>
        </Card>
    );
}