export const dicMelhorEnvio = [
    { id: '1', key: 'Correios PAC', logo: 'https://logospng.org/download/correios/logo-correios-2048.png', color: 'from-yellow-400 to-yellow-500' },
    { id: '2', key: 'Correios SEDEX', logo: 'https://logospng.org/download/correios/logo-correios-2048.png', color: 'from-blue-500 to-blue-600' },
    { id: '3', key: 'Jadlog', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/25/Jadlog_logo.png', color: 'from-red-600 to-red-700' },
    { id: '4', key: 'Loggi', logo: 'https://logospng.org/download/loggi/logo-loggi-2048.png', color: 'from-sky-400 to-sky-500' },
    { id: '5', key: 'Azul Cargo', logo: 'https://www.azulcargoexpress.com.br/images/logo.png', color: 'from-indigo-600 to-indigo-800' },
    { id: '6', key: 'LATAM Cargo', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/05/LATAM_Cargo_logo.svg', color: 'from-red-700 to-red-900' }
];


export const safeNum = (val) => isNaN(Number(val)) ? 0 : Number(val);
export const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(safeNum(val));
export const formatSmartCurrency = (value) => {
    const num = safeNum(value);
    if (num >= 1000000000) return `R$ ${(num / 1000000000).toFixed(2).replace('.', ',')}B`;
    if (num >= 1000000) return `R$ ${(num / 1000000).toFixed(2).replace('.', ',')}M`;
    if (num >= 1000) return `R$ ${(num / 1000).toFixed(1).replace('.', ',')}k`;
    return `R$ ${num.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
};

// 🟢 CORREÇÃO DA DATA: Garante que "T" seja isolado e monta no padrão de Brasília
export const formatDateBR = (dateStr) => {
    if (!dateStr || dateStr === '-') return '-';
    try {
        const rawDate = String(dateStr).split('T')[0]; 
        const parts = rawDate.split('-');
        if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
        return String(dateStr);
    } catch (e) { return '-'; }
};

export const formatDateTimeBR = (dateStr) => {
    if (!dateStr || dateStr === '-') return '-';
    try {
        const partesIso = String(dateStr).split('T');
        if (partesIso.length === 2) {
            const dParts = partesIso[0].split('-');
            const tParts = partesIso[1].split(':');
            if (dParts.length === 3 && tParts.length >= 2) {
                return `${dParts[2]}/${dParts[1]}/${dParts[0]} às ${tParts[0]}:${tParts[1]}`;
            }
        }
        const d = new Date(dateStr);
        if (!isNaN(d.getTime())) return d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
        return String(dateStr);
    } catch (e) { return '-'; }
};

export const parseCoupons = (coupons) => {
    if (!coupons) return [];
    return typeof coupons === 'string' ? JSON.parse(coupons) : coupons;
};

// 🟢 FUNÇÃO ANTI-FRAUDE E SILOING (Cálculo em Cascata)
export const calcularDescontosReais = (subtotal, frete, cuponsBrutos) => {
    let saldoLoja = safeNum(subtotal);
    let saldoFrete = safeNum(frete);
    const aplicados = [];

    const cupons = parseCoupons(cuponsBrutos || []);

    const cLoja = cupons.filter(c => String(c.tipo).toUpperCase() === 'LOJA');
    const cVipLoja = cupons.filter(c => String(c.tipo).toUpperCase().includes('LOJA VIP') || (String(c.tipo).toUpperCase().includes('VIP') && !String(c.tipo).toUpperCase().includes('FRETE')));
    const cFrete = cupons.filter(c => String(c.tipo).toUpperCase() === 'FRETE');
    const cVipFrete = cupons.filter(c => String(c.tipo).toUpperCase().includes('FRETE VIP') || (String(c.tipo).toUpperCase().includes('VIP') && String(c.tipo).toUpperCase().includes('FRETE')));

    const processar = (lista, isFrete) => {
        lista.forEach(c => {
            const valNominal = safeNum(c.valor || c.desconto);
            let valReal = 0;
            if (isFrete) {
                valReal = Math.min(valNominal, saldoFrete);
                saldoFrete -= valReal;
            } else {
                valReal = Math.min(valNominal, saldoLoja);
                saldoLoja -= valReal;
            }
            if (valReal > 0) aplicados.push({ ...c, valorAplicado: valReal });
        });
    };

    processar(cLoja, false);
    processar(cVipLoja, false);
    processar(cFrete, true);
    processar(cVipFrete, true);

    return { cuponsReais: aplicados, liquidoRecebido: saldoLoja + saldoFrete };
};

export const getCarrierLogo = (carrierName) => {
    const name = String(carrierName || '').toLowerCase();
    if (name.includes('correios') || name.includes('sedex') || name.includes('pac')) return 'https://logospng.org/download/correios/logo-correios-2048.png';
    if (name.includes('melhor') || name.includes('me')) return 'https://melhorenvio.com.br/images/logo-melhor-envio-azul.svg';
    if (name.includes('jadlog')) return 'https://upload.wikimedia.org/wikipedia/commons/2/25/Jadlog_logo.png';
    if (name.includes('loggi')) return 'https://logospng.org/download/loggi/logo-loggi-2048.png';
    if (name.includes('azul')) return 'https://www.azulcargoexpress.com.br/images/logo.png';
    if (name.includes('latam')) return 'https://upload.wikimedia.org/wikipedia/commons/0/05/LATAM_Cargo_logo.svg';
    return null;
}
export const getLogInfo = (log) => {
    let tipo = 'info';
    let titulo = 'Atualização de Pedido';
    const ev = String(log.evento || log.desc).toLowerCase();
    if (ev.includes('pago') || ev.includes('aprovado') || ev.includes('entregue')) { tipo = 'success'; }
    else if (ev.includes('cancelado') || ev.includes('reembolso') || ev.includes('estorno')) { tipo = 'danger'; }
    else if (ev.includes('despachado') || ev.includes('separação') || ev.includes('separado') || ev.includes('transportadora') || ev.includes('melhor envio')) { tipo = 'warning'; } 
    return { tipo, titulo };
}

// 🟢 INTELIGÊNCIA: Deduzir a transportadora do Melhor Envio pelo histórico
export const deduceCarrier = (pedido) => {
    // Se a transportadora foi definida manualmente no banco
    if (pedido.carrier && pedido.carrier !== 'Aguardando Despacho') return pedido.carrier;
    
    // Se o rastreio foi apagado (Cancelado), não temos transportadora ativa!
    if (!pedido.tracking_code && !pedido.carrier) return null;

    // Se tem rastreio, procura qual foi o serviço do Melhor Envio usado na Timeline
    const logME = pedido.timeline?.slice().reverse().find(l => String(l.evento || l.desc).includes('Melhor Envio (Serviço:'));
    if (logME) {
        const match = String(logME.evento || logME.desc).match(/Serviço: (\d+)/);
        if (match) {
            const meId = match[1];
            const found = dicMelhorEnvio.find(m => String(m.id) === meId);
            return found ? found.key : 'Melhor Envio';
        }
        return 'Melhor Envio';
    }
    return 'Logística Padrão';
};

