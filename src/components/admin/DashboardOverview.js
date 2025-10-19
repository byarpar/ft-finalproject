import React, { useState, useEffect } from 'react';
import adminAPI from '../../services/adminAPI';
import StatCard from './StatCard';
import {
  UsersIcon,
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const DashboardOverview = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getDashboardStats();

      if (response.success && response.data?.dashboard) {
        setStats(response.data.dashboard);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError(err.message || 'Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
        <button
          onClick={fetchDashboardStats}
          className="mt-2 text-sm text-red-600 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  const overview = stats?.overview || {};

  // Chart data
  const activityChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'New Registrations',
        data: [12, 19, 15, 25, 22, 30, 28],
        borderColor: 'rgb(20, 184, 166)',
        backgroundColor: 'rgba(20, 184, 166, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'New Word Submissions',
        data: [5, 9, 12, 15, 10, 18, 14],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const partOfSpeechData = {
    labels: stats?.part_of_speech_distribution?.map(item => item.part_of_speech || 'Unknown') || [],
    datasets: [
      {
        label: 'Words by Part of Speech',
        data: stats?.part_of_speech_distribution?.map(item => item.count) || [],
        backgroundColor: [
          'rgba(20, 184, 166, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: 'rgb(156, 163, 175)',
          padding: 15,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: 'rgb(156, 163, 175)',
          padding: 15,
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome, Super Admin!
        </h1>
        <p className="text-gray-600">
          Here's what's happening with your Lisu Dictionary today.
        </p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="New Users (24h)"
          value={45}
          change={12}
          changeType="increase"
          icon={UsersIcon}
          color="teal"
        />
        <StatCard
          title="Pending Words"
          value={128}
          alert="Needs Review"
          icon={ClockIcon}
          color="yellow"
        />
        <StatCard
          title="Total Words"
          value={overview.total_words}
          change={5}
          changeType="increase"
          icon={BookOpenIcon}
          color="blue"
        />
        <StatCard
          title="Active Discussions"
          value={350}
          change={8}
          changeType="increase"
          icon={ChatBubbleLeftRightIcon}
          color="green"
        />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={overview.total_users}
          icon={UsersIcon}
          color="purple"
        />
        <StatCard
          title="Active Users"
          value={overview.active_users}
          icon={CheckCircleIcon}
          color="green"
        />
        <StatCard
          title="Inactive Users"
          value={overview.inactive_users}
          icon={XCircleIcon}
          color="red"
        />
        <StatCard
          title="Etymology Entries"
          value={overview.total_etymology}
          icon={BookOpenIcon}
          color="orange"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Website Activity Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Website Activity
          </h3>
          <div className="h-64">
            <Line data={activityChartData} options={chartOptions} />
          </div>
        </div>

        {/* Part of Speech Distribution */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Words by Part of Speech
          </h3>
          <div className="h-64">
            {stats?.part_of_speech_distribution?.length > 0 ? (
              <Doughnut data={partOfSpeechData} options={doughnutOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pending Reviews Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Word Contributions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Pending Word Contributions
            </h3>
          </div>
          <div className="divide-y divide-gray-200">
            {[1, 2, 3].map((item) => (
              <div key={item} className="px-6 py-4 hover:bg-gray-50:bg-gray-700/50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      ꓞꓳꓽ • To Teach
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Submitted by <span className="font-medium">JohnDoe</span> • 2 hours ago
                    </p>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded-md transition-colors">
                      Approve
                    </button>
                    <button className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded-md transition-colors">
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
            <button className="text-sm text-teal-600 hover:underline">
              View all pending contributions →
            </button>
          </div>
        </div>

        {/* Recent User Registrations */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent User Registrations
            </h3>
          </div>
          <div className="divide-y divide-gray-200">
            {[1, 2, 3].map((item) => (
              <div key={item} className="px-6 py-4 hover:bg-gray-50:bg-gray-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center text-white font-medium">
                      UN
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Username{item}
                      </p>
                      <p className="text-xs text-gray-500">
                        user{item}@example.com
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {item} hour{item > 1 ? 's' : ''} ago
                    </p>
                    <button className="text-xs text-teal-600 hover:underline mt-1">
                      View Profile
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
            <button className="text-sm text-teal-600 hover:underline">
              View all users →
            </button>
          </div>
        </div>
      </div>

      {/* Recent Searches */}
      {stats?.recent_searches?.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Popular Searches (Last 24h)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {stats.recent_searches.map((search, index) => (
              <div
                key={index}
                className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-md"
              >
                <span className="text-sm text-gray-700 truncate">
                  {search.search_term}
                </span>
                <span className="ml-2 text-xs font-medium text-teal-600">
                  {search.search_count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            System Status
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Database</span>
              <span className="flex items-center text-sm font-medium text-green-600">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Online
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">API Server</span>
              <span className="flex items-center text-sm font-medium text-green-600">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Operational
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Search Service</span>
              <span className="flex items-center text-sm font-medium text-green-600">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Running
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Server Load
          </h3>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600">CPU Usage</span>
                <span className="text-sm font-medium text-gray-900">45%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-teal-500 h-2 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600">Memory</span>
                <span className="text-sm font-medium text-gray-900">62%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '62%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600">Disk Space</span>
                <span className="text-sm font-medium text-gray-900">38%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '38%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
