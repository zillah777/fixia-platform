import { Calendar, Clock, CheckCircle, AlertCircle, DollarSign, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";

export function SummaryCards() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2>Project Summary</h2>
        <Badge variant="outline">Last 30 days</Badge>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Pending Tasks</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <div className="mt-2 space-y-2">
              <div className="flex justify-between text-sm">
                <span>High Priority</span>
                <span>8</span>
              </div>
              <Progress value={35} className="h-2" />
              <p className="text-xs text-muted-foreground">
                3 tasks due today
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Completed This Week</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
            <div className="mt-2 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Target: 50</span>
                <span>94%</span>
              </div>
              <Progress value={94} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Great progress this week!
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Budget Utilization</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$284K</div>
            <div className="mt-2 space-y-2">
              <div className="flex justify-between text-sm">
                <span>of $350K budget</span>
                <span>81%</span>
              </div>
              <Progress value={81} className="h-2" />
              <p className="text-xs text-muted-foreground">
                $66K remaining
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Upcoming Deadlines</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <div className="mt-2 space-y-2">
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>This week</span>
                  <Badge variant="destructive" className="text-xs">2</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Next week</span>
                  <Badge variant="secondary" className="text-xs">3</Badge>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                2 critical deadlines approaching
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Team Performance</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8.4/10</div>
            <div className="mt-2 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Productivity Score</span>
                <span>84%</span>
              </div>
              <Progress value={84} className="h-2" />
              <p className="text-xs text-muted-foreground">
                +5% from last month
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Issues & Blockers</CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <div className="mt-2 space-y-2">
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Critical</span>
                  <Badge variant="destructive" className="text-xs">1</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Medium</span>
                  <Badge variant="secondary" className="text-xs">2</Badge>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                1 blocker needs immediate attention
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}