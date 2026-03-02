import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function AuthView({ onLoginSuccess }) {
    const [isLogin, setIsLogin] = useState(true);
    const [nickname, setNickname] = useState("");
    const [senha, setSenha] = useState("");
    const [telefone, setTelefone] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg("");

        try {
            if (isLogin) {
                // Login action
                const response = await fetch(`http://localhost:3000/users?nickname=${nickname}&senha=${senha}`);
                const data = await response.json();

                if (data.length > 0) {
                    onLoginSuccess(data[0]);
                } else {
                    setErrorMsg("Nickname ou senha inválidos.");
                }
            } else {
                // Register action
                // Optional: check if username exists first. Let's just create.
                const newUser = {
                    nickname,
                    senha,
                    telefone,
                    id: Date.now().toString()
                };

                const response = await fetch("http://localhost:3000/users", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(newUser)
                });

                if (response.ok) {
                    const savedUser = await response.json();
                    onLoginSuccess(savedUser);
                } else {
                    setErrorMsg("Erro ao registrar.");
                }
            }
        } catch (error) {
            console.error(error);
            setErrorMsg("Erro de conexão com o servidor.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#0f172a] p-4 relative overflow-hidden">
            {/* Decoration Background */}
            <div className="absolute opacity-10 blur-xl inset-0 bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay"></div>

            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="bg-slate-900 border-2 border-red-600/50 p-8 w-full max-w-md relative z-10 shadow-[8px_8px_0_#dc2626]"
                style={{ clipPath: "polygon(2% 0%, 100% 0%, 98% 100%, 0% 100%)" }}
            >
                <div className="text-center mb-8 transform -skew-x-6">
                    <h1 className="text-4xl font-black italic text-white tracking-tighter drop-shadow-[2px_2px_0_#dc2626]">
                        {isLogin ? "ENTRAR" : "REGISTRAR"}
                    </h1>
                    <p className="text-red-500 font-bold uppercase tracking-widest text-xs mt-2">
                        Phantom Thieves Protocol
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4 transform -skew-x-2">
                    {errorMsg && (
                        <div className="bg-red-900/50 border border-red-500 text-white p-3 text-sm font-bold text-center">
                            {errorMsg}
                        </div>
                    )}

                    <div className="flex flex-col gap-1">
                        <label className="text-gray-400 text-xs font-bold tracking-widest uppercase">Nickname</label>
                        <input
                            type="text"
                            required
                            value={nickname}
                            onChange={e => setNickname(e.target.value)}
                            className="bg-black/50 border-2 border-white/20 text-white px-4 py-3 font-medium focus:outline-none focus:border-red-600 focus:shadow-[4px_4px_0_#dc2626] transition-all"
                            placeholder="Seu Nickname"
                        />
                    </div>

                    {!isLogin && (
                        <div className="flex flex-col gap-1">
                            <label className="text-gray-400 text-xs font-bold tracking-widest uppercase">Telefone</label>
                            <input
                                type="text"
                                required
                                value={telefone}
                                onChange={e => setTelefone(e.target.value)}
                                className="bg-black/50 border-2 border-white/20 text-white px-4 py-3 font-medium focus:outline-none focus:border-red-600 focus:shadow-[4px_4px_0_#dc2626] transition-all"
                                placeholder="(11) 90000-0000"
                            />
                        </div>
                    )}

                    <div className="flex flex-col gap-1">
                        <label className="text-gray-400 text-xs font-bold tracking-widest uppercase">Senha</label>
                        <input
                            type="password"
                            required
                            value={senha}
                            onChange={e => setSenha(e.target.value)}
                            className="bg-black/50 border-2 border-white/20 text-white px-4 py-3 font-medium focus:outline-none focus:border-red-600 focus:shadow-[4px_4px_0_#dc2626] transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        disabled={isLoading}
                        type="submit"
                        className="mt-6 px-8 py-4 bg-red-600 text-black font-black uppercase tracking-widest text-lg border-2 border-black hover:bg-white hover:border-red-600 hover:text-red-600 transition-all shadow-[6px_6px_0_#fff] min-w-full transform -skew-x-6 active:scale-95 disabled:opacity-50"
                    >
                        {isLoading ? "Processando..." : (isLogin ? "Entrar" : "Registrar via Protocolo")}
                    </button>

                    <div className="mt-4 text-center transform skew-x-2">
                        {isLogin ? (
                            <div className="flex flex-col gap-3 text-sm font-bold uppercase tracking-widest">
                                <a href="#" className="text-gray-400 hover:text-white transition-colors">Esqueceu a senha?</a>
                                <button type="button" onClick={() => { setIsLogin(false); setErrorMsg(""); }} className="text-red-500 hover:text-white transition-colors">CRIAR CONTA</button>
                            </div>
                        ) : (
                            <button type="button" onClick={() => { setIsLogin(true); setErrorMsg(""); }} className="text-gray-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest">
                                Já possui cadastro? Entrar
                            </button>
                        )}
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
