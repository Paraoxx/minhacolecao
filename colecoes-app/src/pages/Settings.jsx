import { useNavigate } from "react-router-dom";

export function Settings({ onLogout }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        onLogout();
        navigate("/");
    };

    return (
        <div className="p-8 max-w-4xl mx-auto flex flex-col items-center">
            <h2 className="text-4xl font-black italic uppercase tracking-widest text-white transform -skew-x-6 drop-shadow-[2px_2px_0_#dc2626] mb-8">
                Configurações
            </h2>

            <div className="bg-slate-900 border-2 border-slate-700 p-8 w-full max-w-md relative shadow-[8px_8px_0_#dc2626] flex flex-col gap-6"
                style={{ clipPath: "polygon(2% 0%, 100% 0%, 98% 100%, 0% 100%)" }}>
                <p className="text-white text-center font-bold tracking-widest uppercase mb-2">
                    Zona de Perigo
                </p>

                <button
                    onClick={handleLogout}
                    className="w-full py-4 bg-red-900 text-white font-black uppercase tracking-widest text-lg border-2 border-red-600 hover:bg-red-600 hover:text-black hover:border-black transition-all shadow-[6px_6px_0_#000] transform -skew-x-6 active:scale-95"
                >
                    Fazer Logout
                </button>
            </div>
        </div>
    );
}
