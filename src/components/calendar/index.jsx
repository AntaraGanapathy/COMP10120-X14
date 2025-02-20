import React, { useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

// Use Moment.js for localizing the calendar
const localizer = momentLocalizer(moment);

const MyCalendar = () => {
  // Example events
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

  return (
    <div style={{ height: 500 }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 400 }}
      />
    </div>
  );
};


export default MyCalendar;

