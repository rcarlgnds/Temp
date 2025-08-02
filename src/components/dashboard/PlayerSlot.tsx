"use client";

import React from 'react';
import { Paper, Stack, Avatar, Text, Badge, Box, MantineTheme } from "@mantine/core";
import { IconUser, IconPlus, IconCheck, IconX, IconCrown } from '@tabler/icons-react';
import {ApiPlayer} from "@/services/player/types";

interface PlayerSlotProps {
    player: ApiPlayer | null;
    isHost: boolean;
}

export function PlayerSlot({ player, isHost }: PlayerSlotProps) {
    if (!player) {
        return (
            <Stack
                align="center" justify="center" h="100%" gap="sm"
                style={(theme: MantineTheme) => ({
                    backgroundColor: 'rgba(26, 27, 30, 0.3)',
                    borderRadius: theme.radius.md,
                    border: `1px solid ${theme.colors.dark[5]}`,
                    minHeight: 220,
                })}
            >
                <Avatar size={80} radius="xl" color="dark.4">
                    <IconUser />
                </Avatar>
                <Text fz="lg" fw={700} c="dark.3">SLOT OPEN</Text>
            </Stack>
        );
    }

    const isReady = player.status === 'Ready';

    return (
        <Paper
            p="md"
            style={(theme: MantineTheme) => ({
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-around',
                height: '100%', minHeight: 220,
                backgroundColor: isReady ? 'rgba(8, 127, 91, 0.5)' : 'rgba(37, 38, 43, 0.5)',
                borderRadius: theme.radius.md,
                border: `1px solid ${isReady ? 'rgba(18, 184, 134, 0.8)' : 'rgba(55, 58, 64, 0.8)'}`,
                boxShadow: isReady ? `0 0 20px -2px rgba(18, 184, 134, 0.5)` : 'none',
                transition: 'all 0.3s ease',
            })}
        >
            <Avatar size={90} radius="50%">
                <IconUser />
                {isHost && (
                    <Box style={(theme: MantineTheme) => ({ position: 'absolute', top: -5, right: -5, color: theme.colors.yellow[5], filter: `drop-shadow(0 0 8px ${theme.colors.yellow[4]})` })}>
                        <IconCrown size={30} stroke={1.5} />
                    </Box>
                )}
            </Avatar>
            <Stack align="center" gap={4}>
                <Text fz="lg" fw={700} lineClamp={1}>{player.username}</Text>
                <Badge
                    size="lg" variant="filled" w="100%"
                    color={isReady ? 'teal' : 'gray'}
                    leftSection={isReady ? <IconCheck size={14} /> : <IconX size={14} />}
                >
                    {isReady ? 'Ready' : 'Waiting'}
                </Badge>
            </Stack>
        </Paper>
    );
}