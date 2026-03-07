"use client";

import { useEffect, useState } from 'react';
import { Search, CheckCircle2, XCircle, Clock, RefreshCw } from 'lucide-react';

interface Appointment {
    id: string;
    unique_id: string;
    appointment_date: string;
    appointment_time: string;
    status: string;
    symptoms: string | null;
    patient: { name: string };
    doctor: { name: string; specialization: string };
}

const statusStyle: Record<string, string> = {
    booked: 'bg-sky-50 text-sky-700 border border-sky-200',
    completed: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    cancelled: 'bg-red-50 text-red-600 border border-red-200',
};

const StatusIcon = ({ status }: { status: string }) => {
    if (status === 'booked') return <Clock className="w-3 h-3" />;
    if (status === 'completed') return <CheckCircle2 className="w-3 h-3" />;
    return <XCircle className="w-3 h-3" />;
};

const formatTime = (t: string) => {
    if (!t) return '';
    const [h, m] = t.split(':').map(Number);
    const suffix = h >= 12 ? 'PM' : 'AM';
    return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${suffix}`;
};

const formatDate = (d: string) => {
    const [y, mo, day] = d.split('-');
    return `${day}/${mo}/${y}`;
};

export default function AppointmentsPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const fetchAppointments = async () => {
        setLoading(true);
        const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';
        try {
            const res = await fetch(`${API}/api/appointments`);
            const data = await res.json();
            setAppointments(data);
        } catch {
            console.error('Failed to fetch appointments');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAppointments(); }, []);

    const updateStatus = async (id: string, status: string) => {
        setUpdating(id);
        try {
            const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';
            await fetch(`${API}/api/appointments/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            // Update locally without full refetch
            setAppointments(prev =>
                prev.map(a => a.id === id ? { ...a, status } : a)
            );
        } catch {
            alert('Failed to update. Please try again.');
        } finally {
            setUpdating(null);
        }
    };

    const filtered = appointments.filter(a => {
        const matchSearch = !searchTerm ||
            a.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.doctor?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.unique_id?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchFilter = filterStatus === 'all' || a.status === filterStatus;
        return matchSearch && matchFilter;
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Appointment Management</h1>
                    <p className="text-slate-500 text-sm mt-1">View and manage patient appointments in real-time.</p>
                </div>
                <button
                    onClick={fetchAppointments}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
                >
                    <RefreshCw className="w-4 h-4" /> Refresh
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-slate-100 flex flex-wrap gap-3 items-center justify-between">
                    <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl max-w-xs w-full">
                        <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <input
                            type="text"
                            placeholder="Search patient, doctor or ID..."
                            className="bg-transparent outline-none text-sm w-full text-slate-700"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        {['all', 'booked', 'completed', 'cancelled'].map(s => (
                            <button
                                key={s}
                                onClick={() => setFilterStatus(s)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${filterStatus === s
                                    ? 'bg-emerald-600 text-white shadow-sm'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                {s === 'all' ? 'All' : s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="py-16 text-center text-slate-400 text-sm">Loading appointments...</div>
                ) : filtered.length === 0 ? (
                    <div className="py-16 text-center text-slate-400 text-sm">No appointments found.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    {['Appointment ID', 'Patient', 'Doctor', 'Date & Time', 'Status', 'Actions'].map(h => (
                                        <th key={h} className="px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filtered.map((app) => (
                                    <tr key={app.id} className="hover:bg-slate-50/60 transition-colors group">
                                        <td className="px-5 py-4">
                                            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                                                {app.unique_id}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <p className="font-semibold text-slate-800 text-sm">{app.patient?.name || '—'}</p>
                                            {app.symptoms && (
                                                <p className="text-xs text-slate-400 mt-0.5 max-w-[160px] truncate" title={app.symptoms}>
                                                    💬 {app.symptoms}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-5 py-4">
                                            <p className="text-sm font-medium text-slate-700">{app.doctor?.name}</p>
                                            <p className="text-xs text-slate-400">{app.doctor?.specialization}</p>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-slate-600">
                                            <p className="font-medium">{formatDate(app.appointment_date)}</p>
                                            <p className="text-xs text-slate-400">{formatTime(app.appointment_time)}</p>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${statusStyle[app.status] ?? statusStyle['booked']}`}>
                                                <StatusIcon status={app.status} />
                                                {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            {app.status === 'booked' && (
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        disabled={updating === app.id}
                                                        onClick={() => updateStatus(app.id, 'completed')}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg transition-all disabled:opacity-50"
                                                        title="Mark as Completed"
                                                    >
                                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                                        {updating === app.id ? '...' : 'Complete'}
                                                    </button>
                                                    <button
                                                        disabled={updating === app.id}
                                                        onClick={() => {
                                                            if (confirm(`Cancel appointment ${app.unique_id}?`)) updateStatus(app.id, 'cancelled');
                                                        }}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-lg transition-all disabled:opacity-50"
                                                        title="Cancel Appointment"
                                                    >
                                                        <XCircle className="w-3.5 h-3.5" />
                                                        Cancel
                                                    </button>
                                                </div>
                                            )}
                                            {app.status !== 'booked' && (
                                                <span className="text-xs text-slate-300 italic">No actions</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Footer */}
                <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                    <span>{filtered.length} appointment{filtered.length !== 1 ? 's' : ''} shown</span>
                </div>
            </div>
        </div>
    );
}
