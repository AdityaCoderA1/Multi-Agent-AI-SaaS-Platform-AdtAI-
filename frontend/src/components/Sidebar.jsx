import { useEffect, useState } from "react";
import { Plus, MessageSquare, Settings, LogOut, User, PenSquare, Menu, X, Coins, ConeIcon, CoinsIcon, Trash2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import api from "../utils/axios";
import { setUserData } from "../redux/user.slice";
import { createConversation, getConversations, deleteConversations, deleteConversation } from "../features/conversation.api";
import { addConversation, setConversations, setSelectedConversation, removeConversation } from "../redux/conversation.slice";
import { getMessages } from "../features/message.api";
import { setArtifacts, setMessages } from "../redux/message.slice";
import BillingDrawer from "./BillingDrawer";
import Logo from "./Logo";
import SettingsModal from "./SettingsModal";

export default function Sidebar() {
  const [hovered, setHovered] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { userData } = useSelector(state => state.user);
  const { conversations, selectedConversation } = useSelector(state => state.conversation);
  const dispatch = useDispatch();
  const [showBilling, setShowBilling] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const logout = async () => {
    try {
      await api.get("/api/auth/logout");
      dispatch(setUserData(null));
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const data = await getConversations();
        dispatch(setConversations(data));
      } catch (error) {
        console.log(error);
      }
    };
    fetchConversations();
  }, [userData?._id]);

  const handleCreateConversation = () => {
    dispatch(setSelectedConversation(null));
    dispatch(setMessages([]));
    dispatch(setArtifacts([]));
    setMobileOpen(false);
  };

  const handleClearHistory = async () => {
    try {
      await deleteConversations();
      dispatch(setConversations([]));
      dispatch(setSelectedConversation(null));
      dispatch(setMessages([]));
      dispatch(setArtifacts([]));
      setMobileOpen(false);
    } catch (error) {
      console.log("Failed to clear history", error);
    }
  };

  const handleSelectConversation = async (conversation) => {
    setMobileOpen(false);
    dispatch(setSelectedConversation(conversation));
    const messages = await getMessages(conversation._id);
    dispatch(setMessages(messages));
    dispatch(setArtifacts(messages.artifacts));
  };

  const handleDeleteSingleConversation = async (id) => {
    try {
      await deleteConversation(id);
      dispatch(removeConversation(id));
      if (selectedConversation?._id === id) {
        dispatch(setMessages([]));
        dispatch(setArtifacts([]));
      }
    } catch (error) {
      console.log("Failed to delete conversation", error);
    }
  };

  const PanelIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="9" y1="3" x2="9" y2="21" />
    </svg>
  );

  /* ── Collapsed rail — desktop only ── */
  const CollapsedRail = () => (
    <div className="hidden lg:flex flex-col items-center w-[60px] h-screen bg-brand-sidebar-bg border-r border-white/10 py-4 gap-2 shrink-0 transition-colors duration-300">
      <button
        onClick={() => setCollapsed(false)}
        className="flex items-center justify-center w-10 h-10 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-all shadow-sm bg-transparent cursor-pointer mb-2"
      >
        <PanelIcon />
      </button>

      <button
        onClick={handleCreateConversation}
        className="flex items-center justify-center w-10 h-10 rounded-xl text-white bg-brand-primary hover:bg-brand-hover transition-all shadow-md cursor-pointer"
      >
        <Plus size={18} />
      </button>

      <div className="flex-1 flex flex-col items-center gap-2 overflow-y-auto w-full px-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden mt-2">
        {conversations.map((chat) => {
          const isActive = selectedConversation?._id === chat._id;
          return (
            <button
              key={chat._id}
              onClick={() => handleSelectConversation(chat)}
              title={chat.title}
              className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all border cursor-pointer
                ${isActive ? "bg-brand-primary/10 border-brand-primary/30 text-brand-primary shadow-sm" : "bg-transparent border-transparent text-white/50 hover:bg-white/5 hover:text-white"}`}
            >
              <MessageSquare size={16} />
            </button>
          );
        })}
      </div>

      <div className="mt-auto">
        {userData && (
          <div className="relative cursor-pointer hover:opacity-80 transition-opacity">
            {userData.avatar
              ? <img src={userData.avatar} alt={userData.name} className="w-10 h-10 rounded-xl object-cover border border-white/20 shadow-sm" />
              : <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shadow-sm"><User size={16} className="text-white/50" /></div>
            }
            <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-brand-text block" />
          </div>
        )}
      </div>
    </div>
  );

  /* ── Full sidebar content ── */
  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-brand-sidebar-bg text-white">

      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-white/10">
        {/* Desktop collapse */}
        <button
          onClick={() => setCollapsed(true)}
          className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
        >
          <PanelIcon />
        </button>

        {/* Mobile close */}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
        >
          <X size={16} />
        </button>

        <div className="flex-1 overflow-hidden ml-1">
          <Logo size="small" theme="dark" />
        </div>

        <span className="text-[10px] font-bold text-brand-primary bg-brand-primary/10 border border-brand-primary/20 px-2.5 py-0.5 rounded-full tracking-wider uppercase font-['JetBrains_Mono']">
          {userData?.plan ?? "pro"}
        </span>

        <button
          onClick={handleCreateConversation}
          className="flex items-center justify-center w-8 h-8 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
        >
          <PenSquare size={15} />
        </button>
      </div>

      {/* New Chat */}
      <div className="px-4 pt-5 pb-2">
        <button
          onClick={handleCreateConversation}
          className="w-full flex items-center justify-center gap-2 text-[14px] font-semibold text-white bg-brand-primary hover:bg-brand-hover rounded-xl py-2.5 shadow-[0_4px_14px_0_rgba(249,115,22,0.25)] transition-all duration-150 cursor-pointer"
        >
          <Plus size={16} />
          New Workspace
        </button>
      </div>

      {
        conversations.length === 0 ? (
          <div className="px-5 pt-5 pb-2 text-[10px] font-bold uppercase tracking-widest text-white/40 font-['Space_Grotesk']">
            No recent chats
          </div>
        )
          :
          (
            <div className="flex items-center justify-between px-5 pt-5 pb-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 font-['Space_Grotesk']">
                RECENT CHATS
              </p>
              <button
                onClick={handleClearHistory}
                className="flex items-center justify-center text-white/40 hover:text-red-400 bg-transparent border-none cursor-pointer transition-colors duration-150 p-1 rounded hover:bg-white/5"
                title="Clear History"
              >
                <Trash2 size={14} />
              </button>
            </div>
          )
      }

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {conversations.map((chat) => {
          const isActive = selectedConversation?._id === chat._id;
          const isHov = hovered === chat._id;
          return (
            <div
              key={chat._id}
              onClick={() => handleSelectConversation(chat)}
              onMouseEnter={() => setHovered(chat._id)}
              onMouseLeave={() => setHovered(null)}
              className={`flex items-center gap-3 cursor-pointer mb-1 px-3 py-2.5 rounded-xl border transition-all duration-150
                ${isActive ? "bg-white/10 border-white/20 shadow-sm"
                  : isHov ? "bg-white/5 border-white/10"
                    : "bg-transparent border-transparent"}`}
            >
              <div className={`flex items-center justify-center shrink-0 w-[30px] h-[30px] rounded-lg transition-colors duration-150
                ${isActive ? "bg-brand-primary text-white" : "bg-white/5 border border-white/10 text-white/50"}`}>
                <MessageSquare size={14} />
              </div>
              <p className={`text-[13px] font-medium truncate flex-1 ${isActive ? "text-white" : "text-white/70"}`}>
                {chat.title}
              </p>
              {isHov && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteSingleConversation(chat._id);
                  }}
                  className="flex items-center justify-center shrink-0 w-[24px] h-[24px] rounded-md text-white/50 hover:text-red-400 hover:bg-white/10 transition-colors border-none bg-transparent cursor-pointer"
                  title="Delete Workspace"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          );
        })}
      </div>



      <div className="px-4 py-4 border-t border-white/10 flex flex-col gap-1">
        <button 
          onClick={() => setShowSettings(true)}
          className="w-full flex items-center gap-3 px-3 py-2 text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
        >
          <Settings size={16} />
          <span className="text-[13px] font-medium">Settings</span>
        </button>
        <a 
          href="mailto:support@adtai.com"
          className="w-full flex items-center gap-3 px-3 py-2 text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-colors cursor-pointer mb-2 no-underline"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          <span className="text-[13px] font-medium">Help & Support</span>
        </a>
        {userData ? (
          <div className="flex items-center gap-3 cursor-pointer rounded-2xl p-3 bg-white/5 border border-white/10 shadow-sm hover:bg-white/10 transition-all duration-200">
            <div className="relative shrink-0">
              {
                !userData?.avatar || imageError ? (
                  <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
                    <User size={16} className="text-white/50" />
                  </div>
                ) : (
                  <img
                    src={userData.avatar}
                    alt={userData.name}
                    className="w-10 h-10 rounded-xl object-cover border border-white/20 shadow-sm"
                    onError={() => setImageError(true)}
                  />
                )
              }
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-brand-text block" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-white truncate">{userData.name}</p>
              <p className="text-[11.5px] font-medium text-white/50 mt-0.5">{userData.plan || "Free Plan"}</p>
            </div>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => setShowBilling(true)}
                className="flex items-center justify-center w-7 h-7 rounded-lg border-none bg-brand-primary/20 text-brand-primary cursor-pointer hover:bg-brand-primary/30 transition-all duration-150"
              >
                <CoinsIcon size={14} />
              </button>
              <button onClick={logout} className="flex items-center justify-center w-7 h-7 rounded-lg bg-white/5 text-white/50 cursor-pointer hover:bg-red-500/20 hover:text-red-400 transition-all duration-150">
                <LogOut size={13} />
              </button>
            </div>
          </div>
        ) : (
          <div className="px-1">
            <button className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-brand-text bg-white shadow-sm rounded-xl py-[11px] cursor-pointer hover:bg-gray-100 transition-all duration-150">
              Login
            </button>
          </div>
        )}
      </div>

    </div>
  );

  if (collapsed) return <CollapsedRail />;

  return (
    <>
      {/* ── Mobile hamburger ── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3.5 left-4 z-50 flex items-center justify-center w-9 h-9 rounded-xl bg-white border border-[#E7E5E4] shadow-sm text-[#1C1917] hover:bg-[#F8F7F4] transition-all duration-150 cursor-pointer"
      >
        <Menu size={18} />
      </button>

      {/* ── Mobile backdrop ── */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
        />
      )}

      {/* ── Sidebar panel ── */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-[280px] h-screen shrink-0
        bg-brand-text border-r border-white/10
        transition-transform duration-300 ease-in-out
        ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <SidebarContent />
      </div>

      <BillingDrawer
        open={showBilling}
        onClose={() => setShowBilling(false)}
      />
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </>
  );
}