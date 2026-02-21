import { useState, useEffect } from "react";
import { X, Search, MessageCircle, Star, MapPin, CheckCircle, Loader, Send, ChevronRight } from "lucide-react";

const API_URL = "http://localhost:5000/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

export function NewConversationModal({ onClose, onConversationStarted }) {
  const [step, setStep] = useState("search"); // search | compose
  const [searchQuery, setSearchQuery] = useState("");
  const [hosts, setHosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedHost, setSelectedHost] = useState(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHosts();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchHosts(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchHosts = async (query = "") => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ limit: 20 });
      if (query) params.append("location", query);

      const res = await fetch(`${API_URL}/hosts?${params}`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) setHosts(data.hosts || []);
    } catch (e) {
      console.error("Failed to fetch hosts:", e);
    } finally {
      setLoading(false);
    }
  };

  const startConversation = async () => {
    if (!message.trim() || !selectedHost) return;
    try {
      setSending(true);
      setError(null);

      // First, find or create conversation using the send endpoint
      const res = await fetch(`${API_URL}/messages/send`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          receiverId: selectedHost.userId?._id || selectedHost.userId,
          content: message.trim(),
          type: "text",
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to send message");

      onConversationStarted?.();
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setSending(false);
    }
  };

  const filteredHosts = hosts.filter(
    (h) =>
      h.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {step === "compose" && (
              <button
                onClick={() => setStep("search")}
                className="text-white/80 hover:text-white transition-colors"
              >
                ←
              </button>
            )}
            <MessageCircle className="w-5 h-5 text-white" />
            <h2 className="text-white font-semibold text-lg">
              {step === "search" ? "Start New Conversation" : `Message ${selectedHost?.name}`}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === "search" ? (
          <div className="flex flex-col" style={{ maxHeight: "70vh" }}>
            {/* Search */}
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search hosts by name or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Host List */}
            <div className="overflow-y-auto flex-1">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader className="w-5 h-5 animate-spin text-blue-500 mr-2" />
                  <span className="text-sm text-gray-500">Finding hosts...</span>
                </div>
              ) : filteredHosts.length === 0 ? (
                <div className="py-12 text-center px-6">
                  <div className="w-14 h-14 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                    <Search className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium">No hosts found</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Try searching with a different name or location
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {filteredHosts.map((host) => (
                    <button
                      key={host._id}
                      onClick={() => {
                        setSelectedHost(host);
                        setStep("compose");
                      }}
                      className="w-full px-4 py-3.5 hover:bg-blue-50 transition-colors text-left flex items-center gap-3 group"
                    >
                      {/* Avatar */}
                      <div className="flex-shrink-0 relative">
                        {host.image ? (
                          <img
                            src={host.image}
                            alt={host.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-100"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "flex";
                            }}
                          />
                        ) : null}
                        <div
                          className={`w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg border-2 border-gray-100 ${host.image ? "hidden" : "flex"}`}
                        >
                          {host.name?.charAt(0) || "?"}
                        </div>
                        {host.verified && (
                          <div className="absolute -bottom-0.5 -right-0.5 bg-blue-500 rounded-full p-0.5">
                            <CheckCircle className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900 truncate">
                            {host.name}
                          </span>
                          {host.hostBadge && host.hostBadge !== "Host" && (
                            <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-md font-medium flex-shrink-0">
                              {host.hostBadge}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          {host.location && (
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {host.location}
                            </span>
                          )}
                          {host.rating > 0 && (
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                              {host.rating.toFixed(1)}
                              {host.reviews > 0 && (
                                <span className="text-gray-400">({host.reviews})</span>
                              )}
                            </span>
                          )}
                        </div>
                        {host.description && (
                          <p className="text-xs text-gray-400 mt-0.5 truncate">
                            {host.description}
                          </p>
                        )}
                      </div>

                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-400 flex-shrink-0 transition-colors" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
              <p className="text-xs text-gray-500 text-center">
                {filteredHosts.length} host{filteredHosts.length !== 1 ? "s" : ""} available
              </p>
            </div>
          </div>
        ) : (
          /* Compose Step */
          <div className="p-5">
            {/* Selected host preview */}
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl mb-4">
              <div className="flex-shrink-0">
                {selectedHost?.image ? (
                  <img
                    src={selectedHost.image}
                    alt={selectedHost.name}
                    className="w-10 h-10 rounded-full object-cover border border-blue-200"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                    {selectedHost?.name?.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{selectedHost?.name}</p>
                {selectedHost?.location && (
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {selectedHost.location}
                  </p>
                )}
              </div>
            </div>

            {/* Message input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your message
              </label>
              <textarea
                autoFocus
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={`Hi ${selectedHost?.name}, I'm interested in your hosting services and would love to learn more...`}
                rows={5}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    startConversation();
                  }
                }}
              />
              <p className="text-xs text-gray-400 mt-1.5 text-right">
                {message.length}/500 · Ctrl+Enter to send
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Quick starters */}
            <div className="mb-4">
              <p className="text-xs text-gray-400 mb-2">Quick starters:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  "Hi! I'm planning a trip and interested in your services.",
                  "What dates are you available?",
                  "Can you tell me more about your accommodation?",
                ].map((starter) => (
                  <button
                    key={starter}
                    onClick={() => setMessage(starter)}
                    className="text-xs px-2.5 py-1.5 bg-gray-100 hover:bg-blue-50 hover:text-blue-600 border border-gray-200 hover:border-blue-200 rounded-lg transition-colors text-gray-600"
                  >
                    {starter.length > 35 ? starter.slice(0, 35) + "…" : starter}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setStep("search")}
                className="flex-1 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={startConversation}
                disabled={!message.trim() || sending}
                className="flex-1 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-200 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors"
              >
                {sending ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Message
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}