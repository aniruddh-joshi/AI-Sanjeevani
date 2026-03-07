"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Calendar,
    Users,
    UserRound,
    Settings,
    LogOut,
    Stethoscope
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { name: 'Appointments', icon: Calendar, href: '/dashboard/appointments' },
    { name: 'Patients', icon: Users, href: '/dashboard/patients' },
    { name: 'Doctors', icon: UserRound, href: '/dashboard/doctors' },
    { name: 'Settings', icon: Settings, href: '/dashboard/settings' },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="flex h-screen w-64 flex-col bg-white border-r border-slate-200">
            <div className="flex h-20 items-center gap-2 px-6 border-b border-slate-100">
                <div className="bg-sky-500 p-2 rounded-lg">
                    <Stethoscope className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-slate-900 tracking-tight">
                    Sanjeevani <span className="text-sky-500">AI</span>
                </span>
            </div>

            <nav className="flex-1 space-y-1 px-4 py-6">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                                isActive
                                    ? "bg-sky-50 text-sky-600 font-semibold"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                            )}
                        >
                            <item.icon className={cn(
                                "w-5 h-5 transition-colors",
                                isActive ? "text-sky-600" : "text-slate-400 group-hover:text-slate-600"
                            )} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-100">
                <button className="flex w-full items-center gap-3 px-4 py-3 text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200">
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </div>
    );
}
