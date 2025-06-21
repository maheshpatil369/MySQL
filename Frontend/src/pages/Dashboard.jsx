import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import {
  MapPin,
  Calendar,
  Users,
  TrendingUp,
  Plus,
  Clock,
  IndianRupee,
  Globe,
  Loader2, 
  AlertCircle, 
  Plane, Train, Car, Utensils, Mountain, Camera, Waves, Music, Heart // For interests icons
} from 'lucide-react';
import Layout from '../components/layout/Layout.jsx';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom'; // For "New Trip" button
import travelImage from '../components/images/travel.jpg'; // Import the travel image

const API_TRIPS_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/events`; // Changed to /events
const API_EXPENSES_SUMMARY_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/expenses/user/summary`;

const interestIcons = {
  food: Utensils,
  adventure: Mountain,
  culture: Camera,
  relaxation: Waves,
  nightlife: Music,
  nature: Heart,
};

const Dashboard = () => {
  const { user, token } = useAuth();
  const [allTrips, setAllTrips] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState(null);
  const [expenseBalance, setExpenseBalance] = useState(0); // State for expense balance
  const [uniqueLocationsVisitedCount, setUniqueLocationsVisitedCount] = useState(0); // State for unique locations

  const [activeTrips, setActiveTrips] = useState([]);
  const [recentDisplayTrips, setRecentDisplayTrips] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token) {
        setDashboardLoading(false);
        setDashboardError("Not authenticated. Please log in.");
        setAllTrips([]);
        setExpenseBalance(0);
        return;
      }
      setDashboardLoading(true);
      setDashboardError(null);
      try {
        // Fetch trips and expense summary in parallel
        const [tripsResponse, expensesSummaryResponse] = await Promise.all([
          fetch(API_TRIPS_URL, { headers: { 'x-auth-token': token } }),
          fetch(API_EXPENSES_SUMMARY_URL, { headers: { 'x-auth-token': token } })
        ]);

        // Process trips
        if (!tripsResponse.ok) {
          const errorData = await tripsResponse.json().catch(() => ({}));
          throw new Error(errorData.msg || `Failed to fetch trips: ${tripsResponse.status}`);
        }
        const rawTripsData = await tripsResponse.json();
        console.log('Dashboard - Raw Trips API Data:', rawTripsData);

        const mappedTripsData = rawTripsData.map(item => ({
          id: item.id,
          start_city: item.start_city || item.title?.split(' to ')[0]?.replace('Trip from ', '') || 'N/A',
          end_city: item.end_city || item.location || item.title?.split(' to ')[1] || 'N/A',
          start_date: item.start_date || item.start,
          end_date: item.end_date || item.end,
          travelers: item.travelers ?? (parseInt(item.description?.match(/Travelers: (\d+)/)?.[1]) || 0),
          travel_option_name: item.travel_option_name || item.description?.match(/Travel by ([\w\s]+) \(/)?.[1] || 'Not specified',
          travel_option_price: item.travel_option_price || item.description?.match(/\(Price: (\$[\d,.]+)\)/)?.[1] || null,
          created_at: item.created_at,
        }));
        setAllTrips(mappedTripsData);
        console.log('Dashboard - Mapped Trips Data:', mappedTripsData);

        // Calculate unique locations visited
        if (mappedTripsData && mappedTripsData.length > 0) {
          const uniqueEndCities = new Set(mappedTripsData.map(trip => trip.end_city?.toLowerCase().trim()).filter(city => city));
          setUniqueLocationsVisitedCount(uniqueEndCities.size);
        } else {
          setUniqueLocationsVisitedCount(0);
        }

        const now = new Date();
        const currentActive = mappedTripsData.filter(trip => {
          const start = new Date(trip.start_date);
          const end = new Date(trip.end_date);
          if (isNaN(start.getTime()) || isNaN(end.getTime())) return false;
          end.setHours(23, 59, 59, 999);
          return now >= start && now <= end;
        });
        setActiveTrips(currentActive);

        const ongoingAndUpcomingTrips = mappedTripsData.filter(trip => {
          const start = new Date(trip.start_date);
          const end = new Date(trip.end_date);
          if (isNaN(start.getTime()) || isNaN(end.getTime())) return false;
          end.setHours(23, 59, 59, 999);
          return now <= end;
        }).sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
        setRecentDisplayTrips(ongoingAndUpcomingTrips);

        // Process expense summary
        if (!expensesSummaryResponse.ok) {
          const errorData = await expensesSummaryResponse.json().catch(() => ({}));
          throw new Error(errorData.msg || `Failed to fetch expense summary: ${expensesSummaryResponse.status}`);
        }
        const expensesData = await expensesSummaryResponse.json();
        console.log('Dashboard - Expense Summary Data:', expensesData);
        setExpenseBalance(expensesData.balance || 0);

      } catch (error) {
        console.error("Dashboard fetch error:", error);
        setDashboardError(error.message);
        setAllTrips([]);
        setExpenseBalance(0);
        setUniqueLocationsVisitedCount(0);
      } finally {
        setDashboardLoading(false);
      }
    };
    fetchDashboardData();
  }, [token]);
  
  const placeholderStats = [
    { name: 'Team Members', value: '12', icon: Users, color: 'bg-emerald-500', change: '+3 new' }, // Placeholder
  ];
  
  const dynamicStats = [
    { name: 'Active Trips', value: activeTrips.length.toString(), icon: MapPin, color: 'bg-blue-500', change: `${activeTrips.length > 0 ? 'Currently on the go!' : 'None active'}` },
    ...placeholderStats,
    { name: 'Unique Locations Visited', value: uniqueLocationsVisitedCount.toString(), icon: Globe, color: 'bg-purple-500', change: 'Based on end cities' },
    { name: 'Total Savings', value: `₹${parseFloat(expenseBalance).toFixed(2)}`, icon: IndianRupee, color: 'bg-amber-500', change: 'Current Balance' },
  ];


  const upcomingEvents = [
    { title: 'Flight to Tokyo', date: 'Dec 15', time: '2:30 PM', type: 'flight' },
    { title: 'Hotel Check-in', date: 'Dec 15', time: '6:00 PM', type: 'hotel' },
    { title: 'Team Dinner', date: 'Dec 16', time: '7:30 PM', type: 'activity' },
    { title: 'Sushi Workshop', date: 'Dec 17', time: '11:00 AM', type: 'activity' },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white"
        >
          <div className="flex flex-col items-start space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div>
              {/* <h1 className="text-3xl font-bold mb-2">
                Welcome back, {user?.name || 'username'}! ✈️
              </h1> */}
              <h1 className="text-3xl font-bold mb-2">
                Welcome back, {user?.name || 'username'}! ✈️
              </h1>

              <p className="text-blue-100 text-lg">
                Ready to plan your next adventure? Your team is excited to explore new destinations.
              </p>
            </div>
            <Link to="/plan">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2"
              >
            
                  <Plus className="h-5 w-5" />
                <span>New Trip</span>
              </motion.button>
            </Link>
          </div>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dynamicStats.map((stat, index) => (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.name}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                    {stat.value}
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    {stat.change}
                  </p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Recent Trips
                </h2>
              </div>
              <div className="p-6 space-y-4">
                {dashboardLoading && (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                    <p className="ml-3 text-gray-600 dark:text-gray-400">Loading recent trips...</p>
                  </div>
                )}
                {dashboardError && !dashboardLoading && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300 text-sm flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                    <span>{dashboardError}</span>
                  </div>
                )}
                {!dashboardLoading && !dashboardError && recentDisplayTrips.length === 0 && (
                  <p className="text-gray-600 dark:text-gray-400 text-center py-4">No recent trips to display. Plan one now!</p>
                )}
                {!dashboardLoading && !dashboardError && recentDisplayTrips.map((trip) => {
                  const cardImage = travelImage; // Use the imported travel image
                  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
                  
                  return (
                    <motion.div
                      key={trip.id}
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center space-x-2 sm:space-x-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 cursor-pointer"
                    >
                      <img
                        src={cardImage}
                        alt={`${trip.start_city} to ${trip.end_city}`}
                        className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 dark:text-white truncate">
                          {trip.start_city} to {trip.end_city}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          Via {trip.travel_option_name || 'N/A'}
                        </p>
                        <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
                          </span>
                          <span className="flex items-center">
                            <Users className="h-3 w-3 mr-1" />
                            {trip.travelers}
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          new Date() > new Date(trip.end_date) ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                          new Date() >= new Date(trip.start_date) ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                          'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                          {new Date() > new Date(trip.end_date) ? 'Completed' : new Date() >= new Date(trip.start_date) ? 'Active' : 'Upcoming'}
                        </span>
                        {trip.travel_option_price && (
                           <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mt-1">{trip.travel_option_price}</p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
            
            {/* Active Trips Section */}
            {!dashboardLoading && !dashboardError && activeTrips.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }} // Stagger animation
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mt-8 lg:mt-0"
              >
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Currently Active Trips
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  {activeTrips.map((trip) => {
                    const cardImage = travelImage; // Use the imported travel image
                    const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                    return (
                      <motion.div
                        key={`active-${trip.id}`}
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center space-x-2 sm:space-x-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 cursor-pointer"
                      >
                        <img
                          src={cardImage}
                          alt={`${trip.start_city} to ${trip.end_city}`}
                          className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 dark:text-white truncate">
                            {trip.start_city} to {trip.end_city}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
                          </p>
                           <p className="text-xs text-green-600 dark:text-green-400 font-semibold">Currently Active</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </div>

          <div className={activeTrips.length > 0 ? '' : 'lg:col-start-3'}> {/* Adjust upcoming events position if active trips are shown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Upcoming Events
                </h2>
              </div>
              <div className="p-6 space-y-4">
                {upcomingEvents.map((event, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="flex items-center space-x-3"
                  >
                    <div className={`w-3 h-3 rounded-full ${
                      event.type === 'flight' ? 'bg-blue-500' :
                      event.type === 'hotel' ? 'bg-green-500' :
                      'bg-purple-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {event.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {event.date} at {event.time}
                      </p>
                    </div>
                    <Clock className="h-4 w-4 text-gray-400" />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;