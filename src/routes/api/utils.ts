import { IAssessment } from '../../models/Assessment';
import { writelog } from '../../utils';

/**
 * Compare incoming MCQ answers to existing MCQ answers and calculate a score.
 * Set incorrect flag on incoming MCQs and return the score and approval status.
 *
 * @param incomingMCQs Array of incoming MCQs to compare
 * @param existingMCQs Array of existing MCQs to compare against
 * @returns Object with approval status and array of incoming MCQs with incorrect flag set
 */

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
