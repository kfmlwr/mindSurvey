import React from "react";
import type { Response, Weight } from "@prisma/client";
import { useTRPC, type RouterOutputs } from "~/trpc/react";
import { useMutation } from "@tanstack/react-query";

type Pair = RouterOutputs["survey"]["getAdjectives"][number];

type ResultState = {
  adjective: Pair;
  response: Response | null;
  frequency: Weight | null;
};

export function useSurvey(adjectives: Pair[], inviteToken: string) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [direction, setDirection] = React.useState<"next" | "back">("next");
  const trpc = useTRPC();

  const initialResults: ResultState[] = adjectives.map((adjective) => ({
    adjective,
    response: null,
    frequency: null,
  }));

  const [surveyResults, setSurveyResults] =
    React.useState<ResultState[]>(initialResults);

  const totalAdjectives = adjectives.length;
  const current = surveyResults[currentIndex];
  const processPercentage = currentIndex / totalAdjectives;

  const postMutation = useMutation(
    trpc.survey.submitSurvey.mutationOptions({
      onSuccess: () => {
        // Handle successful submission, e.g., redirect or show a success message
      },
      onError: (error) => {
        // Handle error, e.g., show an error message
        console.error("Error submitting survey:", error);
      },
    }),
  );

  const updateCurrent = (
    response: Response | null,
    frequency: Weight | null,
  ) => {
    setSurveyResults((prev) =>
      prev.map((res, idx) =>
        idx === currentIndex ? { ...res, response, frequency } : res,
      ),
    );
  };

  const next = () => {
    if (currentIndex < totalAdjectives - 1) {
      setDirection("next");
      setCurrentIndex((prev) => prev + 1);
    } else {
      const responsesToSubmit = surveyResults.map((result) => ({
        adjectiveId: result.adjective.id,
        response: result.response as "POSITIVE" | "NEGATIVE",
        weight: result.frequency as "LOW" | "HIGH",
      }));
      postMutation.mutate({ inviteToken, responses: responsesToSubmit });
    }
  };

  const back = () => {
    if (currentIndex > 0) {
      setDirection("back");
      setCurrentIndex((prev) => prev - 1);
    }
  };

  return {
    current,
    currentIndex,
    direction,
    processPercentage,
    totalAdjectives,
    updateCurrent,
    next,
    back,
    surveyResults,
  };
}
