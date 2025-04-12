import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Settings2 } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <div className="flex items-center space-x-2">
          <Settings2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-lg font-semibold">System Settings</span>
        </div>
      </div>
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Application Settings</CardTitle>
            <CardDescription>
              Configure your application preferences and notifications.
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
