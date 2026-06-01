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
    users: [
        { user: 'Nikolas', pass: '4x%t7kADM', role: 'admin' },
        { user: 'Goes', pass: 'senha123', role: 'admin' },
        { user: 'maria', pass: 'kts2026', role: 'user' }
    ],

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

    addUser(user) {
        this.users.push(user);
    },

    removeUser(index) {
        this.users.splice(index, 1);
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
                .map(([key, value]) => `${key}: ${value}`)
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

        State.projectItems.forEach(item => {
            const key = `${item.type}`;
            const data = this.getMaterialData(item.type);

            if (!materials[key]) {
                materials[key] = { ...data, quantity: 0 };
            }

            this.calculateQuantity(item, materials[key]);
        });

        return Object.values(materials)
            .sort((a, b) => a.name.localeCompare(b.name));
    },

    getMaterialData(type) {
        const map = {
            'ELETRODUTO_34_CONCRETO': { name: 'Eletroduto 3/4" - Concreto', unit: 'metro' },
            'ELETRODUTO_34_DRYWALL': { name: 'Eletroduto 3/4" - Drywall', unit: 'metro' },
            'ELETRODUTO_34_METALICA': { name: 'Eletroduto 3/4" - Metálica', unit: 'metro' },
            'ELETRODUTO_1_CONCRETO': { name: 'Eletroduto 1" - Concreto', unit: 'metro' },
            'ELETRODUTO_1_DRYWALL': { name: 'Eletroduto 1" - Drywall', unit: 'metro' },
            'ELETRODUTO_1_METALICA': { name: 'Eletroduto 1" - Metálica', unit: 'metro' },
            'ELETRODUTO_2_CONCRETO': { name: 'Eletroduto 2" - Concreto', unit: 'metro' },
            'ELETRODUTO_2_DRYWALL': { name: 'Eletroduto 2" - Drywall', unit: 'metro' },
            'ELETRODUTO_2_METALICA': { name: 'Eletroduto 2" - Metálica', unit: 'metro' },
            'DUTOS_ENTERRADOS': { name: 'Dutos Enterrados', unit: 'metro' },
            'CALHA_MF_CONCRETO': { name: 'Eletrocalha - Mão Francesa', unit: 'metro' },
            'CALHA_CABO': { name: 'Eletrocalha - Suspensa Cabo de Aço', unit: 'metro' },
            'CALHA_IGREJINHA': { name: 'Eletrocalha - Igrejinha + Barra', unit: 'metro' },
            'CALHA_GRAMPO': { name: 'Eletrocalha - Grampo C', unit: 'metro' },
            'PERFILADO_MF_CONCRETO': { name: 'Perfilado - Mão Francesa', unit: 'metro' },
            'PERFILADO_GRAMPO': { name: 'Perfilado - Grampo C + Balancim', unit: 'metro' },
            'PERFILADO_BARRA': { name: 'Perfilado - Chumbador + Barra', unit: 'metro' }
        };

        return map[type] || { name: type, unit: 'unidade', quantity: 0 };
    },

    calculateQuantity(item, material) {
        if (item.type === 'DUTOS_ENTERRADOS') {
            material.quantity += item.m_34 + item.m_1 + item.m_2 + (item.caixas || 0) * 0.5;
        } else if (item.type.includes('CALHA') || item.type.includes('PERFILADO')) {
            material.quantity += item.metros + (item.emendas || 0) * 0.3 + (item.apoios || 0) * 0.2;
        } else {
            material.quantity += item.metros + item.curvas * 0.5 + (item.conduletes || 0) * 0.1;
        }

        material.quantity = Math.round(material.quantity * 100) / 100;
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

    let texto = '*KTS - Lista de Materiais*%0A%0A';
    rows.forEach(row => {
        texto += `• ${row.name} | ${row.unit} | ${row.quantity}%0A`;
    });

    const obsText = DOM.projectObs.value.trim();
    if (obsText) {
        texto += `%0A*OBSERVAÇÕES*%0A${obsText}`;
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

document.body.classList.add('locked');
Catalog.render();
Project.updateUI();