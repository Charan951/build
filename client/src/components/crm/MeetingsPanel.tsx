import React, { useEffect, useMemo, useState } from 'react';
import {
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  Link2,
  Trash2,
  Users,
  Bell,
  Video,
  CheckCircle2,
  Calendar as CalendarIcon,
  ExternalLink,
  Pencil,
} from 'lucide-react';
import { apiFetch } from '../../services/api';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { Modal } from '../ui/Modal';

interface MeetingsPanelProps {
  /** When omitted, the panel shows meetings across every client. */
  clientId?: string;
  clientName?: string;
}

type ViewMode = 'agenda' | 'week' | 'month';

const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120];
const REMINDER_OPTIONS = [
  { value: 0, label: 'No reminder' },
  { value: 5, label: '5 minutes before' },
  { value: 15, label: '15 minutes before' },
  { value: 30, label: '30 minutes before' },
  { value: 60, label: '1 hour before' },
];

const HOURS = Array.from({ length: 10 }, (_, i) => 9 + i); // 9 AM - 6 PM
const DAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const pad2 = (n: number) => String(n).padStart(2, '0');
const toDateKey = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const startOfWeek = (d: Date) => {
  const copy = new Date(d);
  copy.setDate(copy.getDate() - copy.getDay());
  copy.setHours(0, 0, 0, 0);
  return copy;
};
const formatTime12h = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${pad2(m)} ${period}`;
};

const EMPTY_FORM = {
  title: '',
  clientId: '',
  date: '',
  time: '',
  durationMinutes: 60,
  attendeesText: '',
  description: '',
  meetingLink: '',
  addGoogleMeet: false,
  reminderMinutesBefore: 15,
};

export const MeetingsPanel: React.FC<MeetingsPanelProps> = ({ clientId, clientName }) => {
  const token = localStorage.getItem('adminToken');
  const isGlobal = !clientId;
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>('week');
  const [anchor, setAnchor] = useState(new Date());
  const [clients, setClients] = useState<any[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);
  const [formError, setFormError] = useState('');
  const [viewingMeeting, setViewingMeeting] = useState<any | null>(null);

  const [googleStatus, setGoogleStatus] = useState<{ connected: boolean; configured: boolean; email?: string }>({
    connected: false,
    configured: true,
  });
  const [connecting, setConnecting] = useState(false);
  const [googleBanner, setGoogleBanner] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [loadError, setLoadError] = useState(false);

  const fetchMeetings = () => {
    setLoading(true);
    setLoadError(false);
    apiFetch(`/crm/meetings${clientId ? `?clientId=${clientId}` : ''}`, { token })
      .then((res) => {
        if (res.success) setMeetings(res.data || []);
        else setLoadError(true);
      })
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  };

  const fetchGoogleStatus = () => {
    apiFetch('/integrations/google/status', { token })
      .then((res) => {
        if (res.success) setGoogleStatus(res.data);
      })
      .catch(() => {
        // Non-blocking: the Google-connect banner simply stays hidden if this fails.
      });
  };

  useEffect(() => {
    fetchMeetings();
    fetchGoogleStatus();
    if (isGlobal) {
      apiFetch('/crm/clients', { token })
        .then((res) => {
          if (res.success) setClients(res.data || []);
        })
        .catch(() => {
          // Non-blocking: only powers the client-picker in the New Meeting form.
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  // Land back here after the Google OAuth redirect (?google=connected|error).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const google = params.get('google');
    if (!google) return;
    if (google === 'connected') {
      setGoogleBanner({ type: 'success', text: 'Google Calendar connected — new meetings can auto-generate Meet links.' });
      fetchGoogleStatus();
    } else if (google === 'error') {
      setGoogleBanner({ type: 'error', text: params.get('message') || 'Failed to connect Google Calendar.' });
    }
    params.delete('google');
    params.delete('message');
    const newUrl = `${window.location.pathname}${params.toString() ? `?${params}` : ''}`;
    window.history.replaceState({}, '', newUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleConnectGoogle = () => {
    setConnecting(true);
    apiFetch('/integrations/google/auth-url', { token })
      .then((res) => {
        if (res.success) {
          window.location.href = res.data.url;
        } else {
          setGoogleBanner({ type: 'error', text: res.message || 'Failed to start Google connection.' });
        }
      })
      .catch((err) => setGoogleBanner({ type: 'error', text: 'Error: ' + err.message }))
      .finally(() => setConnecting(false));
  };

  const openCreateModal = () => {
    setEditingId(null);
    const today = new Date();
    setForm({ ...EMPTY_FORM, date: toDateKey(today), clientId: clientId || '' });
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (meeting: any) => {
    setEditingId(meeting._id);
    setForm({
      title: meeting.title || '',
      clientId: (typeof meeting.clientId === 'object' ? meeting.clientId?._id : meeting.clientId) || '',
      date: meeting.date ? toDateKey(new Date(meeting.date)) : '',
      time: meeting.time || '',
      durationMinutes: meeting.durationMinutes || 60,
      attendeesText: (meeting.attendees || []).join(', '),
      description: meeting.description || '',
      meetingLink: meeting.meetingLink || '',
      addGoogleMeet: false,
      reminderMinutesBefore: meeting.reminderMinutesBefore ?? 15,
    });
    setFormError('');
    setViewingMeeting(null);
    setShowModal(true);
  };

  const handleSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.date || !form.time) {
      setFormError('Title, date, and time are required.');
      return;
    }
    setSaving(true);
    setFormError('');
    const body = {
      title: form.title.trim(),
      clientId: clientId || form.clientId || undefined,
      date: form.date,
      time: form.time,
      durationMinutes: form.durationMinutes,
      attendees: form.attendeesText
        .split(/[,\s]+/)
        .map((a) => a.trim())
        .filter(Boolean),
      description: form.description,
      meetingLink: form.meetingLink,
      addGoogleMeet: googleStatus.connected && form.addGoogleMeet,
      reminderMinutesBefore: form.reminderMinutesBefore,
    };
    const isEdit = !!editingId;
    apiFetch(isEdit ? `/crm/meetings/${editingId}` : '/crm/meetings', {
      method: isEdit ? 'PUT' : 'POST',
      token,
      body: JSON.stringify(body),
    })
      .then((res) => {
        if (res.success) {
          setShowModal(false);
          fetchMeetings();
        } else {
          setFormError(res.error || res.message || 'Failed to schedule meeting.');
        }
      })
      .catch((err) => setFormError('Error: ' + err.message))
      .finally(() => setSaving(false));
  };

  const handleDelete = (meetingId: string) => {
    apiFetch(`/crm/meetings/${meetingId}`, { method: 'DELETE', token })
      .then((res) => {
        if (res.success) fetchMeetings();
      })
      .finally(() => setCancelTarget(null));
  };

  const weekDays = useMemo(() => {
    const start = startOfWeek(anchor);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [anchor]);

  const meetingsByDate = useMemo(() => {
    const map: Record<string, any[]> = {};
    meetings.forEach((m) => {
      if (!map[m.date]) map[m.date] = [];
      map[m.date].push(m);
    });
    return map;
  }, [meetings]);

  const upcoming = useMemo(
    () =>
      [...meetings].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)),
    [meetings]
  );

  const weekRangeLabel = () => {
    const first = weekDays[0];
    const last = weekDays[6];
    const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
    return `${first.toLocaleDateString('en-GB', opts)} – ${last.toLocaleDateString('en-GB', { ...opts, year: 'numeric' })}`;
  };

  const navigateWeek = (dir: 1 | -1) => {
    const next = new Date(anchor);
    next.setDate(next.getDate() + dir * 7);
    setAnchor(next);
  };

  return (
    <div className="space-y-4">
      {googleBanner && (
        <div
          className={`p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between gap-2 ${
            googleBanner.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
              : 'bg-rose-50 border border-rose-200 text-rose-700'
          }`}
        >
          <span>{googleBanner.text}</span>
          <button onClick={() => setGoogleBanner(null)} className="shrink-0">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-background border border-dark/10 w-fit">
          {(['agenda', 'week', 'month'] as ViewMode[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold capitalize transition-colors ${
                view === v ? 'bg-white shadow-sm text-dark' : 'text-slateText hover:text-dark'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {view === 'week' && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setAnchor(new Date())}
                className="px-2.5 py-1.5 rounded-lg border border-dark/10 text-[11px] font-bold text-dark hover:bg-dark/5"
              >
                Today
              </button>
              <button
                onClick={() => navigateWeek(-1)}
                aria-label="Previous week"
                className="focus-ring p-1.5 rounded-lg border border-dark/10 text-dark hover:bg-dark/5"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => navigateWeek(1)}
                aria-label="Next week"
                className="focus-ring p-1.5 rounded-lg border border-dark/10 text-dark hover:bg-dark/5"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          <button
            onClick={openCreateModal}
            className="px-4 py-2 rounded-xl bg-primary hover:bg-[#bce63b] text-dark font-bold text-xs flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Schedule
          </button>
        </div>
      </div>

      {view === 'week' && (
        <div className="rounded-xl border border-dark/10 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 bg-background border-b border-dark/10">
            <p className="text-[11px] font-bold text-slateText">{weekRangeLabel()}</p>
          </div>
          <div className="overflow-x-auto custom-form-scrollbar pb-1">
            <div className="min-w-[640px] grid grid-cols-8">
              <div className="border-r border-dark/10" />
              {weekDays.map((d) => {
                const isToday = toDateKey(d) === toDateKey(new Date());
                return (
                  <div key={d.toISOString()} className="text-center py-2 border-r border-b border-dark/10 last:border-r-0">
                    <p className="text-[9px] font-bold text-slateText">{DAY_NAMES[d.getDay()]}</p>
                    <p className={`text-sm font-bold mt-0.5 ${isToday ? 'text-primary-dark' : 'text-dark'}`}>
                      {isToday ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-dark">
                          {d.getDate()}
                        </span>
                      ) : (
                        d.getDate()
                      )}
                    </p>
                  </div>
                );
              })}

              {HOURS.map((hour) => (
                <React.Fragment key={hour}>
                  <div className="border-r border-b border-dark/10 px-2 py-3 text-right">
                    <span className="text-[10px] text-slateText font-semibold">
                      {hour > 12 ? hour - 12 : hour} {hour >= 12 ? 'PM' : 'AM'}
                    </span>
                  </div>
                  {weekDays.map((d) => {
                    const key = toDateKey(d);
                    const dayMeetings = (meetingsByDate[key] || []).filter(
                      (m) => parseInt(m.time.split(':')[0], 10) === hour
                    );
                    return (
                      <div key={key + hour} className="border-r border-b border-dark/10 last:border-r-0 min-h-[44px] p-1 space-y-1">
                        {dayMeetings.map((m) => (
                          <button
                            key={m._id}
                            onClick={() => setViewingMeeting(m)}
                            title={`${m.title}${m.clientId?.companyName ? ` — ${m.clientId.companyName}` : ''} — ${formatTime12h(m.time)}`}
                            className="w-full text-left px-1.5 py-1 rounded-md bg-primary/25 border border-primary/50 text-[9px] font-bold text-dark truncate hover:bg-primary/40"
                          >
                            {formatTime12h(m.time)} · {m.title}
                            {isGlobal && m.clientId?.companyName && (
                              <span className="block text-slateText font-semibold normal-case truncate">
                                {m.clientId.companyName}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      )}

      {view === 'agenda' && (
        <div className="rounded-xl border border-dark/10 divide-y divide-dark/5">
          {loading ? (
            <p className="text-xs text-slateText py-8 text-center">Loading meetings...</p>
          ) : loadError ? (
            <div className="py-8 text-center space-y-2">
              <p className="text-rose-600 text-xs font-semibold">Couldn't load meetings.</p>
              <button
                onClick={fetchMeetings}
                className="focus-ring px-3 py-1.5 rounded-lg bg-dark text-white text-[11px] font-bold hover:bg-dark/90"
              >
                Retry
              </button>
            </div>
          ) : upcoming.length === 0 ? (
            <p className="text-xs text-slateText py-8 text-center">
              {isGlobal ? 'No meetings scheduled yet.' : `No meetings scheduled with ${clientName} yet.`}
            </p>
          ) : (
            upcoming.map((m) => (
              <div
                key={m._id}
                onClick={() => setViewingMeeting(m)}
                className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-background/60 transition-colors"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-xs text-dark truncate">{m.title}</p>
                    {isGlobal && m.clientId?.companyName && (
                      <span className="px-1.5 py-0.5 rounded-full bg-background border border-dark/10 text-[9px] font-bold text-slateText shrink-0">
                        {m.clientId.companyName}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-slateText font-semibold">
                    <span>{new Date(m.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {formatTime12h(m.time)} · {m.durationMinutes}m
                    </span>
                    {m.attendees?.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" /> {m.attendees.length}
                      </span>
                    )}
                    {m.meetingLink && (
                      <a
                        href={m.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 text-primary-dark hover:underline"
                      >
                        <Video className="w-3 h-3" /> Join
                      </a>
                    )}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCancelTarget(m._id);
                  }}
                  className="focus-ring p-1.5 rounded-lg text-slateText hover:text-rose-600 hover:bg-rose-50"
                  aria-label="Cancel meeting"
                  title="Cancel meeting"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {view === 'month' && (
        <MonthView
          anchor={anchor}
          setAnchor={setAnchor}
          meetingsByDate={meetingsByDate}
          isGlobal={isGlobal}
          onSelect={setViewingMeeting}
        />
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingId ? 'Edit Meeting' : 'Schedule Meeting'} maxWidth="lg">
            {isGlobal ? (
              <div>
                <label className="block text-xs font-bold text-dark mb-1">Client</label>
                <select
                  value={form.clientId}
                  onChange={(e) => setForm({ ...form, clientId: e.target.value })}
                  className="w-full p-2.5 bg-background border border-dark/10 rounded-xl text-sm font-semibold focus:outline-none focus:border-dark"
                >
                  <option value="">No client (personal meeting)</option>
                  {clients.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.companyName}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="px-3 py-2 rounded-xl bg-background border border-dark/10 text-xs font-bold text-dark">
                Client: {clientName}
              </div>
            )}

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleSchedule} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-dark mb-1">
                  Meeting Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Project kickoff"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full p-2.5 bg-background border border-dark/10 rounded-xl text-sm focus:outline-none focus:border-dark"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-dark mb-1">
                    Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full p-2.5 bg-background border border-dark/10 rounded-xl text-sm focus:outline-none focus:border-dark"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-dark mb-1">
                    Time <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    className="w-full p-2.5 bg-background border border-dark/10 rounded-xl text-sm focus:outline-none focus:border-dark"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-dark mb-1">Duration</label>
                <select
                  value={form.durationMinutes}
                  onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })}
                  className="w-full p-2.5 bg-background border border-dark/10 rounded-xl text-sm font-semibold focus:outline-none focus:border-dark"
                >
                  {DURATION_OPTIONS.map((d) => (
                    <option key={d} value={d}>
                      {d < 60 ? `${d} minutes` : `${d / 60} hour${d > 60 ? 's' : ''}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-dark mb-1">Attendees (emails)</label>
                <input
                  type="text"
                  placeholder="alice@example.com, bob@example.com"
                  value={form.attendeesText}
                  onChange={(e) => setForm({ ...form, attendeesText: e.target.value })}
                  className="w-full p-2.5 bg-background border border-dark/10 rounded-xl text-sm focus:outline-none focus:border-dark"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-dark mb-1">Description</label>
                <textarea
                  placeholder="Agenda and notes..."
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full p-2.5 bg-background border border-dark/10 rounded-xl text-sm resize-none focus:outline-none focus:border-dark"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-background border border-dark/10">
                <div className="flex items-center gap-2 min-w-0">
                  <Video className="w-4 h-4 text-dark shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-dark">Add Google Meet</p>
                    <p className="text-[10px] text-slateText truncate">
                      {googleStatus.connected
                        ? `Auto-generates a Meet link${googleStatus.email ? ` via ${googleStatus.email}` : ''}.`
                        : 'Connect Google Calendar to auto-generate a Meet link.'}
                    </p>
                  </div>
                </div>
                {googleStatus.connected ? (
                  <label className="shrink-0 relative inline-flex items-center w-10 h-6 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={form.addGoogleMeet}
                      onChange={(e) => setForm({ ...form, addGoogleMeet: e.target.checked })}
                      className="sr-only peer"
                    />
                    <span className="absolute inset-0 rounded-full bg-dark/15 peer-checked:bg-primary transition-colors" />
                    <span className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
                  </label>
                ) : (
                  <button
                    type="button"
                    onClick={handleConnectGoogle}
                    disabled={connecting || !googleStatus.configured}
                    title={!googleStatus.configured ? 'Google OAuth is not configured on the server yet.' : undefined}
                    className="shrink-0 px-3 py-1.5 rounded-lg border border-dark/15 text-dark text-[10px] font-bold hover:bg-dark/5 disabled:opacity-50"
                  >
                    {connecting ? 'Connecting...' : 'Connect'}
                  </button>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-dark mb-1 flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5" /> Meeting link (manual)
                </label>
                <input
                  type="url"
                  placeholder="https://meet.google.com/abc-defg-hij"
                  value={form.meetingLink}
                  onChange={(e) => setForm({ ...form, meetingLink: e.target.value })}
                  disabled={form.addGoogleMeet && googleStatus.connected}
                  className="w-full p-2.5 bg-background border border-dark/10 rounded-xl text-sm focus:outline-none focus:border-dark disabled:opacity-50"
                />
                {form.addGoogleMeet && googleStatus.connected && (
                  <p className="text-[10px] text-slateText mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> The Meet link will be auto-generated on schedule.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-dark mb-1 flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5" /> Remind me
                </label>
                <select
                  value={form.reminderMinutesBefore}
                  onChange={(e) => setForm({ ...form, reminderMinutesBefore: Number(e.target.value) })}
                  className="w-full p-2.5 bg-background border border-dark/10 rounded-xl text-sm font-semibold focus:outline-none focus:border-dark"
                >
                  {REMINDER_OPTIONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-dark/5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-dark font-bold text-xs hover:bg-dark/5"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-[#bce63b] text-dark font-bold text-xs disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Schedule Meeting'}
                </button>
              </div>
            </form>
      </Modal>

      <Modal isOpen={!!viewingMeeting} onClose={() => setViewingMeeting(null)} title={viewingMeeting?.title || ''} maxWidth="md">
        {viewingMeeting && (
          <>
            {isGlobal && viewingMeeting.clientId?.companyName && (
              <span className="inline-block px-2.5 py-1 rounded-full bg-background border border-dark/10 text-[10px] font-bold text-dark">
                {viewingMeeting.clientId.companyName}
              </span>
            )}

            <div className="space-y-2.5 text-xs text-dark">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-3.5 h-3.5 text-slateText shrink-0" />
                <span className="font-semibold">
                  {new Date(viewingMeeting.date).toLocaleDateString('en-GB', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-slateText shrink-0" />
                <span className="font-semibold">
                  {formatTime12h(viewingMeeting.time)} · {viewingMeeting.durationMinutes} minutes
                </span>
              </div>
              {viewingMeeting.attendees?.length > 0 && (
                <div className="flex items-start gap-2">
                  <Users className="w-3.5 h-3.5 text-slateText shrink-0 mt-0.5" />
                  <span className="font-semibold">{viewingMeeting.attendees.join(', ')}</span>
                </div>
              )}
              {viewingMeeting.description && (
                <p className="text-slateText leading-relaxed pt-1 border-t border-dark/5">{viewingMeeting.description}</p>
              )}
            </div>

            {viewingMeeting.meetingLink ? (
              <a
                href={viewingMeeting.meetingLink}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-[#bce63b] text-dark font-bold text-xs"
              >
                <Video className="w-3.5 h-3.5" /> Join Meeting <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <p className="text-[11px] text-slateText text-center py-2 bg-background rounded-xl border border-dark/10">
                No meeting link was added for this call.
              </p>
            )}

            <div className="flex items-center justify-between gap-3 pt-2 border-t border-dark/5">
              <button
                onClick={() => setCancelTarget(viewingMeeting._id)}
                className="px-4 py-2 rounded-xl text-rose-600 font-bold text-xs hover:bg-rose-50 flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Cancel Meeting
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(viewingMeeting)}
                  className="px-4 py-2 rounded-xl border border-dark/15 text-dark font-bold text-xs hover:bg-dark/5 flex items-center gap-1.5"
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={() => setViewingMeeting(null)}
                  className="px-4 py-2 rounded-xl text-dark font-bold text-xs hover:bg-dark/5"
                >
                  Close
                </button>
              </div>
            </div>
          </>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={() => {
          if (cancelTarget) handleDelete(cancelTarget);
          setViewingMeeting(null);
        }}
        title="Cancel this meeting?"
        confirmLabel="Cancel Meeting"
        destructive
      />
    </div>
  );
};

const MonthView: React.FC<{
  anchor: Date;
  setAnchor: (d: Date) => void;
  meetingsByDate: Record<string, any[]>;
  isGlobal: boolean;
  onSelect: (m: any) => void;
}> = ({ anchor, setAnchor, meetingsByDate, isGlobal, onSelect }) => {
  const year = anchor.getFullYear();
  const month = anchor.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const startDay = firstOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array.from({ length: startDay }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const navigateMonth = (dir: 1 | -1) => {
    setAnchor(new Date(year, month + dir, 1));
  };

  return (
    <div className="rounded-xl border border-dark/10 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-background border-b border-dark/10">
        <p className="text-[11px] font-bold text-slateText">
          {firstOfMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
        </p>
        <div className="flex items-center gap-1">
          <button onClick={() => navigateMonth(-1)} aria-label="Previous month" className="focus-ring p-1.5 rounded-lg border border-dark/10 text-dark hover:bg-dark/5">
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => navigateMonth(1)} aria-label="Next month" className="focus-ring p-1.5 rounded-lg border border-dark/10 text-dark hover:bg-dark/5">
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7">
        {DAY_NAMES.map((d) => (
          <div key={d} className="text-center py-1.5 text-[9px] font-bold text-slateText border-b border-dark/10">
            {d}
          </div>
        ))}
        {cells.map((d, i) => {
          const key = d ? toDateKey(d) : `blank-${i}`;
          const dayMeetings = d ? meetingsByDate[toDateKey(d)] || [] : [];
          const isToday = d && toDateKey(d) === toDateKey(new Date());
          return (
            <div key={key} className="min-h-[64px] p-1.5 border-r border-b border-dark/10 last:border-r-0">
              {d && (
                <>
                  <span
                    className={`text-[10px] font-bold ${
                      isToday ? 'inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-dark' : 'text-dark'
                    }`}
                  >
                    {d.getDate()}
                  </span>
                  <div className="mt-1 space-y-0.5">
                    {dayMeetings.slice(0, 2).map((m) => (
                      <button
                        key={m._id}
                        onClick={() => onSelect(m)}
                        title={isGlobal && m.clientId?.companyName ? `${m.title} — ${m.clientId.companyName}` : m.title}
                        className="w-full text-left text-[8px] font-bold text-dark truncate bg-primary/25 rounded px-1 py-0.5 hover:bg-primary/40"
                      >
                        {m.title}
                        {isGlobal && m.clientId?.companyName ? ` · ${m.clientId.companyName}` : ''}
                      </button>
                    ))}
                    {dayMeetings.length > 2 && (
                      <p className="text-[8px] text-slateText font-semibold">+{dayMeetings.length - 2} more</p>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
