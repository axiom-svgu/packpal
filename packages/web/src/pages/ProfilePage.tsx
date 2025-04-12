import { useEffect, useState, useRef } from "react";
import { get } from "@/services/HttpHelper";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Check,
  ChevronRight,
  Clipboard,
  ClipboardCheck,
  Clock,
  Edit,
  FileBox,
  Gift,
  Group,
  Loader2,
  PackageCheck,
  PackageOpen,
  Pen,
  RefreshCcw,
  Truck,
  TruckIcon,
  User,
  Users,
} from "lucide-react";

type ProfileData = {
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
    updatedAt: string;
    groups: Array<{
      id: string;
      groupId: string;
      userId: string;
      role: string;
      joinedAt: string;
      updatedAt: string;
      group: {
        id: string;
        name: string;
        description: string | null;
      };
    }>;
  };
  stats: {
    groupsCount: number;
    assignedItemsCount: number;
    toPackCount: number;
    packedCount: number;
    deliveredCount: number;
  };
  recentAssignments: Array<{
    id: string;
    itemId: string;
    assignedTo: string;
    assignedBy: {
      id: string;
      name: string;
      email: string;
    };
    status: "to_pack" | "packed" | "delivered";
    notes: string | null;
    createdAt: string;
    updatedAt: string;
    item: {
      id: string;
      name: string;
      description: string | null;
      quantity: string;
    };
  }>;
};

