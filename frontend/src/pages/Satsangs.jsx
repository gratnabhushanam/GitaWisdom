import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Users, Plus, MessageCircle, Heart, Search, ChevronRight, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Satsangs() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeGroupId, setActiveGroupId] = useState(null);
  const [activeGroupPosts, setActiveGroupPosts] = useState([]);
  const [postContent, setPostContent] = useState('');
  const [newGroupForm, setNewGroupForm] = useState({ name: '', description: '', category: 'General' });

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const { data } = await axios.get('/api/forums/groups');
      setGroups(data);
      if (data.length > 0 && !activeGroupId) {
        setActiveGroupId(data[0]._id);
      }
    } catch (error) {
      console.error('Failed to fetch groups', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeGroupId) fetchPosts(activeGroupId);
  }, [activeGroupId]);

  const fetchPosts = async (groupId) => {
    try {
      const { data } = await axios.get(`/api/forums/groups/${groupId}/posts`);
      setActiveGroupPosts(data);
    } catch (error) {
      console.error('Failed to fetch posts', error);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.post('/api/forums/groups', newGroupForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGroups([data, ...groups]);
      setShowCreateModal(false);
      setActiveGroupId(data._id);
      setNewGroupForm({ name: '', description: '', category: 'General' });
    } catch (error) {
      alert('Failed to create group');
    }
  };

  const handleDeleteGroup = async (e, groupId) => {
    e.stopPropagation(); // prevent setting active group id
    if (!window.confirm('Are you sure you want to delete this community?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/forums/groups/${groupId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGroups(groups.filter(g => g._id !== groupId));
      if (activeGroupId === groupId) {
        setActiveGroupId(groups.find(g => g._id !== groupId)?._id || null);
      }
    } catch (error) {
      alert('Failed to delete group');
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postContent.trim() || !activeGroupId) return;
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.post(`/api/forums/groups/${activeGroupId}/posts`, {
        content: postContent
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setActiveGroupPosts([data, ...activeGroupPosts]);
      setPostContent('');
    } catch (error) {
      alert('Failed to post');
    }
  };

  const handleLike = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.patch(`/api/forums/posts/${postId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setActiveGroupPosts((prev) => prev.map((p) => p._id === postId ? data : p));
    } catch (error) {
      alert('Must be logged in to like');
    }
  };

  const activeGroup = groups.find(g => g._id === activeGroupId);

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase();
  };

  return (
    <div className="min-h-screen pt-28 pb-12 px-4 relative bg-[#06101E] text-white">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(255,215,0,0.08),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(122,46,46,0.2),transparent_28%)]"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-10 text-center">
            <h1 className="text-4xl md:text-5xl font-black font-serif text-devotion-gold tracking-tight mb-4">Satsangs</h1>
            <p className="text-gray-400 font-medium max-w-2xl mx-auto">Join spiritual communities, ask deep questions, and share your wisdom with fellow seekers on the path.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar / Groups List */}
          <div className="lg:col-span-1 border-r border-white/10 pr-0 lg:pr-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold uppercase tracking-widest text-xs text-gray-400">Communities</h3>
              {user && (
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="bg-devotion-gold/10 text-devotion-gold hover:bg-devotion-gold/20 p-2 rounded-full transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>

            {loading ? (
              <div className="animate-pulse space-y-4">
                {[1,2,3].map(i => <div key={i} className="h-16 bg-white/5 rounded-xl"></div>)}
              </div>
            ) : groups.length === 0 ? (
              <div className="text-center p-6 border border-dashed border-white/10 rounded-2xl bg-white/5">
                <Users className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-400">No communities yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {groups.map(group => (
                  <button
                    key={group._id}
                    onClick={() => setActiveGroupId(group._id)}
                    className={`w-full text-left p-4 rounded-2xl transition-all border ${activeGroupId === group._id ? 'bg-gradient-to-r from-devotion-gold/20 to-devotion-gold/5 border-devotion-gold/50 shadow-lg' : 'bg-white/5 border-transparent hover:bg-white/10'}`}
                  >
                     <h4 className={`font-bold ${activeGroupId === group._id ? 'text-devotion-gold' : 'text-white'}`}>{group.name}</h4>
                     <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">{group.category}</p>
                     {user?.role === 'admin' && (
                        <button
                          onClick={(e) => handleDeleteGroup(e, group._id)}
                          className="mt-3 inline-flex items-center gap-1.5 text-[10px] text-red-400 hover:text-red-300 uppercase font-black tracking-widest bg-red-400/10 px-2 py-1 rounded-md transition-colors"
                        >
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                     )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-3">
            {activeGroup ? (
               <div>
                  <div className="bg-glass-gradient border border-devotion-gold/20 rounded-3xl p-6 md:p-8 mb-8 backdrop-blur-md">
                     <h2 className="text-3xl font-black text-white mb-2">{activeGroup.name}</h2>
                     <p className="text-gray-300 font-medium max-w-3xl">{activeGroup.description}</p>
                  </div>

                  {user ? (
                    <form onSubmit={handleCreatePost} className="mb-8 relative">
                      <textarea
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                        placeholder="Share a thought, ask a question, or reflect on a sloka..."
                        className="w-full bg-white/5 border-2 border-white/10 rounded-2xl p-6 text-white placeholder:text-gray-500 focus:border-devotion-gold/50 transition-colors focus:outline-none min-h-[120px]"
                      />
                      <button 
                        type="submit"
                        disabled={!postContent.trim()}
                        className="absolute bottom-4 right-4 bg-devotion-gold text-devotion-darkBlue px-6 py-2 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-yellow-400 transition-colors disabled:opacity-50"
                      >
                        Post
                      </button>
                    </form>
                  ) : (
                    <div className="mb-8 p-6 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-center">
                      <p className="text-blue-200 text-sm font-medium">Please <button onClick={() => navigate('/login')} className="text-devotion-gold underline">log in</button> to participate in the Satsang.</p>
                    </div>
                  )}

                  <div className="space-y-6">
                     {activeGroupPosts.length === 0 ? (
                       <div className="text-center py-12 text-gray-500">
                         <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-30" />
                         <p>No discussions in this Satsang yet. Be the first!</p>
                       </div>
                     ) : (
                       activeGroupPosts.map(post => (
                         <div key={post._id} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all">
                            <div className="flex items-center gap-3 mb-4">
                               {post.authorImage ? (
                                 <img src={post.authorImage} alt="User" className="w-10 h-10 rounded-full object-cover border border-devotion-gold/30" />
                               ) : (
                                 <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center font-bold text-xs uppercase text-white border border-gray-600">
                                   {getInitials(post.authorName)}
                                 </div>
                               )}
                               <div>
                                 <p className="font-bold text-white text-sm">{post.authorName}</p>
                                 <p className="text-[10px] text-gray-500 uppercase tracking-widest">{new Date(post.createdAt).toLocaleDateString()}</p>
                               </div>
                            </div>
                            
                            <p className="text-gray-200 mb-6 whitespace-pre-wrap">{post.content}</p>
                            
                            <div className="flex items-center gap-6 pt-4 border-t border-white/10">
                               <button 
                                 onClick={() => handleLike(post._id)}
                                 className={`flex items-center gap-2 text-xs font-bold transition-colors ${post.likes?.includes(user?.id || user?._id) ? 'text-red-400' : 'text-gray-400 hover:text-red-400'}`}
                               >
                                  <Heart className={`w-4 h-4 ${post.likes?.includes(user?.id || user?._id) ? 'fill-current' : ''}`} /> 
                                  {post.likes?.length || 0}
                               </button>
                               <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                                  <MessageCircle className="w-4 h-4" />
                                  {post.comments?.length || 0}
                               </div>
                            </div>
                         </div>
                       ))
                     )}
                  </div>
               </div>
            ) : (
               <div className="h-96 flex items-center justify-center border-2 border-dashed border-white/10 rounded-3xl">
                  <p className="text-gray-500 font-medium">Select a community from the sidebar to view discussions.</p>
               </div>
            )}
          </div>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
           <div className="bg-[#081426] border border-devotion-gold/30 rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
              <button 
                onClick={() => setShowCreateModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                 <ChevronRight className="w-6 h-6 rotate-180" />
              </button>
              <h3 className="text-2xl font-bold font-serif text-white mb-6">Create Satsang</h3>
              <form onSubmit={handleCreateGroup} className="space-y-4">
                 <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-devotion-gold mb-2 block">Community Name</label>
                    <input 
                      required
                      value={newGroupForm.name}
                      onChange={e => setNewGroupForm({...newGroupForm, name: e.target.value})}
                      className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-devotion-gold focus:outline-none"
                      placeholder="e.g. Chapter 2 Seekers"
                    />
                 </div>
                 <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-devotion-gold mb-2 block">Description</label>
                    <textarea 
                      required
                      value={newGroupForm.description}
                      onChange={e => setNewGroupForm({...newGroupForm, description: e.target.value})}
                      className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-devotion-gold focus:outline-none min-h-[100px]"
                      placeholder="What is the purpose of this community?"
                    />
                 </div>
                 <button type="submit" className="w-full bg-devotion-gold text-black font-black uppercase tracking-widest text-xs py-4 rounded-xl hover:bg-yellow-400 transition-colors mt-4">
                    Create Community
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
