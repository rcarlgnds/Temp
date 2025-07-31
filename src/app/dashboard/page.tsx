"use client";
import React, { useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

const Dashboard = () => {
  const { data, status } = useSession();

  return status === "authenticated" ? (
    <div style={{ textAlign: "center" }}>
      <h1>Dashboard</h1>
      {data && (
        <>
          <div>{`Name : ${data.user?.name}`}</div>
          <div>{`Email : ${data.user?.email}`}</div>
        </>
      )}
      <button onClick={() => signOut({ callbackUrl: "/" })}>Log out</button>
    </div>
  ) : (
    <Link href="/">Log in</Link>
  );
};

export default Dashboard;
