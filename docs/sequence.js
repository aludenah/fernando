import {answerCount} from './model.js';

export function hasAnswer(question, answers = {}) {
  const value = answers[question.id];
  return Object.hasOwn(answers, question.id) && Number.isInteger(value) && value >= 0 && value < question.options.length;
}

// Existing answers are kept, including work saved before sequential practice.
// A gap always stops access to later questions until it is answered.
export function questionSequence(task, answers = {}) {
  const total = task.questions.length;
  const answered = answerCount(task, answers);
  const firstPending = task.questions.findIndex(question => !hasAnswer(question, answers));
  const complete = firstPending === -1;
  const unlockedThrough = complete ? total - 1 : firstPending;
  return {total, answered, complete, firstPending, unlockedThrough, resumeAt: unlockedThrough, percent: Math.round(answered / total * 100)};
}

export function canOpenQuestion(task, answers, index) {
  return Number.isInteger(index) && index >= 0 && index <= questionSequence(task, answers).unlockedThrough;
}
