// import React, { useState } from 'react';
import React, { useEffect, useState } from 'react';

import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  Users,
  Filter,
  Download,
  Share2,
  Edit3, // For editing marks
  Lock,  // For locking marks
  Unlock // For unlocking marks
} from 'lucide-react';  
import Layout from '../components/layout/Layout.jsx';
import { useAuth } from '../contexts/AuthContext.jsx'; // Import useAuth

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month');
  const [selectedDate, setSelectedDate] = useState(null);
  const [customMarks, setCustomMarks] = useState({});
  const [markText, setMarkText] = useState('');
  const [isEditingMark, setIsEditingMark] = useState(false);
 
  // Add Event Modal State
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventStartDate, setNewEventStartDate] = useState(null);
  const [newEventEndDate, setNewEventEndDate] = useState(null);
  const [newEventStartTime, setNewEventStartTime] = useState(''); // Format HH:mm
  const [newEventEndTime, setNewEventEndTime] = useState('');   // Format HH:mm
  const [newEventLocation, setNewEventLocation] = useState('');
  const [newEventDescription, setNewEventDescription] = useState('');
  const [newEventError, setNewEventError] = useState(null);
  const [isSubmittingNewEvent, setIsSubmittingNewEvent] = useState(false);


  const [events, setEvents] = useState([]); // Will be populated from API
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [fetchEventsError, setFetchEventsError] = useState(null);
  const { token } = useAuth(); // token might still be used for fetching trip events
 
  const API_TRIP_EVENTS_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/events`;
  const LOCAL_STORAGE_MARKS_KEY = 'calendarUserMarks';

  const generateICSData = () => {
    let icsString = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//PlanPal Pro//App//EN
CALSCALE:GREGORIAN
`;

    events.forEach(event => {
      // Ensure date and time are valid before processing
      const startDate = event.date; // YYYY-MM-DD
      const startTime = event.time; // HH:mm
      
      let startDateTimeISO = '';
      if (startDate && startTime) {
        const [year, month, day] = startDate.split('-');
        const [hours, minutes] = startTime.split(':');
        // Note: JavaScript months are 0-indexed, so month-1
        const jsDate = new Date(Date.UTC(year, month - 1, day, hours, minutes));
        if (!isNaN(jsDate)) {
            startDateTimeISO = jsDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        }
      } else if (startDate) { // Handle all-day event if only date is present
        const [year, month, day] = startDate.split('-');
        const jsDate = new Date(Date.UTC(year, month - 1, day));
         if (!isNaN(jsDate)) {
            startDateTimeISO = `${year}${month}${day}`; // Format for all-day
        }
      }

      // Attempt to calculate end time based on duration if not directly available as full end datetime
      // This is a simplified approach; a proper end datetime from source is better.
      let endDateTimeISO = startDateTimeISO; // Default to start if no duration or end time
      if (startDateTimeISO && event.duration && event.duration !== 'N/A' && !startDateTimeISO.includes('T')) { // All day event, duration might not apply like this
          // For all-day events, duration usually means it spans multiple days or is just for that day.
          // If it's an all-day event, DTEND is often the day AFTER.
          // For simplicity, if it's an all-day event, we'll make it last the whole day.
          // If it's a timed event, we'd parse duration.
      } else if (startDateTimeISO && event.duration && event.duration !== 'N/A') {
          try {
            const durationParts = event.duration.match(/(\d+)h\s*(\d+)m/);
            if (durationParts) {
                const hoursDuration = parseInt(durationParts[1], 10);
                const minutesDuration = parseInt(durationParts[2], 10);
                const startDateObj = new Date(Date.UTC(
                    parseInt(startDateTimeISO.substring(0, 4), 10),
                    parseInt(startDateTimeISO.substring(4, 6), 10) - 1,
                    parseInt(startDateTimeISO.substring(6, 8), 10),
                    parseInt(startDateTimeISO.substring(9, 11), 10),
                    parseInt(startDateTimeISO.substring(11, 13), 10)
                ));
                startDateObj.setUTCHours(startDateObj.getUTCHours() + hoursDuration);
                startDateObj.setUTCMinutes(startDateObj.getUTCMinutes() + minutesDuration);
                if(!isNaN(startDateObj)) {
                    endDateTimeISO = startDateObj.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
                }
            }
          } catch(e) { console.error("Error parsing duration for ICS", e); }
      }


      if (!startDateTimeISO) return; // Skip if no valid start date/time

      icsString += `BEGIN:VEVENT
UID:${event.id}@planpal.pro
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'}
${startDateTimeISO.includes('T') ? `DTSTART:${startDateTimeISO}` : `DTSTART;VALUE=DATE:${startDateTimeISO}`}
${endDateTimeISO.includes('T') ? `DTEND:${endDateTimeISO}` : `DTEND;VALUE=DATE:${endDateTimeISO}`}
SUMMARY:${event.title || 'Unnamed Event'}
DESCRIPTION:${event.trip || ''}${event.location ? `\\nLocation: ${event.location}` : ''}${event.attendees && event.attendees !== 'N/A' ? `\\nAttendees: ${event.attendees}` : ''}
LOCATION:${event.location || ''}
END:VEVENT
`;
    });

    // Add custom marks as VTODO items (optional, can be complex to map to calendar events)
    Object.entries(customMarks).forEach(([dateString, mark]) => {
        const [year, month, day] = dateString.split('-');
        const dt = `${year}${month}${day}`;
        icsString += `BEGIN:VTODO
UID:mark-${mark.id}@planpal.pro
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'}
SUMMARY:Note: ${mark.text.substring(0, 50)}${mark.text.length > 50 ? '...' : ''}
DESCRIPTION:${mark.text.replace(/\n/g, '\\n')}
DTSTART;VALUE=DATE:${dt}
DUE;VALUE=DATE:${dt}
STATUS:${mark.locked ? 'NEEDS-ACTION' : 'COMPLETED'}
END:VTODO
`;
    });


    icsString += 'END:VCALENDAR';
    return icsString;
  };

  const handleExportCalendar = () => {
    const icsData = generateICSData();
    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'PlanPal_Calendar.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetNewEventForm = () => {
    setNewEventTitle('');
    setNewEventStartDate(null);
    setNewEventEndDate(null);
    setNewEventStartTime('');
    setNewEventEndTime('');
    setNewEventLocation('');
    setNewEventDescription('');
    setNewEventError(null);
  };

  const handleAddNewEventSubmit = async (e) => {
    e.preventDefault();
    setNewEventError(null);
    setIsSubmittingNewEvent(true);

    if (!newEventTitle.trim() || !newEventStartDate || !newEventEndDate || !newEventStartTime || !newEventEndTime) {
      setNewEventError("Title, start/end dates, and start/end times are required.");
      setIsSubmittingNewEvent(false);
      return;
    }

    // Combine date and time
    const combineDateTime = (date, timeString) => {
      if (!date || !timeString) return null;
      const [hours, minutes] = timeString.split(':');
      const newDateTime = new Date(date);
      newDateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
      return newDateTime;
    };

    const startDateTime = combineDateTime(newEventStartDate, newEventStartTime);
    const endDateTime = combineDateTime(newEventEndDate, newEventEndTime);

    if (!startDateTime || !endDateTime) {
        setNewEventError("Invalid date or time format.");
        setIsSubmittingNewEvent(false);
        return;
    }
    
    if (endDateTime <= startDateTime) {
      setNewEventError("End date/time must be after start date/time.");
      setIsSubmittingNewEvent(false);
      return;
    }

    const eventData = {
      title: newEventTitle.trim(),
      start: startDateTime.toISOString(), // Backend expects full ISO string for start/end
      end: endDateTime.toISOString(),     // if these are treated as specific times
      location: newEventLocation.trim() || null,
      description: newEventDescription.trim() || null,
      // Assuming 'allDay' is false for events with specific times.
      // If your backend handles 'start_time' and 'end_time' separately from date, adjust accordingly.
      // For now, I'm assuming the backend /api/events endpoint can take 'start' and 'end' ISO strings.
      // If it expects 'start_date', 'end_date', 'start_time', 'end_time', this needs adjustment.
      // Based on existing event mapping, it seems 'start' and 'end' ISO strings are used.
    };

    try {
      const response = await fetch(API_TRIP_EVENTS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify(eventData),
      });

      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.msg || 'Failed to add event.');
      }

      // Success
      setIsAddEventModalOpen(false);
      resetNewEventForm();
      fetchCalendarEvents(); // Refresh events list
    } catch (error) {
      setNewEventError(error.message || "An unexpected error occurred.");
    } finally {
      setIsSubmittingNewEvent(false);
    }
  };

 // Effect to load custom marks from localStorage on mount
 useEffect(() => {
   const storedMarks = localStorage.getItem(LOCAL_STORAGE_MARKS_KEY);
   if (storedMarks) {
     try {
       setCustomMarks(JSON.parse(storedMarks));
     } catch (e) {
       console.error("Error parsing stored marks:", e);
       setCustomMarks({});
     }
   }
 }, []);

 // Effect to save custom marks to localStorage whenever they change
 useEffect(() => {
   // Only save if customMarks is not in its initial empty state, to avoid overwriting on first load before hydration
   if (Object.keys(customMarks).length > 0 || localStorage.getItem(LOCAL_STORAGE_MARKS_KEY)) {
       localStorage.setItem(LOCAL_STORAGE_MARKS_KEY, JSON.stringify(customMarks));
   }
 }, [customMarks]);


 // Fetch trip events (existing logic, kept separate from custom marks)
 useEffect(() => {
   const fetchCalendarEvents = async () => {
     if (!token) {
       setEvents([]);
       setIsLoadingEvents(false);
       // Keep fetchEventsError for trip events, not for local marks
       setFetchEventsError("Not authenticated. Please log in to see trip events.");
       return;
     }
     setIsLoadingEvents(true);
     setFetchEventsError(null);
     try {
       const response = await fetch(API_TRIP_EVENTS_URL, {
         headers: { 'x-auth-token': token },
       });
       if (!response.ok) {
         const errorData = await response.json().catch(() => ({}));
         throw new Error(errorData.msg || `Failed to fetch trip events: ${response.status}`);
       }
       const rawData = await response.json();
       const mappedEvents = rawData.map(item => {
         const startTime = new Date(item.start_time);
         const endTime = new Date(item.end_time);
         let duration = 'N/A';
         if (!isNaN(startTime.getTime()) && !isNaN(endTime.getTime())) {
           const diffMs = endTime - startTime;
           const diffHrs = Math.floor(diffMs / 3600000);
           const diffMins = Math.round((diffMs % 3600000) / 60000);
           duration = `${diffHrs}h ${diffMins}m`;
         }
         let type = 'activity';
         if (item.title?.toLowerCase().includes('flight')) type = 'flight';
         if (item.title?.toLowerCase().includes('hotel') || item.title?.toLowerCase().includes('check-in')) type = 'accommodation';
         let color = 'bg-gray-500';
         if (type === 'flight') color = 'bg-blue-500';
         else if (type === 'accommodation') color = 'bg-green-500';
         else if (type === 'activity') color = 'bg-purple-500';
         return {
           id: item.id,
           title: item.title || 'Unnamed Event', type,
           date: !isNaN(startTime.getTime()) ? startTime.toISOString().split('T')[0] : 'N/A',
           time: !isNaN(startTime.getTime()) ? startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : 'N/A',
           duration, location: item.location || 'N/A', trip: item.title || 'Trip Event', color,
           attendees: item.attendees || (item.description?.match(/Travelers: (\d+)/)?.[1] ? parseInt(item.description.match(/Travelers: (\d+)/)[1]) : 0) || 'N/A'
         };
       });
       setEvents(mappedEvents);
     } catch (error) {
       console.error("Failed to fetch calendar events:", error);
       setFetchEventsError(error.message);
       setEvents([]);
     } finally {
       setIsLoadingEvents(false);
     }
   };

   fetchCalendarEvents();
 }, [token]);

 const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getEventsForDate = (date) => {
    if (!date) return [];
    const dateString = date.toISOString().split('T')[0];
    return events.filter(event => event.date === dateString);
  };

  const getMarkForDate = (date) => {
    if (!date) return null;
    const dateString = date.toISOString().split('T')[0];
    return customMarks[dateString] || null;
  };

  const handleSaveMark = () => {
    if (!selectedDate) return;
    const dateString = selectedDate.toISOString().split('T')[0];
    const textToSave = markText.trim();
    
    setCustomMarks(prevMarks => {
      const newMarks = { ...prevMarks };
      if (textToSave) { // Save or update if there's text
        newMarks[dateString] = {
          id: prevMarks[dateString]?.id || Date.now().toString(), // Keep existing ID or generate new
          text: textToSave,
          locked: prevMarks[dateString]?.locked || false,
        };
      } else { // If text is empty, delete the mark
        delete newMarks[dateString];
      }
      return newMarks;
    });
    setIsEditingMark(false); // Exit editing mode
    console.log('Mark operation for', dateString, 'Text:', textToSave || "(deleted)");
  };
  
  const handleEditMark = () => {
    const mark = getMarkForDate(selectedDate);
    if (mark && !mark.locked) {
      setMarkText(mark.text);
      setIsEditingMark(true);
    }
  };

  const handleToggleLockMark = () => {
    if (!selectedDate) return;
    const dateString = selectedDate.toISOString().split('T')[0];
    const mark = customMarks[dateString];

    if (mark) { // Only toggle lock if mark exists
      setCustomMarks(prevMarks => ({
        ...prevMarks,
        [dateString]: { ...mark, locked: !mark.locked }
      }));
      console.log('Mark lock toggled for', dateString);
    } else {
      // Optionally, create a new, empty, locked mark if one doesn't exist
      // For now, we only toggle lock on existing marks.
      // If you want to create a new locked mark:
      // setCustomMarks(prevMarks => ({
      //   ...prevMarks,
      //   [dateString]: { id: Date.now().toString(), text: '', locked: true }
      // }));
      // setMarkText(''); // Clear input as it's a new locked mark
      // setIsEditingMark(false);
      console.log('No mark to toggle lock for', dateString);
    }
  };
  
  // When a date is selected, populate the markText input if a mark exists
  React.useEffect(() => {
    if (selectedDate) {
      const mark = getMarkForDate(selectedDate);
      if (mark) {
        setMarkText(mark.text);
        setIsEditingMark(false); // Default to view mode when selecting a new date with a mark
      } else {
        setMarkText(''); // Clear if no mark
        setIsEditingMark(true); // Default to edit mode for a new mark
      }
    } else {
      setMarkText('');
      setIsEditingMark(false);
    }
  }, [selectedDate, customMarks]);


  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSameDay = (date1, date2) => {
    if (!date1 || !date2) return false;
    return date1.toDateString() === date2.toDateString();
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Travel Calendar</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Keep track of all your travel plans and activities
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              onClick={handleExportCalendar}
            >
              <Download className="h-4 w-4 mr-2 inline" />
              Export
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const icsData = generateICSData();
                navigator.clipboard.writeText(icsData)
                  .then(() => alert('Calendar ICS data copied to clipboard! You can paste this into a new .ics file or share it.'))
                  .catch(err => {
                    console.error('Failed to copy ICS data: ', err);
                    alert('Failed to copy calendar data. You can try exporting and sharing the file.');
                  });
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Share2 className="h-4 w-4 mr-2 inline" />
              Share
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              onClick={() => {
                setNewEventStartDate(selectedDate || new Date()); // Pre-fill with selected or current date
                setNewEventEndDate(selectedDate || new Date());
                setIsAddEventModalOpen(true);
                setNewEventError(null);
              }}
            >
              <Plus className="h-4 w-4 mr-2 inline pointer-events-none" />
              Add Event
            </motion.button>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigateMonth('prev')}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </motion.button>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white min-w-[200px] text-center">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigateMonth('next')}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </motion.button>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors"
              >
                Today
              </motion.button>
            </div>

            <div className="flex items-center space-x-2">
              {['month', 'week', 'day'].map((mode) => (
                <motion.button
                  key={mode}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    viewMode === mode
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
            {dayNames.map((day) => (
              <div key={day} className="p-4 text-center font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {getDaysInMonth(currentDate).map((date, index) => {
              if (!date) {
                return <div key={index} className="h-32 border-r border-b border-gray-200 dark:border-gray-700" />;
              }

              const dayEvents = getEventsForDate(date);
              const isSelected = isSameDay(date, selectedDate);
              const isTodayDate = isToday(date);

              return (
                <motion.div
                  key={date.toISOString()}
                  whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                  onClick={() => setSelectedDate(date)}
                  className={`h-32 border-r border-b border-gray-200 dark:border-gray-700 p-2 cursor-pointer transition-colors ${
                    isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  } ${dayEvents.length > 0 && !isSelected ? 'bg-teal-50 dark:bg-teal-900/10' : ''}`} // Highlight for dates with events
                >
                  <div className={`text-sm font-medium mb-1 ${
                    isTodayDate 
                      ? 'bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center' 
                      : 'text-gray-900 dark:text-white'
                  }`}>
                    {date.getDate()}
                  </div>
                  <div className="space-y-1 overflow-y-auto max-h-[60px]">
                    {dayEvents.slice(0, 1).map((event) => ( // Show fewer events to make space for mark indicator
                      <motion.div
                        key={event.id}
                        whileHover={{ scale: 1.02 }}
                        className={`${event.color} text-white text-xs p-1 rounded truncate`}
                      >
                        {event.title}
                      </motion.div>
                    ))}
                    {getMarkForDate(date) && (
                      <div className="text-xs p-1 rounded truncate bg-yellow-200 dark:bg-yellow-700 text-yellow-800 dark:text-yellow-300 flex items-center">
                        <Edit3 size={12} className="mr-1 flex-shrink-0" />
                        {getMarkForDate(date).text.substring(0,15)}{getMarkForDate(date).text.length > 15 ? '...' : ''}
                        {getMarkForDate(date).locked && <Lock size={10} className="ml-auto flex-shrink-0" />}
                      </div>
                    )}
                    {dayEvents.length > 1 && !getMarkForDate(date) && ( // Adjust "more" count logic if needed
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        +{dayEvents.length - 1} more events
                      </div>
                    )}
                     {dayEvents.length > 0 && getMarkForDate(date) && dayEvents.length > 1 && (
                       <div className="text-xs text-gray-500 dark:text-gray-400">
                        +{dayEvents.length -1} more events
                       </div>
                     )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {selectedDate && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Details for {selectedDate.toLocaleDateString()}
            </h3>
            {/* Custom Mark Section */}
            <div className="mb-6 p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-gray-800 dark:text-gray-200">
                  {getMarkForDate(selectedDate)?.locked ? 'Locked Note:' : isEditingMark || !getMarkForDate(selectedDate) ? 'Your Note:' : 'Saved Note:'}
                </h4>
                {getMarkForDate(selectedDate) && (
                  <div className="flex items-center space-x-2">
                    {!isEditingMark && !getMarkForDate(selectedDate)?.locked && (
                       <motion.button
                        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        onClick={handleEditMark}
                        className="p-1.5 text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded"
                        title="Edit Note"
                      >
                        <Edit3 size={16} />
                      </motion.button>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                      onClick={handleToggleLockMark}
                      className={`p-1.5 rounded ${getMarkForDate(selectedDate)?.locked ? 'text-red-500 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/30' : 'text-green-500 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-900/30'}`}
                      title={getMarkForDate(selectedDate)?.locked ? "Unlock Note" : "Lock Note"}
                    >
                      {getMarkForDate(selectedDate)?.locked ? <Unlock size={16} /> : <Lock size={16} />}
                    </motion.button>
                  </div>
                )}
              </div>

              {isEditingMark || !getMarkForDate(selectedDate) ? (
                <textarea
                  value={markText}
                  onChange={(e) => setMarkText(e.target.value)}
                  placeholder="Add a note for this day..."
                  rows={3}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  disabled={getMarkForDate(selectedDate)?.locked}
                />
              ) : (
                <p className="text-gray-700 dark:text-gray-300 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md min-h-[60px] whitespace-pre-wrap">
                  {getMarkForDate(selectedDate)?.text || "No note for this day."}
                </p>
              )}
              {(isEditingMark || !getMarkForDate(selectedDate)) && !getMarkForDate(selectedDate)?.locked && (
                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={handleSaveMark}
                  className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  Save Note
                </motion.button>
              )}
            </div>
            
            {/* Existing Events Section */}
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">Scheduled Events:</h4>
            <div className="space-y-4">
              {getEventsForDate(selectedDate).map((event) => (
                <motion.div
                  key={event.id}
                  whileHover={{ scale: 1.02 }}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h5 className="font-medium text-gray-900 dark:text-white">{event.title}</h5>
                    <span className={`${event.color} text-white text-xs px-2 py-1 rounded-full`}>
                      {event.type}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      {event.time} ({event.duration})
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      {event.location}
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      {event.attendees} attendees
                    </div>
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {event.trip}
                    </div>
                  </div>
                </motion.div>
              ))}
              {getEventsForDate(selectedDate).length === 0 && !getMarkForDate(selectedDate) && (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No events or notes for this day.
                </p>
              )}
               {getEventsForDate(selectedDate).length === 0 && getMarkForDate(selectedDate) && (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No events scheduled for this day.
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* Add Event Modal */}
        {isAddEventModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setIsAddEventModalOpen(false)} // Close on overlay click
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-lg border border-gray-200 dark:border-gray-700"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
            >
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Add New Event</h2>
              <form onSubmit={handleAddNewEventSubmit} className="space-y-4">
                <div>
                  <label htmlFor="newEventTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                  <input
                    type="text"
                    id="newEventTitle"
                    value={newEventTitle}
                    onChange={(e) => setNewEventTitle(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="newEventStartDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                    <DatePicker
                      selected={newEventStartDate}
                      onChange={(date) => setNewEventStartDate(date)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      dateFormat="yyyy-MM-dd"
                    />
                  </div>
                  <div>
                    <label htmlFor="newEventStartTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Time (HH:mm)</label>
                    <input
                      type="time"
                      id="newEventStartTime"
                      value={newEventStartTime}
                      onChange={(e) => setNewEventStartTime(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="newEventEndDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                    <DatePicker
                      selected={newEventEndDate}
                      onChange={(date) => setNewEventEndDate(date)}
                      required
                      minDate={newEventStartDate}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      dateFormat="yyyy-MM-dd"
                    />
                  </div>
                  <div>
                    <label htmlFor="newEventEndTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Time (HH:mm)</label>
                    <input
                      type="time"
                      id="newEventEndTime"
                      value={newEventEndTime}
                      onChange={(e) => setNewEventEndTime(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="newEventLocation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location (Optional)</label>
                  <input
                    type="text"
                    id="newEventLocation"
                    value={newEventLocation}
                    onChange={(e) => setNewEventLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label htmlFor="newEventDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (Optional)</label>
                  <textarea
                    id="newEventDescription"
                    value={newEventDescription}
                    onChange={(e) => setNewEventDescription(e.target.value)}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                {newEventError && (
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                    {newEventError}
                  </p>
                )}

                <div className="flex justify-end space-x-3 pt-2">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsAddEventModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={isSubmittingNewEvent}
                    className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors flex items-center"
                  >
                    {isSubmittingNewEvent && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    Save Event
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default Calendar;