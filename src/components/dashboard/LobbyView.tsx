"use client";

import React, { useState } from 'react';
import {
    Container, Box, Button, Group, Title,
    Text, SimpleGrid, Stack, Avatar, Paper, Badge, Divider, MantineTheme, Indicator, Tooltip
} from "@mantine/core";
import { IconArrowLeft, IconUser, IconCheck, IconX, IconPlus, IconHexagon, IconClipboardCopy } from '@tabler/icons-react';

interface Player {
    id: number;
    name: string;
    isReady: boolean;
    isHost: boolean;
}

interface LobbyViewProps {
    roomId: string | null;
    players: (Player | null)[];
    onBack: () => void;
}

function PlayerSlot({ player }: { player: Player | null }) {
    if (!player) {
        return (
            <Paper
                p="md"
                radius="md"
                style={(theme: MantineTheme) => ({
                    backgroundColor: `rgba(37, 38, 43, 0.2)`,
                    border: `1px solid ${theme.colors.dark[5]}`,
                    minHeight: 220,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                })}
            >
                <Avatar size={80} radius="xl" color="dark.4">
                    <IconPlus />
                </Avatar>
                <Text mt="md" fz="sm" fw={500} c="dimmed">Waiting for player...</Text>
            </Paper>
        );
    }

    return (
        <Paper
            p="md"
            radius="md"
            shadow="md"
            withBorder
            style={(theme: MantineTheme) => ({
                backgroundColor: `rgba(50, 53, 58, 0.6)`,
                borderColor: player.isReady ? theme.colors.teal[7] : theme.colors.dark[4],
                minHeight: 220,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
                boxShadow: player.isReady ? `0 0 12px rgba(18, 184, 134, 0.5)` : 'none',
            })}
        >
            <Stack align="center" w="100%">
                <Indicator
                    inline
                    size={16}
                    offset={7}
                    position="bottom-end"
                    color={player.isReady ? 'teal' : 'gray'}
                    withBorder
                >
                    <Avatar size={80} radius="50%">
                        <IconUser />
                    </Avatar>
                </Indicator>
                <Text fz="lg" fw={700} mt="xs" lineClamp={1}>{player.name}</Text>
            </Stack>
            <Divider my="sm" label={<IconHexagon size={16} />} labelPosition="center" />
            <Badge
                size="xl"
                radius="sm"
                fullWidth
                color={player.isReady ? 'teal' : 'gray'}
                variant={player.isReady ? 'filled' : 'light'}
                leftSection={player.isReady ? <IconCheck size={16} /> : <IconX size={16} />}
            >
                {player.isReady ? 'Ready' : 'Waiting'}
            </Badge>
        </Paper>
    );
}

export function LobbyView({ roomId, players, onBack }: LobbyViewProps) {
    const [isPlayerReady, setIsPlayerReady] = useState(true);
    const [copied, setCopied] = useState(false);
    const allPlayersReady = players.every(p => p === null || p.isReady);

    const handleCopy = () => {
        if (roomId) {
            navigator.clipboard.writeText(roomId);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        }
    };

    return (
        <Container
            fluid
            py="xl"
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 'calc(100vh - 70px)',
            }}
        >
            <Paper
                p="xl"
                radius="xl"
                shadow="lg"
                withBorder
                style={(theme: MantineTheme) => ({
                    width: '100%',
                    maxWidth: 1200,
                    backgroundColor: `rgba(26, 28, 30, 0.7)`,
                    backdropFilter: 'blur(16px)',
                    borderColor: theme.colors.dark[4],
                })}
            >
                <Stack>
                    <Group justify="space-between">
                        <Button
                            variant="subtle"
                            color="gray"
                            leftSection={<IconArrowLeft size={16} />}
                            onClick={onBack}
                        >
                            Back
                        </Button>
                        <Tooltip label={copied ? "Copied!" : "Click to copy"} withArrow>
                            <Badge
                                size="lg"
                                variant="light"
                                color={copied ? "teal" : "cyan"}
                                onClick={handleCopy}
                                style={{ cursor: 'pointer' }}
                                rightSection={copied ? <IconCheck size={14} /> : <IconClipboardCopy size={14} />}
                            >
                                {roomId}
                            </Badge>
                        </Tooltip>
                    </Group>
                    <Divider my="sm" />
                    <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg">
                        {players.map((player, index) => (
                            <PlayerSlot key={index} player={player} />
                        ))}
                    </SimpleGrid>
                    <Divider my="md" />
                    <Group justify="flex-end" gap="md" mt="md">
                        <Button
                            variant={isPlayerReady ? "light" : "filled"}
                            color={isPlayerReady ? "red" : "teal"}
                            size="md"
                            w={150}
                            onClick={() => setIsPlayerReady((prev) => !prev)}
                        >
                            {isPlayerReady ? "Cancel Ready" : "Ready Up"}
                        </Button>
                        <Button
                            variant="gradient"
                            gradient={{ from: 'teal', to: 'lime', deg: 90 }}
                            size="md"
                            w={150}
                            disabled={!allPlayersReady}
                        >
                            Start Game
                        </Button>
                    </Group>
                </Stack>
            </Paper>
        </Container>
    );
}