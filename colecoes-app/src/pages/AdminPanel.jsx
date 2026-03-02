import { useState } from "react";
import { motion } from "framer-motion";

export function AdminPanel({ onExit }) {
    // Manual Admin Figure Entry states (Global Catalog)
    const [manualTitle, setManualTitle] = useState("");
    const [manualSeries, setManualSeries] = useState("");
    const [manualCharacter, setManualCharacter] = useState("");
    const [manualCompany, setManualCompany] = useState("");
    const [manualDimensions, setManualDimensions] = useState("");
    const [manualImage, setManualImage] = useState("");

    const saveManualItem = async () => {
        if (!manualTitle.trim()) {
            alert("O Título do Produto é obrigatório!");
            return;
        }

        const imagesArray = manualImage.split(',').map(img => img.trim()).filter(img => img);

        const newItem = {
            id: Date.now().toString(),
            title: manualTitle,
            series: manualSeries || "N/A",
            character: manualCharacter || "N/A",
            company: manualCompany || "Desconhecido",
            dimensions: manualDimensions || "N/A",
            images: imagesArray.length > 0 ? imagesArray : ["https://images.unsplash.com/photo-1608514660098-98e3b08e50bc?q=80&w=800&auto=format&fit=crop"],
            category: "Figures"
        };

        newItem.details = {
            fabricante: newItem.company,
            escala: newItem.dimensions,
            serie: newItem.series
        };

        try {
            await fetch("http://localhost:3000/global_figures", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newItem),
            });

            alert("Figure adicionada ao Global Catalog com sucesso!");
            setManualTitle("");
            setManualSeries("");
            setManualCharacter("");
            setManualCompany("");
            setManualDimensions("");
            setManualImage("");
        } catch (error) {
            console.error("Error saving manual item:", error);
            alert("Erro ao salvar figure!");
        }
    };

    return (
        <div className="min-h-screen bg-anime-bg flex justify-center p-4 py-12 relative overflow-hidden font-sans">
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-red-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />

            <div className="w-full max-w-4xl relative z-10 flex flex-col gap-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-black border-2 border-red-600 shadow-[8px_8px_0_#dc2626] transform -skew-x-2">
                    <div>
                        <h1 className="text-3xl md:text-5xl font-black italic text-white uppercase tracking-tighter">Painel do Administrador</h1>
                        <p className="text-red-500 font-bold uppercase tracking-widest text-sm mt-1">Global Catalog Manager</p>
                    </div>
                    <button
                        onClick={onExit}
                        className="bg-white text-black hover:bg-gray-200 px-6 py-3 font-black uppercase tracking-widest text-sm border-2 border-white transition-all shadow-[4px_4px_0_#fff]"
                    >
                        Sair
                    </button>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-8 bg-slate-900 border-2 border-slate-700 shadow-[8px_8px_0_#334155] flex flex-col gap-6"
                >
                    <h2 className="text-2xl font-black text-white uppercase tracking-widest">Adicionar Figure Manualmente</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                        <div className="flex flex-col gap-2 md:col-span-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Título do Produto (Obrigatório)</label>
                            <input
                                type="text"
                                value={manualTitle}
                                onChange={(e) => setManualTitle(e.target.value)}
                                className="bg-black border border-slate-700 text-white px-4 py-3 focus:outline-none focus:border-red-600 focus:shadow-[4px_4px_0_#dc2626] transition-all"
                                placeholder="Ex: Asuka Langley - 1/7 - Ver. Radio Eva"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Nome da Obra/Série</label>
                            <input
                                type="text"
                                value={manualSeries}
                                onChange={(e) => setManualSeries(e.target.value)}
                                className="bg-black border border-slate-700 text-white px-4 py-3 focus:outline-none focus:border-red-600 focus:shadow-[4px_4px_0_#dc2626] transition-all"
                                placeholder="Ex: Neon Genesis Evangelion"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Nome do Personagem</label>
                            <input
                                type="text"
                                value={manualCharacter}
                                onChange={(e) => setManualCharacter(e.target.value)}
                                className="bg-black border border-slate-700 text-white px-4 py-3 focus:outline-none focus:border-red-600 focus:shadow-[4px_4px_0_#dc2626] transition-all"
                                placeholder="Ex: Asuka Langley Soryu"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Fabricante (Empresa)</label>
                            <input
                                type="text"
                                value={manualCompany}
                                onChange={(e) => setManualCompany(e.target.value)}
                                className="bg-black border border-slate-700 text-white px-4 py-3 focus:outline-none focus:border-red-600 focus:shadow-[4px_4px_0_#dc2626] transition-all"
                                placeholder="Ex: Alter / Hobby Max"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Dimensões / Escala</label>
                            <input
                                type="text"
                                value={manualDimensions}
                                onChange={(e) => setManualDimensions(e.target.value)}
                                className="bg-black border border-slate-700 text-white px-4 py-3 focus:outline-none focus:border-red-600 focus:shadow-[4px_4px_0_#dc2626] transition-all"
                                placeholder="Ex: 1/7 Scale, 15cm"
                            />
                        </div>

                        <div className="flex flex-col gap-2 md:col-span-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">URLs das Imagens (separe por vírgula)</label>
                            <input
                                type="text"
                                value={manualImage}
                                onChange={(e) => setManualImage(e.target.value)}
                                className="bg-black border border-slate-700 text-white px-4 py-3 focus:outline-none focus:border-red-600 focus:shadow-[4px_4px_0_#dc2626] transition-all"
                                placeholder="https://sua-imagem.com/foto.jpg, https://sua-imagem.com/foto2.jpg"
                            />
                        </div>

                        <button
                            onClick={saveManualItem}
                            className="w-full md:col-span-2 mt-4 bg-red-600 text-black px-6 py-4 font-black uppercase tracking-widest text-lg border-2 border-black hover:bg-white hover:text-red-600 hover:border-red-600 transition-all shadow-[6px_6px_0_#fff]"
                        >
                            Adicionar Figure ao Catálogo Oficial
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
