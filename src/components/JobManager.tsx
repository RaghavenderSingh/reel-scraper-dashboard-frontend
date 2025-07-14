
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  Play, 
  Pause, 
  Square, 
  Trash2, 
  Calendar, 
  Users, 
  Clock,
  CheckCircle,
  XCircle,
  Loader,
  Download,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const JobManager = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    jobName: '',
    profileUrls: '',
    targetDate: '',
    concurrency: 5
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/jobs');
      const data = await response.json();
      if (data.success) {
        setJobs(data.jobs || []);
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    }
  };

  const createJob = async () => {
    if (!formData.jobName || !formData.profileUrls || !formData.targetDate) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const profileUrls = formData.profileUrls
        .split('\n')
        .map(url => url.trim())
        .filter(url => url.length > 0);

      const response = await fetch('http://localhost:3001/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobName: formData.jobName,
          profileUrls,
          targetDate: formData.targetDate,
          concurrency: parseInt(formData.concurrency)
        })
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Job Created",
          description: `Job "${formData.jobName}" has been created and queued for processing.`,
        });
        setCreateDialogOpen(false);
        setFormData({ jobName: '', profileUrls: '', targetDate: '', concurrency: 5 });
        fetchJobs();
      } else {
        throw new Error(data.error || 'Failed to create job');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to create job",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const cancelJob = async (jobId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/jobs/${jobId}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (data.success) {
        toast({
          title: "Job Cancelled",
          description: "Job has been cancelled successfully.",
        });
        fetchJobs();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel job",
        variant: "destructive",
      });
    }
  };

  const exportResults = async (jobId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/export/${jobId}?format=json`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `job-${jobId}-results.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast({
          title: "Export Started",
          description: "Results are being downloaded.",
        });
      }
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export job results",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'processing':
        return <Loader className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'queued':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'queued': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Job Management</h2>
          <p className="text-gray-600">Create, monitor, and manage scraping jobs</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={fetchJobs} className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </Button>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Create Job</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Scraping Job</DialogTitle>
                <DialogDescription>
                  Configure a new job to scrape Facebook profiles for posts and reels.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="jobName">Job Name *</Label>
                  <Input
                    id="jobName"
                    placeholder="My Scraping Job"
                    value={formData.jobName}
                    onChange={(e) => setFormData({ ...formData, jobName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="profileUrls">Profile URLs * (one per line)</Label>
                  <Textarea
                    id="profileUrls"
                    placeholder="https://www.facebook.com/share/16QX4BqQPg/&#10;https://www.facebook.com/share/1C4SJF7ZnP/"
                    value={formData.profileUrls}
                    onChange={(e) => setFormData({ ...formData, profileUrls: e.target.value })}
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="targetDate">Target Date *</Label>
                  <Input
                    id="targetDate"
                    placeholder="13 Jul"
                    value={formData.targetDate}
                    onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="concurrency">Concurrency</Label>
                  <Select value={formData.concurrency.toString()} onValueChange={(value) => setFormData({ ...formData, concurrency: parseInt(value) })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={createJob} disabled={loading} className="w-full">
                  {loading ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Creating Job...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Create Job
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Jobs List */}
      <div className="grid gap-4">
        {jobs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Users className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
              <p className="text-gray-500 text-center mb-4">
                Create your first scraping job to get started with Facebook profile scraping.
              </p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Job
              </Button>
            </CardContent>
          </Card>
        ) : (
          jobs.map((job) => (
            <Card key={job.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      {getStatusIcon(job.status)}
                      <span>{job.name}</span>
                      <Badge className={getStatusColor(job.status)}>
                        {job.status}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="flex items-center space-x-4 mt-2">
                      <span className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{job.profileUrls?.length || 0} profiles</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>Target: {job.targetDate}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>Created: {new Date(job.createdAt).toLocaleDateString()}</span>
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    {job.status === 'completed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => exportResults(job.id)}
                        className="flex items-center space-x-1"
                      >
                        <Download className="h-3 w-3" />
                        <span>Export</span>
                      </Button>
                    )}
                    {(job.status === 'processing' || job.status === 'queued') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => cancelJob(job.id)}
                        className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                      >
                        <Square className="h-3 w-3" />
                        <span>Cancel</span>
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              {job.progress && (
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{job.progress.completed}/{job.progress.total}</span>
                    </div>
                    <Progress 
                      value={(job.progress.completed / job.progress.total) * 100} 
                      className="h-2"
                    />
                    {job.progress.failed > 0 && (
                      <p className="text-sm text-red-600">
                        {job.progress.failed} profile(s) failed to process
                      </p>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
