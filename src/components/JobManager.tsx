import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
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
  RefreshCw,
  Settings,
  Target,
  Eye,
  TrendingUp,
  FileText,
  ExternalLink,
  Info,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService, apiUtils, JobObject, ResultObject } from "@/lib/api";

export const JobManager = () => {
  const [jobs, setJobs] = useState<JobObject[]>([]);
  const [loading, setLoading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobObject | null>(null);
  const [resultsDialogOpen, setResultsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    jobName: "",
    profileUrls: "",
    targetDate: "",
    concurrency: 5,
    extractionMode: "comprehensive" as "profile" | "main" | "comprehensive",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchJobs = async () => {
    try {
      console.log("Fetching jobs...");
      const data = await apiService.getJobs();
      console.log("Jobs data received:", data);
      setJobs(data.jobs || []);
      console.log("Jobs state updated:", data.jobs || []);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    }
  };

  const createJob = async () => {
    if (!formData.jobName || !formData.profileUrls) {
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
        .split("\n")
        .map((url) => url.trim())
        .filter((url) => url.length > 0);

      const result = await apiService.createJob({
        jobName: formData.jobName,
        profileUrls,
        targetDate: formData.targetDate || undefined,
        concurrency: formData.concurrency,
        extractionMode: formData.extractionMode,
      });

      toast({
        title: "Job Created",
        description: `Job "${formData.jobName}" has been created and queued for processing.`,
      });
      setCreateDialogOpen(false);
      setFormData({
        jobName: "",
        profileUrls: "",
        targetDate: "",
        concurrency: 5,
        extractionMode: "comprehensive",
      });
      fetchJobs();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create job",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const cancelJob = async (jobId: string) => {
    try {
      await apiService.deleteJob(jobId);
      toast({
        title: "Job Cancelled",
        description: "Job has been cancelled successfully.",
      });
      fetchJobs();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel job",
        variant: "destructive",
      });
    }
  };

  const exportResults = async (jobId: string) => {
    try {
      const blob = await apiService.exportResults(jobId, "json");
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
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
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export job results",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "processing":
        return <Loader className="h-4 w-4 text-blue-600 animate-spin" />;
      case "queued":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getExtractionModeDescription = (mode: string) => {
    switch (mode) {
      case "profile":
        return "Profile Reels Only";
      case "main":
        return "Main Reels Page";
      case "comprehensive":
        return "Full Dual Extraction";
      default:
        return mode;
    }
  };

  const formatDuration = (startTime: string, endTime?: string) => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const duration = end.getTime() - start.getTime();
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const getJobSummary = (job: JobObject) => {
    if (!job.results || job.results.length === 0) return null;

    const totalReels = job.results.reduce((sum, result) => {
      if (result.success && result.data?.summary) {
        return sum + result.data.summary.totalReelsFound;
      }
      return sum;
    }, 0);

    const successfulResults = job.results.filter((r) => r.success).length;
    const failedResults = job.results.filter((r) => !r.success).length;

    return {
      totalReels,
      successfulResults,
      failedResults,
      totalResults: job.results.length,
    };
  };

  const openResultsDialog = (job: JobObject) => {
    setSelectedJob(job);
    setResultsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Job Management</h2>
          <p className="text-gray-600">
            Create, monitor, and manage scraping jobs with enhanced extraction
            modes
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={fetchJobs}
            className="flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              // Test with sample data
              const testJob: JobObject = {
                id: "test-job-1",
                name: "Test Job",
                status: "completed",
                profileUrls: ["https://www.facebook.com/test"],
                targetDate: "12",
                concurrency: 5,
                extractionMode: "comprehensive",
                createdAt: "2025-07-14T20:40:04.757Z",
                startedAt: "2025-07-14T20:40:04.758Z",
                completedAt: "2025-07-14T20:40:43.047Z",
                progress: {
                  total: 1,
                  completed: 1,
                  failed: 0,
                  current: 0,
                },
                results: [],
              };
              setJobs([testJob]);
              console.log("Set test job:", testJob);
            }}
            className="flex items-center space-x-2"
          >
            <Info className="h-4 w-4" />
            <span>Test Data</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              // Load the actual sample data you provided
              const sampleJobs: JobObject[] = [
                {
                  id: "30e2acff-fb66-4741-b4f1-e12e2b9616ac",
                  name: "test",
                  status: "completed",
                  profileUrls: ["https://www.facebook.com/ranjan.kumar.684628"],
                  targetDate: "12",
                  concurrency: 5,
                  extractionMode: "comprehensive",
                  createdAt: "2025-07-14T20:40:04.757Z",
                  startedAt: "2025-07-14T20:40:04.758Z",
                  completedAt: "2025-07-14T20:40:43.047Z",
                  progress: {
                    total: 1,
                    completed: 1,
                    failed: 0,
                    current: 0,
                  },
                  results: [
                    {
                      profileId: "b55c1be1-29b1-4563-8744-04e3b329c801",
                      profileUrl:
                        "https://www.facebook.com/ranjan.kumar.684628",
                      extractionMode: "comprehensive",
                      success: true,
                      data: {
                        profile: {
                          name: "Ranjan Kumar",
                          url: "https://www.facebook.com/ranjan.kumar.684628",
                        },
                        posts: [],
                        reels: [
                          {
                            index: 1,
                            reelId: "1783194332624053",
                            url: "https://www.facebook.com/reel/1783194332624053/?s=single_unit&__cft__[0]=AZVV8SaLRLu2g3BkJCDPysL29pZk3VKt7EwcQxqaEvZbztPDvnXJR2TwRsNZWf6uaKCoQheP2ibFcM2apvsrT_FEo4QKDYtMd4505VnBZ9wSJIuLT1-xWT4HvR5hS_Eg3vaI_kF9oQrgjQl6q1rn7RmmN8YkObFa4JgGvfoEEXtOlRMLnPO4VcDEhNzz_DR-qFHNAZTcHW_l91Ahb7FLgFN-&__tn__=H-R",
                            date: "2025-07-09T04:00:00.000Z",
                            dateText: "9 Jul",
                            viewCount: "129",
                            viewCountNumeric: 129,
                            hasDate: true,
                            hasViews: true,
                            source: "both",
                            complete: true,
                            viewCountMethod: 'span[dir="auto"]',
                            success: true,
                          },
                        ],
                        timeline: [],
                        reelsSection: [],
                        profileReelsSection: [],
                        mainReelsSection: [],
                        combinedReels: [],
                        summary: {
                          extractionMode: "comprehensive",
                          totalReelsFound: 20,
                          timelineReels: 1,
                          profileReelsSection: 70,
                          mainReelsSection: 20,
                          combinedReels: 20,
                          targetDate: "12",
                          targetDateFound: true,
                        },
                      },
                      timestamp: "2025-07-14T20:40:07.594Z",
                    },
                  ],
                },
                {
                  id: "f6214abc-d98b-44e0-9dcd-9191b24007a5",
                  name: "test",
                  status: "completed",
                  profileUrls: ["https://www.facebook.com/baba.princedubey.7"],
                  targetDate: "15 Jul",
                  concurrency: 5,
                  extractionMode: "comprehensive",
                  createdAt: "2025-07-14T20:36:08.495Z",
                  startedAt: "2025-07-14T20:36:08.496Z",
                  completedAt: "2025-07-14T20:37:15.601Z",
                  progress: {
                    total: 1,
                    completed: 1,
                    failed: 0,
                    current: 0,
                  },
                  results: [
                    {
                      profileId: "63cdd997-b103-4e89-9a3f-63b3aa74d520",
                      profileUrl: "https://www.facebook.com/baba.princedubey.7",
                      extractionMode: "comprehensive",
                      success: true,
                      data: {
                        profile: {
                          name: "Singer Baba Prince Dubey  (Rudra Bhai)",
                          url: "https://www.facebook.com/baba.princedubey.7",
                        },
                        posts: [],
                        reels: [
                          {
                            index: 1,
                            reelId: "1113372883969246",
                            url: "https://www.facebook.com/reel/1113372883969246/?s=single_unit&__cft__[0]=AZVaFurvRb4hBODSvpoyB9iPOkIYLiGlSsKCj-FaFjBY-0QMmyc23g3L3NbZ1X8jhd7-Q8A7ik6hoKe1pj6FXeWBmrogHdV3fJQ_yvkjI30oDVIqOF9vI_GgOW6T9hYyEoUmebSg9jGaus0y5x1Co4N8Ka5b3ZoIpY9mUabsKl5KMcwuXUT34bvIHh1p5qxgAP8GPiJsML0TXaoYY9JLJtMK&__tn__=H-R",
                            date: "2025-07-14T04:00:00.000Z",
                            dateText: "14 Jul",
                            viewCount: "2",
                            viewCountNumeric: 2,
                            hasDate: true,
                            hasViews: true,
                            source: "both",
                            complete: true,
                            viewCountMethod: 'span[dir="auto"]',
                            success: true,
                          },
                        ],
                        timeline: [],
                        reelsSection: [],
                        profileReelsSection: [],
                        mainReelsSection: [],
                        combinedReels: [],
                        summary: {
                          extractionMode: "comprehensive",
                          totalReelsFound: 20,
                          timelineReels: 4,
                          profileReelsSection: 70,
                          mainReelsSection: 20,
                          combinedReels: 20,
                          targetDate: "15 Jul",
                          targetDateFound: true,
                        },
                      },
                      timestamp: "2025-07-14T20:36:11.068Z",
                    },
                  ],
                },
              ];
              setJobs(sampleJobs);
              console.log("Set sample jobs:", sampleJobs);
            }}
            className="flex items-center space-x-2"
          >
            <FileText className="h-4 w-4" />
            <span>Sample Data</span>
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
                  Configure a new job to scrape Facebook profiles with enhanced
                  extraction modes.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="jobName">Job Name *</Label>
                  <Input
                    id="jobName"
                    placeholder="My Scraping Job"
                    value={formData.jobName}
                    onChange={(e) =>
                      setFormData({ ...formData, jobName: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="profileUrls">
                    Profile URLs * (one per line)
                  </Label>
                  <Textarea
                    id="profileUrls"
                    placeholder="https://www.facebook.com/share/16QX4BqQPg/&#10;https://www.facebook.com/share/1C4SJF7ZnP/"
                    value={formData.profileUrls}
                    onChange={(e) =>
                      setFormData({ ...formData, profileUrls: e.target.value })
                    }
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="targetDate">Target Date (Optional)</Label>
                  <Input
                    id="targetDate"
                    placeholder="13 Jul"
                    value={formData.targetDate}
                    onChange={(e) =>
                      setFormData({ ...formData, targetDate: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="extractionMode">Extraction Mode</Label>
                  <Select
                    value={formData.extractionMode}
                    onValueChange={(
                      value: "profile" | "main" | "comprehensive"
                    ) => setFormData({ ...formData, extractionMode: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="profile">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4" />
                          <div>
                            <div>Profile Reels Only</div>
                            <div className="text-xs text-gray-500">
                              Fast, limited to profile reels
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="main">
                        <div className="flex items-center space-x-2">
                          <Target className="h-4 w-4" />
                          <div>
                            <div>Main Reels Page</div>
                            <div className="text-xs text-gray-500">
                              Discovers trending reels
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="comprehensive">
                        <div className="flex items-center space-x-2">
                          <Settings className="h-4 w-4" />
                          <div>
                            <div>Comprehensive (Recommended)</div>
                            <div className="text-xs text-gray-500">
                              Full dual extraction with matching
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="concurrency">Concurrency</Label>
                  <Select
                    value={formData.concurrency.toString()}
                    onValueChange={(value) =>
                      setFormData({ ...formData, concurrency: parseInt(value) })
                    }
                  >
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
                <Button
                  onClick={createJob}
                  disabled={loading}
                  className="w-full"
                >
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No jobs found
              </h3>
              <p className="text-gray-500 text-center mb-4">
                Create your first scraping job to get started with Facebook
                profile scraping.
              </p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Job
              </Button>
            </CardContent>
          </Card>
        ) : (
          jobs.map((job) => {
            const summary = getJobSummary(job);
            return (
              <Card key={job.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="flex items-center space-x-2">
                        {getStatusIcon(job.status)}
                        <span>{job.name}</span>
                        <Badge className={apiUtils.getStatusColor(job.status)}>
                          {job.status}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="flex items-center space-x-4 mt-2">
                        <span className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{job.profileUrls?.length || 0} profiles</span>
                        </span>
                        {job.targetDate && (
                          <span className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>Target: {job.targetDate}</span>
                          </span>
                        )}
                        <span className="flex items-center space-x-1">
                          <Settings className="h-4 w-4" />
                          <span>
                            {getExtractionModeDescription(job.extractionMode)}
                          </span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>
                            Created:{" "}
                            {new Date(job.createdAt).toLocaleDateString()}
                          </span>
                        </span>
                        {job.startedAt && (
                          <span className="flex items-center space-x-1">
                            <Play className="h-4 w-4" />
                            <span>
                              Duration:{" "}
                              {formatDuration(job.startedAt, job.completedAt)}
                            </span>
                          </span>
                        )}
                      </CardDescription>

                      {/* Job Summary Stats */}
                      {summary && (
                        <div className="flex items-center space-x-4 mt-3">
                          <div className="flex items-center space-x-1 text-sm">
                            <TrendingUp className="h-3 w-3 text-blue-600" />
                            <span className="text-blue-600 font-medium">
                              {summary.totalReels} reels found
                            </span>
                          </div>
                          <div className="flex items-center space-x-1 text-sm">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            <span className="text-green-600 font-medium">
                              {summary.successfulResults} successful
                            </span>
                          </div>
                          {summary.failedResults > 0 && (
                            <div className="flex items-center space-x-1 text-sm">
                              <XCircle className="h-3 w-3 text-red-600" />
                              <span className="text-red-600 font-medium">
                                {summary.failedResults} failed
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      {job.status === "completed" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openResultsDialog(job)}
                            className="flex items-center space-x-1"
                          >
                            <Eye className="h-3 w-3" />
                            <span>View Results</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => exportResults(job.id)}
                            className="flex items-center space-x-1"
                          >
                            <Download className="h-3 w-3" />
                            <span>Export</span>
                          </Button>
                        </>
                      )}
                      {(job.status === "processing" ||
                        job.status === "queued") && (
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
                        <span>
                          {job.progress.completed}/{job.progress.total}
                        </span>
                      </div>
                      <Progress
                        value={
                          (job.progress.completed / job.progress.total) * 100
                        }
                        className="h-2"
                      />
                      {job.progress.failed > 0 && (
                        <p className="text-sm text-red-600">
                          {job.progress.failed} profile(s) failed to process
                        </p>
                      )}
                      {job.error && (
                        <p className="text-sm text-red-600">
                          Error: {job.error}
                        </p>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })
        )}
      </div>

      {/* Results Dialog */}
      <Dialog open={resultsDialogOpen} onOpenChange={setResultsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Job Results - {selectedJob?.name}</DialogTitle>
            <DialogDescription>
              Detailed results from the scraping job
            </DialogDescription>
          </DialogHeader>
          {selectedJob && (
            <div className="space-y-4">
              {selectedJob.results.map((result, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-sm">
                          {result.data?.profile?.name || "Unknown Profile"}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {result.profileUrl}
                        </CardDescription>
                      </div>
                      <Badge
                        variant={result.success ? "default" : "destructive"}
                      >
                        {result.success ? "Success" : "Failed"}
                      </Badge>
                    </div>
                  </CardHeader>
                  {result.success && result.data && (
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="font-medium text-gray-600">
                            Total Reels
                          </div>
                          <div className="text-lg font-bold">
                            {result.data.summary?.totalReelsFound || 0}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-600">
                            Timeline Reels
                          </div>
                          <div className="text-lg font-bold">
                            {result.data.summary?.timelineReels || 0}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-600">
                            Profile Reels
                          </div>
                          <div className="text-lg font-bold">
                            {result.data.summary?.profileReelsSection || 0}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-600">
                            Combined
                          </div>
                          <div className="text-lg font-bold">
                            {result.data.summary?.combinedReels || 0}
                          </div>
                        </div>
                      </div>

                      {result.data.reels && result.data.reels.length > 0 && (
                        <div className="mt-4">
                          <h4 className="font-medium mb-2">Sample Reels</h4>
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {result.data.reels
                              .slice(0, 5)
                              .map((reel, reelIndex) => (
                                <div
                                  key={reelIndex}
                                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                                >
                                  <div className="flex-1">
                                    <div className="text-xs font-medium">
                                      Reel {reel.index}
                                    </div>
                                    <div className="text-xs text-gray-600">
                                      Views: {reel.viewCount || "N/A"}
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      window.open(reel.url, "_blank")
                                    }
                                    className="h-6 px-2"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  )}
                  {!result.success && result.error && (
                    <CardContent>
                      <p className="text-sm text-red-600">
                        Error: {result.error}
                      </p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
