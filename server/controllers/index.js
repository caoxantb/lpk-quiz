import { readFile } from "fs/promises";

const readJSON = async (filename) => {
  try {
    const data = await readFile(filename, "utf-8");
    const json = JSON.parse(data);
    return json;
  } catch (err) {
    console.error("Error reading file:", err);
    return [];
  }
};

export const getAllQuestionsByTest = async (req, res) => {
  const { test } = req.params;

  try {
    const questions = await readJSON(`./data/final/${test}.json`);
    return res.status(200).json(questions);
  } catch (err) {
    return res.status(404).json([]);
  }
};

export const getQuestionById = async (req, res) => {
  const { id } = req.params;
  const { isReview } = req.query;
  const category = id.split("-")[0].toLowerCase();

  const questions = await readJSON(`./data/cleaned/questions/${category}.json`);
  const question = questions.find((q) => q.id === id);

  const tables = await readJSON(`./data/cleaned/tables/${category}.json`);
  const table = tables[id];

  if (!question) {
    return res.status(404).json({ error: "Question not found" });
  }

  let explanation;

  if (isReview === "true") {
    const explanations = await readJSON(
      `./data/cleaned/solutions/${category}.json`
    );
    explanation = explanations.find((ex) => ex.id === id);
  }

  const expandedQuestion = {
    id,
    question: question.question,
    solutions: question.solutions.map((sol, idx) => {
      const expla = explanation?.solutions?.[idx] || {};
      return { ...sol, ...expla };
    }),
    table,
    note: explanation?.note,
  };

  res.status(200).json(expandedQuestion);
};
