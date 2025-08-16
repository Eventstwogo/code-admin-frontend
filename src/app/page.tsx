'use client';

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import useStore from "@/lib/Zustand";
import { useRouter } from "next/navigation";

// Feature icons component


export default function Home() {
  const { isAuthenticated } = useStore();
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/Dashboard');
    }
    setIsLoaded(true);
  }, [isAuthenticated, router]);

  const features = [
    { icon: "🎬", text: "Manage and approve events, movies, and concerts" },
    { icon: "📊", text: "Oversee ticket sales and comprehensive analytics" },
    { icon: "🎯", text: "Promote featured events and special offers" },
    { icon: "👥", text: "Control user roles and access permissions" },
    { icon: "💰", text: "Monitor platform activity and revenue streams" },
    { icon: "🔧", text: "Configure system settings and preferences" }
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 dark:from-gray-900 dark:via-indigo-900 dark:to-purple-900 px-4 py-8">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className={`w-full max-w-2xl bg-white/95 dark:bg-gray-900/95 rounded-3xl shadow-2xl border border-indigo-100 dark:border-indigo-800 p-8 md:p-12 flex flex-col items-center gap-8 backdrop-blur-sm transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        
        {/* Logo and Header */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Image 
              src="/logo1.png" 
              alt="Events2Go Logo" 
              width={100} 
              height={100} 
              className="drop-shadow-2xl transition-transform duration-300 hover:scale-110" 
            />
            <div className="absolute -inset-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full blur opacity-20 animate-pulse"></div>
          </div>
          
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Events2Go
            </h1>
            <h2 className="text-2xl md:text-3xl font-bold text-indigo-700 dark:text-indigo-300">
              Admin Control Center
            </h2>
          </div>
        </div>

        {/* Description */}
        <div className="text-center max-w-xl">
          <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
            Welcome to your comprehensive event management platform. Streamline operations, boost engagement, and drive success with our powerful administrative tools designed specifically for modern event management.
          </p>
        </div>

        {/* Features Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature, index) => (
            <div 
              key={index}
              className={`flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:scale-105 transition-all duration-300 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="text-2xl">{feature.icon}</div>
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                {feature.text}
              </span>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <Link href="/login" className="flex-1">
            <button className="w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-2xl shadow-xl text-lg font-bold transition-all duration-300 hover:shadow-2xl hover:scale-105 transform">
              <span className="flex items-center justify-center gap-2">
                🚀 Access Admin Panel
              </span>
            </button>
          </Link>
        </div>

        {/* Stats or Additional Info */}
        <div className="grid grid-cols-3 gap-6 w-full max-w-md text-center">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">24/7</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">Support</span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">100%</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">Secure</span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-pink-600 dark:text-pink-400">∞</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">Events</span>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className={`mt-8 text-center transition-all duration-1000 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
        <p className="text-sm text-white/80 max-w-lg leading-relaxed">
          🔒 <strong>Secure Access:</strong> This admin panel is exclusively for authorized Events2Go team members. 
          For ticket bookings, please visit our main platform.
        </p>
      </div>
    </div>
  );
}
