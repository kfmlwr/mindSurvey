"use client";
import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";

export default function SurveyPage() {
  const [selectedAdjective, setSelectedAdjective] = useState<string | null>(
    null,
  );
  const [selectedFrequency, setSelectedFrequency] = useState<string | null>(
    null,
  );

  const positiveAdjective = "Decisive";
  const negativeAdjective = "Indecisive";
  const frequencies = ["Usually", "Sometimes", "Sometimes", "Usually"];

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <Progress value={30} />
          <p className="text-sm text-gray-500">10% abgeschlossen</p>
        </div>

        {/* Survey Card */}
        <Card className="rounded-lg bg-white shadow-sm">
          <CardContent>
            {/* Header */}
            <div className="mb-8">
              <h1 className="mb-2 text-2xl font-semibold text-gray-900">
                Survey
              </h1>
              <p className="text-gray-500">
                Please answer the following questions.
              </p>
            </div>

            {/* Question */}
            <div className="mb-8">
              <h2 className="mb-8 text-xl font-semibold text-gray-900">
                Which adjective would best describe your behavior?
              </h2>

              {/* Adjective Selection */}
              <div className="mb-12 flex items-center justify-between">
                <Button
                  variant={
                    selectedAdjective === positiveAdjective
                      ? "default"
                      : "outline"
                  }
                  className={`rounded-full px-8 py-3 ${
                    selectedAdjective === positiveAdjective
                      ? "bg-gray-900 text-white hover:bg-gray-800"
                      : "border-gray-200 bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  onClick={() => setSelectedAdjective(positiveAdjective)}
                >
                  {positiveAdjective}
                </Button>

                <span className="text-sm text-gray-400">or</span>
                <Button
                  variant={
                    selectedAdjective === negativeAdjective
                      ? "default"
                      : "outline"
                  }
                  className={`rounded-full px-8 py-3 ${
                    selectedAdjective === negativeAdjective
                      ? "bg-gray-900 text-white hover:bg-gray-800"
                      : "border-gray-200 bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  onClick={() => setSelectedAdjective(negativeAdjective)}
                >
                  {negativeAdjective}
                </Button>
              </div>

              {/* Frequency Selection */}
              <div className="grid grid-cols-4 gap-4">
                {frequencies.map((frequency, index) => (
                  <Button
                    key={`${frequency}-${index}`}
                    variant="outline"
                    className={`rounded-full py-3 ${
                      selectedAdjective &&
                      selectedFrequency === `${frequency}-${index}`
                        ? "bg-gray-900 text-white hover:bg-gray-800"
                        : selectedAdjective
                          ? "border-gray-200 bg-gray-100 text-gray-700 hover:bg-gray-200"
                          : "cursor-not-allowed border-gray-100 bg-gray-50 text-gray-400"
                    }`}
                    disabled={!selectedAdjective}
                    onClick={() =>
                      selectedAdjective &&
                      setSelectedFrequency(`${frequency}-${index}`)
                    }
                  >
                    {frequency}
                  </Button>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                className="text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>

              <Button
                className="h-12 w-12 rounded-full bg-gray-900 p-0 text-white hover:bg-gray-800"
                disabled={!selectedAdjective || !selectedFrequency}
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
