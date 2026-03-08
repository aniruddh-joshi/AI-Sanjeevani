"use client";

import { useEffect, useState } from 'react';
import { Search, UserPlus, Mail, Phone, RefreshCw, X, Users } from 'lucide-react';

interface Patient {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
    telegram_id: string | null;
    created_at: string;
    appointments?: { count: number }[];
}

export default function PatientsPage() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ name: '', phone: '', email: '' });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const fetchPatients = async () => {
        setLoading(true);
        const API = process.env.NEXT_PUBLIC_API_URL || '';
        try {
            const res = await fetch(`${API}/api/patients`);
            const data = await res.json();
            setPatients(Array.isArray(data) ? data : []);
        } catch {
            setError('Failed to load patients');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPatients(); }, []);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) return;
        setSaving(true);
        try {
            const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';
            const res = await fetch(`${API}/api/patients`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            if (!res.ok) throw new Error('Failed');
            setShowModal(false);
            setForm({ name: '', phone: '', email: '' });
            fetchPatients();
        } catch {
            setError('Failed to add patient. Try again.');
        } finally {
            setSaving(false);
        }
    };

    const filtered = patients.filter(p =>
        !searchTerm ||
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.phone?.includes(searchTerm) ||
        p.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const initials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Patient Records</h1>
                    <p className="text-slate-500 text-sm mt-0.5">Manage and view all registered patients.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={fetchPatients} className="p-2.5 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-all" title="Refresh">
                        <RefreshCw className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md shadow-emerald-600/20 active:scale-95"
                    >
                        <UserPlus className="w-4 h-4" /> Add Patient
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="flex items-center gap-3 bg-white border border-slate-200 px-4 py-3 rounded-xl shadow-sm max-w-md">
                <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <input
                    type="text"
                    placeholder="Search by name, phone, or email..."
                    className="bg-transparent outline-none text-sm w-full text-slate-700"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="py-16 text-center text-slate-400 text-sm">Loading patients...</div>
                ) : filtered.length === 0 ? (
                    <div className="py-16 text-center">
                        <Users className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                        <p className="text-slate-400 text-sm">No patients found</p>
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                {['Patient', 'Contact', 'Telegram', 'Total Appts', 'Registered'].map(h => (
                                    <th key={h} className="px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filtered.map((p) => (
                                <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                                                {initials(p.name || '?')}
                                            </div>
                                            <span className="font-semibold text-slate-800 text-sm">{p.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="space-y-0.5">
                                            {p.phone && (
                                                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                    <Phone className="w-3 h-3" /> {p.phone}
                                                </div>
                                            )}
                                            {p.email && (
                                                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                    <Mail className="w-3 h-3" /> {p.email}
                                                </div>
                                            )}
                                            {!p.phone && !p.email && <span className="text-xs text-slate-300 italic">No contact info</span>}
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${p.telegram_id ? 'bg-sky-50 text-sky-600' : 'bg-slate-100 text-slate-400'}`}>
                                            {p.telegram_id ? '✅ Linked' : 'Not linked'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-sm text-slate-600 font-medium">
                                        {(p.appointments?.[0] as any)?.count ?? 0}
                                    </td>
                                    <td className="px-5 py-4 text-xs text-slate-400">
                                        {new Date(p.created_at).toLocaleDateString('en-IN')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                <div className="px-5 py-3 border-t border-slate-100 text-xs text-slate-400">
                    {filtered.length} patient{filtered.length !== 1 ? 's' : ''} shown
                </div>
            </div>

            {/* Add Patient Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-slate-900">Add New Patient</h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>
                        <form onSubmit={handleAdd} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Full Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={form.name}
                                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    placeholder="e.g. Sanjay Mehta"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Phone (optional)</label>
                                <input
                                    type="tel"
                                    value={form.phone}
                                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                                    placeholder="+91 XXXXX XXXXX"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email (optional)</label>
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                    placeholder="patient@email.com"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                />
                            </div>
                            {error && <p className="text-xs text-red-500">{error}</p>}
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all">
                                    Cancel
                                </button>
                                <button type="submit" disabled={saving} className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white rounded-xl text-sm font-bold transition-all shadow-md">
                                    {saving ? 'Adding...' : 'Add Patient'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
