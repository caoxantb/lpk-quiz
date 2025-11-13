export const getCategoriesFromQuestions = (questionList) => {
  if (!questionList || !Array.isArray(questionList)) return [];
  return Object.values(
    questionList?.reduce((acc, cur) => {
      if (!acc[cur.category]) {
        acc[cur.category] = {
          id: Object.keys(acc).length + 1,
          name: categoryMap(cur.category),
          questions: [],
        };
      }

      acc[cur.category].questions.push(cur);
      return acc;
    }, {})
  );
};

export const sortByCategory = (questionList) => {
  const categories = [
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

  return questionList.sort((a, b) => {
    return categories.indexOf(a.category) - categories.indexOf(b.category);
  });
};

export const categoryMap = (abbreviation) => {
  const fullNames = {
    ALT: "Alternative Investments",
    CI: "Corporate Issuers",
    DER: "Derivatives",
    ECO: "Economics",
    EQU: "Equity Investments",
    ETH: "Ethical and Professional Standards",
    FI: "Fixed Income",
    FSA: "Financial Statement Analysis",
    PM: "Portfolio Management",
    QUA: "Quantitative Methods",
  };

  return fullNames[abbreviation];
};
