"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email?: string;
  name?: string;
  image?: string;
}

export default function Home() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [user, setUser] = useState<User | null>(null);

  const handleSignOut = async () => {
    await authClient.signOut();
    router.refresh();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Hello World
            </h1>
            <p className="text-gray-600">Next.js + Better Auth Demo</p>
          </div>

          {session?.user ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-semibold">Auth State</p>
                <p className="text-gray-700 mt-2">
                  Logged as <span className="font-semibold">{session?.user.name || session?.user.email}</span>
                </p>
              </div>

              <button
                onClick={handleSignOut}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
              >
                Exit
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-center text-gray-700">
                You are not logged in
              </p>
              <Link
                href="/login"
                className="w-full inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 text-center"
              >
                Go to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
