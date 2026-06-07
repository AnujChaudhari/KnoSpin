"use client";
import { useState } from "react";
import NotificationPanel from "./NotificationPanel";

// Inline SVG Bell
const BellIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 01-3.46 0" />
  </svg>
);

export default function NotificationBell() {
  const [panelOpen, setPanelOpen] = useState(false);

  return (
    <>
      <button onClick={() => setPanelOpen(true)} className="relative p-2">
        <BellIcon />
        {/* Optional unread count – you can fetch count separately or show dot */}
      </button>
      <NotificationPanel isOpen={panelOpen} onClose={() => setPanelOpen(false)} />
    </>
  );
}
