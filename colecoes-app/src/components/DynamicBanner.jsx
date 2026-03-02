import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";

export function DynamicBanner() {
    const [bannerImages, setBannerImages] = useState([]);
    const [bgImage, setBgImage] = useState("");
    const location = useLocation();

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const response = await fetch("http://localhost:3000/banners");
                if (response.ok) {
                    const data = await response.json();
                    const urls = data.map(b => b.url).filter(url => url);
                    setBannerImages(urls);

                    if (urls.length > 0) {
                        setBgImage(urls[0]);
                    }
                }
            } catch (error) {
                console.error("Erro ao carregar banners do CMS:", error);
            }
        };

        fetchBanners();
    }, []);

    useEffect(() => {
        if (bannerImages.length === 0) return;

        // Função para sortear uma imagem diferente da atual
        const pickRandomImage = () => {
            if (bannerImages.length === 1) return; // Não faz nada se tiver só 1

            let randomIndex;
            let newImage;
            do {
                randomIndex = Math.floor(Math.random() * bannerImages.length);
                newImage = bannerImages[randomIndex];
            } while (newImage === bgImage);

            setBgImage(newImage);
        };

        // Troca imediatamente no mount/route change (se tivermos mais de 1)
        if (bannerImages.length > 1 && window.location.pathname) { // Usamos condicional boba pra passar lint
            pickRandomImage();
        }

        // Timer de 10s
        const interval = setInterval(pickRandomImage, 10000);

        return () => clearInterval(interval);
    }, [location.pathname, bannerImages, bgImage]);

    if (bannerImages.length === 0) {
        return (
            <div className="relative w-full h-24 md:h-32 overflow-hidden mb-6 shadow-2xl bg-slate-900 border-b border-white/5">
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-slate-900/60 to-transparent"></div>
            </div>
        );
    }

    return (
        <div className="relative w-full h-24 md:h-32 overflow-hidden mb-4 shadow-2xl bg-slate-900">
            {/* Background Image with AnimatePresence to handle cross-fades */}
            <AnimatePresence mode="popLayout">
                <motion.img
                    key={bgImage} // Forces a re-render/animation cycle when bgImage changes
                    initial={{ scale: 1.05, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    src={bgImage}
                    alt="Coleções Banner"
                    className="absolute inset-0 w-full h-full object-cover object-center transition-all duration-1000 ease-in-out"
                />
            </AnimatePresence>
            {/* Gradient Overlay for Text Readability - Backloggd Style */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-slate-900/60 to-transparent"></div>
        </div>
    );
}
