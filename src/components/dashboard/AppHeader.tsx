"use client";

import { signOut, useSession } from "next-auth/react";
import {
    AppShell, Title, Button, Menu, Avatar,
    Group, ActionIcon, useMantineColorScheme, Box, Text
} from '@mantine/core';
import { IconSun, IconMoonStars, IconLogout } from '@tabler/icons-react';

export function AppHeader() {
    const { data } = useSession();
    const { setColorScheme, colorScheme } = useMantineColorScheme();

    const glassStyle = {
        background: colorScheme === 'dark' ? 'rgba(26, 27, 30, 0.7)' : 'rgba(255, 255, 255, 0.6)',
        backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
    };

    return (
        <AppShell.Header p="md">
            <Group justify="space-between" h="100%">
                <Title order={3} c={colorScheme === 'dark' ? 'white' : 'black'} style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.2)' }}>
                    Monopoly Game
                </Title>
                <Group>
                    {/*!!! Buat ganti theme*/}
                    {/*<ActionIcon onClick={() => setColorScheme(colorScheme === 'dark' ? 'light' : 'dark')} size="lg" variant="outline" color={colorScheme === 'dark' ? 'yellow' : 'blue'}>*/}
                    {/*    {colorScheme === 'dark' ? <IconSun size="1.2rem" /> : <IconMoonStars size="1.2rem" />}*/}
                    {/*</ActionIcon>*/}
                    <Menu shadow="md" width={250} withArrow position="bottom-end">
                        <Menu.Target>
                            <Avatar src={data?.user?.image} alt="User Profile" radius="xl" style={{ cursor: 'pointer' }} />
                        </Menu.Target>
                        <Menu.Dropdown>
                            <Menu.Label>Profile</Menu.Label>
                            <Box p="md">
                                <Text fw={500}>{data?.user?.name}</Text>
                                <Text size="xs" c="dimmed">{data?.user?.email}</Text>
                            </Box>
                            <Menu.Divider />
                            <Menu.Item color="red" leftSection={<IconLogout size={16} />} onClick={() => signOut({ callbackUrl: "/" })}>
                                Logout
                            </Menu.Item>
                        </Menu.Dropdown>
                    </Menu>
                </Group>
            </Group>
        </AppShell.Header>
    );
}