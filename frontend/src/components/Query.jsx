import React, { useState, useRef, useEffect } from "react";
import { queryAgent } from "../services/apiServices";

export default function Query() {
  const [messages, setMessages] = useState(() => {
    const saved = sessionStorage.getItem("chat_messages");
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
    sessionStorage.setItem("chat_messages", JSON.stringify(messages));
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await queryAgent(input);
      const answer =
        response.answer || response.response || JSON.stringify(response);
      const botMsg = { role: "agent", content: answer };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error("queryAgent error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "agent", content: "Error occurred while fetching response." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="flex-grow overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`px-4 py-3 rounded-2xl text-sm max-w-lg whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-gray-800 text-white rounded-br-none"
                  : "bg-gray-200 text-gray-800 rounded-bl-none"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <svg
              className="w-4 h-4 animate-spin text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
            <span>Thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="px-6 py-4 flex gap-2 bg-white">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask something..."
          className="flex-grow px-4 py-2 rounded-full bg-white border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2 rounded-full bg-gray-800 text-white text-sm font-medium hover:bg-gray-700 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
