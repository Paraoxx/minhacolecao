import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import toast from 'react-hot-toast';

export function MangaDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [manga, setManga] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedVolumes, setSelectedVolumes] = useState([]);
    const [volumeCovers, setVolumeCovers] = useState({});

    useEffect(() => {
        if (!manga?.title) return;

        const fetchCovers = async () => {
            try {
                // Passo 1: Achar o ID do MangaDex pelo título
                const searchRes = await fetch(`https://api.mangadex.org/manga?title=${encodeURIComponent(manga.title)}&limit=1`);
                const searchData = await searchRes.json();
                const mdId = searchData.data?.[0]?.id;

                if (!mdId) return; // Se não achar correspondência, aborta silenciosamente

                // Passo 2: Puxar as capas vinculadas a esse ID
                const coverRes = await fetch(`https://api.mangadex.org/cover?manga[0]=${mdId}&limit=100`);
                const coverData = await coverRes.json();

                // Passo 3: Mapear o volume (chave) para a URL da imagem (valor)
                const coversMap = {};
                coverData.data.forEach(cover => {
                    const vol = cover.attributes.volume;
                    const fileName = cover.attributes.fileName;
                    if (vol && !coversMap[vol]) {
                        coversMap[vol] = `https://uploads.mangadex.org/covers/${mdId}/${fileName}`;
                    }
                });

                setVolumeCovers(coversMap);
            } catch (error) {
                console.error("Erro ao buscar capas no MangaDex:", error);
            }
        };

        fetchCovers();
    }, [manga?.title]);

    useEffect(() => {
        setIsLoading(true);
        fetch(`https://api.jikan.moe/v4/manga/${id}`)
            .then(res => res.json())
            .then(data => {
                setManga(data.data);
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Erro ao buscar detalhes do mangá:", err);
                setIsLoading(false);
            });
    }, [id]);

    if (isLoading) {
        return (
            <div className="w-full min-h-screen flex justify-center items-center bg-anime-bg bg-fixed">
                <p className="text-white font-black italic text-2xl uppercase tracking-widest animate-pulse drop-shadow-[2px_2px_0_#dc2626]">
                    Carregando Dados Oficiais...
                </p>
            </div>
        );
    }

    if (!manga) {
        return (
            <div className="w-full min-h-screen flex flex-col justify-center items-center bg-anime-bg">
                <p className="text-white font-black italic text-2xl uppercase tracking-widest mb-4">
                    Mangá não encontrado.
                </p>
                <button
                    onClick={() => navigate(-1)}
                    className="bg-red-600 text-black px-6 py-2 font-black uppercase tracking-widest border-2 border-black hover:bg-white hover:text-red-600 transition-colors transform -skew-x-6 shadow-[4px_4px_0_#fff]"
                >
                    Voltar
                </button>
            </div>
        );
    }

    const toggleVolume = (volNum) => {
        setSelectedVolumes(prev =>
            prev.includes(volNum)
                ? prev.filter(v => v !== volNum)
                : [...prev, volNum]
        );
    };

    const handleSaveToCollection = async () => {
        if (selectedVolumes.length === 0) {
            toast.error("Selecione pelo menos um volume para adicionar.");
            return;
        }

        try {
            // Check if manga exists in my_collection
            const checkRes = await fetch(`http://localhost:3000/my_collection?mal_id=${manga.mal_id}`);
            const existingItems = await checkRes.json();

            if (existingItems.length > 0) {
                // PATCH existing
                const existingItem = existingItems[0];
                // Merge arrays and maintain uniqueness, though ideally the user might just replace it based on their selection. Let's just update the ownedVolumes to match the selection exactly.
                const updatedOwnedVolumes = [...new Set([...(existingItem.ownedVolumes || []), ...selectedVolumes])];

                const patchRes = await fetch(`http://localhost:3000/my_collection/${existingItem.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ownedVolumes: selectedVolumes }) // Replace to match purely what is clicked, per requirement implicitly. Or we can just use the selected array directly if the interface represents absolute truth.
                });

                if (patchRes.ok) {
                    toast.success('Volumes atualizados na sua coleção!');
                    navigate('/'); // Send to Home/My Collection
                }
            } else {
                // POST new
                const newItem = {
                    id: crypto.randomUUID(),
                    mal_id: manga.mal_id,
                    title: manga.title,
                    imageUrl: manga.images.jpg.large_image_url,
                    category: 'Mangás',
                    ownedVolumes: selectedVolumes,
                    acquisitionDate: new Date().toISOString()
                };

                const postRes = await fetch(`http://localhost:3000/my_collection`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newItem)
                });

                if (postRes.ok) {
                    toast.success('Obra e volumes salvos na coleção!');
                    navigate('/');
                }
            }
        } catch (error) {
            console.error("Erro ao salvar mangá:", error);
            toast.error("Erro ao salvar volumes no banco de dados.");
        }
    };

    const totalVolumes = manga.volumes || 50;
    const volumesArray = Array.from({ length: totalVolumes }, (_, i) => i + 1);

    return (
        <div className="w-full min-h-screen bg-anime-bg bg-fixed pb-24 pt-8">
            <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col gap-8">

                {/* Header Actions */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-white font-bold uppercase tracking-widest hover:text-red-500 w-max transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span>Voltar para Busca</span>
                </button>

                {/* Info Header */}
                <div className="bg-slate-900 border-2 border-red-600 shadow-[8px_8px_0_#dc2626] p-6 md:p-8 flex flex-col md:flex-row gap-8 transform -skew-x-2 relative z-10"
                    style={{ clipPath: "polygon(1% 0%, 100% 0%, 99% 100%, 0% 100%)" }}>

                    <img
                        src={manga.images.jpg.large_image_url}
                        alt={manga.title}
                        className="w-48 md:w-64 h-auto object-cover border-4 border-black mx-auto md:mx-0 shadow-[4px_4px_0_rgba(0,0,0,0.5)] transform skew-x-2"
                    />

                    <div className="flex flex-col flex-1 transform skew-x-2">
                        <h1 className="text-3xl md:text-5xl font-black italic text-white uppercase tracking-tighter drop-shadow-[2px_2px_0_#dc2626] mb-2 leading-tight">
                            {manga.title}
                        </h1>
                        <h2 className="text-gray-400 font-bold tracking-widest text-sm mb-4">
                            {manga.title_english || manga.title_japanese}
                        </h2>

                        <div className="flex gap-4 mb-6 text-sm font-bold uppercase tracking-widest">
                            <span className="bg-black text-white px-3 py-1 border border-white/20">
                                ⭐ {manga.score || 'N/A'}
                            </span>
                            <span className="bg-black text-white px-3 py-1 border border-white/20">
                                {manga.status}
                            </span>
                            <span className="bg-red-900 border border-red-500 text-white px-3 py-1">
                                {manga.volumes ? `${manga.volumes} Volumes` : "Em Publicação"}
                            </span>
                        </div>

                        <p className="text-gray-300 text-sm md:text-base leading-relaxed line-clamp-4 lg:line-clamp-none mb-8 bg-black/40 p-4 border-l-4 border-red-600 shadow-inner">
                            {manga.synopsis}
                        </p>

                        <button
                            onClick={handleSaveToCollection}
                            className="mt-auto px-8 py-4 bg-red-600 text-black font-black uppercase tracking-widest text-lg border-2 border-black hover:bg-white hover:text-red-600 hover:border-red-600 transition-all shadow-[6px_6px_0_#fff] transform -skew-x-6 active:scale-95 w-full md:w-max self-start"
                        >
                            Salvar Coleção ({selectedVolumes.length})
                        </button>
                    </div>
                </div>

                {/* Volumes Grid */}
                <div className="mt-8">
                    <div className="transform -skew-x-2 mb-8 flex items-baseline gap-4">
                        <h2 className="text-2xl md:text-3xl font-black italic text-white uppercase tracking-tighter drop-shadow-[2px_2px_0_#dc2626]">
                            Selecione os Volumes
                        </h2>
                        <span className="text-gray-400 font-bold uppercase tracking-widest text-sm">
                            {selectedVolumes.length} Selecionados
                        </span>
                        <div className="h-1 flex-1 bg-white/20 ml-4 shadow-[0_2px_0_rgba(0,0,0,0.5)]" />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 md:gap-6">
                        {volumesArray.map(volNum => {
                            const isSelected = selectedVolumes.includes(volNum);

                            return (
                                <div
                                    key={`vol-${volNum}`}
                                    onClick={() => toggleVolume(volNum)}
                                    className={`group relative aspect-[3/4] cursor-pointer overflow-hidden bg-black transition-all duration-200 transform hover:-translate-y-2
                                        ${isSelected
                                            ? 'border-4 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)] scale-105 z-10'
                                            : 'border-2 border-slate-800 hover:border-red-600 shadow-[4px_4px_0_rgba(0,0,0,0.8)]'
                                        }
                                    `}
                                    style={{ clipPath: "polygon(4% 0%, 100% 0%, 96% 100%, 0% 100%)" }}
                                >
                                    {volumeCovers[volNum] ? (
                                        <img
                                            src={volumeCovers[volNum]}
                                            alt={`Volume ${volNum}`}
                                            className={`w-full h-full object-cover transition-all duration-300 ${isSelected ? 'brightness-50 grayscale-[30%]' : 'group-hover:brightness-75'}`}
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                                            <img
                                                src={manga.images.jpg.large_image_url}
                                                alt={`Volume ${volNum} Placeholder`}
                                                className={`absolute inset-0 w-full h-full object-cover opacity-20 transition-all duration-300 ${isSelected ? 'brightness-50 grayscale-[30%]' : 'group-hover:brightness-50'}`}
                                            />
                                            <span className="text-zinc-500 font-bold uppercase tracking-widest z-10 text-center transform -skew-x-6 text-xs drop-shadow-[1px_1px_0_#000]">Sem Capa</span>
                                        </div>
                                    )}

                                    {/* Unselected Badge */}
                                    {!isSelected && (
                                        <div className="absolute top-0 right-0 bg-red-600 text-black font-black px-3 py-1 scale-x-125 transform translate-x-1 uppercase text-xs md:text-sm tracking-tighter shadow-md">
                                            Vol. {volNum}
                                        </div>
                                    )}

                                    {/* Selected Overlay */}
                                    {isSelected && (
                                        <div className="absolute inset-0 bg-green-500/30 flex flex-col items-center justify-center backdrop-blur-[1px]">
                                            <div className="bg-green-500 text-white rounded-full p-2 mb-2 shadow-[0_0_10px_rgba(34,197,94,0.8)]">
                                                <Check size={32} strokeWidth={4} />
                                            </div>
                                            <span className="bg-black text-green-400 font-black px-4 py-1 text-lg border border-green-500 shadow-md transform -skew-x-6">
                                                VOL. {volNum}
                                            </span>
                                        </div>
                                    )}

                                    {/* Hover info (only when not selected) */}
                                    {!isSelected && (
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="text-white font-black uppercase tracking-widest text-xs border-2 border-white px-3 py-1 transform -skew-x-6">
                                                Selecionar
                                            </span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
