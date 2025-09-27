// src/App.jsx

// Import your main dashboard page
import Dashboard from "./pages/Dashboard";

// Import global CSS (Tailwind index.css)
import "./index.css";

// If you want React Router later, you could add it here
// but for now we keep it simple and render Dashboard directly.

export default function App() {
  return (
    <div className="h-screen w-screen">
      {/* Render your full dashboard here */}
      <Dashboard />
    </div>
  );
}
