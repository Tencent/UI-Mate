import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import { Plus, Trash2, Copy, Video, Calendar as CalendarIcon, Check, X, Clock, Link, Shield } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { generateMeetingId } from '../lib/utils';

export default function Meetings() {
  const { meetings, user, addMeeting, deleteMeeting } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [showModal, setShowModal] = useState(false);
  const [createdMeeting, setCreatedMeeting] = useState(null); // For post-creation confirmation
  const [selectedMeeting, setSelectedMeeting] = useState(null); // For detail view
  const [copiedField, setCopiedField] = useState(null); // Track which field was just copied

  // Check for navigation state to auto-open modal
  useEffect(() => {
    if (location.state?.openSchedule) {
      setShowModal(true);
      // Clear state to prevent reopening on refresh (optional, but good practice)
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key !== 'Escape') return;
      setShowModal(false);
      setCreatedMeeting(null);
      setSelectedMeeting(null);
      setCopiedField(null);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '12:00',
    duration: 60,
    password: '',
    video: true,
    audio: true
  });

  const filteredMeetings = meetings.filter(m => {
    const isPast = new Date(m.startTime) < new Date();
    return activeTab === 'upcoming' ? !isPast : isPast;
  }).sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

  const handleSchedule = (e) => {
    e.preventDefault();
    const startTime = new Date(`${formData.date}T${formData.time}`);
    const meetingId = generateMeetingId();
    const joinUrl = `https://zoom-mock.web/j/${meetingId.replace(/\s/g, '')}`;

    const newMeeting = {
      meetingId,
      title: formData.title || 'My Meeting',
      hostId: user.userId,
      startTime: startTime.toISOString(),
      duration: Number(formData.duration),
      password: formData.password,
      joinUrl,
      participants: [],
      settings: { video: formData.video, audio: formData.audio },
      recurring: false
    };

    addMeeting(newMeeting);
    setShowModal(false);
    setCreatedMeeting(newMeeting);
  };

  const copyInvite = (meeting) => {
    const joinUrl = meeting.joinUrl || `https://zoom-mock.web/j/${meeting.meetingId.replace(/\s/g, '')}`;
    let text = `Join Xoom Meeting\n${joinUrl}\n\nMeeting ID: ${meeting.meetingId}\nTime: ${format(new Date(meeting.startTime), 'PPpp')}`;
    if (meeting.password) {
      text += `\nPasscode: ${meeting.password}`;
    }
    navigator.clipboard.writeText(text);
    setCopiedField('invite');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const copyLink = (meeting) => {
    const joinUrl = meeting.joinUrl || `https://zoom-mock.web/j/${meeting.meetingId.replace(/\s/g, '')}`;
    navigator.clipboard.writeText(joinUrl);
    setCopiedField('link');
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'upcoming' ? 'bg-white shadow-sm text-xoom-blue' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Upcoming
          </button>
          <button 
            onClick={() => setActiveTab('previous')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'previous' ? 'bg-white shadow-sm text-xoom-blue' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Previous
          </button>
          <button 
            onClick={() => setActiveTab('personal')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'personal' ? 'bg-white shadow-sm text-xoom-blue' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Personal Room
          </button>
        </div>

        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 bg-xoom-blue text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Meeting</span>
        </button>
      </div>

      {activeTab === 'personal' ? (
         <div className="bg-white rounded-xl border border-gray-200 p-8 max-w-2xl">
           <h2 className="text-2xl font-bold mb-6">Personal Meeting Room</h2>
           <div className="space-y-6">
             <div>
               <label className="text-sm text-gray-500 block mb-1">Personal Meeting ID</label>
               <div className="text-xl font-mono font-medium">{user.pmi}</div>
             </div>
             <div>
               <label className="text-sm text-gray-500 block mb-1">Join URL</label>
               <div className="text-blue-600 hover:underline cursor-pointer">https://zoom-mock.web/j/{user.pmi.replace(/\s/g, '')}</div>
             </div>
             <div className="pt-4 flex space-x-4">
               <button 
                 onClick={() => navigate(`/room/${user.pmi}`)}
                 className="bg-xoom-blue text-white px-6 py-2 rounded-lg hover:bg-blue-600"
               >
                 Start
               </button>
               <button 
                 onClick={() => {
                   navigator.clipboard.writeText(`Join my Personal Meeting Room: ${user.pmi}`);
                   setCopiedField('personal');
                   setTimeout(() => setCopiedField(null), 2000);
                 }}
                 className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50"
               >
                 {copiedField === 'personal' ? 'Copied!' : 'Copy Invitation'}
               </button>
             </div>
           </div>
         </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 flex-1 overflow-hidden flex flex-col">
          {filteredMeetings.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <CalendarIcon className="w-16 h-16 mb-4 opacity-20" />
              <p>No meetings found</p>
            </div>
          ) : (
            <div className="overflow-y-auto">
              {filteredMeetings.map(meeting => (
                <div key={meeting.meetingId} className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors flex items-center justify-between group cursor-pointer" onClick={() => setSelectedMeeting(meeting)}>
                  <div className="flex items-start space-x-4">
                    <div className="flex flex-col items-center min-w-[80px] pt-1">
                      <span className="text-sm font-medium text-gray-900">{format(new Date(meeting.startTime), 'h:mm a')}</span>
                      <span className="text-xs text-gray-500">{format(new Date(meeting.startTime), 'MMM d')}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 text-lg">{meeting.title}</h3>
                      <p className="text-sm text-gray-500">ID: {meeting.meetingId}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {activeTab === 'upcoming' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/room/${meeting.meetingId}`); }}
                        className="px-4 py-1.5 bg-xoom-blue text-white text-sm rounded-md hover:bg-blue-600"
                      >
                        Start
                      </button>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); copyInvite(meeting); }}
                      className="p-2 text-gray-500 hover:bg-gray-200 rounded-md"
                      title="Copy Invitation"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteMeeting(meeting.meetingId); }}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-md"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Schedule Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Schedule Meeting</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            <form onSubmit={handleSchedule} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input 
                    type="date" 
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input 
                    type="time" 
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.time}
                    onChange={e => setFormData({...formData, time: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.duration}
                  onChange={e => setFormData({...formData, duration: e.target.value})}
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">1 hour</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Passcode (Optional)</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  placeholder="Leave empty for none"
                />
              </div>
              <div className="flex space-x-6 pt-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.video}
                    onChange={e => setFormData({...formData, video: e.target.checked})}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Host Video On</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.audio}
                    onChange={e => setFormData({...formData, audio: e.target.checked})}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Audio On</span>
                </label>
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 text-white bg-xoom-blue rounded-lg hover:bg-blue-600"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Meeting Created Confirmation Modal */}
      {createdMeeting && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <Check className="w-5 h-5 text-green-500" />
                <span>Meeting Scheduled</span>
              </h3>
              <button onClick={() => setCreatedMeeting(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 text-lg">{createdMeeting.title}</h4>
                <p className="text-sm text-gray-500 mt-1">
                  {format(new Date(createdMeeting.startTime), 'EEEE, MMMM d, yyyy')} at {format(new Date(createdMeeting.startTime), 'h:mm a')}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div>
                  <label className="text-xs text-gray-500 block">Meeting Link</label>
                  <p className="text-sm text-blue-600 break-all">{createdMeeting.joinUrl}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block">Meeting ID</label>
                  <p className="text-sm font-mono text-gray-800">{createdMeeting.meetingId}</p>
                </div>
                {createdMeeting.password && (
                  <div>
                    <label className="text-xs text-gray-500 block">Passcode</label>
                    <p className="text-sm font-mono text-gray-800">{createdMeeting.password}</p>
                  </div>
                )}
              </div>
              <div className="flex space-x-3 pt-2">
                <button
                  onClick={() => copyLink(createdMeeting)}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-xoom-blue text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Link className="w-4 h-4" />
                  <span>{copiedField === 'link' ? 'Copied!' : 'Copy Link'}</span>
                </button>
                <button
                  onClick={() => copyInvite(createdMeeting)}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  <span>{copiedField === 'invite' ? 'Copied!' : 'Copy Invitation'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Meeting Detail Modal */}
      {selectedMeeting && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Meeting Details</h3>
              <button onClick={() => { setSelectedMeeting(null); setCopiedField(null); }} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <h4 className="font-semibold text-gray-900 text-xl">{selectedMeeting.title}</h4>
                {selectedMeeting.recurring && (
                  <span className="inline-block mt-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Recurring</span>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <CalendarIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{format(new Date(selectedMeeting.startTime), 'EEEE, MMMM d, yyyy')}</p>
                    <p className="text-sm text-gray-500">{format(new Date(selectedMeeting.startTime), 'h:mm a')}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{selectedMeeting.duration} minutes</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-0.5">Meeting ID</label>
                  <p className="text-sm font-mono font-medium text-gray-800">{selectedMeeting.meetingId}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-0.5">Join URL</label>
                  <p className="text-sm text-blue-600 break-all">
                    {selectedMeeting.joinUrl || `https://zoom-mock.web/j/${selectedMeeting.meetingId.replace(/\s/g, '')}`}
                  </p>
                </div>
                {selectedMeeting.password && (
                  <div className="flex items-start space-x-2">
                    <Shield className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <label className="text-xs text-gray-500 block mb-0.5">Passcode</label>
                      <p className="text-sm font-mono font-medium text-gray-800">{selectedMeeting.password}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  onClick={() => copyLink(selectedMeeting)}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-xoom-blue text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Link className="w-4 h-4" />
                  <span>{copiedField === 'link' ? 'Copied!' : 'Copy Link'}</span>
                </button>
                <button
                  onClick={() => copyInvite(selectedMeeting)}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  <span>{copiedField === 'invite' ? 'Copied!' : 'Copy Invitation'}</span>
                </button>
              </div>

              {new Date(selectedMeeting.startTime) > new Date() && (
                <div className="flex space-x-3">
                  <button
                    onClick={() => { setSelectedMeeting(null); navigate(`/room/${selectedMeeting.meetingId}`); }}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Video className="w-4 h-4" />
                    <span>Start Meeting</span>
                  </button>
                  <button
                    onClick={() => { deleteMeeting(selectedMeeting.meetingId); setSelectedMeeting(null); }}
                    className="flex items-center justify-center space-x-2 px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
