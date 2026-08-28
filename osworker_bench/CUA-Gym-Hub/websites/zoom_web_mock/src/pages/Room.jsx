import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Users, MessageSquare, Share, Shield, MoreHorizontal, X, Send, CircleDot, Download } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function Room() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, addRecording, addActivity } = useStore();
  
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [participants, setParticipants] = useState([
    { id: 'me', name: user.username, avatar: user.avatar, isHost: true }
  ]);
  const [showToolbar, setShowToolbar] = useState(true);
  const [activePanel, setActivePanel] = useState(null);
  const [chatMessages, setChatMessages] = useState([
    { id: 'msg-1', sender: 'Sarah Connor', text: 'Joining from the web client.', at: new Date().toISOString() }
  ]);
  const [chatDraft, setChatDraft] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    // Mock participants joining
    const timer = setTimeout(() => {
      setParticipants(prev => [
        ...prev,
        { id: 'p2', name: 'Sarah Connor', avatar: 'https://picsum.photos/100/100?random=c1' }
      ]);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key !== 'Escape') return;
      setActivePanel(null);
      setShowEndModal(false);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  const handleEndCall = () => {
    setShowEndModal(true);
  };

  const sendChat = (event) => {
    event.preventDefault();
    if (!chatDraft.trim()) return;
    setChatMessages(prev => [
      ...prev,
      { id: `msg-${Date.now()}`, sender: user.username, text: chatDraft.trim(), at: new Date().toISOString() }
    ]);
    addActivity('chat', `Sent chat in meeting ${id}`);
    setChatDraft('');
  };

  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      setNotice('Recording started locally');
      return;
    }
    const recording = {
      recordingId: `rec_${Date.now()}`,
      meetingId: id,
      title: `Xoom Meeting ${id} - Recording`,
      url: `xoom-mock-recording://${id}`,
      duration: '00:38',
      created: new Date().toISOString(),
      size: '12 MB',
      transcript: chatMessages.map(message => `${message.sender}: ${message.text}`).join('\n'),
      sharedWith: []
    };
    addRecording(recording);
    setIsRecording(false);
    setNotice('Recording saved locally');
  };

  const downloadTranscript = () => {
    const content = chatMessages.map(message => `[${new Date(message.at).toLocaleTimeString()}] ${message.sender}: ${message.text}`).join('\n');
    const blob = new Blob([content || 'No chat messages'], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `meeting-${id}-chat.txt`;
    link.click();
    URL.revokeObjectURL(url);
    setNotice('Chat transcript downloaded');
  };

  return (
    <div 
      className="h-screen bg-black text-white flex flex-col relative overflow-hidden"
      onMouseMove={() => {
        setShowToolbar(true);
        // Reset hide timer logic would go here
      }}
    >
      {/* Main Video Grid */}
      <div className="flex-1 p-4 flex items-center justify-center">
        <div className={`grid gap-4 w-full h-full ${participants.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {participants.map(p => (
            <div key={p.id} className="relative bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center border border-gray-800">
              {p.id === 'me' && !videoOn ? (
                <div className="flex flex-col items-center">
                   <img src={p.avatar} alt={p.name} className="w-24 h-24 rounded-full mb-4" />
                   <span className="text-xl font-medium">{p.name}</span>
                </div>
              ) : (
                <>
                  <img 
                    src={`https://picsum.photos/800/600?random=${p.id}`} 
                    className="w-full h-full object-cover opacity-80" 
                    alt="Video Feed"
                  />
                  <div className="absolute bottom-4 left-4 bg-black/50 px-2 py-1 rounded text-sm font-medium">
                    {p.name} {p.id === 'me' && '(Me)'}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <div className={`h-20 bg-gray-900 border-t border-gray-800 flex items-center justify-between px-6 transition-transform duration-300 ${showToolbar ? 'translate-y-0' : 'translate-y-full'}`}>
        
        {/* Audio/Video Controls */}
        <div className="flex space-x-4">
          <button 
            onClick={() => setMicOn(!micOn)}
            className="flex flex-col items-center space-y-1 min-w-[60px] hover:bg-gray-800 p-2 rounded-lg"
          >
            {micOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6 text-red-500" />}
            <span className="text-xs">{micOn ? 'Mute' : 'Unmute'}</span>
          </button>
          <button 
            onClick={() => setVideoOn(!videoOn)}
            className="flex flex-col items-center space-y-1 min-w-[60px] hover:bg-gray-800 p-2 rounded-lg"
          >
            {videoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6 text-red-500" />}
            <span className="text-xs">{videoOn ? 'Stop Video' : 'Start Video'}</span>
          </button>
        </div>

        {/* Center Controls */}
        <div className="flex space-x-2">
          <button
            onClick={() => setActivePanel(activePanel === 'security' ? null : 'security')}
            className="flex flex-col items-center space-y-1 min-w-[60px] hover:bg-gray-800 p-2 rounded-lg"
          >
            <Shield className="w-5 h-5" />
            <span className="text-xs">Security</span>
          </button>
          <button
            onClick={() => setActivePanel(activePanel === 'participants' ? null : 'participants')}
            className="flex flex-col items-center space-y-1 min-w-[60px] hover:bg-gray-800 p-2 rounded-lg relative"
          >
            <div className="relative">
              <Users className="w-5 h-5" />
              <span className="absolute -top-2 -right-2 bg-gray-700 text-[10px] px-1 rounded-full">{participants.length}</span>
            </div>
            <span className="text-xs">Participants</span>
          </button>
          <button
            onClick={() => setActivePanel(activePanel === 'chat' ? null : 'chat')}
            className="flex flex-col items-center space-y-1 min-w-[60px] hover:bg-gray-800 p-2 rounded-lg"
          >
            <MessageSquare className="w-5 h-5" />
            <span className="text-xs">Chat</span>
          </button>
          <button
            onClick={() => {
              setIsSharing(!isSharing);
              setNotice(!isSharing ? 'Screen sharing started locally' : 'Screen sharing stopped');
              addActivity('share', `${!isSharing ? 'Started' : 'Stopped'} screen share in meeting ${id}`);
            }}
            className="flex flex-col items-center space-y-1 min-w-[60px] hover:bg-gray-800 p-2 rounded-lg text-green-500"
          >
            <Share className="w-5 h-5" />
            <span className="text-xs">{isSharing ? 'Stop Share' : 'Share Screen'}</span>
          </button>
          <button
            onClick={() => setActivePanel(activePanel === 'more' ? null : 'more')}
            className="flex flex-col items-center space-y-1 min-w-[60px] hover:bg-gray-800 p-2 rounded-lg"
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-xs">More</span>
          </button>
        </div>

        {/* End Button */}
        <div>
          <button 
            onClick={handleEndCall}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
          >
            End
          </button>
        </div>
      </div>
      
      {/* Meeting Info Overlay */}
      <div className="absolute top-4 left-4 flex items-center space-x-2 bg-black/40 px-3 py-1.5 rounded-lg backdrop-blur-sm">
        <Shield className="w-4 h-4 text-green-500" />
        <span className="text-sm font-medium">Xoom Meeting</span>
        <span className="text-xs text-gray-300 ml-2">ID: {id}</span>
      </div>

      {isSharing && (
        <div className="absolute top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg">
          You are sharing Screen 1
        </div>
      )}

      {notice && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-white text-gray-900 px-4 py-2 rounded-lg shadow-lg text-sm">
          {notice}
          <button className="ml-3 text-gray-500" onClick={() => setNotice('')}>Close</button>
        </div>
      )}

      {activePanel && (
        <aside className="absolute right-4 top-16 bottom-24 w-80 bg-white text-gray-900 rounded-xl shadow-2xl flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <h2 className="font-semibold capitalize">{activePanel}</h2>
            <button onClick={() => setActivePanel(null)}><X className="w-4 h-4" /></button>
          </div>

          {activePanel === 'participants' && (
            <div className="p-3 space-y-2 overflow-y-auto">
              {participants.map(participant => (
                <div key={participant.id} className="flex items-center justify-between rounded-lg border p-2">
                  <div className="flex items-center space-x-2">
                    <img src={participant.avatar} alt={participant.name} className="w-8 h-8 rounded-full" />
                    <div>
                      <div className="font-medium text-sm">{participant.name}</div>
                      <div className="text-xs text-gray-500">{participant.isHost ? 'Host' : 'Participant'}</div>
                    </div>
                  </div>
                  <span className="text-xs text-green-600">Connected</span>
                </div>
              ))}
            </div>
          )}

          {activePanel === 'chat' && (
            <>
              <div className="flex-1 p-3 space-y-2 overflow-y-auto">
                {chatMessages.map(message => (
                  <div key={message.id} className="rounded-lg bg-gray-100 p-2">
                    <div className="text-xs font-semibold">{message.sender}</div>
                    <div className="text-sm">{message.text}</div>
                  </div>
                ))}
              </div>
              <form onSubmit={sendChat} className="border-t p-3 flex gap-2">
                <input
                  value={chatDraft}
                  onChange={(event) => setChatDraft(event.target.value)}
                  placeholder="Message everyone"
                  className="flex-1 border rounded-lg px-3 py-2 text-sm"
                />
                <button className="bg-xoom-blue text-white rounded-lg px-3" type="submit"><Send className="w-4 h-4" /></button>
              </form>
            </>
          )}

          {activePanel === 'security' && (
            <div className="p-4 space-y-3 text-sm">
              <div className="flex items-center justify-between"><span>Waiting room</span><span className="text-green-600">On</span></div>
              <div className="flex items-center justify-between"><span>Only host can share</span><span className="text-green-600">On</span></div>
              <div className="flex items-center justify-between"><span>Meeting locked</span><span className="text-gray-500">Off</span></div>
            </div>
          )}

          {activePanel === 'more' && (
            <div className="p-3 space-y-2">
              <button onClick={toggleRecording} className="w-full flex items-center gap-2 rounded-lg border p-3 hover:bg-gray-50">
                <CircleDot className={`w-4 h-4 ${isRecording ? 'text-red-600' : 'text-gray-500'}`} />
                {isRecording ? 'Stop recording' : 'Record locally'}
              </button>
              <button onClick={downloadTranscript} className="w-full flex items-center gap-2 rounded-lg border p-3 hover:bg-gray-50">
                <Download className="w-4 h-4" />
                Download chat transcript
              </button>
            </div>
          )}
        </aside>
      )}

      {showEndModal && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
          <div className="bg-white text-gray-900 rounded-xl shadow-2xl w-96 p-6">
            <h2 className="text-lg font-semibold mb-2">End meeting?</h2>
            <p className="text-sm text-gray-600 mb-5">This closes the local mock meeting and returns to Home. Participants, chat, and recordings stay in local state.</p>
            <div className="flex gap-3 justify-end">
              <button className="px-4 py-2 rounded-lg bg-gray-100" onClick={() => setShowEndModal(false)}>Cancel</button>
              <button className="px-4 py-2 rounded-lg bg-red-600 text-white" onClick={() => { addActivity('meeting', `Ended meeting ${id}`); navigate('/'); }}>
                End for all
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
