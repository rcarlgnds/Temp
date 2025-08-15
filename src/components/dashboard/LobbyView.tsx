"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Container,
  Paper,
  Stack,
  Button,
  Group,
  Badge,
  Divider,
  SimpleGrid,
  MantineTheme,
  Modal,
  Text,
  Tooltip,
  Title,
  Checkbox,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconArrowLeft,
  IconCopy,
  IconCheck,
  IconLogout,
  IconPlayerPlay,
  IconUserCircle,
  IconFileDescription,
  IconActivity,
} from "@tabler/icons-react";
import { PlayerSlot } from "./PlayerSlot";
import { Room } from "@/services/room/types";

interface LobbyViewProps {
  room: Room | null;
  onBack: (ws: WebSocket | null) => void;
  onJoinGame: (roomId: string, ws: WebSocket | null) => Promise<void>;
  onLeaveRoom: (roomId: string, ws: WebSocket | null) => Promise<void>;
  onStartGame: (roomId: string) => Promise<void>;
  onRefreshLobby: (roomId: string) => void;
  isJoining: boolean;
  setIsJoining: (isJoining: boolean) => void;
  onTransferHost: (newHostId: string) => Promise<void>;
}

export function LobbyView({
  room,
  onBack,
  onJoinGame,
  onLeaveRoom,
  onStartGame,
  onRefreshLobby,
  isJoining,
  setIsJoining,
  onTransferHost,
}: LobbyViewProps) {
  const { data: session } = useSession();
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [opened, { open: openConfirm, close: closeConfirm }] =
    useDisclosure(false);
  const [copied, setCopied] = useState(false);
  const [caseRead, setCaseRead] = useState(false);
  const [topicOpened, { open: openTopic, close: closeTopic }] =
    useDisclosure(false);

  const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL;

  useEffect(() => {
    if (!room?.id || !session?.user?.id) return;

    const wsUrl = `${SOCKET_URL}/ws/general?roomId=${room.id}&userId=${session.user.id}`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => console.log("WebSocket connected");
    socket.onclose = () => console.log("WebSocket disconnected");
    socket.onerror = (error) => console.error("WebSocket error:", error);

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.message === "update room" && room?.id) {
          onRefreshLobby(room.id);
        } else if (data.message === "leave room" && room?.id) {
          onRefreshLobby(room.id);
        }
      } catch (err) {
        console.error("Parse error:", err);
      }
    };

    setWs(socket);

    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, [room?.id, session?.user?.id, onRefreshLobby]);

  if (!room) return null;

  const isUserInRoom = room.players.some(
    (player) => player.playerId === session?.user?.id
  );
  const isHost = room.hostId === session?.user?.id;
  const canStartGame = room.players.length >= 2;
  const canJoin = room.status === "waiting";

  useEffect(() => {
    if (isUserInRoom) {
      setIsJoining(false);
    }
  }, [isUserInRoom, setIsJoining]);

  const handleConfirmStart = () => {
    onStartGame(room.id);
    closeConfirm();
  };

  const handleJoinWithCondition = () => {
    if (caseRead && canJoin) {
      onJoinGame(room.id, ws);
      closeTopic();
    }
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(room.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <>
      <Modal opened={opened} onClose={closeConfirm} title="Start Game" centered>
        <Text mt="md">Are you sure? All players in the lobby will join.</Text>
        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={closeConfirm}>
            Cancel
          </Button>
          <Button
            color="teal"
            onClick={handleConfirmStart}
            leftSection={<IconPlayerPlay size={16} />}
          >
            Start Now
          </Button>
        </Group>
      </Modal>

      <Modal
        opened={topicOpened}
        onClose={closeTopic}
        title="Game Case"
        centered
        size="lg"
      >
        <Stack>
          <Text mt="md">
            {room.topicDescription ||
              "No case description available for this topic."}
          </Text>
          <Checkbox
            label="I've read all the case"
            checked={caseRead}
            onChange={(event) => setCaseRead(event.currentTarget.checked)}
            mt="md"
          />
          <Button
            variant="gradient"
            gradient={{ from: "yellow", to: "orange" }}
            size="md"
            fullWidth
            onClick={handleJoinWithCondition}
            loading={isJoining}
            disabled={!caseRead || !canJoin}
            mt="md"
          >
            Join Game
          </Button>
        </Stack>
      </Modal>

      <Container
        fluid
        py="xl"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "calc(100vh - 70px)",
        }}
      >
        <Paper
          p="xl"
          radius="xl"
          shadow="lg"
          withBorder
          style={(theme: MantineTheme) => ({
            width: "100%",
            maxWidth: 1200,
            backgroundColor: `rgba(26, 28, 30, 0.7)`,
            backdropFilter: "blur(16px)",
            borderColor: theme.colors.dark[4],
          })}
        >
          <Stack>
            <Group justify="space-between" align="flex-start">
              <Button
                variant="subtle"
                color="gray"
                leftSection={<IconArrowLeft size={16} />}
                onClick={() => onBack(ws)}
              >
                Back to Dashboard
              </Button>
              <Tooltip
                label={copied ? "ID Copied!" : "Click to copy Room ID"}
                withArrow
              >
                <Group
                  gap="xs"
                  onClick={handleCopy}
                  style={{ cursor: "pointer" }}
                >
                  <Title order={4} c={copied ? "teal.5" : "medievalGold.4"}>
                    {room.name}
                  </Title>
                  {copied ? (
                    <IconCheck size={20} color="teal" />
                  ) : (
                    <IconCopy size={20} />
                  )}
                </Group>
              </Tooltip>
            </Group>

            <Stack gap="xs" mt="sm" ml="md">
              <Group justify="space-between">
                <Group gap="xs" c="dimmed">
                  <IconUserCircle size={16} />
                  <Text size="xs">Host ID: {room.hostId}</Text>
                </Group>
                <Badge
                  color={room.status === "waiting" ? "yellow" : "green"}
                  variant="light"
                  leftSection={<IconActivity size={14} />}
                >
                  {room.status}
                </Badge>
              </Group>
              <Group gap="xs" c="dimmed">
                <IconFileDescription size={16} />
                <Text size="xs">Topic: {room.topicName}</Text>
              </Group>
            </Stack>

            <Divider my="sm" />
            <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg">
              {Array.from({ length: room.maxPlayers }).map((_, index) => {
                const player = room.players[index] || null;
                return (
                  <PlayerSlot
                    key={index}
                    player={player}
                    isHost={player?.playerId === room.hostId}
                    isCurrentUserTheHost={isHost}
                    onTransferHost={() =>
                      player && onTransferHost(player.playerId)
                    }
                  />
                );
              })}
            </SimpleGrid>
            <Divider my="md" />

            <Stack mt="md" gap="md">
              {isUserInRoom ? (
                <>
                  {isHost && (
                    <Button
                      variant="gradient"
                      gradient={{ from: "teal", to: "lime" }}
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
                    size="md"
                    fullWidth
                    onClick={() => onLeaveRoom(room.id, ws)}
                    leftSection={<IconLogout size={16} />}
                  >
                    Leave Room
                  </Button>
                </>
              ) : (
                <Group justify="flex-end">
                  <Button
                    variant="gradient"
                    gradient={{ from: "yellow", to: "orange" }}
                    size="md"
                    w={200}
                    onClick={openTopic}
                    disabled={!canJoin}
                  >
                    {canJoin ? "View Topic Story" : "Game In Progress"}
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
