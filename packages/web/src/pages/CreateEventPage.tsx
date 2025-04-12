import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CalendarRange } from "lucide-react";

export default function CreateEventPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Create Event/Trip</h2>
        <div className="flex items-center space-x-2">
          <CalendarRange className="h-4 w-4 text-muted-foreground" />
          <span className="text-lg font-semibold">Active Events: 3</span>
        </div>
      </div>
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>New Event</CardTitle>
            <CardDescription>
              Create and plan a new event or trip for your group.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Content coming soon...
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
