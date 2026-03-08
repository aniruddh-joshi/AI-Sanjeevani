import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

const SPEC_MAP: Record<string, { emoji: string; color: string; border: string; accent: string }> = {
  'Dentist': { emoji: '🦷', color: 'from-sky-50 to-blue-50', border: 'border-blue-100', accent: 'text-blue-600' },
  'Cardiologist': { emoji: '❤️', color: 'from-rose-50 to-pink-50', border: 'border-rose-100', accent: 'text-rose-600' },
  'General Physician': { emoji: '🩺', color: 'from-emerald-50 to-teal-50', border: 'border-emerald-100', accent: 'text-emerald-600' },
  'Pediatrician': { emoji: '👶', color: 'from-violet-50 to-purple-50', border: 'border-violet-100', accent: 'text-violet-600' },
  'Dermatologist': { emoji: '🧴', color: 'from-amber-50 to-yellow-50', border: 'border-amber-100', accent: 'text-amber-600' },
  'Orthopedic': { emoji: '🦴', color: 'from-slate-50 to-gray-50', border: 'border-slate-200', accent: 'text-slate-600' },
  'ENT': { emoji: '👂', color: 'from-orange-50 to-red-50', border: 'border-orange-100', accent: 'text-orange-600' },
  'Ophthalmologist': { emoji: '👁️', color: 'from-indigo-50 to-blue-50', border: 'border-indigo-100', accent: 'text-indigo-600' },
  'Neurologist': { emoji: '🧠', color: 'from-pink-50 to-fuchsia-50', border: 'border-pink-100', accent: 'text-pink-600' },
  'Other': { emoji: '🏥', color: 'from-teal-50 to-cyan-50', border: 'border-teal-100', accent: 'text-teal-600' },
};
const defaultSpec = SPEC_MAP['Other'];

