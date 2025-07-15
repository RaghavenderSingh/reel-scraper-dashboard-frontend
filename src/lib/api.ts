// API Service Layer for Facebook Scraper Dashboard
// Implements all endpoints from the new API specification

const API_BASE_URL = "http://localhost:3001";

// Types based on the new API specification
export interface JobObject {
  id: string;
  name: string;
  status: "queued" | "processing" | "completed" | "failed" | "cancelled";
  profileUrls: string[];
  targetDate?: string;
  concurrency: number;
  extractionMode: "profile" | "main" | "comprehensive";
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  progress: {
    total: number;
    completed: number;
    failed: number;
    current: number;
  };
  results: ResultObject[];
  error?: string;
}

export interface ResultObject {
  profileId: string;
  profileUrl: string;
  extractionMode: "profile" | "main" | "comprehensive";
  success: boolean;
  data: {
    profile: { name: string; url: string };
    posts: any[];
    reels: ReelObject[];
    timeline: ReelObject[];
    reelsSection: ReelObject[];
    profileReelsSection: ReelObject[];
    mainReelsSection: ReelObject[];
    combinedReels: ReelObject[];
    summary: {
      extractionMode: string;
      totalReelsFound: number;
      timelineReels: number;
      profileReelsSection: number;
      mainReelsSection: number;
      combinedReels: number;
      targetDate?: string;
      targetDateFound: boolean;
    };
  };
  timestamp: string;
  error?: string;
}

export interface ReelObject {
  index: number;
  reelId: string;
  url: string;
  date?: string;
  dateText?: string;
  viewCount?: string;
  viewCountNumeric?: number;
  viewCountMethod: string;
  source:
    | "timeline"
    | "profile_reels_section"
    | "main_reels_section"
    | "reels_section"
    | "both";
  success: boolean;
  extractionMethod?: string;
  walkAttempts?: number;
  hasDate?: boolean;
  hasViews?: boolean;
  complete?: boolean;
  timestamp?: string;
}

export interface StatsObject {
  totalJobs: number;
  activeJobs: number;
  completedJobs: number;
  failedJobs: number;
  totalProfilesProcessed: number;
  totalReelsFound: number;
  averageReelsPerProfile: string;
  extractionModeStats: {
    profile: number;
    main: number;
    comprehensive: number;
  };
  last24Hours: {
    jobsCreated: number;
    profilesProcessed: number;
  };
}

export interface ValidationObject {
  validUrls: string[];
  invalidUrls: string[];
  validation: {
    [url: string]: {
      valid: boolean;
      error?: string;
    };
  };
}

export interface PaginationObject {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: PaginationObject;
}

