import { useAtom, useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { currentQuestion, questionAtom } from "../../stores/questions";
import { useParams } from "react-router";
import axios from "axios";
import { testAtom } from "../../stores/tests";
import { getColor } from "../../utils/colors";

const SolutionPanel = () => {
  const { id } = useParams();
  const testSuites = useAtomValue(testAtom);
  const questions = useAtomValue(questionAtom);
  const [currentIdx, setCurrentIdx] = useAtom(currentQuestion);
  const [questionDetail, setQuestionDetail] = useState();

  const activeSession = testSuites[id].activeSession;

  const questionList =
    activeSession === 1
      ? questions[id]?.filter((q) => q.session === 1)
      : activeSession === 2
      ? questions[id]?.filter((q) => q.session === 2)
      : questions[id] ?? [];

  const question = questionList.find((q) => q.qNo === currentIdx);

  const isCorrect = question?.solution === question?.userChoice;

  useEffect(() => {
    const fetchQuestionDetail = async () => {
      if (!question?.id) return;
      const res = await axios.get(
        `http://localhost:8080/api/questions/${question?.id}?isReview=true`
      );

      setQuestionDetail(res.data);
    };

    fetchQuestionDetail();
  }, [question]);

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

  const flaggedColorClass = getColor("flagged");

  return (
    <article className="flex flex-1 flex-col gap-6 border-t border-slate-200 p-6 lg:border-t-0">
      {questionDetail && currentIdx !== 0 && (
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
                <p>Question {question?.qNo}</p>
                <button
                  className={`left-4 bottom-4 border px-2 py-1 text-[0.6rem] tracking-[0.2em] transition cursor-pointer ${
                    question?.flag
                      ? `${flaggedColorClass} border-transparent text-slate-800`
                      : "border-slate-300 text-slate-600 bg-white hover:border-slate-400"
                  }`}
                  type="button"
                >
                  {question?.flag ? "Flagged" : "Flag"}
                </button>
              </div>
              <p>{question?.id}</p>
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
            <p className="mt-2 text-base font-semibold text-slate-800">
              {questionDetail.question}
            </p>
          </div>
          <p
            className={`font-bold ${
              isCorrect
                ? "text-green-700"
                : question?.flag
                ? "text-yellow-700"
                : "text-red-700"
            }`}
          >
            {isCorrect
              ? "Your answer is correct!"
              : question?.flag
              ? "You flagged this question."
              : question?.userChoice === undefined
              ? "You left your answer blank."
              : `Your answer is incorrect. You chose ${String.fromCharCode(
                  65 + question?.userChoice
                )}, the correct answer is ${String.fromCharCode(
                  65 + question?.solution
                )}.`}
          </p>
          <div className="flex flex-col gap-4">
            {questionDetail?.solutions.map((sol, index) => {
              return (
                <>
                  <div
                    key={index}
                    className={`border px-4 py-3 text-left transition cursor-pointer ${
                      question?.solution === index
                        ? "border-green-700 bg-green-700 text-white"
                        : "border-red-700 bg-red-700 text-white"
                    }`}
                    type="button"
                  >
                    {String.fromCharCode(65 + index)}. {sol.answer}
                  </div>
                  <div
                    className={`${
                      question?.solution === index
                        ? "text-green-700"
                        : "text-red-700"
                    } text-sm mt-1`}
                  >
                    {sol.reason}
                  </div>
                </>
              );
            })}
          </div>
        </div>
      )}
    </article>
  );
};

export default SolutionPanel;
