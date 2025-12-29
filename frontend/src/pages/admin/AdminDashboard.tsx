import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Package, Calendar, Clock, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { adminApi } from '../../services/api';
import { Card, CardContent, CardHeader, Badge, PageSpinner } from '../../components/ui';
import { DashboardStats, BookingStatus } from '../../types';

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await adminApi.getDashboard();
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: BookingStatus) => {
    const variants: Record<BookingStatus, 'yellow' | 'green' | 'red' | 'gray'> = {
      PENDING: 'yellow',
      APPROVED: 'green',
      REJECTED: 'red',
      CANCELLED: 'gray',
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) return <PageSpinner />;
  if (!stats) return null;

  return (
    <div className="space-y-8 animate-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Admin Dashboard
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Overview of system activity
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card hover>
          <CardContent className="py-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalUsers}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card hover>
          <CardContent className="py-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-violet-50 dark:bg-violet-900/20 rounded-xl">
                <Package className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalResources}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Resources</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card hover>
          <CardContent className="py-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.pendingBookings}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card hover>
          <CardContent className="py-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalBookings}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Bookings</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Booking Stats & Users by Role */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900 dark:text-white">
              Booking Statistics
            </h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-gray-600 dark:text-gray-300">Approved</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {stats.approvedBookings}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-500" />
                  <span className="text-gray-600 dark:text-gray-300">Pending</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {stats.pendingBookings}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-500" />
                  <span className="text-gray-600 dark:text-gray-300">Rejected</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {stats.rejectedBookings}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900 dark:text-white">
              Users by Role
            </h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.usersByRole.map((item) => (
                <div key={item.role} className="flex items-center justify-between">
                  <Badge variant={item.role === 'SUPER_ADMIN' ? 'green' : item.role === 'MODERATOR' ? 'yellow' : 'gray'}>
                    {item.role}
                  </Badge>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 dark:text-white">
              Recent Bookings
            </h2>
            <Link
              to="/admin/bookings"
              className="group text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight className="w-4 h-4 link-arrow" />
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Resource
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                {stats.recentBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">
                      {booking.title}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">
                      {booking.user.firstName} {booking.user.lastName}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">
                      {booking.resource.name}
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(booking.status)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(booking.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-800">
            {stats.recentBookings.map((booking) => (
              <div key={booking.id} className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900 dark:text-white">{booking.title}</span>
                  {getStatusBadge(booking.status)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {booking.user.firstName} {booking.user.lastName} • {booking.resource.name}
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500">
                  {formatDate(booking.createdAt)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
