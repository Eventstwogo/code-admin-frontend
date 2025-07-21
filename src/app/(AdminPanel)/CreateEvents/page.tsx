"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const CreateEventPage = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to BasicInfo page
    router.push('/CreateEvents/BasicInfo');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to event creation...</p>
      </div>
    </div>
  );
};

export default CreateEventPage;