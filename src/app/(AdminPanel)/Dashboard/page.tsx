"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LayoutGrid,
  Users,
  ShoppingCart,
  ArrowRight,
  Settings,
  Ticket,
  BarChart3,
  CalendarCheck,
} from "lucide-react";

const DashboardPage = () => {
  const stats = [
    {
      title: "Categories",
      icon: <LayoutGrid className="w-5 h-5 text-indigo-600" />,
      description: "Manage all ticket categories",
      href: "/Categories",
    },
    {
      title: "Users",
      icon: <Users className="w-5 h-5 text-green-600" />,
      description: "View and manage all users",
      href: "/Users",
    },
    {
      title: "Revenue",
      icon: <ShoppingCart className="w-5 h-5 text-yellow-600" />,
      description: "Track ticket sales and earnings",
      href: "/Revenue",
    },
    {
      title: "Settings",
      icon: <Settings className="w-5 h-5 text-gray-600" />,
      description: "System configuration and preferences",
      href: "/Settings",
    },

  ];

  return (
    <main className=" mx-auto px-4 py-10 space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold text-gray-800">Dashboard</h1>
        <p className="text-sm text-gray-500">Overview of your ticket booking system</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((item) => (
          <Card
            key={item.title}
            className="hover:shadow-md transition-shadow duration-300 border border-gray-200"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-medium">{item.title}</CardTitle>
              {item.icon}
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">{item.description}</p>
              <Link href={item.href}>
                <Button variant="outline" className="w-full flex items-center justify-between">
                  Go to {item.title} <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
};

export default DashboardPage;

