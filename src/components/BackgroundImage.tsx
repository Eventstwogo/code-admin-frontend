import Image from "next/image";

export default function BackgroundImage() {
  return (
    <>
      <Image
        src="/events_landing_view.png"
        alt="Background"
        fill
        priority={typeof window !== 'undefined' && window.innerWidth > 768}
        className="object-cover z-0 opacity-70 dark:opacity-60"
        placeholder="blur"
        blurDataURL="/logo1.png"
      />
      {/* Gradient overlay for vibrancy */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 dark:from-gray-900 dark:via-indigo-900 dark:to-purple-900 opacity-40 z-20" />
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-black/10 dark:bg-black/30 z-30" />
    </>
  );
} 