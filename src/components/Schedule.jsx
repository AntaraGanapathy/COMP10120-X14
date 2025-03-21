import React, { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../firebase/firebase';

const Schedule = ({ roomId }) => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (!roomId) return;

    console.log('Fetching events for room:', roomId);

    // Updated path to match your database structure
    const eventsRef = ref(database, `rooms/${roomId}/calendarevents`);
    
    const unsubscribe = onValue(eventsRef, (snapshot) => {
      console.log('Raw calendar data:', snapshot.val()); // Debug log

      if (snapshot.exists()) {
        const eventsData = snapshot.val();
        // Since the data is already an array, we can use it directly
        const eventsArray = eventsData
          .filter(event => new Date(event.start) >= new Date()) // Only future events
          .sort((a, b) => new Date(a.start) - new Date(b.start))
          .slice(0, 5); // Show only next 5 events

        console.log('Processed events:', eventsArray); // Debug log
        setEvents(eventsArray);
      } else {
        setEvents([]);
      }
    });

    return () => unsubscribe();
  }, [roomId]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-lg">
      <h2 className="text-2xl font-bold text-black mb-4">Kitchen Schedule</h2>
      <div className="space-y-3">
        {events.length > 0 ? (
          events.map((event, index) => (
            <div key={index} 
                 className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-black">{event.title}</span>
                  <span className="text-sm text-gray-600">by {event.username}</span>
                </div>
                <div className="text-sm text-gray-500">
                  <span>{new Date(event.start).toLocaleDateString()}</span>
                  <span className="mx-2">•</span>
                  <span>{new Date(event.start).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit'
                  })}</span>
                  <span className="mx-2">to</span>
                  <span>{new Date(event.end).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit'
                  })}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-4">
            No upcoming events scheduled
          </p>
        )}
      </div>
    </div>
  );
};

export default Schedule;