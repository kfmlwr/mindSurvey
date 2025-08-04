import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";
import { Card, CardContent } from "~/components/ui/card";
import { getLocale } from "next-intl/server";
import { auth } from "~/server/auth";

export default async function MindclipSurvey() {
  const locale = await getLocale();

  const session = await auth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white">
      <div className="container mx-auto px-4 py-8 lg:py-16">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Logo */}

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-4xl leading-tight font-bold lg:text-5xl">
                Find out your{" "}
                <span className="text-emerald-400">Behaviour Style.</span>
              </h1>
            </div>

            {/* Questions */}
            <div className="space-y-6 text-gray-300">
              <p className="text-lg">
                Do you want to know more about{" "}
                <span className="font-semibold text-white">
                  how your behaviour is perceived by others
                </span>{" "}
                in your team?
              </p>
              <p className="text-lg">
                Are you curious about{" "}
                <span className="font-semibold text-white">
                  how your perception differs
                </span>{" "}
                from the perception others have of you?
              </p>
            </div>

            {/* Steps */}
            <div className="mt-12 space-y-6">
              <div className="flex items-start space-x-4">
                <div className="mt-2 h-3 w-3 flex-shrink-0 rounded-full bg-emerald-400"></div>
                <div>
                  <h3 className="text-lg font-semibold">Step 1:</h3>
                  <p className="text-gray-300">Do the Self-reflection Survey</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="mt-2 h-3 w-3 flex-shrink-0 rounded-full bg-emerald-400"></div>
                <div>
                  <h3 className="text-lg font-semibold">Step 2:</h3>
                  <p className="text-gray-300">
                    Let us know (via Mail) that you want to receive your peers
                    perception
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="mt-2 h-3 w-3 flex-shrink-0 rounded-full bg-emerald-400"></div>
                <div>
                  <h3 className="text-lg font-semibold">Step 3:</h3>
                  <p className="text-gray-300">
                    Compare the two Perceptions (your own and your team) and
                    start your journey in the Mindclip App
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Form */}
          <div className="flex justify-center lg:justify-end">
            <Card className="w-full max-w-md border-0 bg-gradient-to-br from-emerald-400 to-teal-500 shadow-2xl">
              <CardContent className="p-8">
                <div className="mb-6 text-center">
                  <h2 className="mb-2 text-2xl font-bold text-white">
                    Behaviour Style
                  </h2>
                  <h3 className="mb-2 text-xl font-semibold text-white">
                    Self-reflection Survey
                  </h3>
                  <p className="text-sm text-emerald-100">
                    You will receive an email with the login details.
                    <br />
                    Please be patient with the results.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="firstName"
                      className="font-medium text-white"
                    >
                      Firstname
                    </Label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="Firstname"
                      className="border-0 bg-white/90 text-gray-900 placeholder:text-gray-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="lastName"
                      className="font-medium text-white"
                    >
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Last Name"
                      className="border-0 bg-white/90 text-gray-900 placeholder:text-gray-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-medium text-white">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="example@company.com"
                      className="border-0 bg-white/90 text-gray-900 placeholder:text-gray-500"
                    />
                  </div>

                  <div className="pt-4">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="agreeToContact"
                        className="mt-1 border-0 bg-white/90 data-[state=checked]:bg-emerald-600 data-[state=checked]:text-white"
                      />
                      <Label
                        htmlFor="agreeToContact"
                        className="cursor-pointer text-sm leading-relaxed text-emerald-100"
                      >
                        I agree that Mindclip can contact me on topics related
                        to the behaviour survey
                      </Label>
                    </div>
                  </div>

                  <Button className="mt-6 w-full bg-white text-emerald-600 shadow-lg hover:bg-gray-100">
                    Get Access
                  </Button>
                  <p className="w-full text-center text-sm text-gray-200">
                    Already created a team?{" "}
                    <a
                      href={`/auth/login?locale=${locale}`}
                      className="text-emerald-200 hover:underline"
                    >
                      Login here
                    </a>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
