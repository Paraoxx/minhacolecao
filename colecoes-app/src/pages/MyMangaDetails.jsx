import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";

export function MyMangaDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [manga, setManga] = useState(null);
    const [mangaData, setMangaData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        // Execute the parallel fetches
        Promise.all([
            fetch(`http://localhost:3000/my_collection?mal_id=${id}`).then(res => res.json()),
            fetch(`https://api.jikan.moe/v4/manga/${id}`).then(res => res.json())
        ])
            .then(([colData, jikanData]) => {
                if (colData && colData.length > 0) {
                    setManga(colData[0]);
                } else {
                    setManga(null);
                }
                if (jikanData && jikanData.data) {
                    setMangaData(jikanData.data);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Erro ao carregar detalhes:", err);
                setLoading(false);
            });
    }, [id]);

    if (loading) {
        return <div className="text-white text-center mt-10">Carregando sua coleção...</div>;
    }

    if (!manga) {
        return <div className="text-white text-center mt-10">Mangá não encontrado na coleção.</div>;
    }

    const ownedVolumes = manga.ownedVolumes || [];
    // Sort to display them in order
    const sortedOwnedVolumes = [...ownedVolumes].sort((a, b) => a - b);

    return (
        <div className="w-full min-h-screen bg-anime-bg bg-fixed pb-24 pt-8">
            <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col gap-8">

                {/* Header Actions */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-white font-bold uppercase tracking-widest hover:text-red-500 w-max transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span>Voltar para Coleção</span>
                </button>

                {/* Info Header */}
                <div className="bg-slate-900 border-2 border-white/20 shadow-[8px_8px_0_#dc2626] p-6 md:p-8 flex flex-col md:flex-row gap-8 transform -skew-x-2 relative z-10"
                    style={{ clipPath: "polygon(1% 0%, 100% 0%, 99% 100%, 0% 100%)" }}>

                    <img
                        src={manga.imageUrl || mangaData?.images?.jpg?.large_image_url}
                        alt={manga.title}
                        className="w-48 md:w-64 h-auto object-cover border-4 border-black mx-auto md:mx-0 shadow-[4px_4px_0_rgba(0,0,0,0.5)] transform skew-x-2"
                    />

                    <div className="flex flex-col flex-1 transform skew-x-2">
                        <div className="flex items-center gap-4 mb-2">
                            <h1 className="text-3xl md:text-5xl font-black italic text-white uppercase tracking-tighter drop-shadow-[2px_2px_0_#dc2626] leading-tight">
                                {manga.title}
                            </h1>
                        </div>
                        <h2 className="text-gray-400 font-bold tracking-widest text-sm mb-4">
                            Sua Coleção • Adquirido em {new Date(manga.acquisitionDate).toLocaleDateString('pt-BR')}
                        </h2>

                        <div className="flex gap-4 mb-6 text-sm font-bold uppercase tracking-widest">
                            <span className="bg-red-900 border border-red-500 text-white px-3 py-1">
                                {manga.ownedVolumes?.length || 0} Volumes Adquiridos
                            </span>
                            <span className="bg-black text-white px-3 py-1 border border-white/20">
                                Total Oficial: {mangaData?.volumes || '?'}
                            </span>
                        </div>

                        <p className="text-gray-300 text-sm md:text-base leading-relaxed line-clamp-4 lg:line-clamp-none mb-8 bg-black/40 p-4 border-l-4 border-red-600 shadow-inner">
                            {mangaData?.synopsis}
                        </p>

                        <button
                            onClick={() => navigate(`/manga/${mangaData?.mal_id || manga.mal_id}`)}
                            className="mt-auto px-8 py-4 bg-transparent text-white font-black uppercase tracking-widest text-lg border-2 border-white hover:bg-white hover:text-black transition-all shadow-[6px_6px_0_#dc2626] transform -skew-x-6 active:scale-95 w-full md:w-max self-start"
                        >
                            Comprar Novos Volumes
                        </button>
                    </div>
                </div>

                {/* Owned Volumes Grid */}
                <div className="mt-8">
                    <div className="transform -skew-x-2 mb-8 flex items-baseline gap-4">
                        <h2 className="text-2xl md:text-3xl font-black italic text-white uppercase tracking-tighter drop-shadow-[2px_2px_0_#dc2626]">
                            Volumes Adquiridos
                        </h2>
                        <div className="h-1 flex-1 bg-white/20 ml-4 shadow-[0_2px_0_rgba(0,0,0,0.5)]" />
                    </div>

                    {sortedOwnedVolumes.length === 0 ? (
                        <p className="text-red-500 font-bold italic tracking-widest">
                            Nenhum volume salvo nesta coleção. Tente adicionar novos volumes.
                        </p>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 md:gap-6">
                            {sortedOwnedVolumes.map(volNum => (
                                <div
                                    key={`owned-${volNum}`}
                                    className={`group relative aspect-[3/4] overflow-hidden bg-black transition-all duration-200 transform hover:-translate-y-2 border-2 border-slate-700 hover:border-red-600 shadow-[4px_4px_0_rgba(0,0,0,0.8)]`}
                                    style={{ clipPath: "polygon(4% 0%, 100% 0%, 96% 100%, 0% 100%)" }}
                                >
                                    <img
                                        src={manga.imageUrl || mangaData?.images?.jpg?.large_image_url}
                                        alt={`Volume ${volNum}`}
                                        className="w-full h-full object-cover group-hover:brightness-110 transition-all duration-300"
                                    />

                                    {/* Unselected Badge */}
                                    <div className="absolute top-0 right-0 bg-red-600 text-black font-black px-3 py-1 scale-x-125 transform translate-x-1 uppercase text-xs md:text-sm tracking-tighter shadow-md">
                                        Vol. {volNum}
                                    </div>

                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
