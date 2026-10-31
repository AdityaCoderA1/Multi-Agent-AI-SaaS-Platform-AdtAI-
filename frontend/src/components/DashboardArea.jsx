import React from 'react';
import { Search, PenTool, BarChart2, Image as ImageIcon, FileText, MoreHorizontal, Link as LinkIcon, Code2 } from 'lucide-react';
import Logo from './Logo';
import { useSelector, useDispatch } from 'react-redux';
import { setSelectedConversation } from '../redux/conversation.slice';
import { getMessages } from '../features/message.api';
import { setMessages, setArtifacts, setChatInputDraft } from '../redux/message.slice';

export default function DashboardArea() {
  const { userData } = useSelector(state => state.user);
  const { conversations } = useSelector(state => state.conversation);
  const dispatch = useDispatch();

  const handleSelectConversation = async (conversation) => {
    dispatch(setSelectedConversation(conversation));
    const messages = await getMessages(conversation._id);
    dispatch(setMessages(messages));
    dispatch(setArtifacts(messages.artifacts));
  };

  const recentChats = conversations.slice(0, 3);

  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-8 overflow-hidden">
      
      {/* Hero Section */}
      <div className="flex flex-col items-center mb-10">
        <Logo size="large" className="mb-6 opacity-80" />
        <h1 className="text-3xl font-bold text-brand-text mb-2 font-['Space_Grotesk'] tracking-tight">
          Good evening, {userData?.name?.split(' ')[0] || 'Aditya'} 👋
        </h1>
        <p className="text-[15px] text-brand-text-muted">What can I help you with today?</p>
      </div>

      {/* Action Cards */}
      <div className="w-full max-w-5xl grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
        
        {/* Research */}
        <button 
          onClick={() => dispatch(setChatInputDraft({ agent: 'search', prompt: 'Research the topic of ' }))}
          className="flex flex-col text-left bg-brand-card border border-brand-border rounded-2xl p-5 hover:shadow-md hover:border-orange-200 transition-all group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform dark:bg-orange-500/10">
            <Search size={18} />
          </div>
          <h3 className="text-[15px] font-semibold text-brand-text mb-1">Research</h3>
          <p className="text-[13px] text-brand-text-muted leading-relaxed">Get in-depth insights on any topic</p>
          <div className="mt-auto pt-4 flex justify-end text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </div>
        </button>

        {/* Create */}
        <button 
          onClick={() => dispatch(setChatInputDraft({ agent: 'pdf', prompt: 'Create a PDF ' }))}
          className="flex flex-col text-left bg-brand-card border border-brand-border rounded-2xl p-5 hover:shadow-md hover:border-blue-200 transition-all group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform dark:bg-blue-500/10">
            <FileText size={18} />
          </div>
          <h3 className="text-[15px] font-semibold text-brand-text mb-1">Create</h3>
          <p className="text-[13px] text-brand-text-muted leading-relaxed">Create docs, reports and more</p>
          <div className="mt-auto pt-4 flex justify-end text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </div>
        </button>

        {/* Coding */}
        <button 
          onClick={() => dispatch(setChatInputDraft({ agent: 'coding', prompt: 'Write code for ' }))}
          className="flex flex-col text-left bg-brand-card border border-brand-border rounded-2xl p-5 hover:shadow-md hover:border-green-200 transition-all group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-full bg-green-50 text-green-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform dark:bg-green-500/10">
            <Code2 size={18} />
          </div>
          <h3 className="text-[15px] font-semibold text-brand-text mb-1">Coding</h3>
          <p className="text-[13px] text-brand-text-muted leading-relaxed">Write code and develop apps</p>
          <div className="mt-auto pt-4 flex justify-end text-green-400 opacity-0 group-hover:opacity-100 transition-opacity">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </div>
        </button>

        {/* Generate */}
        <button 
          onClick={() => dispatch(setChatInputDraft({ agent: 'image', prompt: 'Generate an image of ' }))}
          className="flex flex-col text-left bg-brand-card border border-brand-border rounded-2xl p-5 hover:shadow-md hover:border-pink-200 transition-all group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-full bg-pink-50 text-pink-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform dark:bg-pink-500/10">
            <ImageIcon size={18} />
          </div>
          <h3 className="text-[15px] font-semibold text-brand-text mb-1">Generate</h3>
          <p className="text-[13px] text-brand-text-muted leading-relaxed">Generate images with AI</p>
          <div className="mt-auto pt-4 flex justify-end text-pink-400 opacity-0 group-hover:opacity-100 transition-opacity">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </div>
        </button>

        {/* Read Link */}
        <button 
          onClick={() => dispatch(setChatInputDraft({ agent: 'read', prompt: 'Read and summarize this link: ' }))}
          className="flex flex-col text-left bg-brand-card border border-brand-border rounded-2xl p-5 hover:shadow-md hover:border-purple-200 transition-all group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform dark:bg-purple-500/10">
            <LinkIcon size={18} />
          </div>
          <h3 className="text-[15px] font-semibold text-brand-text mb-1">Read Link</h3>
          <p className="text-[13px] text-brand-text-muted leading-relaxed">Extract and read webpage content</p>
          <div className="mt-auto pt-4 flex justify-end text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </div>
        </button>

      </div>
    </div>
  );
}