export default function ProfilePage() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, setActiveTab] = useState("overview");
  const [refreshing, setRefreshing] = useState(false);
  const isMounted = useRef(true);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Not authenticated");
        setLoading(false);
        return;
      }

      const response = await get<{ data: ProfileData }>("/auth/profile");

      // Check if component is still mounted before updating state
      if (!isMounted.current) return;

      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        setProfileData(response.data.data);
      } else {
        setError("Failed to load profile data");
      }
    } catch (err) {
      if (isMounted.current) {
        console.error("Error fetching profile data:", err);
        setError("Failed to load profile data");
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchProfileData();
  };

  useEffect(() => {
    isMounted.current = true;
    fetchProfileData();

    // Cleanup function when component unmounts
    return () => {
      isMounted.current = false;
    };
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "to_pack":
        return <PackageOpen className="h-4 w-4 text-amber-500" />;
      case "packed":
        return <PackageCheck className="h-4 w-4 text-green-500" />;
      case "delivered":
        return <Truck className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getCompletionPercentage = () => {
    if (!profileData?.stats) return 0;

    const {
      toPackCount = 0,
      packedCount = 0,
      deliveredCount = 0,
    } = profileData.stats;
    const total = toPackCount + packedCount + deliveredCount;

    if (total === 0) return 0;
    return Math.round(((packedCount + deliveredCount) / total) * 100);
  };

  const renderSkeleton = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-[180px] rounded-lg" />
        <Skeleton className="h-[180px] rounded-lg" />
        <Skeleton className="h-[180px] rounded-lg" />
      </div>
      <Skeleton className="h-[300px] rounded-lg" />
    </div>
  );

  if (loading && !refreshing) {
    return (
      <div className="flex-1 space-y-4 p-4 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Profile</h2>
          <Button variant="ghost" size="icon" disabled>
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </div>
        {renderSkeleton()}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 space-y-4 p-4 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Profile</h2>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">{error}</p>
          </CardContent>
          <CardFooter>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="text-red-700 border-red-300"
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="flex-1 space-y-4 p-4 pt-6">
        <h2 className="text-3xl font-bold tracking-tight">Profile</h2>
        <p>No profile data available</p>
      </div>
    );
  }

  const { user, stats, recentAssignments } = profileData;

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20 border-4 border-background shadow-lg">
            <AvatarImage
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
            />
            <AvatarFallback className="text-xl">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{user.name}</h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{user.email}</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="bg-blue-50">
                <Users className="mr-1 h-3 w-3" />
                {stats.groupsCount}{" "}
                {stats.groupsCount === 1 ? "Group" : "Groups"}
              </Badge>
              <Badge variant="outline" className="bg-amber-50">
                <FileBox className="mr-1 h-3 w-3" />
                {stats.assignedItemsCount}{" "}
                {stats.assignedItemsCount === 1 ? "Item" : "Items"}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-9">
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
          <Button
            size="sm"
            className="h-9"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCcw
              className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </div>

      {refreshing && (
        <div className="w-full bg-blue-50 text-blue-700 py-2 px-4 rounded-md flex items-center justify-center">
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Refreshing your profile data...
        </div>
      )}

      <Tabs
        defaultValue="overview"
        className="space-y-4"
        onValueChange={setActiveTab}
      >
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="groups">Groups</TabsTrigger>
          <TabsTrigger value="items">Items</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-amber-100 to-amber-50 pb-2">
                <CardTitle className="flex items-center text-lg font-medium">
                  <PackageOpen className="mr-2 h-5 w-5 text-amber-600" />
                  To Pack
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-3xl font-bold">
                  {stats?.toPackCount || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Items waiting to be packed
                </p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-green-100 to-green-50 pb-2">
                <CardTitle className="flex items-center text-lg font-medium">
                  <PackageCheck className="mr-2 h-5 w-5 text-green-600" />
                  Packed
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-3xl font-bold">
                  {stats?.packedCount || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Items packed and ready
                </p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-100 to-blue-50 pb-2">
                <CardTitle className="flex items-center text-lg font-medium">
                  <TruckIcon className="mr-2 h-5 w-5 text-blue-600" />
                  Delivered
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-3xl font-bold">
                  {stats?.deliveredCount || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Items successfully delivered
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Packing Progress</CardTitle>
                <CardDescription>
                  Your overall progress across all assigned items
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>Completion Rate</div>
                    <div className="font-medium">
                      {getCompletionPercentage()}%
                    </div>
                  </div>
                  <Progress value={getCompletionPercentage()} className="h-2" />
                  <div className="grid grid-cols-3 gap-2 text-center text-sm">
                    <div className="flex flex-col items-center">
                      <div className="flex items-center gap-1 text-amber-600">
                        <PackageOpen className="h-4 w-4" />
                        <span className="font-medium">{stats.toPackCount}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        To Pack
                      </div>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="flex items-center gap-1 text-green-600">
                        <PackageCheck className="h-4 w-4" />
                        <span className="font-medium">{stats.packedCount}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Packed
                      </div>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="flex items-center gap-1 text-blue-600">
                        <Truck className="h-4 w-4" />
                        <span className="font-medium">
                          {stats.deliveredCount}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Delivered
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Assignments</CardTitle>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <BarChart className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription>Your recently assigned items</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[220px]">
                  {recentAssignments.length > 0 ? (
                    <div className="space-y-3">
                      {recentAssignments.map((assignment) => (
                        <div
                          key={assignment.id}
                          className="flex items-center gap-3 rounded-lg border p-3"
                        >
                          <div className="rounded-full p-1">
                            {getStatusIcon(assignment.status)}
                          </div>
                          <div className="flex-1 truncate">
                            <div className="font-medium truncate">
                              {assignment.item.name}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              By {assignment.assignedBy.name} ·{" "}
                              {new Date(
                                assignment.updatedAt
                              ).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            <Badge
                              variant={
                                assignment.status === "to_pack"
                                  ? "outline"
                                  : assignment.status === "packed"
                                  ? "secondary"
                                  : "default"
                              }
                            >
                              {assignment.status.replace("_", " ")}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <div className="text-center">
                        <Clipboard className="mx-auto h-10 w-10 text-muted-foreground/60" />
                        <p className="mt-2 text-sm text-muted-foreground">
                          No recent assignments
                        </p>
                      </div>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
              <CardFooter className="border-t px-6 py-3">
                <Button variant="outline" className="w-full">
                  <ClipboardCheck className="mr-2 h-4 w-4" />
                  View All Assignments
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="groups" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Group className="mr-2 h-5 w-5" />
                Your Groups
              </CardTitle>
              <CardDescription>
                Groups you belong to and your role in each
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                {user.groups.length > 0 ? (
                  <div className="space-y-4">
                    {user.groups.map((membership) => (
                      <div
                        key={membership.id}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage
                              src={`https://api.dicebear.com/7.x/shapes/svg?seed=${membership.group.name}`}
                            />
                            <AvatarFallback>
                              {membership.group.name
                                .substring(0, 2)
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {membership.group.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {membership.group.description || "No description"}
                            </div>
                            <Badge variant="outline" className="mt-1">
                              {membership.role}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-[300px] items-center justify-center">
                    <div className="text-center">
                      <Users className="mx-auto h-12 w-12 text-muted-foreground/60" />
                      <h3 className="mt-4 text-lg font-medium">No Groups</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        You don't belong to any groups yet.
                      </p>
                      <Button className="mt-4">Join a Group</Button>
                    </div>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="items" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Gift className="mr-2 h-5 w-5" />
                Your Items
              </CardTitle>
              <CardDescription>
                Items assigned to you and their current status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-6">
                <Badge variant="secondary" className="cursor-pointer">
                  All Items
                </Badge>
                <Badge variant="outline" className="cursor-pointer">
                  To Pack
                </Badge>
                <Badge variant="outline" className="cursor-pointer">
                  Packed
                </Badge>
                <Badge variant="outline" className="cursor-pointer">
                  Delivered
                </Badge>
              </div>

              {stats.assignedItemsCount > 0 ? (
                <div className="space-y-2">
                  <div className="rounded-md border">
                    <div className="grid grid-cols-4 bg-muted/50 p-3 text-sm font-medium">
                      <div>Item</div>
                      <div>Quantity</div>
                      <div>Status</div>
                      <div className="text-right">Actions</div>
                    </div>
                    <div className="divide-y">
                      {recentAssignments.map((assignment) => (
                        <div
                          key={assignment.id}
                          className="grid grid-cols-4 items-center p-3"
                        >
                          <div className="font-medium">
                            {assignment.item.name}
                          </div>
                          <div>{assignment.item.quantity}</div>
                          <div>
                            <Badge
                              variant={
                                assignment.status === "to_pack"
                                  ? "outline"
                                  : assignment.status === "packed"
                                  ? "secondary"
                                  : "default"
                              }
                            >
                              {assignment.status.replace("_", " ")}
                            </Badge>
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline">
                              <Pen className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Check className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <Button variant="outline">Load More</Button>
                  </div>
                </div>
              ) : (
                <div className="flex h-[300px] items-center justify-center">
                  <div className="text-center">
                    <PackageOpen className="mx-auto h-12 w-12 text-muted-foreground/60" />
                    <h3 className="mt-4 text-lg font-medium">No Items</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      You don't have any assigned items yet.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
