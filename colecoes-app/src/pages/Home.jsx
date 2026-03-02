import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Gallery } from "./Gallery"
import { Plus, Search, Bell, Check } from "lucide-react";
import toast from 'react-hot-toast';

export function Home() {
    const [items, setItems] = useState([]);
    const [activeTab, setActiveTab] = useState("Database");

    // Database specific state
    const [dbCategory, setDbCategory] = useState("Todos");

    // Form states for Settings tab
    const [nickname, setNickname] = useState("Colecionador");
    const [avatarUrl, setAvatarUrl] = useState("https://i.pinimg.com/736x/8d/ad/f4/8dadf490b4adbd52a1ba2e33682be6c6.jpg");
    const [malUrl, setMalUrl] = useState("");
    const [twitterUrl, setTwitterUrl] = useState("");

    // Global Search states
    const [headerSearch, setHeaderSearch] = useState("");
    const [globalSearchTerm, setGlobalSearchTerm] = useState("");
    const [mangaResults, setMangaResults] = useState([]);
    const [figureResults, setFigureResults] = useState([]);
    const [gameResults, setGameResults] = useState([]);
    const [isGlobalSearchLoading, setIsGlobalSearchLoading] = useState(false);
    const [searchResultTab, setSearchResultTab] = useState('Mangás'); // Tabs: 'Mangás', 'Figures', 'Jogos'
    const [gameFormat, setGameFormat] = useState('Físico');
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);

    const fetchNotifications = () => {
        fetch("http://localhost:3000/notifications")
            .then(res => res.json())
            .then(data => {
                // Sort by date descending (newest first)
                const sorted = data.sort((a, b) => new Date(b.date) - new Date(a.date));
                setNotifications(sorted);
            })
            .catch(err => console.error("Erro ao buscar notificações", err));
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleMarkAsRead = async (e, id) => {
        e.stopPropagation(); // Previne fechar o modal ou outro clique indesejado
        try {
            const response = await fetch(`http://localhost:3000/notifications/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ read: true })
            });
            if (response.ok) {
                // Atualiza o estado local para refletir a mudança imediatamente
                setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
            }
        } catch (error) {
            console.error("Erro ao marcar notificação como lida:", error);
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    // Modal states for Adding Items via Jikan API
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchCategory, setSearchCategory] = useState("Mangás");
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // State for Previewing Item Details (Ficha Técnica) before adding
    const [selectedDetailsItem, setSelectedDetailsItem] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        setCurrentImageIndex(0);
    }, [selectedDetailsItem]);
    const fetchItems = () => {
        fetch("http://localhost:3000/my_collection")
            .then((response) => response.json())
            .then((data) => setItems(data))
            .catch((error) => console.error("Error fetching items:", error));
    };

    useEffect(() => {
        fetchItems();
    }, []);

    // Add Modal Search is now driven by an explicit button click.

    // Global Search explicitly triggered by user
    useEffect(() => {
        const fetchAllData = async () => {
            if (!globalSearchTerm.trim()) {
                setMangaResults([]);
                setFigureResults([]);
                setGameResults([]);
                return;
            }

            setIsGlobalSearchLoading(true);

            // 1. Fetch de Figures (Independente)
            try {
                console.log("📡 1. Disparando fetch para porta 3000...");
                const figResponse = await fetch(`http://localhost:3000/global_figures`);
                console.log("✅ 2. Status da resposta:", figResponse.status);

                if (figResponse.ok) {
                    const allFigures = await figResponse.json();
                    console.log("📦 3. Banco de dados bruto recebido:", allFigures);

                    if (allFigures.length === 0) {
                        console.warn("⚠️ ALERTA: O json-server retornou uma lista vazia! Ele está lendo o db.json correto?");
                    }

                    const lowerTerm = globalSearchTerm.toLowerCase();
                    const filteredFigures = allFigures.filter(f => {
                        const titleMatch = f.title && f.title.toLowerCase().includes(lowerTerm);
                        const charMatch = f.character && f.character.toLowerCase().includes(lowerTerm);
                        return titleMatch || charMatch;
                    });

                    const formattedFigures = filteredFigures.map(f => ({
                        ...f,
                        displayTitle: f.title || f.character || 'Sem Título',
                        displayImage: (f.images && f.images.length > 0) ? f.images[0] : (f.image || ''),
                        category: 'Figures',
                        source: 'global_db'
                    }));

                    console.log("🎯 4. Figures após o filtro:", formattedFigures);
                    setFigureResults(formattedFigures);
                } else {
                    console.error("❌ 2. Erro do Servidor:", figResponse.statusText);
                }
            } catch (error) {
                console.error("🚨 ERRO FATAL no Fetch de Figures (O servidor está rodando?):", error);
                setFigureResults([]);
            }

            // 2. Fetch de Mangás (Independente)
            try {
                const mangaResponse = await fetch(`https://api.jikan.moe/v4/manga?q=${encodeURIComponent(globalSearchTerm)}&limit=8`);
                if (mangaResponse.ok) {
                    const mangaData = await mangaResponse.json();
                    const formattedMangas = mangaData.data.map(m => ({
                        id: m.mal_id.toString(),
                        displayTitle: m.title,
                        title: m.title,
                        displayImage: m.images?.jpg?.image_url || '',
                        image: m.images?.jpg?.image_url || '',
                        subtitle: `${m.type} • ${m.status}`,
                        category: 'Mangás',
                        source: 'api'
                    }));
                    setMangaResults(formattedMangas);
                }
            } catch (error) {
                console.error("Erro ao buscar Mangás:", error);
                setMangaResults([]);
            }

            // 3. Fetch de Jogos (RAWG API)
            try {
                const gameResponse = await fetch(`https://api.rawg.io/api/games?search=${encodeURIComponent(globalSearchTerm)}&key=1cb7e7bb03724dbba9ff7e943765c5f0&page_size=8`);
                if (gameResponse.ok) {
                    const gameData = await gameResponse.json();
                    const formattedGames = gameData.results.map(g => ({
                        id: g.id.toString(),
                        displayTitle: g.name,
                        displayImage: g.background_image || '',
                        category: 'Jogos',
                        source: 'api_rawg'
                    }));
                    setGameResults(formattedGames);
                }
            } catch (error) {
                console.error("❌ Erro ao buscar Jogos:", error);
                setGameResults([]);
            }

            setIsGlobalSearchLoading(false);
        };

        fetchAllData();
    }, [globalSearchTerm]);

    const handleSearchClick = async () => {
        if (!searchQuery.trim()) return;

        try {
            console.log(`🚀 Botão clicado! Buscando na aba ${searchCategory} por: ${searchQuery}`);

            let url = '';
            if (searchCategory === 'Figures') {
                url = `http://localhost:3000/global_figures?q=${encodeURIComponent(searchQuery)}`;
            } else if (searchCategory === 'Mangás') {
                url = `https://api.jikan.moe/v4/manga?q=${encodeURIComponent(searchQuery)}&limit=5`;
            }

            console.log(`🌐 Fazendo fetch na URL: ${url}`);
            const response = await fetch(url);

            if (!response.ok) throw new Error('Erro na requisição');

            const data = await response.json();
            console.log("📦 Dados brutos recebidos:", data);

            let formattedData = [];
            if (searchCategory === 'Figures') {
                formattedData = data.map(item => ({
                    ...item,
                    displayTitle: item.title || item.name || 'Sem Título',
                    displayImage: (item.images && item.images.length > 0) ? item.images[0] : (item.image || '')
                }));
            } else if (searchCategory === 'Mangás') {
                // A API Jikan retorna os dados dentro de um array 'data'
                formattedData = (data.data || []).map(m => ({
                    id: m.mal_id.toString(), // ensure ID is string for react keys
                    displayTitle: m.title,
                    displayImage: m.images?.jpg?.image_url || '',
                    subtitle: `${m.type} • ${m.status}` // keeping consistent for UI
                }));
            }

            console.log("✅ Dados formatados para a tela:", formattedData);
            setSearchResults(formattedData);

        } catch (error) {
            console.error("❌ Erro ao buscar:", error);
            setSearchResults([]);
        }
    };

    const saveItem = async (apiItem) => {
        // Find highest existing ID to increment properly
        const highestId = items.reduce((max, item) => {
            const numId = parseInt(item.id, 10);
            return !isNaN(numId) && numId > max ? numId : max;
        }, 0);

        const categoryToSave = apiItem.category || searchCategory;
        const newItem = {
            id: (highestId + 1).toString(),
            title: apiItem.displayTitle || apiItem.title,
            imageUrl: apiItem.displayImage || apiItem.image || apiItem.imageUrl,
            images: apiItem.images || [apiItem.displayImage || apiItem.image || apiItem.imageUrl],
            category: categoryToSave,
            status: "Backlog",
            score: null,
            isWishlist: false,
            format: categoryToSave === 'Jogos' ? gameFormat : null,
            dateAdded: new Date().toISOString()
        };

        if (apiItem.company || (apiItem.details && apiItem.details.fabricante)) {
            newItem.details = {
                fabricante: apiItem.company || (apiItem.details && apiItem.details.fabricante)
            };
        }

        try {
            await fetch("http://localhost:3000/my_collection", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newItem),
            });
            // Update UI and close modal
            fetchItems();
            setIsModalOpen(false);
            setSearchQuery("");
            setSearchResults([]);
            alert("Item adicionado à coleção com sucesso!");
        } catch (error) {
            console.error("Error saving item:", error);
            alert("Erro ao salvar item!");
        }
    };

    const reversedItems = [...items].reverse();

    const tabs = ["Explore", "Collection", "Database", "Settings"];
    const dbCategories = ["Todos", "Mangás", "Figures", "Jogos", "Cartas"];

    const filteredDbItems = dbCategory === "Todos"
        ? items
        : items.filter(item => item.category === dbCategory);

    return (
        <div className="w-full max-w-7xl mx-auto space-y-4 pb-12 pt-0">
            {/* Header Area Container */}
            <header className="flex flex-col gap-6 relative z-10 w-full pl-4 md:pl-0 pr-4 md:pr-0">
                {/* Top Row: Title & Search Actions */}
                <div className="flex flex-col md:flex-row items-start justify-between gap-4 w-full">
                    {/* Top Title */}
                    <div
                        className="transform -skew-x-6 cursor-pointer group"
                        onClick={() => {
                            setActiveTab("Database");
                            setGlobalSearchTerm("");
                            setHeaderSearch("");
                        }}
                    >
                        <h1 className="text-xl md:text-2xl font-bold italic text-white tracking-tighter drop-shadow-[4px_4px_0_#dc2626] group-hover:text-red-500 transition-colors">
                            MINHA COLEÇÃO
                        </h1>
                        <p className="text-white bg-black px-2 mt-2 w-max text-[9px] sm:text-[10px] uppercase font-bold tracking-widest shadow-[2px_2px_0_#dc2626]">
                            Phantom Thieves
                        </p>
                    </div>

                    {/* Right Side: Search & Add */}
                    <div className="flex items-center gap-4 w-full md:w-auto relative z-50">
                        <div className="relative flex items-center w-full max-w-md transform -skew-x-6">
                            <svg className="absolute left-3 w-5 h-5 text-gray-400 z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                value={headerSearch}
                                onChange={(e) => setHeaderSearch(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        setGlobalSearchTerm(headerSearch);
                                        setActiveTab("SearchResults");
                                        setIsModalOpen(false); // Close Add Modal if it is somehow open
                                    }
                                }}
                                placeholder="Pesquisar"
                                className="w-full bg-black/50 border-2 border-white/20 text-white pl-10 pr-4 py-2 font-medium focus:outline-none focus:border-red-600 focus:shadow-[4px_4px_0_#dc2626] transition-all placeholder-gray-500 relative z-10"
                            />
                        </div>

                        {/* Bell Notification */}
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative p-2 text-white hover:text-red-500 transition-colors bg-slate-800 rounded-full border border-slate-700"
                            >
                                <Bell size={20} />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 text-[9px] font-bold text-white bg-red-600 border border-slate-900 rounded-full">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>

                            {/* Dropdown */}
                            {showNotifications && (
                                <div className="absolute right-0 top-full mt-2 w-80 bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl z-50 overflow-hidden transform skew-x-0">
                                    <div className="p-3 border-b border-zinc-700 bg-zinc-800 flex justify-between items-center">
                                        <h3 className="text-sm font-bold text-white uppercase tracking-widest">Notificações</h3>
                                        <span className="text-xs text-gray-400 font-bold">{unreadCount} não lidas</span>
                                    </div>
                                    <div className="max-h-80 overflow-y-auto custom-scrollbar bg-zinc-900">
                                        {notifications.length === 0 ? (
                                            <p className="text-zinc-500 text-xs font-medium p-4 text-center">Nenhuma novidade por enquanto.</p>
                                        ) : (
                                            notifications.map((notif) => (
                                                <div
                                                    key={notif.id}
                                                    className={`p-4 border-b border-zinc-800 flex items-start gap-3 transition-colors ${!notif.read ? 'bg-zinc-800/80 hover:bg-zinc-800' : 'opacity-70 hover:opacity-100 hover:bg-zinc-800/50'}`}
                                                >
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <p className={`text-sm font-bold truncate pr-2 ${!notif.read ? 'text-white' : 'text-gray-300'}`}>
                                                                {notif.title}
                                                            </p>
                                                            <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest shrink-0 mt-0.5">
                                                                {new Date(notif.date).toLocaleDateString('pt-BR')}
                                                            </span>
                                                        </div>
                                                        <p className="text-zinc-400 text-xs leading-relaxed break-words">{notif.message}</p>
                                                    </div>

                                                    <button
                                                        onClick={(e) => !notif.read && handleMarkAsRead(e, notif.id)}
                                                        disabled={notif.read}
                                                        className="shrink-0 mt-1 cursor-pointer disabled:cursor-default outline-none"
                                                        title={notif.read ? "Lida" : "Marcar como lida"}
                                                    >
                                                        <Check
                                                            size={18}
                                                            strokeWidth={3}
                                                            className={`transition-colors ${!notif.read ? 'text-blue-500 hover:text-blue-400' : 'text-zinc-600'}`}
                                                        />
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="shrink-0 flex items-center gap-2 bg-red-600 text-black px-4 py-2 font-black uppercase tracking-widest text-sm border-2 border-black hover:bg-white hover:text-red-600 hover:border-red-600 shadow-[4px_4px_0_#fff] transition-all transform -skew-x-6 active:scale-95"
                            style={{ clipPath: "polygon(5% 0%, 100% 0%, 95% 100%, 0% 100%)" }}
                        >
                            <Plus size={18} strokeWidth={3} />
                            <span>Adicionar</span>
                        </button>
                    </div>
                </div>

                {/* Bottom Row: Profile Avatar & Info */}
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6 pt-2">
                    <div className="shrink-0 relative group">
                        <img
                            src={avatarUrl}
                            alt="Profile Avatar"
                            className="w-20 h-20 md:w-28 md:h-28 object-cover rounded-xl border-4 border-black shadow-[4px_4px_0_#dc2626]"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold text-sm uppercase tracking-widest cursor-pointer" onClick={() => setActiveTab("Settings")}>Edit</span>
                        </div>
                    </div>

                    <div className="flex flex-col items-start transform -skew-x-2">
                        <h2 className="text-xl md:text-2xl font-extrabold italic text-white tracking-tighter drop-shadow-[3px_3px_0_#dc2626] uppercase">
                            {nickname}
                        </h2>
                        <button
                            onClick={() => setActiveTab("Settings")}
                            className="mt-2 px-3 py-1 bg-black text-white text-[10px] md:text-xs font-bold uppercase tracking-widest border border-white/20 hover:border-red-600 hover:text-red-500 transition-colors shadow-[2px_2px_0_#dc2626] transform -skew-x-6"
                        >
                            Edit Profile
                        </button>
                    </div>
                </div>
            </header>

            {/* Horizontal Tab Navigation (Backloggd / Persona style) */}
            <nav className="w-full mt-4 bg-slate-800/80">
                <div className="w-full max-w-7xl mx-auto overflow-x-auto hide-scrollbar pl-4 md:pl-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    <div className="flex p-3 gap-3 min-w-max">
                        {tabs.map((tab, i) => (
                            <motion.button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                whileHover={{ scale: 1.05, rotate: i % 2 === 0 ? 3 : -3 }}
                                whileTap={{ scale: 0.95 }}
                                className={`px-6 py-2 text-sm md:text-base font-black uppercase tracking-widest transition-none border-2 shrink-0 ${activeTab === tab
                                    ? "bg-red-600 text-black border-red-600 shadow-[4px_4px_0px_rgba(0,0,0,0.5)]"
                                    : "bg-black text-white border-white hover:bg-red-600 hover:text-black hover:border-black hover:shadow-[4px_4px_0px_rgba(0,0,0,0.5)]"
                                    }`}
                                style={{
                                    clipPath: "polygon(5% 0%, 100% 0%, 95% 100%, 0% 100%)",
                                }}
                            >
                                {tab}
                            </motion.button>
                        ))}
                    </div>
                </div>
            </nav>

            {/* Tab Content */}
            <main className="w-full min-h-[50vh]">
                <AnimatePresence mode="wait">

                    {/* SEARCH RESULTS TAB */}
                    {activeTab === "SearchResults" && (
                        <motion.section
                            key="search-results"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-6"
                        >
                            <div className="transform -skew-x-2 mb-8 mt-4">
                                <h2 className="text-2xl md:text-3xl font-black italic text-white tracking-tighter drop-shadow-[2px_2px_0_#dc2626] uppercase">
                                    RESULTADOS PARA: "{globalSearchTerm}"
                                </h2>
                                <div className="h-1 w-24 bg-red-600 mt-1 shadow-[2px_2px_0_#fff]" />
                            </div>

                            {/* Tab System for Search Results */}
                            <div className="flex gap-4 mb-6 transform -skew-x-6">
                                {['Mangás', 'Figures', 'Jogos'].map(tab => (
                                    <button
                                        key={`search-tab-${tab}`}
                                        onClick={() => setSearchResultTab(tab)}
                                        className={`px-6 py-2 text-sm md:text-base font-black uppercase tracking-widest transition-none border-2 shrink-0 ${searchResultTab === tab
                                            ? "bg-red-600 text-white border-red-600 shadow-[4px_4px_0px_rgba(0,0,0,0.5)]"
                                            : "bg-slate-800 text-gray-400 border-slate-700 hover:bg-slate-700 hover:text-white"
                                            }`}
                                        style={{ clipPath: "polygon(5% 0%, 100% 0%, 95% 100%, 0% 100%)" }}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            {isGlobalSearchLoading ? (
                                <p className="text-center text-white font-bold italic py-8 animate-pulse uppercase tracking-widest">Buscando informações em toda a rede...</p>
                            ) : (
                                <>
                                    {searchResultTab === 'Mangás' && (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                            {mangaResults.length > 0 ? mangaResults.map(item => (
                                                <div
                                                    key={`res-manga-${item.id}`}
                                                    onClick={() => setSelectedDetailsItem(item)}
                                                    className="group relative bg-slate-800 border-2 border-transparent hover:border-red-600 transition-all cursor-pointer transform hover:-translate-y-2 hover:shadow-[8px_8px_0_#dc2626] skew-x-0"
                                                >
                                                    <div className="aspect-[3/4] overflow-hidden">
                                                        <img
                                                            src={item.displayImage}
                                                            alt={item.displayTitle}
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                                                            <Plus className="text-red-500 mb-2" size={24} />
                                                            <span className="text-white font-black text-xs uppercase tracking-widest">Ver Detalhes</span>
                                                        </div>
                                                    </div>
                                                    <div className="p-3 bg-black transform skew-x-0">
                                                        <p className="font-bold text-white text-sm line-clamp-2 uppercase tracking-tight">{item.displayTitle}</p>
                                                        <p className="text-xs text-red-500 mt-1 font-bold tracking-widest">{item.category}</p>
                                                    </div>
                                                </div>
                                            )) : <p className="text-gray-500 font-bold uppercase tracking-widest col-span-full text-center py-8">Nenhum mangá encontrado no catálogo global.</p>}
                                        </div>
                                    )}
                                    {searchResultTab === 'Figures' && (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                            {figureResults.length > 0 ? figureResults.map(item => (
                                                <div
                                                    key={`res-figure-${item.id}`}
                                                    onClick={() => setSelectedDetailsItem(item)}
                                                    className="group relative bg-slate-800 border-2 border-transparent hover:border-red-600 transition-all cursor-pointer transform hover:-translate-y-2 hover:shadow-[8px_8px_0_#dc2626] skew-x-0"
                                                >
                                                    <div className="aspect-[3/4] overflow-hidden bg-white/5 flex items-center justify-center">
                                                        {item.displayImage ? (
                                                            <img
                                                                src={item.displayImage}
                                                                alt={item.displayTitle}
                                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                            />
                                                        ) : (
                                                            <span className="text-gray-600 font-black text-xs transform -rotate-45 block">SEM FOTO</span>
                                                        )}
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                                                            <Plus className="text-red-500 mb-2" size={24} />
                                                            <span className="text-white font-black text-xs uppercase tracking-widest">Ver Detalhes</span>
                                                        </div>
                                                    </div>
                                                    <div className="p-3 bg-black transform skew-x-0">
                                                        <p className="font-bold text-white text-sm line-clamp-2 uppercase tracking-tight">{item.displayTitle}</p>
                                                        <p className="text-xs text-red-500 mt-1 font-bold tracking-widest">{item.category}</p>
                                                    </div>
                                                </div>
                                            )) : <p className="text-gray-500 font-bold uppercase tracking-widest col-span-full text-center py-8">Nenhuma figure encontrada no catálogo global.</p>}
                                        </div>
                                    )}
                                    {searchResultTab === 'Jogos' && (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                            {gameResults.length > 0 ? gameResults.map(item => (
                                                <div
                                                    key={`res-game-${item.id}`}
                                                    onClick={() => setSelectedDetailsItem(item)}
                                                    className="group relative bg-slate-800 border-2 border-transparent hover:border-red-600 transition-all cursor-pointer transform hover:-translate-y-2 hover:shadow-[8px_8px_0_#dc2626] skew-x-0"
                                                >
                                                    <div className="aspect-[3/4] overflow-hidden bg-white/5 flex items-center justify-center">
                                                        {item.displayImage ? (
                                                            <img
                                                                src={item.displayImage}
                                                                alt={item.displayTitle}
                                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                            />
                                                        ) : (
                                                            <span className="text-gray-600 font-black text-xs transform -rotate-45 block">SEM FOTO</span>
                                                        )}
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                                                            <Plus className="text-red-500 mb-2" size={24} />
                                                            <span className="text-white font-black text-xs uppercase tracking-widest">Ver Detalhes</span>
                                                        </div>
                                                    </div>
                                                    <div className="p-3 bg-black transform skew-x-0">
                                                        <p className="font-bold text-white text-sm line-clamp-2 uppercase tracking-tight">{item.displayTitle}</p>
                                                        <p className="text-xs text-red-500 mt-1 font-bold tracking-widest">{item.category}</p>
                                                    </div>
                                                </div>
                                            )) : <p className="text-gray-500 font-bold uppercase tracking-widest col-span-full text-center py-8">Nenhum jogo encontrado no catálogo global.</p>}
                                        </div>
                                    )}
                                </>
                            )}
                        </motion.section>
                    )}

                    {/* EXPLORE TAB (Adicionados Recentes) */}
                    {activeTab === "Explore" && (
                        <motion.section
                            key="explore"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-6"
                        >
                            <div className="flex justify-between items-end mb-6 pr-4 md:pr-0">
                                <div className="transform -skew-x-2">
                                    <h2 className="text-xl md:text-2xl font-extrabold italic text-white uppercase tracking-tighter drop-shadow-[2px_2px_0_#dc2626]">
                                        Adicionados Recentes
                                    </h2>
                                    <div className="h-1 w-24 bg-white mt-1 shadow-[2px_2px_0_rgba(220,38,38,1)]" />
                                </div>
                                <button className="text-xs md:text-sm text-gray-400 font-bold uppercase tracking-widest hover:text-red-500 transition-colors">
                                    View All
                                </button>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6 pr-4 md:pr-0">
                                {reversedItems.slice(0, 5).map((item, index) => {
                                    // Determine border color based on category
                                    const getBorderColor = (category) => {
                                        switch (category) {
                                            case 'Jogos': return 'border-blue-500';
                                            case 'Figures': return 'border-purple-500';
                                            case 'Cartas': return 'border-yellow-500';
                                            case 'Mangás': return 'border-green-500';
                                            default: return 'border-gray-500';
                                        }
                                    };

                                    return (
                                        <motion.div
                                            key={`recent-${item.id}`}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ duration: 0.2, delay: index * 0.02 }}
                                            className="group relative aspect-[3/4] cursor-pointer overflow-hidden bg-black shadow-[4px_4px_0_rgba(0,0,0,0.5)]"
                                            style={{ clipPath: "polygon(5% 0%, 100% 0%, 95% 100%, 0% 100%)" }}
                                        >
                                            <div className={`absolute inset-0 border-4 ${getBorderColor(item.category)} opacity-40 transition-colors z-10 pointer-events-none group-hover:border-red-600 group-hover:opacity-100`} />

                                            <img
                                                src={item.images && item.images.length > 0 ? item.images[0] : (item.imageUrl || item.image)}
                                                alt={item.title}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 group-hover:brightness-50"
                                                loading="lazy"
                                            />

                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                                                <div className="bg-red-600 text-black p-3 rounded-full transform rotate-12 group-hover:rotate-0 transition-transform duration-300 shadow-[2px_2px_0_#fff]">
                                                    <Plus size={24} strokeWidth={4} />
                                                </div>
                                            </div>

                                            <div className="absolute bottom-0 left-0 w-full bg-black/90 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-20 px-2 py-3 border-t-4 border-red-600">
                                                <p className="text-xs sm:text-sm font-bold text-white truncate text-center uppercase tracking-tighter">
                                                    {item.title}
                                                </p>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </motion.section>
                    )}

                    {/* COLLECTION TAB (Gallery Interface) */}
                    {activeTab === "Collection" && (
                        <motion.section
                            key="collection"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* Reusing existing Gallery component but passing it down directly */}
                            {/* We just wrap it so it renders inside the tab area */}
                            <Gallery />
                        </motion.section>
                    )}

                    {/* DATABASE TAB (Dense Catalog) */}
                    {activeTab === "Database" && (
                        <motion.section
                            key="database"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-8 pt-4"
                        >
                            {/* Database Sub-navigation */}
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pr-4 md:pr-0">
                                <div className="transform -skew-x-2">
                                    <h2 className="text-2xl md:text-3xl font-black italic text-white uppercase tracking-tighter drop-shadow-[2px_2px_0_#dc2626]">
                                        Catálogo Oficial
                                    </h2>
                                    <div className="h-1 w-24 bg-white mt-1 shadow-[2px_2px_0_rgba(220,38,38,1)]" />
                                </div>

                                <div className="flex gap-2 w-full md:w-auto overflow-x-auto hide-scrollbar pb-2 md:pb-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                                    {dbCategories.map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => setDbCategory(cat)}
                                            className={`px-3 py-1 text-xs md:text-sm font-black uppercase tracking-widest transition-all border shrink-0 transform -skew-x-6 ${dbCategory === cat
                                                ? "bg-red-600 text-black border-red-600 shadow-[2px_2px_0px_rgba(0,0,0,0.5)] scale-105"
                                                : "bg-black text-white border-white/30 hover:bg-white hover:text-black hover:border-white shadow-[2px_2px_0px_rgba(0,0,0,0.8)]"
                                                }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Dense Grid */}
                            {dbCategory === "Cartas" ? (
                                <div className="flex flex-col items-center justify-center py-24 w-full text-center col-span-full">
                                    <div className="text-4xl mb-4">🚧</div>
                                    <h2 className="text-2xl font-extrabold text-slate-200 uppercase tracking-widest mb-2">Área de Cartas</h2>
                                    <p className="text-red-500 text-lg font-bold border-2 border-red-500/50 bg-red-500/10 px-6 py-3 rounded-lg shadow-lg">
                                        EM BREVE! Funcionalidade em processo de implementação.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 md:gap-3 pr-4 md:pr-0">
                                    {filteredDbItems.map((item, index) => {
                                        const getBorderColor = (category) => {
                                            switch (category) {
                                                case 'Jogos': return 'border-blue-500';
                                                case 'Figures': return 'border-purple-500';
                                                case 'Cartas': return 'border-yellow-500';
                                                case 'Mangás': return 'border-green-500';
                                                default: return 'border-gray-500';
                                            }
                                        };

                                        return (
                                            <motion.div
                                                key={`db-${item.id}`}
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ duration: 0.2, delay: (index % 10) * 0.02 }}
                                                className="group relative flex flex-col gap-1 cursor-pointer"
                                            >
                                                <div
                                                    className="relative aspect-[3/4] overflow-hidden bg-black shadow-[2px_2px_0_rgba(0,0,0,0.8)]"
                                                    style={{ clipPath: "polygon(5% 0%, 100% 0%, 95% 100%, 0% 100%)" }}
                                                >
                                                    <div className={`absolute inset-0 border-2 ${getBorderColor(item.category)} opacity-30 transition-colors z-10 pointer-events-none group-hover:border-red-600 group-hover:border-4 group-hover:opacity-100`} />

                                                    <img
                                                        src={item.images && item.images.length > 0 ? item.images[0] : (item.imageUrl || item.image)}
                                                        alt={item.title}
                                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 group-hover:brightness-75"
                                                        loading="lazy"
                                                    />

                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
                                                        <div className="bg-red-600 text-black p-1.5 rounded-full transform rotate-12 group-hover:rotate-0 transition-transform shadow-[1px_1px_0_#fff]">
                                                            <Plus size={16} strokeWidth={4} />
                                                        </div>
                                                    </div>
                                                </div>
                                                <p className="text-[10px] sm:text-xs font-bold text-gray-400 group-hover:text-white truncate transition-colors uppercase tracking-tight text-center px-1">
                                                    {item.title}
                                                </p>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}

                        </motion.section>
                    )}

                    {/* SETTINGS TAB */}
                    {activeTab === "Settings" && (
                        <motion.section
                            key="settings"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="max-w-xl mx-auto md:mx-0 pt-4"
                        >
                            <div className="transform -skew-x-2 mb-8">
                                <h2 className="text-2xl md:text-3xl font-black italic text-white uppercase tracking-tighter drop-shadow-[2px_2px_0_#dc2626]">
                                    Profile Settings
                                </h2>
                                <div className="h-1 w-24 bg-red-600 mt-1 shadow-[2px_2px_0_#fff]" />
                            </div>

                            <form className="space-y-6" onSubmit={(e) => {
                                e.preventDefault();
                                toast.success('Your details were saved. View your profile.', {
                                    style: {
                                        background: '#16a34a', // Verde clássico de sucesso do Tailwind
                                        color: '#fff',
                                        fontWeight: 'bold',
                                        padding: '16px',
                                    },
                                    iconTheme: {
                                        primary: '#fff',
                                        secondary: '#16a34a',
                                    },
                                    duration: 4000,
                                });
                            }}>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold uppercase tracking-widest text-gray-400">Alterar Nickname</label>
                                    <input
                                        type="text"
                                        value={nickname}
                                        onChange={(e) => setNickname(e.target.value)}
                                        className="bg-black/50 border-2 border-white/20 text-white px-4 py-3 font-medium focus:outline-none focus:border-red-600 focus:shadow-[4px_4px_0_#dc2626] transition-all transform -skew-x-2"
                                        placeholder="Seu Nickname"
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold uppercase tracking-widest text-gray-400">URL do Avatar</label>
                                    <input
                                        type="text"
                                        value={avatarUrl}
                                        onChange={(e) => setAvatarUrl(e.target.value)}
                                        className="bg-black/50 border-2 border-white/20 text-white px-4 py-3 font-medium focus:outline-none focus:border-red-600 focus:shadow-[4px_4px_0_#dc2626] transition-all transform -skew-x-2"
                                        placeholder="https://..."
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold uppercase tracking-widest text-gray-400">Link MyAnimeList</label>
                                    <input
                                        type="text"
                                        value={malUrl}
                                        onChange={(e) => setMalUrl(e.target.value)}
                                        className="bg-black/50 border-2 border-white/20 text-white px-4 py-3 font-medium focus:outline-none focus:border-red-600 focus:shadow-[4px_4px_0_#dc2626] transition-all transform -skew-x-2"
                                        placeholder="https://myanimelist.net/profile/..."
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold uppercase tracking-widest text-gray-400">Twitter / X</label>
                                    <input
                                        type="text"
                                        value={twitterUrl}
                                        onChange={(e) => setTwitterUrl(e.target.value)}
                                        className="bg-black/50 border-2 border-white/20 text-white px-4 py-3 font-medium focus:outline-none focus:border-red-600 focus:shadow-[4px_4px_0_#dc2626] transition-all transform -skew-x-2"
                                        placeholder="@usuario"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="mt-8 px-8 py-4 bg-red-600 text-black font-black uppercase tracking-widest text-lg border-2 border-black hover:bg-white hover:border-red-600 hover:text-red-600 transition-all shadow-[6px_6px_0_#fff] transform -skew-x-6 active:scale-95"
                                >
                                    Salvar Alterações
                                </button>
                            </form>
                        </motion.section>
                    )}
                </AnimatePresence>
            </main>

            {/* ADD ITEM MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 z-50 flex justify-center items-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="bg-slate-900 border-2 border-white/10 w-full max-w-2xl p-6 relative"
                        style={{ clipPath: "polygon(2% 0%, 100% 0%, 98% 100%, 0% 100%)" }}
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-6 text-gray-400 hover:text-white font-black text-xl cursor-pointer z-50"
                        >
                            X
                        </button>

                        <h3 className="text-2xl font-black italic text-white uppercase tracking-tighter drop-shadow-[2px_2px_0_#dc2626] mb-6 transform -skew-x-2">
                            BUSCAR OBRA
                        </h3>

                        {/* Category Selector */}
                        <div className="flex gap-2 mb-4 w-full">
                            {['Mangás', 'Figures'].map(cat => (
                                <button
                                    key={`modal-cat-${cat}`}
                                    onClick={() => {
                                        setSearchCategory(cat);
                                        setSearchResults([]);
                                    }}
                                    className={`px-4 py-1 text-xs md:text-sm font-black uppercase tracking-widest transition-all border transform -skew-x-6 ${searchCategory === cat
                                        ? "bg-red-600 text-black border-red-600 shadow-[2px_2px_0px_rgba(0,0,0,0.5)] scale-105 z-10"
                                        : "bg-black text-white border-white/30 hover:bg-white hover:text-black hover:border-white shadow-[2px_2px_0px_rgba(0,0,0,0.8)]"
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {/* Dynamic Forms based on Category */}
                        <>
                            {/* Search Input Area */}
                            <div className="flex gap-2 w-full transform -skew-x-2">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()}
                                    placeholder={searchCategory === "Mangás" ? "Nome do mangá..." : "Pesquisar no catálogo oficial..."}
                                    className="flex-1 bg-black border-2 border-white/20 text-white px-4 py-3 font-medium focus:outline-none focus:border-red-600 focus:shadow-[4px_4px_0_#dc2626] transition-all"
                                />
                                <button
                                    onClick={handleSearchClick}
                                    disabled={isLoading}
                                    className="bg-red-600 text-black px-6 font-black uppercase tracking-widest text-sm border-2 border-black hover:bg-white hover:text-red-600 transition-all shadow-[4px_4px_0_#fff] disabled:opacity-50"
                                >
                                    {isLoading ? "..." : "Buscar"}
                                </button>
                            </div>

                            {/* Results List */}
                            <div className="mt-8 space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                                {searchResults.map((item) => {
                                    return (
                                        <div key={item.id} className="flex gap-4 items-center bg-black/40 p-2 border border-white/10 hover:border-red-600/50 transition-colors transform -skew-x-2">
                                            <img
                                                src={item.displayImage || item.image || item.imageUrl}
                                                alt={item.displayTitle || item.title}
                                                className="w-16 h-24 object-cover transform skew-x-2"
                                            />
                                            <div className="flex-1 transform skew-x-2">
                                                <p className="font-bold text-white text-sm line-clamp-2">{item.displayTitle || item.title}</p>
                                                <p className="text-xs text-gray-500 mt-1">{item.subtitle}</p>
                                            </div>
                                            <button
                                                onClick={() => setSelectedDetailsItem(item)}
                                                className="shrink-0 bg-red-600 hover:bg-red-500 text-white px-3 py-2 text-xs font-bold uppercase tracking-widest transition-colors transform skew-x-2 cursor-pointer"
                                                style={{ clipPath: "polygon(5% 0%, 100% 0%, 95% 100%, 0% 100%)" }}
                                            >
                                                Ver Detalhes
                                            </button>
                                        </div>
                                    );
                                })}

                                {searchResults.length === 0 && !isLoading && !errorMessage && searchQuery && (
                                    <p className="text-center text-gray-500 font-bold uppercase tracking-widest py-4">
                                        {searchCategory === 'Figures'
                                            ? "NENHUM ITEM ENCONTRADO NO CATÁLOGO GLOBAL."
                                            : "Nenhum resultado encontrado."}
                                    </p>
                                )}

                                {isLoading && (
                                    <p className="text-center text-white font-bold italic py-4 animate-pulse">Buscando informações oficiais...</p>
                                )}

                                {errorMessage && (
                                    <p className="text-red-500 text-sm mt-4 text-center font-bold px-4">{errorMessage}</p>
                                )}
                            </div>
                        </>
                    </motion.div>
                </div>
            )}

            {/* Ficha Técnica Modal */}
            {/* Ficha Técnica Modal - Carrossel Inline */}
            {selectedDetailsItem && (() => {
                const imagesArray = (selectedDetailsItem.images && selectedDetailsItem.images.length > 0)
                    ? selectedDetailsItem.images
                    : [selectedDetailsItem.displayImage || selectedDetailsItem.imageUrl || selectedDetailsItem.image].filter(Boolean);

                const hasMultipleImages = imagesArray.length > 1;
                const safeIndex = currentImageIndex < imagesArray.length ? currentImageIndex : 0;

                return (
                    <div className="fixed inset-0 bg-black/90 z-[100] flex justify-center items-center p-4">
                        <div className="max-w-4xl w-full bg-slate-900 border-2 border-red-600 rounded-lg flex flex-col md:flex-row p-6 relative">
                            <button
                                onClick={() => setSelectedDetailsItem(null)}
                                className="absolute top-4 right-4 text-white hover:text-red-500 font-bold text-xl z-50"
                            >
                                X
                            </button>

                            <div className="w-full md:w-1/2 flex justify-center relative group">
                                <img
                                    src={imagesArray[safeIndex]}
                                    alt={selectedDetailsItem.displayTitle || selectedDetailsItem.title}
                                    className="w-full h-full object-contain max-h-96 select-none"
                                />

                                {hasMultipleImages && (
                                    <>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => prev === 0 ? imagesArray.length - 1 : prev - 1); }}
                                            className="absolute left-2 top-1/2 transform -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-slate-900/80 hover:bg-red-600 font-bold rounded-full text-white cursor-pointer transition-colors backdrop-blur-sm border border-white/10"
                                        >
                                            &lt;
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => prev === imagesArray.length - 1 ? 0 : prev + 1); }}
                                            className="absolute right-2 top-1/2 transform -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-slate-900/80 hover:bg-red-600 font-bold rounded-full text-white cursor-pointer transition-colors backdrop-blur-sm border border-white/10"
                                        >
                                            &gt;
                                        </button>

                                        <div className="absolute bottom-[-16px] left-1/2 transform -translate-x-1/2 flex gap-1.5">
                                            {imagesArray.map((_, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`w-2.5 h-2.5 rounded-full transition-colors ${idx === safeIndex ? 'bg-red-600' : 'bg-white/30'}`}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="w-full md:w-1/2 md:pl-8 flex flex-col gap-4 mt-8 md:mt-0">
                                <h2 className="text-3xl font-black text-white">{selectedDetailsItem.displayTitle || selectedDetailsItem.title}</h2>

                                <div>
                                    <span className="text-gray-400 font-bold block">Obra:</span>
                                    <span className="text-white text-lg">{selectedDetailsItem.series || selectedDetailsItem.obra || (selectedDetailsItem.details && selectedDetailsItem.details.serie) || 'Não especificada'}</span>
                                </div>

                                <div>
                                    <span className="text-gray-400 font-bold block">Personagem:</span>
                                    <span className="text-white text-lg">{selectedDetailsItem.character || selectedDetailsItem.personagem || 'Não especificado'}</span>
                                </div>

                                <div>
                                    <span className="text-gray-400 font-bold block">Empresa/Fabricante:</span>
                                    <span className="text-white text-lg">{selectedDetailsItem.company || (selectedDetailsItem.details && selectedDetailsItem.details.fabricante) || 'Não especificada'}</span>
                                </div>

                                <div>
                                    <span className="text-gray-400 font-bold block">Dimensões:</span>
                                    <span className="text-white text-lg">{selectedDetailsItem.dimensions || selectedDetailsItem.dimensoes || (selectedDetailsItem.details && selectedDetailsItem.details.escala) || 'Não especificadas'}</span>
                                </div>

                                {selectedDetailsItem.category === 'Jogos' && (
                                    <div className="flex gap-4 mb-4 mt-2">
                                        <label className="flex items-center gap-2 text-white font-bold tracking-wider uppercase cursor-pointer hover:text-red-500 transition-colors">
                                            <input type="radio" name="format" value="Físico" checked={gameFormat === 'Físico'} onChange={(e) => setGameFormat(e.target.value)} className="accent-red-600 w-5 h-5 cursor-pointer" />
                                            Físico
                                        </label>
                                        <label className="flex items-center gap-2 text-white font-bold tracking-wider uppercase cursor-pointer hover:text-red-500 transition-colors">
                                            <input type="radio" name="format" value="Digital" checked={gameFormat === 'Digital'} onChange={(e) => setGameFormat(e.target.value)} className="accent-red-600 w-5 h-5 cursor-pointer" />
                                            Digital
                                        </label>
                                    </div>
                                )}

                                <button
                                    onClick={() => {
                                        saveItem(selectedDetailsItem);
                                        setSelectedDetailsItem(null);
                                    }}
                                    className="mt-auto bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded transform hover:scale-105 transition-all text-xl"
                                >
                                    + ADICIONAR À MINHA LISTA
                                </button>
                            </div>
                        </div>
                    </div>
                )
            })() /* Fim do IIFE */}
        </div>
    );
}

export default Home;
