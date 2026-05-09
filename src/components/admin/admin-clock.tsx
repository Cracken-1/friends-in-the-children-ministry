"use client";

import { Clock3 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const timezone = "Africa/Nairobi";

function getClockParts() {
  const now = new Date();

  return {
    time: new Intl.DateTimeFormat("en-KE", {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
      timeZone: timezone
    }).format(now),
    date: new Intl.DateTimeFormat("en-KE", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: timezone
    }).format(now)
  };
}

export function AdminClock() {
  const [clock, setClock] = useState(getClockParts);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const tick = () => {
      setClock(getClockParts());
      const delay = 1000 - (Date.now() % 1000) + 20;
      timerRef.current = window.setTimeout(tick, delay);
    };

    tick();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        setClock(getClockParts());
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-700">
        <Clock3 size={16} />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Time</p>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-slate-900">{clock.time}</span>
          <span className="text-xs text-slate-500">{clock.date}</span>
        </div>
      </div>
    </div>
  );
}
