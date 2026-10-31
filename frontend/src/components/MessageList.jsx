import MessageBubble from "./MessageBubble";
import Logo from "./Logo";
import DashboardArea from "./DashboardArea";

import { useDispatch, useSelector } from "react-redux";
import { getMessages } from "../features/message.api";
import { setArtifacts, setMessages, setActiveMessageId, setResubmitPrompt } from "../redux/message.slice";
import { ChevronLeft, ChevronRight, Edit2, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState, useMemo } from "react";
function NeuralPulse() {
  return (
    <div className="relative w-9 h-9 flex items-center justify-center shrink-0">
      {[0, 0.45, 0.9].map((delay, i) => (
        <motion.span
          key={i}
          className="absolute inset-0 rounded-full border border-cyan-400/30"
          initial={{ scale: 0.3, opacity: 0.55 }}
          animate={{ scale: 1.7, opacity: 0 }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            delay,
            ease: "easeOut",
          }}
        />
      ))}
      <motion.span
        className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-[#EA580C] to-amber-500"
        style={{ boxShadow: "0 0 14px rgba(234,88,12,0.4)" }}
        animate={{ scale: [1, 1.25, 1] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

const THINKING_LABELS = ["Thinking", "Analyzing", "Reasoning", "Generating"];

function GeneratingIndicator() {
  const [labelIndex, setLabelIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLabelIndex((prev) => (prev + 1) % THINKING_LABELS.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  const label = THINKING_LABELS[labelIndex];

  return (
    <div className="flex items-center gap-3 max-w-[72%] py-1">
      <NeuralPulse />
      <div className="flex overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={label}
            className="flex"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {label.split("").map((ch, i) => (
              <motion.span
                key={i}
                className="text-[13px] font-medium tracking-wide text-[#78716C]"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{
                  duration: 1.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.07,
                }}
              >
                {ch}
              </motion.span>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function MessageList() {
  const bottomRef = useRef(null);
  const { messages, isLoading, activeMessageId } = useSelector(state => state.message);
  const { selectedConversation } = useSelector(state => state.conversation);
  const dispatch = useDispatch();

  const activeBranch = useMemo(() => {
    if (!messages.length) return [];

    let currentId = activeMessageId || messages[messages.length - 1]._id;
    const branch = [];
    const messageMap = new Map();
    messages.forEach(m => messageMap.set(m._id, m));

    while (currentId && messageMap.has(currentId)) {
      const msg = messageMap.get(currentId);
      branch.unshift(msg);
      currentId = msg.parentId;
    }
    return branch;
  }, [messages, activeMessageId]);

  const getSiblingsInfo = (msg) => {
    const siblings = messages.filter(m => m.parentId === msg.parentId);
    if (siblings.length <= 1) return null;
    const currentIndex = siblings.findIndex(m => m._id === msg._id);
    return { siblings, currentIndex, total: siblings.length };
  };

  const navigateSibling = (siblings, newIndex) => {
    const targetMsg = siblings[newIndex];
    if (!targetMsg) return;

    let currentId = targetMsg._id;
    while (true) {
      const children = messages.filter(m => m.parentId === currentId);
      if (children.length === 0) break;
      currentId = children[children.length - 1]._id;
    }

    dispatch(setActiveMessageId(currentId));
  };

  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [speakingMessageId, setSpeakingMessageId] = useState(null);

  const handleEditClick = (msg) => {
    setEditingMessageId(msg._id);
    setEditContent(msg.content);
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditContent("");
  };

  const handleSaveEdit = (msg) => {
    dispatch(setResubmitPrompt({
      prompt: editContent,
      parentId: msg.parentId
    }));
    setEditingMessageId(null);
  };

  const handleRegenerate = (msg) => {
    const parentMsg = messages.find(m => m._id === msg.parentId);
    if (parentMsg) {
      dispatch(setResubmitPrompt({
        prompt: parentMsg.content,
        parentId: parentMsg.parentId,
        isRegenerate: true
      }));
    } else {
      console.warn("Could not find parent user message to regenerate.");
    }
  };

  const handleSpeak = (msg) => {
    if (!("speechSynthesis" in window)) {
      alert("Text-to-speech is not supported in your browser.");
      return;
    }

    if (speakingMessageId === msg._id) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel(); // Stop any previous speech

    const utterance = new SpeechSynthesisUtterance(msg.content.replace(/```[\s\S]*?```/g, ' [Code Block] '));
    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);

    window.speechSynthesis.speak(utterance);
    setSpeakingMessageId(msg._id);
  };

  useEffect(() => {

    requestAnimationFrame(() => {

      bottomRef.current?.scrollIntoView({

        behavior: "smooth",

        block: "end"

      });

    });

  }, [messages.length, isLoading]);
  useEffect(() => {
    if (selectedConversation?.title === "New Chat") return;
    const get = async () => {
      const data = await getMessages(selectedConversation?._id);
      dispatch(setMessages(data));
      const latestArtifactMessage =
        [...data]
          .reverse()
          .find(
            msg =>
              msg.artifacts &&
              msg.artifacts.length > 0
          );

      if (latestArtifactMessage) {

        dispatch(
          setArtifacts(
            latestArtifactMessage.artifacts
          )
        );

      }
    };
    get();
  }, [selectedConversation?._id]);

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {messages.length === 0 && !isLoading ? (
        <DashboardArea />
      ) : (
        <>
          {activeBranch.map((msg, i) => {
            const siblingsInfo = getSiblingsInfo(msg);
            const isEditing = editingMessageId === msg._id;

            return (
              <motion.div
                key={msg._id || i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className={`group flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
              >
                {isEditing ? (
                  <div className="w-full max-w-[92vw] md:max-w-[800px] bg-brand-card border border-brand-border rounded-2xl p-4 shadow-sm focus-within:border-brand-primary/30 focus-within:ring-4 focus-within:ring-brand-primary/10 transition-all duration-300">
                    <textarea
                      className="w-full bg-transparent outline-none resize-y min-h-[60px] text-[15px] text-brand-text placeholder:text-brand-text-muted leading-relaxed [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      autoFocus
                    />
                    <div className="flex justify-end gap-2 mt-3 pt-2 border-t border-brand-border/50">
                      <button onClick={handleCancelEdit} className="px-4 py-1.5 rounded-full text-[13px] font-medium text-brand-text-muted hover:bg-brand-bg hover:text-brand-text transition-colors">Cancel</button>
                      <button onClick={() => handleSaveEdit(msg)} disabled={!editContent.trim()} className="px-4 py-1.5 rounded-full text-[13px] font-medium bg-brand-primary text-white hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all">Submit</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <MessageBubble
                      role={msg.role}
                      content={msg.content}
                      images={msg?.images || []}
                      isGenerating={isLoading && msg.role !== 'user' && i === activeBranch.length - 1}
                    />

                    <div className={`flex items-center gap-3 mt-1.5 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      {siblingsInfo && (
                        <div className="flex items-center gap-1.5 text-[#A8A29E] text-[12px] font-medium">
                          <button
                            onClick={() => navigateSibling(siblingsInfo.siblings, siblingsInfo.currentIndex - 1)}
                            disabled={siblingsInfo.currentIndex === 0}
                            className="p-1 rounded-md hover:bg-[#E7E5E4] hover:text-[#1C1917] disabled:opacity-30 transition-colors"
                          >
                            <ChevronLeft size={14} />
                          </button>
                          <span>{siblingsInfo.currentIndex + 1} / {siblingsInfo.total}</span>
                          <button
                            onClick={() => navigateSibling(siblingsInfo.siblings, siblingsInfo.currentIndex + 1)}
                            disabled={siblingsInfo.currentIndex === siblingsInfo.total - 1}
                            className="p-1 rounded-md hover:bg-[#E7E5E4] hover:text-[#1C1917] disabled:opacity-30 transition-colors"
                          >
                            <ChevronRight size={14} />
                          </button>
                        </div>
                      )}

                      {msg.role === "user" ? (
                        <button onClick={() => handleEditClick(msg)} className="p-1.5 rounded-md text-[#A8A29E] hover:bg-[#E7E5E4] hover:text-[#1C1917] transition-colors" title="Edit Message">
                          <Edit2 size={13} />
                        </button>
                      ) : (
                        <>
                          <button onClick={() => handleSpeak(msg)} className="p-1.5 rounded-md text-[#A8A29E] hover:bg-[#E7E5E4] hover:text-[#1C1917] transition-colors" title={speakingMessageId === msg._id ? "Stop Speaking" : "Read Aloud"}>
                            {speakingMessageId === msg._id ? <VolumeX size={13} /> : <Volume2 size={13} />}
                          </button>
                          <button onClick={() => handleRegenerate(msg)} className="p-1.5 rounded-md text-[#A8A29E] hover:bg-[#E7E5E4] hover:text-[#1C1917] transition-colors" title="Regenerate Response">
                            <RotateCcw size={13} />
                          </button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </motion.div>
            );
          })}

          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <GeneratingIndicator />
            </motion.div>
          )}

        </>
      )}
      <div ref={bottomRef} />
    </div>
  );
}