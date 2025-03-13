import React, { useCallback, useEffect, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { ref, get, update } from "firebase/database";
import { database } from "../../firebase/firebase";

// Use Moment.js for localizing the calendar
const localizer = momentLocalizer(moment);

const MyCalendar = () => {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [view, setView] = useState("week");
  const [date, setDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(moment().format("MMMM YYYY"));
  const [showModal, setShowModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    start: null,
    end: null
  });

  const handleSelectSlot = useCallback(
    ({ start, end }) => {
      setNewEvent({
        title: "",
        start,
        end
      });
      setShowModal(true);
    },
    []
  );

  const handleCreateEvent = () => {
    if (newEvent.title.trim()) {
      const sessionData = JSON.parse(localStorage.getItem("kitchenSession"));
      const username = sessionData.userName;
      
      setEvents((prev) => [...prev, {
        start: newEvent.start,
        end: newEvent.end,
        title: newEvent.title,
        username
      }]);
      setShowModal(false);
    }
  };

  const handleSelectEvent = useCallback((event) => {
    window.alert(event.title);
  }, []);

  const handleViewChange = (newView) => {
    setView(newView);
  };

  const navigateDate = (direction) => {
    const newDate = new Date(date);
    
    if (view === "day") {
      newDate.setDate(date.getDate() + (direction === "next" ? 1 : -1));
    } else if (view === "week") {
      newDate.setDate(date.getDate() + (direction === "next" ? 7 : -7));
    } else if (view === "month") {
      newDate.setMonth(date.getMonth() + (direction === "next" ? 1 : -1));
    }
    
    setDate(newDate);
    setCurrentMonth(moment(newDate).format("MMMM YYYY"));
  };

  // Get events from Firebase
  useEffect(() => {
    const getEvents = async () => {
      try {
        const sessionData = JSON.parse(localStorage.getItem("kitchenSession"));
        const snapshot = await get(ref(database, `rooms/${sessionData.roomId}`));
        if (snapshot.exists()) {
          const eventsData = snapshot.val();
          console.log(eventsData)
          if (eventsData.calendarevents) {
            const newEvents = Object.keys(eventsData.calendarevents).map((key) => {
              const currentEvent = eventsData.calendarevents[key];
              return {
                title: currentEvent.title,
                start: new Date(currentEvent.start),
                end: new Date(currentEvent.end),
                username: currentEvent.username
              };
            });
            setEvents(newEvents);
          } else {
            setEvents([]);
          }
        } else {
          setEvents([]);
        }
      } catch (error) {
        console.error(error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    
    getEvents();
  }, []);

  // Save events to Firebase
  useEffect(() => {
    if (!loading) {
      const sessionData = JSON.parse(localStorage.getItem("kitchenSession"));
      update(ref(database, `rooms/${sessionData.roomId}`), {
        calendarevents: events,
      })
        .then(() => console.log("Events uploaded"))
        .catch((error) => console.log("Error: ", error));
    }
  }, [events, loading]);

  // Custom event component to style calendar events
  const EventComponent = ({ event }) => {
    // Generate a consistent color based on the event title
    const getEventColor = (title) => {
      const colors = [
        "bg-purple-600", "bg-sky-400", "bg-emerald-600", 
        "bg-indigo-600", "bg-rose-500", "bg-amber-500"
      ];
      
      // Simple hash function to get consistent color for same event titles
      const hash = title.split("").reduce((acc, char) => {
        return acc + char.charCodeAt(0);
      }, 0);
      
      return colors[hash % colors.length];
    };
    
    const colorClass = getEventColor(event.title);
    
    return (
      <div className={`flex items-center p-1 rounded-sm`}>
        <span className={`w-2 h-2 mr-1 rounded-full ${colorClass}`}></span>
        <span className="text-xs font-medium truncate">{event.title}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-stone-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          <p className="mt-4 text-gray-700">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="relative bg-stone-50 h-screen w-screen overflow-hidden">
      {/* Decorative blobs */}
      <div className="bg-sky-400 w-full sm:w-40 h-40 rounded-full absolute top-1 opacity-20 max-sm:right-0 sm:left-56 z-0"></div>
      <div className="bg-emerald-500 w-full sm:w-40 h-24 absolute top-0 -left-0 opacity-20 z-0"></div>
      <div className="bg-purple-600 w-full sm:w-40 h-24 absolute top-40 -left-0 opacity-20 z-0"></div>
      
      <div className="w-full h-full relative z-10 backdrop-blur-3xl overflow-hidden">
        <div className="w-full h-full max-w-full mx-auto px-2 lg:px-6">
          <div className="grid grid-cols-12 gap-4 h-full">
            {/* Upcoming Events - collapsed on smaller screens */}
            <div className="col-span-12 lg:col-span-3 h-full overflow-auto py-4 hidden lg:block">
              <h2 className="font-manrope text-2xl leading-tight text-gray-900 mb-1">Upcoming Events</h2>
              <p className="text-sm font-normal text-gray-600 mb-4">Don't miss schedule</p>
              
              <div className="flex gap-3 flex-col pr-2">
                {events.slice(0, 5).map((event, index) => {
                  // Generate a consistent color for each event
                  const colors = ["purple", "sky", "emerald", "indigo", "rose"];
                  const color = colors[index % colors.length];
                  
                  return (
                    <div key={index} className="p-4 rounded-xl bg-white shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full bg-${color}-600`}></span>
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {moment(event.start).format("MMM D - HH:mm")}
                          </p>
                        </div>
                        <button 
                          className={`p-1 text-gray-400 hover:text-${color}-600 rounded-full transition-all duration-300`}
                          onClick={() => {
                            const confirm = window.confirm(`Delete event "${event.title}"?`);
                            if (confirm) {
                              setEvents(events.filter((_, i) => i !== index));
                            }
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="4" viewBox="0 0 12 4" fill="none">
                            <path d="M1.85624 2.00085H1.81458M6.0343 2.00085H5.99263M10.2124 2.00085H10.1707" stroke="currentcolor" strokeWidth="2.5" strokeLinecap="round"></path>
                          </svg>
                        </button>
                      </div>
                      <h6 className="text-base leading-6 font-semibold text-black mb-1 truncate">{event.title}</h6>
                      <p className="text-xs font-normal text-gray-600">
                        {moment(event.end).diff(moment(event.start), 'minutes')} min
                      </p>
                      <p className="text-xs font-normal text-gray-600">User: {event.username}</p>
                    </div>
                  );
                })}
                
                {events.length === 0 && (
                  <div className="p-4 rounded-xl bg-white text-center shadow-sm">
                    <p className="text-gray-500">No upcoming events</p>
                    <p className="text-xs text-gray-400 mt-2">Click on the calendar to add events</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Calendar - full width on mobile, takes most of the space on desktop */}
            <div className="col-span-12 lg:col-span-9 h-full flex flex-col">
              <div className="flex flex-col sm:flex-row gap-2 sm:items-center justify-between py-4">
                <div className="flex items-center gap-3">
                  <h5 className="text-xl font-semibold text-gray-900">{currentMonth}</h5>
                  <div className="flex items-center">
                    <button 
                      className="text-indigo-600 p-1 rounded transition-all duration-300 hover:text-white hover:bg-indigo-600"
                      onClick={() => navigateDate("prev")}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M10.0002 11.9999L6 7.99971L10.0025 3.99719" stroke="currentcolor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"></path>
                      </svg>
                    </button>
                    <button 
                      className="text-indigo-600 p-1 rounded transition-all duration-300 hover:text-white hover:bg-indigo-600"
                      onClick={() => navigateDate("next")}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M6.00236 3.99707L10.0025 7.99723L6 11.9998" stroke="currentcolor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"></path>
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center rounded-md p-1 bg-indigo-50 gap-px">
                  <button 
                    className={`py-1.5 px-3 rounded-lg ${view === 'day' ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600'} text-sm font-medium transition-all duration-300 hover:bg-indigo-600 hover:text-white`}
                    onClick={() => handleViewChange("day")}
                  >
                    Day
                  </button>
                  <button 
                    className={`py-1.5 px-3 rounded-lg ${view === 'week' ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600'} text-sm font-medium transition-all duration-300 hover:bg-indigo-600 hover:text-white`}
                    onClick={() => handleViewChange("week")}
                  >
                    Week
                  </button>
                  <button 
                    className={`py-1.5 px-3 rounded-lg ${view === 'month' ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600'} text-sm font-medium transition-all duration-300 hover:bg-indigo-600 hover:text-white`}
                    onClick={() => handleViewChange("month")}
                  >
                    Month
                  </button>
                </div>
              </div>
              
              <div className="border border-indigo-200 rounded-xl flex-grow bg-white overflow-hidden">
                <Calendar
                  localizer={localizer}
                  events={events}
                  startAccessor="start"
                  endAccessor="end"
                  onSelectSlot={handleSelectSlot}
                  onSelectEvent={handleSelectEvent}
                  selectable
                  date={date}
                  onNavigate={date => {
                    setDate(date);
                    setCurrentMonth(moment(date).format("MMMM YYYY"));
                  }}
                  view={view}
                  onView={handleViewChange}
                  style={{ height: '100%' }}
                  components={{
                    event: EventComponent,
                    toolbar: () => null // Hide the default toolbar
                  }}
                  className="rounded-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-white/40 backdrop-blur-[2px] flex items-center justify-center z-50">
          <div className="bg-white/95 rounded-xl p-6 w-full max-w-md shadow-2xl border border-indigo-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Create New Event</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter event title"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={moment(newEvent.start).format('hh')}
                      onChange={(e) => {
                        const newStart = new Date(newEvent.start);
                        const currentHour = newStart.getHours();
                        const isPM = currentHour >= 12;
                        const newHour = parseInt(e.target.value);
                        newStart.setHours(isPM ? newHour + 12 : newHour);
                        setNewEvent({ ...newEvent, start: newStart });
                      }}
                      className="w-1/3 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i} value={(i + 1).toString().padStart(2, '0')}>
                          {(i + 1).toString().padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                    <select
                      value={moment(newEvent.start).format('mm')}
                      onChange={(e) => {
                        const newStart = new Date(newEvent.start);
                        newStart.setMinutes(parseInt(e.target.value));
                        setNewEvent({ ...newEvent, start: newStart });
                      }}
                      className="w-1/3 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i} value={(i * 5).toString().padStart(2, '0')}>
                          {(i * 5).toString().padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                    <select
                      value={moment(newEvent.start).format('A')}
                      onChange={(e) => {
                        const newStart = new Date(newEvent.start);
                        const currentHour = newStart.getHours();
                        const isPM = e.target.value === 'PM';
                        const hour = currentHour % 12 || 12;
                        newStart.setHours(isPM ? hour + 12 : hour);
                        setNewEvent({ ...newEvent, start: newStart });
                      }}
                      className="w-1/3 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={moment(newEvent.end).format('hh')}
                      onChange={(e) => {
                        const newEnd = new Date(newEvent.end);
                        const currentHour = newEnd.getHours();
                        const isPM = currentHour >= 12;
                        const newHour = parseInt(e.target.value);
                        newEnd.setHours(isPM ? newHour + 12 : newHour);
                        setNewEvent({ ...newEvent, end: newEnd });
                      }}
                      className="w-1/3 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i} value={(i + 1).toString().padStart(2, '0')}>
                          {(i + 1).toString().padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                    <select
                      value={moment(newEvent.end).format('mm')}
                      onChange={(e) => {
                        const newEnd = new Date(newEvent.end);
                        newEnd.setMinutes(parseInt(e.target.value));
                        setNewEvent({ ...newEvent, end: newEnd });
                      }}
                      className="w-1/3 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i} value={(i * 5).toString().padStart(2, '0')}>
                          {(i * 5).toString().padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                    <select
                      value={moment(newEvent.end).format('A')}
                      onChange={(e) => {
                        const newEnd = new Date(newEvent.end);
                        const currentHour = newEnd.getHours();
                        const isPM = e.target.value === 'PM';
                        const hour = currentHour % 12 || 12;
                        newEnd.setHours(isPM ? hour + 12 : hour);
                        setNewEvent({ ...newEvent, end: newEnd });
                      }}
                      className="w-1/3 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                Duration: {moment(newEvent.end).diff(moment(newEvent.start), 'minutes')} minutes
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateEvent}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Create Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default MyCalendar;