import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ActivityTypes, logActivity } from "@/services/activityService";
import { currencyRates, currencySymbols } from "@/utils/formatting";

const SettingsPage = () => {
  const { isAuthenticated, user, userProfile, updateProfile, signOut } = useAuth();
  const navigate = useNavigate();
  
  const [name, setName] = useState(userProfile?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [income, setIncome] = useState(userProfile?.total_income?.toString() || "0");
  const [currency, setCurrency] = useState(userProfile?.currency || "INR");
  
  // Update form when userProfile changes
  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name || "");
      setCurrency(userProfile.currency || "INR");
      if (userProfile.total_income) {
        setIncome(userProfile.total_income.toString());
      }
    }
  }, [userProfile]);
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [transactionAlerts, setTransactionAlerts] = useState(true);
  const [budgetAlerts, setBudgetAlerts] = useState(true);
  const [investmentAlerts, setInvestmentAlerts] = useState(true);
  
  // Display settings
  const [dateFormat, setDateFormat] = useState("MM/DD/YYYY");
  const [theme, setTheme] = useState("system");
  
  // Security settings
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [loginNotifications, setLoginNotifications] = useState(true);
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    } else if (user) {
      // Log activity when visiting the page
      logActivity(
        user.id,
        ActivityTypes.PROFILE,
        "Viewed settings page"
      );
    }
  }, [isAuthenticated, navigate, user]);
  
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    try {
      await updateProfile({
        name,
        total_income: parseFloat(income),
        currency: currency,
      });
      
      // Log profile update activity
      logActivity(
        user.id,
        ActivityTypes.PROFILE_UPDATE,
        "Updated profile settings"
      );
      
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };
  
  const handleNotificationUpdate = () => {
    if (!user) return;
    
    // In a real app, these would be saved to the database
    toast.success("Notification preferences saved");
    
    // Log activity
    logActivity(
      user.id,
      ActivityTypes.PROFILE_UPDATE,
      "Updated notification settings"
    );
  };
  
  const handleDisplayUpdate = () => {
    if (!user) return;
    
    // In a real app, these would be saved to the database
    toast.success("Display preferences saved");
    
    // Log activity
    logActivity(
      user.id,
      ActivityTypes.PROFILE_UPDATE,
      "Updated display settings"
    );
  };
  
  const handleSecurityUpdate = () => {
    if (!user) return;
    
    // In a real app, these would be saved to the database
    toast.success("Security settings saved");
    
    // Log activity
    logActivity(
      user.id,
      ActivityTypes.PROFILE_UPDATE,
      "Updated security settings"
    );
  };
  
  const handleSignOut = async () => {
    if (!user) return;
    
    try {
      // Log logout activity
      await logActivity(
        user.id,
        ActivityTypes.LOGOUT,
        "User logged out"
      );
      
      await signOut();
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out");
    }
  };
  
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 text-left">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="display">Display</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>
          
          {/* Profile Settings */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>
                  Manage your personal information and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled
                      />
                      <p className="text-xs text-muted-foreground">
                        Email cannot be changed
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="income">Annual Income</Label>
                      <Input
                        id="income"
                        type="number"
                        value={income}
                        onChange={(e) => setIncome(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currency">Preferred Currency</Label>
                      <Select value={currency} onValueChange={setCurrency}>
                        <SelectTrigger id="currency">
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(currencyRates).map((curr) => (
                            <SelectItem key={curr} value={curr}>
                              {currencySymbols[curr]} {curr} - {curr === "USD" ? "US Dollar" : 
                                curr === "INR" ? "Indian Rupee" :
                                curr === "EUR" ? "Euro" :
                                curr === "GBP" ? "British Pound" :
                                curr === "JPY" ? "Japanese Yen" :
                                curr === "CAD" ? "Canadian Dollar" :
                                curr === "AUD" ? "Australian Dollar" :
                                curr === "SGD" ? "Singapore Dollar" :
                                curr === "AED" ? "UAE Dirham" :
                                curr === "CNY" ? "Chinese Yuan" : 
                                curr === "BTC" ? "Bitcoin" : curr}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-1">
                        Current rate: 1 USD = {currencyRates[currency]} {currency}
                      </p>
                    </div>
                  </div>
                  
                  <Button type="submit">Save Profile</Button>
                </form>
                
                <Separator className="my-8" />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Account Actions</h3>
                  <div className="flex flex-col md:flex-row gap-4">
                    <Button variant="outline" onClick={handleSignOut}>
                      Sign Out
                    </Button>
                    <Button variant="destructive">
                      Delete Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Notification Settings */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Manage how and when you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Notification Channels</h3>
                    <div className="grid gap-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="email-notifications">Email Notifications</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive notifications via email
                          </p>
                        </div>
                        <Switch
                          id="email-notifications"
                          checked={emailNotifications}
                          onCheckedChange={setEmailNotifications}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="push-notifications">Push Notifications</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive notifications in your browser
                          </p>
                        </div>
                        <Switch
                          id="push-notifications"
                          checked={pushNotifications}
                          onCheckedChange={setPushNotifications}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Notification Types</h3>
                    <div className="grid gap-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="transaction-alerts">Transaction Alerts</Label>
                          <p className="text-sm text-muted-foreground">
                            Notifications for new transactions
                          </p>
                        </div>
                        <Switch
                          id="transaction-alerts"
                          checked={transactionAlerts}
                          onCheckedChange={setTransactionAlerts}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="budget-alerts">Budget Alerts</Label>
                          <p className="text-sm text-muted-foreground">
                            Notifications for budget updates
                          </p>
                        </div>
                        <Switch
                          id="budget-alerts"
                          checked={budgetAlerts}
                          onCheckedChange={setBudgetAlerts}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="investment-alerts">Investment Alerts</Label>
                          <p className="text-sm text-muted-foreground">
                            Notifications for investment changes
                          </p>
                        </div>
                        <Switch
                          id="investment-alerts"
                          checked={investmentAlerts}
                          onCheckedChange={setInvestmentAlerts}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <Button onClick={handleNotificationUpdate}>
                    Save Notification Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Display Settings */}
          <TabsContent value="display">
            <Card>
              <CardHeader>
                <CardTitle>Display Settings</CardTitle>
                <CardDescription>
                  Customize how the application displays information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="dateFormat">Date Format</Label>
                      <Select value={dateFormat} onValueChange={setDateFormat}>
                        <SelectTrigger id="dateFormat">
                          <SelectValue placeholder="Select date format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                          <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                          <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="theme">Theme</Label>
                      <Select value={theme} onValueChange={setTheme}>
                        <SelectTrigger id="theme">
                          <SelectValue placeholder="Select theme" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="system">System Default</SelectItem>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <Button onClick={handleDisplayUpdate}>
                    Save Display Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Security Settings */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage your account security and privacy
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Account Security</h3>
                    <div className="grid gap-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                          <p className="text-sm text-muted-foreground">
                            Add an extra layer of security to your account
                          </p>
                        </div>
                        <Switch
                          id="two-factor"
                          checked={twoFactorEnabled}
                          onCheckedChange={setTwoFactorEnabled}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="login-notifications">Login Notifications</Label>
                          <p className="text-sm text-muted-foreground">
                            Get notified of new login attempts
                          </p>
                        </div>
                        <Switch
                          id="login-notifications"
                          checked={loginNotifications}
                          onCheckedChange={setLoginNotifications}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Password</h3>
                    <Button variant="outline">Change Password</Button>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Sessions</h3>
                    <Button variant="outline">Manage Active Sessions</Button>
                  </div>
                  
                  <Button onClick={handleSecurityUpdate}>
                    Save Security Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default SettingsPage;
