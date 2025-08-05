// "use client";
//
// import React, { createContext, useContext, useEffect, useState } from 'react';
// import { useSession } from 'next-auth/react';
//
// const WebSocketContext = createContext<WebSocket | null>(null);
//
// export const useWebSocket = () => {
//     return useContext(WebSocketContext);
// };
//
// export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
//     const { data: session, status } = useSession();
//     const [ws, setWs] = useState<WebSocket | null>(null);
//
//     useEffect(() => {
//         if (status === "authenticated" && session?.user?.id) {
//             const wsUrl = `ws://localhost:6969/ws/general?userId=${session.user.id}`;
//             const socket = new WebSocket(wsUrl);
//
//             socket.onopen = () => {
//                 console.log("Global WebSocket Connected");
//                 setWs(socket);
//             };
//
//             socket.onclose = () => {
//                 console.log("Global WebSocket Disconnected");
//                 setWs(null);
//             };
//
//             return () => {
//                 socket.close();
//             };
//         }
//     }, [status, session]);
//
//     return (
//         <WebSocketContext.Provider value={ws}>
//             {children}
//         </WebSocketContext.Provider>
//     );
// };