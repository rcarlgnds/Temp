"use client";

import { MantineProvider } from "@mantine/core";
import AuthProvider from "@/components/AuthProvider";
import { theme } from "../../theme";
import {SocketProvider} from "@/context/SocketContext";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <MantineProvider theme={theme} defaultColorScheme="dark">
            <SocketProvider>
                <AuthProvider>{children}</AuthProvider>
            </SocketProvider>
        </MantineProvider>
    );
}