async function getDoctors() {
  try {
    const API = process.env.NEXT_PUBLIC_API_URL || '';
    const res = await fetch(`${API}/api/doctors`, { cache: 'no-store' });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export default async function LandingPage() {
  const doctors = await getDoctors();
  return (
    <div className="min-h-screen bg-white text-slate-900">

      {/* ── NAVBAR ── */}
      <Navbar />

      {/* ── HERO ── */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-emerald-50/60 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-700 text-xs font-semibold mb-6">
            <span className="w-2 h-2 bg-emerald-500 rounded-full inline-block animate-pulse" />
            AI-Powered Healthcare Receptionist — Available 24/7
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-6 leading-tight">
            Your Health,{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              Our Priority
            </span>
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Book doctor appointments instantly via Telegram. No waiting in queues,
            no phone calls — just a simple conversation with our AI assistant.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://t.me/sanjeevani_ai_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-base transition-all shadow-xl shadow-emerald-600/20 active:scale-95"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.88 13.617l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.832.942z" />
              </svg>
              Book Appointment on Telegram
            </a>
            <a href="#how-it-works" className="flex items-center gap-2 px-8 py-4 border border-slate-200 hover:border-emerald-200 hover:bg-emerald-50 text-slate-600 rounded-2xl font-semibold text-base transition-all">
              How It Works ↓
            </a>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-10 bg-emerald-600">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
          {[
            { value: '24/7', label: 'Always Available' },
            { value: `${doctors.length}+`, label: 'Specialist Doctors' },
            { value: '< 1 min', label: 'Booking Time' },
            { value: '100%', label: 'Secure & Private' },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-black">{s.value}</p>
              <p className="text-emerald-100 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── DOCTORS ── */}
      <section id="doctors" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black mb-2">
              Meet Our{' '}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                Specialists
              </span>
            </h2>
            <p className="text-slate-500">Experienced doctors dedicated to your wellbeing</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {doctors.length === 0 ? (
              <p className="col-span-4 text-center text-slate-400 py-10">No doctors available right now.</p>
            ) : (
              doctors.map((doc: { id: string; name: string; specialization: string; bio: string | null }) => {
                const s = SPEC_MAP[doc.specialization] ?? defaultSpec;
                return (
                  <div key={doc.id} className={`bg-gradient-to-br ${s.color} border ${s.border} rounded-3xl p-7 hover:-translate-y-1 transition-transform duration-200`}>
                    <div className="text-4xl mb-4">{s.emoji}</div>
                    <h3 className="text-xl font-bold text-slate-900">{doc.name}</h3>
                    <p className={`text-sm font-semibold ${s.accent} mb-3`}>{doc.specialization}</p>
                    <p className="text-slate-500 text-sm leading-relaxed">
                      {doc.bio ?? `Experienced specialist in ${doc.specialization.toLowerCase()} — here to help you.`}
                    </p>
                    <a
                      href="https://t.me/sanjeevani_ai_bot"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-5 inline-block text-sm font-bold text-slate-700 hover:text-emerald-600 transition-colors"
                    >
                      Book with {doc.name.split(' ').slice(-1)[0]} →
                    </a>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-20 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black mb-2">
              How It{' '}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">Works</span>
            </h2>
            <p className="text-slate-500">Book an appointment in under a minute, from your phone</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Open Telegram', desc: 'Find our bot @sanjeevani_ai_bot on Telegram. No app download needed.', icon: '📱' },
              { step: '02', title: 'Chat with AI', desc: 'Tell the AI your symptoms or which doctor you want. Supports Hindi and English.', icon: '💬' },
              { step: '03', title: 'Confirmed!', desc: 'Pick a date and time from available slots. Get instant confirmation with your Appointment ID.', icon: '✅' },
            ].map((item) => (
              <div key={item.step} className="bg-white rounded-3xl p-7 border border-slate-100 relative shadow-sm">
                <span className="absolute -top-3 -left-3 bg-emerald-600 text-white text-xs font-black w-8 h-8 rounded-full flex items-center justify-center shadow">
                  {item.step}
                </span>
                <div className="text-3xl mb-4">{item.icon}</div>
                <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <a
              href="https://t.me/sanjeevani_ai_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold transition-all shadow-xl shadow-emerald-600/20 active:scale-95"
            >
              Get Started on Telegram →
            </a>
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black mb-2">
              Visit{' '}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">Us</span>
            </h2>
            <p className="text-slate-500">We&apos;re here for you — in person or online</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: '📍', label: 'Location', value: 'Sanjeevani Clinic\nNew Delhi, India — 110001' },
              { icon: '🕐', label: 'Working Hours', value: 'Mon–Sat: 9:00 AM – 6:00 PM\nSunday: Closed' },
              { icon: '📲', label: 'Book Online', value: 'Via Telegram Bot\n@sanjeevani_ai_bot' },
            ].map((item) => (
              <div key={item.label} className="bg-slate-50 border border-slate-100 rounded-3xl p-7 text-center">
                <div className="text-3xl mb-3">{item.icon}</div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{item.label}</p>
                <p className="text-slate-700 font-medium text-sm whitespace-pre-line">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-slate-900 text-white py-12 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Sanjeevani AI" width={32} height={32} className="rounded-lg" />
            <div>
              <p className="font-bold">Sanjeevani AI</p>
              <p className="text-slate-400 text-xs">Your Digital Health Assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://github.com/aniruddh-joshi.png"
              alt="Aniruddh Joshi"
              className="w-9 h-9 rounded-full border-2 border-emerald-500 object-cover"
            />
            <div>
              <p className="text-xs text-slate-400">Designed &amp; Developed by</p>
              <a
                href="https://github.com/aniruddh-joshi"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-bold text-white hover:text-emerald-400 transition-colors"
              >
                Aniruddh Joshi ↗
              </a>
            </div>
          </div>
          <p className="text-xs text-slate-500">© 2026 Sanjeevani AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
