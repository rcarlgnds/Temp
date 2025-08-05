"use client";

import { MantineProvider } from "@mantine/core";
import AuthProvider from "@/components/AuthProvider";
import { theme } from "../../theme";
// import { WebSocketProvider } from "@/context/SocketContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MantineProvider theme={theme} defaultColorScheme="dark">
      {/* <WebSocketProvider roomId="test1" userId="user123"> */}
      <AuthProvider>{children}</AuthProvider>
      {/* </WebSocketProvider> */}
    </MantineProvider>
  );
}
