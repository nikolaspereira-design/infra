/* ============================================================
   KTS Dimensionamento — app.js
   Structure: State Management + Features
   ============================================================ */

// ============================================================
// STATE MANAGEMENT
// ============================================================

const State = {
    currentUser: null,
    currentRole: null,
    selectedType: null,
    selectedItemLabel: '',
    projectItems: [],
    storageKeyUsers: 'kts_users',
    users: [
        { user: 'Nikolas', pass: '4x%t7kADM', role: 'admin' },
        { user: 'Goes', pass: 'senha123', role: 'admin' },
        { user: 'maria', pass: 'kts2026', role: 'user' }
    ],

    loadUsers() {
        try {
            const saved = localStorage.getItem(this.storageKeyUsers);
            if (!saved) return;
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length) {
                this.users = parsed;
            }
        } catch (err) {
            console.warn('Não foi possível carregar usuários salvos:', err);
        }
    },

    saveUsers() {
        try {
            localStorage.setItem(this.storageKeyUsers, JSON.stringify(this.users));
        } catch (err) {
            console.warn('Não foi possível salvar usuários:', err);
        }
    },

    setUser(user, role) {
        this.currentUser = user;
        this.currentRole = role;
    },

    setSelectedItem(type, label) {
        this.selectedType = type;
        this.selectedItemLabel = label;
    },

    addProjectItem(item) {
        this.projectItems.push(item);
    },

    removeProjectItem(index) {
        this.projectItems.splice(index, 1);
    },

    resetProject() {
        this.projectItems = [];
    },

    materialCatalog: {},
    materialCatalogSource: 'materiais.csv',

    normalizeCatalogKey(text) {
        return String(text || '')
            .trim()
            .replace(/\s+/g, ' ')
            .toLowerCase();
    },

    parseCsv(text) {
        const rows = [];
        let current = '';
        let inQuotes = false;
        let row = [];

        for (let i = 0; i < text.length; i++) {
            const ch = text[i];

            if (ch === '"') {
                if (inQuotes && text[i + 1] === '"') {
                    current += '"';
                    i += 1;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (ch === ';' && !inQuotes) {
                row.push(current);
                current = '';
            } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
                if (ch === '\r' && text[i + 1] === '\n') {
                    i += 1;
                }
                row.push(current);
                if (row.length > 1 || current.length > 0) {
                    rows.push(row);
                }
                row = [];
                current = '';
            } else {
                current += ch;
            }
        }

        if (current.length > 0 || row.length > 0) {
            row.push(current);
            rows.push(row);
        }

        return rows;
    },

    buildMaterialCatalog(records) {
        const catalog = {};
        records.forEach(record => {
            const description = String(record.descricao || record.descrição || record.description || '').trim();
            if (!description) return;
            const unit = String(record.unidade || record.unit || record.ud || record.unidad || 'PEÇA').trim() || 'PEÇA';
            const key = this.normalizeCatalogKey(description);
            if (!catalog[key]) {
                catalog[key] = { name: description, unit };
            }
        });
        return catalog;
    },

    normalizeCsvHeader(header) {
        return header
            .trim()
            .toLowerCase()
            .replace(/ç/g, 'c')
            .replace(/ã/g, 'a')
            .replace(/á/g, 'a')
            .replace(/é/g, 'e')
            .replace(/í/g, 'i')
            .replace(/ó/g, 'o')
            .replace(/ú/g, 'u')
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '');
    },

    loadMaterialCatalog() {
        return fetch(this.materialCatalogSource)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Falha ao carregar ${this.materialCatalogSource}: ${response.status}`);
                }
                return response.text();
            })
            .then(rawText => {
                const rows = this.parseCsv(rawText);
                if (!rows.length) {
                    throw new Error('CSV vazio ou inválido');
                }

                let headers = null;
                let startIndex = 0;
                const firstRow = rows[0].map(cell => String(cell || '').trim().toLowerCase());
                const hasHeader = firstRow.some(value => /descricao|descrição|descricao/i.test(value))
                    || firstRow.some(value => /unidade|unidad|unit|ud/i.test(value));

                if (hasHeader) {
                    headers = firstRow.map(value => this.normalizeCsvHeader(value));
                    startIndex = 1;
                }

                const records = [];
                for (let i = startIndex; i < rows.length; i += 1) {
                    const row = rows[i];
                    if (!row || row.every(cell => String(cell || '').trim() === '')) continue;
                    if (headers) {
                        const record = {};
                        headers.forEach((header, index) => {
                            record[header] = String(row[index] || '').trim();
                        });
                        records.push(record);
                    } else {
                        records.push({
                            descricao: String(row[0] || '').trim(),
                            unidade: String(row[1] || '').trim()
                        });
                    }
                }

                this.materialCatalog = this.buildMaterialCatalog(records);
                console.info(`Catalogo de materiais carregado: ${Object.keys(this.materialCatalog).length} itens`);
            })
            .catch(err => {
                console.warn('Não foi possível carregar o catálogo de materiais do CSV:', err);
                this.materialCatalog = {};
            });
    },

    getMaterialDefinition(name) {
        if (!name) return null;
        return this.materialCatalog[this.normalizeCatalogKey(name)] || null;
    },

    addUser(user) {
        this.users.push(user);
        this.saveUsers();
    },

    removeUser(index) {
        this.users.splice(index, 1);
        this.saveUsers();
    }
};

// ============================================================
// DOM REFERENCES
// ============================================================

const DOM = {
    // Header & Auth
    loginOverlay: document.getElementById('login-overlay'),
    loginUsername: document.getElementById('login-username'),
    loginPassword: document.getElementById('login-password'),
    loginSubmit: document.getElementById('login-submit'),
    loginMessage: document.getElementById('login-message'),
    userBar: document.getElementById('user-bar'),
    userNameLabel: document.getElementById('user-name'),
    userRoleLabel: document.getElementById('user-role'),

    // Main Content
    welcomeState: document.getElementById('welcome-state'),
    trechosList: document.getElementById('trechos-list'),
    resultsState: document.getElementById('results-state'),
    categoryList: document.getElementById('category-list'),

    // Project Controls
    projectCount: document.getElementById('project-count'),
    projectBar: document.getElementById('project-bar'),
    openResultsBtn: document.getElementById('open-results-btn'),
    resetProjectBtn: document.getElementById('reset-project-btn'),
    backTrechosBtn: document.getElementById('back-to-trechos-btn'),

    // Results
    resultTableBody: document.getElementById('result-table-body'),
    sendWhatsappBtn: document.getElementById('send-whatsapp-btn'),
    projectObs: document.getElementById('project-obs'),

    // Modal
    modalOverlay: document.getElementById('modal-overlay'),
    modalTitle: document.getElementById('modal-title'),
    modalClose: document.getElementById('modal-close'),
    infraForm: document.getElementById('infra-form'),
    fieldsContainer: document.getElementById('fields-container'),
    addItemBtn: document.getElementById('add-item-btn'),
    showResultsBtn: document.getElementById('show-results-btn'),
    modalFeedback: document.getElementById('modal-feedback'),
    feedbackText: document.getElementById('feedback-text'),

    // Admin
    adminPanel: document.getElementById('admin-panel'),
    adminAddUserBtn: document.getElementById('admin-add-user-btn'),
    adminUserList: document.getElementById('admin-user-list'),
    adminUserForm: document.getElementById('admin-user-form'),
    adminFormUsername: document.getElementById('admin-form-username'),
    adminFormPassword: document.getElementById('admin-form-password'),
    adminFormRole: document.getElementById('admin-form-role'),
    adminFormSave: document.getElementById('admin-form-save'),
    adminFormCancel: document.getElementById('admin-form-cancel'),
    adminFormMessage: document.getElementById('admin-form-message')
};

// ============================================================
// CATALOG & FIELDS
// ============================================================

const CATALOG = [
    { label: 'Eletroduto 3/4" — Concreto', type: 'ELETRODUTO_34_CONCRETO' },
    { label: 'Eletroduto 3/4" — Drywall', type: 'ELETRODUTO_34_DRYWALL' },
    { label: 'Eletroduto 3/4" — Metálica', type: 'ELETRODUTO_34_METALICA' },
    { label: 'Eletroduto 1" — Concreto', type: 'ELETRODUTO_1_CONCRETO' },
    { label: 'Eletroduto 1" — Drywall', type: 'ELETRODUTO_1_DRYWALL' },
    { label: 'Eletroduto 1" — Metálica', type: 'ELETRODUTO_1_METALICA' },
    { label: 'Eletroduto 2" — Concreto', type: 'ELETRODUTO_2_CONCRETO' },
    { label: 'Eletroduto 2" — Drywall', type: 'ELETRODUTO_2_DRYWALL' },
    { label: 'Eletroduto 2" — Metálica', type: 'ELETRODUTO_2_METALICA' },
    { label: 'Dutos Enterrados (3/4", 1", 2")', type: 'DUTOS_ENTERRADOS' },
    { label: 'Eletrocalha — Mão Francesa', type: 'CALHA_MF_CONCRETO' },
    { label: 'Eletrocalha — Suspensa Cabo de Aço', type: 'CALHA_CABO' },
    { label: 'Eletrocalha — Igrejinha + Barra', type: 'CALHA_IGREJINHA' },
    { label: 'Eletrocalha — Grampo C', type: 'CALHA_GRAMPO' },
    { label: 'Perfilado — Mão Francesa', type: 'PERFILADO_MF_CONCRETO' },
    { label: 'Perfilado — Grampo C + Balancim', type: 'PERFILADO_GRAMPO' },
    { label: 'Perfilado — Chumbador + Barra', type: 'PERFILADO_BARRA' }
];

function getFieldsForType(type) {
    if (type === 'DUTOS_ENTERRADOS') {
        return [
            { name: 'm_34', label: 'Metros — Duto PEAD 3/4"', default: '0' },
            { name: 'm_1', label: 'Metros — Duto PEAD 1"', default: '0' },
            { name: 'm_2', label: 'Metros — Duto PEAD 2"', default: '0' },
            { name: 'caixas', label: 'Caixas de Passagem (Concreto)', default: '0' }
        ];
    }

    const common = [
        { name: 'metros', label: 'Comprimento (metros)', default: '0' },
        { name: 'curvas', label: 'Curvas 90°', default: '0' }
    ];

    if (type.includes('CALHA') || type.includes('PERFILADO')) {
        const extra = [
            { name: 'emendas', label: 'Emendas Adicionais', default: '0' },
            { name: 'apoios', label: 'Apoios Adicionais', default: '0' }
        ];

        if (type.includes('CABO')) {
            extra.push({ name: 'altura', label: 'Altura Suspensão (metros)', default: '4', step: '0.1' });
        }

        if (type.includes('IGREJINHA') || type.includes('BARRA')) {
            extra.push({ name: 'altura', label: 'Queda Tirante (metros)', default: '0.5', step: '0.1' });
        }

        return [...common, ...extra];
    }

    return [...common, { name: 'conduletes', label: 'Conduletes Adicionais', default: '0' }];
}

function getFieldLabel(type, key) {
    const fields = getFieldsForType(type);
    const field = fields.find(f => f.name === key);
    return field ? field.label : key;
}

// ============================================================
// MODAL MANAGEMENT
// ============================================================

const Modal = {
    open(item) {
        State.setSelectedItem(item.type, item.label);
        DOM.modalTitle.textContent = item.label;
        this.renderFields(item.type);
        this.hideModal();
        DOM.modalOverlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden';

        setTimeout(() => {
            const firstInput = DOM.fieldsContainer.querySelector('input');
            if (firstInput) firstInput.focus();
        }, 120);
    },

    close() {
        DOM.modalOverlay.classList.add('hidden');
        document.body.style.overflow = '';
        State.setSelectedItem(null, '');
    },

    renderFields(type) {
        DOM.fieldsContainer.innerHTML = '';
        const fields = getFieldsForType(type);

        fields.forEach(field => {
            const wrap = document.createElement('div');
            wrap.className = 'field-item';

            const label = document.createElement('label');
            label.textContent = field.label;
            label.htmlFor = field.name;

            const input = document.createElement('input');
            input.type = 'number';
            input.name = field.name;
            input.id = field.name;
            input.value = field.default;
            input.min = '0';
            input.step = field.step || '1';
            input.addEventListener('focus', () => input.select());

            wrap.appendChild(label);
            wrap.appendChild(input);
            DOM.fieldsContainer.appendChild(wrap);
        });
    },

    showFeedback(message) {
        DOM.feedbackText.textContent = message;
        DOM.modalFeedback.classList.remove('hidden');
        setTimeout(() => this.hideModal(), 3500);
    },

    hideModal() {
        DOM.modalFeedback.classList.add('hidden');
    }
};

// ============================================================
// PROJECT MANAGEMENT
// ============================================================

const Project = {
    addItem() {
        const formData = new FormData(DOM.infraForm);
        const item = {
            type: State.selectedType,
            label: State.selectedItemLabel
        };

        let isValid = true;
        for (const [key, value] of formData.entries()) {
            const num = Number(value);
            if (Number.isNaN(num) || num < 0) {
                isValid = false;
                break;
            }
            item[key] = num;
        }

        if (!isValid) {
            alert('Preencha valores numéricos válidos (≥ 0).');
            return;
        }

        State.addProjectItem(item);
        DOM.infraForm.reset();
        Modal.renderFields(State.selectedType);
        Modal.showFeedback(`Trecho "${State.selectedItemLabel}" adicionado! (${State.projectItems.length} no total)`);
        this.updateUI();
    },

    removeItem(index) {
        State.removeProjectItem(index);
        this.updateUI();
    },

    reset() {
        if (!confirm('Tem certeza que deseja limpar todos os trechos?')) return;
        State.resetProject();
        DOM.projectObs.value = '';
        this.updateUI();
        this.showWelcome();
    },

    updateUI() {
        this.updateCount();
        this.renderTrechos();
        this.updateResults();
    },

    updateCount() {
        const count = State.projectItems.length;
        if (count === 0) {
            DOM.projectCount.textContent = 'Nenhum trecho adicionado';
            DOM.openResultsBtn.disabled = true;
        } else {
            DOM.projectCount.textContent = `${count} trecho${count !== 1 ? 's' : ''} adicionado${count !== 1 ? 's' : ''}`;
            DOM.openResultsBtn.disabled = false;
        }
    },

    renderTrechos() {
        if (State.projectItems.length === 0) {
            DOM.trechosList.classList.add('hidden');
            DOM.welcomeState.classList.remove('hidden');
            return;
        }

        DOM.welcomeState.classList.add('hidden');
        DOM.trechosList.classList.remove('hidden');
        DOM.trechosList.innerHTML = '';

        State.projectItems.forEach((item, index) => {
            const card = document.createElement('div');
            card.className = 'trecho-card';

            const content = document.createElement('div');
            content.className = 'trecho-card__content';

            const title = document.createElement('div');
            title.className = 'trecho-card__title';
            title.textContent = item.label;

            const details = Object.entries(item)
                .filter(([key]) => !['type', 'label'].includes(key))
                .map(([key, value]) => `${getFieldLabel(item.type, key)}: ${value}`)
                .join(' • ');

            const detail = document.createElement('div');
            detail.className = 'trecho-card__detail';
            detail.textContent = details || 'Sem detalhes';

            content.appendChild(title);
            content.appendChild(detail);

            const removeBtn = document.createElement('button');
            removeBtn.className = 'trecho-card__remove';
            removeBtn.textContent = '✕';
            removeBtn.type = 'button';
            removeBtn.addEventListener('click', () => this.removeItem(index));

            card.appendChild(content);
            card.appendChild(removeBtn);
            DOM.trechosList.appendChild(card);
        });
    },

    updateResults() {
        const consolidated = this.consolidateMaterials();
        DOM.resultTableBody.innerHTML = '';

        consolidated.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row.name}</td>
                <td>${row.unit}</td>
                <td><strong>${row.quantity}</strong></td>
            `;
            DOM.resultTableBody.appendChild(tr);
        });
    },

    consolidateMaterials() {
        const materials = {};

        const add = (name, qty, unit = 'PEÇA', type = 'principal') => {
            if (!qty || qty <= 0) return;
            const def = State.getMaterialDefinition(name);
            const resolvedUnit = def && def.unit ? def.unit : unit;
            if (!materials[name]) {
                materials[name] = { name, unit: resolvedUnit, quantity: 0, type };
            }
            materials[name].quantity += qty;
        };

        const roundMiudeza = qty => {
            if (!qty || qty <= 0) return 0;
            let sup = Math.ceil(qty * 1.10);
            while (sup % 5 !== 0) sup += 1;
            return sup;
        };

        State.projectItems.forEach(item => {
            if (item.type === 'DUTOS_ENTERRADOS') {
                add('DUTO CORRUGADO PEAD 3/4"', item.m_34 || 0, 'METRO');
                add('DUTO CORRUGADO PEAD 1"', item.m_1 || 0, 'METRO');
                add('DUTO CORRUGADO PEAD 2"', item.m_2 || 0, 'METRO');
                const caixas = item.caixas || 0;
                add('CAIXA DE PASSAGEM CONCRETO 50X50', caixas);
                add('TAMPA PARA CAIXA DE INSPEÇÃO COM ALÇA', caixas);
                return;
            }

            const metros = item.metros || 0;
            const curvas = item.curvas || 0;
            const conduletes = item.conduletes || 0;
            const emendas = item.emendas || 0;
            const apoios = item.apoios || 0;
            const altura = item.altura || (item.type.includes('CABO') ? 4 : 0.5);

            if (item.type.includes('ELETRODUTO')) {
                const pol = item.type.includes('34') ? '3/4"' : item.type.includes('1_') ? '1"' : '2"';
                add(`ELETRODUTO GALVANIZADO LEVE ${pol} (BARRA 3m)`, Math.ceil(metros / 3));
                const abr = Math.ceil(metros / 1.5);
                add(`ABRAÇADEIRA ${pol} COM CUNHA`, abr);
                const cond = 2 + conduletes;
                add(`CONDULETE MÚLTIPLO X ${pol}`, cond);
                if (curvas > 0) add(`CURVA 90º ELETRODUTO ${pol}`, curvas);

                const fix = abr + cond * 2;
                if (item.type.includes('CONCRETO')) {
                    add('BUCHA FISCHER SX 8MM', fix, 'PEÇA', 'miudeza');
                    add('PARAFUSO PHILLIPS PANELA', fix, 'PEÇA', 'miudeza');
                } else if (item.type.includes('DRYWALL')) {
                    add('BUCHA FLY 8MM', fix, 'PEÇA', 'miudeza');
                    add('PARAFUSO PHILLIPS PANELA', fix, 'PEÇA', 'miudeza');
                } else if (item.type.includes('METALICA')) {
                    add('PARAFUSO AUTOBROCANTE 5/16', fix, 'PEÇA', 'miudeza');
                }
                return;
            }

            if (item.type.includes('CALHA') || item.type.includes('PERFILADO')) {
                const isCalha = item.type.includes('CALHA');
                const nomeBase = isCalha ? 'ELETROCALHA 100X50 (BARRA 3m)' : 'PERFILADO 38X38 (BARRA 6m)';
                const divisor = isCalha ? 3 : 6;
                const barras = Math.ceil(metros / divisor);
                add(nomeBase, barras);

                const totalEmendas = barras + emendas;
                if (isCalha) {
                    add('EMENDA INTERNA U 100X50', totalEmendas);
                } else {
                    add('EMENDA INTERNA PERFILADO 38X38', totalEmendas);
                }

                const totalApoios = Math.ceil(metros / 1.5) + apoios;
                let pfBase = totalEmendas * 8;

                if (item.type.includes('MF')) {
                    add('MÃO FRANCESA DE PERFILADO 30 CM', totalApoios);
                    add('BUCHA FISCHER SX 8MM', totalApoios * 4, 'PEÇA', 'miudeza');
                    add('PARAFUSO PHILLIPS PANELA', totalApoios * 4, 'PEÇA', 'miudeza');
                    pfBase += totalApoios * 2;
                } else if (item.type.includes('CABO')) {
                    add('SUPORTE SUSPENSO POR CABO DE AÇO', totalApoios);
                    add('CABO DE AÇO 1/8', totalApoios * altura, 'METRO');
                    add('PRENSA CABO DE ALUMINIO 1/8', totalApoios * 6);
                } else if (item.type.includes('IGREJINHA') || item.type.includes('BARRA')) {
                    if (isCalha) {
                        add('SUPORTE BALANÇO (IGREJINHA)', totalApoios);
                    } else {
                        add('GRAMPO C COM BALANCIM', totalApoios);
                    }
                    add('CHUMBADOR CBA 3/8', totalApoios);
                    add('BARRA ROSCADA ZINCADA 3/8 X 3000', (totalApoios * altura) / 3);
                    add('PORCA SEXTAVADA 3/8', totalApoios * 4, 'PEÇA', 'miudeza');
                    add('ARRUELA LISA 3/8', totalApoios * 4, 'PEÇA', 'miudeza');
                } else if (item.type.includes('GRAMPO')) {
                    add('GRAMPO C COM BALANCIM', totalApoios);
                }

                add('PARAFUSO (LENTILHA) 1/4 x 3/4', pfBase, 'PEÇA', 'miudeza');
                add('PORCA SEXTAVADA 1/4', pfBase, 'PEÇA', 'miudeza');
                add('ARRUELA LISA 1/4', pfBase, 'PEÇA', 'miudeza');
                return;
            }
        });

        return Object.values(materials)
            .map(item => ({
                name: item.name,
                unit: item.unit,
                quantity: item.type === 'miudeza' ? roundMiudeza(item.quantity) : Math.ceil(item.quantity)
            }))
            .sort((a, b) => a.name.localeCompare(b.name));
    },

    showWelcome() {
        DOM.welcomeState.classList.remove('hidden');
        DOM.trechosList.classList.add('hidden');
        DOM.resultsState.classList.add('hidden');
    },

    showResults() {
        if (State.projectItems.length === 0) {
            alert('Adicione trechos primeiro.');
            return;
        }
        DOM.welcomeState.classList.add('hidden');
        DOM.trechosList.classList.add('hidden');
        DOM.resultsState.classList.remove('hidden');
    },

    backToTrechos() {
        DOM.welcomeState.classList.add('hidden');
        DOM.resultsState.classList.add('hidden');
        DOM.trechosList.classList.remove('hidden');
    }
};

