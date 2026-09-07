import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck,
  CheckCircle2, 
  XCircle, 
  UserCheck, 
  Clock, 
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Lock,
  RotateCcw,
  User,
  Mail,
  Fingerprint
} from 'lucide-react';
import { UserProfile } from '../types';
import { 
  fetchPendingAdminsApi, 
  approveAdminApi, 
  fetchUsersApi, 
  fetchApprovedAdminsApi, 
  revertAdminApi 
} from '../api';

interface MasterAdminProps {
  currentUser: UserProfile | null;
}

export const MasterAdminDashboard: React.FC<MasterAdminProps> = ({ currentUser }) => {
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [approvedAdmins, setApprovedAdmins] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const res = await fetchPendingAdminsApi();
      setPendingRequests(res.pending_admins || []);

      const approvedRes = await fetchApprovedAdminsApi();
      setApprovedAdmins(approvedRes.approved_admins || []);

      const usersRes = await fetchUsersApi();
      setAllUsers(usersRes.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleApprove = async (email: string) => {
    setActionSuccessMsg(null);
    setLoading(true);
    try {
      await approveAdminApi(email, true);
      setActionSuccessMsg(`✅ Admin privileges APPROVED for ${email}. Account is now Active Admin.`);
      await loadRequests();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDisapprove = async (email: string) => {
    setActionSuccessMsg(null);
    setLoading(true);
    try {
      await approveAdminApi(email, false);
      setActionSuccessMsg(`❌ Admin registration DISAPPROVED for ${email}. Access request rejected.`);
      await loadRequests();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRevert = async (email: string) => {
    setActionSuccessMsg(null);
    setLoading(true);
    try {
      await revertAdminApi(email);
      setActionSuccessMsg(`🔄 Admin privileges REVERTED for ${email}. Account status moved back to Pending Requests queue.`);
      await loadRequests();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Master Admin Header */}
      <div className="glass-panel p-6 sm:p-8 border-amber-500/40 bg-gradient-to-r from-amber-950/30 via-slate-900 to-slate-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-950 border border-amber-800 rounded-full text-xs font-mono font-bold text-amber-400">
            <Lock className="w-3.5 h-3.5" /> Master Admin Authorization Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Developer Admin Control Gateway</h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            Logged in as Master Admin <span className="text-amber-400 font-mono font-bold">manaspingle.dev@gmail.com</span>. Manage, approve, reject, or revert admin accounts.
          </p>
        </div>

        <button
          onClick={loadRequests}
          disabled={loading}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-xs font-bold text-slate-300 rounded-xl flex items-center gap-2 transition-colors shrink-0"
        >
          <RefreshCw className={`w-4 h-4 text-amber-400 ${loading ? 'animate-spin' : ''}`} />
          Refresh Dashboard
        </button>
      </div>

      {actionSuccessMsg && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-800 text-emerald-300 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* 1. PENDING ADMIN REQUESTS QUEUE */}
      <div className="glass-panel p-6 sm:p-8 border-slate-800 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            Pending Admin Registrations ({pendingRequests.length})
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {pendingRequests.length} Waiting Authorization
          </span>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="text-center py-10 space-y-3">
            <UserCheck className="w-12 h-12 text-slate-600 mx-auto" />
            <h4 className="text-base font-bold text-slate-300">No Pending Admin Registration Requests</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              All admin access requests have been reviewed. When a new user registers as an admin, their request will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map((req) => (
              <div
                key={req.email}
                className="p-5 sm:p-6 bg-slate-900/90 rounded-2xl border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-amber-950 text-amber-400 border border-amber-800 rounded-md text-[10px] font-bold uppercase tracking-wider">
                      Admin Access Applicant
                    </span>
                    <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" /> {req.createdAt || 'Just now'}
                    </span>
                  </div>

                  <h4 className="text-lg font-bold text-white">{req.displayName || 'Unnamed Applicant'}</h4>
                  <p className="text-xs text-cyan-300 font-mono">{req.email}</p>
                </div>

                {/* APPROVE / DISAPPROVE ACTIONS */}
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <button
                    onClick={() => handleApprove(req.email)}
                    disabled={loading}
                    className="flex-1 md:flex-initial px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Approve Admin
                  </button>

                  <button
                    onClick={() => handleDisapprove(req.email)}
                    disabled={loading}
                    className="flex-1 md:flex-initial px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 transition-all"
                  >
                    <XCircle className="w-4 h-4" /> Disapprove / Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. APPROVED ACTIVE ADMINS DETAILS & REVERT SECTION */}
      <div className="glass-panel p-6 sm:p-8 border-slate-800 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            Approved Active Admins Details ({approvedAdmins.length})
          </h3>
          <span className="text-xs text-emerald-400 font-mono font-semibold">
            {approvedAdmins.length} Active Privilege Granted
          </span>
        </div>

        {approvedAdmins.length === 0 ? (
          <div className="text-center py-10 space-y-3">
            <UserCheck className="w-12 h-12 text-slate-600 mx-auto" />
            <h4 className="text-base font-bold text-slate-300">No Approved Admins Currently Active</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              When you approve admin registration requests, their detailed profile cards will be listed here with options to revert authorization.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {approvedAdmins.map((admin) => (
              <div
                key={admin.email}
                className="p-5 sm:p-6 bg-slate-900/90 rounded-2xl border border-slate-800 hover:border-emerald-500/40 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Approved Active Admin
                    </span>
                    <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" /> Member since: {admin.createdAt || 'N/A'}
                    </span>
                  </div>

                  {/* ADMIN DETAILS DISPLAY */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <User className="w-3 h-3 text-cyan-400" /> Display Name
                      </span>
                      <p className="text-xs font-bold text-white mt-0.5 truncate">{admin.displayName || 'Admin'}</p>
                    </div>

                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Mail className="w-3 h-3 text-cyan-400" /> Registered Email
                      </span>
                      <p className="text-xs font-mono font-semibold text-cyan-300 mt-0.5 truncate">{admin.email}</p>
                    </div>

                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Fingerprint className="w-3 h-3 text-cyan-400" /> Account UID
                      </span>
                      <p className="text-[11px] font-mono text-slate-300 mt-0.5 truncate">{admin.uid || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* REVERT APPROVAL ACTION BUTTON */}
                <div className="shrink-0 w-full md:w-auto">
                  <button
                    onClick={() => handleRevert(admin.email)}
                    disabled={loading}
                    className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-600/20 transition-all"
                  >
                    <RotateCcw className="w-4 h-4" /> Revert Approval
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. REGISTERED ACCOUNTS OVERVIEW */}
      <div className="glass-panel p-6 border-slate-800 space-y-4">
        <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Registered Accounts Overview</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-center">
            <div className="text-2xl font-extrabold text-white">{allUsers.length}</div>
            <div className="text-xs text-slate-400 mt-1">Total System Users</div>
          </div>

          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-center">
            <div className="text-2xl font-extrabold text-emerald-400">{approvedAdmins.length}</div>
            <div className="text-xs text-slate-400 mt-1">Approved Active Admins</div>
          </div>

          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-center">
            <div className="text-2xl font-extrabold text-amber-400">{pendingRequests.length}</div>
            <div className="text-xs text-slate-400 mt-1">Pending Approval Queue</div>
          </div>
        </div>
      </div>
    </div>
  );
};

