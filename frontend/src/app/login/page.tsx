'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const ADMIN_ID = 'admin';
const ADMIN_PASS = 'sanjeevani@2026';

export default function LoginPage() {
    const [id, setId] = useState('');
    const [pass, setPass] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setTimeout(() => {
            if (id === ADMIN_ID && pass === ADMIN_PASS) {
                sessionStorage.setItem('sanjeevani_admin', 'true');
                router.push('/dashboard');
            } else {
                setError('Invalid Admin ID or Password. Please try again.');
                setLoading(false);
            }
        }, 800);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                {/* Logo & Brand */}
                <div className="text-center mb-8">
                    <div className="inline-block mb-4">
                        <Image src="/logo.png" alt="Sanjeevani AI" width={72} height={72} className="rounded-2xl shadow-lg mx-auto" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Sanjeevani AI</h1>
                    <p className="text-slate-500 text-sm mt-1">Admin Portal — Authorized Access Only</p>
                    <a href="/" className="inline-flex items-center gap-1.5 mt-3 px-4 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-full hover:bg-emerald-100 transition-all">🏠 Back to Home</a>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-3xl shadow-xl shadow-emerald-500/5 border border-slate-100 p-8">
                    <h2 className="text-lg font-bold text-slate-800 mb-6">Sign In</h2>

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Admin ID</label>
                            <input
                                type="text"
                                value={id}
                                onChange={(e) => setId(e.target.value)}
                                placeholder="Enter admin ID"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                            <input
                                type="password"
                                value={pass}
                                onChange={(e) => setPass(e.target.value)}
                                placeholder="Enter password"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm"
                                required
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                        >
                            {loading ? 'Verifying...' : 'Access Dashboard'}
                        </button>
                    </form>
                </div>

                <p className="text-center text-xs text-slate-400 mt-6">
                    🔒 Secure Admin Access · Sanjeevani AI v2.0
                </p>
            </div>
        </div>
    );
}
