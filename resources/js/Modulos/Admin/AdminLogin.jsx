import React, { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../api'; // Ajuste o caminho se necessário

export default function AdminLogin({ onLoginSuccess }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Chama a nova rota de login do Laravel
            const response = await api.post('/admin/login', { email, password });
            
            // Pega o token que o Laravel devolveu
            const token = response.data.token;
            
            // O componente "pai" cuidará de salvar o token e abrir o painel
            onLoginSuccess(token);
        } catch (err) {
            setError(err.response?.data?.message || 'Erro de conexão com o servidor.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden font-sans">
            {/* Decorações de Fundo SaaS Premium */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-500/20 rounded-full blur-3xl mix-blend-multiply"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl mix-blend-multiply"></div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="bg-white p-10 rounded-[2rem] shadow-2xl w-full max-w-md relative z-10 border border-slate-100"
            >
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    </div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">HUB Commerce</h2>
                    <p className="text-sm text-slate-500 font-medium mt-2">Acesso restrito ao Workspace de Gestão</p>
                </div>

                {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-rose-50 text-rose-600 p-4 rounded-xl text-sm font-bold mb-6 text-center border border-rose-100">
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">E-mail Corporativo</label>
                        <input 
                            type="email" 
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@hub.com"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-800 shadow-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Senha de Acesso</label>
                        <input 
                            type="password" 
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-800 shadow-sm"
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/30 transition-all disabled:opacity-70 flex items-center justify-center gap-2 mt-4"
                    >
                        {loading ? (
                            <><svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Autenticando...</>
                        ) : (
                            'Acessar Workspace'
                        )}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}