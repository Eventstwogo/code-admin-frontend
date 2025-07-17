'use client';

import {
  LayoutDashboard,
  Users,
  DollarSign,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useState } from 'react';
import {
  Tooltip,
  TooltipProvider,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type NavItem = {
  label: string;
  icon: React.ElementType;
  href?: string;
  children?: { label: string; href: string }[];
};

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/Dashboard' },
  { label: 'Users', icon: Users, href: '/Users' },
  {
    label: 'Categories',
    icon: Users,
    href:'/Categories'
  },
  {
    label: 'Roles',
    icon: Users,
    href:'/Roles'
  },
  { label: 'Revenue', icon: DollarSign, href: '/Revenue' },
];

export default function AppSidebar({
  collapsed,
  isMobile,
}: {
  collapsed: boolean;
  hidden?: boolean;
  isMobile?: boolean;
}) {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

const isLinkActive = (item: NavItem) => {
  if (item.href && pathname === item.href) return true;
  if (item.children) {
    return item.children.some((child) => pathname.startsWith(child.href));
  }
  return false;
};


  return (
    <aside
      className={`
        h-full z-50 shadow-lg flex flex-col
        transition-all duration-300 ease-in-out
        ${collapsed ? 'w-20' : 'w-64'}
        ${isMobile ? 'fixed top-0 left-0' : 'md:static'}
        ${isMobile && collapsed ? '-translate-x-full' : 'translate-x-0'}
        bg-white dark:bg-neutral-900 border-r border-gray-200 dark:border-neutral-800
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-center py-4 border-b border-gray-200 dark:border-neutral-800 gap-4 bg-gradient-to-r from-purple-50/80 to-white dark:from-neutral-900 dark:to-neutral-950">
        <Image src="/logo.png" alt="Events2Go" height={40} width={40} className="rounded-lg shadow-md" />
        <h1
          className={`text-xl font-bold text-purple-600 dark:text-purple-400 transition-all ${
            collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
          }`}
        >
          Events2Go
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto bg-transparent">
        {navItems.map((item) => {
          const active = isLinkActive(item);
          const Icon = item.icon;
          const isDropdownOpen = openMenus[item.label];

          return (
            <div key={item.label}>
              {item.children ? (
                <button
                  onClick={() => toggleMenu(item.label)}
                  className={`flex items-center w-full p-2 rounded-lg text-sm font-medium transition-all group focus:outline-none focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-700 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-neutral-900 ${
                    active
                      ? 'bg-purple-600/90 text-white shadow-md dark:bg-purple-700'
                      : 'hover:bg-purple-100 dark:hover:bg-neutral-800/60 text-gray-700 dark:text-gray-300'
                  }`}
                  aria-label={collapsed ? item.label : undefined}
                >
                  <Icon className="w-5 h-5 mr-2 shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>
                      {isDropdownOpen ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </>
                  )}
                </button>
              ) : (
                <SidebarLink
                  collapsed={collapsed}
                  href={item.href!}
                  label={item.label}
                  icon={item.icon}
                  active={active}
                />
              )}

              {/* Submenu */}
              {!collapsed &&
                isDropdownOpen &&
                item.children?.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    className={`ml-8 block text-sm p-2 mt-2 rounded-md transition focus:outline-none focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-700 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-neutral-900 ${
                      pathname === child.href
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-800 dark:text-white shadow'
                        : 'hover:bg-purple-50 dark:hover:bg-neutral-800/40 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    {child.label}
                  </Link>
                ))}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}

type SidebarLinkProps = {
  href: string;
  label: string;
  icon: React.ElementType;
  active: boolean;
  collapsed: boolean;
};

function SidebarLink({
  href,
  label,
  icon: Icon,
  active,
  collapsed,
}: SidebarLinkProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={href}
          className={`flex items-center p-3 rounded-lg text-sm font-medium transition-all group focus:outline-none focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-700 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-neutral-900 ${
            active
              ? 'bg-purple-600/90 text-white shadow-md dark:bg-purple-700'
              : 'hover:bg-purple-100 dark:hover:bg-neutral-800/60 text-gray-700 dark:text-gray-300'
          }`}
        >
          <Icon className="w-5 h-5 mr-2 shrink-0" />
          {!collapsed && <span>{label}</span>}
        </Link>
      </TooltipTrigger>
      {collapsed && <TooltipContent side="right">{label}</TooltipContent>}
    </Tooltip>
  );
}
