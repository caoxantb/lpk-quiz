import { createBrowserRouter, RouterProvider } from "react-router";

import Home from "./components/home/Home.jsx";
import Test from "./components/test/Test.jsx";
import { useAtom, useSetAtom } from "jotai";
import { fetchQuestionsAtom, questionAtom } from "./stores/questions.js";
import { useEffect } from "react";
import { Toaster } from "sonner";
import { migrateData } from "./migrations/index.js";
import { testAtom } from "./stores/tests.js";
import { sortByCategory } from "./utils/categoryMap.js";

const LATEST_VERSION = "1.1.1";

migrateData[LATEST_VERSION]();

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/tests/:id",
    element: <Test />,
  },
]);

const App = () => {
  const fetchQuestions = useSetAtom(fetchQuestionsAtom);
  const [tests, setTests] = useAtom(testAtom);
  const [questions, setQuestions] = useAtom(questionAtom);

  useEffect(() => {
    const shouldCreateTest7 =
      Object.values(tests)
        .slice(0, 5)
        .every(
          (test) => test.session1 === "done" && test.session2 === "done"
        ) && tests[6].session1 === "done";

    const wrongQuestions = Object.entries(questions)
      .filter(([key]) => Number(key) < 7)
      .flatMap(([, list]) => list)
      .filter((q) => q.solution !== q.userChoice);

    const sortedWrongQuestions = sortByCategory(wrongQuestions).map(
      (q, idx) => {
        return {
          ...q,
          test: 7,
          qNo: idx + 1,
          session: 1,
          userChoice: undefined,
        };
      }
    );

    if (shouldCreateTest7 && !tests[7]) {
      setTests((prev) => ({
        ...prev,
        7: {
          session1: "todo",
          session1StartTimestamp: "",
          session1EndTimestamp: "",
          session1PauseSequences: [],
          session2: null,
          session2StartTimestamp: "",
          session2EndTimestamp: "",
          session2PauseSequences: [],
          duration: (sortedWrongQuestions.length * 135) / 90,
          activeSession: 1,
        },
      }));

      setQuestions((prev) => ({
        ...prev,
        7: sortedWrongQuestions,
      }));
    }
  }, [tests, setTests, questions, setQuestions]);

  useEffect(() => {
    fetchQuestions(); // runs only once, skips if data already exists in localStorage
  }, [fetchQuestions]);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-center" richColors />
    </>
  );
};

export default App;
