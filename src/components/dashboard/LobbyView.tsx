"use client";

import React, { useState } from 'react';
import { useSession } from "next-auth/react";
import { Container, Paper, Stack, Button, Group, Tooltip, Badge, Divider, SimpleGrid, Text, MantineTheme } from "@mantine/core";
import { IconArrowLeft, IconClipboardCopy, IconCheck } from '@tabler/icons-react';
import { PlayerSlot } from './PlayerSlot';
import {Room} from "@/services/room/types";

interface LobbyViewProps {
    room: Room | null;
    onBack: () => void;
    onJoinGame: (roomId: string) => Promise<void>;
    isJoining: boolean;
}

export function LobbyView({ room, onBack, onJoinGame, isJoining }: LobbyViewProps) {
    const { data: session } = useSession();
    const [copied, setCopied] = useState(false);
    const [isPlayerReady, setIsPlayerReady] = useState(false);

    if (!room) return null;

    const isUserInRoom = room.players.some(player => player.id === session?.user?.id);
    const allPlayersReady = room.players.length > 1 && room.players.every(p => p.status === 'Ready');

    const handleCopy = () => {
        if (room.id) {
            navigator.clipboard.writeText(room.id);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        }
    };

    return (
        <Container fluid py="xl" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 70px)' }}>
            <Paper p="xl" radius="xl" shadow="lg" withBorder style={(theme: MantineTheme) => ({
                width: '100%',
                maxWidth: 1200,
                backgroundColor: `rgba(26, 28, 30, 0.7)`,
                backdropFilter: 'blur(16px)',
                borderColor: theme.colors.dark[4],
            })}>
                <Stack>
                    <Group justify="space-between">
                        <Button variant="subtle" color="gray" leftSection={<IconArrowLeft size={16} />} onClick={onBack}>
                            Back to Dashboard
                        </Button>
                        <Tooltip label={copied ? "Copied!" : "Click to copy"} withArrow>
                            <Badge size="lg" variant="light" color={copied ? "teal" : "cyan"} onClick={handleCopy} style={{ cursor: 'pointer' }} rightSection={copied ? <IconCheck size={14} /> : <IconClipboardCopy size={14} />}>
                                {room.name}
                            </Badge>
                        </Tooltip>
                    </Group>
                    <Divider my="sm" />
                    <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg">
                        {Array.from({ length: room.maxPlayers }).map((_, index) => {
                            const player = room.players[index] || null;
                            return <PlayerSlot key={index} player={player} isHost={player?.id === room.hostId} />;
                        })}
                    </SimpleGrid>
                    <Divider my="md" />
                    <Group justify="flex-end" gap="md" mt="md">
                        {isUserInRoom ? (
                            <>
                                <Button variant={isPlayerReady ? "light" : "filled"} color={isPlayerReady ? "red" : "teal"} size="md" w={150} onClick={() => setIsPlayerReady((prev) => !prev)}>
                                    {isPlayerReady ? "Cancel Ready" : "Ready Up"}
                                </Button>
                                <Button variant="gradient" gradient={{ from: 'teal', to: 'lime' }} size="md" w={150} disabled={!allPlayersReady}>
                                    Start Game
                                </Button>
                            </>
                        ) : (
                            <Button
                                variant="gradient"
                                gradient={{ from: 'yellow', to: 'orange' }}
                                size="md"
                                w={200}
                                onClick={() => onJoinGame(room.id)}
                                loading={isJoining}
                            >
                                Join Game
                            </Button>
                        )}
                    </Group>
                </Stack>
            </Paper>
        </Container>
    );
}