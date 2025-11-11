import { readFile, writeFile } from "fs/promises";
import seedrandom from "seedrandom";

const readJSON = async (type, filename) => {
  try {
    const data = await readFile(
      `./data/extract/${type}/${filename}.json`,
      "utf-8"
    );
    const json = JSON.parse(data);
    return json;
  } catch (err) {
    console.error("Error reading file:", err);
  }
};

export const writeToJSON = async (type) => {
  const filenames = [
    "alt",
    "ci",
    "der",
    "eco",
    "equ",
    "eth",
    "fi",
    "fsa",
    "pm",
    "qua",
  ];

  try {
    await Promise.all(
      filenames.map(async (filename) => {
        let data;
        if (type === "questions") {
          data = await cleanQuestions(filename);
        } else if (type === "solutions") {
          data = await cleanSolutions(filename);
        }
        await writeFile(
          `./data/cleaned/${type}/${filename}.json`,
          JSON.stringify(data, null, 2),
          "utf-8"
        );
      })
    );
  } catch (err) {
    console.error(err);
  }
};

const cleanQuestions = async (filename) => {
  const data = await readJSON("questions", filename);

  const questions = data.slice(1).reduce((acc, line) => {
    const trimmed = line.trim();

    // skip multiple blank lines
    if (!trimmed) return acc;

    const questionMatch = trimmed.match(/^(\d+)[./]\s*(.*)/);
    const optionMatch = trimmed.match(/^[A-Z]\.\s*(.*)/);

    if (questionMatch) {
      const [_, id, text] = questionMatch;
      acc.push({
        id: `${filename.toUpperCase()}-${id}`,
        question: text.replace(/•/g, "\n•"),
        solutions: [],
      });
    } else if (optionMatch && acc.length) {
      acc[acc.length - 1].solutions.push({
        answer: optionMatch[1].replace(/\.$/, ""),
      });
    } else if (acc.length) {
      // preserve line breaks in question text
      acc[acc.length - 1].question += "\n" + trimmed;
    }

    return acc;
  }, []);

  return questions;
};

const cleanSolutions = async (filename) => {
  const data = await readJSON("solutions", filename);

  const answers = data.reduce((acc, line) => {
    const trimmed = line.trim();
    if (!trimmed) return acc;

    const idMatch = trimmed.match(/^(\d+)\.$/);
    const choiceMatch = trimmed.match(/^([A-Z])\.\s*(.*)/); // A., B., C., etc.
    const noteMatch = trimmed.match(/^([\w\s]+?):\s*(.*)$/);

    if (idMatch) {
      acc.push({
        id: `${filename.toUpperCase()}-${idMatch[1]}`,
        solutions: [],
        note: "",
      });
    } else if (choiceMatch && acc.length) {
      const [, choiceLetter, rest] = choiceMatch;
      const lower = rest.toLowerCase();

      const isCorrect =
        lower.includes("correct") && !lower.includes("incorrect");
      const reason = rest
        .replace(/^(Correct|Incorrect|correct|incorrect)\s*/i, "")
        .trim();

      acc[acc.length - 1].solutions.push({
        choiceLetter, // temp field for ordering
        isCorrect,
        reason,
      });
    } else if (noteMatch && acc.length) {
      const [_, category, text] = noteMatch;
      acc[acc.length - 1].note = `${category.trim()}: ${text.trim()}`;
    } else if (acc.length) {
      const lastQ = acc[acc.length - 1];
      const lastSolution = lastQ.solutions[lastQ.solutions.length - 1];
      if (lastSolution) lastSolution.reason += "\n" + trimmed;
    }

    return acc;
  }, []);

  // Normalize: always [A, B, C] order, drop letter
  answers.forEach((q) => {
    const letters = ["A", "B", "C"];
    const normalized = letters.map((l) => {
      const found = q.solutions.find((s) => s.choiceLetter === l);
      return found
        ? { isCorrect: found.isCorrect, reason: found.reason }
        : { isCorrect: false, reason: "" };
    });
    q.solutions = normalized;
  });

  return answers;
};

