import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  History,
  Bot,
  User,
  Image as ImageIcon,
  Mic,
  Send,
  SkipForward,
} from "lucide-react";
import BottomNav from "../components/BottomNav";

// ── Markdown renderer ─────────────────────────────────────────────────────────
function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split("\n");
  const nodes: React.ReactNode[] = [];

  const inlineParse = (raw: string, key: string): React.ReactNode => {
    // Handle **bold** and *italic*
    const parts = raw.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
    return (
      <span key={key}>
        {parts.map((p, i) => {
          if (p.startsWith("**") && p.endsWith("**"))
            return <strong key={i}>{p.slice(2, -2)}</strong>;
          if (p.startsWith("*") && p.endsWith("*"))
            return <em key={i}>{p.slice(1, -1)}</em>;
          return p;
        })}
      </span>
    );
  };

  lines.forEach((line, idx) => {
    const k = String(idx);
    if (/^###\s/.test(line)) {
      nodes.push(
        <p key={k} className="font-bold text-primary text-sm mb-1">
          {line.replace(/^###\s/, "")}
        </p>,
      );
    } else if (/^##\s/.test(line)) {
      nodes.push(
        <p key={k} className="font-bold text-slate-800 text-sm mb-1">
          {line.replace(/^##\s/, "")}
        </p>,
      );
    } else if (/^[-*]\s/.test(line)) {
      nodes.push(
        <p key={k} className="text-sm flex gap-1 mb-0.5">
          <span className="text-primary shrink-0 mt-0.5">•</span>
          {inlineParse(line.replace(/^[-*]\s/, ""), k + "c")}
        </p>,
      );
    } else if (line.trim() === "") {
      nodes.push(<div key={k} className="h-2" />);
    } else {
      nodes.push(
        <p key={k} className="text-sm leading-relaxed mb-0.5">
          {inlineParse(line, k + "c")}
        </p>,
      );
    }
  });

  return nodes;
}

// ── Option extractor ──────────────────────────────────────────────────────────
// Returns an array of short clickable option strings detected in the message.
function extractOptions(text: string): string[] {
  const options: string[] = [];

  // Detect bullet / numbered list items  e.g.  "- Job" or "1. Plumbing"
  const bulletLines = text.match(/^[-*1-9][.)\s]\s*(.+)$/gm) || [];
  if (bulletLines.length >= 2) {
    bulletLines.forEach((l) => {
      const clean = l
        .replace(/^[-*1-9][.)\s]\s*/, "")
        .replace(/\*\*/g, "")
        .replace(/,?\s*or\s*$/i, "")  // strip trailing ", or"
        .replace(/[,?.]$/, "")          // strip trailing punctuation
        .trim();
      if (clean.length > 0 && clean.length < 150) options.push(clean);
    });
    return options;
  }

  // For bold and e.g. detection, only scan the LAST paragraph.
  // This prevents names bolded in greetings (e.g. "welcome, **Ganesh**!")
  // from being picked up as options alongside real choices.
  const paragraphs = text.split(/\n\n+/).filter((p) => p.trim().length > 0);
  const searchText = paragraphs.length > 1 ? paragraphs[paragraphs.length - 1] : text;

  // Detect bold text options: **option1**, **option2**, or **option3**
  const boldMatches = searchText.match(/\*\*([^*]+)\*\*/g);
  if (boldMatches && boldMatches.length >= 2) {
    const boldOptions = boldMatches
      .map((m) => m.replace(/\*\*/g, "").trim())
      .filter((s) => s.length > 0 && s.length < 80);
    if (boldOptions.length >= 2) return boldOptions;
  }

  // Detect  "e.g., A, B or C" or "(e.g., A, B, C)"
  const egMatch = searchText.match(/(?:e\.g[.,]|for example)[,:]?\s*([^?.!\n]+)/i);
  if (egMatch) {
    const raw = egMatch[1].replace(/[()]/g, "");
    const parts = raw
      .split(/,|\s+or\s+/)
      .map((s) => s.replace(/\*\*/g, "").trim())
      .filter((s) => s.length > 0 && s.length < 80);
    if (parts.length >= 2) return parts;
  }

  return [];
}


const API_BASE = "http://localhost:8000/api";

// Generate a stable session_id for this browser session
const getSessionId = () => {
  let id = sessionStorage.getItem("swavalambi_session_id");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("swavalambi_session_id", id);
  }
  return id;
};

