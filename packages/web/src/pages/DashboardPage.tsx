import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  Package,
  CheckCircle,
  ClipboardList,
  Truck,
  Box,
  BarChart3,
  PieChart,
} from "lucide-react";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart as RechartsLineChart,
  Line,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { get } from "@/services/HttpHelper";

// Types for our API responses
interface DashboardStats {
  totalGroups: number;
  totalLists: number;
  itemsPacked: number;
  itemsDelivered: number;
  totalItems: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface ProgressData {
  groupName: string;
  percentPacked: number;
}

interface ActivityData {
  id: string;
  title: string;
  group: string;
  user: string;
  time: string;
  type: string;
}

// Colors for pie chart
const COLORS = ["#3498db", "#2ecc71", "#e74c3c", "#f39c12", "#9b59b6"];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [loading, setLoading] = useState({
    stats: true,
    progress: true,
    activity: true,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch dashboard stats
        const statsResponse = await get<ApiResponse<DashboardStats>>(
          "/dashboard/stats"
        );
        if (statsResponse.data && statsResponse.data.success) {
          setStats(statsResponse.data.data);
        } else {
          console.error("Failed to fetch stats:", statsResponse.error);
        }
        setLoading((prev) => ({ ...prev, stats: false }));

        // Fetch packing progress
        const progressResponse = await get<ApiResponse<ProgressData[]>>(
          "/dashboard/packing-progress"
        );
        if (progressResponse.data && progressResponse.data.success) {
          setProgressData(progressResponse.data.data);
        } else {
          console.error("Failed to fetch progress:", progressResponse.error);
        }
        setLoading((prev) => ({ ...prev, progress: false }));

        // Fetch recent activity
        const activityResponse = await get<ApiResponse<ActivityData[]>>(
          "/dashboard/recent-activity"
        );
        if (activityResponse.data && activityResponse.data.success) {
          setActivityData(activityResponse.data.data);
        } else {
          console.error("Failed to fetch activity:", activityResponse.error);
        }
        setLoading((prev) => ({ ...prev, activity: false }));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setLoading({
          stats: false,
          progress: false,
          activity: false,
        });
      }
    };

    fetchDashboardData();
  }, []);

  // Generate chart data from stats
  const generateItemStatusData = () => {
    if (!stats) return [];

    const { totalItems, itemsPacked, itemsDelivered } = stats;
    const itemsToPack = totalItems - itemsPacked - itemsDelivered;

    return [
      { name: "To Pack", value: itemsToPack },
      { name: "Packed", value: itemsPacked },
      { name: "Delivered", value: itemsDelivered },
    ];
  };

  return (
    <div className="flex-1 space-y-4 p-4 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <span className="text-lg font-semibold">
            Total Items: {stats?.totalItems || 0}
          </span>
        </div>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Groups
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading.stats ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      {stats?.totalGroups || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Your active groups
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Lists
                </CardTitle>
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading.stats ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      {stats?.totalLists || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Across all groups
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Items Packed
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading.stats ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      {stats?.itemsPacked || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {stats
                        ? `${Math.round(
                            (stats.itemsPacked / stats.totalItems) * 100
                          )}% of total items`
                        : "0% of total items"}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Items Delivered
                </CardTitle>
                <Truck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading.stats ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      {stats?.itemsDelivered || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {stats
                        ? `${Math.round(
                            (stats.itemsDelivered / stats.totalItems) * 100
                          )}% of total items`
                        : "0% of total items"}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Your group's latest packing activity and updates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading.activity ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-full max-w-[250px]" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                        <Skeleton className="h-4 w-24" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activityData.length > 0 ? (
                      activityData.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center space-x-4"
                        >
                          <div className="rounded-full bg-secondary p-2">
                            {item.type === "packed" ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : item.type === "delivered" ? (
                              <Truck className="h-4 w-4" />
                            ) : (
                              <Box className="h-4 w-4" />
                            )}
                          </div>
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium">{item.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.group} - {item.user}
                            </p>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {new Date(item.time).toLocaleString()}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No recent activity to display
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Packing Progress</CardTitle>
                <CardDescription>
                  Track your group packing progress
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {loading.progress ? (
                  <div className="space-y-8">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-4 w-12" />
                        </div>
                        <Skeleton className="h-2 w-full" />
                      </div>
                    ))}
                  </div>
                ) : progressData.length > 0 ? (
                  progressData.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">
                            {item.groupName}
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {item.percentPacked}%
                        </span>
                      </div>
                      <Progress value={item.percentPacked} />
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No progress data available
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle>Item Status Distribution</CardTitle>
                  <CardDescription>
                    Distribution of items by status
                  </CardDescription>
                </div>
                <PieChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="px-2">
                <div className="h-80">
                  {loading.stats ? (
                    <div className="h-full w-full flex items-center justify-center">
                      <Skeleton className="h-64 w-64 rounded-full" />
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={generateItemStatusData()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({
                            cx,
                            cy,
                            midAngle,
                            innerRadius,
                            outerRadius,
                            percent,
                            name,
                          }) => {
                            const radius =
                              innerRadius + (outerRadius - innerRadius) * 0.5;
                            const x =
                              cx +
                              radius * Math.cos(-midAngle * (Math.PI / 180));
                            const y =
                              cy +
                              radius * Math.sin(-midAngle * (Math.PI / 180));

                            return (
                              <text
                                x={x}
                                y={y}
                                fill="#888888"
                                textAnchor={x > cx ? "start" : "end"}
                                dominantBaseline="central"
                              >
                                {name} ({(percent * 100).toFixed(0)}%)
                              </text>
                            );
                          }}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {generateItemStatusData().map((_, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle>Group Packing Progress</CardTitle>
                  <CardDescription>
                    Percentage of items packed by group
                  </CardDescription>
                </div>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="px-2">
                <div className="h-80">
                  {loading.progress ? (
                    <div className="h-full w-full flex items-center justify-center">
                      <div className="space-y-2 w-full px-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-64 w-full" />
                      </div>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={progressData}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 70,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="groupName"
                          angle={-45}
                          textAnchor="end"
                          height={70}
                        />
                        <YAxis
                          label={{
                            value: "Packed (%)",
                            angle: -90,
                            position: "insideLeft",
                          }}
                        />
                        <Tooltip />
                        <Legend />
                        <Bar
                          dataKey="percentPacked"
                          name="Packed (%)"
                          fill="#3498db"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="reports" className="space-y-4">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Packing Trends</CardTitle>
              <CardDescription>
                Items packed and delivered over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart
                    data={[
                      {
                        date: "Mon",
                        packed: 5,
                        delivered: 3,
                      },
                      {
                        date: "Tue",
                        packed: 8,
                        delivered: 4,
                      },
                      {
                        date: "Wed",
                        packed: 12,
                        delivered: 7,
                      },
                      {
                        date: "Thu",
                        packed: 9,
                        delivered: 6,
                      },
                      {
                        date: "Fri",
                        packed: 15,
                        delivered: 10,
                      },
                      {
                        date: "Sat",
                        packed: 18,
                        delivered: 12,
                      },
                      {
                        date: "Sun",
                        packed: 14,
                        delivered: 9,
                      },
                    ]}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="packed"
                      stroke="#2ecc71"
                      activeDot={{ r: 8 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="delivered"
                      stroke="#e74c3c"
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
