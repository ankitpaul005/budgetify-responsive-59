
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, Users, Mail, Clock } from "lucide-react";
import TextToSpeech from '@/components/accessibility/TextToSpeech';
import { useAuth } from '@/context/AuthContext';
import { fetchCompanionGroups, createCompanionGroup, inviteCompanion, CompanionGroup } from '@/services/companionService';
import { formatDistanceToNow } from 'date-fns';

const CompanionsPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedGroup, setSelectedGroup] = useState<CompanionGroup | null>(null);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const { data: companionGroups, isLoading, error, refetch } = useQuery({
    queryKey: ['companionGroups', user?.id],
    queryFn: () => fetchCompanionGroups(user?.id || ''),
    enabled: !!user?.id,
  });

  // Get the page content as text for read aloud feature
  const getPageText = () => {
    return `Companion Mode. ${
      !user ? 'Please login to use companion mode.' : 
      isLoading ? 'Loading your companion groups.' : 
      error ? 'Error loading companion groups.' :
      companionGroups && companionGroups.length > 0 ? 
        `You have ${companionGroups.length} companion groups. ${
          selectedGroup ? 
            `Selected group: ${selectedGroup.name}. This group has ${selectedGroup.members.length} members.` : 
            'Select a group to see its details.'
        }` : 
        'You have no companion groups. Create a new group to get started.'
    }`;
  };

  if (!user) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle>Login Required</CardTitle>
              <CardDescription>
                You need to be logged in to use companion mode
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-center">
              <Button asChild>
                <a href="/login">Login</a>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Companion Mode</h1>
            <p className="text-muted-foreground">
              Manage your budget companions and groups
            </p>
          </div>
          <TextToSpeech text={getPageText()} buttonLabel="Read Page" />
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <Card className="w-full md:w-1/3">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center">
                  <Users className="mr-2 h-5 w-5" /> Your Groups
                </CardTitle>
                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <PlusCircle className="h-4 w-4 mr-1" /> New
                    </Button>
                  </DialogTrigger>
                  <CreateGroupDialog 
                    onSuccess={() => {
                      refetch();
                      setCreateDialogOpen(false);
                    }}
                    userId={user.id}
                  />
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : error ? (
                <div className="text-center p-4">
                  <p className="text-red-500 mb-2">Error loading groups</p>
                  <Button onClick={() => refetch()} size="sm">Try again</Button>
                </div>
              ) : !companionGroups || companionGroups.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No companion groups yet</p>
                  <Button onClick={() => setCreateDialogOpen(true)}>Create Your First Group</Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {companionGroups.map(group => (
                    <Button
                      key={group.id}
                      variant={selectedGroup?.id === group.id ? "default" : "outline"}
                      className="w-full justify-start text-left h-auto py-3"
                      onClick={() => setSelectedGroup(group)}
                    >
                      <div>
                        <p className="font-medium">{group.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {group.members.length} member{group.members.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="w-full md:w-2/3">
            {!selectedGroup ? (
              <div className="h-[400px] flex items-center justify-center">
                <div className="text-center">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-medium">No Group Selected</h3>
                  <p className="mt-2 text-muted-foreground">
                    Select a group from the left or create a new one
                  </p>
                </div>
              </div>
            ) : (
              <>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{selectedGroup.name}</CardTitle>
                      <CardDescription>{selectedGroup.description || 'No description'}</CardDescription>
                    </div>
                    <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Mail className="h-4 w-4 mr-2" /> Invite
                        </Button>
                      </DialogTrigger>
                      <InviteDialog 
                        groupId={selectedGroup.id}
                        onSuccess={() => {
                          refetch();
                          setInviteDialogOpen(false);
                        }}
                      />
                    </Dialog>
                  </div>
                </CardHeader>

                <CardContent>
                  <Tabs defaultValue="members">
                    <TabsList className="mb-4">
                      <TabsTrigger value="members">Members</TabsTrigger>
                      <TabsTrigger value="settings">Settings</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="members">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Member</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Joined</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedGroup.members.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={3} className="text-center py-8">
                                No members yet. Invite someone to join!
                              </TableCell>
                            </TableRow>
                          ) : (
                            selectedGroup.members.map(member => (
                              <TableRow key={member.id}>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8">
                                      <AvatarImage src={member.avatar_url} />
                                      <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="font-medium">{member.name}</p>
                                      <p className="text-xs text-muted-foreground">{member.email}</p>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <span className={`px-2 py-1 rounded-full text-xs ${
                                    member.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' :
                                    member.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100' :
                                    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                                  }`}>
                                    {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                                  </span>
                                </TableCell>
                                <TableCell className="flex items-center gap-1 text-muted-foreground">
                                  <Clock className="h-3 w-3" /> 
                                  {formatDistanceToNow(new Date(member.created_at), { addSuffix: true })}
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </TabsContent>
                    
                    <TabsContent value="settings">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="group-name">Group Name</Label>
                          <Input id="group-name" value={selectedGroup.name} disabled />
                        </div>
                        <div>
                          <Label htmlFor="group-description">Description</Label>
                          <Input id="group-description" value={selectedGroup.description || ''} disabled />
                        </div>
                        <Button variant="destructive" disabled>
                          Delete Group
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
};

interface CreateGroupDialogProps {
  onSuccess: () => void;
  userId: string;
}

const CreateGroupDialog: React.FC<CreateGroupDialogProps> = ({ onSuccess, userId }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      description: ''
    }
  });

  const onSubmit = async (data: { name: string; description: string }) => {
    setIsSubmitting(true);
    try {
      await createCompanionGroup(userId, data.name, data.description);
      toast.success("Group created successfully");
      onSuccess();
    } catch (error) {
      console.error("Error creating group:", error);
      toast.error("Failed to create group");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Create New Group</DialogTitle>
        <DialogDescription>
          Create a new companion group to manage budgets together.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="name">Group Name</Label>
            <Input
              id="name"
              placeholder="Family Budget"
              {...register("name", { required: "Group name is required" })}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input
              id="description"
              placeholder="Manage our family expenses together"
              {...register("description")}
            />
          </div>
        </div>
        <DialogFooter className="mt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Group"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

interface InviteDialogProps {
  groupId: string;
  onSuccess: () => void;
}

const InviteDialog: React.FC<InviteDialogProps> = ({ groupId, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    try {
      const success = await inviteCompanion(groupId, email);
      if (success) {
        toast.success(`Invitation sent to ${email}`);
        setEmail('');
        onSuccess();
      } else {
        toast.error("Failed to send invitation");
      }
    } catch (error) {
      console.error("Error sending invitation:", error);
      toast.error("Failed to send invitation");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Invite Companion</DialogTitle>
        <DialogDescription>
          Send an email invitation to collaborate on your budget.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="colleague@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>
        <DialogFooter className="mt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : "Send Invitation"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

export default CompanionsPage;
