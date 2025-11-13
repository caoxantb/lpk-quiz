import { useAtomValue } from "jotai";
import MainPanel from "./MainPanel";
import QuestionPanel from "./QuestionPanel";
import Sidebar from "./Sidebar";
import { testAtom, viewResults } from "../../stores/tests";
import { useParams } from "react-router";
import SolutionPanel from "./SolutionPanel";
import ResultPanel from "./ResultPanel";

const Test = () => {
  const { id } = useParams();
  const testSuites = useAtomValue(testAtom);
  console.log(testSuites);
  const resultView = useAtomValue(viewResults);

  const session = testSuites[id]?.activeSession;

  return (
    testSuites[id] && (
      <section className="min-h-screen lg:grid lg:grid-cols-[20%_1fr] lg:gap-8">
        <Sidebar />

        {(testSuites[id].session1 === "todo" && session === 1) ||
        (testSuites[id].session2 === "todo" && session === 2) ? (
          <MainPanel />
        ) : resultView &&
          testSuites[id].session1 !== "ongoing" &&
          testSuites[id].session2 !== "ongoing" ? (
          <ResultPanel />
        ) : (testSuites[id].session1 === "done" && session === 1) ||
          (testSuites[id].session2 === "done" && session === 2) ||
          session === 0 ? (
          <SolutionPanel />
        ) : (
          <QuestionPanel />
        )}
      </section>
    )
  );
};

export default Test;
