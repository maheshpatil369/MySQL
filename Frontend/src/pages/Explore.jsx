import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  MapPin, 
  Star, 
  Heart,
  Share2,
  Calendar,
  Users,
  DollarSign,
  Compass,
  Mountain,
  Waves,
  Camera,
  Utensils,
  Music
} from 'lucide-react';
import Layout from '../components/layout/Layout.jsx';

const Explore = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState('all');

  const categories = [
    { id: 'all', name: 'All', icon: Compass },
    { id: 'adventure', name: 'Adventure', icon: Mountain },
    { id: 'beach', name: 'Beach', icon: Waves },
    { id: 'culture', name: 'Culture', icon: Camera },
    { id: 'food', name: 'Food', icon: Utensils },
    { id: 'nightlife', name: 'Nightlife', icon: Music },
  ];

  const destinations = [
    {
      id: 1,
      name: 'Santorini, Greece',
      country: 'Greece',
      image: 'https://images.pexels.com/photos/1285625/pexels-photo-1285625.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.8,
      reviews: 2847,
      price: '$$$',
      category: 'beach',
      description: 'Stunning sunsets, white-washed buildings, and crystal-clear waters make Santorini a perfect romantic getaway.',
      highlights: ['Sunset Views', 'Wine Tasting', 'Volcanic Beaches'],
      duration: '5-7 days',
      bestTime: 'Apr-Oct',
      liked: false
    },
    {
      id: 2,
      name: 'Tokyo, Japan',
      country: 'Japan',
      image: 'https://images.pexels.com/photos/2506923/pexels-photo-2506923.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.9,
      reviews: 3521,
      price: '$$$$',
      category: 'culture',
      description: 'A fascinating blend of traditional culture and cutting-edge technology in one of the world\'s most vibrant cities.',
      highlights: ['Temples & Shrines', 'Street Food', 'Technology'],
      duration: '7-10 days',
      bestTime: 'Mar-May, Sep-Nov',
      liked: true
    },
    {
      id: 3,
      name: 'Banff, Canada',
      country: 'Canada',
      image: 'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.7,
      reviews: 1923,
      price: '$$',
      category: 'adventure',
      description: 'Breathtaking mountain landscapes, pristine lakes, and world-class hiking trails in the Canadian Rockies.',
      highlights: ['Mountain Hiking', 'Lake Louise', 'Wildlife'],
      duration: '4-6 days',
      bestTime: 'Jun-Sep',
      liked: false
    },
    {
      id: 4,
      name: 'Barcelona, Spain',
      country: 'Spain',
      image: 'https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.6,
      reviews: 2156,
      price: '$$$',
      category: 'culture',
      description: 'Gaudí\'s architectural masterpieces, vibrant street life, and Mediterranean charm create an unforgettable experience.',
      highlights: ['Sagrada Familia', 'Park Güell', 'Tapas Tours'],
      duration: '4-6 days',
      bestTime: 'May-Sep',
      liked: true
    },
    {
      id: 5,
      name: 'Bali, Indonesia',
      country: 'Indonesia',
      image: 'https://images.pexels.com/photos/2166559/pexels-photo-2166559.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.5,
      reviews: 3847,
      price: '$',
      category: 'beach',
      description: 'Tropical paradise with ancient temples, lush rice terraces, and world-class beaches perfect for relaxation.',
      highlights: ['Rice Terraces', 'Beach Clubs', 'Temples'],
      duration: '7-14 days',
      bestTime: 'Apr-Oct',
      liked: false
    },
    {
      id: 6,
      name: 'New York City, USA',
      country: 'USA',
      image: 'https://images.pexels.com/photos/466685/pexels-photo-466685.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.4,
      reviews: 5632,
      price: '$$$$',
      category: 'culture',
      description: 'The city that never sleeps offers world-class museums, Broadway shows, and iconic landmarks.',
      highlights: ['Broadway Shows', 'Central Park', 'Museums'],
      duration: '4-7 days',
      bestTime: 'Apr-Jun, Sep-Nov',
      liked: true
    }
  ];

  const filteredDestinations = destinations.filter(dest => {
    const matchesSearch = dest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dest.country.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || dest.category === selectedCategory;
    const matchesPrice = priceRange === 'all' || dest.price === priceRange;
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const getPriceColor = (price) => {
    switch (price) {
      case '$': return 'text-green-600 dark:text-green-400';
      case '$$': return 'text-yellow-600 dark:text-yellow-400';
      case '$$$': return 'text-orange-600 dark:text-orange-400';
      case '$$$$': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Explore Destinations
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Discover amazing places around the world for your next adventure
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search destinations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-10 pr-8 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>

            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="pl-10 pr-8 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Prices</option>
                <option value="$">$ Budget</option>
                <option value="$$">$$ Moderate</option>
                <option value="$$$">$$$ Expensive</option>
                <option value="$$$$">$$$$ Luxury</option>
              </select>
            </div>
          </div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-2"
        >
          {categories.map((category) => (
            <motion.button
              key={category.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
              }`}
            >
              <category.icon className="h-4 w-4 mr-2" />
              {category.name}
            </motion.button>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDestinations.map((destination, index) => (
            <motion.div
              key={destination.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden group"
            >
              <div className="relative">
                <img
                  src={destination.image}
                  alt={destination.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 right-4 flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
                      destination.liked 
                        ? 'bg-red-500 text-white' 
                        : 'bg-white/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-400 hover:text-red-500'
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${destination.liked ? 'fill-current' : ''}`} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors"
                  >
                    <Share2 className="h-4 w-4" />
                  </motion.button>
                </div>
                <div className="absolute bottom-4 left-4">
                  <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getPriceColor(destination.price)} bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm`}>
                    {destination.price}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {destination.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 flex items-center mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      {destination.country}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white ml-1">
                      {destination.rating}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                      ({destination.reviews})
                    </span>
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  {destination.description}
                </p>

                <div className="flex flex-wrap gap-1 mb-4">
                  {destination.highlights.map((highlight) => (
                    <span key={highlight} className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 rounded-full">
                      {highlight}
                    </span>
                  ))}
                </div>

                <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {destination.duration}
                  </div>
                  <div>
                    Best: {destination.bestTime}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Plan Trip
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
                  >
                    Learn More
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredDestinations.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Compass className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No destinations found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search criteria or explore different categories
            </p>
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default Explore;