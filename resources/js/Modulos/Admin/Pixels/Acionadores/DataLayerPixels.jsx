// ============================================================================
// FICHEIRO: resources/js/Modulos/Admin/Pixels/Acionadores/DataLayerPixels.jsx
// Orquestrador da aba "Data Layer" — Eventos Nativos + Acionadores + Editor
// ============================================================================
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { tabTransition } from '../Compartilhado/ConstantesPixels';
import EventosNativos from './EventosNativos';
import AcionadoresPersonalizados from './AcionadoresPersonalizados';
import EditorDeRegra from './EditorDeRegra';

const DataLayerPixels = ({
    // View control
    triggerView,
    setTriggerView,
    // Eventos Nativos
    eventosNativos,
    setEventosNativos,
    isAllNativosAtivos,
    onToggleAllNativos,
    // Acionadores Custom
    acionadoresPaginados,
    paginaAtual,
    setPaginaAtual,
    totalPaginas,
    itensPorPagina,
    setItensPorPagina,
    onEditTrigger,
    onDeleteTrigger,
    // Editor de Regra
    triggerForm,
    setTriggerForm,
    onSalvarAcionador,
    // Shared
    isSaving,
    onSaveIntegracoes,
}) => {
    const handleNovaRegra = () => {
        setTriggerForm({
            id: null,
            nome: '',
            evento_selecionado: 'Contact',
            evento_custom: '',
            tipo_gatilho: 'click',
            valor_gatilho: '',
            url_alvo: '*',
            status: true,
            payload: {}
        });
        setTriggerView('FORM');
    };

    return (
        <motion.div {...tabTransition}>
            <AnimatePresence mode="wait">
                {triggerView === 'LIST' ? (
                    <motion.div key="list" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.24 }}>
                        <EventosNativos
                            eventosNativos={eventosNativos}
                            setEventosNativos={setEventosNativos}
                            isSaving={isSaving}
                            onSave={onSaveIntegracoes}
                            isAllNativosAtivos={isAllNativosAtivos}
                            onToggleAll={onToggleAllNativos}
                        />

                        <AcionadoresPersonalizados
                            acionadoresPaginados={acionadoresPaginados}
                            paginaAtual={paginaAtual}
                            setPaginaAtual={setPaginaAtual}
                            totalPaginas={totalPaginas}
                            itensPorPagina={itensPorPagina}
                            setItensPorPagina={setItensPorPagina}
                            onEdit={onEditTrigger}
                            onDelete={onDeleteTrigger}
                            onNovaRegra={handleNovaRegra}
                        />
                    </motion.div>
                ) : (
                    <EditorDeRegra
                        triggerForm={triggerForm}
                        setTriggerForm={setTriggerForm}
                        onSalvar={onSalvarAcionador}
                        onVoltar={() => setTriggerView('LIST')}
                        isSaving={isSaving}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default DataLayerPixels;
