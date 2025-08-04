"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Container, Title, SegmentedControl, Table, Avatar, Group, Text,
    Loader, Center, Paper, Stack, Box, Badge, AppShell, Button, useMantineColorScheme
} from '@mantine/core';
import { IconCrown, IconUser, IconArrowLeft } from '@tabler/icons-react';
import { getGlobalLeaderboard } from '@/services/user';
import { AppHeader } from '@/components/dashboard/AppHeader';
import { InteractiveBackground } from '@/components/dashboard/InteractiveBackground';
import classes from './Leaderboard.module.css';
import {LeaderboardPlayer} from "@/services/user/types";

const PodiumCard = ({ player, rank }: { player: LeaderboardPlayer, rank: number }) => {
    const rankColors: { [key: number]: string } = { 1: 'yellow', 2: 'gray', 3: 'orange' };
    const podiumClass: { [key: number]: string } = { 1: classes.firstPlace, 2: classes.secondPlace, 3: classes.thirdPlace };

    return (
        <Paper p="lg" radius="md" withBorder className={`${classes.podiumCard} ${podiumClass[rank]}`}>
            <Badge className={classes.rankBadge} color={rankColors[rank]} size="xl" circle>
                {rank}
            </Badge>
            <Stack align="center" gap="sm" mt="md">
                {rank === 1 && (
                    <Box className={classes.animatedCrown}>
                        <IconCrown size={40} color="#FFD700" />
                    </Box>
                )}
                <Avatar size={80} radius="50%"><IconUser size="2.5rem" /></Avatar>
                <Text fw={700} size="lg" ta="center">{player.username}</Text>
                <Text c="dimmed" size="sm">{player.email}</Text>
                <Badge variant="light" color="blue" size="lg">{player.score} Points</Badge>
            </Stack>
        </Paper>
    );
};

export default function LeaderboardPage() {
    const [players, setPlayers] = useState<LeaderboardPlayer[]>([]);
    const [filteredPlayers, setFilteredPlayers] = useState<LeaderboardPlayer[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const { colorScheme } = useMantineColorScheme();

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const data = await getGlobalLeaderboard();
                setPlayers(data);
                setFilteredPlayers(data);
            } catch (error) {
                console.error("Failed to load leaderboard");
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    useEffect(() => {
        if (filter === 'All') {
            setFilteredPlayers(players);
        } else {
            setFilteredPlayers(players.filter(p => p.classCode === filter));
        }
    }, [filter, players]);

    const top3 = filteredPlayers.slice(0, 3);
    const rest = filteredPlayers.slice(3);

    const rows = rest.map((player, index) => (
        <Table.Tr key={player.playerId}>
            <Table.Td><Text fw={500}>{index + 4}</Text></Table.Td>
            <Table.Td>
                <Group gap="sm">
                    <Avatar size={40} radius="50%" />
                    <Box>
                        <Text fw={500}>{player.username}</Text>
                        <Text size="xs" c="dimmed">{player.email}</Text>
                    </Box>
                </Group>
            </Table.Td>
            <Table.Td><Text fw={500}>{player.score}</Text></Table.Td>
        </Table.Tr>
    ));

    return (
        <>
            <InteractiveBackground colorScheme={colorScheme} />
            <AppShell header={{ height: 70 }} padding="md" styles={{ main: { backgroundColor: 'transparent' } }}>
                <AppHeader />
                <AppShell.Main>
                    <Container size="lg" py="xl">
                        <Stack align="center" gap="xl">
                            <Group justify="center" w="100%" pos="relative">
                                <Button
                                    component={Link}
                                    href="/dashboard"
                                    variant="subtle"
                                    color="gray"
                                    leftSection={<IconArrowLeft size={16} />}
                                    style={{ position: 'absolute', left: 0 }}
                                >
                                    Back to Dashboard
                                </Button>
                                <Title order={1}>Global Leaderboard</Title>
                            </Group>

                            <SegmentedControl
                                value={filter}
                                onChange={setFilter}
                                data={['All', 'Kelas A', 'Kelas B', 'Kelas C']}
                            />

                            {loading ? (
                                <Center h={400}><Loader /></Center>
                            ) : (
                                <Stack w="100%" gap="xl">
                                    <Group mt="xl" align="flex-end" gap="xl" grow preventGrowOverflow={false}>
                                        {top3[1] && <Box style={{ flex: 1 }}><PodiumCard player={top3[1]} rank={2} /></Box>}
                                        {top3[0] && <Box style={{ flex: 1 }}><PodiumCard player={top3[0]} rank={1} /></Box>}
                                        {top3[2] && <Box style={{ flex: 1 }}><PodiumCard player={top3[2]} rank={3} /></Box>}
                                    </Group>

                                    {rest.length > 0 && (
                                        <Table striped withTableBorder withColumnBorders mt="xl">
                                            <Table.Thead>
                                                <Table.Tr>
                                                    <Table.Th>Rank</Table.Th>
                                                    <Table.Th>Player</Table.Th>
                                                    <Table.Th>Score</Table.Th>
                                                </Table.Tr>
                                            </Table.Thead>
                                            <Table.Tbody>{rows}</Table.Tbody>
                                        </Table>
                                    )}
                                </Stack>
                            )}
                        </Stack>
                    </Container>
                </AppShell.Main>
            </AppShell>
        </>
    );
}