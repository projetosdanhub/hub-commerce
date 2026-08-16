import React, { useState } from 'react';
import { Star, Search, CheckCircle, XCircle, Trash2, Filter } from 'lucide-react';

const mockAvaliacoes = [
  { id: 1, cliente: 'João Silva', produto: 'Tênis Esportivo Pro', nota: 5, comentario: 'Excelente produto, muito confortável!', status: 'aprovado', data: '12/08/2026' },
  { id: 2, cliente: 'Maria Oliveira', produto: 'Camiseta Básica Algodão', nota: 3, comentario: 'A cor é um pouco diferente da foto.', status: 'pendente', data: '11/08/2026' },
  { id: 3, cliente: 'Carlos Santos', produto: 'Smartwatch Series 5', nota: 1, comentario: 'Veio com defeito na tela.', status: 'rejeitado', data: '10/08/2026' },
  { id: 4, cliente: 'Ana Costa', produto: 'Mochila Notebook', nota: 4, comentario: 'Muito boa, mas demorou a chegar.', status: 'pendente', data: '09/08/2026' },
];

const AdminAvaliacoes = () => {
  const [avaliacoes, setAvaliacoes] = useState(mockAvaliacoes);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');

  // Funcionalidades de Ação
  const handleAprovar = (id) => {
    setAvaliacoes(avaliacoes.map(av => av.id === id ? { ...av, status: 'aprovado' } : av));
  };

  const handleRejeitar = (id) => {
    setAvaliacoes(avaliacoes.map(av => av.id === id ? { ...av, status: 'rejeitado' } : av));
  };

  const handleExcluir = (id) => {
    setAvaliacoes(avaliacoes.filter(av => av.id !== id));
  };

  // Renderização das Estrelas
  const renderEstrelas = (nota) => {
    return (
      <div className="flex text-yellow-400">
        {[...Array(5)].map((_, index) => (
          <Star key={index} size={16} fill={index < nota ? 'currentColor' : 'none'} className={index >= nota ? 'text-gray-300' : ''} />
        ))}
      </div>
    );
  };

  // Filtragem
  const avaliacoesFiltradas = avaliacoes.filter(av => {
    const matchBusca = av.produto.toLowerCase().includes(busca.toLowerCase()) || av.cliente.toLowerCase().includes(busca.toLowerCase());
    const matchStatus = filtroStatus === 'todos' || av.status === filtroStatus;
    return matchBusca && matchStatus;
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Gestão de Avaliações</h1>
            <p className="text-sm text-gray-500 mt-1">Gerencie os comentários e notas dos clientes sobre os produtos.</p>
          </div>
        </div>

        {/* Barra de Ferramentas (Busca e Filtros) */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por cliente ou produto..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="text-gray-400" size={20} />
            <select
              className="border border-gray-200 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
            >
              <option value="todos">Todos os Status</option>
              <option value="pendente">Pendentes</option>
              <option value="aprovado">Aprovados</option>
              <option value="rejeitado">Rejeitados</option>
            </select>
          </div>
        </div>

        {/* Tabela de Avaliações */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente / Produto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avaliação</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comentário</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {avaliacoesFiltradas.length > 0 ? (
                  avaliacoesFiltradas.map((av) => (
                    <tr key={av.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{av.cliente}</div>
                        <div className="text-sm text-gray-500">{av.produto}</div>
                        <div className="text-xs text-gray-400 mt-1">{av.data}</div>
                      </td>
                      <td className="px-6 py-4">
                        {renderEstrelas(av.nota)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-700 max-w-xs truncate" title={av.comentario}>
                          {av.comentario}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${av.status === 'aprovado' ? 'bg-green-100 text-green-800' : 
                            av.status === 'rejeitado' ? 'bg-red-100 text-red-800' : 
                            'bg-yellow-100 text-yellow-800'}`}>
                          {av.status.charAt(0).toUpperCase() + av.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          {av.status !== 'aprovado' && (
                            <button onClick={() => handleAprovar(av.id)} className="text-green-600 hover:text-green-900 bg-green-50 p-2 rounded-md transition-colors" title="Aprovar">
                              <CheckCircle size={18} />
                            </button>
                          )}
                          {av.status !== 'rejeitado' && (
                            <button onClick={() => handleRejeitar(av.id)} className="text-yellow-600 hover:text-yellow-900 bg-yellow-50 p-2 rounded-md transition-colors" title="Rejeitar">
                              <XCircle size={18} />
                            </button>
                          )}
                          <button onClick={() => handleExcluir(av.id)} className="text-red-600 hover:text-red-900 bg-red-50 p-2 rounded-md transition-colors" title="Excluir">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      Nenhuma avaliação encontrada com os filtros atuais.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminAvaliacoes;