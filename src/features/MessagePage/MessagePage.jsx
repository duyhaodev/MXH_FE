import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Search, Phone, Video, Info, Smile, Mic, Image, Heart, ChevronLeft } from "lucide-react";
import { mockMessages, mockConversations } from "../../data/mockData";

export function MessagesPage({ onBack }) {
  const [selectedConversation, setSelectedConversation] = useState(mockMessages[0]);
  const [messageInput, setMessageInput] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  // Show back button if parent passed an onBack prop or if the page was
  // opened from the popup (we pass state.fromPopup when navigating).
  const shouldShowBack = Boolean(onBack || location.state?.fromPopup);
  const handleBack = onBack ? onBack : () => navigate(-1);

  const currentMessages = mockConversations[selectedConversation.id] || [];

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      // Here you would add logic to send message
      setMessageInput("");
    }
  };

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Left Sidebar - Conversations List */}
      <div className="w-80 border-r border-[#333] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[#333]">
          <div className="flex items-center gap-3 mb-4">
            {shouldShowBack && (
              <button
                onClick={handleBack}
                className="p-1 hover:bg-[#252525] rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <h2 className="text-xl">dh25.09</h2>
          </div>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Tìm kiếm"
              className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-[#555]"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {mockMessages.map((message) => (
            <div
              key={message.id}
              onClick={() => setSelectedConversation(message)}
              className={`flex items-start gap-3 p-4 cursor-pointer transition-colors border-b border-[#1a1a1a] ${
                selectedConversation.id === message.id
                  ? "bg-[#1a1a1a]"
                  : "hover:bg-[#0f0f0f]"
              }`}
            >
              <img
                src={message.user.avatar}
                alt={message.user.displayName}
                className="w-12 h-12 rounded-full flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-sm truncate">
                    {message.user.displayName}
                  </p>
                  {message.timestamp && (
                    <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                      {message.timestamp}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-400 truncate">
                  {message.lastMessage}
                </p>
              </div>
              {message.unread && (
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#333]">
          <div className="flex items-center gap-3">
            <img
              src={selectedConversation.user.avatar}
              alt={selectedConversation.user.displayName}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <h3 className="font-medium">{selectedConversation.user.displayName}</h3>
              <p className="text-xs text-gray-500">Threads profile</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors">
              <Phone className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors">
              <Video className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors">
              <Info className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {currentMessages.map((msg) => (
            <div key={msg.id} className="space-y-1">
              {/* Timestamp */}
              {msg.timestamp && (
                <div className="text-center text-xs text-gray-500 my-4">
                  {msg.timestamp}
                </div>
              )}
              
              {/* Message */}
              <div
                className={`flex ${
                  msg.sender === "me" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.sender === "them" && (
                  <img
                    src={selectedConversation.user.avatar}
                    alt={selectedConversation.user.displayName}
                    className="w-7 h-7 rounded-full mr-2 flex-shrink-0 mt-1"
                  />
                )}
                <div
                  className={`max-w-md px-4 py-2 rounded-2xl ${
                    msg.sender === "me"
                      ? "bg-[#0095f6] text-white"
                      : "bg-[#262626] text-white"
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-[#333]">
          <div className="flex items-center gap-3 bg-[#1a1a1a] rounded-full px-4 py-2 border border-[#333]">
            <button className="text-gray-400 hover:text-white transition-colors">
              <Smile className="w-5 h-5" />
            </button>
            <input
              type="text"
              placeholder="Nhắn tin..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              className="flex-1 bg-transparent border-none outline-none text-sm"
            />
            <div className="flex items-center gap-2">
              <button className="text-gray-400 hover:text-white transition-colors">
                <Mic className="w-5 h-5" />
              </button>
              <button className="text-gray-400 hover:text-white transition-colors">
                <Image className="w-5 h-5" />
              </button>
              <button className="text-gray-400 hover:text-white transition-colors">
                <Smile className="w-5 h-5" />
              </button>
              <button className="text-gray-400 hover:text-white transition-colors">
                <Heart className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
