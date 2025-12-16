import React, { useState } from 'react';
import { User, Notification } from '../types';

interface HeaderProps {
    user: User;
    notifications: Notification[];
    onClearNotifications: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, notifications, onClearNotifications }) => {
  const [showNotifs, setShowNotifs] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className="flex items-center justify-between p-5 pt-8 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div
            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 ring-2 ring-primary/50"
            style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAT03pNCv9ZwChpYTLj_5VuX3XrImTjDLs7TOS2X6ej8eDOrvoYQXAH7BsHlqfrK7v2Rf89sbKz6RJ_HfhjWfHpE_gwXUmZVw758dL_7obHIhZfQQVfuTkeXIz0WZ_OXsLfG-HFMYwpxSHH5P_W6N1Xy-3Fb8oAdkZ4AKEv2HMn61G551SDqc70th7lpXgmbj9L1B20mo5GYyu9r_XMYp8_mijX9vO3WH1eYsNqpfkLEH8nfjVR-syfCGfrpsdYtwxIumFWlKBomnC_")' }}
          ></div>
          <div className="absolute bottom-0 right-0 size-3 bg-primary rounded-full border-2 border-background-dark"></div>
        </div>
        <div>
          <h2 className="text-sm text-gray-500 dark:text-gray-400 font-medium">Hola,</h2>
          <h1 className="text-lg font-bold leading-none">{user.name.split(' ')[0]}</h1>
        </div>
      </div>
      
      <div className="relative">
          <button 
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative flex items-center justify-center size-10 rounded-full bg-white dark:bg-surface-dark border border-gray-200 dark:border-card-border text-gray-600 dark:text-gray-300 hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            {unreadCount > 0 && <span className="absolute top-2 right-2.5 size-2 bg-red-500 rounded-full animate-pulse"></span>}
          </button>

          {/* Notifications Dropdown */}
          {showNotifs && (
            <>
                <div className="fixed inset-0 z-30" onClick={() => setShowNotifs(false)}></div>
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#1A2C20] rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 z-40 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-white/5">
                        <h3 className="font-bold text-gray-900 dark:text-white">Notificaciones</h3>
                        {notifications.length > 0 && (
                            <button onClick={onClearNotifications} className="text-xs text-primary font-bold hover:underline">Borrar todo</button>
                        )}
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <span className="material-symbols-outlined text-4xl mb-2 opacity-50">notifications_off</span>
                                <p className="text-sm">No tienes notificaciones nuevas.</p>
                            </div>
                        ) : (
                            notifications.map(notif => (
                                <div key={notif.id} className="p-4 border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                    <div className="flex gap-3">
                                        <div className={`mt-1 size-2 rounded-full shrink-0 ${notif.type === 'warning' ? 'bg-orange-500' : 'bg-primary'}`}></div>
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{notif.title}</h4>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notif.message}</p>
                                            <p className="text-[10px] text-gray-400 mt-2">{new Date(notif.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </>
          )}
      </div>
    </header>
  );
};

export default Header;