"use client";

import { useEffect, useState } from 'react';
import { Search, Plus, X, RefreshCw, Trash2 } from 'lucide-react';

interface Doctor {
    id: string;
    name: string;
    specialization: string;
    bio: string | null;
    contact_info: string | null;
    created_at: string;
}

const SPECIALIZATIONS = [
    'Dentist', 'Cardiologist', 'General Physician', 'Pediatrician',
    'Dermatologist', 'Orthopedic', 'ENT', 'Ophthalmologist', 'Neurologist', 'Other'
];

const SPEC_MAP: Record<string, { emoji: string; bg: string; text: string; border: string; card: string }> = {
    'Dentist': { emoji: '🦷', bg: 'bg-sky-100', text: 'text-sky-700', border: 'border-sky-200', card: 'from-sky-50 to-blue-50' },
    'Cardiologist': { emoji: '❤️', bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-200', card: 'from-rose-50 to-pink-50' },
    'General Physician': { emoji: '🩺', bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200', card: 'from-emerald-50 to-teal-50' },
    'Pediatrician': { emoji: '👶', bg: 'bg-violet-100', text: 'text-violet-700', border: 'border-violet-200', card: 'from-violet-50 to-purple-50' },
    'Dermatologist': { emoji: '🧴', bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', card: 'from-amber-50 to-yellow-50' },
    'Orthopedic': { emoji: '🦴', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200', card: 'from-slate-50 to-gray-50' },
    'ENT': { emoji: '👂', bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200', card: 'from-orange-50 to-red-50' },
    'Ophthalmologist': { emoji: '👁️', bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200', card: 'from-indigo-50 to-blue-50' },
    'Neurologist': { emoji: '🧠', bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-200', card: 'from-pink-50 to-fuchsia-50' },
    'Other': { emoji: '🏥', bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-200', card: 'from-teal-50 to-cyan-50' },
};
const defaultSpec = SPEC_MAP['Other'];

// ── Profile Modal ──
function ProfileModal({ doctor, onClose }: { doctor: Doctor; onClose: () => void }) {
    const s = SPEC_MAP[doctor.specialization] ?? defaultSpec;
    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className={`bg-gradient-to-br ${s.card} rounded-3xl shadow-2xl w-full max-w-sm border ${s.border} p-8 text-center relative`}>
                <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-white/60 rounded-xl transition-all">
                    <X className="w-4 h-4 text-slate-500" />
                </button>
                <div className={`w-20 h-20 rounded-2xl ${s.bg} border-2 ${s.border} flex items-center justify-center text-4xl mx-auto mb-4 shadow-sm`}>
                    {s.emoji}
                </div>
                <h2 className="text-xl font-bold text-slate-900">{doctor.name}</h2>
                <p className={`text-sm font-semibold ${s.text} mt-1`}>{doctor.specialization}</p>
                <div className="mt-5 text-left space-y-3">
                    {[
                        { label: 'Doctor ID', value: doctor.id.slice(0, 8).toUpperCase() },
                        { label: 'Bio', value: doctor.bio ?? 'No bio added.' },
                        { label: 'Contact', value: doctor.contact_info ?? 'Not provided' },
                        { label: 'Joined', value: new Date(doctor.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' }) },
                    ].map(row => (
                        <div key={row.label} className="bg-white/70 rounded-xl px-4 py-3">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{row.label}</p>
                            <p className="text-sm text-slate-700 font-medium mt-0.5">{row.value}</p>
                        </div>
                    ))}
                </div>
                <button onClick={onClose} className="mt-5 w-full py-2.5 bg-white/70 hover:bg-white text-slate-700 font-semibold rounded-xl text-sm transition-all">Close</button>
            </div>
        </div>
    );
}

// ── Add Doctor Modal ──
function AddDoctorModal({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
    const [form, setForm] = useState({ name: '', specialization: 'Dentist', bio: '' });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const s = SPEC_MAP[form.specialization] ?? defaultSpec;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';
            const res = await fetch(`${API}/api/doctors`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            if (!res.ok) throw new Error();
            onAdded();
            onClose();
        } catch {
            setError('Failed to add doctor. Try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
                {/* Live preview header */}
                <div className={`bg-gradient-to-r ${s.card} border ${s.border} rounded-2xl p-4 mb-6 flex items-center gap-4`}>
                    <div className={`w-14 h-14 rounded-xl ${s.bg} border ${s.border} flex items-center justify-center text-3xl`}>
                        {s.emoji}
                    </div>
                    <div>
                        <p className="font-bold text-slate-900">{form.name || 'Doctor Name'}</p>
                        <p className={`text-sm font-semibold ${s.text}`}>{form.specialization}</p>
                    </div>
                </div>

                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold text-slate-900">Add New Doctor</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl"><X className="w-5 h-5 text-slate-400" /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Full Name *</label>
                        <input
                            type="text" required
                            value={form.name}
                            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                            placeholder="e.g. Dr. Mehta"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Specialization *</label>
                        <select
                            value={form.specialization}
                            onChange={e => setForm(f => ({ ...f, specialization: e.target.value }))}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        >
                            {SPECIALIZATIONS.map(s => <option key={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Bio (optional)</label>
                        <textarea
                            value={form.bio}
                            onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                            placeholder="Short professional bio..."
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                        />
                    </div>
                    {error && <p className="text-xs text-red-500">{error}</p>}
                    <div className="flex gap-3 pt-1">
                        <button type="button" onClick={onClose} className="flex-1 py-3 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
                        <button type="submit" disabled={saving} className={`flex-1 py-3 ${s.bg} ${s.text} border ${s.border} rounded-xl text-sm font-bold transition-all disabled:opacity-50`}>
                            {saving ? 'Adding...' : `Add ${s.emoji} Doctor`}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── Main Page ──
export default function DoctorsPage() {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);

    const fetchDoctors = async () => {
        setLoading(true);
        const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';
        try {
            const res = await fetch(`${API}/api/doctors`);
            const data = await res.json();
            setDoctors(Array.isArray(data) ? data : []);
        } catch { console.error('Failed to fetch doctors'); }
        finally { setLoading(false); }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Remove ${name} from the directory?`)) return;
        setDeleting(id);
        const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';
        try {
            await fetch(`${API}/api/doctors/${id}`, { method: 'DELETE' });
            fetchDoctors();
        } catch { alert('Failed to remove doctor'); }
        finally { setDeleting(null); }
    };

    useEffect(() => { fetchDoctors(); }, []);

    const filtered = doctors.filter(d =>
        !searchTerm ||
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.specialization.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Doctor Directory</h1>
                    <p className="text-slate-500 text-sm mt-0.5">Manage clinic staff — {doctors.length} registered</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={fetchDoctors} className="p-2.5 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50" title="Refresh">
                        <RefreshCw className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-md shadow-emerald-600/20"
                    >
                        <Plus className="w-4 h-4" /> Add Doctor
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="flex items-center gap-3 bg-white border border-slate-200 px-4 py-3 rounded-xl shadow-sm max-w-md">
                <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <input
                    type="text"
                    placeholder="Search by name or specialization..."
                    className="bg-transparent outline-none text-sm w-full text-slate-700"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Cards */}
            {loading ? (
                <div className="py-16 text-center text-slate-400 text-sm">Loading doctors...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                    {filtered.map((doc) => {
                        const s = SPEC_MAP[doc.specialization] ?? defaultSpec;
                        return (
                            <div key={doc.id} className={`bg-gradient-to-br ${s.card} border ${s.border} rounded-2xl p-6 flex flex-col items-center text-center hover:-translate-y-1 transition-all duration-200 shadow-sm relative group`}>
                                {/* Delete button */}
                                <button
                                    onClick={() => handleDelete(doc.id, doc.name)}
                                    disabled={deleting === doc.id}
                                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition-all"
                                    title="Remove doctor"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>

                                {/* Avatar */}
                                <div className="relative mb-3">
                                    <div className={`w-16 h-16 rounded-2xl ${s.bg} border-2 ${s.border} flex items-center justify-center text-3xl shadow-inner`}>
                                        {s.emoji}
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
                                </div>

                                <h3 className="text-base font-bold text-slate-900">{doc.name}</h3>
                                <p className={`text-xs font-semibold ${s.text} mt-0.5`}>{doc.specialization}</p>
                                {doc.bio && <p className="text-xs text-slate-400 mt-2 line-clamp-2">{doc.bio}</p>}

                                <button
                                    onClick={() => setSelectedDoctor(doc)}
                                    className="mt-4 w-full py-2 rounded-xl border border-white/80 bg-white/60 hover:bg-white text-slate-600 text-xs font-bold transition-all"
                                >
                                    View Full Profile
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {showAddModal && <AddDoctorModal onClose={() => setShowAddModal(false)} onAdded={fetchDoctors} />}
            {selectedDoctor && <ProfileModal doctor={selectedDoctor} onClose={() => setSelectedDoctor(null)} />}
        </div>
    );
}
