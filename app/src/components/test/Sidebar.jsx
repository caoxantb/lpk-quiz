import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useState } from "react";
import { testAtom, viewResults } from "../../stores/tests";
import { currentQuestion, questionAtom } from "../../stores/questions";
import { useParams } from "react-router";
import { getCategoriesFromQuestions } from "../../utils/categoryMap";
import { getColor } from "../../utils/colors";
import { toast } from "sonner";

const Sidebar = () => {
  const { id } = useParams();
  const [testSuites, setTestSuites] = useAtom(testAtom);
  const questions = useAtomValue(questionAtom);
  const [currentIdx, setCurrentIdx] = useAtom(currentQuestion);
  const setViewResult = useSetAtom(viewResults);

  const session = testSuites[id].activeSession;

  const isReview =
    (testSuites[id].session1 === "done" && session === 1) ||
    (testSuites[id].session2 === "done" && session === 2) ||
    session === 0;

  const questionList =
    session === 1
      ? questions[id]?.filter((q) => q.session === 1)
      : session === 2
      ? questions[id]?.filter((q) => q.session === 2)
      : questions[id];

  const categoryData = getCategoriesFromQuestions(questionList);

  const completedQuestions = questionList.filter(
    (q) => q.userChoice !== undefined || q.flag
  ).length;

  const [openSections, setOpenSections] = useState(() =>
    categoryData.map((category) => category.id)
  );
  const totalQuestions = questionList.length;

  const progressPercentage = Math.round(
    (completedQuestions / Math.max(totalQuestions, 1)) * 100
  );

  const toggleSection = (id) => {
    setOpenSections((current) =>
      current.includes(id)
        ? current.filter((sectionId) => sectionId !== id)
        : [...current, id]
    );
  };

  return (
    <aside className="space-y-6 border-b border-slate-200 p-6 lg:max-h-[calc(100vh)] lg:overflow-y-auto lg:border-b-0 lg:border-r">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
          Test {id} {session !== 0 ? `- Session ${session}` : ""}
        </p>
        {!isReview ? (
          <div className="mt-3 space-y-1">
            <div className="flex items-center justify-between text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-slate-500">
              <span>Progress</span>
              <span>
                {completedQuestions}/{totalQuestions}
              </span>
            </div>
            <div className="h-1 bg-slate-200">
              <div
                className="h-full bg-emerald-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-3">
            {session === 1 && testSuites[id].session2 !== "done" && (
              <button
                type="button"
                className="border border-blue-400 bg-blue-400 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] cursor-pointer 
                        text-white transition hover:bg-transparent hover:text-blue-400"
                onClick={() =>
                  setTestSuites({
                    ...testSuites,
                    [id]: {
                      ...testSuites[id],
                      activeSession: 2,
                    },
                  })
                }
              >
                View Session 2
              </button>
            )}

            <button
              type="button"
              className="border border-blue-400 bg-blue-400 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] cursor-pointer 
                        text-white transition hover:bg-transparent hover:text-blue-400"
              onClick={() => setViewResult(true)}
            >
              View Results
            </button>
          </div>
        )}
      </div>

      {categoryData.map((category) => {
        const isOpen = openSections.includes(category.id);
        return (
          <div key={category.id}>
            <button
              className="flex w-full items-center gap-2 justify-between border-b border-slate-200 pb-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-700"
              onClick={() => toggleSection(category.id)}
              type="button"
            >
              <span>{category.name}</span>
              <span className="text-xs text-slate-400 cursor-pointer">
                {isOpen ? "Hide" : "Show"}
              </span>
            </button>
            <div
              className={`grid overflow-hidden transition-all duration-300 ease-out ${
                isOpen
                  ? "mt-4 grid-cols-2 gap-1 sm:grid-cols-3 sm:gap-1.5 lg:grid-cols-6 lg:gap-2"
                  : "max-h-0 grid-cols-2 gap-0"
              }`}
            >
              {isOpen &&
                category.questions.map((q) => (
                  <span
                    key={q.qNo}
                    onClick={
                      testSuites[id].session1 !== "ongoing" &&
                      testSuites[id].session2 !== "ongoing" &&
                      !isReview
                        ? () =>
                            toast.error(
                              "Please start the session to view the question"
                            )
                        : () => {
                            setViewResult(false);
                            setCurrentIdx(q.qNo);
                          }
                    }
                    className={`flex cursor-pointer aspect-square items-center justify-center
                                ${
                                  currentIdx === q.qNo
                                    ? getColor("current")
                                    : q.userChoice !== undefined && !isReview
                                    ? getColor("finished")
                                    : q.flag
                                    ? getColor("flagged")
                                    : q.userChoice === q.solution && isReview
                                    ? getColor("correct")
                                    : q.userChoice !== q.solution && isReview
                                    ? getColor("wrong")
                                    : ""
                                }
                                border border-slate-300 text-xs font-semibold text-slate-700`}
                  >
                    {q.qNo}
                  </span>
                ))}
            </div>
          </div>
        );
      })}
    </aside>
  );
};

export default Sidebar;
