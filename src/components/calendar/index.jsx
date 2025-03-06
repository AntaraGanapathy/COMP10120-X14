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

  const handleSelectSlot = useCallback(
    ({ start, end }) => {
      const title = window.prompt("Enter title");
      if (title) {
        setEvents((prev) => [...prev, { start, end, title }]);
      }
    },
    [setEvents]
  );

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
          
          if (eventsData.calendarevents) {
            const newEvents = Object.keys(eventsData.calendarevents).map((key) => {
              const currentEvent = eventsData.calendarevents[key];
              return {
                title: currentEvent.title,
                start: new Date(currentEvent.start),
                end: new Date(currentEvent.end)
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
        calendarevents: events
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
    </section>
  );
};

export default MyCalendar;