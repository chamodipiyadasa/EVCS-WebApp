// src/pages/OwnerForm.jsx
import { useState, useEffect } from "react";
import { createOwner, getOwner, updateOwner } from "../services/owners";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

/* ---------- small ui helpers ---------- */
const labelCls = "block text-sm font-medium text-slate-800 mb-1";
const inputBase =
  "w-full rounded-lg border px-3 py-2 outline-none transition focus:ring-2";
const inputOk = `${inputBase} border-slate-300 focus:ring-emerald-200`;
const inputErr = `${inputBase} border-rose-300 focus:ring-rose-200 bg-rose-50/30`;
const hintCls = "text-xs text-slate-500 mt-1";
const errCls = "text-rose-600 text-xs mt-1";

function Strength({ value = "" }) {
  const v = value.trim();
  const lvl =
    !v ? 0 : v.length < 6 ? 1 : /[A-Z]/.test(v) && /\d/.test(v) ? 3 : 2;
  const text = ["", "Weak", "Good", "Strong"][lvl];
  const bar = ["bg-slate-200", "bg-rose-400", "bg-amber-500", "bg-emerald-600"][lvl];
  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="h-1.5 rounded w-20 bg-slate-200 overflow-hidden">
        <div
          className={`h-full ${bar} transition-all`}
          style={{ width: `${(lvl / 3) * 100}%` }}
        />
      </div>
      <span className="text-xs text-slate-600">{text}</span>
    </div>
  );
}