// ============================================================
// WHATSAPP INTEGRATION
// ============================================================

async function sendToWhatsapp() {
    const rows = Project.consolidateMaterials();

    if (!rows.length) {
        alert('Gere a lista antes de enviar.');
        return;
    }

    let texto = '*KTS - Lista de Materiais*\n\n';
    texto += '*Trechos adicionados:*\n';

    State.projectItems.forEach((item, index) => {
        texto += `${index + 1}. ${item.label}\n`;
        Object.entries(item)
            .filter(([key]) => !['type', 'label'].includes(key))
            .forEach(([key, value]) => {
                texto += `   - ${getFieldLabel(item.type, key)}: ${value}\n`;
            });
    });

    texto += '\n*Totais consolidados:*\n';
    rows.forEach(row => {
        texto += `• ${row.name} | ${row.unit} | ${row.quantity}\n`;
    });

    const obsText = DOM.projectObs.value.trim();
    if (obsText) {
        texto += `\n*OBSERVAÇÕES*\n${obsText}`;
    }

    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(texto)}`;

    // Mobile Share
    if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        const csvContent = [
            'DESCRIÇÃO;UNID;QUANTIDADE FINAL',
            ...rows.map(row => `${row.name};${row.unit};${row.quantity}`)
        ].join('\n');

        const universalBOM = new Uint8Array([0xEF, 0xBB, 0xBF]);
        const file = new File(
            [universalBOM, csvContent],
            `KTS_${Date.now()}.csv`,
            { type: 'text/csv;charset=utf-8' }
        );

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
                await navigator.share({
                    title: 'KTS Lista de Materiais',
                    text: texto,
                    files: [file]
                });
                return;
            } catch (err) {
                console.log('Share falhou, fallback para WhatsApp:', err);
            }
        }
    }

    const opened = window.open(whatsappUrl, '_blank');
    if (!opened) {
        window.location.href = whatsappUrl;
    }
}

// ============================================================
// AUTHENTICATION
// ============================================================

const Auth = {
    login() {
        const user = DOM.loginUsername.value.trim();
        const pass = DOM.loginPassword.value.trim();
        const match = State.users.find(u => u.user === user && u.pass === pass);

        if (!match) {
            DOM.loginMessage.classList.remove('hidden');
            DOM.loginPassword.value = '';
            DOM.loginPassword.focus();
            return;
        }

        State.setUser(match.user, match.role);
        this.finishLogin();
    },

    finishLogin() {
        DOM.loginOverlay.classList.add('hidden');
        document.body.classList.remove('locked');
        DOM.loginMessage.classList.add('hidden');
        DOM.loginUsername.value = '';
        DOM.loginPassword.value = '';

        Catalog.render();
        Project.updateUI();
        this.updateUserBadge();
        this.applyPermissions();
        Admin.render();
    },

    updateUserBadge() {
        DOM.userBar.classList.remove('hidden');
        DOM.userNameLabel.textContent = State.currentUser;
        DOM.userRoleLabel.textContent = State.currentRole === 'admin' ? 'ADMIN' : 'Usuário comum';
    },

    applyPermissions() {
        const isAdmin = State.currentRole === 'admin';
        DOM.resetProjectBtn.disabled = !isAdmin;
        DOM.resetProjectBtn.title = isAdmin ? '' : 'Apenas administradores podem limpar o projeto';
    }
};

// ============================================================
// CATALOG RENDERING
// ============================================================

const Catalog = {
    render() {
        DOM.categoryList.innerHTML = '';
        CATALOG.forEach(item => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'category-card';
            btn.textContent = item.label;
            btn.addEventListener('click', () => Modal.open(item));
            DOM.categoryList.appendChild(btn);
        });
    }
};

// ============================================================
// ADMIN MANAGEMENT
// ============================================================

const Admin = {
    render() {
        if (State.currentRole !== 'admin') {
            DOM.adminPanel.classList.add('hidden');
            return;
        }

        DOM.adminPanel.classList.remove('hidden');
        this.renderUserList();
    },

    renderUserList() {
        DOM.adminUserList.innerHTML = '';

        State.users.forEach((user, index) => {
            const card = document.createElement('div');
            card.className = 'admin-user-card';

            const info = document.createElement('div');
            info.className = 'admin-user-info';
            info.innerHTML = `
                <strong>${user.user}</strong>
                <span>${user.role === 'admin' ? 'Administrador' : 'Usuário comum'}</span>
            `;

            const actions = document.createElement('div');
            const removeBtn = document.createElement('button');
            removeBtn.className = 'btn btn--ghost btn--sm';
            removeBtn.textContent = 'Remover';

            if (user.user === State.currentUser) {
                removeBtn.disabled = true;
                removeBtn.title = 'Não é possível remover o usuário logado.';
            }

            removeBtn.addEventListener('click', () => this.removeUser(index));

            actions.appendChild(removeBtn);
            card.appendChild(info);
            card.appendChild(actions);
            DOM.adminUserList.appendChild(card);
        });
    },

    showForm() {
        DOM.adminFormMessage.classList.add('hidden');
        DOM.adminFormUsername.value = '';
        DOM.adminFormPassword.value = '';
        DOM.adminFormRole.value = 'user';
        DOM.adminUserForm.classList.remove('hidden');
    },

    hideForm() {
        DOM.adminFormMessage.classList.add('hidden');
        DOM.adminUserForm.classList.add('hidden');
    },

    saveUser() {
        const username = DOM.adminFormUsername.value.trim();
        const password = DOM.adminFormPassword.value.trim();
        const role = DOM.adminFormRole.value;

        if (!username || !password) {
            this.showMessage('Preencha usuário e senha.');
            return;
        }

        if (State.users.some(u => u.user.toLowerCase() === username.toLowerCase())) {
            this.showMessage('Já existe um usuário com esse nome.');
            return;
        }

        State.addUser({ user: username, pass: password, role });
        this.renderUserList();
        this.hideForm();
    },

    removeUser(index) {
        const user = State.users[index];
        if (!user || user.user === State.currentUser) return;

        if (!confirm(`Remover o usuário ${user.user}?`)) return;

        State.removeUser(index);
        this.renderUserList();
    },

    showMessage(msg) {
        DOM.adminFormMessage.textContent = msg;
        DOM.adminFormMessage.classList.remove('hidden');
    }
};

// ============================================================
// EVENT LISTENERS
// ============================================================

// Modal
DOM.modalClose.addEventListener('click', () => Modal.close());
DOM.modalOverlay.addEventListener('click', (e) => {
    if (e.target === DOM.modalOverlay) Modal.close();
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') Modal.close();
});

// Project
DOM.addItemBtn.addEventListener('click', () => Project.addItem());
DOM.showResultsBtn.addEventListener('click', () => Project.showResults());
DOM.openResultsBtn.addEventListener('click', () => Project.showResults());
DOM.backTrechosBtn.addEventListener('click', () => Project.backToTrechos());
DOM.resetProjectBtn.addEventListener('click', () => Project.reset());
DOM.sendWhatsappBtn.addEventListener('click', sendToWhatsapp);

// Auth
DOM.loginSubmit.addEventListener('click', () => Auth.login());
DOM.loginPassword.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') Auth.login();
});
DOM.loginUsername.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') DOM.loginPassword.focus();
});

// Admin
DOM.adminAddUserBtn.addEventListener('click', () => Admin.showForm());
DOM.adminFormSave.addEventListener('click', () => Admin.saveUser());
DOM.adminFormCancel.addEventListener('click', () => Admin.hideForm());

// ============================================================
// INITIALIZATION
// ============================================================

async function initializeApp() {
    document.body.classList.add('locked');
    State.loadUsers();
    await State.loadMaterialCatalog();
    Catalog.render();
    Project.updateUI();
}

initializeApp();