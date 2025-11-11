import { useAtomValue } from "jotai";
import { useParams } from "react-router";
import { testAtom } from "../../stores/tests";
import { questionAtom } from "../../stores/questions";

const templateStats = [
  {
    label: "Right Answers / Total Questions",
    value: "-- / --",
  },
  {
    label: "Time Finished",
    value: "--:--",
  },
];

const formatDuration = (ms) => {
  if (typeof ms !== "number" || Number.isNaN(ms) || ms <= 0) return "--:--";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts = [hours, minutes, seconds].map((part) =>
    String(part).padStart(2, "0")
  );

  return parts.join(":");
};

const ResultPanel = () => {
  const { id } = useParams();
  const testSuites = useAtomValue(testAtom);
  const questions = useAtomValue(questionAtom);
  const testSuite = testSuites[id];
  const questionSet = questions[id] ?? [];

  const buildSessionResult = (sessionNumber) => {
    if (!testSuite) return null;

    if (sessionNumber === 2 && Number(id) === 6)
      return { rightAnswers: 0, totalQuestions: 0, durationMs: 1 };

    const sessionKey = sessionNumber === 1 ? "session1" : "session2";
    const sessionStatus = testSuite[sessionKey];

    if (sessionStatus !== "done") return null;

    const sessionQuestions = questionSet.filter(
      (q) => q.session === sessionNumber
    );
    const unflagged = sessionQuestions.filter((q) => !q.flag);
    const rightAnswers = unflagged.filter(
      (q) => q.userChoice === q.solution
    ).length;
    const totalQuestions = unflagged.length;

    const start = Number(testSuite[`${sessionKey}StartTimestamp`]);
    const end = Number(testSuite[`${sessionKey}EndTimestamp`]);
    const durationMs =
      Number.isFinite(end - start) && end - start > 0 ? end - start : null;

    return { rightAnswers, totalQuestions, durationMs };
  };

  const session1Result = buildSessionResult(1);
  const session2Result = buildSessionResult(2);

  console.log(session1Result);
  console.log(session2Result);

  const finalResult =
    session1Result && session2Result
      ? {
          rightAnswers:
            session1Result.rightAnswers + session2Result.rightAnswers,
          totalQuestions:
            session1Result.totalQuestions + session2Result.totalQuestions,
          durationMs: session1Result.durationMs + session2Result.durationMs,
        }
      : null;

  const sections = [
    { title: "Session 1 Result", result: session1Result },
    { title: "Session 2 Result", result: session2Result },
    { title: "Final Result", result: finalResult },
  ];

  const getStatsForSection = (result) =>
    result
      ? [
          {
            label: "Right Answers / Total Questions",
            value: `${result.rightAnswers} / ${result.totalQuestions}`,
          },
          {
            label: "Time Finished",
            value: formatDuration(result.durationMs),
          },
        ]
      : templateStats;

  return (
    <article className="flex flex-1 flex-col gap-6 border-t border-slate-200 p-6 lg:border-t-0">
      {sections.map(({ title, result }) => (
        <section
          key={title}
          className="space-y-4 border border-slate-200 p-6 shadow-sm"
        >
          <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-600">
            {title}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {getStatsForSection(result).map(({ label, value }) => (
              <div
                key={`${title}-${label}`}
                className="flex flex-col gap-4 border border-slate-200 bg-slate-50 px-6 py-5 text-center"
              >
                <p className="text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-slate-500">
                  {label}
                </p>
                <p className="text-4xl font-semibold text-slate-900">{value}</p>
              </div>
            ))}
          </div>
        </section>
      ))}
    </article>
  );
};

export default ResultPanel;
