import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Profile() {
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("user"));

  const [name, setName] = useState(storedUser?.name || "");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

 const saveProfile = async () => {
  try {
    setLoading(true);

    await axios.put(
      `${import.meta.env.VITE_BACKEND_URL}/api/users/${storedUser._id}`,
      { name, password }
    );

    const updatedUser = { ...storedUser, name };
    localStorage.setItem("user", JSON.stringify(updatedUser));

    alert("Profile updated");
  } catch (err) {
    alert("Update failed");
  } finally {
    setLoading(false);
  }
};
  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="profile-wrapper">
      <div className="profile-card">
        <div className="profile-header">
          <div className="avatar">
            {name?.charAt(0).toUpperCase()}
          </div>
          <h2>{name}</h2>
          <p>{storedUser?.email}</p>
        </div>

        <div className="profile-form">
          <div className="input-group">
            <label>Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave empty to keep current"
            />
          </div>

          <button onClick={saveProfile} className="primary-btn">
            {loading ? "Saving..." : "Save Changes"}
          </button>

          <button onClick={logout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>

      <style>{styles}</style>
    </div>
  );
}

const styles = `
.profile-wrapper {
  min-height: 100vh;
  background: #0f172a;
  background-image:
    radial-gradient(circle at 20% 30%, rgba(59,130,246,0.15), transparent 40%),
    radial-gradient(circle at 80% 70%, rgba(139,92,246,0.15), transparent 40%);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.profile-card {
  width: 100%;
  max-width: 500px;
  padding: 40px;
  border-radius: 20px;
  backdrop-filter: blur(20px);
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.08);
  box-shadow: 0 20px 40px rgba(0,0,0,0.4);
  color: white;
}

.profile-header {
  text-align: center;
  margin-bottom: 30px;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #3b82f6;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 28px;
  font-weight: bold;
  margin: 0 auto 15px;
}

.profile-header h2 {
  margin: 0;
}

.profile-header p {
  color: rgba(255,255,255,0.6);
  font-size: 14px;
}

.profile-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input-group label {
  font-size: 13px;
  color: rgba(255,255,255,0.6);
}

.input-group input {
  padding: 12px;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.15);
  background: rgba(255,255,255,0.05);
  color: white;
  outline: none;
}

.primary-btn {
  padding: 14px;
  border-radius: 10px;
  border: none;
  background: #3b82f6;
  color: white;
  cursor: pointer;
}

.primary-btn:hover {
  background: #2563eb;
}

.logout-btn {
  padding: 12px;
  border-radius: 10px;
  border: none;
  background: #ef4444;
  color: white;
  cursor: pointer;
}

.logout-btn:hover {
  background: #dc2626;
}

@media (max-width: 480px) {
  .profile-card {
    padding: 30px 20px;
  }
}
`;