import { motion } from "framer-motion";
import { useState } from "react";

export function ItemDetails({ item, onClose, onAdd }) {
    const [currentImgIndex, setCurrentImgIndex] = useState(0);

    if (!item) return null;

    const imagesList = item.images && item.images.length > 0 ? item.images : [item.imageUrl || item.image];

    const nextImage = (e) => {
        e.stopPropagation();
        setCurrentImgIndex((prev) => (prev + 1) % imagesList.length);
    };

    const prevImage = (e) => {
        e.stopPropagation();
        setCurrentImgIndex((prev) => (prev === 0 ? imagesList.length - 1 : prev - 1));
    };

    const renderDetails = () => {
        const { details } = item;
        if (!details) return null;

        return (
            <div className="mt-6 flex flex-col gap-4">
                {item.subtitle === "Cartas" && (
                    <>
                        <div className="flex justify-between items-center border-b border-anime-border pb-2">
                            <span className="text-slate-400">Raridade</span>
                            <span className="text-white font-medium">{details.raridade}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-anime-border pb-2">
                            <span className="text-slate-400">Valor Estimado</span>
                            <span className="text-anime-accent font-medium">{details.valorEstimado}</span>
                        </div>
                    </>
                )}
                {item.subtitle === "Jogos" && (
                    <>
                        <div className="flex justify-between items-center border-b border-anime-border pb-2">
                            <span className="text-slate-400">Plataforma</span>
                            <span className="text-white font-medium">{details.plataforma}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-anime-border pb-2">
                            <span className="text-slate-400">Status</span>
                            <span className="text-white font-medium">{details.status}</span>
                        </div>
                    </>
                )}
                {item.subtitle === "Mangás" && (
                    <>
                        <div className="flex justify-between items-center border-b border-anime-border pb-2">
                            <span className="text-slate-400">Volume</span>
                            <span className="text-white font-medium">{details.volume}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-anime-border pb-2">
                            <span className="text-slate-400">Editora</span>
                            <span className="text-white font-medium">{details.editora}</span>
                        </div>
                    </>
                )}
                {item.category === "Figures" && (
                    <>
                        <div className="flex justify-between items-center border-b border-anime-border pb-2">
                            <span className="text-slate-400">Obra/Série</span>
                            <span className="text-white font-medium">{item.series || item.details?.serie || "N/A"}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-anime-border pb-2">
                            <span className="text-slate-400">Personagem</span>
                            <span className="text-white font-medium">{item.character || item.title.split('-')[1]?.trim() || "N/A"}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-anime-border pb-2">
                            <span className="text-slate-400">Fabricante</span>
                            <span className="text-white font-medium">{item.company || item.details?.fabricante || "N/A"}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-anime-border pb-2">
                            <span className="text-slate-400">Dimensões/Escala</span>
                            <span className="text-white font-medium">{item.dimensions || item.details?.escala || "N/A"}</span>
                        </div>
                    </>
                )}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pb-20 sm:pb-6">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
            />

            <motion.div
                layoutId={`card-container-${item.id}`}
                className="relative w-full max-w-lg bg-anime-card border border-anime-border rounded-2xl overflow-hidden shadow-2xl flex flex-col z-10 max-h-[90vh]"
            >
                <div className="relative w-full aspect-video sm:aspect-[4/3] bg-black group">
                    <motion.img
                        layoutId={`card-image-${item.id}`}
                        src={imagesList[currentImgIndex]}
                        alt={item.title}
                        className="w-full h-full object-cover transition-opacity duration-300"
                        key={currentImgIndex}
                    />

                    {imagesList.length > 1 && (
                        <>
                            <button
                                onClick={prevImage}
                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-2 sm:p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all font-bold text-lg"
                            >
                                &lt;
                            </button>
                            <button
                                onClick={nextImage}
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-2 sm:p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all font-bold text-lg"
                            >
                                &gt;
                            </button>

                            <div className="absolute bottom-2 inset-x-0 flex justify-center gap-2">
                                {imagesList.map((_, idx) => (
                                    <div
                                        key={idx}
                                        className={`w-2 h-2 rounded-full transition-all ${idx === currentImgIndex ? 'bg-red-600 scale-125' : 'bg-white/50'}`}
                                    />
                                ))}
                            </div>
                        </>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-anime-card via-transparent to-transparent pointer-events-none" />

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 bg-black/50 hover:bg-black/80 text-white w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-colors"
                    >
                        ✕
                    </button>
                </div>

                <div className="p-6 sm:p-8 overflow-y-auto">
                    <motion.div layoutId={`card-content-${item.id}`}>
                        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                            {item.title}
                        </h2>
                        <p className="text-anime-accent text-sm font-medium tracking-wider uppercase">
                            {item.subtitle}
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-col gap-6"
                    >
                        {renderDetails()}

                        {onAdd && (
                            <button
                                onClick={() => onAdd(item)}
                                className="w-full mt-2 bg-red-600 text-black px-6 py-4 font-black uppercase tracking-widest text-lg md:text-xl border-2 border-black hover:bg-white hover:text-red-600 hover:border-red-600 transition-all shadow-[6px_6px_0_#fff] transform -skew-x-2"
                            >
                                + Adicionar à Minha Coleção
                            </button>
                        )}
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}
