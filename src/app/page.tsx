'use client';

import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import useStore from "@/lib/Zustand";
import { useRouter } from "next/navigation";

export default function Home() {
  const { isAuthenticated } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/Dashboard');
    }
  }, [isAuthenticated, router]);
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 dark:from-gray-900 dark:via-indigo-900 dark:to-purple-900 px-4">
      <div className="w-full max-w-lg bg-white/90 dark:bg-gray-900/90 rounded-3xl shadow-2xl border border-indigo-100 dark:border-indigo-800 p-10 flex flex-col items-center gap-6">
        <Image src="/logo.png" alt="Events2Go Logo" width={80} height={80} className="mb-2 drop-shadow-lg" />
        <h1 className="text-4xl font-extrabold text-indigo-700 dark:text-indigo-300 text-center">Events2Go Admin Panel</h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 text-center">
          Welcome to the internal control center for Events2Go, your all-in-one platform for managing movies, concerts, events, promotions, and more. This admin panel empowers your team to efficiently manage, monitor, and promote events—just like BookMyShow, but tailored for your organization.
        </p>
        <ul className="w-full text-left text-base text-gray-600 dark:text-gray-400 space-y-2 pl-4 list-disc">
          <li>Manage and approve events, movies, and concerts</li>
          <li>Oversee ticket sales and event analytics</li>
          <li>Promote featured events and offers</li>
          <li>Control user roles and permissions</li>
          <li>Monitor platform activity and revenue</li>
        </ul>
        <Link href="/login">
          <button className="mt-4 px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-full shadow-lg text-lg font-semibold transition-all duration-200">
            Go to Admin Login
          </button>
        </Link>
      </div>
      <p className="mt-8 text-xs text-white/70 text-center max-w-md">
        Note: This admin panel is for internal Events2Go team use only. If you are looking to book tickets, please visit the main Events2Go platform.
      </p>
    </div>
  );
}
