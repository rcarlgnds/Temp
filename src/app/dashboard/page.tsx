"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  AppShell,
  Title,
  Button,
  Group,
  SimpleGrid,
  Container,
  useMantineColorScheme,
  Modal,
  Stack,
  Text,
  Center,
  Loader,
  TextInput,
  Box,
  Select,
  NumberInput,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconPlus,
  IconLogin,
  IconTrash,
  IconTrophy,
} from "@tabler/icons-react";
import {
  getAllRooms,
  createRoom,
  addPlayerToRoom,
  updateRoomStatus,
  deleteRoom,
  updateRoomHost,
} from "@/services/room";
import {
  createPlayerSession,
  deletePlayerSession,
  getPlayerSessionsByRoomId,
} from "@/services/player";
import { InteractiveBackground } from "@/components/dashboard/InteractiveBackground";
import { AppHeader } from "@/components/dashboard/AppHeader";
import { RoomCard } from "@/components/dashboard/RoomCard";
import { LobbyView } from "@/components/dashboard/LobbyView";
import { Room } from "@/services/room/types";
import { getUserByEmail } from "@/services/user";
import Email from "next-auth/providers/email";
import { useRouter } from "next/navigation";
import { getAllTopics } from "@/services/topic";

export default function DashboardPage() {
  const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL;
  const { data: session, status } = useSession();
  const { colorScheme } = useMantineColorScheme();
  const router = useRouter();

  const [activeView, setActiveView] = useState("dashboard");
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [createOpened, { open: openCreate, close: closeCreate }] =
    useDisclosure(false);
  const [joinOpened, { open: openJoin, close: closeJoin }] =
    useDisclosure(false);
  const [
    deleteModalOpened,
    { open: openDeleteModal, close: closeDeleteModal },
  ] = useDisclosure(false);
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);

  const [joinRoomId, setJoinRoomId] = useState("");
  const [joinError, setJoinError] = useState<string | null>(null);
  const [isCheckingRoom, setIsCheckingRoom] = useState(false);

  const [rooms, setRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [lobbyWs, setLobbyWs] = useState<WebSocket | null>(null);

  // BUAT CREATE ROOM
  const [topics, setTopics] = useState<{ value: string; label: string }[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [classCode, setClassCode] = useState("");
  const [roomCount, setRoomCount] = useState<number | string>(1);

  useEffect(() => {
    if (!session?.user.id) return;
    connectLobby(session.user.id);

    return () => {
      lobbyWs?.readyState === WebSocket.OPEN && lobbyWs.close();
    };
  }, [session?.user.id]);

  const connectLobby = (userId: string) => {
    const wsUrl = `${SOCKET_URL}/ws/lobby?userId=${userId}`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => console.log("WebSocket connected");
    socket.onclose = () => console.log("WebSocket disconnected");
    socket.onerror = (error) => console.error("WebSocket error:", error);

    socket.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.message === "create room" || data.message === "delete room") {
          await fetchAllRooms();
        }
      } catch (err) {
        console.log("parse error: ", err);
      }
    };

    setLobbyWs(socket);
  };

  const fetchAllRooms = async () => {
    try {
      setLoadingRooms(true);
      const baseRooms = await getAllRooms();

      const roomsWithSessionData = await Promise.all(
        baseRooms.map(async (room) => {
          try {
            const lobbyData = await getPlayerSessionsByRoomId(room.id);
            const playersInSession = lobbyData.players || [];
            return {
              ...room,
              players: playersInSession,
              playersCount: playersInSession.length,
            };
          } catch (error) {
            return { ...room, players: [], playersCount: 0 };
          }
        })
      );

      setRooms(roomsWithSessionData);
    } catch (error) {
      // console.error(error);
    } finally {
      setLoadingRooms(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchAllRooms();
    }
  }, [status]);

  useEffect(() => {
    if (createOpened) {
      const fetchTopics = async () => {
        try {
          const fetchedTopics = await getAllTopics();
          setTopics(
            fetchedTopics.map((t) => ({ value: t.topicId, label: t.topicName }))
          );
        } catch (error) {
          console.error("Failed to fetch topics for modal");
        }
      };
      fetchTopics();
    }
  }, [createOpened]);

  if (status === "loading") {
    return (
      <>
        <InteractiveBackground colorScheme={colorScheme} />
        <Box
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <Loader color="yellow" size="xl" />
        </Box>
      </>
    );
  }

  if (status === "unauthenticated") {
    useEffect(() => {
      router.push("/");
    }, [router]);
    return (
      <Box
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Loader color="yellow" size="xl" />
      </Box>
    );
  }

  const handleJoinById = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCheckingRoom(true);
    setJoinError(null);
    const roomExists = rooms.find((room) => room.id === joinRoomId);
    if (roomExists) {
      closeJoin();
      setJoinRoomId("");
      await handleViewRoom(joinRoomId);
    } else {
      setJoinError("Room ID not found.");
    }
    setIsCheckingRoom(false);
  };

  const handleCreateRoom = async () => {
    if (
      !session?.user?.email ||
      !session.user.name ||
      !selectedTopic ||
      !classCode ||
      !roomCount
    )
      return;
    setIsCreatingRoom(true);
    try {
      const userProfile = await getUserByEmail(session.user.email);
      if (!userProfile?.playerId)
        throw new Error("Could not retrieve user profile.");

      const finalClassCode = `${userProfile.username}_${classCode}`;
      let lastPayload = null;

      for (let i = 0; i < Number(roomCount); i++) {
        const payload = {
          Room: {
            HostId: userProfile.playerId,
            TopicId: selectedTopic,
            ClassCode: finalClassCode,
          },
          Email: session.user.email,
        };
        // await createRoom(payload);
        lastPayload = payload;
      }

      if (lobbyWs && lobbyWs.readyState === WebSocket.OPEN) {
        lobbyWs.send(
          JSON.stringify({
            eventType: "create-lobby",
            payload: lastPayload,
          })
        );
      }

      closeCreate();
      setSelectedTopic(null);
      setClassCode("");
      setRoomCount(1);
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
      if (lobbyData && lobbyData.players) {
        for (const player of lobbyData.players) {
          await addPlayerToRoom({ RoomId: roomId, Email: player.email });
        }
      }
      await updateRoomStatus({ RoomId: roomId, Status: "start" });

      const updatedRooms = await getAllRooms();
      setRooms(updatedRooms);
      const startedRoom = updatedRooms.find((r) => r.id === roomId);
      if (startedRoom) setSelectedRoom(startedRoom);
    } catch (error) {
      console.error("Failed to start game:", error);
    }
  };

  const handleViewRoom = async (roomId: string) => {
    lobbyWs?.close();

    const baseRoomData = rooms.find((room) => room.id === roomId);
    if (!baseRoomData) return;

    try {
      const lobbyData = await getPlayerSessionsByRoomId(roomId);

      const playersWithCode = (lobbyData.players || []).map((player) => {
        const sessionInfo = (lobbyData.sessions || []).find(
          (s) => s.userId === player.playerId
        );
        return {
          ...player,
          playerCode: sessionInfo ? sessionInfo.playerCode : undefined,
        };
      });

      const roomWithSessionPlayers: Room = {
        ...baseRoomData,
        players: playersWithCode,
        playersCount: playersWithCode.length,
      };
      setSelectedRoom(roomWithSessionPlayers);
      setActiveView("lobby");
    } catch (error) {
      console.error(`Failed to view room ${roomId}:`, error);
    }
  };

  const handleTransferHost = async (newHostId: string) => {
    if (!selectedRoom) return;
    try {
      await updateRoomHost({ RoomId: selectedRoom.id, HostId: newHostId });
    } catch (error) {
      console.error("Failed to transfer host:", error);
    }
  };

  const handleJoinGameInLobby = async (
    roomId: string,
    ws: WebSocket | null
  ) => {
    if (!session?.user?.id) return;
    setIsJoining(true);
    try {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            eventType: "join-lobby",
            roomId: roomId,
            userId: session.user.id,
          })
        );
      }
    } catch (error) {
      console.error("Failed to join game session:", error);
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeaveRoom = async (roomId: string, ws: WebSocket | null) => {
    if (!session?.user?.email) return;
    try {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            eventType: "leave-room",
            roomId: roomId,
            email: session.user.email,
          })
        );
      }
      handleBackToDashboard();
      await fetchAllRooms();
    } catch (error) {
      console.error("Failed to leave room:", error);
    }
  };

  const handleDeleteRoom = (roomId: string) => {
    const room = rooms.find((r) => r.id === roomId);
    if (room) {
      setRoomToDelete(room);
      openDeleteModal();
    }
  };

  const confirmDeleteRoom = async () => {
    if (!roomToDelete) return;
    try {
      // await deleteRoom({ roomId: roomToDelete.id });
      // setRooms((currentRooms) =>
      //   currentRooms.filter((room) => room.id !== roomToDelete.id)
      // );

      if (lobbyWs && lobbyWs.readyState === WebSocket.OPEN) {
        lobbyWs.send(
          JSON.stringify({
            eventType: "delete-lobby",
            roomId: roomToDelete.id,
          })
        );
      }
    } catch (error) {
      console.error("Failed to delete room:", error);
    } finally {
      setRoomToDelete(null);
      closeDeleteModal();
      handleBackToDashboard();
    }
  };

  const handleBackToDashboard = (ws?: WebSocket | null) => {
    ws?.close();

    if (session?.user.id) {
      connectLobby(session.user.id);
    }

    setSelectedRoom(null);
    setActiveView("dashboard");
  };

  const refreshLobbyData = async (roomId: string) => {
    await handleViewRoom(roomId);
  };

  if (status !== "authenticated") {
    return (
      <Container
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Title c="white" ta="center">
          Akses Ditolak
        </Title>
        <Button
          component={Link}
          href="/"
          mt="xl"
          size="lg"
          variant="gradient"
          gradient={{ from: "cyan", to: "blue" }}
        >
          Ke Halaman Login
        </Button>
      </Container>
    );
  }

  return (
    <>
      <InteractiveBackground colorScheme={colorScheme} />
      <Modal
        opened={createOpened}
        onClose={closeCreate}
        title={<Text fw={700}>Create New Room(s)</Text>}
        radius="lg"
        centered
      >
        <Stack mt="md">
          <Select
            label="Select Topic"
            placeholder="Choose a topic"
            data={topics}
            value={selectedTopic}
            onChange={setSelectedTopic}
            required
          />
          <TextInput
            label="Class Code"
            placeholder="Enter class code (ex: LA17)"
            value={classCode}
            onChange={(e) => setClassCode(e.currentTarget.value)}
            disabled={!selectedTopic}
            required
          />
          <NumberInput
            label="Number of Rooms"
            value={roomCount}
            onChange={setRoomCount}
            min={1}
            max={10}
            disabled={!classCode}
            required
          />
          <Button
            fullWidth
            mt="md"
            radius="md"
            variant="gradient"
            gradient={{ from: "#DAA520", to: "#3C2A21" }}
            loading={isCreatingRoom}
            onClick={handleCreateRoom}
            disabled={!selectedTopic || !classCode || !roomCount}
          >
            Create
          </Button>
        </Stack>
      </Modal>
      <Modal
        opened={joinOpened}
        onClose={closeJoin}
        title={<Text fw={700}>Join Room by ID</Text>}
        radius="lg"
        centered
      >
        <form onSubmit={handleJoinById}>
          <Stack>
            <TextInput
              mt="md"
              label="Room ID"
              placeholder="Enter the Room ID"
              value={joinRoomId}
              onChange={(e) => setJoinRoomId(e.currentTarget.value)}
              error={joinError}
              required
            />
            <Button
              type="submit"
              fullWidth
              mt="md"
              radius="md"
              variant="gradient"
              gradient={{ from: "cyan", to: "blue" }}
              loading={isCheckingRoom}
            >
              Join
            </Button>
          </Stack>
        </form>
      </Modal>
      <Modal
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        title={<Text fw={700}>Confirm Deletion</Text>}
        radius="lg"
        centered
      >
        <Stack>
          <Text mt="md">
            Are you sure you want to delete room "{roomToDelete?.name}"? This
            action is permanent.
          </Text>
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={closeDeleteModal}>
              Cancel
            </Button>
            <Button
              color="red"
              leftSection={<IconTrash size={16} />}
              onClick={confirmDeleteRoom}
            >
              Delete Room
            </Button>
          </Group>
        </Stack>
      </Modal>
      <AppShell
        header={{ height: 70 }}
        padding="md"
        styles={{
          main: {
            backgroundColor: "transparent",
            position: "relative",
            zIndex: 1,
          },
        }}
      >
        <AppHeader />
        <AppShell.Main>
          {activeView === "dashboard" ? (
            <Container size="xl" py="xl">
              <Group justify="space-between" mb="xl">
                <Title
                  order={1}
                  c={colorScheme === "dark" ? "white" : "gray.8"}
                >
                  Available Rooms
                </Title>
                <Group>
                  <Button
                    component={Link}
                    href="/leaderboard"
                    variant="light"
                    color="yellow"
                    leftSection={<IconTrophy size={18} />}
                  >
                    Leaderboard
                  </Button>
                  <Button
                    onClick={openCreate}
                    variant="gradient"
                    gradient={{ from: "#A99260", to: "#3E2C23" }}
                    leftSection={<IconPlus size={18} />}
                  >
                    Create Room
                  </Button>
                  <Button
                    onClick={openJoin}
                    variant="outline"
                    styles={{
                      root: { borderColor: "#A99260", color: "#A99260" },
                    }}
                    leftSection={<IconLogin size={18} />}
                  >
                    Join by ID
                  </Button>
                </Group>
              </Group>
              {loadingRooms ? (
                <Center h={400}>
                  <Loader color="yellow" />
                </Center>
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
              onRefreshLobby={refreshLobbyData}
              isJoining={isJoining}
              setIsJoining={setIsJoining}
              onTransferHost={handleTransferHost}
            />
          )}
        </AppShell.Main>
      </AppShell>
    </>
  );
}
