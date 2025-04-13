import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import AiPackingAssistant from "@/components/ai-packing-assistant";

export default function SuggestItemsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          AI Packing Assistant
        </h2>
        <div className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <span className="text-lg font-semibold">AI-Powered</span>
        </div>
      </div>

      <AiPackingAssistant />

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
          <CardDescription>
            Our AI Packing Assistant helps you create the perfect packing list
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-bold mb-2">1. Enter Trip Details</h3>
              <p className="text-sm text-muted-foreground">
                Provide information about your trip type, weather, duration and
                any special requirements.
              </p>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-bold mb-2">2. Get AI Recommendations</h3>
              <p className="text-sm text-muted-foreground">
                Our AI analyzes your trip details and generates a personalized
                packing list.
              </p>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-bold mb-2">3. Add to Your List</h3>
              <p className="text-sm text-muted-foreground">
                Review suggestions and add them to your packing list with one
                click.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
