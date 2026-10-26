import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, CheckCheck, AlertOctagon, AlertTriangle, Sparkles, CheckCircle2, Info, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { formatRelativeTime } from '@/lib/utils';
import { InAppNotification } from '@/types';

interface NotificationCenterProps {
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ onClose }) => {
  const { notifications, markNotificationRead, markAllNotificationsRead, setSelectedTicket, tickets } = useApp();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleNotificationClick = (notif: InAppNotification) => {
    markNotificationRead(notif.id);
    if (notif.ticketId) {
      const ticket = tickets.find(t => t.id === notif.ticketId);
      if (ticket) {
        setSelectedTicket(ticket);
        onClose();
      }
    }
  };

  const getIcon = (type: InAppNotification['type']) => {
    switch (type) {
      case 'critical': return <AlertOctagon className="w-4 h-4 text-rose-400" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'ai': return <Sparkles className="w-4 h-4 text-cyan-400" />;
      case 'success': return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      default: return <Info className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <motion.div
      ref={dropdownRef}
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl z-50 overflow-hidden text-slate-100"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-indigo-400" />
          <span className="font-semibold text-sm">Notifications</span>
          <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded-full font-bold">
            {notifications.filter(n => !n.read).length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={markAllNotificationsRead}
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            title="Mark all as read"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mark read</span>
          </button>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto divide-y divide-slate-800/50">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No notifications at this time
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleNotificationClick(notif)}
              className={`p-3.5 flex items-start gap-3 cursor-pointer hover:bg-slate-800/50 transition-colors ${
                !notif.read ? 'bg-indigo-950/20' : ''
              }`}
            >
              <div className="p-1.5 rounded-lg bg-slate-800 flex-shrink-0 mt-0.5">
                {getIcon(notif.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <p className="text-xs font-semibold text-white truncate">{notif.title}</p>
                  <span className="text-[10px] text-slate-400 flex-shrink-0">
                    {formatRelativeTime(notif.timestamp)}
                  </span>
                </div>
                <p className="text-xs text-slate-300 line-clamp-2">{notif.message}</p>
                {notif.ticketId && (
                  <span className="inline-block mt-1 text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-1.5 py-0.2 rounded border border-indigo-500/20">
                    {notif.ticketId}
                  </span>
                )}
              </div>
              {!notif.read && (
                <span className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
              )}
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
};
