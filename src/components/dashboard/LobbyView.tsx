"use client";

import React from 'react';
import { useSession } from "next-auth/react";
import { Container, Paper, Stack, Button, Group, Badge, Divider, SimpleGrid, MantineTheme, Modal, Text } from "@mantine/core";
import { useDisclosure } from '@mantine/hooks';
import { IconArrowLeft, IconClipboardCopy, IconLogout, IconPlayerPlay } from '@tabler/icons-react';
import { PlayerSlot } from './PlayerSlot';
import { Room } from "@/services/room/types";

interface LobbyViewProps {
    room: Room | null;
    onBack: () => void;
    onJoinGame: (roomId: string) => Promise<void>;
    onLeaveRoom: (roomId: string) => Promise<void>;
    onStartGame: (roomId: string) => Promise<void>;
    isJoining: boolean;
}

export function LobbyView({ room, onBack, onJoinGame, onLeaveRoom, onStartGame, isJoining }: LobbyViewProps) {
    const { data: session } = useSession();
    const [opened, { open: openConfirm, close: closeConfirm }] = useDisclosure(false);

    if (!room) return null;

    const isUserInRoom = room.players.some(player => player.id === session?.user?.id);
    const isHost = room.hostId === session?.user?.id;
    const canStartGame = room.players.length >= 2;

    const handleConfirmStart = () => {
        onStartGame(room.id);
        closeConfirm();
    };

    return (
        <>
            <Modal opened={opened} onClose={closeConfirm} title="Start Game" centered>
                <Text>Are you sure you want to start the game? All players in the lobby will join.</Text>
                <Group justify="flex-end" mt="md">
                    <Button variant="default" onClick={closeConfirm}>Cancel</Button>
                    <Button color="teal" onClick={handleConfirmStart} leftSection={<IconPlayerPlay size={16} />}>
                        Start Now
                    </Button>
                </Group>
            </Modal>

            <Container fluid py="xl" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 70px)' }}>
                <Paper p="xl" radius="xl" shadow="lg" withBorder style={(theme: MantineTheme) => ({
                    width: '100%', maxWidth: 1200, backgroundColor: `rgba(26, 28, 30, 0.7)`,
                    backdropFilter: 'blur(16px)', borderColor: theme.colors.dark[4],
                })}>
                    <Stack>
                        <Group justify="space-between">
                            <Button variant="subtle" color="gray" leftSection={<IconArrowLeft size={16} />} onClick={onBack}>
                                Back to Dashboard
                            </Button>
                            <Badge size="lg" variant="light" color="cyan" rightSection={<IconClipboardCopy size={14} />}>
                                {room.name}
                            </Badge>
                        </Group>
                        <Divider my="sm" />
                        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg">
                            {Array.from({ length: room.maxPlayers }).map((_, index) => {
                                const player = room.players[index] || null;
                                return <PlayerSlot key={index} player={player} isHost={player?.id === room.hostId} />;
                            })}
                        </SimpleGrid>
                        <Divider my="md" />

                        <Stack mt="md" gap="md">
                            {isUserInRoom ? (
                                <>
                                    {isHost && (
                                        <Button
                                            variant="gradient"
                                            gradient={{ from: 'teal', to: 'lime' }}
                                            size="md"
                                            fullWidth
                                            disabled={!canStartGame}
                                            onClick={openConfirm}
                                            leftSection={<IconPlayerPlay size={16} />}
                                        >
                                            Start Game
                                        </Button>
                                    )}
                                    <Button
                                        variant="filled"
                                        color="red"
                                        fullWidth
                                        onClick={() => onLeaveRoom(room.id)}
                                        leftSection={<IconLogout size={16} />}
                                    >
                                        Leave Room
                                    </Button>
                                </>
                            ) : (
                                <Group justify="flex-end">
                                    <Button variant="gradient" gradient={{ from: 'yellow', to: 'orange' }} size="md" w={200} onClick={() => onJoinGame(room.id)} loading={isJoining}>
                                        Join Game
                                    </Button>
                                </Group>
                            )}
                        </Stack>
                    </Stack>
                </Paper>
            </Container>
        </>
    );
}