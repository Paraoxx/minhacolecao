import React, { useState, useEffect } from 'react';
import { UserManagement } from './components/UserManagement';
import { BannerManagement } from './components/BannerManagement';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeView, setActiveView] = useState('figures');

  // Form states for adding Figures
  const [manualTitle, setManualTitle] = useState("");
  const [manualSeries, setManualSeries] = useState("");
  const [manualCharacter, setManualCharacter] = useState("");
  const [manualCompany, setManualCompany] = useState("");
  const [manualDimensions, setManualDimensions] = useState("");
  const [manualImage, setManualImage] = useState("");

  // CRUD States
  const [figuresList, setFiguresList] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const fetchFigures = async () => {
    try {
      const response = await fetch("http://localhost:3000/global_figures");
      if (response.ok) {
        const data = await response.json();
        setFiguresList(data);
      }
    } catch (err) {
      console.error("Erro ao carregar figures:", err);
    }
  };

  useEffect(() => {
    if (isAuthenticated && activeView === 'figures') {
      fetchFigures();
    }
  }, [isAuthenticated, activeView]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'admin123') {
      setIsAuthenticated(true);
    } else {
      alert('Senha incorreta!');
    }
  };

  const saveManualItem = async () => {
    if (!manualTitle.trim()) {
      alert("O Título do Produto é obrigatório!");
      return;
    }

    const imagesArray = manualImage.split(',').map(img => img.trim()).filter(img => img);

    const itemData = {
      title: manualTitle,
      series: manualSeries || "N/A",
      character: manualCharacter || "N/A",
      company: manualCompany || "Desconhecido",
      dimensions: manualDimensions || "N/A",
      images: imagesArray.length > 0 ? imagesArray : ["https://images.unsplash.com/photo-1608514660098-98e3b08e50bc?q=80&w=800&auto=format&fit=crop"],
      category: "Figures",
      details: {
        fabricante: manualCompany || "Desconhecido",
        escala: manualDimensions || "N/A",
        serie: manualSeries || "N/A"
      }
    };

    try {
      const isEditing = !!editingId;
      const url = isEditing
        ? `http://localhost:3000/global_figures/${editingId}`
        : "http://localhost:3000/global_figures";

      if (!isEditing) {
        itemData.id = Date.now().toString();
      }

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(itemData),
      });

      if (!response.ok) {
        throw new Error(`O servidor recusou (Status ${response.status}).`);
      }

      alert(isEditing ? "🔥 Figure atualizada com sucesso!" : "🔥 Figure adicionada com sucesso!");

      handleCancelEdit(); // Clears form and editingId
      fetchFigures(); // Resync list

    } catch (error) {
      console.error("Erro fatal ao salvar:", error);
      alert(`❌ Erro ao conectar com o banco de dados!\nDetalhes: ${error.message}`);
    }
  };

  const handleEdit = (figure) => {
    setEditingId(figure.id);
    setManualTitle(figure.title || "");
    setManualSeries(figure.series || "");
    setManualCharacter(figure.character || "");
    setManualCompany(figure.company || "");
    setManualDimensions(figure.dimensions || "");
    setManualImage(figure.images ? figure.images.join(', ') : (figure.image || ""));
    // scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setManualTitle("");
    setManualSeries("");
    setManualCharacter("");
    setManualCompany("");
    setManualDimensions("");
    setManualImage("");
  };

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir permanentemente esta figure do catálogo global?")) {
      try {
        const response = await fetch(`http://localhost:3000/global_figures/${id}`, {
          method: "DELETE"
        });
        if (response.ok) {
          fetchFigures(); // refresh
        } else {
          alert("Erro ao excluir figure.");
        }
      } catch (err) {
        alert("Erro de conexão ao tentar excluir.");
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-anime-bg flex justify-center items-center p-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-red-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />

        <div className="w-full max-w-md bg-black border-2 border-red-600 shadow-[8px_8px_0_#dc2626] p-8 relative z-10 transform -skew-x-2">
          <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter text-center mb-8">
            Painel Admin
          </h1>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha de Acesso"
              className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 focus:outline-none focus:border-red-600 focus:shadow-[4px_4px_0_#dc2626] transition-all text-center tracking-widest"
              autoFocus
            />

            <button
              type="submit"
              className="w-full bg-red-600 text-black hover:bg-white hover:text-red-600 px-6 py-4 font-black uppercase tracking-widest text-lg border-2 border-black transition-all shadow-[4px_4px_0_#fff]"
            >
              ENTRAR
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-anime-bg p-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-red-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10 mt-12 bg-black border-2 border-red-600 p-8 shadow-[8px_8px_0_#dc2626] transform -skew-x-2">
        <div className="flex justify-between items-end border-b-2 border-white/20 pb-4 mb-8">
          <div>
            <h1 className="text-4xl font-black italic text-white uppercase tracking-tighter">Catálogo Global</h1>
            <p className="text-red-500 font-bold tracking-widest uppercase text-sm mt-1">Modo de Administração</p>
          </div>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="text-gray-400 hover:text-white font-bold text-sm uppercase tracking-widest transition-colors"
          >
            Sair
          </button>
        </div>

        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveView('figures')}
            className={`flex-1 py-3 font-black uppercase tracking-widest text-sm transition-all border-2 ${activeView === 'figures'
              ? 'bg-red-600 text-white border-red-600 shadow-[4px_4px_0_#fff]'
              : 'bg-black text-gray-400 border-slate-700 hover:border-red-400'
              }`}
          >
            GERENCIAR FIGURES
          </button>
          <button
            onClick={() => setActiveView('users')}
            className={`flex-1 py-3 font-black uppercase tracking-widest text-sm transition-all border-2 ${activeView === 'users'
              ? 'bg-red-600 text-white border-red-600 shadow-[4px_4px_0_#fff]'
              : 'bg-black text-gray-400 border-slate-700 hover:border-red-400'
              }`}
          >
            GERENCIAR USUÁRIOS
          </button>
          <button
            onClick={() => setActiveView('banners')}
            className={`flex-1 py-3 font-black uppercase tracking-widest text-sm transition-all border-2 ${activeView === 'banners'
              ? 'bg-red-600 text-white border-red-600 shadow-[4px_4px_0_#fff]'
              : 'bg-black text-gray-400 border-slate-700 hover:border-red-400'
              }`}
          >
            GERENCIAR BANNERS
          </button>
        </div>

        {activeView === 'figures' ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Título do Produto (Obrigatório)</label>
                <input
                  type="text"
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-white px-4 py-3 focus:outline-none focus:border-red-600 focus:shadow-[4px_4px_0_#dc2626] transition-all"
                  placeholder="Ex: Asuka Langley - 1/7 - Ver. Radio Eva"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Nome da Obra/Série</label>
                <input
                  type="text"
                  value={manualSeries}
                  onChange={(e) => setManualSeries(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-white px-4 py-3 focus:outline-none focus:border-red-600 focus:shadow-[4px_4px_0_#dc2626] transition-all"
                  placeholder="Ex: Neon Genesis Evangelion"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Nome do Personagem</label>
                <input
                  type="text"
                  value={manualCharacter}
                  onChange={(e) => setManualCharacter(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-white px-4 py-3 focus:outline-none focus:border-red-600 focus:shadow-[4px_4px_0_#dc2626] transition-all"
                  placeholder="Ex: Asuka Langley Soryu"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Fabricante (Empresa)</label>
                <input
                  type="text"
                  value={manualCompany}
                  onChange={(e) => setManualCompany(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-white px-4 py-3 focus:outline-none focus:border-red-600 focus:shadow-[4px_4px_0_#dc2626] transition-all"
                  placeholder="Ex: Alter / Hobby Max"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Dimensões / Escala</label>
                <input
                  type="text"
                  value={manualDimensions}
                  onChange={(e) => setManualDimensions(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-white px-4 py-3 focus:outline-none focus:border-red-600 focus:shadow-[4px_4px_0_#dc2626] transition-all"
                  placeholder="Ex: 1/7 Scale, 15cm"
                />
              </div>

              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">URLs das Imagens (separe por vírgula)</label>
                <input
                  type="text"
                  value={manualImage}
                  onChange={(e) => setManualImage(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-white px-4 py-3 focus:outline-none focus:border-red-600 focus:shadow-[4px_4px_0_#dc2626] transition-all"
                  placeholder="https://sua-imagem.com/foto.jpg, https://sua-imagem.com/foto2.jpg"
                />
              </div>

              <div className="md:col-span-2 flex flex-col md:flex-row gap-4 mt-4">
                {editingId && (
                  <button
                    onClick={handleCancelEdit}
                    className="w-full bg-slate-800 text-white px-6 py-4 font-black uppercase tracking-widest text-lg border-2 border-slate-600 hover:bg-slate-700 transition-all"
                  >
                    CANCELAR
                  </button>
                )}
                <button
                  onClick={saveManualItem}
                  className="w-full bg-red-600 text-black px-6 py-4 font-black uppercase tracking-widest text-lg border-2 border-black hover:bg-white hover:text-red-600 transition-all shadow-[6px_6px_0_#fff]"
                >
                  {editingId ? "SALVAR ALTERAÇÕES" : "Subir Figure Para o Catálogo"}
                </button>
              </div>
            </div>

            <div className="mt-16 w-full">
              <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-6 border-b-2 border-red-600/50 pb-2">Catálogo Atual ({figuresList.length})</h2>
              <div className="space-y-4">
                {figuresList.map(figure => (
                  <div key={figure.id} className="bg-slate-900 border border-slate-700 p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-red-600/50 transition-colors">
                    <div className="flex items-center gap-4 flex-1">
                      <img
                        src={figure.images && figure.images.length > 0 ? figure.images[0] : (figure.image || figure.imageUrl)}
                        alt={figure.title}
                        className="w-16 h-16 object-cover bg-black"
                      />
                      <div className="flex flex-col">
                        <span className="text-white font-bold text-sm line-clamp-2 md:line-clamp-1">{figure.title}</span>
                        <span className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">{figure.series}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto shrink-0 mt-4 md:mt-0">
                      <button
                        onClick={() => handleEdit(figure)}
                        className="flex-1 md:flex-none bg-slate-800 text-blue-400 hover:bg-blue-900 hover:text-white px-4 py-2 font-bold uppercase tracking-widest text-xs border border-slate-600 hover:border-blue-500 transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(figure.id)}
                        className="flex-1 md:flex-none bg-red-900/50 text-red-400 hover:bg-red-600 hover:text-white px-4 py-2 font-bold uppercase tracking-widest text-xs border border-red-900 hover:border-red-600 transition-colors"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : activeView === 'users' ? (
          <UserManagement />
        ) : (
          <BannerManagement />
        )}
      </div>
    </div >
  );
}

export default App;
