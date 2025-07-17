'use client';

import { useEffect, useState } from 'react';
import AppSidebar from '@/components/app-sidebar'
import AppHeader from '@/components/Header';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const toggleSidebar = () => setCollapsed((prev) => !prev);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 930;
      setIsMobile(mobile);
      setCollapsed(mobile); // hide on mobile initially
    };

    checkMobile(); // run on mount
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className={`relative flex h-screen overflow-hidden    ${isMobile?'':'bg-[#111827]'}`}>
      {/* Mobile backdrop */}
      {isMobile && !collapsed && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <AppSidebar
        collapsed={collapsed}
        hidden={isMobile && collapsed}
        isMobile={isMobile}
      />

      {/* Main Area */}
      <div className={`flex-1 flex flex-col overflow-auto   ${isMobile?'':'bg-white shadow-sm  dark:bg-neutral-900'} `}>
        <AppHeader collapsed={collapsed} toggleSidebar={toggleSidebar} />
        <main className="flex-1 p-6 sm:p-3">{children}</main>
      </div>
    </div>
  );
}