export default function OwnerForm() {
  const { nic } = useParams();
  const editing = !!nic;
  const nav = useNavigate();

  const [form, setForm] = useState({
    nic: "",
    fullName: "",
    email: "",
    phone: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Load when editing
  useEffect(() => {
    if (editing) {
      getOwner(nic)
        .then((o) => setForm((f) => ({ ...f, ...o })))
        .catch(() => toast.error("Failed to load owner"));
    }
  }, [editing, nic]);

  // client-side checks
  function validate() {
    const e = {};
    if (!editing && !form.nic.trim()) e.nic = ["NIC is required."];
    if (!form.fullName.trim()) e.fullName = ["Full name is required."];

    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      e.email = ["Please enter a valid email."];
    }
    if (form.phone && !/^[\d+\-\s()]{6,20}$/.test(form.phone.trim())) {
      e.phone = ["Please enter a valid phone."];
    }

    if (!editing) {
      const username = (form.username || form.nic || "").trim();
      if (!username) e.username = ["Username is required."];

      const pw = form.password.trim();
      if (!pw) e.password = ["Password is required."];
      else if (pw.length < 6) e.password = ["Password must be at least 6 characters."];

      if ((form.confirmPassword || "").trim() !== pw) {
        e.confirmPassword = ["Passwords do not match."];
      }
    }
    return e;
  }

  async function save(e) {
    e.preventDefault();
    setErrors({});
    const client = validate();
    if (Object.keys(client).length) {
      setErrors(client);
      toast.error("Please fix the highlighted fields.");
      return;
    }

    try {
      setSubmitting(true);
      if (editing) {
        await updateOwner(nic, form);
        toast.success("Owner updated");
      } else {
        const payload = {
          ...form,
          username: form.username?.trim() || form.nic?.trim(),
        };
        await createOwner(payload);
        toast.success("Owner created");
      }
      nav("/app/owners");
    } catch (err) {
      console.error(err);
      if (err.fieldErrors && Object.keys(err.fieldErrors).length) {
        setErrors(err.fieldErrors);
      }
      toast.error(String(err.message || "Save failed"));
    } finally {
      setSubmitting(false);
    }
  }

  const errorText = (field) => {
    const arr =
      errors[field] ||
      errors[field?.charAt(0).toUpperCase() + field?.slice(1)] ||
      errors[`$.${field}`] ||
      [];
    return Array.isArray(arr) ? arr.join(" · ") : String(arr || "");
  };
  const hasError = (field) => !!errorText(field);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-5">
        <div className="text-xs text-slate-500">Owners</div>
        <h1 className="text-2xl font-bold text-black">
          {editing ? "Edit EV Owner" : "Register EV Owner"}
        </h1>
      </div>

      <form onSubmit={save} className="space-y-6">
        {/* Card: Profile */}
        <div className="bg-white border rounded-2xl shadow-sm p-5">
          <div className="font-semibold text-slate-900 mb-4">Profile</div>

          {!editing && (
            <div className="mb-4">
              <label className={labelCls}>
                NIC <span className="text-rose-500">*</span>
              </label>
              <input
                className={hasError("nic") ? inputErr : inputOk}
                placeholder="Enter NIC number"
                value={form.nic}
                onChange={(e) => setForm({ ...form, nic: e.target.value })}
              />
              {hasError("nic") && <div className={errCls}>{errorText("nic")}</div>}
            </div>
          )}

          {editing && (
            <div className="mb-4">
              <label className={labelCls}>NIC</label>
              <input className={`${inputOk} bg-slate-50`} value={form.nic} disabled />
              <div className={hintCls}>NIC is the primary identifier and cannot be changed.</div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                className={hasError("fullName") ? inputErr : inputOk}
                placeholder="Full name"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              />
              {hasError("fullName") && (
                <div className={errCls}>{errorText("fullName")}</div>
              )}
            </div>

            <div>
              <label className={labelCls}>Phone</label>
              <input
                className={hasError("phone") ? inputErr : inputOk}
                placeholder="Phone number"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              {hasError("phone") && <div className={errCls}>{errorText("phone")}</div>}
            </div>

            <div className="sm:col-span-2">
              <label className={labelCls}>Email</label>
              <input
                type="email"
                className={hasError("email") ? inputErr : inputOk}
                placeholder="Email address"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              {hasError("email") && <div className={errCls}>{errorText("email")}</div>}
            </div>
          </div>
        </div>

        {/* Card: Login (create only) */}
        {!editing && (
          <div className="bg-white border rounded-2xl shadow-sm p-5">
            <div className="font-semibold text-slate-900 mb-4">Login for Owner</div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={labelCls}>
                  Username <span className="text-rose-500">*</span>
                </label>
                <input
                  className={hasError("username") ? inputErr : inputOk}
                  placeholder="Username (defaults to NIC)"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                />
                {hasError("username") ? (
                  <div className={errCls}>{errorText("username")}</div>
                ) : (
                  <div className={hintCls}>If left empty, the NIC will be used as the username.</div>
                )}
              </div>

              <div>
                <label className={labelCls}>
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    className={hasError("password") ? inputErr : inputOk}
                    placeholder="Minimum 6 characters"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-black"
                    title={showPw ? "Hide" : "Show"}
                  >
                    {showPw ? "🙈" : "👁️"}
                  </button>
                </div>
                <Strength value={form.password} />
                {hasError("password") && (
                  <div className={errCls}>{errorText("password")}</div>
                )}
              </div>

              <div>
                <label className={labelCls}>
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPw2 ? "text" : "password"}
                    className={hasError("confirmPassword") ? inputErr : inputOk}
                    placeholder="Repeat the password"
                    value={form.confirmPassword}
                    onChange={(e) =>
                      setForm({ ...form, confirmPassword: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw2((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-black"
                    title={showPw2 ? "Hide" : "Show"}
                  >
                    {showPw2 ? "🙈" : "👁️"}
                  </button>
                </div>
                {hasError("confirmPassword") && (
                  <div className={errCls}>{errorText("confirmPassword")}</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <button
            className={
              "text-white px-5 py-2 rounded-lg " +
              (submitting
                ? "bg-emerald-300 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-700")
            }
            type="submit"
            disabled={submitting}
          >
            {submitting ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            onClick={() => nav("/app/owners")}
            className="border px-5 py-2 rounded-lg hover:bg-slate-50"
            disabled={submitting}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
