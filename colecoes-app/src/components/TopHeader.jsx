import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Search, Library, Settings, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function TopHeader() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navLinks = [
        { name: "Explore", path: "/", icon: <Search size={18} /> },
        { name: "My Collections", path: "/collections", icon: <Library size={18} /> },
        { name: "Settings", path: "/settings", icon: <Settings size={18} /> },
    ];

    return (
        <header className="w-full bg-black border-b-4 border-red-600 shadow-[0_4px_0_#fff] relative z-50">
            <div className="max-w-[1920px] mx-auto flex items-center justify-between px-4 md:px-8 py-3">
                {/* Logo Area */}
                <div className="flex items-center gap-4">
                    <div className="flex flex-col transform -skew-x-12 cursor-pointer">
                        <h1 className="text-lg md:text-xl font-extrabold tracking-tighter uppercase relative z-10 flex items-center gap-2">
                            <span
                                className="bg-red-600 text-white px-3 py-1 transform -rotate-2 shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                                style={{ clipPath: 'polygon(0 0, 100% 5%, 95% 100%, 5% 95%)' }}
                            >
                                MINHA
                            </span>
                            <span
                                className="bg-white text-black px-3 py-1 transform rotate-1 shadow-[2px_2px_0px_#dc2626]"
                                style={{ clipPath: 'polygon(5% 0, 100% 0, 95% 100%, 0 100%)' }}
                            >
                                COLEÇÃO
                            </span>
                        </h1>
                        <p className="text-[8px] md:text-[10px] tracking-[0.3em] text-white bg-black px-2 mt-1 uppercase font-black w-max ml-8 shadow-[1px_1px_0_#dc2626] transform rotate-1">
                            Phantom Thieves
                        </p>
                    </div>

                    {/* Optional small decorative element next to logo instead of large chibis */}
                    <div className="hidden lg:block ml-4 opacity-80 mix-blend-screen">
                        <img src="/src/assets/chibis-ink.png" alt="Decoration" className="h-10 object-contain drop-shadow-[1px_1px_0_#dc2626]" />
                    </div>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-2">
                    {navLinks.map((link) => (
                        <NavLink
                            key={link.name}
                            to={link.path}
                            className={({ isActive }) => `
                                flex items-center gap-2 px-5 py-2 font-black uppercase tracking-widest text-sm transition-all duration-300 transform -skew-x-6 border-2
                                ${isActive
                                    ? "bg-red-600 text-black border-black shadow-[3px_3px_0_#fff]"
                                    : "bg-black text-white border-transparent hover:border-red-600 hover:text-red-500 hover:shadow-[3px_3px_0_#dc2626]"
                                }
                            `}
                        >
                            {link.icon}
                            <span>{link.name}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* Mobile Menu Toggle */}
                <div className="md:hidden flex items-center">
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 bg-red-600 text-black border-2 border-black shadow-[2px_2px_0_#fff] transform -skew-x-6 active:scale-95 transition-transform"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} strokeWidth={3} />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Dropdown */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="md:hidden absolute top-full left-0 w-full bg-black border-b-4 border-red-600 shadow-[0_4px_0_#fff] p-4 flex flex-col gap-3"
                    >
                        {navLinks.map((link) => (
                            <NavLink
                                key={link.name}
                                to={link.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={({ isActive }) => `
                                    flex items-center gap-3 px-4 py-3 font-black uppercase tracking-widest text-sm border-2 transform -skew-x-3
                                    ${isActive
                                        ? "bg-red-600 text-black border-black shadow-[2px_2px_0_#fff]"
                                        : "bg-black text-white border-slate-800 hover:border-red-600"
                                    }
                                `}
                            >
                                {link.icon}
                                <span>{link.name}</span>
                            </NavLink>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
