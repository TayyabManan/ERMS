import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { bookingApi } from '../services/api';
import { Card, CardContent, Badge, PageSpinner, EmptyState, Button } from '../components/ui';
import { Booking, BookingStatus } from '../types';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const response = await bookingApi.getMyBookings({ limit: 5 });
        if (isMounted) {
          setBookings(response.data.data.items);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Failed to fetch dashboard data:', error);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

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

  return (
    <div className="space-y-8 animate-in">
      {/* Welcome section */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Welcome back, {user?.firstName}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Here's what's happening with your bookings
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card hover onClick={() => navigate('/bookings')} className="cursor-pointer">
          <CardContent className="flex items-center gap-4 py-5">
            <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl">
              <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {bookings.length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Recent Bookings</p>
            </div>
          </CardContent>
        </Card>

        <Card hover onClick={() => navigate('/bookings?status=PENDING')} className="cursor-pointer">
          <CardContent className="flex items-center gap-4 py-5">
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {bookings.filter((b) => b.status === 'PENDING').length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent bookings */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Bookings
          </h2>
          <Link to="/bookings" className="group text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-1 transition-colors">
            View all <ArrowRight className="w-4 h-4 link-arrow" />
          </Link>
        </div>

        {bookings.length === 0 ? (
          <Card>
            <EmptyState
              title="No bookings yet"
              description="Create your first booking to get started"
              action={
                <Link to="/resources">
                  <Button size="sm">Browse Resources</Button>
                </Link>
              }
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {bookings.map((booking) => (
              <Card key={booking.id} hover>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white truncate">
                        {booking.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        {booking.resource.name}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {formatDate(booking.startTime)}
                      </p>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
