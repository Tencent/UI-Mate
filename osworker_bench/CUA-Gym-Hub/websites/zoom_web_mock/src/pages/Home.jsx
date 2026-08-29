import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Plus, Calendar, MonitorUp, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { useStore } from '../context/StoreContext';
import { generateMeetingId } from '../lib/utils';

export default function Home() {
  const { user, meetings } = useStore();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Modal States
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [joinMeetingId, setJoinMeetingId] = useState('');
  const [shareMeetingId, setShareMeetingId] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key !== 'Escape') return;
      setShowJoinModal(false);
      setShowShareModal(false);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  const handleNewMeeting = () => {
    const meetingId = generateMeetingId();
    navigate(`/room/${meetingId}?instant=true`);
  };

  const handleJoinSubmit = (e) => {
    e.preventDefault();
    if (joinMeetingId.trim()) {
      navigate(`/room/${joinMeetingId}`);
    }
  };

  const handleShareSubmit = (e) => {
    e.preventDefault();
    if (shareMeetingId.trim()) {
      // For mock purposes, we just join the room but maybe in a "sharing" mode context if we had one
      navigate(`/room/${shareMeetingId}?mode=share`);
    }
  };

  const upcomingMeetings = meetings
    .filter(m => new Date(m.startTime) > new Date())
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
    .slice(0, 3);

  return (
    <div className="flex h-full gap-6">
      {/* Left Panel: Actions */}
      <div className="flex-1 flex flex-col justify-center max-w-2xl mx-auto">
        <div className="grid grid-cols-2 gap-6 mb-8">
          <button 
            onClick={handleNewMeeting}
            className="aspect-square bg-orange-500 rounded-2xl flex flex-col items-center justify-center text-white hover:bg-orange-600 transition-all shadow-lg hover:shadow-xl group"
          >
            <div className="w-16 h-16 bg-orange-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Video className="w-8 h-8" />
            </div>
            <span className="font-semibold text-lg">New Meeting</span>
          </button>

          <button 
            onClick={() => setShowJoinModal(true)}
            className="aspect-square bg-blue-500 rounded-2xl flex flex-col items-center justify-center text-white hover:bg-blue-600 transition-all shadow-lg hover:shadow-xl group"
          >
            <div className="w-16 h-16 bg-blue-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Plus className="w-8 h-8" />
            </div>
            <span className="font-semibold text-lg">Join</span>
          </button>

          <button 
            onClick={() => navigate('/meetings', { state: { openSchedule: true } })}
            className="aspect-square bg-blue-500 rounded-2xl flex flex-col items-center justify-center text-white hover:bg-blue-600 transition-all shadow-lg hover:shadow-xl group"
          >
            <div className="w-16 h-16 bg-blue-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Calendar className="w-8 h-8" />
            </div>
            <span className="font-semibold text-lg">Schedule</span>
          </button>

          <button 
            onClick={() => setShowShareModal(true)}
            className="aspect-square bg-blue-500 rounded-2xl flex flex-col items-center justify-center text-white hover:bg-blue-600 transition-all shadow-lg hover:shadow-xl group"
          >
            <div className="w-16 h-16 bg-blue-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <MonitorUp className="w-8 h-8" />
            </div>
            <span className="font-semibold text-lg">Share Screen</span>
          </button>
        </div>
      </div>

      {/* Right Panel: Time & Schedule */}
      <div className="w-96 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        <div className="h-48 bg-cover bg-center relative p-6 flex flex-col justify-between" style={{ backgroundImage: 'url(https://picsum.photos/400/300?blur=2)' }}>
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/60"></div>
          <div className="relative z-10 text-white">
            <h2 className="text-4xl font-bold">{format(currentTime, 'h:mm a')}</h2>
            <p className="text-lg opacity-90">{format(currentTime, 'EEEE, MMMM d, yyyy')}</p>
          </div>
        </div>

        <div className="flex-1 p-4 overflow-y-auto">
          <h3 className="text-gray-500 text-sm font-semibold mb-3 uppercase tracking-wider">Upcoming</h3>
          
          {upcomingMeetings.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <p>No upcoming meetings today</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingMeetings.map(meeting => (
                <div key={meeting.meetingId} className="flex items-center p-3 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-100 transition-colors">
                  <div className="flex flex-col items-center mr-4 min-w-[60px]">
                     <span className="text-xs text-gray-500">Start</span>
                     <span className="font-semibold text-gray-700">{format(new Date(meeting.startTime), 'h:mm a')}</span>
                  </div>
                  <div className="flex-1 border-l pl-4 border-gray-200">
                    <h4 className="font-medium text-gray-800 truncate">{meeting.title}</h4>
                    <p className="text-xs text-gray-500">ID: {meeting.meetingId}</p>
                  </div>
                  <button 
                    onClick={() => navigate(`/room/${meeting.meetingId}`)}
                    className="px-3 py-1 bg-xoom-blue text-white text-xs rounded-md hover:bg-blue-600"
                  >
                    Start
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Join Meeting Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Join Meeting</h3>
              <button onClick={() => setShowJoinModal(false)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            <form onSubmit={handleJoinSubmit} className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Meeting ID or Personal Link Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="Enter Meeting ID"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                  value={joinMeetingId}
                  onChange={e => setJoinMeetingId(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="mb-6">
                 <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                 <input 
                   type="text" 
                   defaultValue={user.username}
                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                 />
              </div>
              <div className="flex space-x-3">
                <button 
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="flex-1 px-4 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={!joinMeetingId.trim()}
                  className="flex-1 px-4 py-2.5 text-white bg-xoom-blue rounded-lg hover:bg-blue-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Join
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share Screen Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Share Screen</h3>
              <button onClick={() => setShowShareModal(false)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            <form onSubmit={handleShareSubmit} className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Meeting ID or Sharing Key</label>
                <input 
                  type="text" 
                  required
                  placeholder="Enter ID to share to"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                  value={shareMeetingId}
                  onChange={e => setShareMeetingId(e.target.value)}
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-2">
                  Enter the Meeting ID of the room you want to share your screen to.
                </p>
              </div>
              <div className="flex space-x-3">
                <button 
                  type="button"
                  onClick={() => setShowShareModal(false)}
                  className="flex-1 px-4 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={!shareMeetingId.trim()}
                  className="flex-1 px-4 py-2.5 text-white bg-xoom-blue rounded-lg hover:bg-blue-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Share Screen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
