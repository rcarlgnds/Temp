"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import Link from 'next/link';
import {
    AppShell, Title, Button, Group, SimpleGrid,
    Container, useMantineColorScheme, Modal, Stack,
    Text, Center, Loader, TextInput
} from '@mantine/core';
import { useDisclosure } from "@mantine/hooks";
import { IconPlus, IconLogin, IconTrash, IconTrophy } from '@tabler/icons-react';
import {
    getAllRooms, createRoom, addPlayerToRoom,
    removePlayerFromRoom, updateRoomStatus, deleteRoom
} from '@/services/room';
import { createPlayerSession, deletePlayerSession, getPlayerSessionsByRoomId } from '@/services/player';
import { InteractiveBackground } from "@/components/dashboard/InteractiveBackground";
import { AppHeader } from '@/components/dashboard/AppHeader';
import { RoomCard } from '@/components/dashboard/RoomCard';
import { LobbyView } from '@/components/dashboard/LobbyView';
import { Room } from "@/services/room/types";
import { ApiPlayer } from '@/services/player/types';

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const { colorScheme } = useMantineColorScheme();

    const [activeView, setActiveView] = useState('dashboard');
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);
    const [joinOpened, { open: openJoin, close: closeJoin }] = useDisclosure(false);
    const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);
    const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);

    const [joinRoomId, setJoinRoomId] = useState('');
    const [joinError, setJoinError] = useState<string | null>(null);
    const [isCheckingRoom, setIsCheckingRoom] = useState(false);

    const [rooms, setRooms] = useState<Room[]>([]);
    const [loadingRooms, setLoadingRooms] = useState(true);
    const [isJoining, setIsJoining] = useState(false);
    const [isCreatingRoom, setIsCreatingRoom] = useState(false);

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

    const handleJoinById = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCheckingRoom(true);
        setJoinError(null);
        const roomExists = rooms.find(room => room.id === joinRoomId);
        if (roomExists) {
            closeJoin();
            setJoinRoomId('');
            await handleViewRoom(joinRoomId);
        } else {
            setJoinError("Room ID not found.");
        }
        setIsCheckingRoom(false);
    };

    const handleCreateRoom = async () => {
        if (!session?.user?.id || !session?.user?.email || !session.user.name) return;
        setIsCreatingRoom(true);
        const newRoomName = `${session.user.name}'s Room`;
        const payload = {
            Room: { RoomId: newRoomName, HostId: session.user.id, TopicId: "aca50f4d-182f-4f2f-a5bd-7aa95f3b731b" },
            Email: session.user.email
        };
        try {
            await createRoom(payload);
            closeCreate();
            await fetchAllRooms();
        } catch (error) {
            console.error("Error during room creation:", error);
        } finally {
            setIsCreatingRoom(false);
        }
    };

    const handleStartGame = async (roomId: string) => {
        try {
            const lobbyData = await getPlayerSessionsByRoomId(roomId);
            for (const player of lobbyData.players) {
                await addPlayerToRoom({ RoomId: roomId, Email: player.email });
            }
            await updateRoomStatus({ RoomId: roomId, Status: 'start' });

            const updatedRooms = await getAllRooms();
            setRooms(updatedRooms);
            const startedRoom = updatedRooms.find(r => r.id === roomId);
            if (startedRoom) setSelectedRoom(startedRoom);

        } catch (error) {
            console.error("Failed to start game:", error);
        }
    };

    const handleViewRoom = async (roomId: string) => {
        const baseRoomData = rooms.find(room => room.id === roomId);
        if (!baseRoomData) return;

        try {
            const lobbyData = await getPlayerSessionsByRoomId(roomId);
            const playersInSession = lobbyData.players || [];

            const roomWithSessionPlayers: Room = {
                ...baseRoomData,
                players: playersInSession,
                playersCount: playersInSession.length,
            };
            setSelectedRoom(roomWithSessionPlayers);
            setActiveView('lobby');
        } catch (error) {
            console.error(`Failed to view room ${roomId}:`, error);
        }
    };

    const handleJoinGameInLobby = async (roomId: string) => {
        if (!session?.user?.id || !session?.user?.email) return;
        setIsJoining(true);
        try {
            await createPlayerSession({ userId: session.user.id, roomId: roomId });
            await handleViewRoom(roomId);
        } catch (error) {
            console.error("Failed to join game session:", error);
        } finally {
            setIsJoining(false);
        }
    };

    const handleLeaveRoom = async (roomId: string) => {
        if (!session?.user?.id || !session?.user?.email) return;

        try {
            await deletePlayerSession({ email: session.user.email, roomId: roomId });

            const lobbyData = await getPlayerSessionsByRoomId(roomId);
            if (lobbyData.sessions.length === 0) {
                await deleteRoom({ roomId: roomId });
            }

            handleBackToDashboard();
            await fetchAllRooms();
        } catch (error) {
            console.error("Failed to leave room:", error);
        }
    };

    const handleDeleteRoom = (roomId: string) => {
        const room = rooms.find(r => r.id === roomId);
        if (room) {
            setRoomToDelete(room);
            openDeleteModal();
        }
    };

    const confirmDeleteRoom = async () => {
        if (!roomToDelete || !session?.user?.email) return;
        try {
            await deleteRoom({ roomId: roomToDelete.id });
            setRooms(currentRooms => currentRooms.filter(room => room.id !== roomToDelete.id));
        } catch(error) {
            console.error("Failed to delete room:", error);
        } finally {
            setRoomToDelete(null);
            closeDeleteModal();
            handleBackToDashboard();
        }
    };

    const handleBackToDashboard = () => {
        setSelectedRoom(null);
        setActiveView('dashboard');
    };

    if (status !== "authenticated") {
        return (
            <Container style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Title c="white" ta="center">Akses Ditolak</Title>
                <Button component={Link} href="/" mt="xl" size="lg" variant="gradient" gradient={{from: 'cyan', to: 'blue'}}>
                    Ke Halaman Login
                </Button>
            </Container>
        );
    }

    return (
        <>
            <InteractiveBackground colorScheme={colorScheme} />
            <Modal opened={createOpened} onClose={closeCreate} title={<Text fw={700}>Create a New Room</Text>} radius="lg" centered>
                <Stack>
                    <Text>A new room will be created with your name. Are you sure?</Text>
                    <Button
                        fullWidth mt="md" radius="md" variant="gradient"
                        gradient={{ from: '#DAA520', to: '#3C2A21' }}
                        loading={isCreatingRoom} onClick={handleCreateRoom}
                    >
                        Confirm & Create
                    </Button>
                </Stack>
            </Modal>
            <Modal opened={joinOpened} onClose={closeJoin} title={<Text fw={700}>Join Room by ID</Text>} radius="lg" centered>
                <form onSubmit={handleJoinById}>
                    <Stack>
                        <TextInput
                            label="Room ID"
                            placeholder="Enter the Room ID"
                            value={joinRoomId}
                            onChange={(e) => setJoinRoomId(e.currentTarget.value)}
                            error={joinError}
                            required
                        />
                        <Button
                            type="submit"
                            fullWidth mt="md" radius="md"
                            variant="gradient"
                            gradient={{ from: 'cyan', to: 'blue' }}
                            loading={isCheckingRoom}
                        >
                            Join
                        </Button>
                    </Stack>
                </form>
            </Modal>
            <Modal opened={deleteModalOpened} onClose={closeDeleteModal} title={<Text fw={700}>Confirm Deletion</Text>} radius="lg" centered>
                <Stack>
                    <Text>Are you sure you want to delete room "{roomToDelete?.name}"? This action is permanent.</Text>
                    <Group justify="flex-end" mt="md">
                        <Button variant="default" onClick={closeDeleteModal}>Cancel</Button>
                        <Button color="red" leftSection={<IconTrash size={16}/>} onClick={confirmDeleteRoom}>
                            Delete Room
                        </Button>
                    </Group>
                </Stack>
            </Modal>
            <AppShell header={{ height: 70 }} padding="md" styles={{ main: { backgroundColor: 'transparent', position: 'relative', zIndex: 1 } }}>
                <AppHeader />
                <AppShell.Main>
                    {activeView === 'dashboard' ? (
                        <Container size="xl" py="xl">
                            <Group justify="space-between" mb="xl">
                                <Title order={1} c={colorScheme === 'dark' ? "white" : "gray.8"}>Available Rooms</Title>
                                <Group>
                                    <Button component={Link} href="/leaderboard" variant="light" color="yellow" leftSection={<IconTrophy size={18} />}>
                                        Leaderboard
                                    </Button>
                                    <Button onClick={openCreate} variant="gradient" gradient={{ from: '#A99260', to: '#3E2C23' }} leftSection={<IconPlus size={18} />}>Create Room</Button>
                                    <Button onClick={openJoin} variant="outline" styles={{root: {borderColor: '#A99260', color: '#A99260'}}} leftSection={<IconLogin size={18} />}>Join by ID</Button>
                                </Group>
                            </Group>
                            {loadingRooms ? (
                                <Center h={400}><Loader color="yellow" /></Center>
                            ) : (
                                <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl">
                                    {rooms.map((room) => (
                                        <RoomCard
                                            key={room.id}
                                            room={room}
                                            onJoin={handleViewRoom}
                                            onDelete={handleDeleteRoom}
                                        />
                                    ))}
                                </SimpleGrid>
                            )}
                        </Container>
                    ) : (
                        <LobbyView
                            room={selectedRoom}
                            onBack={handleBackToDashboard}
                            onJoinGame={handleJoinGameInLobby}
                            onLeaveRoom={handleLeaveRoom}
                            onStartGame={handleStartGame}
                            isJoining={isJoining}
                        />
                    )}
                </AppShell.Main>
            </AppShell>
        </>
    );
}