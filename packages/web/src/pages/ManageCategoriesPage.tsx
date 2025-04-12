import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Layers } from "lucide-react";

export default function ManageCategoriesPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Manage Categories</h2>
        <div className="flex items-center space-x-2">
          <Layers className="h-4 w-4 text-muted-foreground" />
          <span className="text-lg font-semibold">Total Categories: 8</span>
        </div>
      </div>
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Item Categories</CardTitle>
            <CardDescription>
              Manage and organize item categories for better organization.
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
