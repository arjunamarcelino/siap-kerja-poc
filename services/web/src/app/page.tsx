import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-center gap-8 px-8 py-16">
        <h1 className="text-5xl font-bold tracking-tight text-black dark:text-zinc-50">
          SiapKerja
        </h1>
        <p className="max-w-md text-center text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          AI-powered Career Navigation based on Real Job Market Demand.
          Bridge the gap between your skills and your dream career.
        </p>
        <div className="flex gap-4">
          <Link
            href="/login"
            className="flex h-12 items-center justify-center rounded-full bg-foreground px-8 text-background font-medium transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
          >
            Get Started
          </Link>
        </div>
      </main>
    </div>
  );
}
