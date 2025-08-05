// "use client";
//
// import React, {
//   createContext,
//   useContext,
//   useEffect,
//   useRef,
//   useState,
// } from "react";
//
// const WebSocketContext = createContext<WebSocket | null>(null);
//
// export const useWebSocket = () => {
//   return useContext(WebSocketContext);
// };
//
// export const WebSocketProvider = ({
//   children,
//   userId,
//   roomId,
// }: {
//   children: React.ReactNode;
//   userId: string;
//   roomId: string;
// }) => {
//   const [ws, setWs] = useState<WebSocket | null>(null);
//   const wsRef = useRef<WebSocket | null>(null);
//
//   useEffect(() => {
//     if (!userId || !roomId) return;
//
//     const queryParams = new URLSearchParams({ userId, roomId }).toString();
//     const socketUrl = `ws://localhost:6969/ws/general?${queryParams}`;
//
//     const socket = new WebSocket(socketUrl);
//     wsRef.current = socket;
//
//     socket.onopen = () => {
//       console.log("✅ WebSocket connected");
//     };
//
//     socket.onmessage = (event) => {
//       console.log("📨 Message received:", event.data);
//     };
//
//     socket.onclose = () => {
//       console.log("❌ WebSocket closed");
//     };
//
//     socket.onerror = (error) => {
//       console.error("💥 WebSocket error", error);
//     };
//
//     setWs(socket);
//
//     return () => {
//       socket.close();
//     };
//   }, [userId, roomId]);
//
//   return (
//     <WebSocketContext.Provider value={ws}>{children}</WebSocketContext.Provider>
//   );
// };
