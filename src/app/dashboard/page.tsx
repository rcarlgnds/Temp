"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import Link from 'next/link';
import {
    AppShell, Title, Button, Group, SimpleGrid,
    Container, useMantineColorScheme, Modal, Stack,
    Text, Center, Loader
} from '@mantine/core';
import { useDisclosure } from "@mantine/hooks";
import { IconPlus, IconLogin, IconTrash } from '@tabler/icons-react';
import {
    getAllRooms, createRoom, addPlayerToRoom,
    removePlayerFromRoom, updateRoomStatus, deleteRoom
} from '@/services/room';
import { createPlayerSession, deletePlayerSession } from '@/services/player';
import { InteractiveBackground } from "@/components/dashboard/InteractiveBackground";
import { AppHeader } from '@/components/dashboard/AppHeader';
import { RoomCard } from '@/components/dashboard/RoomCard';
import { LobbyView } from '@/components/dashboard/LobbyView';
import { Room } from "@/services/room/types";

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const { colorScheme } = useMantineColorScheme();

    const [activeView, setActiveView] = useState('dashboard');
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);
    const [joinOpened, { open: openJoin, close: closeJoin }] = useDisclosure(false);
    const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);
    const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);

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

    const handleCreateRoom = async () => {
        if (!session?.user?.id || !session?.user?.email || !session.user.name) return;
        setIsCreatingRoom(true);
        const newRoomName = `${session.user.name}'s Room`;
        const payload = {
            Room: { RoomId: newRoomName, HostId: session.user.id, TopicId: "aca50f4d-182f-4f2f-a5bd-7aa95f3b731b" },
            Email: session.user.email
        };
        try {
            const newRoom = await createRoom(payload);
            await createPlayerSession({ UserId: session.user.id, RoomId: newRoom.id });
            await addPlayerToRoom({ RoomId: newRoom.id, Email: session.user.email });
            closeCreate();
            const updatedRooms = await getAllRooms();
            setRooms(updatedRooms);
            const createdRoom = updatedRooms.find(room => room.id === newRoom.id);
            if (createdRoom) {
                setSelectedRoom(createdRoom);
                setActiveView('lobby');
            }
        } catch (error) {
            console.error("Error during room creation:", error);
        } finally {
            setIsCreatingRoom(false);
        }
    };

    const handleStartGame = async (roomId: string) => {
        try {
            await updateRoomStatus({ RoomId: roomId, Status: 'start' });
            const updatedRooms = await getAllRooms();
            setRooms(updatedRooms);
            const startedRoom = updatedRooms.find(r => r.id === roomId);
            if (startedRoom) setSelectedRoom(startedRoom);
        } catch (error) {
            console.error("Failed to start game:", error);
        }
    };

    const handleViewRoom = (roomId: string) => {
        const roomToView = rooms.find(room => room.id === roomId);
        if (roomToView) {
            setSelectedRoom(roomToView);
            setActiveView('lobby');
        }
    };

    const handleJoinGameInLobby = async (roomId: string) => {
        if (!session?.user?.id || !session?.user?.email) return;
        setIsJoining(true);
        try {
            await createPlayerSession({ UserId: session.user.id, RoomId: roomId });
            await addPlayerToRoom({ RoomId: roomId, Email: session.user.email });
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

    const handleLeaveRoom = async (roomId: string) => {
        if (!session?.user?.id || !session?.user?.email) return;

        const room = rooms.find(r => r.id === roomId);
        if (!room) return;

        if (room.players.length === 1 && room.players[0].id === session.user.id) {
            handleDeleteRoom(roomId);
        } else {
            try {
                await removePlayerFromRoom({ RoomId: roomId, Email: session.user.email });
                await deletePlayerSession({ email: session.user.email, roomId: roomId });
                handleBackToDashboard();
                await fetchAllRooms();
            } catch (error) {
                console.error("Failed to leave room:", error);
            }
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
            await deletePlayerSession({ email: session.user.email, roomId: roomToDelete.id });

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
            <Container style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', zIndex: 1 }}>
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
                    <Text mt="md">A new room will be created with your name. Are you sure?</Text>
                    <Button
                        fullWidth mt="md" radius="md" variant="gradient"
                        gradient={{ from: '#DAA520', to: '#3C2A21' }}
                        loading={isCreatingRoom} onClick={handleCreateRoom}
                    >
                        Confirm & Create
                    </Button>
                </Stack>
            </Modal>

            <Modal opened={deleteModalOpened} onClose={closeDeleteModal} title={<Text fw={700}>Confirm Deletion</Text>} radius="lg" centered>
                <Stack>
                    <Text mt="md">Are you sure you want to delete room "{roomToDelete?.name}"? This action is permanent.</Text>
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