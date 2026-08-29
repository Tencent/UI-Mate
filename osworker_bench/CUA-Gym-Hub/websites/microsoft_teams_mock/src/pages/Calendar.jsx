
    import React, { useState } from 'react';
    import { useStore } from '../context/StoreContext';
    import { format, startOfWeek, addDays, isSameDay, setHours, setMinutes } from 'date-fns';
    import { X } from 'lucide-react';

    export default function Calendar() {
      const { state, actions } = useStore();
      const [showModal, setShowModal] = useState(false);
      const [selectedEvent, setSelectedEvent] = useState(null);
      const [newMeeting, setNewMeeting] = useState({
         title: '',
         date: format(new Date(), 'yyyy-MM-dd'),
         startTime: '10:00',
         endTime: '10:30'
      });

      const today = new Date();
      const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 });
      const weekDays = Array.from({ length: 5 }).map((_, i) => addDays(startOfCurrentWeek, i));
      const hours = Array.from({ length: 9 }).map((_, i) => i + 9); // 9 AM to 5 PM

      const handleCreate = (e) => {
         e.preventDefault();
         const start = new Date(`${newMeeting.date}T${newMeeting.startTime}`);
         const end = new Date(`${newMeeting.date}T${newMeeting.endTime}`);
         
         actions.createMeeting(newMeeting.title, start.toISOString(), end.toISOString(), []);
         setShowModal(false);
         setNewMeeting({
            title: '',
            date: format(new Date(), 'yyyy-MM-dd'),
            startTime: '10:00',
            endTime: '10:30'
         });
      };

      const openModal = (date = new Date(), hour = 10) => {
         setNewMeeting({
            title: '',
            date: format(date, 'yyyy-MM-dd'),
            startTime: `${hour.toString().padStart(2, '0')}:00`,
            endTime: `${(hour + 1).toString().padStart(2, '0')}:00`
         });
         setShowModal(true);
      };

      return (
        <div className="flex flex-col h-full bg-white relative">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="font-bold text-xl">Calendar</h2>
            <div className="flex gap-2">
               <button className="px-3 py-1 border rounded hover:bg-gray-50">Work Week</button>
               <button onClick={() => actions.startCall([])} className="bg-teams-purple text-white px-3 py-1 rounded hover:bg-teams-dark">Meet Now</button>
               <button onClick={() => openModal()} className="bg-teams-purple text-white px-3 py-1 rounded hover:bg-teams-dark">+ New Meeting</button>
            </div>
          </div>
          
          <div className="flex-1 overflow-auto">
            <div className="min-w-[800px]">
               {/* Header Row */}
               <div className="grid grid-cols-6 border-b border-gray-200">
                  <div className="p-2 border-r text-xs text-gray-500 text-right pr-4">Time</div>
                  {weekDays.map(day => (
                     <div key={day.toString()} className={`p-2 border-r text-center ${isSameDay(day, today) ? 'text-teams-purple font-bold' : ''}`}>
                        <div className="text-xs uppercase">{format(day, 'EEE')}</div>
                        <div className="text-xl">{format(day, 'd')}</div>
                     </div>
                  ))}
               </div>

               {/* Grid */}
               {hours.map(hour => (
                  <div key={hour} className="grid grid-cols-6 h-20 border-b border-gray-100">
                     <div className="border-r p-2 text-xs text-gray-400 text-right pr-4 relative -top-3">
                        {hour > 12 ? hour - 12 : hour} {hour >= 12 ? 'PM' : 'AM'}
                     </div>
                     {weekDays.map(day => {
                        const cellDate = new Date(day);
                        cellDate.setHours(hour);
                        
                        // Find events (state.calendar may be absent in injected states -> null-safe)
                        const events = (state.calendar || []).filter(evt => {
                           const evtStart = new Date(evt.start);
                           return isSameDay(evtStart, day) && evtStart.getHours() === hour;
                        });

                        return (
                           <div 
                              key={day.toString()} 
                              className="border-r relative p-1 hover:bg-gray-50 cursor-pointer"
                              onClick={() => openModal(day, hour)}
                           >
                              {events.map(evt => (
                                 <div 
                                    key={evt.id} 
                                    className="bg-teams-purple/20 border-l-4 border-teams-purple p-1 text-xs rounded cursor-pointer hover:bg-teams-purple/30 absolute inset-x-1 top-1 h-[90%] z-10"
                                    onClick={(e) => {
                                       e.stopPropagation();
                                       setSelectedEvent(evt);
                                    }}
                                 >
                                    <div className="font-bold text-teams-dark truncate">{evt.title}</div>
                                    <div className="text-gray-600 truncate">{format(evt.start, 'h:mm')} - {format(evt.end, 'h:mm a')}</div>
                                 </div>
                              ))}
                           </div>
                        );
                     })}
                  </div>
               ))}
            </div>
          </div>

          {/* New Meeting Modal */}
          {showModal && (
             <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                   <div className="flex justify-between items-center p-4 border-b border-gray-200">
                      <h3 className="font-bold text-lg">New Meeting</h3>
                      <button onClick={() => setShowModal(false)} className="text-gray-500 hover:bg-gray-100 rounded p-1"><X size={20}/></button>
                   </div>
                   <form onSubmit={handleCreate} className="p-6 space-y-4">
                      <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                         <input 
                           required
                           type="text" 
                           className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-1 focus:ring-teams-purple focus:border-teams-purple"
                           value={newMeeting.title}
                           onChange={e => setNewMeeting({...newMeeting, title: e.target.value})}
                           placeholder="Add title"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                            <input 
                              type="date" 
                              className="w-full border border-gray-300 rounded px-3 py-2"
                              value={newMeeting.date}
                              onChange={e => setNewMeeting({...newMeeting, date: e.target.value})}
                           />
                         </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                            <input 
                              type="time" 
                              className="w-full border border-gray-300 rounded px-3 py-2"
                              value={newMeeting.startTime}
                              onChange={e => setNewMeeting({...newMeeting, startTime: e.target.value})}
                           />
                         </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-4">
                         <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">Cancel</button>
                         <button type="submit" className="px-4 py-2 bg-teams-purple text-white rounded hover:bg-teams-dark">Save</button>
                      </div>
                   </form>
                </div>
             </div>
          )}

          {selectedEvent && (
             <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                   <div className="flex justify-between items-center p-4 border-b border-gray-200">
                      <h3 className="font-bold text-lg">{selectedEvent.title}</h3>
                      <button onClick={() => setSelectedEvent(null)} className="text-gray-500 hover:bg-gray-100 rounded p-1"><X size={20}/></button>
                   </div>
                   <div className="p-6 space-y-3 text-sm text-gray-700">
                      <p><span className="font-medium">Time:</span> {format(new Date(selectedEvent.start), 'MMM d, h:mm a')} - {format(new Date(selectedEvent.end), 'h:mm a')}</p>
                      <p><span className="font-medium">Attendees:</span> {selectedEvent.attendees.length || 0}</p>
                      <div className="flex justify-end gap-2 pt-2">
                         <button onClick={() => actions.startCall(selectedEvent.attendees)} className="px-4 py-2 bg-teams-purple text-white rounded hover:bg-teams-dark">Join</button>
                         <button onClick={() => setSelectedEvent(null)} className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">Close</button>
                      </div>
                   </div>
                </div>
             </div>
          )}
        </div>
      );
    }
  
