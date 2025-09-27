import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  ChevronRight,
  Droplet,
  FileText,
  MapPin,
  Menu,
  Search,
  TreePine,
  TriangleAlert,
  Layers,
  Settings,
  LogOut,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ===============================
// Helper tiny components (one-file)
// ===============================
const Card = ({ children, className = "" }) => (
  <div className={`rounded-2xl bg-slate-900/70 border border-slate-800 shadow-lg ${className}`}>
    {children}
  </div>
);
const CardBody = ({ children, className = "" }) => (
  <div className={`p-5 ${className}`}>{children}</div>
);
const Stat = ({ icon: Icon, label, value, sub }) => (
  <div className="flex items-center gap-4">
    <div className="p-3 rounded-xl bg-slate-800 text-indigo-300">
      <Icon size={22} />
    </div>
    <div>
      <div className="text-slate-400 text-sm">{label}</div>
      <div className="text-slate-100 font-semibold text-xl mt-0.5">{value}</div>
      {sub && <div className="text-xs text-slate-500 mt-0.5">{sub}</div>}
    </div>
  </div>
);

// Simple semicircle gauge using SVG (no extra deps)
function RiskGauge({ score = 741, min = 0, max = 1000 }) {
  const pct = Math.max(0, Math.min(1, (score - min) / (max - min)));
  const angle = 180 * pct;
  // Arc path
  const r = 80;
  const cx = 100;
  const cy = 100;
  const start = polarToCartesian(cx, cy, r, 180);
  const end = polarToCartesian(cx, cy, r, 180 - angle);
  const largeArc = angle > 180 ? 1 : 0;
  function polarToCartesian(cx, cy, radius, deg) {
    const rad = (deg * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  }
  return (
    <div className="flex flex-col items-center">
      <svg width="200" height="120" viewBox="0 0 200 120">
        {/* track */}
        <path
          d="M20 100 A80 80 0 0 1 180 100"
          stroke="#0f172a"
          strokeWidth="16"
          fill="none"
        />
        {/* progress */}
        <path
          d={`M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`}
          stroke="url(#grad)"
          strokeWidth="16"
          strokeLinecap="round"
          fill="none"
        />
        <defs>
          <linearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>
      </svg>
      <div className="text-3xl font-bold text-slate-100">{score}</div>
      <div className="text-sm text-slate-400">Risk Score</div>
      <div className="mt-1 px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-xs">High</div>
    </div>
  );
}

// ===============================
// Main Dashboard
// ===============================
export default function Dashboard() {
  // --- Mock data (replace via axios + FastAPI later) ---
  const [trees, setTrees] = useState({ total: 150, healthy: 120, unhealthy: 30 });
  const [drainages, setDrainages] = useState({ total: 20, cleaned: 13, uncleared: 7 });
  const [alerts, setAlerts] = useState([
    { id: 1, type: "danger", message: "Drone entered restricted geofence near Block C." },
    { id: 2, type: "warning", message: "5 trees show low NDVI in Zone-2." },
    { id: 3, type: "info", message: "Drainage D-07 scheduled for cleaning today." },
  ]);

  const treePie = useMemo(
    () => [
      { name: "Healthy", value: trees.healthy },
      { name: "Unhealthy", value: trees.unhealthy },
    ],
    [trees]
  );
  const drainagePie = useMemo(
    () => [
      { name: "Cleaned", value: drainages.cleaned },
      { name: "Not Cleaned", value: drainages.uncleared },
    ],
    [drainages]
  );

  const COLORS = ["#22c55e", "#ef4444", "#6366f1", "#f59e0b"];

  // Time-series for "Threat Summary" style chart (here: campus issues trend)
  const summary = [
    { m: "Jan", v: 110 }, { m: "Feb", v: 140 }, { m: "Mar", v: 160 },
    { m: "Apr", v: 180 }, { m: "May", v: 230 }, { m: "Jun", v: 290 },
    { m: "Jul", v: 260 }, { m: "Aug", v: 240 }, { m: "Sep", v: 210 },
    { m: "Oct", v: 200 }, { m: "Nov", v: 170 }, { m: "Dec", v: 160 },
  ];

  // Map
  const mapRef = useRef(null);
  const MAPMYINDIA_KEY = import.meta.env.VITE_MAPMYINDIA_KEY; // keep in .env
  const CAMPUS_CENTER = [17.385, 78.4867]; // Replace with your campus coords

  useEffect(() => {
    if (mapRef.current) return;
    const map = L.map("campus-map", { center: CAMPUS_CENTER, zoom: 15 });
    mapRef.current = map;
    L.tileLayer(
      `https://apis.mapmyindia.com/advancedmaps/v1/${MAPMYINDIA_KEY}/map_tile/256/{z}/{x}/{y}.png`,
      { attribution: "© MapmyIndia" }
    ).addTo(map);
    L.marker(CAMPUS_CENTER).addTo(map).bindPopup("Campus Center").openPopup();
  }, [MAPMYINDIA_KEY]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Top bar */}
      <header className="sticky top-0 z-20 bg-slate-950/70 backdrop-blur border-b border-slate-800">
        <div className="flex items-center gap-3 px-5 py-3">
          <button className="p-2 rounded-lg bg-slate-900 border border-slate-800">
            <Menu size={18} />
          </button>
          <div className="font-semibold tracking-wide text-indigo-300">VertexGuard • Green Campus</div>
          <div className="flex-1" />
          <div className="relative w-80 hidden md:block">
            <Search className="absolute left-3 top-2.5 text-slate-500" size={18} />
            <input
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm placeholder:text-slate-500 outline-none focus:border-indigo-500"
              placeholder="Search trees, drainages, devices…"
            />
          </div>
          <button className="p-2 rounded-lg bg-slate-900 border border-slate-800">
            <Bell size={18} />
          </button>
          <div className="ml-2 text-sm text-slate-300 hidden md:block">
            <div className="text-slate-400">Welcome!</div>
            <div className="font-medium">Admin</div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-5 p-5">
        {/* Sidebar */}
        <aside className="col-span-12 md:col-span-2">
          <Card>
            <CardBody className="space-y-1">
              <NavItem icon={Layers} label="Overview" active />
              <NavItem icon={TriangleAlert} label="Issues" />
              <NavItem icon={FileText} label="Reports" />
              <NavItem icon={Settings} label="Settings" />
              <div className="pt-4 border-t border-slate-800">
                <NavItem icon={LogOut} label="Log Out" />
              </div>
            </CardBody>
          </Card>

          <Card className="mt-5">
            <CardBody>
              <div className="text-slate-300 font-medium">Upgrade</div>
              <p className="text-slate-500 text-sm mt-1">Unlock advanced AI predictions & route optimization.</p>
              <button className="mt-3 w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 py-2 text-sm font-semibold">
                Try Pro
              </button>
            </CardBody>
          </Card>
        </aside>

        {/* Main */}
        <main className="col-span-12 md:col-span-10 space-y-5">
          {/* Stats row */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
            <Card><CardBody><Stat icon={TreePine} label="Total Trees" value={trees.total} sub={`${trees.healthy} healthy`} /></CardBody></Card>
            <Card><CardBody><Stat icon={TreePine} label="Healthy Trees" value={trees.healthy} sub={`${trees.unhealthy} unhealthy`} /></CardBody></Card>
            <Card><CardBody><Stat icon={TriangleAlert} label="Unhealthy Trees" value={trees.unhealthy} sub="Needs inspection" /></CardBody></Card>
            <Card><CardBody><Stat icon={Droplet} label="Drainages Total" value={drainages.total} sub={`${drainages.cleaned} cleaned`} /></CardBody></Card>
            <Card><CardBody><Stat icon={Droplet} label="To Clean" value={drainages.uncleared} sub="Pending today" /></CardBody></Card>
          </div>

          {/* Risk + Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <Card className="lg:col-span-1">
              <CardBody>
                <div className="flex items-center justify-between">
                  <div className="font-semibold">Risk Score</div>
                  <button className="text-xs text-slate-400 flex items-center gap-1">
                    Daily <ChevronRight size={14} />
                  </button>
                </div>
                <div className="mt-2">
                  <RiskGauge score={741} />
                </div>
              </CardBody>
            </Card>

            <Card className="lg:col-span-2">
              <CardBody>
                <div className="flex items-center justify-between">
                  <div className="font-semibold">Sustainability Summary</div>
                  <button className="text-xs text-slate-400 flex items-center gap-1">
                    Yearly <ChevronRight size={14} />
                  </button>
                </div>
                <div className="h-[240px] mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={summary}>
                      <CartesianGrid stroke="#0f172a" strokeDasharray="3 3" />
                      <XAxis dataKey="m" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip contentStyle={{ background: "#0b1220", border: "1px solid #1f2937" }} />
                      <Line type="monotone" dataKey="v" stroke="#8b5cf6" strokeWidth={3} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Donuts + Table */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            <Card>
              <CardBody>
                <div className="font-semibold">Tree Health</div>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={treePie} dataKey="value" innerRadius={50} outerRadius={80} label>
                        {treePie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Legend />
                      <Tooltip contentStyle={{ background: "#0b1220", border: "1px solid #1f2937" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <div className="font-semibold">Drainage Cleaning</div>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={drainagePie} dataKey="value" innerRadius={50} outerRadius={80} label>
                        {drainagePie.map((_, i) => <Cell key={i} fill={COLORS[(i + 2) % COLORS.length]} />)}
                      </Pie>
                      <Legend />
                      <Tooltip contentStyle={{ background: "#0b1220", border: "1px solid #1f2937" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardBody>
            </Card>

            <Card className="xl:col-span-1">
              <CardBody>
                <div className="font-semibold">Alerts</div>
                <div className="mt-3 space-y-2">
                  {alerts.map((a) => (
                    <div
                      key={a.id}
                      className={`text-sm p-3 rounded-xl border ${
                        a.type === "danger"
                          ? "bg-red-500/10 border-red-500/30 text-red-300"
                          : a.type === "warning"
                          ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                          : "bg-sky-500/10 border-sky-500/30 text-sky-300"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <TriangleAlert size={16} className="mt-0.5" />
                        <span>{a.message}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setAlerts([])}
                  className="mt-3 w-full rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 py-2 text-sm"
                >
                  Acknowledge All
                </button>
              </CardBody>
            </Card>
          </div>

          {/* Details + Map */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <Card>
              <CardBody>
                <div className="font-semibold">Details</div>
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-slate-400">
                      <tr className="text-left">
                        <th className="py-2 pr-3">Date</th>
                        <th className="py-2 pr-3">Type</th>
                        <th className="py-2 pr-3">Name</th>
                        <th className="py-2 pr-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {[
                        { d: "12-06-2024", t: "Tree", n: "Neem-22", s: "Healthy" },
                        { d: "11-06-2024", t: "Drain", n: "D-07", s: "Uncleaned" },
                        { d: "09-06-2024", t: "Tree", n: "Pipal-12", s: "Unhealthy" },
                        { d: "07-06-2024", t: "Drain", n: "D-01", s: "Cleaned" },
                      ].map((r, i) => (
                        <tr key={i} className="hover:bg-slate-900/50">
                          <td className="py-2 pr-3 text-slate-300">{r.d}</td>
                          <td className="py-2 pr-3 text-slate-400">{r.t}</td>
                          <td className="py-2 pr-3">{r.n}</td>
                          <td className="py-2 pr-3">
                            <span
                              className={`px-2 py-0.5 rounded text-xs ${
                                r.s === "Healthy"
                                  ? "bg-green-500/10 text-green-300"
                                  : r.s === "Cleaned"
                                  ? "bg-sky-500/10 text-sky-300"
                                  : "bg-amber-500/10 text-amber-300"
                              }`}
                            >
                              {r.s}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <div className="flex items-center justify-between">
                  <div className="font-semibold flex items-center gap-2">
                    <MapPin size={18} className="text-violet-400" /> Campus Map
                  </div>
                </div>
                <div id="campus-map" className="mt-3 h-[320px] w-full rounded-xl overflow-hidden border border-slate-800" />
              </CardBody>
            </Card>
          </div>
        </main>
      </div>

      <footer className="px-5 py-4 text-xs text-slate-500 border-t border-slate-800">
        © {new Date().getFullYear()} Green Campus Digital Twin
      </footer>
    </div>
  );
}

function NavItem({ icon: Icon, label, active }) {
  return (
    <button
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm ${
        active
          ? "bg-indigo-600/20 text-indigo-300"
          : "text-slate-300 hover:bg-slate-800"
      }`}
    >
      <Icon size={18} />
      <span>{label}</span>
    </button>
  );
}
