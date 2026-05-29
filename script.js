/* ============================================================
   KTS Dimensionamento — script.js
   Fluxo: clicar no material → modal abre → preenche → adiciona
   Os trechos ficam visíveis no painel principal
   ============================================================ */

const itemsCatalog = [
    { label: 'Eletroduto 3/4" — Concreto',           type: 'ELETRODUTO_34_CONCRETO' },
    { label: 'Eletroduto 3/4" — Drywall',            type: 'ELETRODUTO_34_DRYWALL' },
    { label: 'Eletroduto 3/4" — Metálica',           type: 'ELETRODUTO_34_METALICA' },
    { label: 'Eletroduto 1" — Concreto',             type: 'ELETRODUTO_1_CONCRETO' },
    { label: 'Eletroduto 1" — Drywall',              type: 'ELETRODUTO_1_DRYWALL' },
    { label: 'Eletroduto 1" — Metálica',             type: 'ELETRODUTO_1_METALICA' },
    { label: 'Eletroduto 2" — Concreto',             type: 'ELETRODUTO_2_CONCRETO' },
    { label: 'Eletroduto 2" — Drywall',              type: 'ELETRODUTO_2_DRYWALL' },
    { label: 'Eletroduto 2" — Metálica',             type: 'ELETRODUTO_2_METALICA' },
    { label: 'Dutos Enterrados (3/4", 1", 2")',      type: 'DUTOS_ENTERRADOS' },
    { label: 'Eletrocalha — Mão Francesa',           type: 'CALHA_MF_CONCRETO' },
    { label: 'Eletrocalha — Suspensa Cabo de Aço',   type: 'CALHA_CABO' },
    { label: 'Eletrocalha — Igrejinha + Barra',      type: 'CALHA_IGREJINHA' },
    { label: 'Eletrocalha — Grampo C',               type: 'CALHA_GRAMPO' },
    { label: 'Perfilado — Mão Francesa',             type: 'PERFILADO_MF_CONCRETO' },
    { label: 'Perfilado — Grampo C + Balancim',      type: 'PERFILADO_GRAMPO' },
    { label: 'Perfilado — Chumbador + Barra',        type: 'PERFILADO_BARRA' }
];

const projectItems = [];
let selectedType = null;
let selectedItemLabel = '';
let feedbackTimer = null;

// ── DOM refs ──────────────────────────────────────────────
const categoryList     = document.getElementById('category-list');
const projectCount     = document.getElementById('project-count');
const openResultsBtn   = document.getElementById('open-results-btn');
const resetProjectBtn  = document.getElementById('reset-project-btn');

const welcomeState     = document.getElementById('welcome-state');
const trechosList      = document.getElementById('trechos-list');
const resultsState     = document.getElementById('results-state');
const resultTableBody  = document.getElementById('result-table-body');
const sendWhatsappBtn = document.getElementById('send-whatsapp-btn');
const backTrechosBtn   = document.getElementById('back-to-trechos-btn');

const modalOverlay     = document.getElementById('modal-overlay');
const modalTitle       = document.getElementById('modal-title');
const infraForm        = document.getElementById('infra-form');
const fieldsContainer  = document.getElementById('fields-container');
const addItemBtn       = document.getElementById('add-item-btn');
const showResultsBtn   = document.getElementById('show-results-btn');
const modalClose       = document.getElementById('modal-close');
const modalFeedback    = document.getElementById('modal-feedback');
const feedbackText     = document.getElementById('feedback-text');

// ── Catalog render ────────────────────────────────────────
function renderCatalog() {
    categoryList.innerHTML = '';
    itemsCatalog.forEach(item => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'category-card';
        btn.dataset.itemType = item.type;
        btn.innerHTML = `<strong>${item.label}</strong>`;
        btn.addEventListener('click', () => openModal(item));
        categoryList.appendChild(btn);
    });
}

