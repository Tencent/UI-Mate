import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { initialUser, initialMeetings, initialContacts, initialRecordings, initialSettings, getSessionId, fetchCustomState, saveState, initializeData } from '../lib/initialData';

const StoreContext = createContext();

export const useStore = () => useContext(StoreContext);

const BASE_INITIAL_KEY = 'zoom_mock_data_initialState';

export const StoreProvider = ({ children }) => {
  // Initial State Reference for Diffing
  const initialStateRef = useRef({
    user: initialUser,
    meetings: initialMeetings,
    contacts: initialContacts,
    recordings: initialRecordings,
    settings: initialSettings,
    activityLog: []
  });

  // Session ID
  const sidRef = useRef(getSessionId());
  const initDone = useRef(false);

  // State
  const [user, setUser] = useState(initialUser);
  const [meetings, setMeetings] = useState(initialMeetings);
  const [contacts, setContacts] = useState(initialContacts);
  const [recordings, setRecordings] = useState(initialRecordings);
  const [settings, setSettings] = useState(initialSettings);
  const [activityLog, setActivityLog] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Session-aware initialization
  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;
    const sid = sidRef.current;

    const applyData = (data) => {
      setUser(data.user || initialUser);
      setMeetings(data.meetings || initialMeetings);
      setContacts(data.contacts || initialContacts);
      setRecordings(data.recordings || initialRecordings);
      setSettings(data.settings || initialSettings);
      setActivityLog(data.activityLog || []);
      initialStateRef.current = {
        user: data.user || initialUser,
        meetings: data.meetings || initialMeetings,
        contacts: data.contacts || initialContacts,
        recordings: data.recordings || initialRecordings,
        settings: data.settings || initialSettings,
        activityLog: data.activityLog || []
      };
      setIsLoaded(true);
    };

    if (sid) {
      const sessionKey = `${BASE_INITIAL_KEY}_${sid}`;
      const isRefresh = localStorage.getItem(sessionKey) !== null;
      if (isRefresh) {
        const data = initializeData(sid);
        applyData(data);
      } else {
        fetchCustomState(sid).then(customState => {
          const data = initializeData(sid, customState);
          applyData(data);
        });
      }
    } else {
      const data = initializeData();
      applyData(data);
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    if (isLoaded) {
      const dataToSave = { user, meetings, contacts, recordings, settings, activityLog };
      saveState(dataToSave, sidRef.current, initialStateRef.current);
    }
  }, [user, meetings, contacts, recordings, settings, activityLog, isLoaded]);

  const addActivity = (type, message) => {
    setActivityLog(prev => [
      ...prev,
      { id: `activity_${Date.now()}`, type, message, at: new Date().toISOString() }
    ]);
  };

  // Actions
  const addMeeting = (meeting) => {
    setMeetings(prev => [...prev, meeting]);
    addActivity('meeting', `Scheduled ${meeting.title}`);
  };

  const updateMeeting = (id, updates) => {
    setMeetings(prev => prev.map(m => m.meetingId === id ? { ...m, ...updates } : m));
    addActivity('meeting', `Updated meeting ${id}`);
  };

  const deleteMeeting = (id) => {
    setMeetings(prev => prev.filter(m => m.meetingId !== id));
    addActivity('meeting', `Deleted meeting ${id}`);
  };

  const addContact = (contact) => {
    setContacts(prev => [...prev, contact]);
    addActivity('contact', `Added ${contact.name}`);
  };

  const updateContact = (id, updates) => {
    setContacts(prev => prev.map(c => c.contactId === id ? { ...c, ...updates } : c));
    addActivity('contact', `Updated contact ${id}`);
  };

  const deleteRecording = (id) => {
    setRecordings(prev => prev.filter(r => r.recordingId !== id));
    addActivity('recording', `Deleted recording ${id}`);
  };

  const updateRecording = (id, updates) => {
    setRecordings(prev => prev.map(r => r.recordingId === id ? { ...r, ...updates } : r));
    addActivity('recording', `Updated recording ${id}`);
  };

  const addRecording = (recording) => {
    setRecordings(prev => [...prev, recording]);
    addActivity('recording', `Created recording ${recording.title}`);
  };

  const updateSettings = (newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    addActivity('settings', 'Updated settings');
  };

  const updateUser = (updates) => {
    setUser(prev => ({ ...prev, ...updates }));
    addActivity('profile', 'Updated profile');
  };

  // State Inspection Helper
  const getStateSnapshot = () => ({
    initial_state: initialStateRef.current,
    current_state: { user, meetings, contacts, recordings, settings, activityLog },
    state_diff: {
      user_changed: JSON.stringify(initialStateRef.current.user) !== JSON.stringify(user),
      meetings_changed: JSON.stringify(initialStateRef.current.meetings) !== JSON.stringify(meetings),
      contacts_changed: JSON.stringify(initialStateRef.current.contacts) !== JSON.stringify(contacts),
      recordings_changed: JSON.stringify(initialStateRef.current.recordings) !== JSON.stringify(recordings),
      settings_changed: JSON.stringify(initialStateRef.current.settings) !== JSON.stringify(settings),
      activity_changed: JSON.stringify(initialStateRef.current.activityLog) !== JSON.stringify(activityLog),
    }
  });

  return (
    <StoreContext.Provider value={{
      user, meetings, contacts, recordings, settings, activityLog,
      addMeeting, updateMeeting, deleteMeeting,
      addContact, updateContact, deleteRecording, updateRecording, addRecording, updateSettings, updateUser, addActivity,
      getStateSnapshot, isLoaded
    }}>
      {children}
    </StoreContext.Provider>
  );
};
