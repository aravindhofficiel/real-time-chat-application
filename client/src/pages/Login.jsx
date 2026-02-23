import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dark, setDark] = useState(true);
  const navigate = useNavigate();

  const login = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/login`,
        { email, password }
      );

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      navigate("/chat");
    } catch (err) {
      alert("Invalid credentials");
    }
  };

  return (
    <div className={dark ? "auth-container dark" : "auth-container"}>
      <div className="auth-card fade-in">
        <div className="top-bar">
          <h2>Login</h2>
          <button onClick={() => setDark(!dark)} className="theme-btn">
            {dark ? "☀️" : "🌙"}
          </button>
        </div>

        <div className="input-group">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label>Email</label>
        </div>

        <div className="input-group">
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <label>Password</label>
        </div>

        <button onClick={login} className="main-btn">
          Login
        </button>

        <p>
          No account? <Link to="/register">Register</Link>
        </p>
      </div>

      <style>{styles}</style>
    </div>
  );
}

const styles = `
.auth-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  animation: gradientMove 10s ease infinite;
  background: linear-gradient(-45deg, #667eea, #764ba2, #6a11cb, #2575fc);
  background-size: 400% 400%;
  font-family: 'Segoe UI', sans-serif;
}

.dark {
  background: linear-gradient(-45deg, #141e30, #243b55, #000428, #004e92);
}

@keyframes gradientMove {
  0% {background-position: 0% 50%}
  50% {background-position: 100% 50%}
  100% {background-position: 0% 50%}
}

.auth-card {
  width: 90%;
  max-width: 380px;
  padding: 40px 30px;
  backdrop-filter: blur(20px);
  background: rgba(255,255,255,0.15);
  border-radius: 20px;
  border: 1px solid rgba(255,255,255,0.2);
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
  color: white;
  text-align: center;
}

.fade-in {
  animation: fade 0.6s ease;
}

@keyframes fade {
  from {opacity:0; transform: translateY(20px);}
  to {opacity:1; transform: translateY(0);}
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.theme-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
}

.input-group {
  position: relative;
  margin: 25px 0;
}

.input-group input {
  width: 100%;
  padding: 12px 10px;
  border-radius: 10px;
  border: none;
  outline: none;
  background: rgba(255,255,255,0.2);
  color: white;
}

.input-group label {
  position: absolute;
  left: 10px;
  top: 12px;
  transition: 0.3s;
  color: rgba(255,255,255,0.7);
}

.input-group input:focus + label,
.input-group input:valid + label {
  top: -10px;
  font-size: 12px;
  color: #00c6ff;
}

.main-btn {
  width: 100%;
  padding: 12px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, #00c6ff, #0072ff);
  color: white;
  cursor: pointer;
  margin-top: 10px;
}
`;