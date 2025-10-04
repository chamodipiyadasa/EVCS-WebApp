// src/pages/Signup.jsx
import SiteNav from "../components/SiteNav";

export default function Signup() {
  return (
    <div className="min-h-screen bg-slate-50">
      <SiteNav />
      <div className="max-w-2xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold">Create your account</h1>
        <p className="text-slate-600 mt-2">
          Sign up is not implemented in this prototype. Please use an account from your team or log in as Backoffice/Operator.
        </p>
        <div className="mt-6 rounded-xl border bg-white p-6 shadow-sm">
          <div className="text-slate-500">🚧 Coming soon.</div>
        </div>
      </div>
    </div>
  );
}
