"use client";

import React, { useState } from 'react';
import { Paper, Stack, Avatar, Text, Badge, Box, MantineTheme, useMantineColorScheme, Menu, ActionIcon, Tooltip, Chip } from "@mantine/core";
import {
    IconUser, IconShield, IconAxe, IconWand,
    IconMask, IconSword, IconCrown, IconCopy, IconCheck,
    IconDotsVertical, IconUserStar, IconCircleCheck, IconCircleDashed
} from '@tabler/icons-react';
import { ApiPlayer } from "@/services/player/types";

const skinIcons: { [key: string]: React.ElementType } = {
    "Knight": IconShield,
    "Barbarian": IconAxe,
    "Mage": IconWand,
    "Rogue": IconMask,
    "Assassin": IconSword,
};

const skinColors: { [key: string]: string } = {
    "Knight": "red",
    "Barbarian": "blue",
    "Mage": "grape",
    "Rogue": "orange",
    "Assassin": "green",
};

interface PlayerSlotProps {
    player: ApiPlayer | null;
    isHost: boolean;
    isCurrentUserTheHost: boolean;
    onTransferHost: () => void;
    currentUserId: string | undefined;
}

export function PlayerSlot({ player, isHost, isCurrentUserTheHost, onTransferHost, currentUserId }: PlayerSlotProps) {
    const { colorScheme } = useMantineColorScheme();
    const [isHovered, setIsHovered] = useState(false);
    const [codeCopied, setCodeCopied] = useState(false);

    if (!player) {
        return (
            <Stack align="center" justify="center" h="100%" gap="sm" style={(theme: MantineTheme) => ({
                backgroundColor: 'rgba(26, 27, 30, 0.3)',
                borderRadius: theme.radius.md,
                border: `1px dashed ${theme.colors.dark[4]}`,
                minHeight: 220,
            })}>
                <Avatar size={80} radius="xl" color="dark.4"><IconUser /></Avatar>
                <Text fz="lg" fw={700} c="dark.3">SLOT OPEN</Text>
            </Stack>
        );
    }

    const isOwner = player?.playerId === currentUserId;

    const handleCodeCopy = () => {
        if (!player.playerCode) return;
        navigator.clipboard.writeText(player.playerCode);
        setCodeCopied(true);
        setTimeout(() => setCodeCopied(false), 2000);
    };

    const PlayerIcon = skinIcons[player.skin || ''] || IconUser;
    const playerColor = skinColors[player.skin || ''] || 'gray';

    const paperStyle = (theme: MantineTheme): React.CSSProperties => ({
        position: 'relative',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'space-between', padding: theme.spacing.md,
        height: '100%', minHeight: 240,
        backgroundColor: colorScheme === 'dark' ? 'rgba(37, 38, 43, 0.5)' : 'rgba(230, 230, 230, 0.5)',
        borderRadius: theme.radius.md,
        border: `1px solid ${theme.colors.dark[4]}`,
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        transform: isHovered ? 'translateY(-5px) scale(1.03)' : 'none',
        boxShadow: isHovered ? `0 10px 25px ${theme.colors[playerColor][8]}40` : 'none',
    });

    return (
        <Paper
            style={paperStyle}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {isCurrentUserTheHost && !isHost && (
                <Menu shadow="md" width={200} position="bottom-end" withArrow>
                    <Menu.Target>
                        <ActionIcon variant="subtle" color="gray" style={{ position: 'absolute', top: 12, right: 12, zIndex: 2 }}>
                            <IconDotsVertical size={20} />
                        </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                        <Menu.Label>Host Actions</Menu.Label>
                        <Menu.Item
                            leftSection={<IconUserStar size={14} />}
                            onClick={(e) => { e.stopPropagation(); onTransferHost(); }}
                        >
                            Make Host
                        </Menu.Item>
                    </Menu.Dropdown>
                </Menu>
            )}

            <Box style={{ position: 'relative', width: 90, height: 90 }} mt="sm">
                <Avatar size={90} radius="50%" color={playerColor}>
                    <PlayerIcon size="3.5rem" />
                </Avatar>
                {isHost && (
                    <Box style={(theme: MantineTheme) => ({
                        position: 'absolute', top: -12, right: -12,
                        color: theme.colors.yellow[5],
                        filter: `drop-shadow(0 0 8px ${theme.colors.yellow[4]})`,
                        transform: 'rotate(45deg)'
                    })}>
                        <IconCrown size={32} stroke={1.5} />
                    </Box>
                )}
            </Box>

            <Stack align="center" gap={2}>
                <Text fz="lg" fw={700} lineClamp={1}>{player.username}</Text>
                <Text c="dimmed" size="xs">{player.email}</Text>

                {isOwner ? (
                    <Tooltip label={codeCopied ? "Code Copied!" : "Click to copy your code"} withArrow>
                        <Badge
                            variant="light"
                            color={codeCopied ? "teal" : "blue"}
                            mt="sm"
                            size="xl"
                            leftSection={codeCopied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                            onClick={handleCodeCopy}
                            style={{ cursor: 'pointer', userSelect: 'none' }}
                        >
                            {player.playerCode || 'No Code'}
                        </Badge>
                    </Tooltip>
                ) : (
                    <Badge
                        variant="light"
                        color={'green'}
                        mt="sm"
                        size="xl"
                        leftSection={<IconCircleCheck size={14} />}
                    >
                        {'Ready'}
                    </Badge>
                )}
            </Stack>
        </Paper>
    );
}