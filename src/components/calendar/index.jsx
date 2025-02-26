import React, { useCallback, useEffect, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { ref, set, get, update } from "firebase/database";
import { database } from "../../firebase/firebase";
import "./calendar.css";

// Use Moment.js for localizing the calendar
const localizer = momentLocalizer(moment);

// const [events, setEvents] = useState([
//   {
//     title: "Meeting with John",
//     start: new Date(2025, 1, 20, 10, 0), // February 20th, 2025, 10:00 AM
//     end: new Date(2025, 1, 20, 12, 0),   // February 20th, 2025, 12:00 PM
//   },
//   {
//     title: "Lunch with Sarah",
//     start: new Date(2025, 1, 21, 13, 0), // February 21st, 2025, 1:00 PM
//     end: new Date(2025, 1, 21, 14, 0),   // February 21st, 2025, 2:00 PM
//   },
// ]);

const MyCalendar = () => {

  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([
    {
      title: "Meeting with John",
      start: new Date(2025, 1, 20, 10, 0), // February 20th, 2025, 10:00 AM
      end: new Date(2025, 1, 20, 12, 0),   // February 20th, 2025, 12:00 PM
    },
    {
      title: "Lunch with Sarah",
      start: new Date(2025, 1, 21, 13, 0), // February 21st, 2025, 1:00 PM
      end: new Date(2025, 1, 21, 14, 0),   // February 21st, 2025, 2:00 PM
    },
  ]);
  
  const handleSelectSlot = useCallback(
    ({start, end}) => {
      console.log("Select slot")
      const title = window.prompt("Enter title");
      if (title) {
        setEvents((prev) => [...prev, {start, end, title}]);
      }
    },
    [setEvents]
  );

  const handleSelectEvent = useCallback(
    (event) => {
      console.log("Selected event")
      window.alert(event.title)
    },
    []
  );

  useEffect(() => {
    const getEvents = async () => {
      try {
        const sessionData = JSON.parse(localStorage.getItem('kitchenSession'));
        const snapshot = await get(ref(database, `rooms/${sessionData.roomId}`));
        if (snapshot.exists()) {
          const eventsData = snapshot.val();

          console.log(eventsData.calendarevents)
          
          const newEvents = Object.keys(eventsData.calendarevents).map((key) => {
            const currentEvent = eventsData.calendarevents[key];
            return {
              title: currentEvent.title,
              start: new Date(currentEvent.start),
              end: new Date(currentEvent.end)
            };
          });

          setEvents(newEvents)

          console.log("new events")
          console.log(newEvents)

        } else {
          console.log("No events")
        }
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false);
      }
    };

    getEvents();

  }, []);

  useEffect(() => {
    if (!loading) {
      const sessionData = JSON.parse(localStorage.getItem('kitchenSession'));
      update(ref(database, `rooms/${sessionData.roomId}`), {
        calendarevents: events
      })
        .then(() => console.log("Events uploaded"))
        .catch((error) => console.log("Error: ", error));
    }
    
  }, [events]);

  if (loading) {
    return(
      <div>Loading...</div>
    )
  }

  return (
    <div className="calendar-div">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        selectable
        //style={{ height: 800, width: 1500}}
        className="calendar"
      />
    </div>
  );
};

export default MyCalendar;