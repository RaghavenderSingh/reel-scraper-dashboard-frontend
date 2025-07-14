
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  XCircle, 
  ExternalLink, 
  Loader, 
  AlertTriangle,
  Users,
  Copy,
  Check
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const ProfileValidator = () => {
  const [profileUrls, setProfileUrls] = useState('');
  const [validationResult, setValidationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copiedUrls, setCopiedUrls] = useState(false);
  const { toast } = useToast();

  const validateProfiles = async () => {
    if (!profileUrls.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter at least one profile URL to validate.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const urls = profileUrls
        .split('\n')
        .map(url => url.trim())
        .filter(url => url.length > 0);

      const response = await fetch('http://localhost:3001/api/profiles/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileUrls: urls })
      });

      const data = await response.json();
      if (data.success) {
        setValidationResult(data.validation);
        toast({
          title: "Validation Complete",
          description: `${data.validation.valid} valid, ${data.validation.invalid} invalid URLs found.`,
        });
      } else {
        throw new Error(data.error || 'Validation failed');
      }
    } catch (error) {
      toast({
        title: "Validation Failed",
        description: error.message || "Failed to validate profile URLs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyValidUrls = () => {
    if (validationResult?.results) {
      const validUrls = validationResult.results
        .filter(result => result.isValid)
        .map(result => result.url)
        .join('\n');
      
      navigator.clipboard.writeText(validUrls);
      setCopiedUrls(true);
      setTimeout(() => setCopiedUrls(false), 2000);
      
      toast({
        title: "URLs Copied",
        description: "Valid URLs have been copied to clipboard.",
      });
    }
  };

  const clearResults = () => {
    setValidationResult(null);
    setProfileUrls('');
  };

  const exampleUrls = `https://www.facebook.com/share/16QX4BqQPg/
https://www.facebook.com/share/1C4SJF7ZnP/
https://www.facebook.com/username/
https://facebook.com/profile.php?id=100012345678`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Profile URL Validator</h2>
        <p className="text-gray-600">
          Validate Facebook profile URLs before creating scraping jobs to ensure successful processing.
        </p>
      </div>

      {/* Validation Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Validate Profile URLs</span>
          </CardTitle>
          <CardDescription>
            Enter Facebook profile URLs (one per line) to validate their format and accessibility.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Textarea
              placeholder={`Enter profile URLs (one per line):\n\n${exampleUrls}`}
              value={profileUrls}
              onChange={(e) => setProfileUrls(e.target.value)}
              rows={8}
              className="font-mono text-sm"
            />
          </div>
          <div className="flex space-x-2">
            <Button onClick={validateProfiles} disabled={loading || !profileUrls.trim()}>
              {loading ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Validating...
                </>
              ) : (
                'Validate URLs'
              )}
            </Button>
            {validationResult && (
              <Button variant="outline" onClick={clearResults}>
                Clear Results
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Validation Results */}
      {validationResult && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>Validation Results</span>
              </CardTitle>
              <div className="flex space-x-2">
                <Badge variant="outline" className="text-green-600">
                  {validationResult.valid} Valid
                </Badge>
                <Badge variant="outline" className="text-red-600">
                  {validationResult.invalid} Invalid
                </Badge>
                <Badge variant="outline">
                  {validationResult.total} Total
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {validationResult.valid}
                </div>
                <div className="text-sm text-gray-600">Valid URLs</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {validationResult.invalid}
                </div>
                <div className="text-sm text-gray-600">Invalid URLs</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round((validationResult.valid / validationResult.total) * 100)}%
                </div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
            </div>

            <Separator />

            {/* Valid URLs */}
            {validationResult.valid > 0 && (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-green-700 flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>Valid URLs ({validationResult.valid})</span>
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyValidUrls}
                    className="flex items-center space-x-1"
                  >
                    {copiedUrls ? (
                      <>
                        <Check className="h-3 w-3" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Copy Valid URLs</span>
                      </>
                    )}
                  </Button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {validationResult.results
                    .filter(result => result.isValid)
                    .map((result, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="font-mono text-sm">{result.url}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(result.url, '_blank')}
                          className="flex items-center space-x-1"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Invalid URLs */}
            {validationResult.invalid > 0 && (
              <div>
                <h3 className="font-semibold text-red-700 flex items-center space-x-2 mb-3">
                  <XCircle className="h-4 w-4" />
                  <span>Invalid URLs ({validationResult.invalid})</span>
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {validationResult.results
                    .filter(result => !result.isValid)
                    .map((result, index) => (
                      <div key={index} className="p-3 bg-red-50 rounded-lg border border-red-200">
                        <div className="flex items-center space-x-2 mb-1">
                          <XCircle className="h-4 w-4 text-red-600" />
                          <span className="font-mono text-sm">{result.url}</span>
                        </div>
                        {result.error && (
                          <div className="flex items-center space-x-2 text-sm text-red-600 ml-6">
                            <AlertTriangle className="h-3 w-3" />
                            <span>{result.error}</span>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {validationResult.valid > 0 && (
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600 mb-3">
                  You can now use the valid URLs to create a new scraping job.
                </p>
                <Button className="w-full">
                  Create Job with Valid URLs
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
