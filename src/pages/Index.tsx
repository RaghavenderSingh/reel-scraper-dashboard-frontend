
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  BarChart3, 
  Clock, 
  Database, 
  Globe, 
  Play, 
  Settings, 
  Users, 
  Zap,
  CheckCircle,
  XCircle,
  Loader,
  Plus,
  Eye,
  Download
} from 'lucide-react';
import { JobManager } from '@/components/JobManager';
import { ResultsViewer } from '@/components/ResultsViewer';
import { HealthMonitor } from '@/components/HealthMonitor';
import { StatsOverview } from '@/components/StatsOverview';
import { ProfileValidator } from '@/components/ProfileValidator';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [apiStatus, setApiStatus] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchApiStatus();
    fetchStats();
    const interval = setInterval(() => {
      fetchApiStatus();
      fetchStats();
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchApiStatus = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/status');
      const data = await response.json();
      setApiStatus(data);
    } catch (error) {
      console.error('Failed to fetch API status:', error);
      setApiStatus({ status: 'offline', message: 'Unable to connect to API' });
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/stats');
      const data = await response.json();
      setStats(data.stats);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'running': return 'bg-green-500';
      case 'offline': return 'bg-red-500';
      default: return 'bg-yellow-500';
    }
  };

  const capabilities = [
    {
      icon: <Play className="h-5 w-5" />,
      title: "Batch Job Processing",
      description: "Create and manage multiple scraping jobs with configurable concurrency and scheduling."
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: "Profile Validation",
      description: "Validate Facebook profile URLs before processing to ensure successful scraping operations."
    },
    {
      icon: <Database className="h-5 w-5" />,
      title: "Data Export",
      description: "Export scraped data in multiple formats including JSON and CSV for further analysis."
    },
    {
      icon: <Activity className="h-5 w-5" />,
      title: "Real-time Monitoring",
      description: "Monitor job progress, system health, and performance metrics in real-time."
    },
    {
      icon: <BarChart3 className="h-5 w-5" />,
      title: "Analytics & Statistics",
      description: "Comprehensive statistics and analytics about scraping operations and results."
    },
    {
      icon: <Zap className="h-5 w-5" />,
      title: "High Performance",
      description: "Optimized scraping engine with retry mechanisms and error handling."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Globe className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Facebook Scraper Dashboard</h1>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(apiStatus?.status)}`}></div>
              <Badge variant={apiStatus?.status === 'running' ? 'default' : 'destructive'}>
                {apiStatus?.status || 'Unknown'}
              </Badge>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {apiStatus?.message}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
            <TabsTrigger value="validate">Validate</TabsTrigger>
            <TabsTrigger value="monitor">Monitor</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Welcome Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-6 w-6 text-blue-600" />
                  <span>Welcome to Facebook Scraper API</span>
                </CardTitle>
                <CardDescription>
                  A powerful API for scraping Facebook profiles, posts, and reels with advanced job management and monitoring.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Quick Stats */}
            {stats && <StatsOverview stats={stats} />}

            {/* Capabilities Grid */}
            <div>
              <h2 className="text-xl font-semibold mb-4">API Capabilities</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {capabilities.map((capability, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 text-lg">
                        <div className="text-blue-600">{capability.icon}</div>
                        <span>{capability.title}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">{capability.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common operations to get you started</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-4">
                <Button onClick={() => setActiveTab('jobs')} className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Create New Job</span>
                </Button>
                <Button variant="outline" onClick={() => setActiveTab('results')} className="flex items-center space-x-2">
                  <Eye className="h-4 w-4" />
                  <span>View Results</span>
                </Button>
                <Button variant="outline" onClick={() => setActiveTab('validate')} className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Validate Profiles</span>
                </Button>
                <Button variant="outline" onClick={() => setActiveTab('monitor')} className="flex items-center space-x-2">
                  <Activity className="h-4 w-4" />
                  <span>System Monitor</span>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="jobs">
            <JobManager />
          </TabsContent>

          <TabsContent value="results">
            <ResultsViewer />
          </TabsContent>

          <TabsContent value="validate">
            <ProfileValidator />
          </TabsContent>

          <TabsContent value="monitor">
            <HealthMonitor />
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-6 w-6" />
                  <span>API Configuration</span>
                </CardTitle>
                <CardDescription>
                  Current scraper configuration and settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-gray-600">
                    Configuration settings are managed server-side. Contact your administrator to modify these settings.
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Max Concurrent Profiles</label>
                      <p className="text-lg">5</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">API Port</label>
                      <p className="text-lg">3001</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Scroll Count</label>
                      <p className="text-lg">3</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Retry Attempts</label>
                      <p className="text-lg">3</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
