'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface AppointmentDetail {
    unique_id: string;
    appointment_date: string;
    appointment_time: string;
    status: string;
    symptoms: string | null;
    patient: { name: string };
    doctor: { name: string; specialization: string };
}

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: string }> = {
    booked: { label: 'Confirmed', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', icon: '✅' },
    completed: { label: 'Completed', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', icon: '🏁' },
    cancelled: { label: 'Cancelled', color: 'text-red-700', bg: 'bg-red-50 border-red-200', icon: '❌' },
};

export default function AppointmentStatusPage() {
    const [apptId, setApptId] = useState('');
    const [data, setData] = useState<AppointmentDetail | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!apptId.trim()) return;
        setLoading(true);
        setData(null);
        setError('');

        try {
            const API = process.env.NEXT_PUBLIC_API_URL || '';
            const res = await fetch(`${API}/api/appointment/${apptId.trim().toUpperCase()}`);
            if (!res.ok) {
                setError('No appointment found with this ID. Please check and try again.');
                return;
            }
            const json = await res.json();
            setData(json);
        } catch {
            setError('Unable to connect to server. Please try again in a moment.');
        } finally {
            setLoading(false);
        }
    };

    const status = data ? (statusConfig[data.status] ?? statusConfig['booked']) : null;
    const [year, month, day] = data?.appointment_date?.split('-') ?? [];
    const displayDate = data ? `${day}/${month}/${year}` : '';
    const displayTime = data?.appointment_time?.substring(0, 5) ?? '';

    // Convert 24h to 12h
    const formatTime = (t: string) => {
        if (!t) return '';
        const [h, m] = t.split(':').map(Number);
        const suffix = h >= 12 ? 'PM' : 'AM';
        const hour = h % 12 || 12;
        return `${hour}:${m.toString().padStart(2, '0')} ${suffix}`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');`}</style>

            {/* Navbar */}
            <nav className="bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3">
                    <Image src="/logo.png" alt="Sanjeevani AI" width={32} height={32} className="rounded-xl" />
                    <span className="font-bold text-slate-900">Sanjeevani <span className="text-emerald-600">AI</span></span>
                </Link>
                <Link href="/" className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-full hover:bg-emerald-100 transition-all">🏠 Back to Home</Link>
            </nav>

            {/* Main */}
            <main className="flex-1 flex items-center justify-center px-6 py-16">
                <div className="w-full max-w-lg">
                    <div className="text-center mb-10">
                        <div className="text-4xl mb-4">🔍</div>
                        <h1 className="text-3xl font-black text-slate-900 mb-2">Check Appointment</h1>
                        <p className="text-slate-500">Enter your Appointment ID to view your booking details</p>
                    </div>

                    {/* Search Form */}
                    <form onSubmit={handleSearch} className="bg-white rounded-3xl shadow-xl shadow-emerald-500/5 border border-slate-100 p-8 mb-6">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Appointment ID</label>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={apptId}
                                onChange={(e) => setApptId(e.target.value)}
                                placeholder="e.g. SJV-2026-0001"
                                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm font-mono transition-all"
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-bold rounded-xl transition-all shadow-md shadow-emerald-600/20 active:scale-95 text-sm whitespace-nowrap"
                            >
                                {loading ? '...' : 'Search'}
                            </button>
                        </div>
                        <p className="text-xs text-slate-400 mt-3">
                            Your Appointment ID was sent via Telegram after booking (starts with SJV-)
                        </p>
                    </form>

                    {/* Error */}
                    {error && (
                        <div className="bg-red-50 border border-red-100 rounded-2xl px-6 py-4 text-red-600 text-sm text-center">
                            {error}
                        </div>
                    )}

                    {/* Result Card */}
                    {data && status && (
                        <div className="bg-white rounded-3xl shadow-xl shadow-emerald-500/5 border border-slate-100 overflow-hidden">
                            {/* Status Banner */}
                            <div className={`px-8 py-4 border-b ${status.bg} flex items-center justify-between`}>
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">{status.icon}</span>
                                    <span className={`font-bold text-sm ${status.color}`}>Appointment {status.label}</span>
                                </div>
                                <span className="text-xs font-mono text-slate-400">{data.unique_id}</span>
                            </div>

                            {/* Details */}
                            <div className="p-8 space-y-5">
                                {[
                                    { label: 'Patient Name', value: data.patient?.name, icon: '👤' },
                                    { label: 'Doctor', value: `${data.doctor?.name}`, icon: '👨‍⚕️' },
                                    { label: 'Specialization', value: data.doctor?.specialization, icon: '🏥' },
                                    { label: 'Date', value: displayDate, icon: '📅' },
                                    { label: 'Time', value: formatTime(displayTime), icon: '⏰' },
                                    ...(data.symptoms ? [{ label: 'Reason / Symptoms', value: data.symptoms, icon: '💬' }] : []),
                                ].map((item) => (
                                    <div key={item.label} className="flex items-start gap-4">
                                        <span className="text-xl mt-0.5">{item.icon}</span>
                                        <div>
                                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{item.label}</p>
                                            <p className="text-slate-800 font-semibold mt-0.5">{item.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Footer */}
                            <div className="px-8 py-4 bg-slate-50 border-t border-slate-100">
                                <p className="text-xs text-slate-400 text-center">
                                    To cancel or reschedule, message us on{' '}
                                    <a href="https://t.me/sanjeevani_ai_bot" className="text-emerald-600 font-semibold hover:underline" target="_blank" rel="noopener noreferrer">
                                        Telegram ↗
                                    </a>
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