// ── Modal ─────────────────────────────────────────────────
function openModal(item) {
    selectedType = item.type;
    selectedItemLabel = item.label;
    modalTitle.textContent = item.label;
    renderFormFields(item.type);
    hideFeedback();
    modalOverlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    // focus first input
    setTimeout(() => {
        const first = fieldsContainer.querySelector('input');
        if (first) first.focus();
    }, 120);
}

function closeModal() {
    modalOverlay.classList.add('hidden');
    document.body.style.overflow = '';
    selectedType = null;
}

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => {
    if (e.target === modalOverlay) closeModal();
});
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
});

// ── Form fields ───────────────────────────────────────────
function renderFormFields(type) {
    fieldsContainer.innerHTML = '';
    getFieldsForType(type).forEach(field => {
        const wrap = document.createElement('div');
        wrap.className = 'field-item';

        const label = document.createElement('label');
        label.textContent = field.label;
        label.htmlFor = field.name;

        const input = document.createElement('input');
        input.type = 'number';
        input.name = field.name;
        input.id   = field.name;
        input.value = field.default;
        input.min  = '0';
        input.step = field.step || '1';

        // select all on focus for quick editing
        input.addEventListener('focus', () => input.select());

        wrap.appendChild(label);
        wrap.appendChild(input);
        fieldsContainer.appendChild(wrap);
    });
}

function getFieldsForType(type) {
    if (type === 'DUTOS_ENTERRADOS') {
        return [
            { name: 'm_34',   label: 'Metros — Duto PEAD 3/4"',          default: '0' },
            { name: 'm_1',    label: 'Metros — Duto PEAD 1"',            default: '0' },
            { name: 'm_2',    label: 'Metros — Duto PEAD 2"',            default: '0' },
            { name: 'caixas', label: 'Caixas de Passagem (Concreto)',     default: '0' }
        ];
    }

    const common = [
        { name: 'metros', label: 'Comprimento (metros)', default: '0' },
        { name: 'curvas', label: 'Curvas 90°',           default: '0' }
    ];

    if (type.includes('CALHA') || type.includes('PERFILADO')) {
        const extra = [
            { name: 'emendas', label: 'Emendas Adicionais', default: '0' },
            { name: 'apoios',  label: 'Apoios Adicionais',  default: '0' }
        ];
        if (type.includes('CABO'))
            extra.push({ name: 'altura', label: 'Altura Suspensão (metros)', default: '4', step: '0.1' });
        if (type.includes('IGREJINHA') || type.includes('BARRA'))
            extra.push({ name: 'altura', label: 'Queda Tirante (metros)', default: '0.5', step: '0.1' });
        return [...common, ...extra];
    }

    return [...common, { name: 'conduletes', label: 'Conduletes Adicionais', default: '0' }];
}

// ── Add trecho ────────────────────────────────────────────
function addItemToProject() {
    const formData = new FormData(infraForm);
    const item = { type: selectedType, label: selectedItemLabel };
    let valid = true;

    for (const [key, value] of formData.entries()) {
        const num = Number(value);
        if (Number.isNaN(num) || num < 0) { valid = false; break; }
        item[key] = num;
    }

    if (!valid) {
        alert('Preencha valores numéricos válidos (≥ 0).');
        return;
    }

    projectItems.push(item);
    infraForm.reset();
    renderFormFields(selectedType);

    showFeedback(`Trecho "${selectedItemLabel}" adicionado! (${projectItems.length} no total)`);
    updateProjectCount();
    renderTrechosList();
}

function showFeedback(msg) {
    feedbackText.textContent = msg;
    modalFeedback.classList.remove('hidden');
    clearTimeout(feedbackTimer);
    feedbackTimer = setTimeout(hideFeedback, 3500);
}

function hideFeedback() {
    modalFeedback.classList.add('hidden');
}

// ── Project count & list ──────────────────────────────────
function updateProjectCount() {
    const n = projectItems.length;
    projectCount.textContent = n === 0 ? 'Nenhum trecho adicionado' : `${n} trecho${n > 1 ? 's' : ''} adicionado${n > 1 ? 's' : ''}`;
    openResultsBtn.disabled = n === 0;
}

