import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Pencil, Plus, Trash2, X, UserPlus, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// --- Helpers ---

function getConnectionDegree(userId, currentUser, users) {
  if (currentUser.connections.includes(userId)) return '1st';
  const user = users[userId];
  if (user && user.connections) {
    for (const connId of user.connections) {
      if (currentUser.connections.includes(connId)) return '2nd';
    }
  }
  return '3rd+';
}

function getTotalReactions(reactions) {
  if (!reactions) return 0;
  return Object.values(reactions).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0);
}

// --- Modals ---

const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold">{title}</h2>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
          <X size={24} />
        </button>
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  </div>
);

const ExperienceForm = ({ onClose, onSave, initialData = null }) => {
  const [formData, setFormData] = useState(initialData || {
    title: '',
    company: '',
    startDate: '',
    endDate: '',
    location: '',
    description: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input required type="text" className="mt-1 block w-full border border-gray-300 rounded px-3 py-2" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Company</label>
        <input required type="text" className="mt-1 block w-full border border-gray-300 rounded px-3 py-2" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Start Date</label>
          <input type="text" placeholder="e.g. 2020-01" className="mt-1 block w-full border border-gray-300 rounded px-3 py-2" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">End Date</label>
          <input type="text" placeholder="Present" className="mt-1 block w-full border border-gray-300 rounded px-3 py-2" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Location</label>
        <input type="text" className="mt-1 block w-full border border-gray-300 rounded px-3 py-2" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea className="mt-1 block w-full border border-gray-300 rounded px-3 py-2" rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 font-semibold hover:bg-gray-100 rounded-full">Cancel</button>
        <button type="submit" className="px-4 py-2 bg-xinkedin-blue text-white font-semibold rounded-full hover:bg-xinkedin-dark">Save</button>
      </div>
    </form>
  );
};

const EducationForm = ({ onClose, onSave, initialData = null }) => {
  const [formData, setFormData] = useState(initialData || {
    school: '',
    degree: '',
    year: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">School</label>
        <input required type="text" className="mt-1 block w-full border border-gray-300 rounded px-3 py-2" value={formData.school} onChange={e => setFormData({...formData, school: e.target.value})} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Degree</label>
        <input required type="text" className="mt-1 block w-full border border-gray-300 rounded px-3 py-2" value={formData.degree} onChange={e => setFormData({...formData, degree: e.target.value})} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Year</label>
        <input type="text" className="mt-1 block w-full border border-gray-300 rounded px-3 py-2" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} />
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 font-semibold hover:bg-gray-100 rounded-full">Cancel</button>
        <button type="submit" className="px-4 py-2 bg-xinkedin-blue text-white font-semibold rounded-full hover:bg-xinkedin-dark">Save</button>
      </div>
    </form>
  );
};

const SkillForm = ({ onClose, onSave }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if(name.trim()) {
      onSave(name);
      onClose();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Skill Name</label>
        <input required type="text" className="mt-1 block w-full border border-gray-300 rounded px-3 py-2" value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 font-semibold hover:bg-gray-100 rounded-full">Cancel</button>
        <button type="submit" className="px-4 py-2 bg-xinkedin-blue text-white font-semibold rounded-full hover:bg-xinkedin-dark">Save</button>
      </div>
    </form>
  );
};

// --- Main Component ---

export default function Profile() {
  const { state, updateProfile, addExperience, updateExperience, deleteExperience, addEducation, updateEducation, deleteEducation, addSkill, removeSkill, sendConnectionRequest, createChat } = useStore();
  const { id } = useParams();
  const navigate = useNavigate();

  const isOwnProfile = !id || id === 'me' || id === state.currentUser.id;
  const user = isOwnProfile ? state.currentUser : (state.users[id] || null);

  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [aboutText, setAboutText] = useState(state.currentUser.about);
  const [isEditingHeadline, setIsEditingHeadline] = useState(false);
  const [headlineText, setHeadlineText] = useState(state.currentUser.headline);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameText, setNameText] = useState(state.currentUser.name);

  const [showExpModal, setShowExpModal] = useState(false);
  const [showEduModal, setShowEduModal] = useState(false);
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [editingExp, setEditingExp] = useState(null);
  const [editingEdu, setEditingEdu] = useState(null);
  const [showOpenTo, setShowOpenTo] = useState(false);
  const [showAddSection, setShowAddSection] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showAllActivity, setShowAllActivity] = useState(false);
  const [showAllSkills, setShowAllSkills] = useState(false);

  const saveAbout = () => {
    updateProfile({ about: aboutText });
    setIsEditingAbout(false);
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-700">User not found</h2>
          <p className="text-gray-500 mt-2">This profile does not exist.</p>
        </div>
      </div>
    );
  }

  const isConnected = !isOwnProfile && state.currentUser.connections.includes(user.id);
  const hasPendingRequest = !isOwnProfile && state.connectionRequests?.some(
    r => r.fromUserId === state.currentUser.id && r.toUserId === user.id && r.status === 'pending'
  );
  const degree = !isOwnProfile ? getConnectionDegree(user.id, state.currentUser, state.users) : null;

  const handleConnect = () => {
    sendConnectionRequest(user.id);
  };

  const handleMessage = () => {
    const chatId = createChat(user.id);
    navigate('/messaging');
  };

  const handleSaveEditExp = (data) => {
    if (editingExp) {
      updateExperience(editingExp.id, data);
    } else {
      addExperience(data);
    }
    setEditingExp(null);
    setShowExpModal(false);
  };

  const handleSaveEditEdu = (data) => {
    if (editingEdu) {
      updateEducation(editingEdu.id, data);
    } else {
      addEducation(data);
    }
    setEditingEdu(null);
    setShowEduModal(false);
  };

  // Activity section: recent posts by this user
  const allUserPosts = state.posts.filter(p => p.userId === user.id);
  const userPosts = showAllActivity ? allUserPosts : allUserPosts.slice(0, 3);

  // People also viewed: users not self, not connected, limited to 3
  const peopleAlsoViewed = Object.values(state.users)
    .filter(u => u.id !== state.currentUser.id && u.id !== user.id && !state.currentUser.connections.includes(u.id))
    .slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="md:col-span-3 space-y-4">
        {/* Header Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden relative pb-4">
          <div className="h-48 bg-gray-200">
            <img src={user.banner} className="w-full h-full object-cover" alt="Banner" />
            {isOwnProfile && (
              <button
                onClick={() => {
                  const newBanner = `https://picsum.photos/1200/400?random=${Date.now()}`;
                  updateProfile({ banner: newBanner });
                }}
                className="absolute top-4 right-4 bg-white p-2 rounded-full text-xinkedin-blue hover:text-xinkedin-dark"
                title="Change banner photo"
              >
                <Pencil size={18} />
              </button>
            )}
          </div>
          <div className="px-6 relative">
            <div className="absolute -top-16 left-6">
               <img src={user.avatar} className="w-32 h-32 rounded-full border-4 border-white object-cover" alt={user.name} />
            </div>
            <div className="mt-20 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  {isOwnProfile && isEditingName ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={nameText}
                        onChange={(e) => setNameText(e.target.value)}
                        className="text-2xl font-bold text-gray-900 border border-gray-300 rounded px-2 py-1"
                        autoFocus
                      />
                      <button onClick={() => { updateProfile({ name: nameText }); setIsEditingName(false); }} className="text-sm bg-xinkedin-blue text-white px-3 py-1 rounded-full font-semibold">Save</button>
                      <button onClick={() => { setNameText(user.name); setIsEditingName(false); }} className="text-sm text-gray-600 px-3 py-1 rounded-full font-semibold hover:bg-gray-100">Cancel</button>
                    </div>
                  ) : (
                    <h1 className="text-2xl font-bold text-gray-900" onClick={() => isOwnProfile && setIsEditingName(true)} style={isOwnProfile ? { cursor: 'pointer' } : {}}>{user.name}</h1>
                  )}
                  {degree && <span className="text-sm text-gray-500 font-normal">&#183; {degree}</span>}
                </div>
                {isOwnProfile && isEditingHeadline ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="text"
                      value={headlineText}
                      onChange={(e) => setHeadlineText(e.target.value)}
                      className="text-base text-gray-900 border border-gray-300 rounded px-2 py-1 w-full"
                      autoFocus
                    />
                    <button onClick={() => { updateProfile({ headline: headlineText }); setIsEditingHeadline(false); }} className="text-sm bg-xinkedin-blue text-white px-3 py-1 rounded-full font-semibold whitespace-nowrap">Save</button>
                    <button onClick={() => { setHeadlineText(user.headline); setIsEditingHeadline(false); }} className="text-sm text-gray-600 px-3 py-1 rounded-full font-semibold hover:bg-gray-100 whitespace-nowrap">Cancel</button>
                  </div>
                ) : (
                  <p className="text-base text-gray-900 mt-1" onClick={() => isOwnProfile && setIsEditingHeadline(true)} style={isOwnProfile ? { cursor: 'pointer' } : {}}>{user.headline}</p>
                )}
                {user.location && <p className="text-sm text-gray-500 mt-1">{user.location} &#183; <span className="text-xinkedin-blue font-semibold cursor-pointer hover:underline" onClick={() => setShowContactInfo(true)}>Contact info</span></p>}
                <p className="text-sm text-xinkedin-blue font-semibold mt-3 hover:underline cursor-pointer" onClick={() => navigate('/mynetwork')}>{user.connections?.length || 0} connections</p>
              </div>
              {isOwnProfile && user.experience && user.experience[0] && (
                <div className="hidden md:block">
                   <div className="flex items-center gap-2">
                     <img src={state.companies?.[user.experience[0].companyId]?.logo || `https://picsum.photos/30/30?random=co_${user.experience[0].company}`} className="w-8 h-8 rounded" alt="" />
                     <span className="text-sm font-semibold hover:underline cursor-pointer">{user.experience[0].company}</span>
                   </div>
                </div>
              )}
            </div>
            <div className="mt-4 flex gap-2">
              {isOwnProfile ? (
                <div className="flex gap-2 relative">
                  <div className="relative">
                    <button onClick={() => setShowOpenTo(!showOpenTo)} className="bg-xinkedin-blue text-white px-6 py-1.5 rounded-full font-semibold hover:bg-xinkedin-dark">Open to</button>
                    {showOpenTo && (
                      <div className="absolute left-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20 w-64">
                        <button onClick={() => { updateProfile({ openTo: 'hiring' }); setShowOpenTo(false); }} className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100">Finding a new job</button>
                        <button onClick={() => { updateProfile({ openTo: 'providing_services' }); setShowOpenTo(false); }} className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100">Providing services</button>
                        <button onClick={() => { updateProfile({ openTo: 'hiring_talent' }); setShowOpenTo(false); }} className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100">Hiring</button>
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <button onClick={() => setShowAddSection(!showAddSection)} className="border border-xinkedin-blue text-xinkedin-blue px-6 py-1.5 rounded-full font-semibold hover:bg-blue-50">Add profile section</button>
                    {showAddSection && (
                      <div className="absolute left-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20 w-64">
                        <button onClick={() => { setShowAddSection(false); setEditingExp(null); setShowExpModal(true); }} className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100">Add experience</button>
                        <button onClick={() => { setShowAddSection(false); setEditingEdu(null); setShowEduModal(true); }} className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100">Add education</button>
                        <button onClick={() => { setShowAddSection(false); setShowSkillModal(true); }} className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100">Add skill</button>
                        <button onClick={() => { setShowAddSection(false); setIsEditingAbout(true); }} className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100">Add about</button>
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <button onClick={() => setShowMoreMenu(!showMoreMenu)} className="border border-gray-500 text-gray-600 px-6 py-1.5 rounded-full font-semibold hover:bg-gray-100">More</button>
                    {showMoreMenu && (
                      <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20 w-56">
                        <button onClick={() => { navigator.clipboard.writeText(window.location.href); setShowMoreMenu(false); }} className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100">Copy profile link</button>
                        <button onClick={() => { setShowMoreMenu(false); setIsEditingAbout(true); }} className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100">Edit about</button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  {isConnected ? (
                    <button onClick={handleMessage} className="bg-xinkedin-blue text-white px-6 py-1.5 rounded-full font-semibold hover:bg-xinkedin-dark flex items-center gap-2">
                      <MessageSquare size={16} /> Message
                    </button>
                  ) : hasPendingRequest ? (
                    <button disabled className="border border-gray-400 text-gray-500 px-6 py-1.5 rounded-full font-semibold cursor-not-allowed">Pending</button>
                  ) : (
                    <button onClick={handleConnect} className="bg-xinkedin-blue text-white px-6 py-1.5 rounded-full font-semibold hover:bg-xinkedin-dark flex items-center gap-2">
                      <UserPlus size={16} /> Connect
                    </button>
                  )}
                  <div className="relative">
                    <button onClick={() => setShowMoreMenu(!showMoreMenu)} className="border border-gray-500 text-gray-600 px-6 py-1.5 rounded-full font-semibold hover:bg-gray-100">More</button>
                    {showMoreMenu && (
                      <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20 w-56">
                        <button onClick={() => { navigator.clipboard.writeText(window.location.href); setShowMoreMenu(false); }} className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100">Copy profile link</button>
                        <button onClick={() => { sendConnectionRequest(user.id); setShowMoreMenu(false); }} className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100">Report / Block</button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* About Section */}
        {(isOwnProfile || user.about) && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">About</h2>
              {isOwnProfile && !isEditingAbout && (
                <button onClick={() => setIsEditingAbout(true)} className="p-2 hover:bg-gray-100 rounded-full">
                  <Pencil size={20} className="text-gray-500" />
                </button>
              )}
            </div>
            {isOwnProfile && isEditingAbout ? (
              <div>
                <textarea
                  value={aboutText}
                  onChange={(e) => setAboutText(e.target.value)}
                  className="w-full border border-gray-300 rounded p-2 min-h-[100px]"
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button onClick={() => setIsEditingAbout(false)} className="px-4 py-1 rounded-full hover:bg-gray-100 font-semibold text-gray-600">Cancel</button>
                  <button onClick={saveAbout} className="px-4 py-1 bg-xinkedin-blue text-white rounded-full font-semibold">Save</button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-800 whitespace-pre-line">{user.about}</p>
            )}
          </div>
        )}

        {/* Activity Section (own profile) */}
        {isOwnProfile && userPosts.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-semibold">Activity</h2>
                <p className="text-sm text-xinkedin-blue font-semibold">{state.currentUser.connections.length} followers</p>
              </div>
            </div>
            <div className="space-y-4">
              {userPosts.map(post => (
                <div key={post.id} className="border-b border-gray-100 pb-3 last:border-0">
                  <p className="text-sm text-gray-800 line-clamp-2">{post.content}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <span>{getTotalReactions(post.reactions)} reactions</span>
                    <span>{post.comments.length} comments</span>
                    <span>{formatDistanceToNow(new Date(post.created))} ago</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2 text-center border-t border-gray-100 pt-2">
              <button onClick={() => setShowAllActivity(!showAllActivity)} className="text-gray-600 font-semibold hover:bg-gray-100 w-full py-2 rounded">
                {showAllActivity ? 'Show less' : 'Show all activity'}
              </button>
            </div>
          </div>
        )}

        {/* Experience Section */}
        {(isOwnProfile || (user.experience && user.experience.length > 0)) && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Experience</h2>
              {isOwnProfile && (
                <div className="flex gap-2">
                  <button onClick={() => { setEditingExp(null); setShowExpModal(true); }} className="p-2 hover:bg-gray-100 rounded-full"><Plus size={24} className="text-gray-500" /></button>
                </div>
              )}
            </div>
            <div className="space-y-6">
              {(user.experience || []).map(exp => (
                <div key={exp.id} className="flex gap-4 group relative">
                  <img src={state.companies?.[exp.companyId]?.logo || `https://picsum.photos/50/50?random=exp${exp.id}`} className="w-12 h-12 object-contain rounded" alt="" />
                  <div className="flex-1 border-b border-gray-100 pb-4 last:border-0">
                    <h3 className="font-semibold text-base">{exp.title}</h3>
                    <p className="text-sm text-gray-800">{exp.company}</p>
                    <p className="text-sm text-gray-500">{exp.startDate} - {exp.endDate}</p>
                    {exp.location && <p className="text-sm text-gray-500 mt-1">{exp.location}</p>}
                    {exp.description && <p className="text-sm text-gray-800 mt-2">{exp.description}</p>}
                  </div>
                  {isOwnProfile && (
                    <div className="absolute top-0 right-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditingExp(exp); setShowExpModal(true); }} className="p-2 text-gray-400 hover:text-xinkedin-blue">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => deleteExperience(exp.id)} className="p-2 text-gray-400 hover:text-red-500">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education Section */}
        {(isOwnProfile || (user.education && user.education.length > 0)) && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Education</h2>
              {isOwnProfile && (
                <div className="flex gap-2">
                  <button onClick={() => { setEditingEdu(null); setShowEduModal(true); }} className="p-2 hover:bg-gray-100 rounded-full"><Plus size={24} className="text-gray-500" /></button>
                </div>
              )}
            </div>
            <div className="space-y-6">
              {(user.education || []).map(edu => (
                <div key={edu.id} className="flex gap-4 group relative">
                  <img src={`https://picsum.photos/50/50?random=edu${edu.id}`} className="w-12 h-12 object-contain rounded" alt="" />
                  <div className="flex-1 border-b border-gray-100 pb-4 last:border-0">
                    <h3 className="font-semibold text-base">{edu.school}</h3>
                    <p className="text-sm text-gray-800">{edu.degree}</p>
                    <p className="text-sm text-gray-500">{edu.year}</p>
                  </div>
                  {isOwnProfile && (
                    <div className="absolute top-0 right-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditingEdu(edu); setShowEduModal(true); }} className="p-2 text-gray-400 hover:text-xinkedin-blue">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => deleteEducation(edu.id)} className="p-2 text-gray-400 hover:text-red-500">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {(user.education || []).length === 0 && <p className="text-gray-500 text-sm">No education listed.</p>}
            </div>
          </div>
        )}

        {/* Skills Section */}
        {(isOwnProfile || (user.skills && user.skills.length > 0)) && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Skills</h2>
              {isOwnProfile && (
                <div className="flex gap-2">
                  <button onClick={() => setShowSkillModal(true)} className="p-2 hover:bg-gray-100 rounded-full"><Plus size={24} className="text-gray-500" /></button>
                </div>
              )}
            </div>
            <div className="space-y-4">
              {(showAllSkills ? (user.skills || []) : (user.skills || []).slice(0, 5)).map(skill => (
                <div key={skill.id} className="border-b border-gray-100 pb-3 last:border-0 flex justify-between items-start group">
                  <div>
                    <h3 className="font-semibold text-base hover:underline cursor-pointer">{skill.name}</h3>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                      <span>{skill.endorsements} endorsements</span>
                    </div>
                  </div>
                  {isOwnProfile && (
                    <button onClick={() => removeSkill(skill.id)} className="p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-2 text-center border-t border-gray-100 pt-2">
               <button onClick={() => setShowAllSkills(!showAllSkills)} className="text-gray-600 font-semibold hover:bg-gray-100 w-full py-2 rounded">
                 {showAllSkills ? 'Show fewer skills' : `Show all ${(user.skills || []).length} skills`}
               </button>
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar */}
      <div className="hidden md:block md:col-span-1 space-y-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-gray-600">Profile language</h3>
          </div>
          <p className="text-sm text-gray-500">English</p>

          <div className="border-t border-gray-200 my-4"></div>

          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-gray-600">Public profile & URL</h3>
          </div>
          <p className="text-sm text-gray-500 truncate">www.linkedin.com/in/{user.id}</p>
          {isOwnProfile && (
            <button
              onClick={() => { navigator.clipboard.writeText(`www.linkedin.com/in/${user.id}`); }}
              className="text-xs text-xinkedin-blue font-semibold mt-1 hover:underline cursor-pointer"
            >
              Copy link
            </button>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
           <h3 className="font-semibold text-base mb-3">People also viewed</h3>
           <div className="space-y-4">
             {peopleAlsoViewed.length > 0 ? peopleAlsoViewed.map(u => (
               <div key={u.id} className="flex gap-3">
                 <Link to={`/profile/${u.id}`}>
                   <img src={u.avatar} className="w-10 h-10 rounded-full" alt={u.name} />
                 </Link>
                 <div className="min-w-0">
                   <Link to={`/profile/${u.id}`} className="font-semibold text-sm hover:underline cursor-pointer block truncate">{u.name}</Link>
                   <p className="text-xs text-gray-500 line-clamp-2">{u.headline}</p>
                   <span className="text-xs text-gray-400">&#183; {getConnectionDegree(u.id, state.currentUser, state.users)}</span>
                   <button
                     onClick={() => sendConnectionRequest(u.id)}
                     className="mt-1 border border-gray-500 rounded-full px-3 py-0.5 text-xs font-semibold hover:bg-gray-100 text-gray-600 flex items-center gap-1"
                   >
                     <Plus size={12} /> Connect
                   </button>
                 </div>
               </div>
             )) : (
               <p className="text-sm text-gray-500">No suggestions available.</p>
             )}
           </div>
        </div>
      </div>

      {/* Modals (own profile only) */}
      {isOwnProfile && showExpModal && (
        <Modal title={editingExp ? 'Edit Experience' : 'Add Experience'} onClose={() => { setShowExpModal(false); setEditingExp(null); }}>
          <ExperienceForm
            onClose={() => { setShowExpModal(false); setEditingExp(null); }}
            onSave={handleSaveEditExp}
            initialData={editingExp ? { title: editingExp.title, company: editingExp.company, startDate: editingExp.startDate, endDate: editingExp.endDate, location: editingExp.location || '', description: editingExp.description || '' } : null}
          />
        </Modal>
      )}
      {isOwnProfile && showEduModal && (
        <Modal title={editingEdu ? 'Edit Education' : 'Add Education'} onClose={() => { setShowEduModal(false); setEditingEdu(null); }}>
          <EducationForm
            onClose={() => { setShowEduModal(false); setEditingEdu(null); }}
            onSave={handleSaveEditEdu}
            initialData={editingEdu ? { school: editingEdu.school, degree: editingEdu.degree, year: editingEdu.year || '' } : null}
          />
        </Modal>
      )}
      {isOwnProfile && showSkillModal && (
        <Modal title="Add Skill" onClose={() => setShowSkillModal(false)}>
          <SkillForm onClose={() => setShowSkillModal(false)} onSave={addSkill} />
        </Modal>
      )}
      {showContactInfo && (
        <Modal title="Contact info" onClose={() => setShowContactInfo(false)}>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-700">Profile URL</h4>
              <p className="text-sm text-xinkedin-blue hover:underline cursor-pointer">www.linkedin.com/in/{user.id}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-700">Location</h4>
              <p className="text-sm text-gray-600">{user.location || 'Not specified'}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-700">Connections</h4>
              <p className="text-sm text-gray-600">{user.connections?.length || 0} connections</p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
