"use client";

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, Stack, Box, Group, Text, Button, useMantineColorScheme, Tooltip, ActionIcon, Title, Divider, MantineTheme } from '@mantine/core';
import { IconUsers, IconTrash, IconCopy, IconCheck, IconFileDescription, IconUserCircle } from '@tabler/icons-react';
import { Room } from "@/services/room/types";

interface RoomCardProps {
    room: Room;
    onJoin: (roomId: string) => void;
    onDelete: (roomId: string) => void;
}

export function RoomCard({ room, onJoin, onDelete }: RoomCardProps) {
    const { data: session } = useSession();
    const { colorScheme } = useMantineColorScheme();
    const [copied, setCopied] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const isHost = session?.user?.id === room.hostId;
    const isFull = room.playersCount >= room.maxPlayers;

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(room.id);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    const cardStyle = (theme: MantineTheme) => ({
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        background: colorScheme === 'dark' ? 'rgba(30, 30, 40, 0.6)' : 'rgba(255, 255, 255, 0.6)',
        backdropFilter: 'blur(12px)',
        borderColor: colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[3],
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        transform: isHovered ? 'translateY(-5px)' : 'none',
        boxShadow: isHovered ? theme.shadows.lg : 'none',
    });

    return (
        <Card
            p="lg"
            radius="md"
            withBorder
            style={cardStyle}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Stack justify="space-between" style={{ flexGrow: 1 }}>
                <Box>
                    <Group justify="space-between" align="flex-start">
                        <Tooltip label={copied ? "ID Copied!" : "Click title to copy Room ID"} withArrow>
                            <Group
                                gap="xs"
                                onClick={handleCopy}
                                style={{ cursor: 'pointer' }}
                            >
                                <Title
                                    order={3}
                                    lineClamp={2}
                                    c={copied ? 'teal.5' : 'medievalGold.4'}
                                >
                                    {room.name}
                                </Title>
                                {copied ? <IconCheck size={20} color="teal" /> : <IconCopy size={20} />}
                            </Group>
                        </Tooltip>

                        {isHost && (
                            <Tooltip label="Delete Room" withArrow>
                                <ActionIcon
                                    variant="subtle"
                                    color="red"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete(room.id);
                                    }}
                                >
                                    <IconTrash size={20} />
                                </ActionIcon>
                            </Tooltip>
                        )}
                    </Group>

                    <Stack gap={4} mt="md">
                        <Group gap="xs" c="dimmed">
                            <IconUserCircle size={16} />
                            <Text size="xs">Created by: {isHost ? "You" : room.hostId}</Text>
                        </Group>
                        <Group gap="xs" c="dimmed">
                            <IconFileDescription size={16} />
                            <Text size="xs">Topic: {room.topicName}</Text>
                        </Group>
                    </Stack>
                </Box>

                <Box>
                    <Divider my="sm" />
                    <Group justify="space-between">
                        <Group gap="xs" c="dimmed">
                            <IconUsers size={20} />
                            <Text size="sm" fw={500}>{room.playersCount} / {room.maxPlayers}</Text>
                        </Group>
                        <Button
                            mt="2px"
                            size="compact-md"
                            variant="light"
                            onClick={() => onJoin(room.id)}
                            disabled={isFull}
                            style={{ fontSize: '13px' }}
                        >
                            {isFull ? "Full" : "View Room"}
                        </Button>
                    </Group>
                </Box>
            </Stack>
        </Card>
    );
}