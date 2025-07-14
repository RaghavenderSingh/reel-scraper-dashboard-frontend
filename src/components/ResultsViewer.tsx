
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
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
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const ResultsViewer = () => {
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResult, setSelectedResult] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchResults();
  }, []);

  useEffect(() => {
    // Filter results based on search term
    if (searchTerm) {
      const filtered = results.filter(result => 
        result.data?.profile?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
      const response = await fetch('http://localhost:3001/api/results');
      const data = await response.json();
      if (data.success) {
        setResults(data.results || []);
      }
    } catch (error) {
      console.error('Failed to fetch results:', error);
      toast({
        title: "Error",
        description: "Failed to fetch results",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const viewResultDetails = (result) => {
    setSelectedResult(result);
    setDetailDialogOpen(true);
  };

  const exportResult = async (result, format = 'json') => {
    try {
      const dataStr = format === 'json' 
        ? JSON.stringify(result.data, null, 2)
        : convertToCSV(result.data);
      
      const blob = new Blob([dataStr], { 
        type: format === 'json' ? 'application/json' : 'text/csv' 
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
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

  const convertToCSV = (data) => {
    // Simple CSV conversion for reels data
    if (!data.reels || data.reels.length === 0) return 'No reels data available';
    
    const headers = ['Title', 'Date', 'Views', 'Duration', 'URL'];
    const rows = data.reels.map(reel => [
      reel.title || '',
      reel.date || '',
      reel.views || 0,
      reel.duration || '',
      reel.url || ''
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const formatViews = (views) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views?.toString() || '0';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Scraping Results</h2>
          <p className="text-gray-600">Browse and analyze scraped Facebook data</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={fetchResults} disabled={loading} className="flex items-center space-x-2">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-500 text-center mb-4">
                {searchTerm ? 'No results match your search criteria.' : 'No scraping results available yet. Create a job to start scraping.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredResults.map((result) => (
            <Card key={result.profileId}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="flex items-center space-x-2">
                      <span>{result.data?.profile?.name || 'Unknown Profile'}</span>
                      <Badge variant={result.success ? 'default' : 'destructive'}>
                        {result.success ? 'Success' : 'Failed'}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="flex items-center space-x-4 mt-2">
                      <span className="flex items-center space-x-1">
                        <ExternalLink className="h-4 w-4" />
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
                        <span>{new Date(result.timestamp).toLocaleDateString()}</span>
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
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Total Reels</span>
                      <p className="text-lg font-semibold text-blue-600">
                        {result.data.summary?.totalReels || result.data.reels?.length || 0}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Total Views</span>
                      <p className="text-lg font-semibold text-green-600">
                        {formatViews(result.data.summary?.totalViews || 0)}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Average Views</span>
                      <p className="text-lg font-semibold text-purple-600">
                        {formatViews(result.data.summary?.averageViews || 0)}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Posts Found</span>
                      <p className="text-lg font-semibold text-orange-600">
                        {result.data.posts?.length || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Result Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedResult?.data?.profile?.name || 'Result Details'}
            </DialogTitle>
            <DialogDescription>
              Detailed view of scraped data from {selectedResult?.profileUrl}
            </DialogDescription>
          </DialogHeader>
          {selectedResult && (
            <div className="space-y-6">
              {/* Summary Stats */}
              {selectedResult.data?.summary && (
                <div>
                  <h3 className="font-semibold mb-3">Summary Statistics</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {selectedResult.data.summary.totalReels}
                      </div>
                      <div className="text-sm text-gray-600">Total Reels</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {formatViews(selectedResult.data.summary.totalViews)}
                      </div>
                      <div className="text-sm text-gray-600">Total Views</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {formatViews(selectedResult.data.summary.averageViews)}
                      </div>
                      <div className="text-sm text-gray-600">Avg Views</div>
                    </div>
                  </div>
                </div>
              )}

              <Separator />

              {/* Reels List */}
              {selectedResult.data?.reels && selectedResult.data.reels.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Reels ({selectedResult.data.reels.length})</h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {selectedResult.data.reels.map((reel, index) => (
                      <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{reel.title || `Reel ${index + 1}`}</h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                            <span>{reel.date}</span>
                            <span>{formatViews(reel.views)} views</span>
                            {reel.duration && <span>{reel.duration}</span>}
                          </div>
                        </div>
                        {reel.url && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(reel.url, '_blank')}
                            className="flex items-center space-x-1"
                          >
                            <Play className="h-3 w-3" />
                            <span>View</span>
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Export Options */}
              <Separator />
              <div className="flex space-x-2">
                <Button onClick={() => exportResult(selectedResult, 'json')} className="flex items-center space-x-2">
                  <Download className="h-4 w-4" />
                  <span>Export JSON</span>
                </Button>
                <Button variant="outline" onClick={() => exportResult(selectedResult, 'csv')} className="flex items-center space-x-2">
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
