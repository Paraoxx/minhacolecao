export function Footer() {
    return (
        <footer className="w-full mt-12 mb-8 flex justify-center z-10 relative">
            <div
                className="bg-black text-white p-4 md:p-6 border-l-8 border-red-600 shadow-[4px_4px_0_#fff] transform rotate-1 transition-transform hover:rotate-0 max-w-2xl w-full mx-4"
                style={{ clipPath: 'polygon(0 0, 100% 0, 98% 100%, 0% 100%)' }}
            >
                <div className="flex flex-col items-center text-center gap-2">
                    <p className="text-xs md:text-sm font-bold leading-relaxed italic tracking-wide">
                        "Esse é um site particular voltado para catalogação pessoal de itens redpill que eu tenho, se voce nao souber quebrar a pedra grande, peço para que se retire dele."
                    </p>
                    <div className="h-1 w-16 bg-red-600 mt-2 shadow-[1px_1px_0_#fff]" />
                </div>
            </div>
        </footer>
    );
}
