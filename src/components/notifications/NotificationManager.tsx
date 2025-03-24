
import React, { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  read: boolean;
  created_at: string;
}

interface NotificationSettings {
  stockAlerts: boolean;
  marketUpdates: boolean;
  investmentRecommendations: boolean;
  accountActivity: boolean;
}

const NotificationManager: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [settings, setSettings] = useState<NotificationSettings>({
    stockAlerts: true,
    marketUpdates: true,
    investmentRecommendations: true,
    accountActivity: true,
  });

  useEffect(() => {
    if (!user) return;
    
    // Load notifications from local storage for demo purposes
    const storedNotifications = localStorage.getItem(`budgetify-notifications-${user.id}`);
    if (storedNotifications) {
      const parsedNotifications = JSON.parse(storedNotifications);
      setNotifications(parsedNotifications);
      setUnreadCount(parsedNotifications.filter((n: Notification) => !n.read).length);
    } else {
      // Set demo notifications for first-time users
      const demoNotifications: Notification[] = [
        {
          id: "1",
          title: "Market Update",
          message: "Major indices are up today with tech sector leading gains.",
          type: "info",
          read: false,
          created_at: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: "2",
          title: "Stock Alert: AAPL",
          message: "Apple Inc. stock has moved 5% in the last hour.",
          type: "warning",
          read: false,
          created_at: new Date(Date.now() - 7200000).toISOString(),
        },
        {
          id: "3",
          title: "New Investment Recommendation",
          message: "Based on your profile, we suggest adding more diversification to your portfolio.",
          type: "success",
          read: false,
          created_at: new Date(Date.now() - 86400000).toISOString(),
        },
      ];
      
      setNotifications(demoNotifications);
      setUnreadCount(demoNotifications.length);
      localStorage.setItem(`budgetify-notifications-${user.id}`, JSON.stringify(demoNotifications));
    }
    
    // Set up realtime subscription for new notifications
    const channel = supabase
      .channel('custom-all-channel')
      .on(
        'broadcast',
        { event: 'notification' },
        (payload) => {
          if (payload.payload && typeof payload.payload === 'object') {
            const newNotification = payload.payload as Notification;
            handleNewNotification(newNotification);
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleNewNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
    
    // Show toast for new notification
    toast[notification.type](`${notification.title}: ${notification.message}`);
    
    // Save to local storage
    if (user) {
      localStorage.setItem(
        `budgetify-notifications-${user.id}`, 
        JSON.stringify([notification, ...notifications])
      );
    }
  };

  const markAsRead = (id: string) => {
    const updatedNotifications = notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    );
    
    setNotifications(updatedNotifications);
    setUnreadCount(updatedNotifications.filter(n => !n.read).length);
    
    if (user) {
      localStorage.setItem(
        `budgetify-notifications-${user.id}`, 
        JSON.stringify(updatedNotifications)
      );
    }
  };

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(notification => ({ ...notification, read: true }));
    setNotifications(updatedNotifications);
    setUnreadCount(0);
    
    if (user) {
      localStorage.setItem(
        `budgetify-notifications-${user.id}`, 
        JSON.stringify(updatedNotifications)
      );
    }
    
    toast.success("All notifications marked as read");
  };

  const updateSettings = (key: keyof NotificationSettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    toast.success(`${value ? 'Enabled' : 'Disabled'} ${key} notifications`);
  };

  const testNotification = () => {
    const types = ["info", "warning", "success", "error"] as const;
    const randomType = types[Math.floor(Math.random() * types.length)];
    
    const newNotification: Notification = {
      id: Date.now().toString(),
      title: "Test Notification",
      message: `This is a test ${randomType} notification.`,
      type: randomType,
      read: false,
      created_at: new Date().toISOString(),
    };
    
    handleNewNotification(newNotification);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full bg-budget-red text-white text-xs">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-medium">Notifications</h3>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              Mark all read
            </Button>
            <Button variant="ghost" size="icon" onClick={testNotification}>
              <Bell className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="max-h-[300px] overflow-y-auto">
          {notifications.length > 0 ? (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={`p-3 ${notification.read ? 'bg-transparent' : 'bg-muted/40'}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`text-sm font-medium ${
                      notification.type === 'error' ? 'text-budget-red' :
                      notification.type === 'warning' ? 'text-budget-yellow' :
                      notification.type === 'success' ? 'text-budget-green' :
                      'text-budget-blue'
                    }`}>
                      {notification.title}
                    </h4>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm">{notification.message}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <BellOff className="mx-auto h-6 w-6 mb-2" />
              <p>No notifications</p>
            </div>
          )}
        </div>
        
        <div className="border-t p-3">
          <h4 className="font-medium mb-2">Notification Settings</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="stock-alerts" className="text-sm">Stock Alerts</Label>
              <Switch 
                id="stock-alerts"
                checked={settings.stockAlerts}
                onCheckedChange={(checked) => updateSettings('stockAlerts', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="market-updates" className="text-sm">Market Updates</Label>
              <Switch 
                id="market-updates"
                checked={settings.marketUpdates}
                onCheckedChange={(checked) => updateSettings('marketUpdates', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="investment-recommendations" className="text-sm">Investment Recommendations</Label>
              <Switch 
                id="investment-recommendations"
                checked={settings.investmentRecommendations}
                onCheckedChange={(checked) => updateSettings('investmentRecommendations', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="account-activity" className="text-sm">Account Activity</Label>
              <Switch 
                id="account-activity"
                checked={settings.accountActivity}
                onCheckedChange={(checked) => updateSettings('accountActivity', checked)}
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationManager;
