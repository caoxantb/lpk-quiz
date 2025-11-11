import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export const testAtom = atomWithStorage(
  "test",
  Object.fromEntries(
    Array.from({ length: 6 }, (_, i) => [
      i + 1,
      {
        session1: "todo",
        session1StartTimestamp: "",
        session1EndTimestamp: "",
        session2: i !== 5 ? "todo" : null,
        session2StartTimestamp: "",
        session2EndTimestamp: "",
        duration: i === 5 ? 103.5 : 135,
        activeSession: 1,
      },
    ])
  )
);

export const viewResults = atom(false);
