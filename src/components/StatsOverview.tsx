
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart3, 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  TrendingUp,
  Activity
} from 'lucide-react';

interface StatsOverviewProps {
  stats: {
    totalJobs: number;
    activeJobs: number;
    completedJobs: number;
    failedJobs: number;
    totalProfilesProcessed: number;
    totalReelsFound: number;
    averageReelsPerProfile: string;
    last24Hours: {
      jobsCreated: number;
      profilesProcessed: number;
    };
  };
}

export const StatsOverview = ({ stats }: StatsOverviewProps) => {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const statCards = [
    {
      title: 'Total Jobs',
      value: stats.totalJobs,
      icon: <BarChart3 className="h-4 w-4 text-blue-600" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Active Jobs',
      value: stats.activeJobs,
      icon: <Activity className="h-4 w-4 text-orange-600" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Completed',
      value: stats.completedJobs,
      icon: <CheckCircle className="h-4 w-4 text-green-600" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Failed',
      value: stats.failedJobs,
      icon: <XCircle className="h-4 w-4 text-red-600" />,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Profiles Processed',
      value: formatNumber(stats.totalProfilesProcessed),
      icon: <Users className="h-4 w-4 text-purple-600" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Reels Found',
      value: formatNumber(stats.totalReelsFound),
      icon: <TrendingUp className="h-4 w-4 text-pink-600" />,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Average Reels per Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">
              {stats.averageReelsPerProfile}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Jobs Created (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.last24Hours.jobsCreated}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Profiles Processed (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.last24Hours.profilesProcessed}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
