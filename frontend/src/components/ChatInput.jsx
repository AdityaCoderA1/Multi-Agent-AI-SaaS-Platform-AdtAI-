import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Square, Zap, MessageSquare, Code2, Presentation, Image as ImageIcon, Globe, FileText, X, Mic, MicOff, Link } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { addMessage, appendMessageContent, updateMessageState, setArtifacts, setIsLoading, setResubmitPrompt, removeTempMessages } from "../redux/message.slice";
import { sendPromptStream, generateChatTitle } from "../features/agent.api";
import { createConversation, updateConversations } from "../features/conversation.api";
import { addConversation, setConvTitle, setSelectedConversation } from "../redux/conversation.slice";

export default function ChatInput({
  setBanner
}) {
  const [selectedAgent, setSelectedAgent] = useState("auto");
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [value, setValue] = useState("");
  const [isListening, setIsListening] = useState(false);
  const pauseTimeoutRef = useRef(null);

  const abortControllerRef = useRef(null);

  const recognitionRef = useRef(null);
  const prevValueRef = useRef("");
  const dispatch = useDispatch();
  const { selectedConversation } = useSelector(state => state.conversation);
  const { isLoading, activeMessageId, resubmitPrompt, chatInputDraft } = useSelector(state => state.message);
  const preferredModel = useSelector(state => state.user.preferredModel || 'auto');
  const fileRef = useRef(null);

  const [selectedFiles, setSelectedFiles] = useState([]);

  const placeholders = {

    auto: "Ask adtAI...",

    chat: "Chat with adtAI...",

    coding: "Describe the software you want...",

    pdf: "Generate a PDF about...",

    ppt: "Create a presentation about...",

    image: "Describe the image...",

    search: "Search the web...",

    read: "Paste a URL to read..."

  };

  const agents = [

    {
      id: "auto",
      icon: Zap,
      label: "Auto"
    },

    {
      id: "chat",
      icon: MessageSquare,
      label: "Chat"
    },

    {
      id: "coding",
      icon: Code2,
      label: "Coding"
    },

    {
      id: "pdf",
      icon: FileText,
      label: "PDF"
    },

    {
      id: "ppt",
      icon: Presentation,
      label: "PPT"
    },

    {
      id: "image",
      icon: ImageIcon,
      label: "Image"
    },

    {
      id: "search",
      icon: Globe,
      label: "Search"
    },

    {
      id: "read",
      icon: Link,
      label: "Read Link"
    }

  ];

  useEffect(() => {

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();

    recognition.lang = "en-IN";

    recognition.interimResults = true;

    recognition.continuous = true;

    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      const previous = prevValueRef.current;
      setValue(previous ? previous + " " + transcript : transcript);

      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
      }
      pauseTimeoutRef.current = setTimeout(() => {
        recognition.stop();
      }, 2500);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
      }
    };

    recognitionRef.current = recognition;

  }, []);

  const toggleMic = () => {
    if (!recognitionRef.current) {
      alert("Speech Recognition not supported");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    } else {
      prevValueRef.current = value;
      recognitionRef.current.start();
      setIsListening(true);

      if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
      pauseTimeoutRef.current = setTimeout(() => {
        recognitionRef.current.stop();
      }, 5000);
    }
  };


  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    dispatch(setIsLoading(false));
  };

  const handleSend = async (overridePrompt = null, overrideParentId = undefined, isRegenerate = false) => {
    const prompt = (overridePrompt !== null ? overridePrompt : value).trim();
    if (!prompt) return;

    dispatch(setIsLoading(true));

    try {
      let conversation = selectedConversation;

      if (!conversation) {
        const newConversation = await createConversation();
        dispatch(addConversation(newConversation));
        dispatch(setSelectedConversation(newConversation));
        conversation = newConversation;
      }

      if (conversation.title === "New Chat") {
        const generatedTitle = await generateChatTitle(prompt);
        await updateConversations(conversation._id, generatedTitle);
        dispatch(setConvTitle({ conversationId: conversation._id, title: generatedTitle }));
      }

      const parentIdToSend = overrideParentId !== undefined ? overrideParentId : (activeMessageId || null);
      
      let tempUserId = null;
      if (!isRegenerate) {
        tempUserId = "temp-user-" + Date.now();
        dispatch(addMessage({ _id: tempUserId, role: "user", content: prompt, parentId: parentIdToSend }));
        if (overridePrompt === null) {
          setValue("");
        }
      }

      const formData = new FormData();
      formData.append("conversationId", conversation._id);
      
      const finalParentId = isRegenerate ? overrideParentId : parentIdToSend;
      if (finalParentId) formData.append("parentId", finalParentId);
      
      formData.append("prompt", prompt);
      formData.append("agent", selectedAgent);
      formData.append("model", preferredModel);
      if (isRegenerate) {
        formData.append("isRegenerate", "true");
      }

      if (selectedFiles && selectedFiles.length > 0) {
        selectedFiles.forEach(file => {
          formData.append("files", file);
        });
      }

      setSelectedFiles([]);

      abortControllerRef.current = new AbortController();
      let currentAssistantMessageId = null;

      sendPromptStream(formData, {
        signal: abortControllerRef.current.signal,
        onStart: (messageId) => {
          currentAssistantMessageId = messageId;
          dispatch(addMessage({
            _id: messageId,
            role: "assistant",
            content: "",
            images: [],
            artifacts: [],
            parentId: isRegenerate ? overrideParentId : tempUserId
          }));
        },
        onToken: (token) => {
          if (currentAssistantMessageId) {
            dispatch(appendMessageContent({
              messageId: currentAssistantMessageId,
              content: token
            }));
          }
        },
        onComplete: (data) => {
          if (currentAssistantMessageId) {
            dispatch(updateMessageState({
              messageId: currentAssistantMessageId,
              updates: {
                _id: data.messageId, 
                content: data.finalContent, 
                images: data.images,
                artifacts: data.artifacts,
                parentId: data.userMessageId
              }
            }));
          }
          if (data.userMessageId && !isRegenerate && tempUserId) {
            dispatch(updateMessageState({
              messageId: tempUserId,
              updates: { _id: data.userMessageId }
            }));
          }
          if (data.artifacts && data.artifacts.length > 0) {
            dispatch(setArtifacts(data.artifacts));
          }
          dispatch(setIsLoading(false));
          abortControllerRef.current = null;
        },
        onError: (error) => {
          setBanner({
            open: true,
            title: "Generation Error",
            message: error.message || "Please try again."
          });
          dispatch(removeTempMessages());
          dispatch(setIsLoading(false));
          abortControllerRef.current = null;
        }
      });
    } catch (error) {
      setBanner({
        open: true,
        title: error.response?.data?.title || "Something went wrong",
        message: error.response?.data?.message || "Please try again."
      });
      dispatch(removeTempMessages());
      dispatch(setIsLoading(false));
    }
  };

  useEffect(() => {
    if (resubmitPrompt) {
      handleSend(resubmitPrompt.prompt, resubmitPrompt.parentId, resubmitPrompt.isRegenerate || false);
      dispatch(setResubmitPrompt(null));
    }
  }, [resubmitPrompt]);

  useEffect(() => {
    if (chatInputDraft) {
      if (chatInputDraft.agent) setSelectedAgent(chatInputDraft.agent);
      if (chatInputDraft.prompt) setValue(chatInputDraft.prompt);
      
      // Auto-focus input when draft is set
      setTimeout(() => {
        const textarea = document.querySelector('textarea');
        if (textarea) textarea.focus();
      }, 0);
      
      // We don't dispatch setChatInputDraft(null) immediately so it doesn't clear if re-rendered,
      // but it's safe since it just populates the input box.
    }
  }, [chatInputDraft]);

  return (
    <div className="w-full max-w-5xl mx-auto overflow-visible px-3 md:px-5 py-6 bg-transparent">
      <div className="flex gap-4 items-end">

        {/* Left Vertical Tool Palette */}
        <div className="hidden md:flex flex-col gap-1.5 bg-brand-card border border-brand-border rounded-2xl p-2 shadow-sm mb-1 transition-all">
          {agents.map((agent) => {
            const Icon = agent.icon;
            const isActive = selectedAgent === agent.id;

            if (!isPaletteOpen && !isActive) return null;

            return (
              <button
                key={agent.id}
                onClick={() => {
                  if (!isPaletteOpen) {
                    setIsPaletteOpen(true);
                  } else {
                    setSelectedAgent(agent.id);
                    setIsPaletteOpen(false);
                  }
                }}
                title={agent.label}
                className={`
                  flex items-center justify-center
                  w-[42px] h-[42px]
                  rounded-xl
                  transition-all duration-150 cursor-pointer
                  border border-transparent
                  ${isActive
                    ? "bg-brand-primary/10 text-brand-primary border-brand-primary/20 shadow-sm"
                    : "bg-transparent text-brand-text-muted hover:bg-brand-bg hover:text-brand-text hover:border-brand-border"
                  }
                `}
              >
                <Icon size={18} />
              </button>
            );
          })}
        </div>

        {/* Input Area */}
        <div className="flex-1 flex flex-col gap-2 bg-brand-card border border-brand-border rounded-3xl px-5 pt-4 pb-3 shadow-md focus-within:shadow-[0_4px_24px_rgba(0,0,0,0.06)] focus-within:border-brand-primary/50 transition-all duration-300">

          {/* Mobile Tool Palette */}
          <div className="md:hidden flex overflow-x-auto gap-2 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

            {agents.map((agent) => {

              const Icon = agent.icon;
              const isActive = selectedAgent === agent.id;

              return (

                <button
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent.id)}
                  className={`
            flex-shrink-0
            
            inline-flex
            items-center
            gap-1.5
            px-3
            py-2
            rounded-full
            text-xs
            font-medium
            border
            transition-all

            ${isActive
                      ? "bg-brand-primary/10 text-brand-primary border-brand-primary/20 shadow-sm"
                      : "bg-transparent text-brand-text-muted border-brand-border hover:bg-brand-bg hover:text-brand-text"
                    }
          `}
                >

                  <Icon
                    size={14}
                    className={
                      isActive
                        ? "text-brand-primary"
                        : "text-brand-text-muted"
                    }
                  />

                  {agent.label}

                </button>

              );

            })}


          </div>

          {selectedFiles && selectedFiles.length > 0 && (
            <div className="my-3 flex flex-wrap gap-2">
              {selectedFiles.map((file, index) => (
                <div key={index} className="inline-flex items-center gap-2 rounded-xl border border-brand-border bg-brand-bg px-3 py-2 shadow-sm">
                  {
                    file.type === "application/pdf"
                      ?
                      <FileText
                        size={16}
                        className="text-red-400"
                      />
                      :
                      file.type.startsWith("image/")
                      &&
                      <img
                        src={URL.createObjectURL(file)}
                        className="h-10 w-10 rounded-xl object-cover mt-3"
                      />
                  }
                  <div>
                    <p className="text-xs text-brand-text font-semibold max-w-[120px] truncate">
                      {file.name}
                    </p>
                    <p className="text-[10px] font-medium text-brand-text-muted font-['JetBrains_Mono']">
                      {Math.ceil(file.size / 1024)} KB
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedFiles(prev => prev.filter((_, i) => i !== index));
                    }}
                    className="ml-2"
                  >
                    <X
                      size={14}
                      className="text-brand-text-muted hover:text-brand-primary transition-colors"
                    />
                  </button>
                </div>
              ))}
            </div>
          )
          }


          {/* Textarea */}
          <textarea
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (!isLoading && value.trim()) {
                  handleSend();
                }
              }
            }}
            placeholder={
              placeholders[selectedAgent]
            }
            rows={3}
            disabled={isLoading}
            className="w-full bg-transparent outline-none resize-none text-[15px] text-brand-text placeholder:text-[#A8A29E] leading-relaxed [scrollbar-width:none] [&::-webkit-scrollbar]:hidden disabled:opacity-50"
          />

          {/* Bottom row */}
          <div className="flex items-center justify-between">

            {/* Left — attach + mic */}
            <div className="flex items-center gap-1">
              <input

                ref={fileRef}
                type="file"
                hidden
                multiple
                accept=".pdf,image/*"
                onChange={(e) => {
                  const files = Array.from(e.target.files);
                  if (files.length > 0) {
                    setSelectedFiles(prev => [...(prev || []), ...files]);
                  }
                }}

              />
              <button className="flex items-center justify-center w-10 h-10 rounded-xl text-brand-text-muted hover:text-brand-text hover:bg-brand-bg border border-transparent hover:border-brand-border transition-all duration-150 bg-transparent cursor-pointer"
                onClick={() =>
                  fileRef.current.click()
                }
              >
                <Paperclip size={14} />
              </button>
              <button

                onClick={toggleMic}

                className={`

flex

items-center

justify-center

w-10

h-10

rounded-xl

border border-transparent

transition-all

cursor-pointer

${isListening

                    ?

                    "bg-red-50 text-red-500 border-red-200"

                    :

                    "text-brand-text-muted hover:bg-brand-bg hover:text-brand-text hover:border-brand-border"

                  }

`}

              >

                {

                  isListening

                    ?

                    <MicOff size={14} />

                    :

                    <Mic size={14} />

                }

              </button>
            </div>

            {/* Right — send / stop */}
            {isLoading ? (
              <button
                onClick={handleStop}
                className="flex items-center justify-center w-10 h-10 rounded-xl border-none cursor-pointer transition-all duration-150 shadow-sm bg-[#1C1917] text-white hover:bg-[#292524]"
              >
                <Square size={14} fill="currentColor" />
              </button>
            ) : (
              <button
                onClick={() => handleSend()}
                disabled={!value.trim()}
                className={`flex items-center justify-center w-10 h-10 rounded-xl border-none cursor-pointer transition-all duration-150 shadow-sm
                  ${value.trim()
                    ? "bg-brand-primary hover:bg-brand-hover hover:shadow-md text-white"
                    : "bg-brand-bg text-[#A8A29E] cursor-not-allowed border border-brand-border"
                  }
                `}
              >
                <Send size={16} />
              </button>
            )}

          </div>
        </div>
      </div>

      <p className="text-center text-[11px] font-medium text-brand-text-muted mt-4 mb-2 font-['Space_Grotesk'] tracking-wide">
        adtAI can make mistakes. Verify important info.
      </p>
    </div>
  );
}