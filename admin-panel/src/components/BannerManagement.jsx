import React, { useState, useEffect } from 'react';

export function BannerManagement() {
    const [banners, setBanners] = useState([]);
    const [bannerUrl, setBannerUrl] = useState('');
    const [bannerTitle, setBannerTitle] = useState('');

    const fetchBanners = async () => {
        try {
            const response = await fetch("http://localhost:3000/banners");
            if (response.ok) {
                const data = await response.json();
                setBanners(data);
            }
        } catch (err) {
            console.error("Erro ao carregar banners:", err);
        }
    };

    useEffect(() => {
        fetchBanners();
    }, []);

    const handleAddBanner = async () => {
        if (!bannerUrl.trim()) {
            alert("A URL da Imagem é obrigatória!");
            return;
        }

        const newBanner = {
            id: Date.now().toString(),
            url: bannerUrl,
            title: bannerTitle || "Banner Sem Título"
        };

        try {
            const response = await fetch("http://localhost:3000/banners", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newBanner)
            });

            if (response.ok) {
                setBannerUrl('');
                setBannerTitle('');
                fetchBanners();
            } else {
                alert("Erro ao salvar banner no banco de dados.");
            }
        } catch (error) {
            console.error("Erro fatal ao salvar banner:", error);
            alert("Erro de conexão ao salvar.");
        }
    };

    const handleDeleteBanner = async (id) => {
        if (window.confirm("Deseja realmente excluir este banner do sistema?")) {
            try {
                const response = await fetch(`http://localhost:3000/banners/${id}`, {
                    method: "DELETE"
                });

                if (response.ok) {
                    fetchBanners();
                } else {
                    alert("Erro ao excluir banner.");
                }
            } catch (error) {
                alert("Erro de conexão ao excluir.");
            }
        }
    };

    return (
        <div className="w-full">
            <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-6 border-b-2 border-red-600/50 pb-2">
                Adicionar Novo Banner
            </h2>

            <div className="flex flex-col gap-4 mb-8 bg-slate-900 border border-slate-700 p-6">
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">URL da Imagem (em Alta Resolução)</label>
                    <input
                        type="text"
                        value={bannerUrl}
                        onChange={(e) => setBannerUrl(e.target.value)}
                        className="bg-black border border-slate-700 text-white px-4 py-3 focus:outline-none focus:border-red-600 focus:shadow-[4px_4px_0_#dc2626] transition-all"
                        placeholder="https://exemplo.com/imagem.jpg"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Título do Banner (Apenas Referência)</label>
                    <input
                        type="text"
                        value={bannerTitle}
                        onChange={(e) => setBannerTitle(e.target.value)}
                        className="bg-black border border-slate-700 text-white px-4 py-3 focus:outline-none focus:border-red-600 focus:shadow-[4px_4px_0_#dc2626] transition-all"
                        placeholder="Ex: Persona 5 The Royal"
                    />
                </div>

                <button
                    onClick={handleAddBanner}
                    className="mt-4 bg-red-600 text-black px-6 py-4 font-black uppercase tracking-widest text-lg border-2 border-black hover:bg-white hover:text-red-600 transition-all shadow-[6px_6px_0_#fff]"
                >
                    + ADICIONAR BANNER
                </button>
            </div>

            <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-6 border-b-2 border-red-600/50 pb-2 mt-12">
                Banners Ativos ({banners.length})
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {banners.map(banner => (
                    <div key={banner.id} className="bg-slate-900 border border-slate-700 flex flex-col group hover:border-red-600/50 transition-colors">
                        <div className="h-40 w-full overflow-hidden bg-black">
                            <img
                                src={banner.url}
                                alt={banner.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                onError={(e) => { e.target.src = "https://via.placeholder.com/800x400?text=Imagem+Inacessível"; }}
                            />
                        </div>
                        <div className="p-4 flex flex-col gap-4">
                            <span className="text-white font-bold text-sm truncate">{banner.title}</span>

                            <button
                                onClick={() => handleDeleteBanner(banner.id)}
                                className="w-full bg-red-900/50 text-red-400 hover:bg-red-600 hover:text-white py-2 font-bold uppercase tracking-widest text-xs border border-red-900 hover:border-red-600 transition-colors"
                            >
                                Excluir
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {banners.length === 0 && (
                <p className="text-gray-500 font-bold uppercase tracking-widest text-center py-8">
                    Nenhum banner cadastrado ainda no banco de dados.
                </p>
            )}
        </div>
    );
}
