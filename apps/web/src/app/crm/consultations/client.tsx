"use client";

import { CrmShell } from "@/components/crm/CrmShell";
import { useCrmAuth } from "@/components/crm/CrmAuth";
import { useCallback, useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://carolinagrowth.co";

type Booking = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  notes: string | null;
};

async function fetchWithAuth(url: string, token: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

export function ConsultationCalendarPageClient() {
  return (
    <CrmShell title="Consultation Calendar">
      <ConsultationCalendarContent />
    </CrmShell>
  );
}

function ConsultationCalendarContent() {
  const { token } = useCrmAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"dayGridMonth" | "timeGridWeek" | "timeGridDay">("dayGridMonth");

  const loadBookings = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);

    try {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 3);

      const data = await fetchWithAuth(
        `${API_URL}/admin/consultation/bookings?start_date=${startDate.toISOString()}&end_date=${endDate.toISOString()}`,
        token
      );

      setBookings(data.bookings || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const calendarEvents = bookings.map((booking) => ({
    id: booking.id,
    title: `${booking.name}${booking.company ? ` - ${booking.company}` : ""}`,
    start: booking.scheduled_at,
    end: new Date(
      new Date(booking.scheduled_at).getTime() + booking.duration_minutes * 60000
    ).toISOString(),
    extendedProps: {
      email: booking.email,
      phone: booking.phone,
      status: booking.status,
      notes: booking.notes,
    },
    color:
      booking.status === "confirmed"
        ? "#10b981"
        : booking.status === "pending"
          ? "#f59e0b"
          : booking.status === "canceled"
            ? "#ef4444"
            : "#6b7280",
  }));

  if (loading) {
    return <div className="p-6">Loading calendar...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setView("dayGridMonth")}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              view === "dayGridMonth"
                ? "bg-[var(--accent)] text-[var(--background)]"
                : "border border-[var(--border)] text-[var(--muted)]"
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setView("timeGridWeek")}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              view === "timeGridWeek"
                ? "bg-[var(--accent)] text-[var(--background)]"
                : "border border-[var(--border)] text-[var(--muted)]"
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setView("timeGridDay")}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              view === "timeGridDay"
                ? "bg-[var(--accent)] text-[var(--background)]"
                : "border border-[var(--border)] text-[var(--muted)]"
            }`}
          >
            Day
          </button>
        </div>
        <button
          onClick={loadBookings}
          className="btn-secondary rounded-full px-4 py-2 text-sm font-semibold"
        >
          Refresh
        </button>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-6">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={view}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          events={calendarEvents}
          eventClick={(info) => {
            const booking = bookings.find((b) => b.id === info.event.id);
            if (booking) {
              alert(
                `Booking Details:\n\nName: ${booking.name}\nEmail: ${booking.email}\nPhone: ${booking.phone || "N/A"}\nCompany: ${booking.company || "N/A"}\nStatus: ${booking.status}\nNotes: ${booking.notes || "None"}`
              );
            }
          }}
          height="auto"
          eventTimeFormat={{
            hour: "numeric",
            minute: "2-digit",
            meridiem: "short",
          }}
        />
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-6">
        <h3 className="text-lg font-semibold mb-4">Upcoming Consultations</h3>
        <div className="space-y-2">
          {bookings
            .filter((b) => new Date(b.scheduled_at) >= new Date())
            .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
            .slice(0, 10)
            .map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"
              >
                <div>
                  <p className="font-semibold">{booking.name}</p>
                  <p className="text-sm text-[var(--muted)]">
                    {new Date(booking.scheduled_at).toLocaleString()}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    booking.status === "confirmed"
                      ? "bg-green-100 text-green-800"
                      : booking.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {booking.status}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
