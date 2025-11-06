import { RotateCw } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState, useCallback, memo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { 
  Users, TrendingUp, Code, DollarSign, Shield, Activity, 
  Database, Settings, Bell, FileText, Download, Trash2, 
  Search, Filter, BarChart3, Clock, AlertCircle, CheckCircle,
  XCircle, Loader2, Mail, Calendar
} from "lucide-react";
import { GenerationJobsTab } from "@/components/admin/GenerationJobsTab";
import { ProjectsManagementTab } from "@/components/admin/ProjectsManagementTab";

interface UserData {
  id: string;
  email: string;
  credits: number;
  claim_streak: number;
  last_claim_date: string | null;
  created_at: string;
  roles: string[];
  last_sign_in: string | null;
}

interface GenerationJob {
  id: string;
  user_id: string;
  status: string;
  description: string;
  created_at: string;
  completed_at: string | null;
  error_message: string | null;
}

interface ProjectData {
  id: string;
  user_id: string;
  project_name: string;
  platform: string;
  created_at: string;
}

interface AnalyticsData {
  total_users: number;
  total_projects: number;
  total_credits_distributed: number;
  projects_today: number;
  active_users_today: number;
  pending_jobs: number;
  failed_jobs: number;
}

const Admin = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserData[]>([]);
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [generationJobs, setGenerationJobs] = useState<GenerationJob[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    total_users: 0,
    total_projects: 0,
    total_credits_distributed: 0,
    projects_today: 0,
    active_users_today: 0,
    pending_jobs: 0,
    failed_jobs: 0
  });
  const [selectedUserEmail, setSelectedUserEmail] = useState("");
  const [whitelistEmail, setWhitelistEmail] = useState("");
  const [creditAmount, setCreditAmount] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [emailSuggestions, setEmailSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (!roleData) {
        toast.error('Access denied: Admin only');
        navigate('/');
        return;
      }

      setIsAdmin(true);
      await Promise.all([fetchUsers(), fetchAnalytics(), fetchProjects(), fetchGenerationJobs()]);
    } catch (error) {
      console.error('Error checking admin access:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-get-users');
      
      if (error) throw error;
      
      if (data?.success && data?.users) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    }
  };

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, user_id, project_name, platform, created_at')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchGenerationJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('generation_jobs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setGenerationJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const fetchAnalytics = async () => {
    const [usersCount, projectsCount, creditsData, todayProjects, pendingJobs, failedJobs] = await Promise.all([
      supabase.from('user_credits').select('*', { count: 'exact', head: true }),
      supabase.from('projects').select('*', { count: 'exact', head: true }),
      supabase.from('user_credits').select('credits'),
      supabase.from('projects')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date().toISOString().split('T')[0]),
      supabase.from('generation_jobs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending'),
      supabase.from('generation_jobs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'failed')
    ]);

    const totalCredits = creditsData.data?.reduce((sum, u) => sum + (u.credits || 0), 0) || 0;

    setAnalytics({
      total_users: usersCount.count || 0,
      total_projects: projectsCount.count || 0,
      total_credits_distributed: totalCredits,
      projects_today: todayProjects.count || 0,
      active_users_today: 0,
      pending_jobs: pendingJobs.count || 0,
      failed_jobs: failedJobs.count || 0
    });
  };

  // Email autocomplete handler
  const handleEmailInput = useCallback((value: string, setter: (v: string) => void) => {
    setter(value);
    if (value.length > 0) {
      const suggestions = users
        .filter(u => u.email.toLowerCase().includes(value.toLowerCase()))
        .map(u => u.email)
        .slice(0, 5);
      setEmailSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [users]);

  const handleCreditAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCreditAmount(e.target.value);
  }, []);

  const handleGiveCredits = useCallback(async () => {
    if (!selectedUserEmail || !creditAmount) {
      toast.error('Please enter user email and credit amount');
      return;
    }

    const amount = parseInt(creditAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid credit amount');
      return;
    }

    const user = users.find(u => u.email.toLowerCase() === selectedUserEmail.toLowerCase());
    if (!user) {
      toast.error('User not found. Please check the email address.');
      return;
    }

    try {
      const { data: currentCredits } = await supabase
        .from('user_credits')
        .select('credits')
        .eq('user_id', user.id)
        .single();

      const { error } = await supabase
        .from('user_credits')
        .update({ credits: (currentCredits?.credits || 0) + amount })
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success(`Added ${amount} credits to ${selectedUserEmail}`);
      setCreditAmount('');
      setSelectedUserEmail('');
      setShowSuggestions(false);
      await fetchUsers();
    } catch (error) {
      console.error('Error giving credits:', error);
      toast.error('Failed to add credits');
    }
  }, [selectedUserEmail, creditAmount, users]);

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;
      toast.success('Project deleted successfully');
      await fetchProjects();
      await fetchAnalytics();
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    }
  };

  const handleRetryJob = async (jobId: string) => {
    try {
      const { error } = await supabase
        .from('generation_jobs')
        .update({ status: 'pending', error_message: null })
        .eq('id', jobId);

      if (error) throw error;
      
      toast.success('Job queued for retry');
      await fetchGenerationJobs();
    } catch (error) {
      console.error('Error retrying job:', error);
      toast.error('Failed to retry job');
    }
  };

  const handleCancelJob = async (jobId: string) => {
    try {
      const { error } = await supabase
        .from('generation_jobs')
        .update({ status: 'failed', error_message: 'Cancelled by admin' })
        .eq('id', jobId);

      if (error) throw error;
      toast.success('Job cancelled');
      await fetchGenerationJobs();
    } catch (error) {
      console.error('Error cancelling job:', error);
      toast.error('Failed to cancel job');
    }
  };

  const handleExportData = (type: string) => {
    let data: any[] = [];
    let filename = '';

    switch (type) {
      case 'users':
        data = users;
        filename = 'users_export.json';
        break;
      case 'projects':
        data = projects;
        filename = 'projects_export.json';
        break;
      case 'jobs':
        data = generationJobs;
        filename = 'generation_jobs_export.json';
        break;
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    toast.success(`Exported ${data.length} records`);
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredJobs = generationJobs.filter(job => {
    if (filterStatus !== 'all' && job.status !== filterStatus) return false;
    if (searchTerm && !job.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 text-center">
          <p className="text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-20 md:pt-24 px-4 md:px-6 pb-12 md:pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 md:mb-8">
            <div className="flex items-center gap-2 md:gap-3 mb-2">
              <Shield className="w-6 h-6 md:w-8 md:h-8 text-primary" />
              <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
            </div>
            <p className="text-sm md:text-base text-muted-foreground">Manage users, credits, and view analytics</p>
          </div>

          {/* Analytics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 md:gap-6 mb-10">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.total_users}</div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                <Code className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.total_projects}</div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Credits Pool</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.total_credits_distributed.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.projects_today}</div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.pending_jobs}</div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Failed</CardTitle>
                <XCircle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.failed_jobs}</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="users" className="space-y-8">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 gap-2 h-auto p-2 bg-muted/50">
              <TabsTrigger value="users" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Users className="w-4 h-4 mr-2" />
                Users
              </TabsTrigger>
              <TabsTrigger value="projects" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Code className="w-4 h-4 mr-2" />
                Projects
              </TabsTrigger>
              <TabsTrigger value="jobs" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Activity className="w-4 h-4 mr-2" />
                Jobs
              </TabsTrigger>
              <TabsTrigger value="credits" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <DollarSign className="w-4 h-4 mr-2" />
                Credits
              </TabsTrigger>
              <TabsTrigger value="whitelist" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Shield className="w-4 h-4 mr-2" />
                Whitelist
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>View and manage all registered users</CardDescription>
                  <div className="flex gap-4 mt-4">
                    <Input
                      placeholder="Search users by email or ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="max-w-sm border-primary/30 focus:border-primary focus:ring-primary/20 transition-all"
                    />
                    <Button onClick={() => handleExportData('users')} variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Credits</TableHead>
                        <TableHead>Streak</TableHead>
                        <TableHead>Roles</TableHead>
                        <TableHead>Last Login</TableHead>
                        <TableHead>Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground">
                            No users found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.email}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{user.credits.toLocaleString()}</Badge>
                            </TableCell>
                            <TableCell>{user.claim_streak}/7</TableCell>
                            <TableCell>
                              {user.roles.map(role => (
                                <Badge key={role} className="mr-1" variant={role === 'admin' ? 'default' : 'secondary'}>
                                  {role}
                                </Badge>
                              ))}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {user.last_sign_in ? new Date(user.last_sign_in).toLocaleDateString() : 'Never'}
                            </TableCell>
                            <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Projects Tab */}
            <TabsContent value="projects" className="space-y-4">
              <ProjectsManagementTab 
                projects={projects}
                onDeleteProject={handleDeleteProject}
                onExportData={handleExportData}
              />
            </TabsContent>

            {/* Jobs Tab */}
            <TabsContent value="jobs" className="space-y-4">
              <GenerationJobsTab
                jobs={filteredJobs}
                searchTerm={searchTerm}
                filterStatus={filterStatus}
                onSearchChange={setSearchTerm}
                onFilterChange={setFilterStatus}
                onRetryJob={handleRetryJob}
                onCancelJob={handleCancelJob}
              />
            </TabsContent>

            {/* Credits Tab */}
            <TabsContent value="credits" className="space-y-6">
              <Card className="border-primary/30">
                <CardHeader className="space-y-4 pb-6">
                  <div>
                    <CardTitle className="text-2xl">Give Credits to Users</CardTitle>
                    <CardDescription className="text-base mt-2">Add credits to any user account by typing their email</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="user-email" className="text-base font-semibold">User Email Address</Label>
                    <div className="relative">
                      <Input
                        id="user-email"
                        type="email"
                        placeholder="Enter user's email address..."
                        value={selectedUserEmail}
                        onChange={(e) => handleEmailInput(e.target.value, setSelectedUserEmail)}
                        onFocus={() => selectedUserEmail && setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        className="text-base p-3 border-primary/30 focus:border-primary focus:ring-primary/20 pr-10"
                      />
                      <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      
                      {showSuggestions && emailSuggestions.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-background border border-primary/30 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                          {emailSuggestions.map((email) => (
                            <button
                              key={email}
                              onClick={() => {
                                setSelectedUserEmail(email);
                                setShowSuggestions(false);
                              }}
                              className="w-full px-4 py-3 text-left hover:bg-primary/10 transition-colors border-b border-primary/10 last:border-0"
                            >
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm">{email}</span>
                                <Badge variant="secondary" className="ml-auto text-xs">
                                  {users.find(u => u.email === email)?.credits.toLocaleString()} credits
                                </Badge>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="credits" className="text-base font-semibold">Credit Amount</Label>
                    <Input
                      id="credits"
                      type="number"
                      min="1"
                      max="100000"
                      placeholder="Enter amount (e.g., 1000)"
                      value={creditAmount}
                      onChange={handleCreditAmountChange}
                      className="text-base p-3 border-primary/30 focus:border-primary focus:ring-primary/20"
                    />
                  </div>

                  <Button 
                    onClick={handleGiveCredits} 
                    className="w-full py-6 text-lg font-semibold"
                    disabled={!selectedUserEmail || !creditAmount}
                  >
                    <DollarSign className="w-5 h-5 mr-2" />
                    Give {creditAmount || '0'} Credits
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Whitelist Tab */}
            <TabsContent value="whitelist" className="space-y-6">
              <Card className="border-primary/30">
                <CardHeader className="space-y-4 pb-6">
                  <div>
                    <CardTitle className="text-2xl">Whitelist Users</CardTitle>
                    <CardDescription className="text-base mt-2">Grant admin access to users by typing their email</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="whitelist-email" className="text-base font-semibold">User Email Address</Label>
                    <div className="relative">
                      <Input
                        id="whitelist-email"
                        type="email"
                        placeholder="Enter user's email address..."
                        value={whitelistEmail}
                        onChange={(e) => handleEmailInput(e.target.value, setWhitelistEmail)}
                        className="text-base p-3 border-primary/30 focus:border-primary focus:ring-primary/20 pr-10"
                      />
                      <Shield className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    </div>
                  </div>

                  <Button
                    onClick={async () => {
                      if (!whitelistEmail) {
                        toast.error('Please enter a user email');
                        return;
                      }

                      const user = users.find(u => u.email.toLowerCase() === whitelistEmail.toLowerCase());
                      if (!user) {
                        toast.error('User not found. Please check the email address.');
                        return;
                      }

                      try {
                        const { error } = await supabase
                          .from('user_roles')
                          .insert({ user_id: user.id, role: 'admin' })
                          .select()
                          .single();

                        if (error) {
                          if (error.code === '23505') {
                            toast.error(`${whitelistEmail} is already an admin`);
                          } else {
                            throw error;
                          }
                        } else {
                          toast.success(`${whitelistEmail} is now an admin!`);
                          setWhitelistEmail('');
                          await fetchUsers();
                        }
                      } catch (error) {
                        console.error('Error whitelisting user:', error);
                        toast.error('Failed to whitelist user');
                      }
                    }}
                    className="w-full py-6 text-lg font-semibold"
                    disabled={!whitelistEmail}
                  >
                    <Shield className="w-5 h-5 mr-2" />
                    Grant Admin Access
                  </Button>

                  <div className="mt-8 p-6 bg-muted/50 rounded-lg border border-primary/20 space-y-4">
                    <h4 className="font-semibold text-lg flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Current Admins ({users.filter(u => u.roles.includes('admin')).length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {users.filter(u => u.roles.includes('admin')).map(admin => (
                        <Badge key={admin.id} variant="default" className="text-sm px-3 py-1">
                          <Mail className="w-3 h-3 mr-1" />
                          {admin.email}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* New Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-primary/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="w-5 h-5" />
                      Database Stats
                    </CardTitle>
                    <CardDescription>System-wide database information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-sm text-muted-foreground">Total Tables</span>
                      <Badge variant="secondary">5 tables</Badge>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-sm text-muted-foreground">Total Records</span>
                      <Badge variant="secondary">{analytics.total_users + analytics.total_projects} records</Badge>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-muted-foreground">Last Updated</span>
                      <Badge variant="outline">{new Date().toLocaleTimeString()}</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-primary/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="w-5 h-5" />
                      System Notifications
                    </CardTitle>
                    <CardDescription>Configure admin notifications</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">New user signup alerts</span>
                      <Badge variant="secondary">Enabled</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Failed job alerts</span>
                      <Badge variant="secondary">Enabled</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Daily reports</span>
                      <Badge variant="outline">Coming Soon</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-primary/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Quick Actions
                    </CardTitle>
                    <CardDescription>Common admin operations</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start" onClick={() => handleExportData('users')}>
                      <Download className="w-4 h-4 mr-2" />
                      Export All Users
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => handleExportData('projects')}>
                      <Download className="w-4 h-4 mr-2" />
                      Export All Projects
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => window.location.reload()}>
                      <RotateCw className="w-4 h-4 mr-2" />
                      Refresh Dashboard
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-primary/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      System Health
                    </CardTitle>
                    <CardDescription>Monitor system status</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Database</span>
                      </div>
                      <Badge variant="secondary" className="bg-green-500/10 text-green-500">Healthy</Badge>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Authentication</span>
                      </div>
                      <Badge variant="secondary" className="bg-green-500/10 text-green-500">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm">Failed Jobs</span>
                      </div>
                      <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500">
                        {analytics.failed_jobs} pending
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default memo(Admin);
