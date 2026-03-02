import React, { useState } from 'react';

export function SendNotification() {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !message.trim()) {
            alert('Preencha o título e a mensagem.');
            return;
        }

        setIsSubmitting(true);

        const notificationData = {
            title: title.trim(),
            message: message.trim(),
            date: new Date().toISOString(),
            read: false
        };

        try {
            const response = await fetch('http://localhost:3000/notifications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(notificationData),
            });

            if (!response.ok) {
                throw new Error('Falha ao enviar notificação.');
            }

            alert('Notificação enviada com sucesso!');
            setTitle('');
            setMessage('');
        } catch (error) {
            console.error('Erro ao enviar notificação:', error);
            alert('Erro ao enviar notificação.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-slate-900 border border-slate-700 p-8 transform -skew-x-2 shadow-[8px_8px_0_#dc2626] relative mt-8">
            <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter mb-6 border-b-2 border-red-600/50 pb-2">
                Enviar Notificação Global
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold uppercase tracking-widest text-gray-400">
                        Título da Notificação
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="bg-black/50 border-2 border-white/20 text-white px-4 py-3 font-medium focus:outline-none focus:border-red-600 focus:shadow-[4px_4px_0_#dc2626] transition-all transform skew-x-2"
                        placeholder="Ex: Atualização do Sistema"
                        required
                        maxLength={60}
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold uppercase tracking-widest text-gray-400">
                        Mensagem
                    </label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="bg-black/50 border-2 border-white/20 text-white px-4 py-3 font-medium focus:outline-none focus:border-red-600 focus:shadow-[4px_4px_0_#dc2626] transition-all transform skew-x-2 min-h-[120px] resize-y"
                        placeholder="Digite o conteúdo da notificação para todos os usuários..."
                        required
                        maxLength={250}
                    />
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-4 px-8 py-4 bg-red-600 text-black font-black uppercase tracking-widest text-lg border-2 border-black hover:bg-white hover:border-red-600 hover:text-red-600 transition-all shadow-[6px_6px_0_#fff] transform skew-x-2 active:scale-95 disabled:opacity-50"
                >
                    {isSubmitting ? 'Enviando...' : 'Disparar Notificação'}
                </button>
            </form>
        </div>
    );
}
