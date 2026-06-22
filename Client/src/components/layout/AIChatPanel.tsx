import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, Bot, User, Sparkles, Loader2, Minimize2, Copy, Check, History, MessageSquarePlus, Trash2, ArrowLeft } from "lucide-react";
import { aiService } from "../../services/aiService";
import toast from "react-hot-toast";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useChatStore } from "../../stores/chatStore";
interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const PreBlock = ({ children, ...props }: any) => {
  const [copied, setCopied] = useState(false);
  
  let codeString = "";
  if (children && children.props && children.props.children) {
    codeString = children.props.children;
  }

  const handleCopy = () => {
    if (codeString) {
      navigator.clipboard.writeText(String(codeString).replace(/\n$/, ""));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const language = children?.props?.className?.replace('language-', '') || 'code';

  return (
    <div className="relative group rounded-xl overflow-hidden bg-black/10 dark:bg-white/5 border border-black/10 dark:border-white/10 my-4 not-prose">
      <div className="flex items-center justify-between px-4 py-2 bg-black/5 dark:bg-white/5 border-b border-black/10 dark:border-white/10">
        <span className="text-xs font-mono opacity-60 uppercase tracking-wider">
          {language}
        </span>
        <button
          onClick={handleCopy}
          className="p-1.5 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors flex items-center gap-1.5"
          title="Copy code"
        >
          {copied ? (
            <><Check size={14} className="text-green-500" /><span className="text-xs text-green-500 font-medium">Copied!</span></>
          ) : (
            <><Copy size={14} className="opacity-70" /><span className="text-xs opacity-70 font-medium">Copy</span></>
          )}
        </button>
      </div>
      <div className="p-4 overflow-x-auto text-sm">
        <pre className="m-0 bg-transparent p-0" {...props}>
          {children}
        </pre>
      </div>
    </div>
  );
};

export default function AIChatPanel({ isOpen, onClose }: AIChatPanelProps) {
  const { 
    sessions, 
    activeSessionId, 
    createSession, 
    setActiveSession, 
    deleteSession, 
    addMessage 
  } = useChatStore();

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryView, setIsHistoryView] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const activeSession = sessions.find(s => s.id === activeSessionId);
  const messages = activeSession?.messages || [];
  
  const displayMessages = messages.length > 0 ? messages : [
    { role: "assistant", content: "Hi there! I'm InternPulse AI. How can I help you today?" }
  ];

  useEffect(() => {
    if (scrollRef.current && !isHistoryView) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [displayMessages, isHistoryView]);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput("");
    
    let currentSessionId = activeSessionId;
    if (!currentSessionId) {
      currentSessionId = createSession(userMsg);
    } else {
      addMessage(currentSessionId, { role: "user" as any, content: userMsg });
    }
    
    setIsLoading(true);

    try {
      const historyForApi = [
        ...(currentSessionId === activeSessionId ? displayMessages : [{ role: "assistant", content: "Hi there! I'm InternPulse AI. How can I help you today?" }])
      ].map((m) => ({
        role: m.role as any,
        content: m.content,
      }));
      
      if (currentSessionId === activeSessionId) {
         historyForApi.push({ role: "user", content: userMsg });
      }

      const res = await aiService.chat(userMsg, historyForApi);
      addMessage(currentSessionId, { role: "assistant" as any, content: res.data.reply });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "AI failed to respond");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm md:hidden"
          />

          {/* Panel */}
          <motion.div
            ref={panelRef}
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-4 bottom-4 md:top-20 md:bottom-8 z-50 w-[calc(100%-32px)] md:w-[400px] flex flex-col rounded-3xl overflow-hidden shadow-2xl"
            style={{
              background: "var(--card-bg)",
              border: "1px solid var(--border-color)",
              boxShadow: "0 24px 48px rgba(0,0,0,0.4)",
            }}
          >
            {/* Header */}
            <div
              className="px-6 py-4 flex items-center justify-between border-b"
              style={{
                borderColor: "var(--border-color)",
                background: "linear-gradient(135deg, rgba(var(--primary-rgb), 0.1), rgba(var(--primary-hover-rgb), 0.05))",
              }}
            >
              <div className="flex items-center gap-3">
                {isHistoryView ? (
                  <button
                    onClick={() => setIsHistoryView(false)}
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
                    style={{ background: "rgba(var(--primary-rgb), 0.1)", color: "var(--primary)" }}
                    title="Back to Chat"
                  >
                    <ArrowLeft size={20} />
                  </button>
                ) : (
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg, var(--primary), var(--primary-hover))",
                      boxShadow: "0 4px 12px rgba(var(--primary-rgb), 0.3)",
                    }}
                  >
                    <Sparkles size={20} className="text-white" />
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
                    {isHistoryView ? "Chat History" : "AI Assistant"}
                  </h3>
                  {!isHistoryView && (
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color: "var(--text-muted)" }}>
                        Online
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!isHistoryView ? (
                  <>
                    <button
                      onClick={() => {
                        setActiveSession(null);
                        setIsHistoryView(false);
                      }}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                      style={{ color: "var(--text-muted)" }}
                      title="New Chat"
                    >
                      <MessageSquarePlus size={16} />
                    </button>
                    <button
                      onClick={() => setIsHistoryView(true)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                      style={{ color: "var(--text-muted)" }}
                      title="View History"
                    >
                      <History size={16} />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setActiveSession(null);
                      setIsHistoryView(false);
                    }}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                    style={{ color: "var(--text-muted)" }}
                    title="New Chat"
                  >
                    <MessageSquarePlus size={16} />
                  </button>
                )}
                <div className="w-px h-4 bg-black/10 dark:bg-white/10 mx-1" />
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                  style={{ color: "var(--text-muted)", background: "var(--bg-surface-2)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                >
                  <Minimize2 size={16} />
                </button>
              </div>
            </div>

            {/* Body */}
            {isHistoryView ? (
              <div className="flex-1 overflow-y-auto p-4 space-y-2" style={{ background: "var(--bg-base)" }}>
                {sessions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
                    <History size={48} className="mb-4" />
                    <p className="text-sm">No chat history yet.</p>
                  </div>
                ) : (
                  sessions.map((session) => (
                    <div
                      key={session.id}
                      className="group flex items-center justify-between p-4 rounded-xl cursor-pointer transition-colors border"
                      style={{ 
                        background: activeSessionId === session.id ? "var(--bg-surface-2)" : "transparent",
                        borderColor: activeSessionId === session.id ? "var(--primary)" : "var(--border-color)"
                      }}
                      onClick={() => {
                        setActiveSession(session.id);
                        setIsHistoryView(false);
                      }}
                    >
                      <div className="flex-1 min-w-0 pr-4">
                        <h4 className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                          {session.title}
                        </h4>
                        <p className="text-xs mt-1 opacity-60" style={{ color: "var(--text-muted)" }}>
                          {new Date(session.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSession(session.id);
                        }}
                        className="p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/10 text-red-500"
                        title="Delete chat"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
                style={{ background: "var(--bg-base)" }}
              >
                {displayMessages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <div
                      className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                      msg.role === "assistant"
                        ? "bg-primary/10 text-primary-strong"
                        : "bg-slate-500/10 text-slate-500"
                    }`}
                    style={{
                      backgroundColor: msg.role === "assistant" ? "rgba(var(--primary-rgb), 0.1)" : undefined,
                      color: msg.role === "assistant" ? "var(--primary)" : undefined
                    }}
                    >
                      {msg.role === "assistant" ? <Bot size={16} /> : <User size={16} />}
                    </div>
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed overflow-x-auto ${
                        msg.role === "assistant"
                          ? "rounded-tl-none"
                          : "rounded-tr-none"
                      }`}
                      style={{
                        background: msg.role === "assistant" ? "var(--bg-surface-2)" : "var(--primary)",
                        color: msg.role === "assistant" ? "var(--text-primary)" : "#fff",
                        border: msg.role === "assistant" ? "1px solid var(--border-color)" : "none",
                      }}
                    >
                      {msg.role === "assistant" ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-black/10 dark:prose-pre:bg-white/10 prose-pre:text-inherit prose-code:text-inherit prose-strong:text-inherit prose-headings:text-inherit">
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={{ pre: PreBlock }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                      )}
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <div className="flex gap-3">
                    <div 
                      className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: "rgba(var(--primary-rgb), 0.1)", color: "var(--primary)" }}
                    >
                      <Bot size={16} />
                    </div>
                    <div
                      className="rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2"
                      style={{ background: "var(--bg-surface-2)", border: "1px solid var(--border-color)" }}
                    >
                      <Loader2 size={16} className="animate-spin" style={{ color: "var(--primary)" }} />
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                        AI is thinking...
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Input */}
            {!isHistoryView && (
              <div
                className="p-4 border-t"
                style={{ borderColor: "var(--border-color)", background: "var(--card-bg)" }}
              >
                <div
                  className="relative flex items-center rounded-2xl transition-all duration-200"
                  style={{ background: "var(--bg-surface-2)", border: "1px solid var(--border-color)" }}
                >
                  <textarea
                    rows={1}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Ask anything..."
                    className="w-full bg-transparent p-4 pr-12 text-sm focus:outline-none resize-none max-h-32"
                    style={{ color: "var(--text-primary)" }}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="absolute right-2 p-2.5 rounded-xl transition-all duration-200 disabled:opacity-50"
                    style={{
                      background: input.trim() ? "var(--primary)" : "transparent",
                      color: input.trim() ? "#fff" : "var(--text-muted)",
                    }}
                  >
                    <Send size={16} />
                  </button>
                </div>
                <p className="text-[10px] text-center mt-3" style={{ color: "var(--text-muted)" }}>
                  AI responses can be inaccurate. Powered by Groq Llama 3.3.
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
