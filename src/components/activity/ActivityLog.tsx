
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Search, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ActivityItem, getRecentActivities } from "@/services/activityService";

const ActivityLog: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    fetchActivities();
  }, [user, navigate]);

  const fetchActivities = async () => {
    setIsLoading(true);
    try {
      if (!user?.id) return;
      
      const data = await getRecentActivities(user.id, 100);
      setActivities(data);
    } catch (error) {
      console.error("Failed to fetch activities:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredActivities = activities.filter(
    (activity) =>
      activity.activity_type.toLowerCase().includes(filter.toLowerCase()) ||
      activity.description.toLowerCase().includes(filter.toLowerCase())
  );

  const getActivityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "login":
        return <Activity className="h-4 w-4 text-blue-500" />;
      case "transaction":
        return <Activity className="h-4 w-4 text-green-500" />;
      case "investment":
        return <Activity className="h-4 w-4 text-yellow-500" />;
      case "ai interaction":
        return <Activity className="h-4 w-4 text-purple-500" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-bold">Activity Log</CardTitle>
        <div className="flex items-center gap-2">
          <div className="relative w-full max-w-[180px]">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Filter activities..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-8 h-9 w-full md:w-[180px]"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={fetchActivities}
            className="h-9 w-9"
            title="Refresh activities"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center space-x-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredActivities.length > 0 ? (
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {filteredActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start p-3 rounded-lg border border-border hover:bg-muted/40 transition-colors"
              >
                <div className="mr-3 mt-0.5">
                  {getActivityIcon(activity.activity_type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-medium">{activity.activity_type}</p>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.created_at), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {activity.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <div className="mx-auto w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-3">
              <Activity className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-1">No activities found</h3>
            <p className="text-muted-foreground text-sm">
              {filter
                ? "Try adjusting your filter criteria"
                : "Your activity history will appear here"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityLog;
