import { writelog } from "../../utils";
import { IAssessment } from "../../models/Assessment";

export function compareMCQs(
  incomingMCQs: IAssessment["mcq"],
  existingMCQs: IAssessment["mcq"]
) {
  let score = 0;

  for (let i = 0; i < existingMCQs.length; i++) {
    const existingMCQ = existingMCQs[i];
    const incomingMCQ = incomingMCQs.find(
      (m) => m.question === existingMCQ.question
    );

    if (incomingMCQ && incomingMCQ.answer === existingMCQ.answer) {
      score++;
      incomingMCQs[i].incorrect = false;
    } else {
      incomingMCQs[i].incorrect = true;
    }
  }

  writelog(score + " / " + existingMCQs.length);

  const approved = score / existingMCQs.length == 1 ? true : false;

  return { approved, incomingMCQs };
}
