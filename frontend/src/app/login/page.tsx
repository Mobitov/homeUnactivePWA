'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { API_URL_LOGIN } from '../../../config/config';
import { useTheme } from '@/app/providers';

export default function LoginPage() {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { isDarkMode } = useTheme();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(API_URL_LOGIN, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, password }),
            });

            if (!response.ok) {
                throw new Error('Identifiants invalides');
            }

            const data = await response.json();
            localStorage.setItem('token', data.token);
            router.push('/account');
        } catch (err: any) {
            setError(err.message || 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-8.5rem)] flex flex-col justify-center">
            <div className="bg-[var(--card-bg)] rounded-xl shadow-[var(--shadow-md)] p-6 w-full max-w-md mx-auto">
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Connexion</h1>
                    <p className="text-[var(--text-secondary)]">Accédez à votre compte HomeUnactive</p>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-[var(--error-bg)] text-[var(--error)] rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-[var(--text-primary)] text-sm font-medium mb-2">
                            Nom d'utilisateur ou Email
                        </label>
                        <input
                            type="text"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all duration-200"
                            placeholder="Entrez votre identifiant"
                            required
                        />
                    </div>

                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="text-[var(--text-primary)] text-sm font-medium">
                                Mot de passe
                            </label>
                            <Link href="/forgot-password" className="text-sm text-[var(--primary)] hover:underline">
                                Mot de passe oublié?
                            </Link>
                        </div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all duration-200"
                            placeholder="Entrez votre mot de passe"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 rounded-lg font-medium text-white transition-all duration-200 ${
                            loading 
                                ? 'bg-[var(--primary-hover)] cursor-not-allowed' 
                                : 'bg-[var(--primary)] hover:bg-[var(--primary-hover)]'
                        }`}
                    >
                        {loading ? 'Connexion en cours...' : 'Se connecter'}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-[var(--text-secondary)]">
                        Vous n'avez pas de compte?{' '}
                        <Link href="/register" className="text-[var(--primary)] hover:underline font-medium">
                            S'inscrire
                        </Link>
                    </p>
                </div>

                <div className="mt-6 pt-6 border-t border-[var(--card-border)]">
                    <div className="flex justify-center space-x-4">
                        <button className="p-2 rounded-full bg-[var(--intensity-bg)] text-[var(--text-primary)] hover:bg-[var(--intensity-fill)] hover:text-white transition-all duration-200">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                            </svg>
                        </button>
                        <button className="p-2 rounded-full bg-[var(--intensity-bg)] text-[var(--text-primary)] hover:bg-[var(--intensity-fill)] hover:text-white transition-all duration-200">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 0C4.477 0 0 4.477 0 10c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.268 2.75 1.026A9.578 9.578 0 0110 4.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.026 2.747-1.026.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C17.14 18.163 20 14.418 20 10c0-5.523-4.477-10-10-10z" clipRule="evenodd" />
                            </svg>
                        </button>
                        <button className="p-2 rounded-full bg-[var(--intensity-bg)] text-[var(--text-primary)] hover:bg-[var(--intensity-fill)] hover:text-white transition-all duration-200">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 0C4.477 0 0 4.477 0 10c0 5.523 4.477 10 10 10 5.523 0 10-4.477 10-10 0-5.523-4.477-10-10-10zm3.11 8.85l-1.61 1.13c-.12.04-.22.07-.31.11v1.8c.01 0 .01-.01.01-.01l1.91-1.33c.2-.14.39-.28.39-.48v-1.22c0-.19-.13-.39-.39-.48-.18-.09-.38-.09-.57 0l-1.34.94V7.5c0-1.1-.9-2-2-2h-.01c-1.1 0-2 .9-2 2v3.8l-1.91 1.33c-.2.14-.39.28-.39.48v1.22c0 .19.13.39.39.48.18.09.38.09.57 0l1.34-.94V15.5c0 1.1.9 2 2 2h.01c1.1 0 2-.9 2-2v-3.8l1.91-1.33c.2-.14.39-.28.39-.48v-1.22c0-.19-.13-.39-.39-.48-.18-.09-.38-.09-.57 0z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
