import React, { useState } from 'react';
import { Bell, Crown, User, ShieldAlert, LogOut, BookOpen, Layers, Star, Menu, X, KeyRound } from 'lucide-react';
import { UserProfile } from '../types';
import { Logo } from './Logo';

interface NavbarProps {
  user: UserProfile | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAuth: (role: 'student' | 'admin' | 'master_admin', mode: 'login' | 'signup') => void;
  onLogout: () => void;
  onOpenNotifications: () => void;
  onOpenSubscription: () => void;
  unreadNotifsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  setActiveTab,
  onOpenAuth,
  onLogout,
  onOpenNotifications,
  onOpenSubscription,
  unreadNotifsCount
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (tab: string) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  const isMasterDev = user?.role === 'master_admin' || user?.email === 'manaspingle.dev@gmail.com';

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* TerraVision Brand Logo */}
        <div 
          onClick={() => handleNavClick('landing')}
          className="cursor-pointer group"
        >
          <Logo size="md" />
        </div>

        {/* LOGGED-IN DESKTOP NAVIGATION TABS */}
        {user ? (
          <nav className="hidden lg:flex items-center gap-1 bg-slate-900/90 border border-slate-800/90 p-1 rounded-2xl">
            <button
              onClick={() => handleNavClick('landing')}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
                activeTab === 'landing' ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Overview
            </button>
            
            <button
              onClick={() => handleNavClick('studio')}
              className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all ${
                activeTab === 'studio' ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> Studio Workspace
            </button>

            <button
              onClick={() => handleNavClick('blogs')}
              className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all ${
                activeTab === 'blogs' ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" /> Educational Blogs
            </button>

            <button
              onClick={() => handleNavClick('reviews')}
              className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all ${
                activeTab === 'reviews' ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Star className="w-3.5 h-3.5 text-amber-400" /> Platform Reviews
            </button>

            {user.role === 'admin' && (
              <button
                onClick={() => handleNavClick('admin')}
                className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all ${
                  activeTab === 'admin' ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30' : 'text-amber-400 hover:bg-amber-950/40'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" /> Admin Portal
              </button>
            )}

            {isMasterDev && (
              <button
                onClick={() => handleNavClick('master_admin')}
                className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all ${
                  activeTab === 'master_admin' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30' : 'text-purple-300 hover:bg-purple-950/40'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" /> Master Admin
              </button>
            )}
          </nav>
        ) : null}

        {/* RIGHT ACTION CONTROLS */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Pro Subscription Plan Badge */}
              <button
                onClick={onOpenSubscription}
                className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold rounded-xl hover:bg-amber-500/30 transition-all shadow-sm"
              >
                <Crown className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="hidden sm:inline">{user.isPro ? 'Pro Active' : 'Upgrade Pro'}</span>
              </button>

              {/* Retention & Alert Notifications Drawer */}
              <button
                onClick={onOpenNotifications}
                className="relative p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 transition-all"
                title="Retention & Platform Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-500 text-[10px] font-bold text-slate-950 animate-pulse">
                    {unreadNotifsCount}
                  </span>
                )}
              </button>

              {/* User Profile & Sign Out */}
              <div className="hidden sm:flex items-center gap-3 pl-2 border-l border-slate-800">
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-200">{user.displayName}</div>
                  <div className="text-[10px] text-cyan-400 capitalize flex items-center justify-end gap-1">
                    {isMasterDev ? <KeyRound className="w-3 h-3 text-purple-400" /> : user.role === 'admin' ? <ShieldAlert className="w-3 h-3 text-amber-400" /> : <User className="w-3 h-3" />}
                    {isMasterDev ? 'Master Admin' : user.role}
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl border border-red-500/20 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 hover:text-white"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </>
          ) : (
            /* LOGGED-OUT NAVBAR: NO MASTER ADMIN BUTTON IN NAVBAR AS REQUESTED */
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => onOpenAuth('student', 'login')}
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-cyan-600/30 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Sign In / Sign Up
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MOBILE EXPANDABLE MENU DRAWER */}
      {mobileMenuOpen && user && (
        <div className="lg:hidden mt-3 p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
          <button
            onClick={() => handleNavClick('landing')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold ${
              activeTab === 'landing' ? 'bg-cyan-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            Overview
          </button>

          <button
            onClick={() => handleNavClick('studio')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
              activeTab === 'studio' ? 'bg-cyan-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" /> Studio Workspace
          </button>

          <button
            onClick={() => handleNavClick('blogs')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
              activeTab === 'blogs' ? 'bg-cyan-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" /> Educational Blogs
          </button>

          <button
            onClick={() => handleNavClick('reviews')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
              activeTab === 'reviews' ? 'bg-cyan-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Star className="w-4 h-4 text-amber-400" /> Platform Reviews
          </button>

          {isMasterDev && (
            <button
              onClick={() => handleNavClick('master_admin')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
                activeTab === 'master_admin' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white' : 'text-purple-300 hover:bg-purple-950/40'
              }`}
            >
              <KeyRound className="w-4 h-4 text-purple-400" /> Master Admin Gateway
            </button>
          )}

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between px-2">
            <span className="text-xs font-bold text-slate-300">{user.displayName}</span>
            <button
              onClick={onLogout}
              className="px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-xs font-bold"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
