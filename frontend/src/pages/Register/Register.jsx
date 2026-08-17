import { useState } from "react";
import { Eye, EyeOff, UserPlus, UserCog, Stethoscope, ClipboardList } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import "./Register.css";



const ROLES = [
  { id: "Admin", name: "Admin", desc: "Full system oversight", icon: UserCog },
  { id: "Pharmacist", name: "Pharmacist", desc: "Owns the shelf & suppliers", icon: Stethoscope },
  { id: "Staff", name: "Staff", desc: "Day-to-day stock updates", icon: ClipboardList },
];

export default function RegisterPage() {
    const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    role: "Pharmacist",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitted] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validate() {
    const next = {};
    if (!form.fullName.trim()) next.fullName = "Enter your full name.";
    if (!form.email.trim()) next.email = "Enter your email address.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "Enter a valid email address.";
    if (!form.phone.trim()) next.phone = "Enter a phone number.";
    else if (!/^[0-9+\-\s()]{7,15}$/.test(form.phone)) next.phone = "Enter a valid phone number.";
    if (!form.password) next.password = "Create a password.";
    else if (form.password.length < 8) next.password = "Use at least 8 characters.";
    if (!form.role) next.role = "Select a role.";
    return next;
  }

async function handleSubmit(e) {

  e.preventDefault();

  const next = validate();

  setErrors(next);

  if (Object.keys(next).length > 0) return;

  const roleMap = {
    Admin: 1,
    Pharmacist: 2,
    Staff: 3
  };

  try {

    await axios.post(
      `${import.meta.env.VITE_API_URL}/api/auth/register`,
      {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: {
          roleId: roleMap[form.role]
        }
      }
    );

    alert("Registration Successful");

    navigate("/login");

  } catch (err) {

    console.log(err.response?.data);

    alert("Registration Failed");

  }
}
  return (
    <AuthLayout
      eyebrow="Get started"
      title="Bring your team onto one inventory system."
      subtitle="Set up an account, pick a role, and start tracking stock, suppliers, and expiry from day one."
    >
      <p className="auth-heading-eyebrow ms-mono">New account</p>
      <h2 className="auth-heading-title ms-display" style={{color:"#073F38"}}>Create your account</h2>
      <p className="auth-heading-sub">
        Already have an account? <a href="/login">Sign in</a>
      </p>

      {submitted && (
        <div className="auth-success" style={{ marginBottom: 18 }}>
          <UserPlus size={16} /> Account created successfully.
        </div>
      )}

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="auth-row-2col">
          <div className="auth-field">
            <label className="auth-label" htmlFor="reg-name">Full name</label>
            <input
              id="reg-name"
              type="text"
              className={`auth-input ${errors.fullName ? "invalid" : ""}`}
              placeholder="Your full name"
              value={form.fullName}
              onChange={(e) => update("fullName", e.target.value)}
              autoComplete="name"
            />
            {errors.fullName && <p className="auth-error">{errors.fullName}</p>}
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="reg-phone">Phone number</label>
            <input
              id="reg-phone"
              type="tel"
              className={`auth-input ${errors.phone ? "invalid" : ""}`}
              placeholder="+91 9876543210"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              autoComplete="tel"
            />
            {errors.phone && <p className="auth-error">{errors.phone}</p>}
          </div>
        </div>

        <div className="auth-field">
          <label className="auth-label" htmlFor="reg-email">Email address</label>
          <input
            id="reg-email"
            type="email"
            className={`auth-input ${errors.email ? "invalid" : ""}`}
            placeholder="you@gmail.com"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            autoComplete="email"
          />
          {errors.email && <p className="auth-error">{errors.email}</p>}
        </div>

        <div className="auth-field">
          <label className="auth-label" htmlFor="reg-password">Password</label>
          <div className="auth-input-wrap">
            <input
              id="reg-password"
              type={showPassword ? "text" : "password"}
              className={`auth-input has-icon ${errors.password ? "invalid" : ""}`}
              placeholder="At least 8 characters"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              autoComplete="new-password"
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
          {errors.password ? (
            <p className="auth-error">{errors.password}</p>
          ) : (
            <p className="auth-hint">Use at least 8 characters.</p>
          )}
        </div>

        <div className="auth-field">
          <label className="auth-label">Role</label>
          <div className="auth-role-grid">
            {ROLES.map((r) => {
              const Icon = r.icon;
              const active = form.role === r.id;
              return (
                <button
                  type="button"
                  key={r.id}
                  className={`auth-role-card ${active ? "active" : ""}`}
                  onClick={() => update("role", r.id)}
                  aria-pressed={active}
                >
                  <Icon size={18} color={active ? "var(--teal-deep)" : "var(--teal)"} />
                  <span className="auth-role-name">{r.name}</span>
                  <span className="auth-role-desc">{r.desc}</span>
                </button>
              );
            })}
          </div>
          {errors.role && <p className="auth-error">{errors.role}</p>}
        </div>

        <button type="submit" className="auth-submit">
          Create account <UserPlus size={16} />
        </button>
      </form>
    </AuthLayout>
  );
}
