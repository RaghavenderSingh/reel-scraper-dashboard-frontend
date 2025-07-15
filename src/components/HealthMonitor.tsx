import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Activity,
  Server,
  Clock,
  MemoryStick,
  Cpu,
  HardDrive,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BarChart3,
  Settings,
  Database,
  Network,
  Shield,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/lib/api";

export const HealthMonitor = () => {
  const [healthData, setHealthData] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [logsLoading, setLogsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchHealthData();
    fetchLogs();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchHealthData();
      fetchLogs();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchHealthData = async () => {
    try {
      const data = await apiService.getMonitoringHealth();
      setHealthData(data);
    } catch (error) {
      console.error("Failed to fetch health data:", error);
      setHealthData({
        status: "unhealthy",
        error: "Failed to connect to API",
      });
    }
  };

  const fetchLogs = async () => {
    setLogsLoading(true);
    try {
      const data = await apiService.getLogs(50);
      setLogs(data.logs || []);
    } catch (error) {
      console.error("Failed to fetch logs:", error);
      setLogs([]);
      toast({
        title: "Error",
        description: "Failed to fetch system logs",
        variant: "destructive",
      });
    } finally {
      setLogsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-green-100 text-green-800";
      case "unhealthy":
        return "bg-red-100 text-red-800";
      case "degraded":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "unhealthy":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "degraded":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatMemory = (bytes: number) => {
    if (!bytes || isNaN(bytes) || !isFinite(bytes)) {
      return "N/A";
    }
    const mb = bytes / (1024 * 1024);
    if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
    return `${mb.toFixed(0)} MB`;
  };

  const formatPercentage = (value: number) => {
    if (isNaN(value) || !isFinite(value)) {
      return "N/A";
    }
    return `${Math.round(value * 100)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">System Health Monitor</h2>
          <p className="text-gray-600">
            Real-time monitoring of API health and performance
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={fetchHealthData}
            className="flex items-center space-x-2"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Health Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  System Status
                </p>
                <p className="text-lg font-semibold capitalize">
                  {healthData?.status || "Unknown"}
                </p>
              </div>
              <div
                className={`p-2 rounded-lg ${getStatusColor(
                  healthData?.status || "unknown"
                )}`}
              >
                {getStatusIcon(healthData?.status || "unknown")}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Uptime</p>
                <p className="text-lg font-semibold">
                  {healthData?.uptime
                    ? formatUptime(healthData.uptime)
                    : "Unknown"}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-blue-50">
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                <p className="text-lg font-semibold">
                  {healthData?.activeJobs || 0}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-green-50">
                <Activity className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Last Updated
                </p>
                <p className="text-lg font-semibold">
                  {healthData?.timestamp
                    ? new Date(healthData.timestamp).toLocaleTimeString()
                    : "Unknown"}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-purple-50">
                <Server className="h-4 w-4 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Resources */}
      {healthData?.memory && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MemoryStick className="h-5 w-5" />
              <span>System Resources</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Memory Usage</span>
                  <span>
                    {healthData.memory.used && healthData.memory.total
                      ? formatPercentage(
                          healthData.memory.used / healthData.memory.total
                        )
                      : "N/A"}
                  </span>
                </div>
                <Progress
                  value={
                    healthData.memory.used && healthData.memory.total
                      ? (healthData.memory.used / healthData.memory.total) * 100
                      : 0
                  }
                  className="h-2"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {healthData.memory.used
                    ? formatMemory(healthData.memory.used)
                    : "N/A"}{" "}
                  /{" "}
                  {healthData.memory.total
                    ? formatMemory(healthData.memory.total)
                    : "N/A"}
                </div>
              </div>

              {healthData.systemLoad &&
                (healthData.systemLoad.load1 !== undefined ||
                  healthData.systemLoad.load5 !== undefined) && (
                  <>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>CPU Load (1m)</span>
                        <span>
                          {healthData.systemLoad.load1 !== undefined &&
                          healthData.systemLoad.load1 !== null
                            ? healthData.systemLoad.load1.toFixed(2)
                            : "N/A"}
                        </span>
                      </div>
                      <Progress
                        value={Math.min(
                          (healthData.systemLoad.load1 || 0) * 100,
                          100
                        )}
                        className="h-2"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>CPU Load (5m)</span>
                        <span>
                          {healthData.systemLoad.load5 !== undefined &&
                          healthData.systemLoad.load5 !== null
                            ? healthData.systemLoad.load5.toFixed(2)
                            : "N/A"}
                        </span>
                      </div>
                      <Progress
                        value={Math.min(
                          (healthData.systemLoad.load5 || 0) * 100,
                          100
                        )}
                        className="h-2"
                      />
                    </div>
                  </>
                )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Logs */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>System Logs</span>
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchLogs}
              disabled={logsLoading}
              className="flex items-center space-x-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${logsLoading ? "animate-spin" : ""}`}
              />
              <span>Refresh</span>
            </Button>
          </div>
          <CardDescription>Recent system logs and API activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-gray-500">No logs available</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* API Endpoints Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Network className="h-5 w-5" />
            <span>API Endpoints</span>
          </CardTitle>
          <CardDescription>
            Quick overview of main API endpoint categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Server className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-sm font-medium">Health & Status</div>
              <div className="text-xs text-gray-600">/health, /api/status</div>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Activity className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-sm font-medium">Job Management</div>
              <div className="text-xs text-gray-600">/api/jobs/*</div>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Database className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-sm font-medium">Results & Data</div>
              <div className="text-xs text-gray-600">/api/results/*</div>
            </div>

            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <Settings className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="text-sm font-medium">Monitoring</div>
              <div className="text-xs text-gray-600">/api/monitoring/*</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
