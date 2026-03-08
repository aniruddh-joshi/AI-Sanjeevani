"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    Users,
    Calendar,
    Clock,
    TrendingUp,
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

export default function DashboardPage() {
    const [stats, setStats] = useState({
        totalPatients: 0,
        totalAppointments: 0,
        todayAppointments: 0,
        pendingApprovals: 0
    });
    const [recentAppointments, setRecentAppointments] = useState<any[]>([]);
    const [chartData, setChartData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const API = process.env.NEXT_PUBLIC_API_URL || '';
            const [statsRes, appRes, chartRes] = await Promise.all([
                fetch(`${API}/api/analytics`),
                fetch(`${API}/api/appointments`),
                fetch(`${API}/api/chart-data`)
            ]);

            const statsData = await statsRes.json();
            const appData = await appRes.json();
            const chartJson = await chartRes.json();

            setStats({
                totalPatients: statsData.totalPatients,
                totalAppointments: statsData.totalAppointments,
                todayAppointments: statsData.todayAppointments,
                pendingApprovals: statsData.pendingApprovals ?? appData.filter((a: any) => a.status === 'booked').length
            });

            setRecentAppointments(appData.slice(0, 5));
            setChartData(chartJson);
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    fetchData();
}, []);

const statCards = [
    { title: 'Total Patients', value: stats.totalPatients, icon: Users, color: 'text-sky-600', bg: 'bg-sky-50' },
    { title: "Today's Appointments", value: stats.todayAppointments, icon: Calendar, color: 'text-teal-600', bg: 'bg-teal-50' },
    { title: 'Pending Approvals', value: stats.pendingApprovals, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { title: 'Total Appointments', value: stats.totalAppointments, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
];

if (loading) return <div className="p-8 text-slate-500">Loading Dashboard Data...</div>;

return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
            <p className="text-slate-500">Welcome back! Here's what's happening today at Sanjeevani AI.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat, i) => (
                <div key={i} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
                    <div className={`p-2.5 rounded-xl ${stat.bg} w-fit`}>
                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                        <p className="text-3xl font-bold text-slate-900 mt-0.5">{stat.value.toLocaleString()}</p>
                    </div>
                </div>
            ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Appointment Trends Chart */}
            <div className="lg:col-span-2 glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-slate-800">Appointment Trends</h2>
                    <select className="bg-slate-50 border border-slate-200 text-xs font-medium rounded-lg px-2 py-1 outline-none text-slate-600">
                        <option>Upcoming 7 Days</option>
                        <option>Upcoming 30 Days</option>
                    </select>
                </div>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                itemStyle={{ color: '#0ea5e9', fontWeight: 'bold' }}
                            />
                            <Area type="monotone" dataKey="appointments" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorApps)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Today's Schedule List */}
            <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-slate-800">Recent Appointments</h2>
                    <Link href="/dashboard/appointments" className="text-emerald-600 text-xs font-bold hover:underline">
                        View All →
                    </Link>
                </div>
                <div className="space-y-4">
                    {recentAppointments.length === 0 ? (
                        <div className="text-slate-400 text-sm italic">No recent appointments.</div>
                    ) : (
                        recentAppointments.map((app) => (
                            <div key={app.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-50 hover:bg-slate-50 transition-colors group">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600 group-hover:bg-white transition-colors">
                                        {app.patient?.name?.charAt(0) || "P"}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">{app.patient?.name}</p>
                                        <p className="text-xs text-slate-400">{app.doctor?.name} • {(() => { const [h, m] = (app.appointment_time || '').split(':').map(Number); return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`; })()}</p>
                                    </div>
                                </div>
                                <div className={`px-2 py-1 rounded-full text-[10px] font-bold ${app.status === 'booked' ? 'bg-sky-50 text-sky-600' : 'bg-green-50 text-green-600'
                                    }`}>
                                    {app.status.toUpperCase()}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    </div>
);
}
