export const getColor = (colorType) => {
  const palette = {
    correct: "bg-[#A8E6CF]",
    wrong: "bg-[#FF8B94]",
    flagged: "bg-[#FFF3B0]",
    finished: "bg-[#A0C4FF]",
    current: "bg-[#BDB2FF]",
  };

  return palette[colorType];
};
