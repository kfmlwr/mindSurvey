import type { Answer, Pairs } from "@prisma/client";

type AnswerWithPair = Answer & {
  pair: Pairs;
};

export const calculateResult = (answers: AnswerWithPair[]) => {
  let xCoordinate = 0;
  let yCoordinate = 0;

  answers.forEach((answer) => {
    const { pair, weight, response } = answer;

    const numericWeight = weight === "HIGH" ? 1 : 0.5;

    const isPositiveResponse = response === "POSITIVE";

    const xValue = isPositiveResponse ? pair.positive_x : pair.negative_x;
    const yValue = isPositiveResponse ? pair.positive_y : pair.negative_y;

    xCoordinate += xValue * numericWeight;
    yCoordinate += yValue * numericWeight;
  });

  return {
    x: xCoordinate / answers.length,
    y: yCoordinate / answers.length,
  };
};
