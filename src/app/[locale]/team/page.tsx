import { Button } from "~/components/ui/button";

import { OverviewTab } from "./_components/overview";
import { MembersTab } from "./_components/team";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { ResultsTab } from "./_components/results";

export default function TeamHome() {
  return (
    <div className="min-h-screen md:p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Team Overview
          </h1>
          <p className="mb-4 text-gray-500">See and edit your teams profile</p>
          <Button className="bg-gray-800 text-white hover:bg-gray-900">
            Complete your Survey →
          </Button>
        </div>
        {/* Tabs */}
        <div className="mb-6">
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="team">Team</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              <OverviewTab />
            </TabsContent>
            <TabsContent value="team">
              <MembersTab />
            </TabsContent>
            <TabsContent value="results">
              <ResultsTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