// Clear session for reassessment
const clearSession = () => {
  sessionStorage.removeItem("swavalambi_session_id");
  // Generate new session ID
  const newId = crypto.randomUUID();
  sessionStorage.setItem("swavalambi_session_id", newId);
  return newId;
};

interface Message {
  id: string;
  role: "assistant" | "user";
  content: string;
  isReadyForPhoto?: boolean;
  imagePreviewUrl?: string;
}

export default function Assistant() {
  const navigate = useNavigate();
  const sessionId = getSessionId();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState("hi-IN");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load chat history on mount
  useEffect(() => {
    const loadChatHistory = async () => {
      const userId = localStorage.getItem("swavalambi_user_id");
      const storedName = localStorage.getItem("swavalambi_name") || "";
      const userName = storedName && !/^\+?\d{7,}$/.test(storedName.trim()) ? storedName : "";

      const buildWelcome = (name: string) => name
        ? `Namaste, ${name}! 😊 I'm your Swavalambi Assistant. Let's build your profile. What kind of work do you do? (e.g., **Tailoring**, **Plumbing**, **Teaching**)`
        : `Namaste! I am your Swavalambi assistant. Let's build your profile. Tell me, what kind of work do you do? (e.g., **Tailoring**, **Plumbing**, **Teaching**)`;
      
      // Check if this is a reassessment (explicit flag)
      const isReassessment = sessionStorage.getItem("is_reassessment") === "true";
      const urlParams = new URLSearchParams(window.location.search);
      const hasReassessParam = urlParams.get("reassess") === "true";
      
      if (isReassessment || hasReassessParam) {
        // This is a reassessment - start fresh
        console.log("[INFO] Reassessment detected - starting fresh chat");
        sessionStorage.removeItem("is_reassessment");
        setMessages([{ id: "msg-1", role: "assistant", content: buildWelcome(userName) }]);
        setIsLoadingHistory(false);
        return;
      }
      
      if (!userId) {
        setMessages([{ id: "msg-1", role: "assistant", content: buildWelcome(userName) }]);
        setIsLoadingHistory(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/users/${userId}/chat-history`);
        if (res.ok) {
          const data = await res.json();
          if (data.chat_history && data.chat_history.length > 0) {
            const loadedMessages: Message[] = data.chat_history.map((msg: any, idx: number) => ({
              id: `loaded-${idx}`,
              role: msg.role,
              content: msg.content,
            }));
            setMessages(loadedMessages);
            console.log(`[INFO] Loaded ${loadedMessages.length} messages from history`);
          } else {
            setMessages([{ id: "msg-1", role: "assistant", content: buildWelcome(userName) }]);
          }
        } else {
          setMessages([{ id: "msg-1", role: "assistant", content: buildWelcome(userName) }]);
        }
      } catch (error) {
        console.error("Failed to load chat history:", error);
        setMessages([{ id: "msg-1", role: "assistant", content: buildWelcome(userName) }]);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadChatHistory();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Detect intent from user message immediately (don't wait for backend final JSON)
  const detectAndCacheIntent = (msg: string) => {
    const lower = msg.toLowerCase();
    if (lower.includes("loan") || lower.includes("business") || lower.includes("scheme")) {
      localStorage.setItem("swavalambi_intent", "loan");
    } else if (lower.includes("upskill") || lower.includes("learn") || lower.includes("training") || lower.includes("improve")) {
      localStorage.setItem("swavalambi_intent", "upskill");
    } else if (lower.includes("job") || lower.includes("employment") || lower.includes("work")) {
      localStorage.setItem("swavalambi_intent", "job");
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    // Early intent detection — save before backend responds
    detectAndCacheIntent(input);

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const userId = localStorage.getItem("swavalambi_user_id");
      const userName = localStorage.getItem("swavalambi_name") || "";
      
      const payload: any = { session_id: sessionId, message: input };
      if (userId) payload.user_id = userId;
      if (userName && !/^\+?\d{7,}$/.test(userName.trim())) payload.user_name = userName;

      // Real call to FastAPI backend -> ProfilingAgent -> Bedrock/Anthropic
      const res = await fetch(`${API_BASE}/chat/chat-profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.response,
          isReadyForPhoto: data.is_ready_for_photo,
        },
      ]);

      // Cache extracted profile fields for recommendations
      if (data.intent_extracted) {
        localStorage.setItem("swavalambi_intent", data.intent_extracted);
      }
      if (data.profession_skill_extracted) {
        localStorage.setItem("swavalambi_skill", data.profession_skill_extracted);
      }
      if (data.theory_score_extracted) {
        localStorage.setItem("swavalambi_theory_score", data.theory_score_extracted.toString());
      }
      if (data.gender_extracted) {
        localStorage.setItem("swavalambi_gender", data.gender_extracted.toLowerCase());
      }
      if (data.location_extracted) {
        localStorage.setItem("swavalambi_location", data.location_extracted);
      }
      if (data.is_complete) {
        // Redirect based on user's intent
        const userIntent = data.intent_extracted || localStorage.getItem("swavalambi_intent");
        const redirectPath = userIntent === "upskill" ? "/upskill" : userIntent === "job" ? "/jobs" : "/home";
        setTimeout(() => navigate(redirectPath), 6000);
      }
    } catch (e) {
      console.error(e);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content:
            "Sorry, I am having trouble connecting to the AI. Please ensure the backend server is running on port 8000.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: "user",
        content: `Uploaded work sample: ${file.name}`,
        imagePreviewUrl: url,
      },
    ]);

    setIsLoading(true);
    try {
      // Real call to FastAPI backend -> VisionAgent -> Bedrock Vision
      const formData = new FormData();
      formData.append("session_id", sessionId);
      formData.append("photo", file);
      // Pass user identity so backend can persist assessment to DynamoDB
      const userId = localStorage.getItem("swavalambi_user_id") || "";
      const skill  = localStorage.getItem("swavalambi_skill") || "";
      const intent = localStorage.getItem("swavalambi_intent") || "job";
      const theoryScore = localStorage.getItem("swavalambi_theory_score") || "";
      if (userId) formData.append("user_id", userId);
      if (skill)  formData.append("skill", skill);
      formData.append("intent", intent);
      if (theoryScore) formData.append("theory_score", theoryScore);

      const res = await fetch(`${API_BASE}/vision/analyze-vision`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error(`Vision API error: ${res.status}`);
      const result = await res.json();

      localStorage.setItem(
        "swavalambi_skill_rating",
        result.skill_rating.toString(),
      );
      // Keep intent from the chat agent if already set
      if (!localStorage.getItem("swavalambi_intent")) {
        localStorage.setItem("swavalambi_intent", "job");
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `I've analyzed your work! ${result.feedback} You have been assigned **Level ${result.skill_rating}**. Redirecting you to your personalized dashboard...`,
        },
      ]);

      // Redirect based on user's intent
      const userIntent = localStorage.getItem("swavalambi_intent");
      const redirectPath = userIntent === "upskill" ? "/upskill" : userIntent === "job" ? "/jobs" : "/home";
      setTimeout(() => navigate(redirectPath), 8000);
    } catch (e) {

      console.error(e);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content:
            "Sorry, I could not analyze the image. Please ensure the backend is running and try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipAssessment = () => {
    // Escape hatch: Zero rating sets them to upskilling focus
    localStorage.setItem("swavalambi_skill_rating", "0");
    localStorage.setItem("swavalambi_intent", "upskill");
    navigate("/upskill");
  };

  // Voice recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        await sendVoiceMessage(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error("Microphone access denied:", error);
      alert("Please allow microphone access to use voice input");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const sendVoiceMessage = async (audioBlob: Blob) => {
    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('session_id', sessionId);
      formData.append('language', selectedLanguage);
      
      const userId = localStorage.getItem("swavalambi_user_id");
      if (userId) formData.append('user_id', userId);

      const res = await fetch(`${API_BASE}/voice/chat`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error(`Voice API error: ${res.status}`);
      const data = await res.json();

      // Add user message
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "user",
          content: data.transcribed_text,
        },
      ]);

      // Add assistant response
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.localized_response,
          isReadyForPhoto: data.is_ready_for_photo,
        },
      ]);

      // Play audio response
      if (data.audio_base64) {
        playAudio(data.audio_base64, data.audio_format);
      }

      // Cache extracted data
      if (data.intent_extracted) {
        localStorage.setItem("swavalambi_intent", data.intent_extracted);
      }
      if (data.profession_skill_extracted) {
        localStorage.setItem("swavalambi_skill", data.profession_skill_extracted);
      }
      if (data.theory_score_extracted) {
        localStorage.setItem("swavalambi_theory_score", data.theory_score_extracted.toString());
      }
      if (data.gender_extracted) {
        localStorage.setItem("swavalambi_gender", data.gender_extracted.toLowerCase());
      }
      
      if (data.is_complete) {
        // Redirect based on user's intent
        const userIntent = data.intent_extracted || localStorage.getItem("swavalambi_intent");
        const redirectPath = userIntent === "upskill" ? "/upskill" : userIntent === "job" ? "/jobs" : "/home";
        setTimeout(() => navigate(redirectPath), 6000);
      }
    } catch (error) {
      console.error("Voice chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Sorry, I couldn't process your voice message. Please try again or type your message.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const playAudio = (base64Audio: string, format: string) => {
    const audio = new Audio(`data:audio/${format};base64,${base64Audio}`);
    audio.play().catch(err => console.error("Audio playback failed:", err));
  };

  return (
    <div className="bg-background-light text-slate-900 min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 bg-background-light/80 backdrop-blur-md border-b border-primary/10">
        <div className="flex items-center justify-between p-4 max-w-lg mx-auto w-full">
          <Link
            to="/home"
            className="p-2 hover:bg-primary/10 rounded-full transition-colors"
          >
            <ArrowLeft className="text-slate-700" />
          </Link>
          <div className="flex flex-col items-center">
            <h1 className="text-lg font-bold leading-tight">AI Assistant</h1>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                Online
              </span>
            </div>
          </div>
          <button className="p-2 hover:bg-primary/10 rounded-full transition-colors">
            <History className="text-slate-700" />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-6 mx-auto w-full pb-80">
        {/* Skip Header */}
        <div className="flex justify-center mb-4">
          <button
            onClick={handleSkipAssessment}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold hover:bg-slate-200 transition-colors shadow-sm border border-slate-200"
          >
            <SkipForward size={14} /> Skip Assessment For Now
          </button>
        </div>

        {/* Loading history indicator */}
        {isLoadingHistory && (
          <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            Loading conversation history...
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
          >
            {msg.role === "assistant" && (
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shrink-0 shadow-lg shadow-primary/20">
                <Bot className="fill-current" />
              </div>
            )}

            <div
              className={`flex flex-col gap-1 max-w-[80%] ${msg.role === "user" ? "items-end" : ""}`}
            >
              <p
                className={`text-[11px] font-semibold uppercase ${msg.role === "user" ? "text-slate-400 mr-1" : "text-primary ml-1"}`}
              >
                {msg.role === "user" ? "You" : "Assistant"}
              </p>

              <div
                className={`p-4 rounded-xl shadow-sm border ${
                  msg.role === "user"
                    ? "bg-primary text-white rounded-tr-none border-primary"
                    : "bg-white text-slate-900 rounded-tl-none border-slate-100"
                }`}
              >
                {msg.imagePreviewUrl && (
                  <div className="relative mb-2">
                    <img
                      src={msg.imagePreviewUrl}
                      alt="Upload preview"
                      className="rounded-lg max-w-full h-40 object-cover"
                    />
                  </div>
                )}

                {/* Render markdown for assistant, plain text for user */}
                {msg.role === "assistant" ? (
                  <div className="space-y-0.5">
                    {renderMarkdown(msg.content)}
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </p>
                )}

                {/* Clickable option chips */}
                {msg.role === "assistant" &&
                  (() => {
                    const opts = extractOptions(msg.content);
                    return opts.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {opts.map((opt, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              setInput(opt);
                            }}
                            className="text-xs font-semibold px-3 py-1.5 bg-primary/10 text-primary border border-primary/25 rounded-full hover:bg-primary hover:text-white active:scale-95 transition-all duration-150"
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    ) : null;
                  })()}

                {msg.isReadyForPhoto && (
                  <div className="mt-3">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-lg text-sm font-semibold hover:bg-primary/20 transition-colors w-full justify-center"
                    >
                      <ImageIcon size={16} /> Upload Work Sample
                    </button>
                  </div>
                )}
              </div>
            </div>

            {msg.role === "user" && (
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                <User className="text-slate-500" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shrink-0">
              <Bot className="fill-current animate-pulse" />
            </div>
            <div className="bg-white p-4 rounded-xl rounded-tl-none shadow-sm border border-slate-100 flex items-center gap-1">
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
              <div
                className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.4s" }}
              ></div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-full max-w-[480px] px-4 z-20">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-4">
          {/* Language Selector */}
          <div className="mb-3 flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Language:</span>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="hi-IN">🇮🇳 Hindi</option>
              <option value="ta-IN">🇮🇳 Tamil</option>
              <option value="te-IN">🇮🇳 Telugu</option>
              <option value="mr-IN">🇮🇳 Marathi</option>
              <option value="kn-IN">🇮🇳 Kannada</option>
              <option value="ml-IN">🇮🇳 Malayalam</option>
              <option value="bn-IN">🇮🇳 Bengali</option>
              <option value="gu-IN">🇮🇳 Gujarati</option>
              <option value="en-IN">🇬🇧 English</option>
            </select>
          </div>
          
          <div className="flex items-center justify-center gap-1 mb-4 h-8">
            <div className="w-1 bg-primary/40 h-3 rounded-full"></div>
            <div className="w-1 bg-primary/60 h-5 rounded-full"></div>
            <div className="w-1 bg-primary h-8 rounded-full"></div>
            <div className="w-1 bg-primary/80 h-6 rounded-full"></div>
            <div className="w-1 bg-primary/40 h-4 rounded-full"></div>
            <div className="w-1 bg-primary/60 h-7 rounded-full"></div>
            <div className="w-1 bg-primary h-5 rounded-full"></div>
            <div className="w-1 bg-primary/40 h-2 rounded-full"></div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-slate-400 hover:text-primary transition-colors"
              title="Upload Image"
            >
              <ImageIcon />
            </button>
            <div className="flex-1 bg-slate-100 rounded-xl px-4 py-3">
              <input
                className="bg-transparent border-none focus:ring-0 w-full text-sm placeholder:text-slate-500"
                placeholder="Type or ask anything..."
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              />
            </div>
            {input.trim() ? (
              <button
                onClick={handleSendMessage}
                className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center shadow-lg shadow-primary/30 hover:scale-105 transition-transform"
              >
                <Send className="w-5 h-5 fill-current ml-1" />
              </button>
            ) : isRecording ? (
              <button
                onClick={stopRecording}
                className="w-12 h-12 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg animate-pulse"
                title="Stop Recording"
              >
                <div className="w-4 h-4 bg-white rounded-sm"></div>
              </button>
            ) : (
              <button
                onClick={startRecording}
                className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center shadow-lg shadow-primary/30 hover:scale-105 transition-transform"
                title="Voice Input"
              >
                <Mic className="fill-current" />
              </button>
            )}
          </div>

          <div className="mt-4 flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0">
              Suggestions:
            </span>
            <button className="text-xs text-slate-600 whitespace-nowrap px-3 py-1 bg-slate-50 rounded-lg border border-slate-200">
              Ask about jobs
            </button>
            <button className="text-xs text-slate-600 whitespace-nowrap px-3 py-1 bg-slate-50 rounded-lg border border-slate-200">
              Learn about loans
            </button>
            <button className="text-xs text-slate-600 whitespace-nowrap px-3 py-1 bg-slate-50 rounded-lg border border-slate-200">
              Skill training
            </button>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