function renderTrechosList() {
    // Switch panels
    welcomeState.classList.add('hidden');
    resultsState.classList.add('hidden');
    trechosList.classList.remove('hidden');

    if (projectItems.length === 0) {
        welcomeState.classList.remove('hidden');
        trechosList.classList.add('hidden');
        return;
    }

    // Build header once
    trechosList.innerHTML = `
        <div class="trechos-list-header">
            <h3>Trechos adicionados</h3>
        </div>
    `;

    projectItems.forEach((item, idx) => {
        const card = document.createElement('div');
        card.className = 'trecho-card';

        // Build a short detail string
        const details = buildTrechoDetails(item);

        card.innerHTML = `
            <div class="trecho-card-info">
                <strong>${item.label}</strong>
                <span class="trecho-details">${details}</span>
            </div>
            <button class="trecho-remove" title="Remover trecho" data-idx="${idx}">✕</button>
        `;
        trechosList.appendChild(card);
    });

    // Remove buttons
    trechosList.querySelectorAll('.trecho-remove').forEach(btn => {
        btn.addEventListener('click', () => {
            const i = Number(btn.dataset.idx);
            projectItems.splice(i, 1);
            updateProjectCount();
            renderTrechosList();
            if (resultsState && !resultsState.classList.contains('hidden')) {
                renderResults();
            }
        });
    });
}

function buildTrechoDetails(item) {
    if (item.type === 'DUTOS_ENTERRADOS') {
        const parts = [];
        if (item.m_34) parts.push(`3/4": ${item.m_34}m`);
        if (item.m_1)  parts.push(`1": ${item.m_1}m`);
        if (item.m_2)  parts.push(`2": ${item.m_2}m`);
        if (item.caixas) parts.push(`${item.caixas} cx`);
        return parts.join(' · ') || 'sem valores';
    }
    const parts = [];
    if (item.metros)     parts.push(`${item.metros}m`);
    if (item.curvas)     parts.push(`${item.curvas} curva${item.curvas > 1 ? 's' : ''}`);
    if (item.conduletes) parts.push(`${item.conduletes} condulete${item.conduletes > 1 ? 's' : ''}`);
    if (item.emendas)    parts.push(`${item.emendas} emenda${item.emendas > 1 ? 's' : ''}`);
    if (item.apoios)     parts.push(`${item.apoios} apoio${item.apoios > 1 ? 's' : ''}`);
    if (item.altura)     parts.push(`h=${item.altura}m`);
    return parts.join(' · ') || 'sem valores';
}

// ── Results ───────────────────────────────────────────────
function openResults() {
    if (!projectItems.length) {
        alert('Adicione pelo menos um trecho antes de gerar a lista.');
        return;
    }
    renderResults();
    welcomeState.classList.add('hidden');
    trechosList.classList.add('hidden');
    resultsState.classList.remove('hidden');
    closeModal();
}

