import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function MyMangaDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [manga, setManga] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchManga = async () => {
            try {
                const response = await fetch(`http://localhost:3000/collection?mal_id=${id}`);
                const data = await response.json();
                if (data && data.length > 0) {
                    setManga(data[0]);
                } else {
                    setManga(null);
                }
            } catch (error) {
                console.error("Erro ao buscar mangá:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchManga();
    }, [id]);

    if (loading) {
        return <div className="text-white text-center mt-20 text-xl">Carregando sua coleção...</div>;
    }

    if (!manga) {
        return (
            <div className="text-white text-center mt-20">
                <h2 className="text-2xl mb-4">Mangá não encontrado na coleção.</h2>
                <button onClick={() => navigate(-1)} className="bg-red-600 px-4 py-2 rounded">Voltar</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-900 text-white p-8">
            <button onClick={() => navigate(-1)} className="mb-6 bg-zinc-700 hover:bg-zinc-600 px-4 py-2 rounded transition-colors">
                &larr; Voltar
            </button>

            <div className="flex gap-8 mb-10 bg-zinc-800 p-6 rounded-lg shadow-lg border border-zinc-700">
                <img src={manga?.image} alt={manga?.title} className="w-48 h-auto rounded shadow-md object-cover" />
                <div>
                    <h1 className="text-4xl font-bold mb-4">{manga?.title}</h1>
                    <span className="bg-zinc-700 px-3 py-1 rounded text-sm text-gray-300">Tipo: {manga?.type}</span>
                </div>
            </div>

            <h2 className="text-2xl font-bold mb-6 border-b border-zinc-700 pb-2">Volumes que você possui</h2>

            {manga?.ownedVolumes && manga.ownedVolumes.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {manga.ownedVolumes.map((vol) => (
                        <div key={vol} className="bg-zinc-800 border-2 border-green-500 rounded-lg p-6 text-center shadow flex flex-col items-center justify-center aspect-[3/4]">
                            <span className="text-green-400 font-bold text-2xl">Vol. {vol}</span>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-400 text-lg">Você ainda não tem nenhum volume salvo desta obra.</p>
            )}
        </div>
    );
}
