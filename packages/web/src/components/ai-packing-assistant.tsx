import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, RefreshCcw } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useGroupStore } from "@/lib/group-store";
import { createItem } from "@/services/ItemService";
import { createAssignment } from "@/services/ItemAssignmentService";
import { fetchCategoriesByGroup } from "@/services/CategoryService";

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
  const [categories, setCategories] = useState<any[]>([]);
  const [addingToList, setAddingToList] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  const { user } = useAuth();
  const { currentGroup } = useGroupStore();

  // Cache key prefix for localStorage
  const CACHE_KEY_PREFIX = "ai_packing_cache_";
  // Cache expiration time (24 hours in milliseconds)
  const CACHE_EXPIRATION = 24 * 60 * 60 * 1000;

  // Function to generate a cache key from form values
  const generateCacheKey = (values: AiPackingFormValues): string => {
    return (
      CACHE_KEY_PREFIX +
      JSON.stringify({
        eventType: values.eventType,
        weatherForecast: values.weatherForecast,
        duration: values.duration,
        people: values.people,
        // Exclude special requirements from cache key as they're often unique
      })
    );
  };

  // Function to get cached suggestions if available
  const getCachedSuggestions = (cacheKey: string): any | null => {
    try {
      const cachedData = localStorage.getItem(cacheKey);
      if (!cachedData) return null;

      const { data, timestamp } = JSON.parse(cachedData);
      const now = Date.now();

      // Check if cache has expired
      if (now - timestamp > CACHE_EXPIRATION) {
        localStorage.removeItem(cacheKey);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error reading from cache:", error);
      return null;
    }
  };

  // Function to cache suggestions
  const cacheSuggestions = (cacheKey: string, data: any): void => {
    try {
      const cacheEntry = {
        data,
        timestamp: Date.now(),
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheEntry));
    } catch (error) {
      console.error("Error saving to cache:", error);
      // If storage fails (e.g., quota exceeded), clear some old cache entries
      clearOldCacheEntries();
    }
  };

  // Function to clear old cache entries if needed
  const clearOldCacheEntries = (): void => {
    try {
      // Get all keys from localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(CACHE_KEY_PREFIX)) {
          try {
            const cachedData = localStorage.getItem(key);
            if (cachedData) {
              const { timestamp } = JSON.parse(cachedData);
              const now = Date.now();

              // Remove if older than expiration time
              if (now - timestamp > CACHE_EXPIRATION) {
                localStorage.removeItem(key);
              }
            }
          } catch (e) {
            // If entry is corrupted, remove it
            localStorage.removeItem(key);
          }
        }
      }
    } catch (error) {
      console.error("Error clearing cache:", error);
    }
  };

  // Fetch categories when the component mounts
  useEffect(() => {
    if (currentGroup?.id) {
      fetchCategories();
    }
  }, [currentGroup?.id]);

  const fetchCategories = async () => {
    try {
      if (!currentGroup?.id) return;
      const fetchedCategories = await fetchCategoriesByGroup(currentGroup.id);
      setCategories(fetchedCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast({
        title: "Error",
        description: "Failed to fetch categories",
        variant: "destructive",
      });
    }
  };

  // Function to handle adding an item to the packing list
  const handleAddToList = async (item: any, category: string) => {
    if (!user || !currentGroup) {
      toast({
        title: "Error",
        description: "You must be logged in and have a group selected",
        variant: "destructive",
      });
      return;
    }

    if (categories.length === 0) {
      toast({
        title: "Error",
        description: "Please create at least one category first",
        variant: "destructive",
      });
      return;
    }

    // Set loading state for this specific item
    setAddingToList((prev) => ({
      ...prev,
      [`${category}-${item.name}`]: true,
    }));

    try {
      // Find appropriate category ID, or use the first one if none match
      let categoryId = categories[0]?.id;

      // Try to find a matching category
      const matchingCategory = categories.find(
        (cat) => cat.name.toLowerCase() === category.toLowerCase()
      );

      if (matchingCategory) {
        categoryId = matchingCategory.id;
      }

      // Ensure quantity and priority are valid
      const quantity = String(item.quantity || 1);
      const priority = String(item.priority || "Medium");

      // Create the item
      const newItem = await createItem({
        name: item.name,
        description: `Priority: ${priority}`,
        quantity: quantity,
        categoryId,
        groupId: currentGroup.id,
      });

      // Assign the item to the current user
      await createAssignment({
        itemId: newItem.id,
        assignedTo: user.id,
        status: "to_pack",
      });

      toast({
        title: "Success",
        description: `${item.name} added to your packing list`,
      });
    } catch (error) {
      console.error("Error adding item to list:", error);
      toast({
        title: "Error",
        description: "Failed to add item to packing list",
        variant: "destructive",
      });
    } finally {
      // Clear loading state for this specific item
      setAddingToList((prev) => ({
        ...prev,
        [`${category}-${item.name}`]: false,
      }));
    }
  };

  // Function to handle adding all items to the packing list
  const handleAddAllToList = async () => {
    if (!user || !currentGroup) {
      toast({
        title: "Error",
        description: "You must be logged in and have a group selected",
        variant: "destructive",
      });
      return;
    }

    if (categories.length === 0) {
      toast({
        title: "Error",
        description: "Please create at least one category first",
        variant: "destructive",
      });
      return;
    }

    // Show overall loading toast
    toast({
      title: "Adding items",
      description: "Adding all items to your packing list...",
    });

    try {
      // Loop through all categories and items
      for (const [category, items] of Object.entries(suggestions)) {
        // Find appropriate category ID
        let categoryId = categories[0]?.id;
        const matchingCategory = categories.find(
          (cat) => cat.name.toLowerCase() === category.toLowerCase()
        );

        if (matchingCategory) {
          categoryId = matchingCategory.id;
        }

        // Add each item in the category
        for (const item of items as any[]) {
          try {
            // Ensure quantity and priority are valid
            const quantity = String(item.quantity || 1);
            const priority = String(item.priority || "Medium");

            // Create the item
            const newItem = await createItem({
              name: item.name,
              description: `Priority: ${priority}`,
              quantity: quantity,
              categoryId,
              groupId: currentGroup.id,
            });

            // Assign the item to the current user
            await createAssignment({
              itemId: newItem.id,
              assignedTo: user.id,
              status: "to_pack",
            });
          } catch (error) {
            console.error(`Error adding item ${item.name}:`, error);
          }
        }
      }

      toast({
        title: "Success",
        description: "All items added to your packing list",
      });
    } catch (error) {
      console.error("Error adding all items:", error);
      toast({
        title: "Error",
        description: "Some items couldn't be added to your packing list",
        variant: "destructive",
      });
    }
  };

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
    await fetchSuggestions(values, false);
  }

  // Function to normalize the AI response data
  const normalizeResponseData = (data: any): any => {
    const normalizedData: any = {};

    for (const [category, items] of Object.entries(data)) {
      normalizedData[category] = (items as any[]).map((item) => ({
        name: item.name || "Unnamed Item",
        quantity: item.quantity || 1,
        priority: item.priority || "Medium",
      }));
    }

    return normalizedData;
  };

  // Function to fetch suggestions with optional cache bypass
  async function fetchSuggestions(
    values: AiPackingFormValues,
    forceRefresh = false
  ) {
    setLoading(true);
    setSuggestions(null);

    try {
      const cacheKey = generateCacheKey(values);
      const cachedSuggestions = !forceRefresh
        ? getCachedSuggestions(cacheKey)
        : null;

      if (cachedSuggestions) {
        setSuggestions(cachedSuggestions);
        toast({
          title: "Success!",
          description: "Packing suggestions retrieved from cache.",
        });
      } else {
        const response = await fetch(`${API_URL}/ai/packing-suggestions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });

        const data = await response.json();

        if (data.success) {
          // Normalize the response data to ensure no null values
          const normalizedData = normalizeResponseData(data.data);
          setSuggestions(normalizedData);
          cacheSuggestions(cacheKey, normalizedData);
          toast({
            title: "Success!",
            description: "Packing suggestions generated successfully.",
          });
        } else {
          throw new Error(data.message || "Failed to generate suggestions");
        }
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
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>AI-Generated Packing List</CardTitle>
                <CardDescription>
                  Here are the suggested items for your trip. You can add these
                  to your packing list.
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => fetchSuggestions(form.getValues(), true)}
                disabled={loading}
                title="Refresh suggestions from API"
              >
                <RefreshCcw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
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
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddToList(item, category)}
                            disabled={addingToList[`${category}-${item.name}`]}
                          >
                            {addingToList[`${category}-${item.name}`] ? (
                              <>
                                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                Adding...
                              </>
                            ) : (
                              "Add to List"
                            )}
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
            <Button onClick={handleAddAllToList}>Add All to List</Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
