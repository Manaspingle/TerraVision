import React from 'react';
import { X, Bell, Sparkles, ShieldAlert, AlertTriangle } from 'lucide-react';
import { NotificationItem } from '../types';

interface NotificationsProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
}

export const RetentionNotificationsModal: React.FC<NotificationsProps> = ({
  isOpen,
  onClose,
  notifications
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg glass-panel p-6 border-slate-800">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-cyan-950 border border-cyan-800 rounded-xl text-cyan-400">
            <Bell className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Platform & Retention Alerts</h3>
            <p className="text-xs text-slate-400">Stay engaged with satellite DIP updates.</p>
          </div>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {notifications.length > 0 ? (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`p-4 rounded-xl border text-xs space-y-1.5 transition-all ${
                  n.type === 'account_disabled'
                    ? 'bg-red-950/60 border-red-800 text-red-200'
                    : n.type === 'admin_approval_request'
                    ? 'bg-amber-950/60 border-amber-800 text-amber-200'
                    : 'bg-slate-900 border-slate-800 text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center gap-1.5">
                    {n.type === 'account_disabled' ? (
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                    ) : n.type === 'admin_approval_request' ? (
                      <ShieldAlert className="w-4 h-4 text-amber-400" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                    )}
                    {n.title}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">{n.timestamp}</span>
                </div>
                <p className="text-slate-300 leading-relaxed">{n.message}</p>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-500 text-xs">
              No notifications at this moment.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
