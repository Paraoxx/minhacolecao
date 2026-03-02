import React, { useState, useEffect } from 'react';

export function UserManagement() {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const response = await fetch("http://localhost:3000/users");
            if (!response.ok) throw new Error("Erro ao carregar usuários.");
            const data = await response.json();
            setUsers(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
            try {
                const response = await fetch(`http://localhost:3000/users/${id}`, {
                    method: 'DELETE'
                });
                if (response.ok) {
                    setUsers(users.filter(user => user.id !== id));
                } else {
                    alert('Erro ao excluir usuário.');
                }
            } catch (err) {
                alert('Erro de conexão ao tentar excluir.');
            }
        }
    };

    const handleChangePassword = async (id) => {
        const novaSenha = window.prompt('Digite a nova senha para o usuário:');
        if (novaSenha) {
            try {
                const response = await fetch(`http://localhost:3000/users/${id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ senha: novaSenha })
                });
                if (response.ok) {
                    alert('Senha alterada com sucesso!');
                } else {
                    alert('Erro ao alterar senha.');
                }
            } catch (err) {
                alert('Erro de conexão ao tentar alterar senha.');
            }
        }
    };

    if (isLoading) return <p className="text-white text-center italic mt-8 animate-pulse">Carregando usuários...</p>;
    if (error) return <p className="text-red-500 text-center font-bold mt-8">{error}</p>;

    return (
        <div className="w-full">
            <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-6 border-b-2 border-red-600/50 pb-2">Usuários Cadastrados</h2>

            {users.length === 0 ? (
                <p className="text-gray-500 text-center font-bold uppercase tracking-widest mt-8">Nenhum usuário encontrado.</p>
            ) : (
                <div className="space-y-4">
                    {users.map(user => (
                        <div key={user.id} className="bg-slate-900 border border-slate-700 p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors hover:border-red-600/50">
                            <div className="flex flex-col">
                                <span className="text-white font-black text-lg uppercase tracking-tight">{user.nickname}</span>
                                <span className="text-gray-400 text-sm font-bold tracking-widest mt-1">ID: {user.id}</span>
                                {user.telefone && <span className="text-gray-500 text-xs mt-1">TEL: {user.telefone}</span>}
                            </div>

                            <div className="flex gap-2 w-full md:w-auto">
                                <button
                                    onClick={() => handleChangePassword(user.id)}
                                    className="flex-1 md:flex-none bg-slate-800 text-gray-300 hover:bg-slate-700 hover:text-white px-4 py-2 font-bold uppercase tracking-widest text-xs border border-slate-600 transition-colors"
                                >
                                    Alterar Senha
                                </button>
                                <button
                                    onClick={() => handleDelete(user.id)}
                                    className="flex-1 md:flex-none bg-red-900/50 text-red-400 hover:bg-red-600 hover:text-white px-4 py-2 font-bold uppercase tracking-widest text-xs border border-red-900 hover:border-red-600 transition-colors"
                                >
                                    Excluir
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
