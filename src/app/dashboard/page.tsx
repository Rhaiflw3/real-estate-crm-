import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Users, Home, Calendar, Percent } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-2">Welcome back to RF Realty</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card className="border-slate-200 bg-white">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-500">
                Leads
              </CardTitle>
              <Users className="w-5 h-5 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">142</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-600">+12%</span>
              <span className="text-sm text-slate-500 ml-2">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-500">
                Active Listings
              </CardTitle>
              <Home className="w-5 h-5 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">28</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-600">+3</span>
              <span className="text-sm text-slate-500 ml-2">new this week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-500">
                Meetings
              </CardTitle>
              <Calendar className="w-5 h-5 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">16</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-600">+4</span>
              <span className="text-sm text-slate-500 ml-2">scheduled today</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-500">
                Conversion Rate
              </CardTitle>
              <Percent className="w-5 h-5 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">24.5%</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-600">+2.1%</span>
              <span className="text-sm text-slate-500 ml-2">improvement</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}