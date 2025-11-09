import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, Maximize2, X, Edit3 } from "lucide-react";
import { mockMessages } from "../../data/mockData";

export function MessagePopup() {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = mockMessages.filter(msg => msg.unread).length;
  const navigate = useNavigate();

  const handleOpenFullPage = () => {
    // Close the popup and navigate to the full messages page
    setIsOpen(false);
    // Pass state so the MessagesPage knows it was opened from the popup and
    // can show a back button if desired.
    navigate('/messages', { state: { fromPopup: true } });
  };

  return (
    <>
      {/* Floating Message Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setIsOpen(true)}
            className="relative bg-[#1a1a1a] hover:bg-[#252525] text-white rounded-full px-5 py-3 flex items-center gap-3 shadow-lg border border-[#333] transition-all"
          >
            <div className="relative">
              <MessageCircle className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>
            <span className="font-medium">Tin nhắn</span>
            
            {/* Recent avatars */}
            <div className="flex -space-x-2">
              {mockMessages.slice(0, 3).map((msg, index) => (
                <img
                  key={msg.id}
                  src={msg.user.avatar}
                  alt={msg.user.displayName}
                  className="w-6 h-6 rounded-full border-2 border-[#1a1a1a]"
                  style={{ zIndex: 3 - index }}
                />
              ))}
            </div>
          </button>
        </div>
      )}

      {/* Message Popup */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 h-[500px] bg-[#181818] rounded-2xl shadow-2xl border border-[#333] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#333]">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">Tin nhắn</h3>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleOpenFullPage}
                className="p-1.5 hover:bg-[#252525] rounded-lg transition-colors"
                title="Mở trang tin nhắn đầy đủ"  
              > 
                <Maximize2 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-[#252525] rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages List */}
          <div className="flex-1 overflow-y-auto">
            {mockMessages.map((message) => (
              <div
                key={message.id}
                className="flex items-start gap-3 p-4 hover:bg-[#1f1f1f] cursor-pointer transition-colors border-b border-[#252525]"
              >
                <div className="relative">
                  <img
                    src={message.user.avatar}
                    alt={message.user.displayName}
                    className="w-12 h-12 rounded-full"
                  />
                  {message.unread && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 rounded-full border-2 border-[#181818]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-sm truncate">
                      {message.user.displayName}
                    </p>
                    {message.timestamp && (
                      <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                        · {message.timestamp}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {message.lastMessage}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Compose Button */}
          <div className="p-4 border-t border-[#333]">
            <button className="w-full bg-white hover:bg-gray-200 text-black rounded-lg py-2.5 flex items-center justify-center gap-2 transition-colors">
              <Edit3 className="w-4 h-4" />
              <span className="font-medium">Soạn tin nhắn</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}