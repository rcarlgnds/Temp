"use client";

import { MantineProvider } from "@mantine/core";
import AuthProvider from "@/components/AuthProvider";
import { theme } from "../../theme";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MantineProvider theme={theme} defaultColorScheme="dark">
        {/*<WebSocketProvider>*/}
      <AuthProvider>{children}</AuthProvider>
       {/*</WebSocketProvider>*/}
    </MantineProvider>
  );
}
