import { MoreHorizontal, ArrowUpDown, Eye, Edit, Trash2 } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const mockEntries = [
  {
    id: "1",
    name: "Website Redesign",
    status: "In Progress",
    priority: "High",
    assignee: {
      name: "Alice Cooper",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=32&h=32&fit=crop&crop=face",
      initials: "AC"
    },
    dueDate: "2025-01-30",
    progress: 75,
    budget: "$25,000"
  },
  {
    id: "2",
    name: "Mobile App Development",
    status: "Planning",
    priority: "High",
    assignee: {
      name: "Bob Johnson",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face",
      initials: "BJ"
    },
    dueDate: "2025-02-15",
    progress: 25,
    budget: "$50,000"
  },
  {
    id: "3",
    name: "Brand Identity Update",
    status: "Completed",
    priority: "Medium",
    assignee: {
      name: "Carol Williams",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face",
      initials: "CW"
    },
    dueDate: "2025-01-15",
    progress: 100,
    budget: "$15,000"
  },
  {
    id: "4",
    name: "E-commerce Platform",
    status: "In Progress",
    priority: "High",
    assignee: {
      name: "David Brown",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face",
      initials: "DB"
    },
    dueDate: "2025-03-01",
    progress: 60,
    budget: "$75,000"
  },
  {
    id: "5",
    name: "Marketing Campaign",
    status: "On Hold",
    priority: "Low",
    assignee: {
      name: "Eva Davis",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=32&h=32&fit=crop&crop=face",
      initials: "ED"
    },
    dueDate: "2025-02-28",
    progress: 10,
    budget: "$20,000"
  }
];

function getStatusVariant(status: string) {
  switch (status) {
    case "Completed":
      return "secondary";
    case "In Progress":
      return "default";
    case "Planning":
      return "outline";
    case "On Hold":
      return "destructive";
    default:
      return "outline";
  }
}

function getPriorityVariant(priority: string) {
  switch (priority) {
    case "High":
      return "destructive";
    case "Medium":
      return "secondary";
    case "Low":
      return "outline";
    default:
      return "outline";
  }
}

export function EntriesTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Projects</CardTitle>
        <CardDescription>
          A list of your recent projects and their current status.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button variant="ghost" className="h-auto p-0">
                  Project Name
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" className="h-auto p-0">
                  Status
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead>
                <Button variant="ghost" className="h-auto p-0">
                  Due Date
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Budget</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockEntries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>
                  <div className="space-y-1">
                    <div>{entry.name}</div>
                    <div className="text-sm text-muted-foreground">#{entry.id}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(entry.status)}>
                    {entry.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getPriorityVariant(entry.priority)}>
                    {entry.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={entry.assignee.avatar} alt={entry.assignee.name} />
                      <AvatarFallback className="text-xs">{entry.assignee.initials}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{entry.assignee.name}</span>
                  </div>
                </TableCell>
                <TableCell>{entry.dueDate}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all" 
                        style={{ width: `${entry.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-muted-foreground">{entry.progress}%</span>
                  </div>
                </TableCell>
                <TableCell>{entry.budget}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Project
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Project
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}