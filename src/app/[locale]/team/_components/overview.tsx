import { Card, CardContent } from "~/components/ui/card";
import { Users, FileText, Calendar } from "lucide-react";

export default function OverviewTab() {
  return (
    <div className="space-y-6 pt-6">
      {/* Add members section */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Overview</h2>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Team Members Card */}
          <Card className="bg-white">
            <CardContent>
              <div className="mb-4 flex items-center">
                <Users className="mr-2 h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-600">
                  Team Members
                </span>
              </div>
              <div className="mb-2 text-4xl font-bold text-gray-900">6</div>
              <p className="text-sm text-gray-400">Add members here</p>
            </CardContent>
          </Card>

          {/* Responses Card */}
          <Card className="bg-white">
            <CardContent>
              <div className="mb-4 flex items-center">
                <FileText className="mr-2 h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-600">
                  Responses
                </span>
              </div>
              <div className="mb-2 text-4xl font-bold text-gray-900">4</div>
              <p className="text-sm text-gray-400">Send reminders here</p>
            </CardContent>
          </Card>

          {/* Days since creation Card */}
          <Card className="bg-white">
            <CardContent>
              <div className="mb-4 flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-600">
                  Days since creation
                </span>
              </div>
              <div className="mb-2 text-4xl font-bold text-gray-900">12</div>
              <p className="text-sm text-gray-400">Lorem impsum</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
export { OverviewTab };
