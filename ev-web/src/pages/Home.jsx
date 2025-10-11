// src/pages/Home.jsx
import SiteNav from "../components/SiteNav";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <SiteNav />

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 pt-16 pb-10 grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            EV Charging, <span className="text-blue-600">made simple.</span>
          </h1>
          <p className="mt-4 text-slate-600 text-lg">
            Find nearby stations, reserve a time slot, and get charging quickly.
            Backoffice and Operators manage everything in one place.
          </p>

          <div className="mt-6 flex items-center gap-3">
            <Link
              to="/login"
              className="px-5 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-medium"
            >
              Get started
            </Link>
            <a
              href="#features"
              className="px-5 py-3 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium"
            >
              Learn more
            </a>
          </div>

          {/* Stats */}
          <div className="mt-10 grid grid-cols-3 gap-4 max-w-lg">
            <Stat number="2k+" label="Active Owners" />
            <Stat number="120" label="Stations" />
            <Stat number="9.2/10" label="Satisfaction" />
          </div>
        </div>

        {/* Illustration */}
        <div className="relative">
          <div className="absolute -inset-4 -z-10 blur-2xl bg-blue-100 rounded-3xl"></div>
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="h-56 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 grid place-items-center">
              <span className="text-slate-400">App preview</span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <Card label="Owners" />
              <Card label="Stations" />
              <Card label="Bookings" />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold">Everything you need</h2>
        <p className="text-slate-600 mt-1">
          Role-based access, easy reservations, and seamless operations.
        </p>

        <div className="mt-8 grid md:grid-cols-3 gap-5">
          <Feature
            title="Role-based access"
            desc="Backoffice & Station Operator workflows with secure login."
          />
          <Feature
            title="Smart bookings"
            desc="Reserve within 7 days, update/cancel ≥ 12h beforehand."
          />
          <Feature
            title="Station management"
            desc="AC/DC stations, slots, schedules & deactivation rules."
          />
        </div>

        <div className="mt-10">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
          >
            Start now
            <span aria-hidden>→</span>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 text-center text-slate-500">
        © {new Date().getFullYear()} EVCS. All rights reserved.
      </footer>
    </div>
  );
}

function Stat({ number, label }) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="text-2xl font-bold">{number}</div>
      <div className="text-slate-500 text-sm">{label}</div>
    </div>
  );
}

function Card({ label }) {
  return (
    <div className="rounded-xl border bg-white shadow-sm p-4 grid place-items-center">
      <div className="h-14 w-14 rounded-xl bg-slate-100 grid place-items-center text-slate-400">
        ⚡
      </div>
      <div className="mt-2 text-sm font-medium">{label}</div>
    </div>
  );
}

function Feature({ title, desc }) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 grid place-items-center">
        ✓
      </div>
      <div className="mt-3 font-semibold">{title}</div>
      <div className="text-slate-600 text-sm mt-1">{desc}</div>
    </div>
  );
}
