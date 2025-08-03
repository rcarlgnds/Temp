"use client";

import React, { useState } from 'react';
import { Paper, Stack, Avatar, Text, Badge, Box, MantineTheme, useMantineColorScheme } from "@mantine/core";
import {
    IconUser, IconShield, IconAxe, IconWand,
    IconMask, IconSword, IconCrown
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
}

export function PlayerSlot({ player, isHost }: PlayerSlotProps) {
    const { colorScheme } = useMantineColorScheme();
    const [isHovered, setIsHovered] = useState(false);

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

    const PlayerIcon = skinIcons[player.skin] || IconUser;
    const playerColor = skinColors[player.skin] || 'gray';

    const paperStyle = (theme: MantineTheme): React.CSSProperties => ({
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-around',
        height: '100%',
        minHeight: 220,
        backgroundColor: colorScheme === 'dark' ? 'rgba(37, 38, 43, 0.5)' : 'rgba(230, 230, 230, 0.5)',
        borderRadius: theme.radius.md,
        border: `1px solid ${theme.colors.dark[4]}`,
        cursor: 'pointer',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        transform: isHovered ? 'translateY(-5px) scale(1.03)' : 'none',
        boxShadow: isHovered ? `0 10px 25px ${theme.colors[playerColor][8]}40` : 'none',
    });

    return (
        <Paper
            p="md"
            style={paperStyle}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Box style={{ position: 'relative', width: 90, height: 90 }}>
                <Avatar size={90} radius="50%" color={playerColor}>
                    <PlayerIcon size="3.5rem" />
                </Avatar>
                {isHost && (
                    <Box style={(theme: MantineTheme) => ({
                        position: 'absolute',
                        top: -12,
                        right: -12,
                        color: theme.colors.yellow[5],
                        filter: `drop-shadow(0 0 8px ${theme.colors.yellow[4]})`,
                        transform: 'rotate(45deg)'
                    })}>
                        <IconCrown size={32} stroke={1.5} />
                    </Box>
                )}
            </Box>

            <Stack align="center" gap={4} mt="sm">
                <Text fz="lg" fw={700} lineClamp={1}>{player.username}</Text>
                <Badge size="lg" variant="light" color="teal">
                    Ready
                </Badge>
            </Stack>
        </Paper>
    );
}