'use client';

import { useEffect, useState } from 'react';
import { Menu, Bell } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Separator } from './ui/separator';
import { ModeToggle } from './ThemToggle';
import { SearchBarWithIcon } from './Searchbar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useRouter } from 'next/navigation';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import useStore from '@/lib/Zustand';
import axiosInstance from '@/lib/axiosInstance';
import { toast } from 'sonner';
import { logoutUser } from '@/lib/auth';

type AppHeaderProps = {
  collapsed: boolean;
  toggleSidebar: () => void;
};

// Define the User type
type User = {
  id: string;
  username: string;
  role_name: string;
  email:string
  profile_picture: string;
};

// Function to fetch user details from your API using axios


export default function AppHeader({ toggleSidebar }: Readonly<AppHeaderProps>) {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Replace destructuring with selector
  const userId = useStore(state => state.userId);
  const router = useRouter();

  // Replace static import with dynamic import
  const DynamicBreadcrumb = dynamic(() => import('./BreadCrump'), { ssr: false });


  // Fetch user details with proper typing and error handling
  const fetchUserDetails = async (userId: string) => {
    try {
      const response = await axiosInstance.get(`/api/v1/admin/users/${userId}`);
      setUser(response.data.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError('Failed to fetch the user data');
      toast.error('Failed to fetch the user data');
    }
  };
  useEffect(() => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    fetchUserDetails(userId)
     
  }, [userId]);

  return (
    <header className="border-b border-gray-200 px-8 py-3 h-20 flex items-center justify-between shadow-sm sticky top-0 z-40 bg-white dark:bg-neutral-900">
      {/* Left section */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={toggleSidebar}
          className="text-gray-600 hover:text-purple-500 transition"
          aria-label="Toggle Sidebar"
        >
          <Menu size={20} />
        </button>

        <Separator orientation="vertical" className="hidden sm:block" />

        <div className="truncate max-w-[180px] sm:max-w-xs md:max-w-md">
          <DynamicBreadcrumb />
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-6">
        {/* <div className="hidden sm:block">
          <SearchBarWithIcon />
        </div> */}

        <button
          className="text-gray-600 hover:text-purple-500 transition cursor-pointer"
          aria-label="Notifications"
        >
          <Bell className="text-5xl" />
        </button>

        {/* <ModeToggle /> */}

        <div className="flex items-center space-x-2">
          {loading ? (
            <div className="text-xs text-gray-400 hidden sm:block">Loading...</div>
          ) : error ? (
            <div className="text-xs text-red-500 hidden sm:block">{error}</div>
          ) : user && (
            <>
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-sm font-medium">{user.username}</span>
                <span className="text-xs text-gray-400">{user.role_name}</span>
              </div>

              <div className="relative inline-block cursor-pointer">
                <DropdownMenu open={open} onOpenChange={setOpen}>
                  <DropdownMenuTrigger asChild>
                    <Avatar>
                      <AvatarImage src={user.profile_picture} alt={user.username} />
                      <AvatarFallback>{user.username ? user.username[0] : 'U'}</AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-40" align="end">
                    <DropdownMenuItem
                      onClick={() => router.push('/profile')}
                      className="cursor-pointer"
                    >
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => router.push('/Settings')}
                      className="cursor-pointer"
                    >
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={async () => {
                        try {
                          await logoutUser();
                        } catch (err) {
                          // Fallback: clear localStorage, Zustand, and redirect
                          try {
                            const { logout } = useStore.getState();
                            logout();
                            localStorage.removeItem('id');
                          } catch {}
                          toast.error('Logout failed with server, fallback logout applied.');
                          window.location.href = '/';
                        }
                      }}
                      className="cursor-pointer"
                    >
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
