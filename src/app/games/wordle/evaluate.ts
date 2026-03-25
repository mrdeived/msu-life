export type LetterState = "correct" | "present" | "absent";

export interface EvaluatedLetter {
  letter: string;
  state: LetterState;
}

/**
 * Evaluates a guess against the answer using standard Wordle rules.
 * Handles repeated letters correctly via two-pass matching.
 */
export function evaluateGuess(guess: string, answer: string): EvaluatedLetter[] {
  const result: EvaluatedLetter[] = guess.split("").map((letter) => ({
    letter,
    state: "absent" as LetterState,
  }));

  const answerPool = answer.split("");
  const guessPool = guess.split("");

  // Pass 1: mark correct positions
  for (let i = 0; i < answer.length; i++) {
    if (guessPool[i] === answerPool[i]) {
      result[i].state = "correct";
      answerPool[i] = "#";
      guessPool[i] = "*";
    }
  }

  // Pass 2: mark present (wrong position but exists in remaining pool)
  for (let i = 0; i < guess.length; i++) {
    if (guessPool[i] === "*") continue;
    const idx = answerPool.indexOf(guessPool[i]);
    if (idx !== -1) {
      result[i].state = "present";
      answerPool[idx] = "#";
    }
  }

  return result;
}
