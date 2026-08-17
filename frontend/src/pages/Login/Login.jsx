import { useState } from "react";
import { Eye, EyeOff, LogIn } from "lucide-react";
import AuthLayout from "./AuthLayout";
import "./Login.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import GoogleLoginButton from "../../components/GoogleLoginButton";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState({});
  const [submitted] = useState(false);
const navigate = useNavigate();

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validate() {
    const next = {};
    if (!form.email.trim()) next.email = "Enter your email address.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "Enter a valid email address.";
    if (!form.password) next.password = "Enter your password.";
    return next;
  }

  async function handleSubmit(e) {
  e.preventDefault();

  const next = validate();
  setErrors(next);

  if (Object.keys(next).length > 0) return;

  try {

    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/auth/login`,
      {
        email: form.email,
        password: form.password,
      }
    );

    localStorage.setItem("token", response.data.token);
    localStorage.setItem("roleName", response.data.roleName);
    localStorage.setItem("userId", response.data.userId);
    localStorage.setItem("fullName", response.data.fullName);

    const role = response.data.roleName;

    if (role === "Admin") {
      navigate("/admin");
    } else if (role === "Pharmacist") {
      navigate("/pharmacist");
    } else {
      navigate("/staff");
    }

  } catch (err) {
    alert("Invalid Email or Password");
    console.log(err);
  }
}

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Sign in to keep every shelf on track."
      subtitle="Check low-stock alerts, expiring batches, and supplier updates the moment you log in."
    >
      <p className="auth-heading-eyebrow ms-mono">Account access</p>
      <h2 className="auth-heading-title ms-display" style={{color:"#073F38"}}>Sign in</h2>
      <p className="auth-heading-sub">
        New to MediStock? <a href="/register">Create an account</a>
      </p>

      {submitted && (
        <div className="auth-success" style={{ marginBottom: 18 }}>
          <LogIn size={16} /> Signed in successfully.
        </div>
      )}

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="auth-field">
          <label className="auth-label" htmlFor="login-email">Email address</label>
          <div className="auth-input-wrap">
            <input
              id="login-email"
              type="email"
              className={`auth-input ${errors.email ? "invalid" : ""}`}
              placeholder="you@gmail.com"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              autoComplete="email"
            />
          </div>
          {errors.email && <p className="auth-error">{errors.email}</p>}
        </div>

        <div className="auth-field">
          <div className="auth-row-between">
            <label className="auth-label" htmlFor="login-password">Password</label>
            <a href="/forgot-password" className="auth-link">Forgot password?</a>
          </div>
          <div className="auth-input-wrap">
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              className={`auth-input has-icon ${errors.password ? "invalid" : ""}`}
              placeholder="Enter your password"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="auth-icon-btn"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          {errors.password && <p className="auth-error">{errors.password}</p>}
        </div>

        <div className="auth-row-between">
          <label className="auth-check">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            Keep me signed in
          </label>
        </div>

        <button type="submit" className="auth-submit">
          Sign in <LogIn size={16} />
        </button>
<div
    style={{
        marginTop:"20px",
        display:"flex",
        justifyContent:"center"
      

    }}
>

    <GoogleLoginButton/>

</div>
        
      </form>
    </AuthLayout>
  );
}
