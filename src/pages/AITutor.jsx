import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { transferToAITutor } from '@/functions/transferToAITutor';
import { Button } from '@/components/ui/button';
import { GraduationCap, ArrowRight, Loader2, BrainCircuit, AlertCircle } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function AITutor() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [transferring, setTransferring] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const init = async () => {
            try {
                const userData = await base44.auth.me();
                setUser(userData);
                if (userData) {
                    // User is already logged in — auto-transfer them
                    await doTransfer();
                }
            } catch (e) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    const doTransfer = async () => {
        setTransferring(true);
        setError(null);
        try {
            const response = await transferToAITutor({});
            if (response?.data?.redirect_url) {
                window.location.href = response.data.redirect_url;
            } else {
                throw new Error('No redirect URL received from server.');
            }
        } catch (e) {
            console.error('Transfer error:', e);
            setError('Could not connect to AI Tutor. Please try again.');
            setTransferring(false);
        }
    };

    const handleLogin = async () => {
        // After login, redirect back to this page so doTransfer() runs automatically
        const redirectUrl = window.location.origin + createPageUrl('AITutor');
        await base44.auth.redirectToLogin(redirectUrl);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-purple-950 flex items-center justify-center px-4">
            {/* Background grid */}
            <div className="fixed inset-0 opacity-20 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(200,200,255,0.1) 1px, transparent 0)',
                    backgroundSize: '20px 20px'
                }}
            />

            <div className="relative z-10 w-full max-w-md text-center">
                {/* Logo */}
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/30">
                        <GraduationCap className="w-9 h-9 text-white" />
                    </div>
                </div>

                <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
                    {loading ? (
                        <div className="flex flex-col items-center gap-4 py-6">
                            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                            <p className="text-slate-300">Checking your session...</p>
                        </div>
                    ) : transferring ? (
                        <div className="flex flex-col items-center gap-4 py-6">
                            <div className="relative">
                                <BrainCircuit className="w-12 h-12 text-purple-400" />
                                <div className="absolute inset-0 rounded-full border-2 border-purple-400/30 animate-ping" />
                            </div>
                            <p className="text-white font-semibold text-lg">Launching AI Tutor...</p>
                            <p className="text-slate-400 text-sm">Securely passing your session. You'll be redirected shortly.</p>
                        </div>
                    ) : user ? (
                        // Logged in but transfer hasn't started yet (edge case - show manual button)
                        <div className="flex flex-col items-center gap-4 py-4">
                            <BrainCircuit className="w-10 h-10 text-purple-400" />
                            <h1 className="text-2xl font-bold text-white">AI Tutor</h1>
                            <p className="text-slate-300">Welcome back, <span className="text-white font-semibold">{user.full_name}</span>!</p>

                            {error && (
                                <div className="w-full flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 text-sm">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    {error}
                                </div>
                            )}

                            <Button
                                onClick={doTransfer}
                                disabled={transferring}
                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white border-0 py-6 text-lg font-semibold rounded-xl shadow-xl shadow-indigo-500/20 mt-2"
                            >
                                Launch AI Tutor <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                        </div>
                    ) : (
                        // Not logged in
                        <div className="flex flex-col items-center gap-4 py-4">
                            <BrainCircuit className="w-10 h-10 text-purple-400" />
                            <h1 className="text-2xl font-bold text-white">AI Tutor</h1>
                            <p className="text-slate-300 text-sm leading-relaxed">
                                Sign in to your Schoolace account to access your personalized AI Tutor experience.
                            </p>

                            <Button
                                onClick={handleLogin}
                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white border-0 py-6 text-lg font-semibold rounded-xl shadow-xl shadow-indigo-500/20 mt-2"
                            >
                                Sign in with Schoolace <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>

                            <p className="text-slate-500 text-xs mt-2">
                                Don't have an account?{' '}
                                <button
                                    onClick={handleLogin}
                                    className="text-indigo-400 hover:text-indigo-300 underline"
                                >
                                    Sign up for free
                                </button>
                            </p>
                        </div>
                    )}
                </div>

                <p className="text-slate-600 text-xs mt-4">Powered by Schoolace · ACE AI</p>
            </div>
        </div>
    );
}