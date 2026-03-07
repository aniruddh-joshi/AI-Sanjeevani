"use client";

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const NAV_ITEMS = [
    { label: 'Overview', href: '/dashboard', icon: '📊' },
    { label: 'Appointments', href: '/dashboard/appointments', icon: '📅' },
    { label: 'Patients', href: '/dashboard/patients', icon: '👥' },
    { label: 'Doctors', href: '/dashboard/doctors', icon: '👨‍⚕️' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        const session = sessionStorage.getItem('sanjeevani_admin');
        if (!session) {
            router.replace('/login');
        } else {
            setAuthorized(true);
        }
    }, [router]);

    if (!authorized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* ── Sidebar ── */}
            <aside className="w-64 bg-white border-r border-slate-100 flex flex-col fixed h-full z-30">
                {/* Brand */}
                <div className="p-5 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/logo.png" alt="Sanjeevani AI" className="w-9 h-9 rounded-xl object-cover" />
                        <div>
                            <p className="font-bold text-slate-900 text-sm">Sanjeevani AI</p>
                            <p className="text-[11px] text-slate-400 font-medium">Admin Dashboard</p>
                        </div>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 p-3 space-y-0.5">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive
                                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                            >
                                <span className="text-base">{item.icon}</span>
                                {item.label}
                                {isActive && <span className="ml-auto w-1.5 h-1.5 bg-white/60 rounded-full" />}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="p-3 border-t border-slate-100 space-y-1">
                    <a
                        href="/"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all"
                    >
                        <span>🌐</span> View Website
                    </a>
                    <button
                        onClick={() => { sessionStorage.clear(); window.location.href = '/login'; }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all"
                    >
                        <span>🚪</span> Logout
                    </button>
                </div>
            </aside>

            {/* ── Main Content ── */}
            <main className="flex-1 ml-64 overflow-auto min-h-screen">
                <header className="bg-white border-b border-slate-100 px-8 py-4 flex items-center justify-between sticky top-0 z-20">
                    <div>
                        <p className="text-sm font-semibold text-slate-900">
                            {NAV_ITEMS.find(n => n.href === pathname)?.label ?? 'Dashboard'}
                        </p>
                        <p className="text-[11px] text-slate-400">Sanjeevani AI · Admin Portal</p>
                    </div>
                    <div className="text-xs text-slate-400 font-medium hidden sm:block">
                        {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </header>
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
