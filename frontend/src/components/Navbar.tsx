"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100 shadow-sm transition-all duration-300">
            <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                {/* Logo — Brand Identity */}
                <Link href="/" className="flex items-center gap-2.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-full transition-all shadow-lg shadow-emerald-600/25">
                    <Image src="/logo.png" alt="Sanjeevani AI" width={30} height={30} className="rounded-lg" />
                    <span className="text-base font-semibold tracking-tight">Sanjeevani AI</span>
                </Link>

                {/* Desktop Nav Links */}
                <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-500">
                    <a href="#doctors" className="hover:text-emerald-600 transition-colors">Our Doctors</a>
                    <a href="#how-it-works" className="hover:text-emerald-600 transition-colors">How It Works</a>
                    <a href="#contact" className="hover:text-emerald-600 transition-colors">Contact</a>
                    <Link href="/appointment-status" className="hover:text-emerald-600 transition-colors font-semibold">
                        Check Appointment
                    </Link>
                    <Link href="/login" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-full text-sm font-semibold transition-all shadow-md">
                        Admin Portal
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="md:hidden p-2 text-slate-600 hover:text-emerald-600 focus:outline-none"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {isOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        )}
                    </svg>
                </button>
            </div>

            {/* Mobile Nav Menu */}
            {isOpen && (
                <div className="md:hidden bg-white border-b border-slate-100 shadow-lg absolute w-full left-0 top-16">
                    <div className="flex flex-col px-6 py-4 space-y-4 text-center">
                        <a href="#doctors" onClick={() => setIsOpen(false)} className="text-slate-600 hover:text-emerald-600 font-medium py-2">Our Doctors</a>
                        <a href="#how-it-works" onClick={() => setIsOpen(false)} className="text-slate-600 hover:text-emerald-600 font-medium py-2">How It Works</a>
                        <a href="#contact" onClick={() => setIsOpen(false)} className="text-slate-600 hover:text-emerald-600 font-medium py-2">Contact</a>
                        <Link href="/appointment-status" onClick={() => setIsOpen(false)} className="text-emerald-600 font-semibold py-2">
                            Check Appointment
                        </Link>
                        <div className="pt-2">
                            <Link href="/login" onClick={() => setIsOpen(false)} className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-full text-sm font-semibold shadow-md">
                                Admin Portal
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
