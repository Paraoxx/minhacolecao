import { motion } from "framer-motion"
import { cn } from "../lib/utils"

export function ItemCard({
    item,
    className,
    onClick
}) {
    const { id, title = "Unknown Item", subtitle = "Category", imageUrl = "https://images.unsplash.com/photo-1618336753974-aae8e04506aa?q=80&w=800&auto=format&fit=crop" } = item || {};
    return (
        <motion.div
            layoutId={`card-container-${id}`}
            onClick={onClick}
            className={cn(
                "group relative flex flex-col cursor-pointer overflow-hidden rounded-xl",
                "bg-anime-card backdrop-blur-md border border-anime-border",
                "transition-colors duration-300",
                className
            )}
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
            {/* Glow Effect / Backdrop Element */}
            <div className="absolute inset-0 bg-gradient-to-tr from-anime-accent/0 via-anime-accent/0 to-anime-accent/0 group-hover:from-anime-accent/10 group-hover:to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-xl" />

            {/* Outer subtle glow line on hover */}
            <div className="absolute inset-0 border border-transparent group-hover:border-anime-glow rounded-xl transition-all duration-300 pointer-events-none" />

            {/* Image Section */}
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-black/40">
                <motion.img
                    layoutId={`card-image-${id}`}
                    src={imageUrl}
                    alt={title}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    loading="lazy"
                />

                {/* Overlay Gradient for readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d12] via-transparent to-transparent opacity-80" />
            </div>

            {/* Content Section */}
            <motion.div
                layoutId={`card-content-${id}`}
                className="absolute bottom-0 w-full p-4 flex flex-col gap-1 translate-y-2 group-hover:translate-y-0 transition-transform duration-300"
            >
                <h3 className="font-bold text-lg tracking-wide text-white drop-shadow-md">
                    {title}
                </h3>
                <p className="text-sm text-slate-400 font-medium tracking-wider uppercase text-[10px] letter-spacing-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    {subtitle}
                </p>
            </motion.div>
        </motion.div>
    )
}
