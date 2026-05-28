const itemsCatalog = [
    { label: 'Eletroduto 3/4" - Concreto', type: 'ELETRODUTO_34_CONCRETO' },
    { label: 'Eletroduto 3/4" - Drywall', type: 'ELETRODUTO_34_DRYWALL' },
    { label: 'Eletroduto 3/4" - Metálica', type: 'ELETRODUTO_34_METALICA' },
    { label: 'Eletroduto 1" - Concreto', type: 'ELETRODUTO_1_CONCRETO' },
    { label: 'Eletroduto 1" - Drywall', type: 'ELETRODUTO_1_DRYWALL' },
    { label: 'Eletroduto 1" - Metálica', type: 'ELETRODUTO_1_METALICA' },
    { label: 'Eletroduto 2" - Concreto', type: 'ELETRODUTO_2_CONCRETO' },
    { label: 'Eletroduto 2" - Drywall', type: 'ELETRODUTO_2_DRYWALL' },
    { label: 'Eletroduto 2" - Metálica', type: 'ELETRODUTO_2_METALICA' },
    { label: 'Dutos Enterrados (3/4", 1", 2")', type: 'DUTOS_ENTERRADOS' },
    { label: 'Eletrocalha - Mão Francesa', type: 'CALHA_MF_CONCRETO' },
    { label: 'Eletrocalha - Suspensa Cabo de Aço', type: 'CALHA_CABO' },
    { label: 'Eletrocalha - Igrejinha + Barra', type: 'CALHA_IGREJINHA' },
    { label: 'Eletrocalha - Grampo C', type: 'CALHA_GRAMPO' },
    { label: 'Perfilado - Mão Francesa', type: 'PERFILADO_MF_CONCRETO' },
    { label: 'Perfilado - Grampo C + Balancim', type: 'PERFILADO_GRAMPO' },
    { label: 'Perfilado - Chumbador + Barra', type: 'PERFILADO_BARRA' }
];

const projectItems = [];
let selectedType = null;

const categoryList = document.getElementById('category-list');
const selectedLabel = document.getElementById('selected-label');
const infraForm = document.getElementById('infra-form');
const fieldsContainer = document.getElementById('fields-container');
const addItemBtn = document.getElementById('add-item-btn');
const welcomeCard = document.getElementById('welcome-card');
const projectCount = document.getElementById('project-count');
const openResultsBtn = document.getElementById('open-results-btn');
const resetProjectBtn = document.getElementById('reset-project-btn');
const resultsPanel = document.getElementById('results-panel');
const resultTableBody = document.getElementById('result-table-body');
const exportCsvBtn = document.getElementById('export-csv-btn');
const exportPdfBtn = document.getElementById('export-pdf-btn');
const backToSelectionBtn = document.getElementById('back-to-selection-btn');
const formDescription = document.getElementById('form-description');
const sidebar = document.querySelector('.sidebar');
const formPanel = document.getElementById('form-panel');
const appShell = document.querySelector('.app-shell');

function renderCatalog() {
    categoryList.innerHTML = '';
    itemsCatalog.forEach(item => {
        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'category-card';
        card.dataset.itemType = item.type;
        card.innerHTML = `<strong>${item.label}</strong><small>${item.type}</small>`;
        card.addEventListener('click', () => selectItem(item));
        categoryList.appendChild(card);
    });
}

function selectItem(item) {
    selectedType = item.type;
    selectedLabel.textContent = item.label;
    renderFormFields(item.type);
    enterFormMode(item);
}

function updateActiveItem(type) {
    document.querySelectorAll('.category-card').forEach(card => {
        card.classList.toggle('active', card.dataset.itemType === type);
    });
}

