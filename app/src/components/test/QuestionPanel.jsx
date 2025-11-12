import { useAtom } from "jotai";
import { useCallback, useEffect, useState } from "react";
import { currentQuestion, questionAtom } from "../../stores/questions";
import { useParams } from "react-router";
import axios from "axios";
import { testAtom } from "../../stores/tests";
import { getColor } from "../../utils/colors";
import { toast } from "sonner";
import { formatTime } from "../../utils/formatTime";
import { Skeleton } from "@/components/ui/skeleton";

const QuestionPanel = () => {
  const { id } = useParams();
  const [testSuites, setTestSuites] = useAtom(testAtom);
  const [questions, setQuestions] = useAtom(questionAtom);
  const [currentIdx, setCurrentIdx] = useAtom(currentQuestion);
  const [questionDetail, setQuestionDetail] = useState();
  const [timeLeft, setTimeLeft] = useState(8100);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  const testSuite = testSuites?.[id] ?? {};
  const activeSession = testSuites[id].activeSession;

  const durationMinutes = testSuite?.duration ?? 0;
  const startTimestampKey =
    activeSession === 1 ? "session1StartTimestamp" : "session2StartTimestamp";
  const sessionStartTimestamp =
    (startTimestampKey && testSuite?.[startTimestampKey]) || "";

  const questionList =
    activeSession === 1
      ? questions[id]?.filter((q) => q.session === 1)
      : activeSession === 2
      ? questions[id]?.filter((q) => q.session === 2)
      : questions[id] ?? [];

  const question = questionList.find((q) => q.qNo === currentIdx);

  const completedQuestions = questions[id].filter(
    (q) => q.userChoice !== undefined || q.flag
  ).length;

  const submit = useCallback(() => {
    setTestSuites((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [activeSession === 1 ? "session1" : "session2"]: "done",
        [activeSession === 1 ? "session1EndTimestamp" : "session2EndTimestamp"]:
          Date.now(),
        activeSession: activeSession === 1 && Number(id) !== 6 ? 2 : 0,
      },
    }));
    setShowSubmitConfirm(false);
    setCurrentIdx(0);
    timeLeft === 0
      ? toast.info("Time is up! Your test has been automatically submitted.")
      : toast.info("You have submitted your test.");
  }, [
    id,
    activeSession,
    setTestSuites,
    setShowSubmitConfirm,
    setCurrentIdx,
    timeLeft,
  ]);

  useEffect(() => {
    const durationSeconds = Math.max(Math.floor(durationMinutes * 60), 0);
    const sessionStart = sessionStartTimestamp
      ? new Date(sessionStartTimestamp).getTime()
      : null;

    const computeRemainingSeconds = () => {
      if (!sessionStart || Number.isNaN(sessionStart)) return durationSeconds;
      const elapsedSeconds = Math.floor((Date.now() - sessionStart) / 1000);
      return Math.max(durationSeconds - elapsedSeconds, 0);
    };

    setTimeLeft(computeRemainingSeconds());
    const interval = setInterval(() => {
      setTimeLeft(computeRemainingSeconds());
    }, 1000);

    return () => clearInterval(interval);
  }, [durationMinutes, sessionStartTimestamp]);

  useEffect(() => {
    const fetchQuestionDetail = async () => {
      setQuestionDetail(undefined);
      if (!question?.id) return;
      const res = await axios.get(
        `https://lpk-quiz.onrender.com/api/questions/${question.id}`
      );

      setQuestionDetail(res.data);
    };

    fetchQuestionDetail();
  }, [question?.id]);

  useEffect(() => {
    if (timeLeft === 0 && activeSession) submit();
  }, [timeLeft, activeSession, submit]);

  const currentQuestionIndex = questionList.findIndex(
    (q) => q.qNo === currentIdx
  );
  const hasPrevious = currentQuestionIndex > 0;
  const hasNext =
    currentQuestionIndex > -1 && currentQuestionIndex < questionList.length - 1;

  const handlePrevious = () => {
    if (!hasPrevious) return;
    const prevQuestion = questionList[currentQuestionIndex - 1];
    setCurrentIdx(prevQuestion.qNo);
  };

  const handleNext = () => {
    if (!hasNext) return;
    const nextQuestion = questionList[currentQuestionIndex + 1];
    setCurrentIdx(nextQuestion.qNo);
  };

  const toggleFlag = () => {
    if (!question) return;
    if (question.userChoice !== undefined)
      toast.error(
        "Please remove the chosen answer if you want to flag this question."
      );
    else {
      setQuestions({
        ...questions,
        [id]: questions[id].map((q) =>
          q.qNo === currentIdx ? { ...q, flag: q.flag ? undefined : true } : q
        ),
      });
    }
  };

  const flaggedColorClass = getColor("flagged");

  return (
    <article className="flex flex-1 flex-col gap-6 border-t border-slate-200 p-6 lg:border-t-0">
      <div className="flex flex-col gap-2 border border-slate-200 px-4 py-3 sm:flex-row sm:items-stretch sm:justify-between">
        <div className="sm:flex sm:flex-col sm:justify-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            Time remaining
          </p>
          <span className="text-4xl font-semibold text-slate-900">
            {formatTime(timeLeft)}
          </span>
        </div>
        <button
          className="border border-blue-500 bg-blue-500 px-6 py-2 text-s font-semibold uppercase tracking-[0.2em] cursor-pointer
                    text-white transition hover:border-blue-600 hover:bg-transparent hover:text-blue-600 sm:self-stretch sm:px-10"
          type="button"
          onClick={() => setShowSubmitConfirm(true)}
        >
          Submit
        </button>
      </div>

      {currentIdx !== 0 && (
        <div className="flex flex-1 flex-col gap-6 border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <button
              className="border cursor-pointer border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] 
                        text-slate-600 transition hover:border-slate-400 hover:bg-slate-50"
              disabled={!hasPrevious}
              onClick={handlePrevious}
              type="button"
            >
              {"<"} Previous
            </button>
            <button
              className="border cursor-pointer border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] 
                        text-slate-600 transition hover:border-slate-400 hover:bg-slate-50"
              disabled={!hasNext}
              onClick={handleNext}
              type="button"
            >
              Next {">"}
            </button>
          </div>

          <div className="relative border-2 border-slate-400 p-4">
            <div className="text-xs flex justify-between font-semibold uppercase tracking-[0.2em] text-slate-500">
              <div className="flex items-center gap-3">
                <p>Question {question.qNo}</p>
                <button
                  className={`left-4 bottom-4 border px-2 py-1 text-[0.6rem] tracking-[0.2em] transition cursor-pointer ${
                    question.flag
                      ? `${flaggedColorClass} border-transparent text-slate-800`
                      : "border-slate-300 text-slate-600 bg-white hover:border-slate-400"
                  }`}
                  onClick={toggleFlag}
                  type="button"
                >
                  {question.flag ? "Flagged" : "Flag"}
                </button>
              </div>
              <p>{question.id}</p>
            </div>
            {Array.isArray(questionDetail?.table) &&
              questionDetail.table.length > 0 && (
                <div className="mt-4 overflow-x-auto rounded border border-slate-200 bg-white">
                  <table className="w-full border-collapse text-left text-sm text-slate-700">
                    <tbody>
                      {questionDetail.table.map((row, rowIdx) => (
                        <tr
                          key={`question-table-row-${rowIdx}`}
                          className={rowIdx % 2 ? "bg-slate-50" : undefined}
                        >
                          {Array.isArray(row) &&
                            row.map((cell, cellIdx) => (
                              <td
                                key={`question-table-cell-${rowIdx}-${cellIdx}`}
                                className="border border-slate-200 px-3 py-2"
                              >
                                {cell}
                              </td>
                            ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            {questionDetail ? (
              <p className="mt-4 text-base font-semibold text-slate-800">
                {questionDetail.question}
              </p>
            ) : (
              <>
                <Skeleton className="mt-4 h-4 w-[90%]" />
                <Skeleton className="mt-4 h-4 w-[90%]" />
              </>
            )}
          </div>

          <div className="flex flex-col gap-4">
            {questionDetail
              ? questionDetail.solutions.map((sol, index) => {
                  return (
                    <button
                      key={index}
                      className={`border px-4 py-3 text-left transition cursor-pointer ${
                        question.userChoice === index
                          ? "border-blue-500 bg-blue-500 text-white"
                          : "border-slate-300 text-slate-800 hover:border-blue-400 hover:bg-blue-50"
                      }`}
                      onClick={() => {
                        if (question.flag) {
                          toast.error(
                            "Please remove the flag if you want to choose an answer."
                          );
                        } else {
                          setQuestions({
                            ...questions,
                            [id]: questions[id].map((q) =>
                              q.qNo === currentIdx
                                ? {
                                    ...q,
                                    userChoice:
                                      question.userChoice === index
                                        ? undefined
                                        : index,
                                  }
                                : q
                            ),
                          });
                        }
                      }}
                      type="button"
                    >
                      {String.fromCharCode(65 + index)}. {sol.answer}
                    </button>
                  );
                })
              : [1, 2, 3].map(() => {
                  return (
                    <div className="flex gap-2 border px-4 py-3 text-left transition cursor-pointer">
                      <Skeleton className="mt-2 h-4 w-4 rounded-full" />
                      <Skeleton className="mt-2 h-4 w-[90%]" />
                    </div>
                  );
                })}
          </div>
        </div>
      )}

      {showSubmitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="w-[min(90vw,32rem)] border-2 border-slate-900 bg-white px-10 py-8 text-center shadow-2xl">
            <p className="text-lg font-semibold text-slate-900">
              Are you sure you want to submit?
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Once submitted you cannot return to this session.
            </p>
            {completedQuestions < questionList.length && (
              <p className="mt-2 text-red-600 font-bold text-sm">
                Warning: You have not answer every question yet!
              </p>
            )}

            <div className="mt-6 flex gap-4">
              <button
                className="flex-1 border border-red-500 bg-red-500 px-4 py-4 text-sm font-semibold uppercase cursor-pointer
                            tracking-[0.2em] text-white transition hover:border-red-600 hover:bg-transparent hover:text-red-600"
                type="button"
                onClick={() => setShowSubmitConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="flex-1 border border-blue-500 bg-blue-500 px-4 py-4 text-sm font-semibold uppercase cursor-pointer
                          tracking-[0.2em] text-white transition hover:border-blue-600 hover:bg-transparent hover:text-blue-600"
                type="button"
                onClick={submit}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
};

export default QuestionPanel;
