'use client';

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Button } from "./ui/button";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          MyDashboardApp
        </Link>
        <div className="flex items-center gap-4">
          {!session ? (
            <>
              <Link href="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/register">
                <Button>Register</Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <p>Welcome, {session.user?.name}</p>
              <Button onClick={() => signOut({ callbackUrl: '/' })}>Logout</Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
