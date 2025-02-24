import React, { useCallback, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { set } from "firebase/database";

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
      const title = window.prompt("Enter title");
      if (title) {
        setEvents((prev) => [...prev, {start, end, title}]);
      }
    },
    [setEvents]
  );

  return (
    <div style={{ height: 500 }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        onSelectSlot={handleSelectSlot}
        style={{ height: 400 }}
      />
    </div>
  );
};

// const handleSelectSlot = useCallback(
//   ({start, end}) => {
//     const title = window.prompt("Enter title");
//     if (title) {
//       setEvents((prev) => [...prev, {start, end, title}]);
//     }
//   },
//   [setEvents]
// );

export default MyCalendar;

