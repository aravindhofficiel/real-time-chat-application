import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const socket = io(import.meta.env.VITE_BACKEND_URL);

export default function Chat() {
  const navigate = useNavigate();

  // 🔹 Safe user parsing
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const [users, setUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  const messagesEndRef = useRef(null);

  // 🔴 If no login session
  if (!user) {
    return (
      <div style={{ padding: "40px", color: "white" }}>
        No active session. Please login again.
      </div>
    );
  }

  // 🔹 Load users once
  useEffect(() => {
    socket.emit("joinRoom", user._id);

    fetchUsers();

    socket.on("updateOnlineUsers", (data) => {
      setOnlineUsers(data);
    });

    return () => {
      socket.off("updateOnlineUsers");
    };
  }, []);

  // 🔹 Listen for messages
  useEffect(() => {
    socket.on("receiveMessage", (msg) => {
      if (
        selectedUser &&
        (msg.sender === selectedUser._id ||
          msg.receiver === selectedUser._id)
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [selectedUser]);

  // 🔹 Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users`);
     setUsers(res.data);
    } catch (err) {
      console.error("Users fetch error", err);
    }
  };

  const fetchMessages = async (receiverId) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/messages/${user._id}/${receiverId}`
      );
      setMessages(res.data);
    } catch (err) {
      console.error("Message fetch error", err);
    }
  };

  const selectUser = (u) => {
    setSelectedUser(u);
    fetchMessages(u._id);
  };

  const sendMessage = () => {
    if (!message.trim() || !selectedUser) return;

    socket.emit("sendMessage", {
      sender: user._id,
      receiver: selectedUser._id,
      text: message,
    });

    setMessage("");
  };

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <>
      <div className="chat-container">

        {/* SIDEBAR */}
        <div className="sidebar">
          <div className="current-user">
            <div className="avatar">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <strong>{user.name}</strong>
              <div className="small-text">You</div>
            </div>
          </div>

          <h4 className="section-title">Users</h4>

          {users.length === 0 && (
            <div className="small-text">No users found</div>
          )}

          {users.map((u) => (
            <div
              key={u._id}
              className={`user-item ${
                selectedUser?._id === u._id ? "active" : ""
              }`}
              onClick={() => selectUser(u)}
            >
              <span>{u.name}</span>
              <span
                className={
                  onlineUsers.includes(u._id)
                    ? "status online"
                    : "status offline"
                }
              />
            </div>
          ))}

          <button className="logout-btn" onClick={logout}>
            Logout
          </button>
        </div>

        {/* CHAT AREA */}
        <div className="chat-area">
          {selectedUser ? (
            <>
              <div className="chat-header">
                <strong>{selectedUser.name}</strong>
                <div className="small-text">
                  {onlineUsers.includes(selectedUser._id)
                    ? "Online"
                    : "Offline"}
                </div>
              </div>

              <div className="messages">
                {messages.map((m) => (
                  <div
                    key={m._id}
                    className={
                      m.sender === user._id
                        ? "message my"
                        : "message other"
                    }
                  >
                    {m.text}
                  </div>
                ))}
                <div ref={messagesEndRef}></div>
              </div>

              <div className="input-area">
                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type message..."
                />
                <button onClick={sendMessage}>Send</button>
              </div>
            </>
          ) : (
            <div className="no-chat">
              Select a user to start conversation
            </div>
          )}
        </div>
      </div>

      <style>{styles}</style>
    </>
  );
}

const styles = `
.chat-container {
  display: flex;
  height: 100vh;
  background: #0d1117;
  color: #e6edf3;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* Sidebar */
.sidebar {
  width: 260px;
  background: #161b22;
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.current-user {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 18px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #2563eb;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 600;
  font-size: 14px;
  color: white;
}

.section-title {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 10px 0;
  color: #8b949e;
}

.user-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s ease;
  color: #c9d1d9;
}

.user-item:hover {
  background: #21262d;
}

.user-item.active {
  background: #30363d;
  color: white;
}

.status {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.online { background: #22c55e; }
.offline { background: #ef4444; }

.logout-btn {
  margin-top: auto;
  padding: 10px;
  border-radius: 6px;
  border: none;
  background: #21262d;
  color: #c9d1d9;
  cursor: pointer;
  transition: background 0.2s ease;
}

.logout-btn:hover {
  background: #ef4444;
  color: white;
}

/* Chat Area */
.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #0d1117;
}

.chat-header {
  padding: 18px 24px;
  background: #161b22;
  font-weight: 600;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.messages {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.message {
  padding: 10px 14px;
  border-radius: 8px;
  max-width: 60%;
  font-size: 14px;
  line-height: 1.4;
}

.my {
  align-self: flex-end;
  background: #2563eb;
  color: white;
}

.other {
  align-self: flex-start;
  background: #21262d;
  color: #e6edf3;
}

.input-area {
  display: flex;
  padding: 16px 24px;
  background: #161b22;
}

.input-area input {
  flex: 1;
  padding: 10px 14px;
  border-radius: 6px;
  border: none;
  background: #21262d;
  color: white;
  outline: none;
}

.input-area input::placeholder {
  color: #8b949e;
}

.input-area button {
  margin-left: 10px;
  padding: 10px 16px;
  border-radius: 6px;
  border: none;
  background: #2563eb;
  color: white;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.input-area button:hover {
  opacity: 0.85;
}

.no-chat {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #8b949e;
  font-size: 14px;
}

.small-text {
  font-size: 11px;
  color: #8b949e;
}
`;