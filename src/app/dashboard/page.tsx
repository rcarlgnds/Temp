"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import Link from 'next/link';
import {
    AppShell, Title, Button, Group, SimpleGrid,
    Container, useMantineColorScheme, Modal, Stack,
    TextInput, NumberInput, Text, Center, Loader
} from '@mantine/core';
import { useDisclosure } from "@mantine/hooks";
import { IconPlus, IconLogin } from '@tabler/icons-react';
import { getAllRooms, createRoom, addPlayerToRoom } from '@/services/room';
import { createPlayerSession } from '@/services/player';
import { InteractiveBackground } from "@/components/dashboard/InteractiveBackground";
import { AppHeader } from '@/components/dashboard/AppHeader';
import { RoomCard } from '@/components/dashboard/RoomCard';
import { LobbyView } from '@/components/dashboard/LobbyView';
import {Room} from "@/services/room/types";

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const { colorScheme } = useMantineColorScheme();

    const [activeView, setActiveView] = useState('dashboard');
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);
    const [joinOpened, { open: openJoin, close: closeJoin }] = useDisclosure(false);

    const [rooms, setRooms] = useState<Room[]>([]);
    const [loadingRooms, setLoadingRooms] = useState(true);
    const [isJoining, setIsJoining] = useState(false);

    const fetchAllRooms = async () => {
        try {
            setLoadingRooms(true);
            const fetchedRooms = await getAllRooms();
            setRooms(fetchedRooms);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingRooms(false);
        }
    };

    useEffect(() => {
        if (status === "authenticated") {
            fetchAllRooms();
        }
    }, [status]);

    const handleViewRoom = (roomId: string) => {
        const roomToView = rooms.find(room => room.id === roomId);
        if (roomToView) {
            setSelectedRoom(roomToView);
            setActiveView('lobby');
        }
    };

    const handleJoinGameInLobby = async (roomId: string) => {
        if (!session?.user?.id || !session?.user?.email) {
            console.error("User session data is not available.");
            return;
        }

        setIsJoining(true);

        try {
            const sessionPayload = { UserId: session.user.id, RoomId: roomId };
            await createPlayerSession(sessionPayload);

            const addPlayerPayload = { RoomId: roomId, Email: session.user.email };
            await addPlayerToRoom(addPlayerPayload);

            const updatedRooms = await getAllRooms();
            setRooms(updatedRooms);

            const newlyJoinedRoom = updatedRooms.find(r => r.id === roomId);
            if (newlyJoinedRoom) {
                setSelectedRoom(newlyJoinedRoom);
            } else {
                handleBackToDashboard();
            }
        } catch (error) {
            console.error("Failed to join game:", error);
        } finally {
            setIsJoining(false);
        }
    };

    const handleBackToDashboard = () => {
        setSelectedRoom(null);
        setActiveView('dashboard');
    };

    const handleCreateRoom = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!session?.user?.id || !session?.user?.email) {
            console.error("User ID or Email not found in session");
            return;
        }

        const payload = {
            Room: { HostId: session.user.id, TopicId: "aca50f4d-182f-4f2f-a5bd-7aa95f3b731b" },
            Email: session.user.email
        };

        try {
            await createRoom(payload);
            closeCreate();
            await fetchAllRooms();
        } catch (error) {
            console.error("Error in handleCreateRoom:", error);
        }
    };

    if (status !== "authenticated") {
        return (
            <>
                <InteractiveBackground colorScheme={colorScheme} />
                <Container style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', zIndex: 1 }}>
                    <Title c="white" ta="center">Akses Ditolak</Title>
                    <Button component={Link} href="/" mt="xl" size="lg" variant="gradient" gradient={{from: 'cyan', to: 'blue'}}>
                        Ke Halaman Login
                    </Button>
                </Container>
            </>
        );
    }

    return (
        <>
            <InteractiveBackground colorScheme={colorScheme} />

            <Modal opened={createOpened} onClose={closeCreate} title={<Text fw={700}>Create a New Room</Text>} radius="lg" centered>
                <form onSubmit={handleCreateRoom}>
                    <Stack>
                        <TextInput label="Room Name" placeholder="e.g., The King's Table" required radius="md" name="roomName"/>
                        <NumberInput label="Max Players" defaultValue={4} min={2} max={4} radius="md" name="maxPlayers"/>
                        <Button type="submit" fullWidth mt="md" radius="md" variant="gradient" gradient={{ from: '#DAA520', to: '#3C2A21' }}>Create Room</Button>
                    </Stack>
                </form>
            </Modal>

            <AppShell header={{ height: 70 }} padding="md" styles={{ main: { backgroundColor: 'transparent', position: 'relative', zIndex: 1 } }}>
                <AppHeader />
                <AppShell.Main>
                    {activeView === 'dashboard' ? (
                        <Container size="xl" py="xl">
                            <Group justify="space-between" mb="xl">
                                <Title order={1} c={colorScheme === 'dark' ? "white" : "gray.8"}>Available Rooms</Title>
                                <Group>
                                    <Button onClick={openCreate} variant="gradient" gradient={{ from: '#A99260', to: '#3E2C23' }} leftSection={<IconPlus size={18} />}>Create Room</Button>
                                    <Button onClick={openJoin} variant="outline" styles={{root: {borderColor: '#A99260', color: '#A99260'}}} leftSection={<IconLogin size={18} />}>Join by ID</Button>
                                </Group>
                            </Group>
                            {loadingRooms ? (
                                <Center h={400}><Loader color="yellow" /></Center>
                            ) : (
                                <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl">
                                    {rooms.map((room) => (
                                        <RoomCard key={room.id} room={room} onJoin={handleViewRoom} />
                                    ))}
                                </SimpleGrid>
                            )}
                        </Container>
                    ) : (
                        <LobbyView
                            room={selectedRoom}
                            onBack={handleBackToDashboard}
                            onJoinGame={handleJoinGameInLobby}
                            isJoining={isJoining}
                        />
                    )}
                </AppShell.Main>
            </AppShell>
        </>
    );
}