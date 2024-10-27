// Dados do usuário
let userData = {
    points: 350,
    level: 'Bronze',
    badges: {
        firstAid: { name: 'Primeiro Socorro', count: 5, unlocked: true },
        superHelper: { name: 'Super Helper', count: 0, unlocked: false },
        donor: { name: 'Doador', count: 10, unlocked: true }
    },
    activities: []
};

// Níveis e pontos necessários
const levels = {
    'Bronze': { min: 0, max: 500 },
    'Prata': { min: 501, max: 1000 },
    'Ouro': { min: 1001, max: 2000 },
    'Platina': { min: 2001, max: Infinity }
};

// Função para atualizar pontos e nível
function updatePoints(points) {
    userData.points += points;
    updateLevel();
    updateUI();
    saveProgress();
}

// Função para atualizar o nível baseado nos pontos
function updateLevel() {
    for (const [level, range] of Object.entries(levels)) {
        if (userData.points >= range.min && userData.points <= range.max) {
            userData.level = level;
            break;
        }
    }
}

// Função para adicionar nova atividade
function addActivity(activity, points) {
    const newActivity = {
        description: activity,
        points: points,
        date: new Date().toLocaleDateString()
    };
    
    userData.activities.unshift(newActivity);
    if (userData.activities.length > 5) {
        userData.activities.pop();
    }
    
    updatePoints(points);
}

// Função para verificar e desbloquear conquistas
function checkBadges() {
    // Verificar Primeiro Socorro
    if (countActivityType('socorro') >= 5) {
        userData.badges.firstAid.unlocked = true;
    }
    
    // Verificar Super Helper
    if (countActivityType('ajuda') >= 20) {
        userData.badges.superHelper.unlocked = true;
    }
    
    // Verificar Doador
    if (countActivityType('doacao') >= 10) {
        userData.badges.donor.unlocked = true;
    }
    
    updateUI();
}

// Função para contar atividades por tipo
function countActivityType(type) {
    return userData.activities.filter(activity => 
        activity.description.toLowerCase().includes(type)
    ).length;
}

// Função para atualizar a interface
function updateUI() {
    // Atualizar pontos
    document.querySelector('.points-number').textContent = userData.points;
    
    // Atualizar nível
    document.querySelector('.points-display h3').textContent = `Nível: Voluntário ${userData.level}`;
    
    // Atualizar badges
    updateBadges();
    
    // Atualizar lista de atividades
    updateActivitiesList();
}

// Função para atualizar badges na UI
function updateBadges() {
    const badgeGrid = document.querySelector('.badge-grid');
    badgeGrid.innerHTML = '';
    
    for (const [key, badge] of Object.entries(userData.badges)) {
        const badgeElement = document.createElement('div');
        badgeElement.className = `badge ${!badge.unlocked ? 'badge-locked' : ''}`;
        badgeElement.innerHTML = `
            <div class="badge-icon">${getBadgeIcon(key)}</div>
            <h4>${badge.name}</h4>
            <p>${badge.count}/${getBadgeTarget(key)} ${getBadgeType(key)}</p>
        `;
        badgeGrid.appendChild(badgeElement);
    }
}

// Função para atualizar lista de atividades
function updateActivitiesList() {
    const activityList = document.querySelector('.activity-list');
    activityList.innerHTML = '';
    
    userData.activities.forEach(activity => {
        const li = document.createElement('li');
        li.className = 'activity-item';
        li.innerHTML = `
            <span>${activity.description}</span>
            <span>+${activity.points} pontos</span>
        `;
        activityList.appendChild(li);
    });
}

// Função para salvar progresso no localStorage
function saveProgress() {
    localStorage.setItem('volunteerData', JSON.stringify(userData));
}

// Função para carregar progresso do localStorage
function loadProgress() {
    const saved = localStorage.getItem('volunteerData');
    if (saved) {
        userData = JSON.parse(saved);
        updateUI();
    }
}

// Funções auxiliares
function getBadgeIcon(badge) {
    const icons = {
        firstAid: '🎯',
        superHelper: '🌟',
        donor: '📦'
    };
    return icons[badge] || '🏆';
}

function getBadgeTarget(badge) {
    const targets = {
        firstAid: 5,
        superHelper: 20,
        donor: 10
    };
    return targets[badge] || 0;
}