function enterFormMode(item) {
    sidebar.classList.add('collapsed');
    appShell.classList.add('collapsed');
    backToSelectionBtn.classList.remove('hidden');
    formDescription.textContent = 'Preencha os dados do trecho selecionado e clique em Adicionar trecho. Depois, acesse a lista consolidada para exportar o relatório.';
    welcomeCard.classList.add('hidden');
    infraForm.classList.remove('hidden');
    resultsPanel.classList.add('hidden');
    updateActiveItem(item.type);
    setTimeout(() => {
        formPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

function exitFormMode() {
    selectedType = null;
    selectedLabel.textContent = 'Bem-vindo ao sistema KTS';
    formDescription.textContent = 'Use o menu à esquerda para escolher a infraestrutura. Adicione trechos e gere a lista de materiais para exportar em CSV ou PDF.';
    sidebar.classList.remove('collapsed');
    appShell.classList.remove('collapsed');
    backToSelectionBtn.classList.add('hidden');
    infraForm.classList.add('hidden');
    welcomeCard.classList.remove('hidden');
    resultsPanel.classList.add('hidden');
    updateActiveItem(null);
}

function renderFormFields(type) {
    fieldsContainer.innerHTML = '';
    const fields = getFieldsForType(type);
    fields.forEach(field => {
        const fieldItem = document.createElement('div');
        fieldItem.className = 'field-item';

        const label = document.createElement('label');
        label.textContent = field.label;
        label.htmlFor = field.name;

        const input = document.createElement('input');
        input.type = field.type;
        input.name = field.name;
        input.id = field.name;
        input.value = field.default;
        input.min = '0';

        fieldItem.appendChild(label);
        fieldItem.appendChild(input);
        fieldsContainer.appendChild(fieldItem);
    });
}

function getFieldsForType(type) {
    if (type === 'DUTOS_ENTERRADOS') {
        return [
            { name: 'm_34', label: 'Metros Duto PEAD 3/4"', type: 'number', default: '0' },
            { name: 'm_1', label: 'Metros Duto PEAD 1"', type: 'number', default: '0' },
            { name: 'm_2', label: 'Metros Duto PEAD 2"', type: 'number', default: '0' },
            { name: 'caixas', label: 'Caixas de Passagem (Concreto)', type: 'number', default: '0' }
        ];
    }

    const commonFields = [
        { name: 'metros', label: 'Comprimento (Metros)', type: 'number', default: '0' },
        { name: 'curvas', label: 'Curvas 90º', type: 'number', default: '0' }
    ];

    if (type.includes('CALHA') || type.includes('PERFILADO')) {
        const extra = [
            { name: 'emendas', label: 'Emendas Adicionais', type: 'number', default: '0' },
            { name: 'apoios', label: 'Apoios Adicionais', type: 'number', default: '0' }
        ];
        if (type.includes('CABO')) {
            extra.push({ name: 'altura', label: 'Altura Susp. (Metros)', type: 'number', default: '4' });
        }
        if (type.includes('IGREJINHA') || type.includes('BARRA')) {
            extra.push({ name: 'altura', label: 'Queda Tirante (Metros)', type: 'number', default: '0.5' });
        }
        return [...commonFields, ...extra];
    }

    return [...commonFields, { name: 'conduletes', label: 'Conduletes Adicionais', type: 'number', default: '0' }];
}

function addItemToProject() {
    const formData = new FormData(infraForm);
    const item = { type: selectedType, label: selectedLabel.textContent };
    let valid = true;

    for (const [key, value] of formData.entries()) {
        const numericValue = Number(value);
        if (Number.isNaN(numericValue) || numericValue < 0) {
            valid = false;
            break;
        }
        item[key] = numericValue;
    }

    if (!valid) {
        alert('Preencha valores numéricos válidos.');
        return;
    }

    projectItems.push(item);
    updateProjectCount();
    infraForm.reset();
    renderFormFields(selectedType);
    openResults();
    alert('Trecho adicionado com sucesso! A lista consolidada foi atualizada.');
}

function updateProjectCount() {
    projectCount.textContent = `${projectItems.length} trecho(s) adicionado(s)`;
}

function resetProject() {
    projectItems.length = 0;
    updateProjectCount();
    resultsPanel.classList.add('hidden');
    alert('Projeto limpo.');
}

function openResults() {
    if (!projectItems.length) {
        alert('Adicione pelo menos um trecho antes de gerar a lista.');
        return;
    }
    renderResults();
    resultsPanel.classList.remove('hidden');
    setTimeout(() => {
        resultsPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

function renderResults() {
    const consolidated = consolidateMaterials();
    resultTableBody.innerHTML = '';

    consolidated.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.unit}</td>
            <td>${item.quantity}</td>
        `;
        resultTableBody.appendChild(row);
    });
}

function consolidateMaterials() {
    const container = {};

    const add = (name, quantity, type = 'principal', unit = 'PEÇA') => {
        if (quantity <= 0) return;
        if (!container[name]) {
            container[name] = { name, quantity: 0, type, unit };
        }
        container[name].quantity += quantity;
    };

    projectItems.forEach(tr => {
        const tipo = tr.type;
        if (tipo === 'DUTOS_ENTERRADOS') {
            add('DUTO CORRUGADO PEAD 3/4"', tr.m_34 || 0, 'principal', 'METRO');
            add('DUTO CORRUGADO PEAD 1"', tr.m_1 || 0, 'principal', 'METRO');
            add('DUTO CORRUGADO PEAD 2"', tr.m_2 || 0, 'principal', 'METRO');
            add('CAIXA DE PASSAGEM CONCRETO 50X50', tr.caixas || 0);
            add('TAMPA PARA CAIXA DE INSPEÇÃO COM ALÇA', tr.caixas || 0);
            return;
        }

        const m = tr.metros || 0;
        const cur = tr.curvas || 0;

        if (tipo.includes('ELETRODUTO')) {
            const pol = tipo.includes('34') ? '3/4"' : tipo.includes('1_') ? '1"' : '2"';
            add(`ELETRODUTO GALVANIZADO LEVE ${pol} (BARRA 3m)`, Math.ceil(m / 3));
            add(`ABRAÇADEIRA ${pol} COM CUNHA`, Math.ceil(m / 1.5));
            add(`CONDULETE MÚLTIPLO X ${pol}`, 2 + (tr.conduletes || 0));
            if (cur > 0) add(`CURVA 90º ELETRODUTO ${pol}`, cur);

            const fix = Math.ceil(m / 1.5) + (2 + (tr.conduletes || 0)) * 2;
            if (tipo.includes('CONCRETO')) {
                add('BUCHA FISCHER SX 8MM', fix, 'miudeza');
                add('PARAFUSO PHILLIPS PANELA', fix, 'miudeza');
            } else if (tipo.includes('DRYWALL')) {
                add('BUCHA FLY 8MM', fix, 'miudeza');
                add('PARAFUSO PHILLIPS PANELA', fix, 'miudeza');
            } else if (tipo.includes('METALICA')) {
                add('PARAFUSO AUTOBROCANTE 5/16', fix, 'miudeza');
            }
            return;
        }

        if (tipo.includes('CALHA') || tipo.includes('PERFILADO')) {
            const isCalha = tipo.includes('CALHA');
            const baseName = isCalha ? 'ELETROCALHA 100X50 (BARRA 3m)' : 'PERFILADO 38X38 (BARRA 6m)';
            const divisor = isCalha ? 3 : 6;
            const barras = Math.ceil(m / divisor);
            add(baseName, barras);
            const emendas = barras + (tr.emendas || 0);
            add(isCalha ? 'EMENDA INTERNA U 100X50' : 'EMENDA INTERNA PERFILADO 38X38', emendas);
            const apoios = Math.ceil(m / 1.5) + (tr.apoios || 0);
            let pf_base = emendas * 8;

            if (tipo.includes('MF')) {
                add('MÃO FRANCESA DE PERFILADO 30 CM', apoios);
                add('BUCHA FISCHER SX 8MM', apoios * 4, 'miudeza');
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
                add('PORCA SEXTAVADA 3/8', apoios * 4, 'miudeza');
                add('ARRUELA LISA 3/8', apoios * 4, 'miudeza');
            } else if (tipo.includes('GRAMPO')) {
                add('GRAMPO C COM BALANCIM', apoios);
            }

            add('PARAFUSO (LENTILHA) 1/4 x 3/4', pf_base, 'miudeza');
            add('PORCA SEXTAVADA 1/4', pf_base, 'miudeza');
            return;
        }
    });

    return Object.values(container).map(item => ({
        name: item.name,
        unit: item.unit,
        quantity: item.type === 'miudeza' ? roundMiudezas(item.quantity) : Math.ceil(item.quantity)
    }));
}

function roundMiudezas(value) {
    if (value === 0) return 0;
    let result = Math.ceil(value * 1.1);
    while (result % 5 !== 0) result += 1;
    return result;
}

function downloadCsv() {
    const rows = consolidateMaterials();
    if (!rows.length) {
        alert('Gere a lista antes de exportar.');
        return;
    }
    const csv = ['DESCRIÇÃO;UNID;QUANTIDADE FINAL', ...rows.map(r => `${r.name};${r.unit};${r.quantity}`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'lista_kts.csv';
    link.click();
}

function downloadPdf() {
    const rows = consolidateMaterials();
    if (!rows.length) {
        alert('Gere a lista antes de exportar.');
        return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    doc.setFontSize(14);
    doc.setTextColor('#1e3a5f');
    doc.text('KTS Tecnologia & Inovação - Lista de Materiais', 40, 60);
    doc.setFontSize(10);
    doc.setTextColor('#6b7280');
    doc.text(`Gerado em: ${new Date().toLocaleString()}`, 40, 80);

    let y = 110;
    doc.setFontSize(10);
    doc.text('DESCRIÇÃO', 40, y);
    doc.text('UNID', 390, y);
    doc.text('QUANTIDADE', 470, y);
    y += 18;

    rows.forEach(row => {
        if (y > 740) {
            doc.addPage();
            y = 60;
        }
        doc.text(row.name, 40, y);
        doc.text(row.unit, 390, y);
        doc.text(String(row.quantity), 470, y);
        y += 18;
    });

    doc.save('lista_kts.pdf');
}

addItemBtn.addEventListener('click', addItemToProject);
openResultsBtn.addEventListener('click', openResults);
resetProjectBtn.addEventListener('click', resetProject);
exportCsvBtn.addEventListener('click', downloadCsv);
exportPdfBtn.addEventListener('click', downloadPdf);
backToSelectionBtn.addEventListener('click', exitFormMode);

renderCatalog();
updateProjectCount();
