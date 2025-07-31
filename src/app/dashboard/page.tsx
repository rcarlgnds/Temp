"use client";

import React, { useState } from 'react';
import { useSession } from "next-auth/react";
import Link from 'next/link';
import {
    AppShell, Title, Button, Group, SimpleGrid,
    Container, useMantineColorScheme, Modal, Stack,
    TextInput, NumberInput, Text
} from '@mantine/core';
import { useDisclosure } from "@mantine/hooks";
import { IconPlus, IconLogin } from '@tabler/icons-react';

import { InteractiveBackground } from "@/components/dashboard/InteractiveBackground";
import { AppHeader } from '@/components/dashboard/AppHeader';
import { RoomCard } from '@/components/dashboard/RoomCard';
import { LobbyView } from '@/components/dashboard/LobbyView';

export default function DashboardPage() {
    const { status } = useSession();
    const { colorScheme } = useMantineColorScheme();

    const [activeView, setActiveView] = useState('dashboard');
    const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
    const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);
    const [joinOpened, { open: openJoin, close: closeJoin }] = useDisclosure(false);

    const handleJoinRoom = (roomId: string) => {
        setSelectedRoomId(roomId);
        setActiveView('lobby');
    };

    const handleBackToDashboard = () => {
        setSelectedRoomId(null);
        setActiveView('dashboard');
    };

    const mockRooms = [
        { id: 'R001', name: 'Ruang Santai', players: 2, maxPlayers: 4 },
        { id: 'R002', name: 'Arena Pro', players: 4, maxPlayers: 4 },
        { id: 'R003', name: 'Pemula Friendly', players: 1, maxPlayers: 4 },
    ];

    const mockPlayers = [
        { id: 1, name: 'Player 1 (You)', isReady: true, isHost: true },
        { id: 2, name: 'Player 2', isReady: false, isHost: false },
        null,
        null
    ];

    // === Styles ===
    const headingColor = colorScheme === 'dark' ? "white" : "gray.8";
    const cardStyle = {
        background: colorScheme === 'dark' ? 'rgba(30, 30, 40, 0.6)' : 'rgba(255, 255, 255, 0.6)',
        backdropFilter: 'blur(12px) saturate(1.2)',
        border: `1px solid ${colorScheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
        borderRadius: '16px',
    };

    if (status !== "authenticated") {
        return (
            <>
                <InteractiveBackground colorScheme={colorScheme} />
                <Container style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', zIndex: 1 }}>
                    <Title c="white" ta="center" style={{ textShadow: '2px 2px 6px rgba(0,0,0,0.3)' }}>Akses Ditolak</Title>
                    <Button component={Link} href="/" mt="xl" size="lg" variant="gradient" gradient={{ from: 'cyan', to: 'blue' }}>
                        Ke Halaman Login
                    </Button>
                </Container>
            </>
        );
    }

    return (
        <>
            <InteractiveBackground colorScheme={colorScheme} />

            {/* Modal Create Room */}
            <Modal
                opened={createOpened}
                onClose={closeCreate}
                title={
                    <Group>
                        <IconPlus size={20} color="var(--mantine-color-yellow-7)" />
                        <Text fw={700}>Create a New Room</Text>
                    </Group>
                }
                radius="lg"
                size="md"
                centered
                overlayProps={{ blur: 8, backgroundOpacity: 0.4 }}
                styles={{
                    content: {
                        background: colorScheme === 'dark' ? 'rgba(40, 30, 20, 0.85)' : 'rgba(255, 250, 240, 0.95)',
                        border: '1px solid rgba(255, 215, 0, 0.2)',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                        borderRadius: '16px',
                    }
                }}
            >
                <Stack>
                    <TextInput
                        label="Room Name"
                        placeholder="e.g., The King's Table"
                        required
                        radius="md"
                    />
                    <NumberInput
                        label="Max Players"
                        defaultValue={4}
                        min={2}
                        max={4}
                        radius="md"
                    />
                    <Button
                        fullWidth
                        mt="md"
                        radius="md"
                        variant="gradient"
                        gradient={{ from: '#DAA520', to: '#3C2A21', deg: 60 }}
                    >
                        Create Room
                    </Button>
                </Stack>
            </Modal>


            {/* Modal Join Room */}
            <Modal
                opened={joinOpened}
                onClose={closeJoin}
                title={
                    <Group>
                        <IconLogin size={20} color="var(--mantine-color-yellow-7)" />
                        <Text fw={700}>Join Room by ID</Text>
                    </Group>
                }
                radius="lg"
                size="md"
                centered
                overlayProps={{ blur: 8, backgroundOpacity: 0.4 }}
                styles={{
                    content: {
                        background: colorScheme === 'dark' ? 'rgba(40, 30, 20, 0.85)' : 'rgba(255, 250, 240, 0.95)',
                        border: '1px solid rgba(255, 215, 0, 0.2)',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                        borderRadius: '16px',
                    }
                }}
            >
                <Stack>
                    <TextInput
                        label="Room ID"
                        placeholder="Enter Room ID"
                        required
                        radius="md"
                    />
                    <Button
                        fullWidth
                        mt="md"
                        radius="md"
                        variant="gradient"
                        gradient={{ from: '#DAA520', to: '#3C2A21', deg: 60 }}
                    >
                        Join Room
                    </Button>
                </Stack>
            </Modal>


            <AppShell
                header={{ height: 70 }}
                padding="md"
                styles={{
                    main: {
                        backgroundColor: 'transparent',
                        position: 'relative',
                        zIndex: 1,
                    },
                }}
            >
                <AppHeader />

                <AppShell.Main>
                    {activeView === 'dashboard' ? (
                        <Container size="xl" py="xl">
                            <Group justify="space-between" mb="xl">
                                <Title
                                    order={1}
                                    c={headingColor}
                                    style={{ textShadow: '2px 2px 6px rgba(0,0,0,0.25)' }}
                                >
                                    Available Rooms
                                </Title>
                                <Group>
                                    <Button
                                        onClick={openCreate}
                                        variant="gradient"
                                        gradient={{ from: '#A99260', to: '#3E2C23', deg: 60 }}
                                        leftSection={<IconPlus size={18} />}
                                        styles={{
                                            root: {
                                                color: 'white',
                                                fontWeight: 600,
                                            },
                                        }}
                                    >
                                        Create Room
                                    </Button>

                                    <Button
                                        onClick={openJoin}
                                        variant="outline"
                                        color="brown"
                                        leftSection={<IconLogin size={18} />}
                                        styles={{
                                            root: {
                                                borderColor: '#A99260',
                                                color: '#A99260',
                                                fontWeight: 600,
                                            },
                                        }}
                                    >
                                        Join by ID
                                    </Button>

                                </Group>
                            </Group>

                            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl">
                                {mockRooms.map((room) => (
                                    <RoomCard key={room.id} room={room} onJoin={handleJoinRoom} />
                                ))}
                            </SimpleGrid>
                        </Container>
                    ) : (
                        <LobbyView
                            roomId={selectedRoomId}
                            players={mockPlayers}
                            onBack={handleBackToDashboard}
                        />
                    )}
                </AppShell.Main>
            </AppShell>
        </>
    );
}
