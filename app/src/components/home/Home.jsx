import { useAtomValue } from "jotai";
import { useState } from "react";
import { testAtom } from "../../stores/tests";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import LockIcon from "../icons/Lock";
import CheckIcon from "../icons/Check";
import Stats from "./Stats";
import SunIcon from "../icons/Sun";

function Home() {
  const testSuites = useAtomValue(testAtom);
  const navigate = useNavigate();
  const [showStats, setShowStats] = useState(false);

  const testVisuals = Object.values(testSuites);
  const activeIndex = testVisuals.findIndex(
    (s) =>
      s.session1 === "ongoing" ||
      (s.session1 === "done" && s.session2 === "todo") ||
      s.session2 === "ongoing"
  );

  if (showStats) {
    return <Stats onBack={() => setShowStats(false)} />;
  }

  return (
    <section className="min-h-screen px-[10%] py-16">
      <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
        <header className="mb-16 max-w-3xl space-y-4">
          <h3 className="flex items-center justify-center gap-2 text-xl font-semibold text-slate-900">
            <span>Welcome back, Linh Phan Khanh</span>
            <SunIcon className="h-8 w-8" />
          </h3>
          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
            Choose a path to get started
          </h1>
          <p className="text-base text-slate-600 sm:text-lg">
            Pick one of the modules below to continue your quiz journey. Each
            card represents a curated learning path.
          </p>
        </header>
        <div className="grid w-full grid-cols-3 gap-10">
          {testVisuals.map((card, idx) => {
            const finished =
              card.session1 === "done" &&
              (card.session2 === "done" || idx === 5);

            return (
              <button
                key={idx + 1}
                className="group relative flex cursor-pointer aspect-square items-center justify-center rounded-3xl border border-indigo-100 
                          bg-slate-100/80 text-6xl font-semibold text-slate-900 shadow-sm transition hover:-translate-y-1 hover:border-indigo-200 
                          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200"
                type="button"
                onClick={() => {
                  finished || activeIndex === idx || activeIndex === -1
                    ? navigate(`tests/${idx + 1}`)
                    : toast.error(
                        "This test is locked because you have an ongoing test suite 🔒"
                      );
                }}
              >
                <span>{idx + 1}</span>
                {activeIndex !== -1 || finished ? (
                  <span
                    className={`pointer-events-none absolute inset-0 flex flex-col items-center justify-center rounded-3xl transition ${
                      finished
                        ? "bg-emerald-100/80 text-emerald-600"
                        : activeIndex !== idx
                        ? "bg-white/70 text-slate-500 group-hover:bg-white/80"
                        : ""
                    }`}
                  >
                    {finished ? (
                      <CheckIcon className="h-10 w-10" />
                    ) : activeIndex !== idx ? (
                      <LockIcon className="h-10 w-10" />
                    ) : (
                      <></>
                    )}
                  </span>
                ) : (
                  <></>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-14 flex w-full justify-center">
          <button
            type="button"
            className="border border-blue-500 bg-blue-500 px-8 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition 
                      hover:border-blue-600 hover:bg-transparent hover:text-blue-600 cursor-pointer"
            onClick={() => setShowStats(true)}
          >
            View performance stats
          </button>
        </div>
      </div>
    </section>
  );
}

export default Home;
