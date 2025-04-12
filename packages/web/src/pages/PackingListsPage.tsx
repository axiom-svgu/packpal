import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ClipboardList } from "lucide-react";

export default function PackingListsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Packing Lists</h2>
        <div className="flex items-center space-x-2">
          <ClipboardList className="h-4 w-4 text-muted-foreground" />
          <span className="text-lg font-semibold">Active Lists: 12</span>
        </div>
      </div>
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>All Packing Lists</CardTitle>
            <CardDescription>
              Manage and organize your packing lists for different trips.
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
