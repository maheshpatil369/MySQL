import React, { useState, useEffect } from 'react'; 
import { motion } from 'framer-motion';
import cities from '../Data/cities.json';


import {
  MapPin,
  Calendar,
  Users,
  Search,
  Plus,
  Plane,
  Train,
  Car,
  Clock,
  DollarSign,
  Heart,
  Camera,
  Mountain,
  Utensils,
  Music,
  Waves,
  AlertCircle, 
  CheckCircle, 
  X
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useAuth } from '../contexts/AuthContext'; 

const API_EVENTS_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/events`; 

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; 
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; 
  return Math.round(distance); 
}


const PlanTrip = () => {
  const { token } = useAuth(); 
  const [startCity, setStartCity] = useState('');
  const [endCity, setEndCity] = useState('');
  const [error, setError] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [travelers, setTravelers] = useState(2);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTravelOption, setSelectedTravelOption] = useState(null); 
  const [dynamicTravelOptions, setDynamicTravelOptions] = useState([]); 

  const [showStartDropdown, setShowStartDropdown] = useState(false);
  const [filteredStartCities, setFilteredStartCities] = useState([]);
  const [showEndDropdown, setShowEndDropdown] = useState(false);
  const [filteredEndCities, setFilteredEndCities] = useState([]);
  const [distance, setDistance] = useState(null); 

  // API call states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);


  const interests = [
    { id: 'food', name: 'Food & Dining', icon: Utensils, color: 'bg-orange-500' },
    { id: 'adventure', name: 'Adventure', icon: Mountain, color: 'bg-green-500' },
    { id: 'culture', name: 'Culture', icon: Camera, color: 'bg-purple-500' },
    { id: 'relaxation', name: 'Relaxation', icon: Waves, color: 'bg-blue-500' },
    { id: 'nightlife', name: 'Nightlife', icon: Music, color: 'bg-pink-500' },
    { id: 'nature', name: 'Nature', icon: Heart, color: 'bg-emerald-500' },
  ];

  const baseTravelOptions = [
    { type: 'flight', icon: Plane, name: 'Flight', costPerKm: 8, duration: '3h 45m', color: 'bg-blue-500' },
    { type: 'train', icon: Train, name: 'Train', costPerKm: 2.5, duration: '8h 30m', color: 'bg-green-500' },
    { type: 'car', icon: Car, name: 'Car Rental', costPerKm: 12, duration: '6h 15m', color: 'bg-purple-500' },
  ];

  useEffect(() => {
    if (distance && travelers > 0) {
      const updatedOptions = baseTravelOptions.map(option => {
        const totalCost = Math.round(option.costPerKm * distance * travelers);
        return { ...option, price: `$${totalCost}` };
      });
      setDynamicTravelOptions(updatedOptions);
    } else {
      const defaultOptions = baseTravelOptions.map(option => ({
        ...option,
        price: 'N/A (Select cities & travelers)'
      }));
      setDynamicTravelOptions(defaultOptions);
    }
  }, [distance, travelers, startCity, endCity]); 

  const toggleInterest = (interestId) => {
    setSelectedInterests(prev => 
      prev.includes(interestId) 
        ? prev.filter(id => id !== interestId)
        : [...prev, interestId]
    );
  };

  const steps = [
    { number: 1, title: 'Destination', description: 'Choose your travel route' },
    { number: 2, title: 'Dates & Travelers', description: 'When and with whom' },
    { number: 3, title: 'Interests', description: 'What you love to do' },
    { number: 4, title: 'Travel Options', description: 'How to get there' },
    { number: 5, title: 'Confirmation', description: 'Review and create' }, // Added Confirmation Step
  ];

  const handleSelectTravelOption = (option) => {
    setSelectedTravelOption(option);
    setSubmitError(null); 
  };

  const handleCreateTrip = async () => {
    if (currentStep !== 4 && currentStep !== 5) return;
    if (!selectedTravelOption && currentStep === 4) {
        setSubmitError("Please select a travel option before proceeding.");
        return;
    }
    if (currentStep === 4) { 
        setCurrentStep(5);
        setSubmitError(null);
        return;
    }


    if (!startCity || !endCity || !startDate || !endDate || travelers < 1 || !selectedTravelOption) {
      setSubmitError('Please ensure all fields are filled and a travel option is selected.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    const eventTitle = `Trip from ${startCity} to ${endCity}`;
    let eventDescription = `Travelers: ${travelers}.`;
    if (selectedInterests.length > 0) {
      eventDescription += ` Interests: ${selectedInterests.join(', ')}.`;
    }
    if (selectedTravelOption) {
      const currentSelectedOptionDetails = dynamicTravelOptions.find(opt => opt.type === selectedTravelOption.type) || selectedTravelOption;
      eventDescription += ` Travel by ${currentSelectedOptionDetails.name} (Duration: ${currentSelectedOptionDetails.duration}, Price: ${currentSelectedOptionDetails.price}).`;
    }
    
    const eventData = {
      title: eventTitle,
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      allDay: false,
      description: eventDescription,
      location: endCity,
      distance: distance, 
    };

    console.log("Frontend: Preparing to send eventData:", JSON.stringify(eventData, null, 2));

    try {
      const response = await fetch(API_EVENTS_URL, { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify(eventData), 
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.msg || 'Failed to create trip. Please try again.');
      }

      setSubmitSuccess(true);
    
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  useEffect(() => {
    setSubmitError(null);
    setSubmitSuccess(false);
  }, [currentStep]);

  useEffect(() => {
    if (startCity && endCity && startCity !== endCity) {
      const city1 = cities.find(c => c.name === startCity);
      const city2 = cities.find(c => c.name === endCity);

      if (city1 && city2 && city1.lat && city1.lon && city2.lat && city2.lon) {
        const dist = getDistanceFromLatLonInKm(city1.lat, city1.lon, city2.lat, city2.lon);
        setDistance(dist);
      } else {
        setDistance(null); 
      }
    } else {
      setDistance(null); 
    }
  }, [startCity, endCity]);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8 pb-16"> {/* Added pb-16 for spacing */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Plan Your Perfect Trip
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400">
            Let's create an amazing journey together
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap justify-between items-start sm:items-center bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center mb-2 sm:mb-0"> {/* Added mb-2 for wrapping */}
              <div className="flex flex-col items-center text-center"> {/* Added text-center */}
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold text-xs sm:text-base ${
                  currentStep >= step.number
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}>
                  {step.number}
                </div>
                <div className="mt-1 sm:mt-2">
                  <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">{step.title}</p>
                  <p className="hidden sm:block text-xs text-gray-500">{step.description}</p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-6 h-0.5 sm:w-12 md:w-16 sm:h-1 mx-1 sm:mx-2 md:mx-4 ${ /* Adjusted connector */
                  currentStep > step.number ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                }`} />
              )}
            </div>
          ))}
        </motion.div>

        <motion.div 
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          {currentStep === 1 && (
            // <div className="space-y-6">
            //   <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            //     Where would you like to go?
            //   </h2>
            //   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            //     <div>
            //       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            //         From
            //       </label>
            //       <div className="relative">
            //         <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            //         <input
            //           type="text"
            //           value={startCity}
            //           onChange={(e) => setStartCity(e.target.value)}
            //           placeholder="Enter departure city"
            //           className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            //         />
            //       </div>
            //     </div>
            //     <div>
            //       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            //         To
            //       </label>
            //       <div className="relative">
            //         <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            //         <input
            //           type="text"
            //           value={endCity}
            //           onChange={(e) => setEndCity(e.target.value)}
            //           placeholder="Enter destination city"
            //           className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            //         />
            //       </div>
            //     </div>
            //   </div>
            // </div>

           
// <div className="space-y-6">
//   <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
//     Where would you like to go?
//   </h2>

//   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//     {/* From City */}
//     <div>
//       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//         From
//       </label>
//       <div className="relative">
//         <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
//         <input
//           list="cities"
//           type="text"
//           value={startCity}
//           onChange={(e) => setStartCity(e.target.value)}
//           placeholder="Enter departure city"
//           className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
//           required
//         />
//       </div>
//     </div>

//     {/* To City */}
//     <div>
//       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//         To
//       </label>
//       <div className="relative">
//         <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
//         <input
//           list="cities"
//           type="text"
//           value={endCity}
//           onChange={(e) => setEndCity(e.target.value)}
//           placeholder="Enter destination city"
//           className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
//           required
//         />
//       </div>
//     </div>
//   </div>

//   {/* Error Message */}
//   {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

//   {/* City Suggestions */}
//   <datalist id="cities">
//     {cities.map((city) => (
//       <option key={city.id} value={city.name} />
//     ))}
//   </datalist>
// </div>

<div className="space-y-6">
  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
    Where would you like to go?
  </h2>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* From City */}
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        From
      </label>
      <div className="relative">
        <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={startCity}
          onChange={(e) => {
            const term = e.target.value;
            setStartCity(term);
            if (term) {
              setFilteredStartCities(
                cities.filter(city => city.name.toLowerCase().includes(term.toLowerCase()))
              );
              setShowStartDropdown(true);
            } else {
              setFilteredStartCities([]); // Clear suggestions if input is empty
              setShowStartDropdown(false);
            }
          }}
          onFocus={() => {
            if (startCity && cities.length > 0) {
              const currentFiltered = cities.filter(city => city.name.toLowerCase().includes(startCity.toLowerCase()));
              setFilteredStartCities(currentFiltered);
              if (currentFiltered.length > 0) {
                setShowStartDropdown(true);
              }
            }
          }}
          onBlur={() => setTimeout(() => setShowStartDropdown(false), 150)} 
          placeholder="Enter departure city"
          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
        {showStartDropdown && startCity && filteredStartCities.length > 0 && (
          <ul className="absolute z-10 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md mt-1 max-h-52 overflow-y-auto shadow-lg">
            {filteredStartCities.map((city) => (
              <li
                key={city.id}
                className="px-4 py-2 cursor-pointer hover:bg-blue-100 dark:hover:bg-gray-700"
                onMouseDown={() => { 
                  setStartCity(city.name);
                  setShowStartDropdown(false);
                }}
              >
                {city.name} ({city.country})
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>

    {/* To City */}
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        To
      </label>
      <div className="relative">
        <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={endCity}
          onChange={(e) => {
            const term = e.target.value;
            setEndCity(term);
            if (term) {
              setFilteredEndCities(
                cities.filter(city => city.name.toLowerCase().includes(term.toLowerCase()))
              );
              setShowEndDropdown(true);
            } else {
              setFilteredEndCities([]); 
              setShowEndDropdown(false);
            }
          }}
          onFocus={() => {
            if (endCity && cities.length > 0) {
              const currentFiltered = cities.filter(city => city.name.toLowerCase().includes(endCity.toLowerCase()));
              setFilteredEndCities(currentFiltered);
              if (currentFiltered.length > 0) {
                setShowEndDropdown(true);
              }
            }
          }}
          onBlur={() => setTimeout(() => setShowEndDropdown(false), 150)} 
          placeholder="Enter destination city"
          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
        {showEndDropdown && endCity && filteredEndCities.length > 0 && (
          <ul className="absolute z-10 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md mt-1 max-h-52 overflow-y-auto shadow-lg">
            {filteredEndCities.map((city) => (
              <li
                key={city.id}
                className="px-4 py-2 cursor-pointer hover:bg-blue-100 dark:hover:bg-gray-700"
                onMouseDown={() => { 
                  setEndCity(city.name);
                  setShowEndDropdown(false);
                }}
              >
                {city.name} ({city.country})
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  </div>

  {/* Display Distance */}
  {distance !== null && startCity && endCity && startCity !== endCity && (
    <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 text-center">
      <p className="text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-300">
        Estimated Distance between <br />
        <span className="text-blue-600 dark:text-blue-400 font-bold">{startCity}</span> & <span className="text-blue-600 dark:text-blue-400 font-bold">{endCity}</span>
      </p>
      <p className="text-3xl sm:text-4xl font-extrabold text-blue-600 dark:text-blue-400 mt-2 mb-1">
        {distance} <span className="text-xl sm:text-2xl font-semibold">km</span>
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        (Calculated using Haversine formula)
      </p>
    </div>
  )}
</div>




          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                When are you traveling?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Departure Date
                  </label>
                  <DatePicker
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholderText="Select start date"
                    minDate={new Date()}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Return Date
                  </label>
                  <DatePicker
                    selected={endDate}
                    onChange={(date) => setEndDate(date)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholderText="Select end date"
                    minDate={startDate || new Date()}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Travelers
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <select
                      value={travelers}
                      onChange={(e) => setTravelers(Number(e.target.value))}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {[1,2,3,4,5,6,7,8].map(num => (
                        <option key={num} value={num}>{num} {num === 1 ? 'Traveler' : 'Travelers'}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                What are your interests?
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {interests.map((interest) => (
                  <motion.button
                    key={interest.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleInterest(interest.id)}
                    className={`p-4 sm:p-6 rounded-xl border-2 transition-all duration-200 ${
                      selectedInterests.includes(interest.id)
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className={`${interest.color} w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-3`}>
                      <interest.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <p className="font-medium text-gray-900 dark:text-white">{interest.name}</p>
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Choose your travel option
              </h2>
              <div className="space-y-4">
                {dynamicTravelOptions.map((option) => (
                  <motion.div
                    key={option.type}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => handleSelectTravelOption(option)}
                    className={`p-4 sm:p-6 border-2 rounded-xl hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200 cursor-pointer ${
                      selectedTravelOption?.type === option.type
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between">
                      <div className="flex items-center space-x-3 sm:space-x-4 mb-3 sm:mb-0">
                        <div className={`${option.color} w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <option.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">{option.name}</h3>
                          <div className="flex flex-col xs:flex-row items-start xs:items-center space-y-1 xs:space-y-0 xs:space-x-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            <span className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {option.duration}
                            </span>
                            <span className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-1" />
                              {option.price}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleSelectTravelOption(option);}}
                        className={`px-4 py-2 text-sm sm:px-6 sm:py-2 sm:text-base rounded-lg transition-colors w-full mt-3 sm:w-auto sm:mt-0 ${
                          selectedTravelOption?.type === option.type
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        {selectedTravelOption?.type === option.type ? 'Selected' : 'Select'}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Review Your Trip
              </h2>
              {submitSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-4 bg-green-50 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg text-green-700 dark:text-green-300 text-sm flex items-center"
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Trip created successfully! You can view it in "My Trips".
                </motion.div>
              )}
              <div className="space-y-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                <p><strong>From:</strong> {startCity}</p>
                <p><strong>To:</strong> {endCity}</p>
                <p><strong>Dates:</strong> {startDate?.toLocaleDateString()} - {endDate?.toLocaleDateString()}</p>
                <p><strong>Travelers:</strong> {travelers}</p>
                <p><strong>Interests:</strong> {selectedInterests.join(', ') || 'None'}</p>
                <p><strong>Travel By:</strong> {selectedTravelOption?.name} ({dynamicTravelOptions.find(opt => opt.type === selectedTravelOption?.type)?.price || selectedTravelOption?.price}, {selectedTravelOption?.duration})</p>
                {distance && <p><strong>Calculated Distance:</strong> {distance} km</p>}
              </div>
            </div>
          )}

          {/* Error and Success Messages */}
          {submitError && !submitSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-3 bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300 text-sm flex items-center"
            >
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <span>{submitError}</span>
            </motion.div>
          )}
          

          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1 || isSubmitting || submitSuccess}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              onClick={currentStep === 5 ? handleCreateTrip : () => {
                if (currentStep === 4 && !selectedTravelOption) {
                  setSubmitError("Please select a travel option before proceeding.");
                  return;
                }
                setSubmitError(null); // Clear error if any before moving
                setCurrentStep(Math.min(5, currentStep + 1));
              }}
              disabled={isSubmitting || (currentStep === 5 && submitSuccess)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Processing...
                </>
              ) : currentStep === 5 ? 'Confirm & Create Trip' : currentStep === 4 ? 'Review Trip' : 'Next'}
            </button>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default PlanTrip;