function renderResults() {
    const rows = consolidateMaterials();
    resultTableBody.innerHTML = '';
    rows.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${item.name}</td><td>${item.unit}</td><td>${item.quantity}</td>`;
        resultTableBody.appendChild(tr);
    });
}

backTrechosBtn.addEventListener('click', () => {
    resultsState.classList.add('hidden');
    renderTrechosList();
});

// ── Consolidate ───────────────────────────────────────────
function consolidateMaterials() {
    const container = {};

    const add = (name, quantity, type = 'principal', unit = 'PEÇA') => {
        if (quantity <= 0) return;
        if (!container[name]) container[name] = { name, quantity: 0, type, unit };
        container[name].quantity += quantity;
    };

    projectItems.forEach(tr => {
        const tipo = tr.type;

        if (tipo === 'DUTOS_ENTERRADOS') {
            add('DUTO CORRUGADO PEAD 3/4"',               tr.m_34  || 0, 'principal', 'METRO');
            add('DUTO CORRUGADO PEAD 1"',                  tr.m_1   || 0, 'principal', 'METRO');
            add('DUTO CORRUGADO PEAD 2"',                  tr.m_2   || 0, 'principal', 'METRO');
            add('CAIXA DE PASSAGEM CONCRETO 50X50',        tr.caixas || 0);
            add('TAMPA PARA CAIXA DE INSPEÇÃO COM ALÇA',   tr.caixas || 0);
            return;
        }

        const m   = tr.metros || 0;
        const cur = tr.curvas || 0;

        if (tipo.includes('ELETRODUTO')) {
            const pol = tipo.includes('34') ? '3/4"' : tipo.includes('1_') ? '1"' : '2"';
            add(`ELETRODUTO GALVANIZADO LEVE ${pol} (BARRA 3m)`, Math.ceil(m / 3));
            add(`ABRAÇADEIRA ${pol} COM CUNHA`, Math.ceil(m / 1.5));
            add(`CONDULETE MÚLTIPLO X ${pol}`, 2 + (tr.conduletes || 0));
            if (cur > 0) add(`CURVA 90º ELETRODUTO ${pol}`, cur);

            const fix = Math.ceil(m / 1.5) + (2 + (tr.conduletes || 0)) * 2;
            if (tipo.includes('CONCRETO')) {
                add('BUCHA FISCHER SX 8MM',    fix, 'miudeza');
                add('PARAFUSO PHILLIPS PANELA', fix, 'miudeza');
            } else if (tipo.includes('DRYWALL')) {
                add('BUCHA FLY 8MM',            fix, 'miudeza');
                add('PARAFUSO PHILLIPS PANELA', fix, 'miudeza');
            } else if (tipo.includes('METALICA')) {
                add('PARAFUSO AUTOBROCANTE 5/16', fix, 'miudeza');
            }
            return;
        }

        if (tipo.includes('CALHA') || tipo.includes('PERFILADO')) {
            const isCalha  = tipo.includes('CALHA');
            const baseName = isCalha ? 'ELETROCALHA 100X50 (BARRA 3m)' : 'PERFILADO 38X38 (BARRA 6m)';
            const divisor  = isCalha ? 3 : 6;
            const barras   = Math.ceil(m / divisor);
            add(baseName, barras);

            const emendas = barras + (tr.emendas || 0);
            add(isCalha ? 'EMENDA INTERNA U 100X50' : 'EMENDA INTERNA PERFILADO 38X38', emendas);

            const apoios = Math.ceil(m / 1.5) + (tr.apoios || 0);
            let pf_base  = emendas * 8;

            if (tipo.includes('MF')) {
                add('MÃO FRANCESA DE PERFILADO 30 CM', apoios);
                add('BUCHA FISCHER SX 8MM',    apoios * 4, 'miudeza');
                add('PARAFUSO PHILLIPS PANELA', apoios * 4, 'miudeza');
                pf_base += apoios * 2;
            } else if (tipo.includes('CABO')) {
                add('SUPORTE SUSPENSO POR CABO DE AÇO', apoios);
                add('CABO DE AÇO 1/8"', apoios * (tr.altura || 4), 'principal', 'METRO');
                add('PRENSA CABO DE ALUMINIO 1/8"', apoios * 6);
            } else if (tipo.includes('IGREJINHA') || tipo.includes('BARRA')) {
                add(isCalha ? 'SUPORTE BALANÇO (IGREJINHA)' : 'GRAMPO C COM BALANCIM', apoios);
                add('CHUMBADOR CBA 3/8', apoios);
                add('BARRA ROSCADA ZINCADA 3/8 X 3000', (apoios * (tr.altura || 0.5)) / 3);
                add('PORCA SEXTAVADA 3/8',  apoios * 4, 'miudeza');
                add('ARRUELA LISA 3/8',     apoios * 4, 'miudeza');
            } else if (tipo.includes('GRAMPO')) {
                add('GRAMPO C COM BALANCIM', apoios);
            }

            add('PARAFUSO (LENTILHA) 1/4 x 3/4', pf_base, 'miudeza');
            add('PORCA SEXTAVADA 1/4',             pf_base, 'miudeza');
            return;
        }
    });

    return Object.values(container).map(item => ({
        name:     item.name,
        unit:     item.unit,
        quantity: item.type === 'miudeza' ? roundMiudezas(item.quantity) : Math.ceil(item.quantity)
    }));
}

function roundMiudezas(value) {
    if (value === 0) return 0;
    let r = Math.ceil(value * 1.1);
    while (r % 5 !== 0) r++;
    return r;
}

// ── Exports ───────────────────────────────────────────────
function downloadCsv() {
    const rows = consolidateMaterials();
    if (!rows.length) { alert('Gere a lista antes de exportar.'); return; }
    const csv = ['DESCRIÇÃO;UNID;QUANTIDADE FINAL', ...rows.map(r => `${r.name};${r.unit};${r.quantity}`)].join('\n');
    const blob = new Blob(
    ['\uFEFF' + csvContent],
    { type: 'text/csv;charset=utf-8;' }
);git 
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'lista_kts.csv';
    link.click();
}

function downloadPdf() {
    const rows = consolidateMaterials();
    if (!rows.length) { alert('Gere a lista antes de exportar.'); return; }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    doc.setFontSize(14);
    doc.setTextColor('#1e3a5f');
    doc.text('KTS Tecnologia & Inovação — Lista de Materiais', 40, 60);
    doc.setFontSize(10);
    doc.setTextColor('#6b7280');
    doc.text(`Gerado em: ${new Date().toLocaleString()}`, 40, 80);

    let y = 110;
    doc.setFontSize(10);
    doc.setTextColor('#1f2937');
    doc.text('DESCRIÇÃO', 40, y);
    doc.text('UNID',      390, y);
    doc.text('QUANTIDADE', 470, y);
    y += 18;

    rows.forEach(row => {
        if (y > 740) { doc.addPage(); y = 60; }
        doc.text(row.name,         40,  y);
        doc.text(row.unit,         390, y);
        doc.text(String(row.quantity), 470, y);
        y += 18;
    });

    doc.save('lista_kts.pdf');
}

// ── Reset ─────────────────────────────────────────────────
function resetProject() {
    if (!projectItems.length) return;
    if (!confirm('Tem certeza que deseja limpar todos os trechos?')) return;
    projectItems.length = 0;
    updateProjectCount();
    welcomeState.classList.remove('hidden');
    trechosList.classList.add('hidden');
    resultsState.classList.add('hidden');
}

// ── Event listeners ───────────────────────────────────────
addItemBtn.addEventListener('click',    addItemToProject);
showResultsBtn.addEventListener('click', openResults);
openResultsBtn.addEventListener('click', openResults);
resetProjectBtn.addEventListener('click', resetProject);
sendWhatsappBtn.addEventListener('click', sendToWhatsapp);

async function sendToWhatsapp() {

    const rows = consolidateMaterials();

    if (!rows.length) {
        alert('Gere a lista antes de enviar.');
        return;
    }

    const csvContent = [
        'DESCRIÇÃO;UNID;QUANTIDADE FINAL',
        ...rows.map(row =>
            `${row.name};${row.unit};${row.quantity}`
        )
    ].join('\n');

    const blob = new Blob(
        [csvContent],
        { type: 'text/csv;charset=utf-8;' }
    );

    const file = new File(
        [blob],
        `KTS_${Date.now()}.csv`,
        { type: 'text/csv' }
    );

    // Compartilhamento nativo do celular
    if (navigator.canShare && navigator.canShare({ files: [file] })) {

        try {

            await navigator.share({
                title: 'KTS Lista de Materiais',
                text: 'Segue lista de materiais.',
                files: [file]
            });

        } catch (err) {
            console.log(err);
        }

    } else {

        // fallback desktop
        const link = document.createElement('a');

        link.href = URL.createObjectURL(blob);
        link.download = file.name;
        link.click();

        window.open(
            'https://chat.whatsapp.com/JGW6ublGaTUESUa8vMseXO',
            '_blank'
        );
    }
}
sendWhatsappBtn.addEventListener('click', sendToWhatsapp);

// ── Init ──────────────────────────────────────────────────
renderCatalog();
updateProjectCount();