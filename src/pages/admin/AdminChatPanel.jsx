import { useEffect, useRef, useState, useCallback } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { API_BASE, WS_BASE } from "../../lib/api";
import { getCookie } from "../../lib/cookies";
import AdminAccessFooter from "../../components/admin/AdminAccessFooter";
import { STAFF_ROLES } from "../../utils/roles";
import adminEn from "../../../locales/en/admin.json";
import adminFr from "../../../locales/fr/admin.json";

function formatTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function formatTimeShort(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

export default function AdminChatPanel() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { language } = useLanguage();
  const t = language === "fr" ? adminFr : adminEn;
  const dark = theme === "dark";

  const panel = dark ? "bg-[#262626] border-[#333] text-white" : "bg-white border-gray-200 text-gray-900";
  const sidebar = dark ? "bg-[#1c1c1c] border-[#333]" : "bg-gray-50 border-gray-200";
  const inputBg = dark ? "bg-[#111] border-[#333] text-white placeholder:text-white/30" : "bg-white border-gray-300 text-gray-900";
  const bubbleAdmin = "bg-blue-600 text-white self-end";
  const bubbleUser = dark ? "bg-[#333] text-white self-start" : "bg-gray-100 text-gray-900 self-start";

  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const wsRef = useRef(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const reconnectRef = useRef(null);

  // SEO
  useEffect(() => {
    const prev = document.title;
    document.title = t.page_title_chat;
    let meta = document.querySelector('meta[name="robots"]');
    if (!meta) { meta = document.createElement("meta"); meta.name = "robots"; document.head.appendChild(meta); }
    meta.content = "noindex, nofollow";
    return () => { document.title = prev; meta.content = "index, follow"; };
  }, []);

  // Charger la liste des rooms
  const loadRooms = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/chat/rooms/`, { credentials: "include" });
      if (res.ok) setRooms(await res.json());
    } catch { /* silencieux */ }
  }, []);

  useEffect(() => {
    loadRooms();
    const id = setInterval(loadRooms, 15000);
    return () => clearInterval(id);
  }, [loadRooms]);

  // Connexion WS à la room active
  const connectRoom = useCallback(async (room) => {
    wsRef.current?.close();
    clearTimeout(reconnectRef.current);
    setMessages([]);
    setConnected(false);

    const userPk = room.room_id.replace("support_", "");

    // Ticket éphémère pour contourner le manque de cookie HttpOnly en WS cross-port
    let ticket = "";
    try {
      const res = await fetch(`${API_BASE}/auth/ws-ticket/`, {
        method: "POST",
        credentials: "include",
        headers: { "X-CSRFToken": getCookie("csrftoken") ?? "" },
      });
      if (res.ok) ticket = (await res.json()).ticket ?? "";
    } catch { /* silencieux */ }

    const wsUrl = ticket
      ? `${WS_BASE}/ws/chat/support/${userPk}/?ticket=${ticket}`
      : `${WS_BASE}/ws/chat/support/${userPk}/`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === "history") {
          setMessages(data.messages);
        } else if (data.type === "message") {
          setMessages((prev) => prev.some((m) => m.id === data.message.id) ? prev : [...prev, data.message]);
          // Mettre à jour le compteur de la room
          loadRooms();
        }
      } catch { /* JSON invalide */ }
    };
    ws.onclose = () => {
      setConnected(false);
      reconnectRef.current = setTimeout(() => connectRoom(room), 5000);
    };
    ws.onerror = () => ws.close();
  }, [loadRooms]);

  useEffect(() => {
    if (!activeRoom) return;
    connectRoom(activeRoom);
    return () => { wsRef.current?.close(); clearTimeout(reconnectRef.current); };
  }, [activeRoom]); // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll auto
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || wsRef.current?.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ type: "message", content: text }));
    setInput("");
    inputRef.current?.focus();
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleSelectRoom = async (room) => {
    setActiveRoom(room);
    // Marquer comme lu
    await fetch(`${API_BASE}/chat/rooms/${room.room_id}/read/`, {
      method: "POST",
      credentials: "include",
      headers: { "X-CSRFToken": getCookie("csrftoken") },
    });
    setRooms((prev) => prev.map((r) => r.room_id === room.room_id ? { ...r, unread: 0 } : r));
  };

  return (
    <main className="px-4 md:px-6 py-6">
      <header className="mb-4">
        <h1 className="text-2xl md:text-3xl font-bold">{t.chat_title}</h1>
        <p className={dark ? "text-white/70" : "text-gray-600"}>{t.chat_subtitle}</p>
      </header>

      <div className={`rounded-2xl border overflow-hidden flex ${panel}`} style={{ height: "70vh" }}>

        {/* Sidebar — liste des rooms */}
        <aside className={`w-72 border-r flex-shrink-0 flex flex-col ${sidebar}`}>
          <div className="px-4 py-3 border-b text-sm font-semibold opacity-60 uppercase tracking-wide">
            {t.chat_conversations} ({rooms.length})
          </div>
          <div className="flex-1 overflow-y-auto">
            {rooms.length === 0 && (
              <p className="text-sm opacity-40 text-center mt-8 px-4">{t.chat_no_conversations}</p>
            )}
            {rooms.map((room) => (
              <button
                key={room.room_id}
                onClick={() => handleSelectRoom(room)}
                className={`w-full text-left px-4 py-3 border-b transition hover:brightness-105 ${
                  activeRoom?.room_id === room.room_id
                    ? dark ? "bg-[#262626]" : "bg-blue-50"
                    : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm truncate">
                    {room.user?.username ?? room.room_id}
                  </span>
                  {room.unread > 0 && (
                    <span className="ml-2 min-w-[18px] h-[18px] px-1 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                      {room.unread}
                    </span>
                  )}
                </div>
                <div className="text-xs opacity-50 truncate mt-0.5">
                  {room.last_message?.content ?? "—"}
                </div>
                <div className="text-[10px] opacity-30 mt-0.5">
                  {formatTime(room.last_at)}
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* Zone de chat */}
        <div className="flex-1 flex flex-col min-w-0">
          {!activeRoom ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-sm opacity-40">{t.chat_select}</p>
            </div>
          ) : (
            <>
              {/* Header room */}
              <div className={`px-4 py-3 border-b flex items-center gap-2 ${sidebar}`}>
                <span className={`w-2 h-2 rounded-full ${connected ? "bg-green-400" : "bg-gray-400"}`} />
                <span className="font-semibold text-sm">
                  {activeRoom.user?.username ?? activeRoom.room_id}
                </span>
              </div>

              {/* Messages */}
              <ul
                className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2 list-none"
                aria-live="polite"
                aria-relevant="additions"
                aria-label="Messages de la conversation"
              >
                {messages.map((msg) => {
                  const isOwn = msg.sender_id === user?.id;
                  return (
                    <li key={msg.id} className={`flex flex-col max-w-[75%] ${isOwn ? "self-end items-end" : "self-start items-start"}`}>
                      {!isOwn && (
                        <span className="text-[10px] opacity-50 mb-0.5 px-1">{msg.sender_username}</span>
                      )}
                      <div className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${isOwn ? bubbleAdmin : bubbleUser}`}>
                        {msg.content}
                      </div>
                      <span className="text-[10px] opacity-30 mt-0.5 px-1">{formatTimeShort(msg.created_at)}</span>
                    </li>
                  );
                })}
                <li ref={bottomRef} aria-hidden="true" />
              </ul>

              {/* Input */}
              <div className={`border-t px-3 py-2 flex gap-2 ${sidebar}`}>
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder={t.chat_placeholder}
                  rows={1}
                  maxLength={2000}
                  className={`flex-1 resize-none rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${inputBg}`}
                  aria-label="Saisir une réponse"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || !connected}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  {t.chat_send}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      <AdminAccessFooter allowedRoles={STAFF_ROLES} />
    </main>
  );
}
