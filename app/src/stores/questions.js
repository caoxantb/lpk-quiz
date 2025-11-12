import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import axios from "axios";

const loadInitialQuestions = () => {
  try {
    const saved = localStorage.getItem("question");
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

export const questionAtom = atomWithStorage(
  "questions",
  loadInitialQuestions()
);

export const fetchQuestionsAtom = atom(
  (get) => get(questionAtom),
  async (get, set) => {
    const existingData = get(questionAtom);

    // if we already have data in localStorage, skip fetch
    if (existingData && Object.keys(existingData).length > 0) return;

    try {
      const ids = Array.from({ length: 6 }, (_, i) => i + 1);

      const responses = await Promise.all(
        ids.map((id) =>
          axios.get(`https://lpk-quiz.onrender.com/api/tests/${id}`)
        )
      );

      // create the object with ids as keys
      const allData = Object.fromEntries(
        responses.map((res, i) => [ids[i], res.data])
      );

      set(questionAtom, allData);
      localStorage.setItem("question", JSON.stringify(allData)); // persist manually
    } catch (err) {
      console.error("Failed to fetch test data:", err);
    }
  }
);

export const currentQuestion = atomWithStorage("currentIdx", 0);
