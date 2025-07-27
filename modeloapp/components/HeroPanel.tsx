import { TrendingUp, Users, Target, Award } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "./ui/chart";
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

const chartData = [
  { month: "Jan", revenue: 4000, projects: 24 },
  { month: "Feb", revenue: 3000, projects: 18 },
  { month: "Mar", revenue: 2000, projects: 28 },
  { month: "Apr", revenue: 2780, projects: 32 },
  { month: "May", revenue: 1890, projects: 45 },
  { month: "Jun", revenue: 2390, projects: 38 },
];

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-1))",
  },
  projects: {
    label: "Projects",
    color: "hsl(var(--chart-2))",
  },
};

export function HeroPanel() {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col space-y-2">
        <h1>Welcome back, John!</h1>
        <p className="text-muted-foreground">
          Here's what's happening with your projects today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231.89</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Active Projects</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">185</div>
            <p className="text-xs text-muted-foreground">
              +12 from last week
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              +3 new this month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Completion Rate</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.2%</div>
            <p className="text-xs text-muted-foreground">
              +2.1% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Achievements */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>
              Monthly revenue and project completion trends
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <XAxis
                    dataKey="month"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dashed" />}
                  />
                  <Bar
                    dataKey="revenue"
                    fill="var(--color-revenue)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Achievements</CardTitle>
            <CardDescription>
              Your latest milestones and accomplishments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">New</Badge>
              <span>Completed 100 projects milestone</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">Team</Badge>
              <span>Onboarded 5 new team members</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">Performance</Badge>
              <span>Achieved 95% client satisfaction</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">Revenue</Badge>
              <span>Exceeded monthly target by 20%</span>
            </div>
            
            {/* Mini Chart */}
            <div className="pt-4">
              <CardDescription className="mb-2">Project completion trend</CardDescription>
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height={100}>
                  <LineChart data={chartData}>
                    <Line
                      type="monotone"
                      dataKey="projects"
                      stroke="var(--color-projects)"
                      strokeWidth={2}
                      dot={false}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}