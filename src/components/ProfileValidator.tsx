import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Copy,
  ExternalLink,
  Users,
  Check,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService, ValidationObject } from "@/lib/api";

export const ProfileValidator = () => {
  const [profileUrls, setProfileUrls] = useState("");
  const [validation, setValidation] = useState<ValidationObject | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const validateUrls = async () => {
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
        .split("\n")
        .map((url) => url.trim())
        .filter((url) => url.length > 0);

      const result = await apiService.validateProfiles(urls);
      setValidation(result.validation);

      toast({
        title: "Validation Complete",
        description: `Validated ${urls.length} URLs. ${result.validUrls.length} valid, ${result.invalidUrls.length} invalid.`,
      });
    } catch (error) {
      toast({
        title: "Validation Failed",
        description:
          error instanceof Error ? error.message : "Failed to validate URLs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyValidUrls = () => {
    if (!validation) return;

    const validUrls = Object.entries(validation)
      .filter(([_, result]) => result.valid)
      .map(([url, _]) => url)
      .join("\n");

    navigator.clipboard.writeText(validUrls);
    toast({
      title: "Copied",
      description: "Valid URLs copied to clipboard",
    });
  };

  const copyInvalidUrls = () => {
    if (!validation) return;

    const invalidUrls = Object.entries(validation)
      .filter(([_, result]) => !result.valid)
      .map(([url, _]) => url)
      .join("\n");

    navigator.clipboard.writeText(invalidUrls);
    toast({
      title: "Copied",
      description: "Invalid URLs copied to clipboard",
    });
  };

  const getValidationStats = () => {
    if (!validation) return { valid: 0, invalid: 0, total: 0 };

    const total = Object.keys(validation).length;
    const valid = Object.values(validation).filter(
      (result) => result.valid
    ).length;
    const invalid = total - valid;

    return { valid, invalid, total };
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
          Validate Facebook profile URLs before creating scraping jobs to ensure
          successful processing.
        </p>
      </div>

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>Validate Profile URLs</CardTitle>
          <CardDescription>
            Enter Facebook profile URLs (one per line) to validate their format
            and accessibility.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="profileUrls">Profile URLs</Label>
            <Textarea
              id="profileUrls"
              placeholder={exampleUrls}
              value={profileUrls}
              onChange={(e) => setProfileUrls(e.target.value)}
              rows={6}
              className="font-mono text-sm"
            />
          </div>
          <Button
            onClick={validateUrls}
            disabled={loading || !profileUrls.trim()}
            className="w-full"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Validating URLs...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Validate URLs
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results Section */}
      {validation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Validation Results</span>
            </CardTitle>
            <CardDescription>
              Detailed validation results for all submitted URLs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Summary Stats */}
            {(() => {
              const stats = getValidationStats();
              return (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 flex items-center justify-center space-x-2">
                      <CheckCircle className="h-6 w-6" />
                      <span>{stats.valid}</span>
                    </div>
                    <div className="text-sm text-gray-600">Valid URLs</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600 flex items-center justify-center space-x-2">
                      <XCircle className="h-6 w-6" />
                      <span>{stats.invalid}</span>
                    </div>
                    <div className="text-sm text-gray-600">Invalid URLs</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 flex items-center justify-center space-x-2">
                      <Users className="h-6 w-6" />
                      <span>{stats.total}</span>
                    </div>
                    <div className="text-sm text-gray-600">Total URLs</div>
                  </div>
                </div>
              );
            })()}

            <Separator />

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={copyValidUrls}
                disabled={getValidationStats().valid === 0}
                className="flex items-center space-x-2"
              >
                <Copy className="h-4 w-4" />
                <span>Copy Valid URLs</span>
              </Button>
              <Button
                variant="outline"
                onClick={copyInvalidUrls}
                disabled={getValidationStats().invalid === 0}
                className="flex items-center space-x-2"
              >
                <Copy className="h-4 w-4" />
                <span>Copy Invalid URLs</span>
              </Button>
            </div>

            <Separator />

            {/* Detailed Results */}
            <div className="space-y-4">
              <h3 className="font-semibold">Detailed Results</h3>
              <div className="space-y-3">
                {Object.entries(validation).map(([url, result]) => (
                  <div
                    key={url}
                    className={`p-3 rounded-lg border ${
                      result.valid
                        ? "bg-green-50 border-green-200"
                        : "bg-red-50 border-red-200"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {result.valid ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                          <Badge
                            variant={result.valid ? "default" : "destructive"}
                            className={
                              result.valid ? "bg-green-100 text-green-800" : ""
                            }
                          >
                            {result.valid ? "Valid" : "Invalid"}
                          </Badge>
                        </div>
                        <div className="font-mono text-sm break-all">{url}</div>
                        {result.error && (
                          <div className="text-sm text-red-600 mt-1">
                            Error: {result.error}
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(url, "_blank")}
                          className="flex items-center space-x-1"
                        >
                          <ExternalLink className="h-3 w-3" />
                          <span className="text-xs">Open</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(url);
                            toast({
                              title: "Copied",
                              description: "URL copied to clipboard",
                            });
                          }}
                          className="flex items-center space-x-1"
                        >
                          <Copy className="h-3 w-3" />
                          <span className="text-xs">Copy</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <span>How to Use</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Supported URL Formats</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>https://www.facebook.com/share/[ID]/</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>https://www.facebook.com/[username]/</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>https://facebook.com/profile.php?id=[ID]</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>https://m.facebook.com/[username]/</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Validation Checks</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>URL format validation</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Facebook domain verification</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Profile accessibility check</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Error message details</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Tip:</strong> You can now use the valid URLs to create a
              new scraping job.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
