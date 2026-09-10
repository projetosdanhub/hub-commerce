import React from 'react';
import { Truck } from 'lucide-react';
import { Button } from '../../../DesignSystem/primitives/Button';
import { ProviderOAuthPanel } from '../../../Settings/ProviderOAuthPanel';

export default function MelhorEnvioTab({
    isAuthenticatedME,
    handleDesconectarME,
    isDisconnecting,
    meCarriersAtivas,
    toggleMeCarrier,
    isLoading,
    environment,
    onEnvironmentChange,
    isSaving,
    error,
}) {
    return (
        <section className="hub-settings-form hub-surface" aria-busy={isLoading || isSaving}>
            <header><Truck aria-hidden="true" /><div><h2>Melhor Envio</h2><p>Configure a conexão e os serviços oferecidos pela loja.</p></div></header>
            <div className="hub-settings-fields">
                <label>Ambiente usado pela loja
                    <select value={environment} onChange={(event) => onEnvironmentChange(event.target.value)} disabled={isSaving || isLoading}>
                        <option value="SANDBOX">Sandbox</option>
                        <option value="PRODUCTION">Produção</option>
                    </select>
                    <small>A troca invalida as cotações anteriores. Autorize a conta no ambiente escolhido.</small>
                </label>
            </div>
            {error ? <p className="hub-settings-notice hub-settings-notice-error" role="alert">{error}</p> : null}
            {isLoading ? <p role="status">Carregando conexão e serviços…</p> : !isAuthenticatedME ? (
                <ProviderOAuthPanel key={environment} provider="melhor_envio" name="Melhor Envio" fallbackIcon={Truck} defaultEnvironment={environment} description="Autorize sua conta para habilitar o frete neste ambiente." />
            ) : (
                <>
                    <h3>Serviços disponíveis</h3>
                    <p>Ative os serviços que a loja poderá oferecer no checkout.</p>
                    {!meCarriersAtivas.length ? <p role="status">Nenhum serviço disponível. Verifique a conexão e atualize a página.</p> : null}
                    <div className="hub-settings-fields">
                        {meCarriersAtivas.map((service) => (
                            <label key={service.id}>
                                <input type="checkbox" checked={service.ativo} onChange={() => toggleMeCarrier(service.id)} disabled={isSaving} />
                                {service.nome}
                            </label>
                        ))}
                    </div>
                    <footer className="hub-settings-form-footer">
                        <Button variant="danger" onClick={handleDesconectarME} loading={isDisconnecting}>Desconectar</Button>
                    </footer>
                </>
            )}
        </section>
    );
}
