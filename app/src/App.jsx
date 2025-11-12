import { createBrowserRouter, RouterProvider } from "react-router";

import Home from "./components/home/Home.jsx";
import Test from "./components/test/Test.jsx";
import { useSetAtom } from "jotai";
import { fetchQuestionsAtom } from "./stores/questions.js";
import { useEffect } from "react";
import { Toaster } from "sonner";
import { migrateData } from "./migrations/index.js";

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
