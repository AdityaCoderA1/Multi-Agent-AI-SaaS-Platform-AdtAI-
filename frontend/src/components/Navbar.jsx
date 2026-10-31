import { useState, useRef, useEffect } from "react";
import { MessageSquare, Bell, User, Settings, LogOut } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import ModelSelector from "./ModelSelector";
import SettingsModal from "./SettingsModal";
import api from "../utils/axios";
import { setUserData } from "../redux/user.slice";
import { setMessages } from "../redux/message.slice";
import { setConversations } from "../redux/conversation.slice";

export default function Navbar() {
  const { conversations, selectedConversation } = useSelector(state => state.conversation);
  const { messages } = useSelector(state => state.message);
  const { userData } = useSelector(state => state.user);
  const dispatch = useDispatch();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await api.get("/api/auth/logout");
      dispatch(setUserData(null));
      dispatch(setMessages([]));
      dispatch(setConversations([]));
    } catch (error) {
      console.error("Logout failed", error);
    }
  };
  return (
    <div className="h-[60px] flex items-center justify-between px-5 border-b border-brand-border bg-brand-bg transition-colors duration-300">

      {/* Left — chat title & message count */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-primary/10 border border-brand-primary/20 shadow-sm transition-colors duration-300">
          <MessageSquare size={14} className="text-brand-primary" />
        </div>
        {messages.length > 0 && selectedConversation?.title && (
          <h2 className="text-[15px] font-bold text-brand-text tracking-tight transition-colors duration-300">
            {selectedConversation.title}
          </h2>
        )}
        <span className="text-[12px] font-medium text-brand-text-muted transition-colors duration-300">
          {messages.length} Messages
        </span>
      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-4">
        <ModelSelector />
        
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="text-brand-text-muted hover:text-brand-text transition-colors relative cursor-pointer flex items-center justify-center p-1"
          >
            <Bell size={18} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-brand-bg"></span>
          </button>
          
          {showNotifications && (
            <div className="absolute top-full right-0 mt-3 w-72 bg-brand-card border border-brand-border rounded-xl shadow-lg z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-brand-border bg-brand-bg/50">
                <h3 className="text-sm font-semibold text-brand-text">Notifications</h3>
              </div>
              <div className="p-8 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-brand-bg flex items-center justify-center mb-3">
                  <Bell size={20} className="text-brand-text-muted" />
                </div>
                <p className="text-sm font-medium text-brand-text mb-1">All caught up!</p>
                <p className="text-xs text-brand-text-muted">You have no new notifications.</p>
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={profileRef}>
          <div 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-8 h-8 rounded-full bg-pink-600 flex items-center justify-center text-white text-sm font-bold border border-brand-border cursor-pointer hover:ring-2 hover:ring-brand-primary/30 transition-all"
          >
            {userData?.avatar ? (
              <img src={userData.avatar} alt="Profile" className="w-full h-full rounded-full object-cover" />
            ) : (
              userData?.name?.charAt(0) || "A"
            )}
          </div>

          {showProfileMenu && (
            <div className="absolute top-full right-0 mt-3 w-56 bg-brand-card border border-brand-border rounded-xl shadow-lg z-50 overflow-hidden flex flex-col">
              <div className="px-4 py-3 border-b border-brand-border bg-brand-bg/50">
                <p className="text-sm font-semibold text-brand-text truncate">{userData?.name || "User"}</p>
                <p className="text-xs text-brand-text-muted truncate mt-0.5">{userData?.email || ""}</p>
              </div>
              <div className="p-2 flex flex-col gap-1">
                <button 
                  onClick={() => { setShowSettings(true); setShowProfileMenu(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-brand-text-muted hover:text-brand-text hover:bg-brand-bg rounded-lg transition-colors cursor-pointer text-sm"
                >
                  <User size={15} />
                  My Profile
                </button>
                <button 
                  onClick={() => { setShowSettings(true); setShowProfileMenu(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-brand-text-muted hover:text-brand-text hover:bg-brand-bg rounded-lg transition-colors cursor-pointer text-sm"
                >
                  <Settings size={15} />
                  Preferences
                </button>
                <div className="h-px bg-brand-border my-1"></div>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer text-sm font-medium"
                >
                  <LogOut size={15} />
                  Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );
}