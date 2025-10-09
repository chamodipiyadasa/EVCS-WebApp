import { useState, useEffect } from "react";
import { createOwner, getOwner, updateOwner } from "../services/owners";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

export default function OwnerForm() {
  const { nic } = useParams();
  const editing = !!nic;
  const nav = useNavigate();

  const [form, setForm] = useState({
    nic: "",
    fullName: "",
    email: "",
    phone: "",
    // login fields for Registration endpoint (create only)
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({}); // field-level errors from server

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

      if (!form.password.trim()) {
        e.password = ["Password is required."];
      } else if (form.password.trim().length < 6) {
        e.password = ["Password must be at least 6 characters."];
      }

      if ((form.confirmPassword || "").trim() !== form.password.trim()) {
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
        // default username to NIC if left blank
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
    <div className="max-w-xl mx-auto bg-white border rounded-xl shadow-sm p-6 space-y-5">
      <div>
        <div className="text-xs text-slate-500">Owners</div>
        <h1 className="text-2xl font-semibold text-slate-800">
          {editing ? "Edit EV Owner" : "Register EV Owner"}
        </h1>
      </div>

      <form onSubmit={save} className="space-y-4">
        {!editing && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              NIC <span className="text-rose-500">*</span>
            </label>
            <input
              className={`border rounded-lg px-3 py-2 w-full outline-none focus:ring-2 ${
                hasError("nic")
                  ? "border-rose-400 focus:ring-rose-200"
                  : "border-slate-300 focus:ring-blue-200"
              }`}
              placeholder="Enter NIC number"
              value={form.nic}
              onChange={(e) => setForm({ ...form, nic: e.target.value })}
            />
            {hasError("nic") && (
              <div className="text-rose-600 text-xs mt-1">{errorText("nic")}</div>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Full Name <span className="text-rose-500">*</span>
          </label>
          <input
            className={`border rounded-lg px-3 py-2 w-full outline-none focus:ring-2 ${
              hasError("fullName")
                ? "border-rose-400 focus:ring-rose-200"
                : "border-slate-300 focus:ring-blue-200"
            }`}
            placeholder="Full name"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          />
          {hasError("fullName") && (
            <div className="text-rose-600 text-xs mt-1">{errorText("fullName")}</div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Email
          </label>
          <input
            type="email"
            className={`border rounded-lg px-3 py-2 w-full outline-none focus:ring-2 ${
              hasError("email")
                ? "border-rose-400 focus:ring-rose-200"
                : "border-slate-300 focus:ring-blue-200"
            }`}
            placeholder="Email address"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          {hasError("email") && (
            <div className="text-rose-600 text-xs mt-1">{errorText("email")}</div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Phone
          </label>
          <input
            className={`border rounded-lg px-3 py-2 w-full outline-none focus:ring-2 ${
              hasError("phone")
                ? "border-rose-400 focus:ring-rose-200"
                : "border-slate-300 focus:ring-blue-200"
            }`}
            placeholder="Phone number"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          {hasError("phone") && (
            <div className="text-rose-600 text-xs mt-1">{errorText("phone")}</div>
          )}
        </div>

        {/* Registration-only login fields */}
        {!editing && (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Username <span className="text-rose-500">*</span>
              </label>
              <input
                className={`border rounded-lg px-3 py-2 w-full outline-none focus:ring-2 ${
                  hasError("username")
                    ? "border-rose-400 focus:ring-rose-200"
                    : "border-slate-300 focus:ring-blue-200"
                }`}
                placeholder="Username (defaults to NIC)"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
              {hasError("username") && (
                <div className="text-rose-600 text-xs mt-1">
                  {errorText("username")}
                </div>
              )}
              <div className="text-xs text-slate-500 mt-1">
                If left empty, the NIC will be used as the username.
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  className={`border rounded-lg px-3 py-2 w-full outline-none focus:ring-2 ${
                    hasError("password")
                      ? "border-rose-400 focus:ring-rose-200"
                      : "border-slate-300 focus:ring-blue-200"
                  }`}
                  placeholder="Minimum 6 characters"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
                {hasError("password") && (
                  <div className="text-rose-600 text-xs mt-1">
                    {errorText("password")}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  className={`border rounded-lg px-3 py-2 w-full outline-none focus:ring-2 ${
                    hasError("confirmPassword")
                      ? "border-rose-400 focus:ring-rose-200"
                      : "border-slate-300 focus:ring-blue-200"
                  }`}
                  placeholder="Repeat the password"
                  value={form.confirmPassword}
                  onChange={(e) =>
                    setForm({ ...form, confirmPassword: e.target.value })
                  }
                />
                {hasError("confirmPassword") && (
                  <div className="text-rose-600 text-xs mt-1">
                    {errorText("confirmPassword")}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        <div className="flex gap-3 pt-2">
          <button
            className={
              "text-white px-5 py-2 rounded-lg " +
              (submitting ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700")
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
