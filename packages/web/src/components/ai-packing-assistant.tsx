import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { API_URL } from "@/lib/api";

// Form schema
const aiPackingFormSchema = z.object({
  eventType: z.string().min(1, "Event type is required"),
  weatherForecast: z.string().min(1, "Weather forecast is required"),
  duration: z.coerce
    .number()
    .int()
    .positive("Duration must be a positive number"),
  people: z.coerce
    .number()
    .int()
    .positive("Number of people must be a positive number"),
  specialRequirements: z.string().optional(),
});

type AiPackingFormValues = z.infer<typeof aiPackingFormSchema>;

// AI Packing Assistant Component
export default function AiPackingAssistant() {
  const [suggestions, setSuggestions] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Initialize form
  const form = useForm<AiPackingFormValues>({
    resolver: zodResolver(aiPackingFormSchema),
    defaultValues: {
      eventType: "",
      weatherForecast: "",
      duration: 3,
      people: 2,
      specialRequirements: "",
    },
  });

  // Submit handler
  async function onSubmit(values: AiPackingFormValues) {
    setLoading(true);
    setSuggestions(null);

    try {
      const response = await axios.post(
        `${API_URL}/ai/packing-suggestions`,
        values
      );

      if (response.data.success) {
        setSuggestions(response.data.data);
        toast({
          title: "Success!",
          description: "Packing suggestions generated successfully.",
        });
      } else {
        throw new Error(
          response.data.message || "Failed to generate suggestions"
        );
      }
    } catch (error: any) {
      console.error("Error generating packing suggestions:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate packing suggestions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Packing Assistant</CardTitle>
          <CardDescription>
            Let our AI assistant help you create the perfect packing list based
            on your trip details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="eventType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an event type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="camping">Camping</SelectItem>
                          <SelectItem value="beach vacation">
                            Beach Vacation
                          </SelectItem>
                          <SelectItem value="business trip">
                            Business Trip
                          </SelectItem>
                          <SelectItem value="road trip">Road Trip</SelectItem>
                          <SelectItem value="hiking trip">
                            Hiking Trip
                          </SelectItem>
                          <SelectItem value="winter vacation">
                            Winter Vacation
                          </SelectItem>
                          <SelectItem value="music festival">
                            Music Festival
                          </SelectItem>
                          <SelectItem value="conference">Conference</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select the type of event you're packing for
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="weatherForecast"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weather Forecast</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select weather conditions" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="hot and sunny">
                            Hot and Sunny
                          </SelectItem>
                          <SelectItem value="warm">Warm</SelectItem>
                          <SelectItem value="mild">Mild</SelectItem>
                          <SelectItem value="cool">Cool</SelectItem>
                          <SelectItem value="cold">Cold</SelectItem>
                          <SelectItem value="rainy">Rainy</SelectItem>
                          <SelectItem value="snowy">Snowy</SelectItem>
                          <SelectItem value="variable">Variable</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Expected weather at your destination
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (days)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          placeholder="Number of days"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        How many days will your trip last?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="people"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of People</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          placeholder="Number of people"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        How many people are going on this trip?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="specialRequirements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Special Requirements (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any special requirements or notes? (e.g., dietary restrictions, medical needs, activities planned)"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Include any special requirements or additional context
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Suggestions...
                  </>
                ) : (
                  "Generate Packing List"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {suggestions && (
        <Card>
          <CardHeader>
            <CardTitle>AI-Generated Packing List</CardTitle>
            <CardDescription>
              Here are the suggested items for your trip. You can add these to
              your packing list.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(suggestions).map(
                ([category, items]: [string, any]) => (
                  <div key={category} className="space-y-3">
                    <h3 className="text-lg font-semibold capitalize">
                      {category}
                    </h3>
                    <div className="space-y-2">
                      {items.map((item: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-muted rounded-md"
                        >
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Qty: {item.quantity} • Priority: {item.priority}
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            Add to List
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setSuggestions(null)}>
              Clear Results
            </Button>
            <Button>Add All to List</Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