export const checkSolutions = async () => {
  const filenames = [
    "alt",
    "ci",
    "der",
    "eco",
    "equ",
    "eth",
    "fi",
    "fsa",
    "pm",
    "qua",
  ];

  try {
    const abnormals = await Promise.all(
      filenames.map(async (filename) => {
        const data = await readFile(
          `./data/cleaned/solutions/${filename}.json`,
          "utf-8"
        );
        const fileData = JSON.parse(data);

        return fileData.filter((data) => {
          return (
            data.solutions.length !== 3 ||
            data.solutions.filter((sol) => sol.isCorrect).length !== 1
          );
        });
      })
    );

    return abnormals;
  } catch (err) {
    console.error(err);
  }
};

export const checkQuestions = async () => {
  const filenames = [
    "alt",
    "ci",
    "der",
    "eco",
    "equ",
    "eth",
    "fi",
    "fsa",
    "pm",
    "qua",
  ];

  try {
    const abnormals = await Promise.all(
      filenames.map(async (filename) => {
        const data = await readFile(
          `./data/cleaned/questions/${filename}.json`,
          "utf-8"
        );
        const fileData = JSON.parse(data);

        return fileData.filter((data) => {
          return data.solutions.length !== 3;
        });
      })
    );

    return abnormals;
  } catch (err) {
    console.error(err);
  }
};

export const checkCorrelation = async () => {
  const filenames = [
    "alt",
    "ci",
    "der",
    "eco",
    "equ",
    "eth",
    "fi",
    "fsa",
    "pm",
    "qua",
  ];

  try {
    await Promise.all(
      filenames.map(async (filename) => {
        const questionData = JSON.parse(
          await readFile(`./data/cleaned/questions/${filename}.json`, "utf-8")
        ).map((data) => data.id);
        const solutionData = JSON.parse(
          await readFile(`./data/cleaned/solutions/${filename}.json`, "utf-8")
        ).map((data) => data.id);

        const arrays = [questionData, solutionData];

        // find longest array length
        const maxLen = Math.max(...arrays.map((a) => a.length));

        // transpose
        const rows = Array.from({ length: maxLen }, (_, i) =>
          arrays.map((a) => a[i] ?? "")
        );

        console.log(filename);
        console.table(rows);
        console.log("============");
      })
    );
  } catch (err) {
    console.error(err);
  }
};

export const combineData = async () => {
  const questionPerTest = {
    alt: 12,
    ci: 11,
    der: 13,
    eco: 13,
    equ: 24,
    eth: 27,
    fi: 21,
    fsa: 23,
    pm: 20,
    qua: 16,
  };

  const categoryOrder = [
    "ETH",
    "FSA",
    "CI",
    "ECO",
    "QUA",
    "EQU",
    "FI",
    "PM",
    "ALT",
    "DER",
  ];

  const final = (
    await Promise.all(
      Object.keys(questionPerTest).map(async (key) => {
        const rng = seedrandom(key);

        const fileData = await readFile(
          `./data/cleaned/solutions/${key}.json`,
          "utf-8"
        );
        const data = JSON.parse(fileData);
        const questions = data.map((q) => {
          return {
            id: q.id,
            category: key.toUpperCase(),
            solution: q.solutions.findIndex((s) => s.isCorrect),
          };
        });

        for (let i = questions.length - 1; i > 0; i--) {
          const j = Math.floor(rng() * (i + 1));
          [questions[i], questions[j]] = [questions[j], questions[i]];
        }

        const allocatedQuestions = questions.map((q, idx) => {
          const test = Math.min(Math.floor(idx / questionPerTest[key]) + 1, 6);

          return {
            ...q,
            test,
            session:
              test === 6 || ["eth", "fsa", "qua", "eco", "ci"].includes(key)
                ? 1
                : 2,
            qNo: idx,
          };
        });

        return allocatedQuestions;
      })
    )
  ).flat();

  await Promise.all(
    [1, 2, 3, 4, 5, 6].map(async (test) => {
      const testQuestions = final
        .filter((q) => q.test === test)
        .sort((a, b) => {
          const categoryDiff =
            categoryOrder.indexOf(a.category) -
            categoryOrder.indexOf(b.category);

          if (categoryDiff !== 0) return categoryDiff;
          return a.questionNo - b.questionNo;
        })
        .map((q, idx) => {
          return {
            ...q,
            qNo: idx + 1,
          };
        });

      await writeFile(
        `./data/final/${test}.json`,
        JSON.stringify(testQuestions, null, 2),
        "utf-8"
      );
    })
  );
};
