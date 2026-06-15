"use client";
import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { ShieldCheck, CheckCircle2, User, Mail, Lock, Loader2, AlertTriangle } from 'lucide-react';

export default function ProfileTab() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [relayId, setRelayId] = useState('');
  
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', password: ''
  });

  useEffect(() => {
    if (session?.user?.token) fetchUserData();
  }, [session]);

  const fetchUserData = async () => {
    try {
      const res = await fetch(`https://admin.fsan.com/graphql`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.user.token}` },
        body: JSON.stringify({ query: `query GetViewer { viewer { id firstName lastName email } }` }),
        cache: 'no-store' 
      });
      const json = await res.json();
      if (json?.data?.viewer) {
        setRelayId(json.data.viewer.id);
        setFormData({
          firstName: json.data.viewer.firstName || '',
          lastName: json.data.viewer.lastName || '',
          email: json.data.viewer.email || '',
          password: ''
        });
      }
    } catch (error) {
      console.warn("Could not fetch user profile details.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateAccount = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: '', text: '' });

    let mutationVars = `id: "${relayId}", firstName: "${formData.firstName}", lastName: "${formData.lastName}", email: "${formData.email}"`;
    if (formData.password) mutationVars += `, password: "${formData.password}"`;

    const query = `mutation UpdateAccount { updateUser(input: { ${mutationVars} }) { user { id } } }`;

    try {
      const res = await fetch('https://admin.fsan.com/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.user.token}` },
        body: JSON.stringify({ query }),
        cache: 'no-store'
      });
      const json = await res.json();
      if (json.errors) setMessage({ type: 'error', text: json.errors[0].message });
      else {
        setMessage({ type: 'success', text: 'Account updated successfully!' });
        setFormData({ ...formData, password: '' }); 
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    setIsDeleting(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch('https://admin.fsan.com/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.user.token}` },
        body: JSON.stringify({ query: `mutation DeleteSelf { deleteSelf(input: { confirm: true }) { deleted } }` }),
      });
      const json = await res.json();
      if (json.errors) {
        setMessage({ type: 'error', text: json.errors[0].message });
        setIsDeleting(false);
        setShowDeleteConfirm(false);
      } else {
        signOut({ callbackUrl: '/home' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred while deleting.' });
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (isLoading) return <div className="py-20 flex justify-center"><Loader2 size={32} className="animate-spin text-red-600" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative z-10">
      <h2 className="text-2xl font-black text-white uppercase tracking-wide mb-6 flex items-center gap-2">
        <ShieldCheck className="text-gray-400" /> Security & Profile
      </h2>

      {message.text && (
        <div className={`mb-6 p-4 border rounded-xl text-sm font-bold flex items-center gap-3 ${message.type === 'error' ? 'bg-red-900/30 border-red-900 text-red-400' : 'bg-green-900/30 border-green-900 text-green-400'}`}>
          {message.type === 'success' && <CheckCircle2 size={18} />}
          {message.text}
        </div>
      )}
      
      <div className="w-full space-y-6">
        <form onSubmit={handleUpdateAccount} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="relative">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 pl-1">First Name</label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="text" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} className="w-full bg-[#1a1a1a] border border-gray-800 rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-gray-400 transition-colors text-sm text-white" />
              </div>
            </div>
            <div className="relative">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 pl-1">Last Name</label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="text" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} className="w-full bg-[#1a1a1a] border border-gray-800 rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-gray-400 transition-colors text-sm text-white" />
              </div>
            </div>
          </div>
          <div className="relative">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 pl-1">Email Address</label>
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required className="w-full bg-[#1a1a1a] border border-gray-800 rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-gray-400 transition-colors text-sm text-white" />
            </div>
          </div>
          <div className="relative">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 pl-1">Change Password <span className="text-gray-600 lowercase tracking-normal font-normal">(Leave blank to keep current)</span></label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input type="password" placeholder="Enter a new password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full bg-[#1a1a1a] border border-gray-800 rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-gray-400 transition-colors text-sm text-white placeholder-gray-600" />
            </div>
          </div>
          <div className="mt-4 pt-6 border-t border-gray-800 flex justify-end">
            <button type="submit" disabled={isSaving} className="w-full md:w-auto px-8 bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-500 hover:to-gray-700 border border-gray-600 text-white font-black uppercase tracking-widest py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-lg disabled:opacity-50">
              {isSaving ? <><Loader2 size={18} className="animate-spin" /> Saving...</> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-12 pt-8 border-t border-gray-800">
        <h3 className="text-lg font-bold flex items-center gap-2 text-white mb-2">
          <AlertTriangle className="text-gray-500" size={20} /> Delete Account
        </h3>
        <p className="text-sm text-gray-400 mb-6">
          Once you delete your account, your profile and subscription history will be permanently erased. This action cannot be undone.
        </p>
        {!showDeleteConfirm ? (
          <button type="button" onClick={() => setShowDeleteConfirm(true)} className="px-6 py-3 bg-[#111] border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white text-sm font-bold uppercase tracking-widest rounded-xl transition-colors shadow-inner">
            Delete My Account
          </button>
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#1a1a1a] p-4 rounded-xl border border-gray-700 shadow-inner">
            <span className="text-sm font-bold text-gray-300 flex-1 text-center sm:text-left">Are you absolutely sure?</span>
            <div className="flex gap-3 w-full sm:w-auto">
              <button type="button" onClick={() => setShowDeleteConfirm(false)} disabled={isDeleting} className="flex-1 sm:flex-none px-6 py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white text-xs font-bold uppercase tracking-widest rounded-lg transition-colors">
                Cancel
              </button>
              <button type="button" onClick={handleDeleteAccount} disabled={isDeleting} className="flex-1 sm:flex-none px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 border border-red-500 text-white text-xs font-bold uppercase tracking-widest rounded-lg transition-colors flex items-center justify-center gap-2">
                {isDeleting ? <Loader2 size={14} className="animate-spin" /> : 'Yes, Delete Everything'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}