// API Service Class
class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    try {
      console.log(`Making API request to: ${url}`);
      const response = await fetch(url, config);
      console.log(`Response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP Error ${response.status}:`, errorText);
        throw new Error(
          `HTTP ${response.status}: ${response.statusText} - ${errorText}`
        );
      }

      const data = await response.json();
      console.log(`API Response for ${endpoint}:`, data);
      return data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Health & Status Endpoints
  async getHealth(): Promise<{
    status: string;
    timestamp: string;
    uptime: number;
    version: string;
  }> {
    const response = await this.request<{
      status: string;
      timestamp: string;
      uptime: number;
      version: string;
    }>("/health");
    // Handle both direct response and wrapped response
    if (response.data) {
      return response.data;
    } else {
      return response as any;
    }
  }

  async getStatus(): Promise<{
    status: string;
    message: string;
    activeJobs: number;
    totalJobs: number;
    timestamp: string;
  }> {
    const response = await this.request<{
      status: string;
      message: string;
      activeJobs: number;
      totalJobs: number;
      timestamp: string;
    }>("/api/status");
    // Handle both direct response and wrapped response
    if (response.data) {
      return response.data;
    } else {
      return response as any;
    }
  }

  // Configuration Endpoints
  async getConfig(): Promise<{
    maxConcurrentProfiles: number;
    apiPort: number;
    outputDir: string;
    logLevel: string;
    scrollCount: number;
    retryAttempts: number;
    retryDelay: number;
    requestTimeout: number;
    pageLoadTimeout: number;
  }> {
    const response = await this.request<{
      maxConcurrentProfiles: number;
      apiPort: number;
      outputDir: string;
      logLevel: string;
      scrollCount: number;
      retryAttempts: number;
      retryDelay: number;
      requestTimeout: number;
      pageLoadTimeout: number;
    }>("/api/config");
    return response.data!;
  }

  // Job Management Endpoints
  async createJob(params: {
    profileUrls: string[];
    targetDate?: string;
    concurrency?: number;
    jobName?: string;
    extractionMode?: "profile" | "main" | "comprehensive";
  }): Promise<{ jobId: string; message: string; job: JobObject }> {
    const response = await this.request<{
      success: boolean;
      jobId: string;
      message: string;
      job: JobObject;
    }>("/api/jobs", {
      method: "POST",
      body: JSON.stringify(params),
    });
    const responseData = response as any;
    if (responseData.success && responseData.jobId) {
      return {
        jobId: responseData.jobId,
        message: responseData.message,
        job: responseData.job,
      };
    } else if (response.data) {
      return response.data;
    } else {
      return responseData;
    }
  }

  async getJobs(params?: {
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ jobs: JobObject[]; pagination: PaginationObject }> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append("status", params.status);
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.offset) queryParams.append("offset", params.offset.toString());

    const endpoint = `/api/jobs${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    const response = await this.request<{
      success: boolean;
      jobs: JobObject[];
      pagination: PaginationObject;
    }>(endpoint);

    // Handle the actual API response structure
    const responseData = response as any;
    if (responseData.success && responseData.jobs) {
      return { jobs: responseData.jobs, pagination: responseData.pagination };
    } else if (response.data) {
      return response.data;
    } else {
      return responseData;
    }
  }

  async getJob(jobId: string): Promise<JobObject> {
    const response = await this.request<JobObject>(`/api/jobs/${jobId}`);
    if (response.data) {
      return response.data;
    } else {
      return response as any;
    }
  }

  async deleteJob(jobId: string): Promise<{ message: string }> {
    const response = await this.request<{ message: string }>(
      `/api/jobs/${jobId}`,
      {
        method: "DELETE",
      }
    );
    if (response.data) {
      return response.data;
    } else {
      return response as any;
    }
  }

  // Results Endpoints
  async getResults(params?: {
    jobId?: string;
    profileUrl?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ results: ResultObject[]; pagination: PaginationObject }> {
    const queryParams = new URLSearchParams();
    if (params?.jobId) queryParams.append("jobId", params.jobId);
    if (params?.profileUrl) queryParams.append("profileUrl", params.profileUrl);
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.offset) queryParams.append("offset", params.offset.toString());

    const endpoint = `/api/results${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    try {
      const response = await this.request<{
        success: boolean;
        results: ResultObject[];
        pagination: PaginationObject;
      }>(endpoint);

      const responseData = response as any;
      if (responseData.success && responseData.results) {
        return {
          results: responseData.results,
          pagination: responseData.pagination,
        };
      } else if (response.data) {
        return response.data;
      } else {
        return responseData;
      }
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  async getResult(resultId: string): Promise<ResultObject> {
    const response = await this.request<ResultObject>(
      `/api/results/${resultId}`
    );
    if (response.data) {
      return response.data;
    } else {
      return response as any;
    }
  }

  // Export Endpoints
  async exportResults(
    jobId: string,
    format: "json" | "csv" = "json"
  ): Promise<Blob> {
    const response = await fetch(
      `${this.baseUrl}/api/export/${jobId}?format=${format}`
    );
    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }
    return response.blob();
  }

  // Statistics Endpoints
  async getStats(): Promise<{ stats: StatsObject; timestamp: string }> {
    const response = await this.request<{
      success: boolean;
      stats: StatsObject;
      timestamp: string;
    }>("/api/stats");
    // Handle the actual API response structure
    const responseData = response as any;
    if (responseData.success && responseData.stats) {
      return { stats: responseData.stats, timestamp: responseData.timestamp };
    } else if (response.data) {
      return response.data;
    } else {
      return responseData;
    }
  }

  // Profile Management Endpoints
  async validateProfiles(profileUrls: string[]): Promise<{
    validation: ValidationObject;
    validUrls: string[];
    invalidUrls: string[];
  }> {
    const response = await this.request<{
      success: boolean;
      validation: ValidationObject;
      validUrls: string[];
      invalidUrls: string[];
    }>("/api/profiles/validate", {
      method: "POST",
      body: JSON.stringify({ profileUrls }),
    });
    const responseData = response as any;
    if (responseData.success && responseData.validation) {
      return {
        validation: responseData.validation,
        validUrls: responseData.validUrls,
        invalidUrls: responseData.invalidUrls,
      };
    } else if (response.data) {
      return response.data;
    } else {
      return responseData;
    }
  }

  // Monitoring Endpoints
  async getMonitoringHealth(): Promise<{
    status: string;
    timestamp: string;
    uptime: number;
    memory: any;
    activeJobs: number;
    systemLoad: any;
  }> {
    const response = await this.request<{
      success: boolean;
      status: string;
      timestamp: string;
      uptime: number;
      memory: any;
      activeJobs: number;
      systemLoad: any;
    }>("/api/monitoring/health");
    const responseData = response as any;
    if (responseData.success && responseData.status) {
      return {
        status: responseData.status,
        timestamp: responseData.timestamp,
        uptime: responseData.uptime,
        memory: responseData.memory,
        activeJobs: responseData.activeJobs,
        systemLoad: responseData.systemLoad,
      };
    } else if (response.data) {
      return response.data;
    } else {
      return responseData;
    }
  }

  async getLogs(
    lines: number = 50
  ): Promise<{ logs: string[]; totalLines: number; requestedLines: number }> {
    const response = await this.request<{
      success: boolean;
      logs: string[];
      totalLines: number;
      requestedLines: number;
    }>(`/api/monitoring/logs?lines=${lines}`);
    const responseData = response as any;
    if (responseData.success && responseData.logs) {
      return {
        logs: responseData.logs,
        totalLines: responseData.totalLines,
        requestedLines: responseData.requestedLines,
      };
    } else if (response.data) {
      return response.data;
    } else {
      return responseData;
    }
  }

  // Legacy Endpoints (Enhanced)
  async scrapeProfile(params: {
    profileUrl: string;
    targetDate?: string;
    extractionMode?: "profile" | "main" | "comprehensive";
  }): Promise<{
    data: ResultObject;
    extractionMode: string;
    timestamp: string;
  }> {
    const response = await this.request<{
      data: ResultObject;
      extractionMode: string;
      timestamp: string;
    }>("/api/scrape", {
      method: "POST",
      body: JSON.stringify(params),
    });
    return response.data!;
  }

  async scrapeBatch(params: {
    profileUrls: string[];
    targetDate?: string;
    concurrency?: number;
    extractionMode?: "profile" | "main" | "comprehensive";
  }): Promise<{ summary: any; results: ResultObject[] }> {
    const response = await this.request<{
      summary: any;
      results: ResultObject[];
    }>("/api/scrape/batch", {
      method: "POST",
      body: JSON.stringify(params),
    });
    return response.data!;
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Export utility functions for common operations
export const apiUtils = {
  // Format view counts for display
  formatViews: (views: string | number | undefined): string => {
    if (!views) return "0";
    if (typeof views === "string") return views;
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  },

  // Calculate summary statistics for results
  calculateSummaryStats: (data: ResultObject["data"]) => {
    if (!data.reels || data.reels.length === 0) {
      return {
        totalReels: 0,
        totalViews: 0,
        averageViews: 0,
        completeReels: 0,
        reelsWithDate: 0,
        reelsWithViews: 0,
        extractionMode: data.summary.extractionMode,
        timelineReels: data.summary.timelineReels,
        profileReelsSection: data.summary.profileReelsSection,
        mainReelsSection: data.summary.mainReelsSection,
        combinedReels: data.summary.combinedReels,
      };
    }

    const reels = data.reels;
    const totalReels = reels.length;
    const completeReels = reels.filter((reel) => reel.complete).length;
    const reelsWithDate = reels.filter((reel) => reel.hasDate).length;
    const reelsWithViews = reels.filter((reel) => reel.hasViews).length;

    const totalViews = reels.reduce((sum, reel) => {
      if (reel.viewCountNumeric) {
        return sum + reel.viewCountNumeric;
      }
      return sum;
    }, 0);

    const averageViews =
      reelsWithViews > 0 ? Math.round(totalViews / reelsWithViews) : 0;

    return {
      totalReels,
      totalViews,
      averageViews,
      completeReels,
      reelsWithDate,
      reelsWithViews,
      extractionMode: data.summary.extractionMode,
      timelineReels: data.summary.timelineReels,
      profileReelsSection: data.summary.profileReelsSection,
      mainReelsSection: data.summary.mainReelsSection,
      combinedReels: data.summary.combinedReels,
    };
  },

  // Convert results to CSV format
  convertToCSV: (data: ResultObject["data"]): string => {
    if (!data.reels || data.reels.length === 0)
      return "No reels data available";

    const headers = [
      "Index",
      "Reel ID",
      "Date",
      "View Count",
      "Has Date",
      "Has Views",
      "Complete",
      "Source",
      "Extraction Method",
      "URL",
    ];

    const rows = data.reels.map((reel) => [
      reel.index || "",
      reel.reelId || "",
      reel.dateText || "",
      reel.viewCount || "",
      reel.hasDate ? "Yes" : "No",
      reel.hasViews ? "Yes" : "No",
      reel.complete ? "Yes" : "No",
      reel.source || "",
      reel.extractionMethod || "",
      reel.url || "",
    ]);

    return [headers, ...rows].map((row) => row.join(",")).join("\n");
  },

  // Get status color for UI
  getStatusColor: (status: string): string => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "queued":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  },

  // Get status icon for UI
  getStatusIcon: (status: string) => {
    // This will be implemented in components that use icons
    return status;
  },
};