function getBadgeType(badge) {
    const types = {
        firstAid: 'assistências',
        superHelper: 'assistências',
        donor: 'doações'
    };
    return types[badge] || 'atividades';
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    loadProgress();
    
    // Adicionar botões de ação
    const actionButtons = `
        <div class="action-buttons">
            <button onclick="registerActivity('socorro')">Registrar Socorro</button>
            <button onclick="registerActivity('doacao')">Registrar Doação</button>
            <button onclick="registerActivity('distribuicao')">Registrar Distribuição</button>
        </div>
    `;
    
    document.querySelector('.volunteer-card').insertAdjacentHTML('beforeend', actionButtons);
});

// Função para registrar atividade
function registerActivity(type) {
    const activities = {
        socorro: { desc: 'Ajuda no Socorro', points: 50 },
        doacao: { desc: 'Doação Realizada', points: 30 },
        distribuicao: { desc: 'Distribuição de Suprimentos', points: 40 }
    };
    
    const activity = activities[type];
    if (activity) {
        addActivity(activity.desc, activity.points);
        checkBadges();
    }
}

// Sistema de autenticação
let currentUser = null;
        
function toggleAuth() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (loginForm.style.display === 'none') {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    }
}

function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Verificar no localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        document.getElementById('authContainer').style.display = 'none';
        loadUserData();
    } else {
        alert('Email ou senha incorretos!');
    }
}

function register() {
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    if (users.some(u => u.email === email)) {
        alert('Email já cadastrado!');
        return;
    }
    
    const newUser = {
        name,
        email,
        password,
        userData: {
            points: 0,
            level: 'Bronze',
            badges: {
                firstAid: { name: 'Primeiro Socorro', count: 0, unlocked: false },
                superHelper: { name: 'Super Helper', count: 0, unlocked: false },
                donor: { name: 'Doador', count: 0, unlocked: false }
            },
            activities: []
        }
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    currentUser = newUser;
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    document.getElementById('authContainer').style.display = 'none';
    loadUserData();
}

// Função para mostrar modal de level up
function showLevelUpModal(newLevel) {
    const modal = document.createElement('div');
    modal.className = 'level-up-modal';
    modal.innerHTML = `
        <div class="emoji">🎉</div>
        <h2>Parabéns!</h2>
        <p>Você alcançou o nível ${newLevel}!</p>
        <button onclick="this.parentElement.remove()">Fechar</button>
    `;
    document.body.appendChild(modal);
    
    // Remove modal após 5 segundos
    setTimeout(() => modal.remove(), 5000);
}

// Função para mostrar notificação de conquista
function showBadgeNotification(badgeName) {
    const notification = document.createElement('div');
    notification.className = 'level-up-modal';
    notification.innerHTML = `
        <div class="emoji">🏆</div>
        <h2>Nova Conquista!</h2>
        <p>Você desbloqueou: ${badgeName}</p>
        <button onclick="this.parentElement.remove()">Fechar</button>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 5000);
}

// Modificar a função updateLevel para incluir notificação
function updateLevel() {
    const oldLevel = currentUser.userData.level;
    
    for (const [level, range] of Object.entries(levels)) {
        if (currentUser.userData.points >= range.min && currentUser.userData.points <= range.max) {
            if (oldLevel !== level) {
                currentUser.userData.level = level;
                showLevelUpModal(level);
            }
            break;
        }
    }
}

// Modificar a função checkBadges para incluir notificações
function checkBadges() {
    const badges = currentUser.userData.badges;
    
    // Verificar Primeiro Socorro
    if (countActivityType('socorro') >= 5 && !badges.firstAid.unlocked) {
        badges.firstAid.unlocked = true;
        showBadgeNotification('Primeiro Socorro');
    }
    
    // Verificar Super Helper
    if (countActivityType('ajuda') >= 20 && !badges.superHelper.unlocked) {
        badges.superHelper.unlocked = true;
        showBadgeNotification('Super Helper');
    }
    
    // Verificar Doador
    if (countActivityType('doacao') >= 10 && !badges.donor.unlocked) {
        badges.donor.unlocked = true;
        showBadgeNotification('Doador');
    }
    
    updateUI();
    saveProgress();
}

// Modificar função saveProgress para salvar no usuário correto
function saveProgress() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.email === currentUser.email);
    
    if (userIndex !== -1) {
        users[userIndex].userData = currentUser.userData;
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
}

// Carregar dados do usuário atual
function loadUserData() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        userData = currentUser.userData;
        updateUI();
    }
}

// Verificar autenticação ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        document.getElementById('authContainer').style.display = 'none';
        loadUserData();
    }
});