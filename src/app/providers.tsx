"use client";

import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import AuthProvider from "@/components/AuthProvider";
import { theme } from "../../theme";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <MantineProvider
            theme={theme}
            forceColorScheme="dark"
        >
            <Notifications />
            {/*<WebSocketProvider>*/}
            <AuthProvider>{children}</AuthProvider>
            {/*</WebSocketProvider>*/}
        </MantineProvider>
    );
}