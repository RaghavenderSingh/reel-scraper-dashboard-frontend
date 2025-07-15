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
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Eye,
  Download,
  Filter,
  ExternalLink,
  Play,
  BarChart3,
  Calendar,
  Users,
  RefreshCw,
  CheckCircle,
  XCircle,
  EyeOff,
  CalendarDays,
  ExternalLink as ExternalLinkIcon,
  Settings,
  Target,
  Zap,
  Layers,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService, apiUtils, ResultObject } from "@/lib/api";

export const ResultsViewer = () => {
  const [results, setResults] = useState<ResultObject[]>([]);
  const [filteredResults, setFilteredResults] = useState<ResultObject[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedResult, setSelectedResult] = useState<ResultObject | null>(
    null
  );
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchResults();
  }, []);

  useEffect(() => {
    // Filter results based on search term
    if (searchTerm) {
      const filtered = results.filter(
        (result) =>
          result.data?.profile?.name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          result.profileUrl.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredResults(filtered);
    } else {
      setFilteredResults(results);
    }
  }, [searchTerm, results]);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const data = await apiService.getResults();
      console.log("API Response:", data); // Debug log
      setResults(data.results || []);
    } catch (error) {
      console.error("Failed to fetch results:", error);
      toast({
        title: "Error",
        description: `Failed to fetch results: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const viewResultDetails = (result: ResultObject) => {
    setSelectedResult(result);
    setDetailDialogOpen(true);
  };

  const exportResult = async (
    result: ResultObject,
    format: "json" | "csv" = "json"
  ) => {
    try {
      const dataStr =
        format === "json"
          ? JSON.stringify(result.data, null, 2)
          : apiUtils.convertToCSV(result.data);

      const blob = new Blob([dataStr], {
        type: format === "json" ? "application/json" : "text/csv",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `result-${result.profileId}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Export Started",
        description: `Result exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export result",
        variant: "destructive",
      });
    }
  };

  const getExtractionModeIcon = (mode: string) => {
    switch (mode) {
      case "profile":
        return <Users className="h-4 w-4 text-blue-600" />;
      case "main":
        return <Target className="h-4 w-4 text-green-600" />;
      case "comprehensive":
        return <Zap className="h-4 w-4 text-purple-600" />;
      default:
        return <Settings className="h-4 w-4 text-gray-600" />;
    }
  };

  const getExtractionModeDescription = (mode: string) => {
    switch (mode) {
      case "profile":
        return "Profile Reels Only";
      case "main":
        return "Main Reels Page";
      case "comprehensive":
        return "Comprehensive";
      default:
        return mode;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Scraping Results</h2>
          <p className="text-gray-600">
            Browse and analyze scraped Facebook data
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={fetchResults}
            disabled={loading}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by profile name or URL..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline" className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results List */}
      <div className="grid gap-4">
        {loading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-600">Loading results...</span>
            </CardContent>
          </Card>
        ) : filteredResults.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <BarChart3 className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No results found
              </h3>
              <p className="text-gray-500 text-center mb-4">
                {searchTerm
                  ? "No results match your search criteria."
                  : "No scraping results available yet. Create a job to start scraping."}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredResults.map((result) => {
            const summaryStats = apiUtils.calculateSummaryStats(result.data);
            return (
              <Card key={result.profileId}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="flex items-center space-x-2">
                        <span>
                          {result.data?.profile?.name || "Unknown Profile"}
                        </span>
                        <Badge
                          variant={result.success ? "default" : "destructive"}
                        >
                          {result.success ? "Success" : "Failed"}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="flex items-center space-x-4 mt-2">
                        <span className="flex items-center space-x-1">
                          <ExternalLinkIcon className="h-4 w-4" />
                          <a
                            href={result.profileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            View Profile
                          </a>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(result.timestamp).toLocaleDateString()}
                          </span>
                        </span>
                      </CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewResultDetails(result)}
                        className="flex items-center space-x-1"
                      >
                        <Eye className="h-3 w-3" />
                        <span>View</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => exportResult(result)}
                        className="flex items-center space-x-1"
                      >
                        <Download className="h-3 w-3" />
                        <span>Export</span>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {result.success && result.data && (
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Total Reels</span>
                        <p className="text-lg font-semibold text-blue-600">
                          {summaryStats.totalReels}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">Total Views</span>
                        <p className="text-lg font-semibold text-green-600">
                          {apiUtils.formatViews(summaryStats.totalViews)}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">Avg Views</span>
                        <p className="text-lg font-semibold text-purple-600">
                          {apiUtils.formatViews(summaryStats.averageViews)}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">Complete Reels</span>
                        <p className="text-lg font-semibold text-emerald-600">
                          {summaryStats.completeReels}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">With Date</span>
                        <p className="text-lg font-semibold text-orange-600">
                          {summaryStats.reelsWithDate}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">With Views</span>
                        <p className="text-lg font-semibold text-pink-600">
                          {summaryStats.reelsWithViews}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })
        )}
      </div>

      {/* Result Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedResult?.data?.profile?.name || "Result Details"}
            </DialogTitle>
            <DialogDescription>
              Detailed view of scraped data from {selectedResult?.profileUrl}
            </DialogDescription>
          </DialogHeader>
          {selectedResult && (
            <div className="space-y-6">
              {/* Summary Stats */}
              {selectedResult.data && (
                <div>
                  <h3 className="font-semibold mb-3">Summary Statistics</h3>
                  {(() => {
                    const stats = apiUtils.calculateSummaryStats(
                      selectedResult.data
                    );
                    return (
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            {stats.totalReels}
                          </div>
                          <div className="text-sm text-gray-600">
                            Total Reels
                          </div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            {apiUtils.formatViews(stats.totalViews)}
                          </div>
                          <div className="text-sm text-gray-600">
                            Total Views
                          </div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">
                            {apiUtils.formatViews(stats.averageViews)}
                          </div>
                          <div className="text-sm text-gray-600">Avg Views</div>
                        </div>
                        <div className="text-center p-4 bg-emerald-50 rounded-lg">
                          <div className="text-2xl font-bold text-emerald-600">
                            {stats.completeReels}
                          </div>
                          <div className="text-sm text-gray-600">Complete</div>
                        </div>
                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                          <div className="text-2xl font-bold text-orange-600">
                            {stats.reelsWithDate}
                          </div>
                          <div className="text-sm text-gray-600">With Date</div>
                        </div>
                        <div className="text-center p-4 bg-pink-50 rounded-lg">
                          <div className="text-2xl font-bold text-pink-600">
                            {stats.reelsWithViews}
                          </div>
                          <div className="text-sm text-gray-600">
                            With Views
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              <Separator />

              {/* Reels Table */}
              {selectedResult.data?.reels &&
                selectedResult.data.reels.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">
                      Reels Data Table ({selectedResult.data.reels.length}{" "}
                      reels)
                    </h3>
                    <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-16">#</TableHead>
                            <TableHead className="w-32">Reel ID</TableHead>
                            <TableHead className="w-24">Date</TableHead>
                            <TableHead className="w-24">Views</TableHead>
                            <TableHead className="w-20">Status</TableHead>
                            <TableHead className="w-24">Source</TableHead>
                            <TableHead className="w-20">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedResult.data.reels.map((reel, index) => (
                            <TableRow key={index} className="hover:bg-gray-50">
                              <TableCell className="font-medium">
                                {reel.index || index + 1}
                              </TableCell>
                              <TableCell>
                                <div className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                                  {reel.reelId}
                                </div>
                              </TableCell>
                              <TableCell>
                                {reel.dateText ? (
                                  <div className="flex items-center space-x-1">
                                    <CalendarDays className="h-3 w-3 text-green-600" />
                                    <span className="text-sm">
                                      {reel.dateText}
                                    </span>
                                  </div>
                                ) : (
                                  <div className="flex items-center space-x-1 text-gray-400">
                                    <XCircle className="h-3 w-3" />
                                    <span className="text-sm">No date</span>
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                {reel.viewCount ? (
                                  <div className="flex items-center space-x-1">
                                    <Eye className="h-3 w-3 text-blue-600" />
                                    <span className="text-sm font-medium">
                                      {apiUtils.formatViews(reel.viewCount)}
                                    </span>
                                  </div>
                                ) : (
                                  <div className="flex items-center space-x-1 text-gray-400">
                                    <EyeOff className="h-3 w-3" />
                                    <span className="text-sm">No views</span>
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                {reel.complete ? (
                                  <Badge
                                    variant="default"
                                    className="text-xs bg-green-100 text-green-800"
                                  >
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Complete
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="outline"
                                    className="text-xs text-gray-600"
                                  >
                                    Partial
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-xs">
                                  {reel.source || "unknown"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {reel.url && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      window.open(reel.url, "_blank")
                                    }
                                    className="flex items-center space-x-1 h-8"
                                  >
                                    <ExternalLinkIcon className="h-3 w-3" />
                                    <span className="text-xs">Open</span>
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}

              {/* Export Options */}
              <Separator />
              <div className="flex space-x-2">
                <Button
                  onClick={() => exportResult(selectedResult, "json")}
                  className="flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Export JSON</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => exportResult(selectedResult, "csv")}
                  className="flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Export CSV</span>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
