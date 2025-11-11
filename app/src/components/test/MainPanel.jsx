import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { testAtom } from "../../stores/tests";
import { useParams } from "react-router";
import { currentQuestion, questionAtom } from "../../stores/questions";
import { getCategoriesFromQuestions } from "../../utils/categoryMap";

const MainPanel = () => {
  console.log("run here");
  const { id } = useParams();
  const [testSuites, setTestSuites] = useAtom(testAtom);
  const questions = useAtomValue(questionAtom);
  const setCurrentIdx = useSetAtom(currentQuestion);

  const session = testSuites[id].activeSession;

  const questionList =
    session === 1
      ? questions[id]?.filter((q) => q.session === 1)
      : session === 2
      ? questions[id]?.filter((q) => q.session === 2)
      : questions[id];

  const categoryData = getCategoriesFromQuestions(questionList);

  return (
    <article className="flex flex-1 flex-col items-center justify-center gap-6 border-t border-slate-200 p-6 text-center lg:border-t-0">
      <div className="space-y-2">
        <h1 className="text-4xl font-semibold text-slate-900">Test {id}</h1>
        <p className="text-base font-medium uppercase tracking-[0.3em] text-slate-500">
          Session {session}
        </p>
      </div>

      <p className="max-w-2xl text-lg text-slate-700">
        This session walks through the full test flow, covering the required
        knowledge areas and expectations. Review the scope below before you
        begin.
      </p>

      <div className="max-w-xl border border-slate-200 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Categories
        </p>
        <ul className="mt-4 flex flex-wrap justify-center gap-3 text-sm font-medium text-slate-700">
          {categoryData.map((category) => (
            <li
              key={category.name}
              className="rounded-full border border-slate-200 px-4 py-1"
            >
              {category.name}
            </li>
          ))}
        </ul>
      </div>

      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
        DURATION: {testSuites[id].duration} mins
      </p>

      <button
        className="border border-blue-600 bg-blue-600 px-10 py-3 text-sm font-semibold uppercase cursor-pointer
                  tracking-[0.3em] text-white transition hover:bg-transparent hover:text-blue-600"
        type="button"
        onClick={() => {
          setTestSuites({
            ...testSuites,
            [id]: {
              ...testSuites[id],
              [session === 1 ? "session1" : "session2"]: "ongoing",
              [session === 1
                ? "session1StartTimestamp"
                : "session2StartTimestamp"]: Date.now(),
            },
          });
          setCurrentIdx(session === 1 ? 1 : 91);
        }}
      >
        Start Session {session}
      </button>

      {session === 2 && (
        <button
          className="border border-green-600 bg-green-600 px-10 py-3 text-sm font-semibold uppercase cursor-pointer
                    tracking-[0.3em] text-white transition hover:bg-transparent hover:text-blue-600"
          type="button"
          onClick={() => {
            setTestSuites({
              ...testSuites,
              [id]: {
                ...testSuites[id],
                activeSession: 1,
              },
            });
          }}
        >
          Review Session 1
        </button>
      )}
    </article>
  );
};

export default MainPanel;
