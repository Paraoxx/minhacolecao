import { Outlet } from "react-router-dom"
import { motion } from "framer-motion"
import { Footer } from "./Footer"
import { DynamicBanner } from "./DynamicBanner"

export function AppLayout() {
    return (
        <div className="flex flex-col min-h-screen font-sans overflow-x-hidden w-full">
            <DynamicBanner />
            {/* Main Content Area */}
            <main className="flex-1 relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* subtle background decoration */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-anime-accent/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />

                <div className="w-full py-8 relative z-0">
                    <Outlet />
                </div>
            </main>

            <Footer />
        </div>
    )
}
