"use client";

import React, { useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import {Card, Stack, Box, Group, Text, Badge, Button, useMantineColorScheme, Tooltip, ActionIcon} from '@mantine/core';
import {IconUsers, IconClipboardCopy, IconCheck, IconTrash} from '@tabler/icons-react';
import {Room} from "@/services/room/types";

interface RoomCardProps {
    room: Room;
    onJoin: (roomId: string) => void;
    onDelete: (roomId: string) => void;
}

export function RoomCard({ room, onJoin, onDelete }: RoomCardProps) {
    const { data: session } = useSession();

    const { colorScheme } = useMantineColorScheme();
    const cardRef = useRef<HTMLDivElement>(null);
    const glowRef = useRef<HTMLDivElement>(null);
    const [copied, setCopied] = useState(false);

    const isHost = session?.user?.id === room.hostId;
    const isFull = room.playersCount >= room.maxPlayers;

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const card = cardRef.current;
        const glow = glowRef.current;
        if (!card || !glow) return;

        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        card.style.transform = `perspective(1000px) rotateX(${-(y - rect.height / 2) / 20}deg) rotateY(${(x - rect.width / 2) / 20}deg) scale(1.02)`;
        glow.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(0, 255, 255, 0.2), transparent 40%)`;
    };

    const handleMouseLeave = () => {
        const card = cardRef.current;
        const glow = glowRef.current;
        if (!card || !glow) return;
        card.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
        glow.style.background = 'transparent';
    };

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(room.id);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    const glassCardStyle: React.CSSProperties = {
        position: 'relative',
        background: colorScheme === 'dark' ? 'rgba(30, 30, 40, 0.6)' : 'rgba(255, 255, 255, 0.6)',
        backdropFilter: 'blur(12px) saturate(1.2)',
        border: `1px solid ${colorScheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
        transition: 'transform 0.1s ease-out',
        transformStyle: 'preserve-3d',
        overflow: 'hidden',
    };

    const glowLayerStyle: React.CSSProperties = {
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        zIndex: 0, pointerEvents: 'none', background: 'transparent', transition: 'background 0.2s ease',
    };

    const contentStyle: React.CSSProperties = { position: 'relative', zIndex: 1 };

    return (
        <Card
            p="lg" radius="md" ref={cardRef} style={glassCardStyle}
            onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}
        >
            <div ref={glowRef} style={glowLayerStyle} />
            <div style={contentStyle}>
                <Stack justify="space-between" h="100%">
                    <Box>
                        <Group justify="space-between" align="flex-start">
                            <Text fw={700} size="xl">{room.name}'s Room</Text>
                            {isHost && (
                                <Tooltip label="Delete Room" withArrow>
                                    <ActionIcon
                                        variant="outline"
                                        color="red"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDelete(room.id);
                                        }}
                                    >
                                        <IconTrash size={18} />
                                    </ActionIcon>
                                </Tooltip>
                            )}
                        </Group>
                        <Group mt="sm" c="dimmed">
                            <IconUsers size={20} />
                            <Text size="md">{room.playersCount} / {room.maxPlayers} players</Text>
                        </Group>
                    </Box>
                    <Button fullWidth mt="lg" radius="md" disabled={isFull} onClick={() => onJoin(room.id)} variant="gradient" gradient={{ from: isFull ? 'gray' : 'cyan', to: isFull ? 'dark' : 'blue', deg: 90 }}>
                        {isFull ? "Full" : "View Room"}
                    </Button>
                </Stack>
            </div>
        </Card>
    );
}