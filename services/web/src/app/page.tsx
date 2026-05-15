import Link from "next/link";

function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur-lg dark:border-slate-800/60 dark:bg-slate-950/80">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-slate-900 dark:text-white"
        >
          Siap<span className="text-blue-600">Kerja</span>
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          <a
            href="#features"
            className="text-sm text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="text-sm text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            How It Works
          </a>
        </div>
        <Link
          href="/register"
          className="rounded-full bg-blue-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          Get Started
        </Link>
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 px-6 py-24 md:py-32 lg:py-40">
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <div className="absolute -top-24 right-1/4 h-96 w-96 rounded-full bg-blue-500 blur-[128px]" />
        <div className="absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-indigo-500 blur-[128px]" />
      </div>
      <div className="relative mx-auto max-w-4xl text-center">
        <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-blue-400">
          AI-Powered Career Navigation
        </p>
        <h1 className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
          Navigate Your Career{" "}
          <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            with AI
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-300 md:text-xl">
          Upload your CV, discover your skill gaps, and get a personalized
          roadmap to your dream career — powered by real job market data.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/register"
            className="inline-flex h-12 items-center rounded-full bg-blue-600 px-8 text-base font-semibold text-white shadow-lg shadow-blue-600/30 transition-all hover:bg-blue-500 hover:shadow-blue-500/40"
          >
            Get Started Free
          </Link>
          <a
            href="#features"
            className="inline-flex h-12 items-center rounded-full border border-slate-600 px-8 text-base font-medium text-slate-300 transition-colors hover:border-slate-400 hover:text-white"
          >
            Learn More
          </a>
        </div>
      </div>
    </section>
  );
}

function Stats() {
  const stats = [
    { value: "9M+", label: "Digital talents needed in Indonesia by 2030" },
    { value: "600K", label: "New digital workers required each year" },
    { value: "Real-Time", label: "Job market data powering your roadmap" },
  ];

  return (
    <section className="border-b border-slate-200 bg-white px-6 py-12 dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="text-3xl font-bold text-blue-600 md:text-4xl">
              {stat.value}
            </p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Problems() {
  const problems = [
    {
      icon: (
        <svg
          className="h-7 w-7"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
          />
        </svg>
      ),
      title: "Directionless Learning",
      description:
        "Generic roadmaps ignore your existing strengths, leading to redundant learning and endless 'tutorial hell.'",
    },
    {
      icon: (
        <svg
          className="h-7 w-7"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.745 3.745 0 011.043 3.296A3.745 3.745 0 0121 12z"
          />
        </svg>
      ),
      title: "Lack of Validation",
      description:
        "Traditional self-learning lacks feedback loops, leaving you uncertain about your actual industry readiness.",
    },
    {
      icon: (
        <svg
          className="h-7 w-7"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-1.757l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"
          />
        </svg>
      ),
      title: "Disconnected Outcomes",
      description:
        "You finish courses only to discover they don't meet the specific requirements of active job listings.",
    },
  ];

  return (
    <section className="bg-slate-50 px-6 py-20 dark:bg-slate-900 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white md:text-4xl">
            The Skill-Gap Paradox
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
            Fresh graduates and career switchers face three major hurdles that
            keep them from landing their dream jobs.
          </p>
        </div>
        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          {problems.map((problem) => (
            <div
              key={problem.title}
              className="rounded-2xl border border-slate-200 bg-white p-8 dark:border-slate-700 dark:bg-slate-800"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400">
                {problem.icon}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
                {problem.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {problem.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  const features = [
    {
      icon: (
        <svg
          className="h-7 w-7"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z"
          />
        </svg>
      ),
      title: "Intelligent Skill Gap Analysis",
      description:
        "Upload your CV and select your target career. Our AI analyzes your existing competencies, identifies transferable skills, and maps out exactly what you need to learn based on real job listings.",
    },
    {
      icon: (
        <svg
          className="h-7 w-7"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z"
          />
        </svg>
      ),
      title: "Personalized Learning Roadmap",
      description:
        "Get a customized roadmap tailored to your background. We prioritize only the most relevant skills with milestones, progress tracking, and AI-generated practice challenges.",
    },
    {
      icon: (
        <svg
          className="h-7 w-7"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z"
          />
        </svg>
      ),
      title: "Dynamic Job Recommendations",
      description:
        "As you progress, we continuously recommend active job openings that match your evolving skill profile and readiness level — connecting learning directly to employment.",
    },
  ];

  return (
    <section
      id="features"
      className="bg-white px-6 py-20 dark:bg-slate-950 md:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
            Features
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white md:text-4xl">
            How SiapKerja Helps You
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
            From CV analysis to job placement — an end-to-end AI-powered career
            navigation system.
          </p>
        </div>
        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-8 transition-shadow hover:shadow-lg dark:border-slate-700 dark:bg-slate-900"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                {feature.icon}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Upload Your CV",
      description:
        "Upload your CV and tell us your dream career. We extract your skills, experience, and background automatically.",
    },
    {
      step: "02",
      title: "AI Analyzes Your Skills",
      description:
        "Our AI cross-references your profile with real-time job market data to identify transferable skills, gaps, and the closest achievable career path.",
    },
    {
      step: "03",
      title: "Follow Your Roadmap",
      description:
        "Get a personalized learning roadmap with prioritized topics, milestones, and AI-generated micro-challenges to validate your progress.",
    },
    {
      step: "04",
      title: "Land Your Dream Job",
      description:
        "As your skills grow, we recommend active job openings that match your readiness level — turning your learning into real employment.",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="bg-slate-50 px-6 py-20 dark:bg-slate-900 md:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
            How It Works
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white md:text-4xl">
            Your Journey to Career Readiness
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
            Four simple steps from where you are to where you want to be.
          </p>
        </div>
        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div key={step.step} className="flex flex-col">
              <span className="text-5xl font-bold text-blue-600/20 dark:text-blue-400/20">
                {step.step}
              </span>
              <h3 className="mt-3 text-lg font-semibold text-slate-900 dark:text-white">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="bg-gradient-to-br from-blue-600 to-indigo-700 px-6 py-20 md:py-28">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
          Ready to Start Your Career Journey?
        </h2>
        <p className="mt-4 text-lg text-blue-100">
          Join SiapKerja and get a personalized career roadmap based on real job
          market demand. Your dream career is closer than you think.
        </p>
        <Link
          href="/register"
          className="mt-8 inline-flex h-12 items-center rounded-full bg-white px-8 text-base font-semibold text-blue-700 shadow-lg transition-all hover:bg-blue-50"
        >
          Get Started Free
        </Link>
        <p className="mt-4 text-sm text-blue-200">
          Free to get started. No credit card required.
        </p>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white px-6 py-12 dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
          <div>
            <p className="text-lg font-bold text-slate-900 dark:text-white">
              Siap<span className="text-blue-600">Kerja</span>
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              AI-powered Career Navigation based on Real Job Market Demand
            </p>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            &copy; 2026 SiapKerja. Built by Team Susah Banget Cari Kerja
            Sekarang.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <div className="flex flex-1 flex-col font-sans">
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <Problems />
        <Features />
        <HowItWorks />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
