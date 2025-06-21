import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin,
  Calendar,
  Users,
  MoreVertical,
  Edit,
  Share2,
  Download,
  Trash2,
  Plus,
  Filter,
  Search,
  AlertCircle, // For error messages
  Loader2, // For loading state
  Plane, Train, Car, Utensils, Mountain, Camera, Waves, Music, Heart // For interests icons
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom'; // For "New Trip" button
import travelImage from '../components/images/travel.jpg'; // Import the travel image

const API_EVENTS_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/events`; // Changed to /events

const interestIcons = {
  food: Utensils,
  adventure: Mountain,
  culture: Camera,
  relaxation: Waves,
  nightlife: Music,
  nature: Heart,
};


const MyTrips = () => {
  const { token } = useAuth();
  const [myTrips, setMyTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'upcoming', 'active', 'completed'

  useEffect(() => {
    const fetchTrips = async () => {
      if (!token) {
        setIsLoading(false);
        setFetchError("Not authenticated. Please log in.");
        setMyTrips([]); // Clear trips if not authenticated
        return;
      }
      setIsLoading(true);
      setFetchError(null);
      try {
        const response = await fetch(API_EVENTS_URL, { // Changed to API_EVENTS_URL
          headers: {
            'x-auth-token': token,
          },
        });

        if (!response.ok) {
          let errorMsg = `Failed to fetch trips: ${response.status} ${response.statusText}`;
          try {
            // Attempt to get more specific error message from JSON response
            const errorData = await response.json();
            errorMsg = errorData.msg || errorData.error || errorMsg;
          } catch (jsonError) {
            // If the error response isn't JSON, or another error occurs parsing it,
            // stick with the HTTP status error.
            console.error("Could not parse error response as JSON:", jsonError);
            // We could also try response.text() here if needed for non-JSON errors
          }
          throw new Error(errorMsg);
        }

        const data = await response.json();
        // Map backend event fields to frontend trip fields if necessary
        const mappedData = data.map(event => ({
          id: event.id,
          start_city: event.title.split(' to ')[0]?.replace('Trip from ', '') || 'N/A', // Attempt to parse from title
          end_city: event.location || event.title.split(' to ')[1] || 'N/A', // Use location or parse from title
          start_date: event.start, // Assuming backend sends 'start'
          end_date: event.end,     // Assuming backend sends 'end'
          travelers: parseInt(event.description?.match(/Travelers: (\d+)/)?.[1]) || 0,
          interests: event.description?.match(/Interests: ([\w\s,]+)\./)?.[1]?.split(', ') || [],
          travel_option_name: event.description?.match(/Travel by ([\w\s]+) \(/)?.[1] || 'Not specified',
          travel_option_price: event.description?.match(/\(Price: (\$[\d,.]+)\)/)?.[1] || null,
          distance: event.distance, // Added distance
          // Add other fields as needed, or adjust parsing from description
        }));
        setMyTrips(mappedData);
      } catch (error) {
        // This will catch network errors (fetch promise rejected)
        // or errors thrown from the !response.ok block.
        setFetchError(error.message || "An unknown error occurred while fetching trips.");
        setMyTrips([]); // Clear trips on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrips();
  }, [token]);

  const getTripStatus = (startDateStr, endDateStr) => {
    const now = new Date();
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    end.setHours(23, 59, 59, 999); // Consider end of day for end date

    if (now > end) return 'completed';
    if (now >= start && now <= end) return 'active';
    if (now < start) return 'upcoming';
    return 'unknown'; // Should not happen with valid dates
  };
  
  const filteredTrips = myTrips.filter(trip => {
    const tripStatus = getTripStatus(trip.start_date, trip.end_date);
    const searchLower = searchTerm.toLowerCase();
    // Ensure all fields being searched are strings
    const matchesSearch =
      (String(trip.start_city)?.toLowerCase() || '').includes(searchLower) ||
      (String(trip.end_city)?.toLowerCase() || '').includes(searchLower) ||
      (String(trip.travel_option_name)?.toLowerCase() || '').includes(searchLower) ||
      (trip.interests?.some(interest => String(interest)?.toLowerCase().includes(searchLower))) ||
      (String(trip.distance)?.includes(searchLower)); // Search by distance

    const matchesFilter = filterStatus === 'all' || tripStatus === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'upcoming': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'completed': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };
  
  const formatDateRange = (startDateStr, endDateStr) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    const start = new Date(startDateStr).toLocaleDateString(undefined, options);
    const end = new Date(endDateStr).toLocaleDateString(undefined, options);
    return `${start} - ${end}`;
  };


  return (
    <Layout>
      <div className="space-y-8 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Trips</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage and track all your travel adventures
            </p>
          </div>
          <Link to="/plan-trip">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-4 sm:mt-0 inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Trip
            </motion.button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by city, travel mode, or interest..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-10 pr-8 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="all">All Trips</option>
              <option value="upcoming">Upcoming</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </motion.div>

        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
            <p className="ml-4 text-lg text-gray-700 dark:text-gray-300">Loading your trips...</p>
          </div>
        )}

        {fetchError && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="my-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300 text-sm flex items-center"
          >
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <span>Error fetching trips: {fetchError}</span>
          </motion.div>
        )}

        {!isLoading && !fetchError && filteredTrips.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrips.map((trip, index) => {
              const tripStatus = getTripStatus(trip.start_date, trip.end_date);
              const InterestIcon = trip.interests && trip.interests.length > 0 && interestIcons[trip.interests[0].toLowerCase()]
                                   ? interestIcons[trip.interests[0].toLowerCase()]
                                   : MapPin; // Default icon
             
             const cardImage = travelImage; // Use the imported travel image

             return (
               <motion.div
                  key={trip.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -5 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden group flex flex-col"
                >
                  <div className="relative">
                    <img
                      src={cardImage}
                      alt={`${trip.start_city} to ${trip.end_city}`}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4">
                      <button className="p-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-colors">
                        <MoreVertical className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      </button>
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(tripStatus)}`}>
                        {tripStatus.charAt(0).toUpperCase() + tripStatus.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                      {trip.start_city} to {trip.end_city}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                      Travel via {trip.travel_option_name || 'Not specified'}
                    </p>

                    <div className="space-y-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                        {formatDateRange(trip.start_date, trip.end_date)}
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2 flex-shrink-0" />
                        {trip.travelers} {trip.travelers === 1 ? 'Traveler' : 'Travelers'}
                      </div>
                       {trip.travel_option_price && (
                        <div className="flex items-center">
                          <span className="font-semibold text-gray-700 dark:text-gray-300 mr-1">Est. Cost:</span> {trip.travel_option_price}
                        </div>
                      )}
                      {trip.interests && trip.interests.length > 0 && (
                        <div className="flex items-center flex-wrap">
                          <InterestIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                          Interests: {trip.interests.join(', ')}
                        </div>
                      )}
                      {trip.distance !== null && trip.distance !== undefined && (
                        <div className="flex items-center">
                           <MapPin className="h-4 w-4 mr-2 flex-shrink-0 text-gray-500" /> {/* Example icon */}
                          Distance: {trip.distance} km
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          <Edit className="h-4 w-4 inline mr-1" />
                          Details
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        {!isLoading && !fetchError && filteredTrips.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No trips found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm || filterStatus !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'You haven\'t planned any trips yet. Start your adventure!'
              }
            </p>
            <Link to="/plan-trip">
              <button className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Plus className="h-5 w-5 mr-2" />
                Create New Trip
              </button>
            </Link>
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default MyTrips;