import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "../../global.css";

import React from "react";
import { ColorSchemeScript } from "@mantine/core";
import { Providers } from "./providers";

export const metadata = {
    title: "Monopoly Kingdom",
    description: "Your Monopoly adventure awaits!",
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning={true}>
        <head>
            <ColorSchemeScript defaultColorScheme="dark" />
        </head>
        <body>
        <Providers>{children}</Providers>
        </body>
        </html>
    );
}