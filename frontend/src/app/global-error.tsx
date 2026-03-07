'use client';

import { Inter } from "next/font/google";
import "../globals.css";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
});

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html lang="en">
            <body className={`${inter.variable} font-sans antialiased bg-slate-50 min-h-screen flex items-center justify-center p-6`}>
                <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-8 text-center">
                    <div className="text-4xl mb-6">🩺</div>
                    <h2 className="text-2xl font-black text-slate-900 mb-4">Something went wrong!</h2>
                    <p className="text-slate-500 mb-8 leading-relaxed text-sm">
                        We encountered a technical issue. Don&apos;t worry, your health data is safe. Please try refreshing the page.
                    </p>
                    <button
                        onClick={() => reset()}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
                    >
                        Try Again
                    </button>
                    <a
                        href="/"
                        className="inline-block mt-6 text-sm font-semibold text-emerald-600 hover:text-emerald-700 underline"
                    >
                        Back to Home
                    </a>
                </div>
            </body>
        </html>
    );
}
