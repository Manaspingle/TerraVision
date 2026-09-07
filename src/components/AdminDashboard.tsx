import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Users, 
  FileText, 
  CreditCard, 
  BookOpen, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Send
} from 'lucide-react';
import { UserProfile, Blog, Report, Subscription } from '../types';
import { 
  fetchUsersApi, 
  deleteUserApi, 
  fetchPendingAdminsApi, 
  approveAdminApi, 
  fetchReportsApi, 
  fetchSubscriptionsApi, 
  submitBlogApi 
} from '../api';

interface AdminDashboardProps {
  currentUser: UserProfile | null;
  blogs: Blog[];
  onRefreshBlogs: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  blogs,
  onRefreshBlogs
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'requests' | 'reports' | 'subscriptions' | 'library'>('users');
  const [users, setUsers] = useState<any[]>([]);
  const [pendingAdmins, setPendingAdmins] = useState<any[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [blogTitle, setBlogTitle] = useState("");
  const [blogCat, setBlogCat] = useState("Remote Sensing");
  const [blogContent, setBlogContent] = useState("");

  const loadData = async () => {
    try {
      const uRes = await fetchUsersApi();
      setUsers(uRes.users || []);

      const pRes = await fetchPendingAdminsApi();
      setPendingAdmins(pRes.pending_admins || []);

      const rRes = await fetchReportsApi();
      setReports(rRes.reports || []);

      const sRes = await fetchSubscriptionsApi();
      setSubscriptions(sRes.subscriptions || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteUser = async (email: string) => {
    if (confirm(`Are you sure you want to disable/delete user ${email}? This will issue account disabled alert.`)) {
      await deleteUserApi(email);
      loadData();
    }
  };

  const handleApproveAdmin = async (email: string, approve: boolean) => {
    await approveAdminApi(email, approve);
    loadData();
  };

  const handleCreateAdminBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitBlogApi({
      title: blogTitle,
      author: currentUser?.displayName || "Admin Developer",
      role: "Platform Admin",
      category: blogCat,
      content: blogContent
    });
    setBlogTitle("");
    setBlogContent("");
    onRefreshBlogs();
    alert("Educational Blog Published by Admin!");
  };

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* Admin Header */}
      <div className="glass-panel p-5 sm:p-6 border-amber-500/30 bg-gradient-to-r from-amber-950/20 via-slate-900 to-slate-900 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold uppercase mb-1">
            <ShieldAlert className="w-4 h-4" /> Developer & Admin Operations
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white">TerraVision Master Control Panel</h1>
          <p className="text-xs text-slate-400">
            Manage registered users, review requests, inspect reports, track subscriptions, and edit default libraries.
          </p>
        </div>

        {/* Tab Selector Responsive Scrollbar */}
        <div className="w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0">
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 w-max">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-3 py-2 text-xs font-bold rounded-lg flex items-center gap-1.5 ${
                activeTab === 'users' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" /> Users ({users.length})
            </button>

            <button
              onClick={() => setActiveTab('requests')}
              className={`px-3 py-2 text-xs font-bold rounded-lg flex items-center gap-1.5 ${
                activeTab === 'requests' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" /> Requests ({pendingAdmins.length})
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`px-3 py-2 text-xs font-bold rounded-lg flex items-center gap-1.5 ${
                activeTab === 'reports' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> Reports ({reports.length})
            </button>

            <button
              onClick={() => setActiveTab('subscriptions')}
              className={`px-3 py-2 text-xs font-bold rounded-lg flex items-center gap-1.5 ${
                activeTab === 'subscriptions' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" /> Subscriptions ({subscriptions.length})
            </button>

            <button
              onClick={() => setActiveTab('library')}
              className={`px-3 py-2 text-xs font-bold rounded-lg flex items-center gap-1.5 ${
                activeTab === 'library' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" /> Edit Library
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: Registered Users & Delete User */}
      {activeTab === 'users' && (
        <div className="glass-panel p-4 sm:p-6 border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h3 className="text-base sm:text-lg font-bold text-white">Registered Platform Users</h3>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search email or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full text-left text-xs text-slate-300 min-w-[600px]">
              <thead className="bg-slate-900 text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Registered At</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredUsers.map((u) => (
                  <tr key={u.email} className="hover:bg-slate-900/60">
                    <td className="p-3 font-bold text-white">{u.displayName || 'User'}</td>
                    <td className="p-3 font-mono">{u.email}</td>
                    <td className="p-3 capitalize">{u.role}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                        u.status === 'disabled' ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400 font-mono">{u.createdAt}</td>
                    <td className="p-3 text-right">
                      {u.role !== 'admin' && u.status !== 'disabled' && (
                        <button
                          onClick={() => handleDeleteUser(u.email)}
                          className="px-2.5 py-1 bg-red-950 hover:bg-red-900 text-red-400 border border-red-800 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1 ml-auto"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Disable / Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Pending Admin Signup Requests */}
      {activeTab === 'requests' && (
        <div className="glass-panel p-4 sm:p-6 border-slate-800 space-y-4">
          <h3 className="text-base sm:text-lg font-bold text-white">Pending Admin Registration Requests</h3>
          {pendingAdmins.length === 0 ? (
            <p className="text-xs text-slate-500 py-8 text-center">No pending admin registration requests.</p>
          ) : (
            <div className="space-y-4">
              {pendingAdmins.map((p) => (
                <div key={p.email} className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-white">{p.displayName}</h4>
                    <p className="text-xs text-slate-400 font-mono">{p.email}</p>
                    <p className="text-[10px] text-amber-400 mt-1">Status: Pending Developer Approval</p>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => handleApproveAdmin(p.email, true)}
                      className="flex-1 sm:flex-initial px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Approve
                    </button>
                    <button
                      onClick={() => handleApproveAdmin(p.email, false)}
                      className="flex-1 sm:flex-initial px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: User Generated Reports Inspector */}
      {activeTab === 'reports' && (
        <div className="glass-panel p-4 sm:p-6 border-slate-800 space-y-4">
          <h3 className="text-base sm:text-lg font-bold text-white">User Generated Reports</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reports.map((r) => (
              <div key={r.id} className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-bold text-cyan-300">{r.title}</h4>
                  <span className="text-[10px] font-mono text-slate-400">{r.createdAt}</span>
                </div>
                <p className="text-xs text-slate-300">Generated by: {r.userName} ({r.userEmail})</p>
                <div className="text-[11px] text-slate-400">
                  Operations included: {r.operations?.length || 0} stages
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Subscriptions Tracker */}
      {activeTab === 'subscriptions' && (
        <div className="glass-panel p-4 sm:p-6 border-slate-800 space-y-4">
          <h3 className="text-base sm:text-lg font-bold text-white">Purchased Subscriptions Tracker</h3>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full text-left text-xs text-slate-300 min-w-[600px]">
              <thead className="bg-slate-900 text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-3">Subscriber</th>
                  <th className="p-3">Plan Name</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Payment TxID</th>
                  <th className="p-3">Purchase Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {subscriptions.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-900/60">
                    <td className="p-3 font-bold text-white">{s.userName} ({s.userEmail})</td>
                    <td className="p-3 text-amber-400 font-bold">{s.plan}</td>
                    <td className="p-3 font-mono font-bold text-emerald-400">{s.amount}</td>
                    <td className="p-3 font-mono text-slate-400">{s.paymentId}</td>
                    <td className="p-3 font-mono">{s.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: Edit Library & Admin Blog Publisher */}
      {activeTab === 'library' && (
        <div className="glass-panel p-4 sm:p-6 border-slate-800 space-y-6">
          <h3 className="text-base sm:text-lg font-bold text-white">Edit Default Library & Publish Admin Blogs</h3>
          <form onSubmit={handleCreateAdminBlog} className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Educational Blog Title</label>
              <input
                type="text"
                required
                value={blogTitle}
                onChange={(e) => setBlogTitle(e.target.value)}
                placeholder="e.g. Advanced Multispectral Analysis in TerraVision"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
              <select
                value={blogCat}
                onChange={(e) => setBlogCat(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
              >
                <option value="Remote Sensing">Remote Sensing</option>
                <option value="Image Enhancement">Image Enhancement</option>
                <option value="Segmentation">Segmentation</option>
                <option value="Feature Extraction">Feature Extraction</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Article Content</label>
              <textarea
                required
                rows={5}
                value={blogContent}
                onChange={(e) => setBlogContent(e.target.value)}
                placeholder="Educate users on satellite digital image processing techniques..."
                className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" /> Publish Admin Educational Blog
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
