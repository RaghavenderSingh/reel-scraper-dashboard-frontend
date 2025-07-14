
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { 
  Activity, 
  Server, 
  Clock, 
  MemoryStick, 
  Cpu, 
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileText,
  Database
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const HealthMonitor = () => {
  const [healthData, setHealthData] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchHealthData();
    fetchLogs();
    
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchHealthData();
      }, 5000); // Refresh every 5 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const fetchHealthData = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/monitoring/health');
      const data = await response.json();
      setHealthData(data);
    } catch (error) {
      console.error('Failed to fetch health data:', error);
      setHealthData({
        status: 'unhealthy',
        error: 'Failed to connect to API'
      });
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/monitoring/logs?lines=50');
      const data = await response.json();
      if (data.success) {
        setLogs(data.logs || []);
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error);
      toast({
        title: "Error",
        description: "Failed to fetch system logs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'unhealthy':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'unhealthy': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">System Health Monitor</h2>
          <p className="text-gray-600">Real-time monitoring of API health and performance</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant={autoRefresh ? "default" : "outline"}
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="flex items-center space-x-2"
          >
            <Activity className="h-4 w-4" />
            <span>{autoRefresh ? 'Auto Refresh ON' : 'Auto Refresh OFF'}</span>
          </Button>
          <Button variant="outline" onClick={fetchHealthData} className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Server className="h-5 w-5" />
            <span>System Status</span>
            {healthData && (
              <Badge className={getStatusColor(healthData.status)}>
                {healthData.status || 'Unknown'}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {healthData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center space-x-3">
                {getStatusIcon(healthData.status)}
                <div>
                  <p className="text-sm font-medium">Health Status</p>
                  <p className="text-lg font-semibold capitalize">{healthData.status}</p>
                </div>
              </div>
              
              {healthData.uptime && (
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Uptime</p>
                    <p className="text-lg font-semibold">{formatUptime(healthData.uptime)}</p>
                  </div>
                </div>
              )}
              
              {healthData.activeJobs !== undefined && (
                <div className="flex items-center space-x-3">
                  <Activity className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-sm font-medium">Active Jobs</p>
                    <p className="text-lg font-semibold">{healthData.activeJobs}</p>
                  </div>
                </div>
              )}
              
              {healthData.timestamp && (
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium">Last Check</p>
                    <p className="text-lg font-semibold">
                      {new Date(healthData.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-gray-500">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Loading health data...</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Memory Usage */}
      {healthData?.memory && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MemoryStick className="h-5 w-5" />
              <span>Memory Usage</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">RSS Memory</p>
                <p className="text-lg font-semibold">{formatBytes(healthData.memory.rss)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Heap Total</p>
                <p className="text-lg font-semibold">{formatBytes(healthData.memory.heapTotal)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Heap Used</p>
                <p className="text-lg font-semibold">{formatBytes(healthData.memory.heapUsed)}</p>
                {healthData.memory.heapTotal > 0 && (
                  <Progress 
                    value={(healthData.memory.heapUsed / healthData.memory.heapTotal) * 100} 
                    className="h-2 mt-2"
                  />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">External</p>
                <p className="text-lg font-semibold">{formatBytes(healthData.memory.external)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Logs */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>System Logs</span>
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchLogs}
              disabled={loading}
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Logs</span>
            </Button>
          </div>
          <CardDescription>
            Recent application logs (showing last 50 entries)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center space-x-2 text-gray-500">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Loading logs...</span>
            </div>
          ) : logs.length > 0 ? (
            <Textarea
              value={logs.join('\n')}
              readOnly
              rows={15}
              className="font-mono text-xs resize-none bg-gray-50"
            />
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No logs available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* API Endpoints Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>API Endpoints</span>
          </CardTitle>
          <CardDescription>
            Quick overview of main API endpoint categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-lg font-semibold text-blue-600">✓</div>
              <div className="text-sm font-medium">Health & Status</div>
              <div className="text-xs text-gray-600">/health, /api/status</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-lg font-semibold text-green-600">✓</div>
              <div className="text-sm font-medium">Job Management</div>
              <div className="text-xs text-gray-600">/api/jobs/*</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-lg font-semibold text-purple-600">✓</div>
              <div className="text-sm font-medium">Results</div>
              <div className="text-xs text-gray-600">/api/results/*</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-lg font-semibold text-orange-600">✓</div>
              <div className="text-sm font-medium">Monitoring</div>
              <div className="text-xs text-gray-600">/api/monitoring/*</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
