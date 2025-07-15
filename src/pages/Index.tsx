import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Activity,
  Users,
  BarChart3,
  Settings,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Zap,
  Target,
  Layers,
  Shield,
  Database,
  Network,
  Server,
} from "lucide-react";
import { JobManager } from "@/components/JobManager";
import { ProfileValidator } from "@/components/ProfileValidator";
import { StatsOverview } from "@/components/StatsOverview";
import { ResultsViewer } from "@/components/ResultsViewer";
import { HealthMonitor } from "@/components/HealthMonitor";
import { apiService, StatsObject } from "@/lib/api";

export default function Index() {
  const [apiStatus, setApiStatus] = useState<any>(null);
  const [stats, setStats] = useState<StatsObject | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchApiStatus();
    fetchStats();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchApiStatus();
      fetchStats();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchApiStatus = async () => {
    try {
      const data = await apiService.getStatus();
      setApiStatus(data);
    } catch (error) {
      console.error("Failed to fetch API status:", error);
      setApiStatus({ status: "offline", message: "Unable to connect to API" });
    }
  };

  const fetchStats = async () => {
    try {
      const data = await apiService.getStats();
      setStats(data.stats);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "bg-green-500";
      case "offline":
        return "bg-red-500";
      case "degraded":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      icon: <BarChart3 className="h-4 w-4" />,
      description: "Dashboard overview with key metrics and system status.",
    },
    {
      id: "jobs",
      label: "Job Management",
      icon: <Activity className="h-4 w-4" />,
      description:
        "Create and manage multiple scraping jobs with configurable concurrency and scheduling.",
    },
    {
      id: "validator",
      label: "Profile Validator",
      icon: <Users className="h-4 w-4" />,
      description:
        "Validate Facebook profile URLs before processing to ensure successful scraping operations.",
    },
    {
      id: "results",
      label: "Results Viewer",
      icon: <Database className="h-4 w-4" />,
      description:
        "Browse and analyze scraped data with enhanced extraction mode support.",
    },
    {
      id: "stats",
      label: "Statistics",
      icon: <TrendingUp className="h-4 w-4" />,
      description:
        "Comprehensive statistics and analytics about scraping operations and results.",
    },
    {
      id: "monitor",
      label: "Health Monitor",
      icon: <Server className="h-4 w-4" />,
      description: "Real-time system monitoring and performance metrics.",
    },
  ];

  const features = [
    {
      icon: <Zap className="h-6 w-6 text-blue-600" />,
      title: "Enhanced Extraction Modes",
      description:
        "Support for profile-only, main reels page, and comprehensive dual extraction modes.",
    },
    {
      icon: <Target className="h-6 w-6 text-green-600" />,
      title: "Advanced Job Management",
      description:
        "Create, monitor, and manage scraping jobs with configurable concurrency and extraction modes.",
    },
    {
      icon: <Layers className="h-6 w-6 text-purple-600" />,
      title: "Dual Extraction Technology",
      description:
        "Combines timeline and reels section data for comprehensive results with date and view count matching.",
    },
    {
      icon: <Shield className="h-6 w-6 text-orange-600" />,
      title: "Robust Error Handling",
      description:
        "Advanced retry mechanisms, validation, and comprehensive error reporting.",
    },
    {
      icon: <Network className="h-6 w-6 text-pink-600" />,
      title: "Real-time Monitoring",
      description:
        "Live system health monitoring with detailed performance metrics and logging.",
    },
    {
      icon: <Database className="h-6 w-6 text-indigo-600" />,
      title: "Data Export & Analysis",
      description:
        "Export results in JSON/CSV formats with detailed analytics and filtering capabilities.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div
                  className={`w-2 h-2 rounded-full ${getStatusColor(
                    apiStatus?.status
                  )}`}
                ></div>
                <Badge
                  variant={
                    apiStatus?.status === "running" ? "default" : "destructive"
                  }
                >
                  {apiStatus?.status || "Unknown"}
                </Badge>
              </div>
              <div className="text-sm text-gray-600">{apiStatus?.message}</div>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                {apiStatus?.timestamp
                  ? new Date(apiStatus.timestamp).toLocaleTimeString()
                  : "Unknown"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                <span>Welcome to Facebook Scraper API</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                A powerful API for scraping Facebook profiles, posts, and reels
                with advanced job management and monitoring.
              </p>
            </div>

            {/* API Capabilities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>API Capabilities</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0">{feature.icon}</div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {feature.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            {stats && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Quick Statistics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {stats.totalJobs}
                      </div>
                      <div className="text-sm text-gray-600">Total Jobs</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {stats.activeJobs}
                      </div>
                      <div className="text-sm text-gray-600">Active Jobs</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {stats.totalProfilesProcessed}
                      </div>
                      <div className="text-sm text-gray-600">
                        Profiles Processed
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-pink-600">
                        {stats.totalReelsFound}
                      </div>
                      <div className="text-sm text-gray-600">Reels Found</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {stats.last24Hours.jobsCreated}
                      </div>
                      <div className="text-sm text-gray-600">Jobs (24h)</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-indigo-600">
                        {stats.averageReelsPerProfile}
                      </div>
                      <div className="text-sm text-gray-600">
                        Avg Reels/Profile
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* API Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>API Configuration</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium">API Port</label>
                    <p className="text-lg font-semibold">3001</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">
                      Max Concurrent Profiles
                    </label>
                    <p className="text-lg font-semibold">10</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">
                      Request Timeout
                    </label>
                    <p className="text-lg font-semibold">30s</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">
                      Retry Attempts
                    </label>
                    <p className="text-lg font-semibold">3</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "jobs" && <JobManager />}
        {activeTab === "validator" && <ProfileValidator />}
        {activeTab === "results" && <ResultsViewer />}
        {activeTab === "stats" && stats && <StatsOverview stats={stats} />}
        {activeTab === "monitor" && <HealthMonitor />}
      </div>
    </div>
  );
}
