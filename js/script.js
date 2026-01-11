// ===== SYSTÈME D'AUTHENTIFICATION =====

// Dados de usuários (simulado com localStorage)
const USERS_STORAGE_KEY = 'sports_users';
const CURRENT_USER_KEY = 'sports_current_user';
const REMEMBER_ME_KEY = 'sports_remember_me';

// Utilisateur de test par défaut
function initializeDefaultUser() {
    const users = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY)) || [];
    
    // Vérifier si l'utilisateur de test existe déjà
    if (!users.find(u => u.email === 'user@example.com')) {
        users.push({
            id: 1,
            fullname: 'João Silva',
            email: 'user@example.com',
            password: '123456' // Simples para demonstração
        });
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    }
}

// Registrar novo usuário
function registerUser(fullname, email, password, profileData = {}) {
    const users = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY)) || [];
    
    // Verificar se o email já existe
    if (users.find(u => u.email === email)) {
        return { success: false, message: 'Cet email est déjà enregistré!' };
    }
    
    // Ajouter un nouvel utilisateur
    const newUser = {
        id: users.length + 1,
        fullname: fullname,
        email: email,
        password: password,
        position: profileData.position || '',
        shirtnumber: profileData.shirtnumber || '',
        memberSince: profileData.memberSince || '',
        experience: profileData.experience || '',
        specialties: profileData.specialties || []
    };
    
    users.push(newUser);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    
    return { success: true, message: 'Compte créé avec succès!' };
}

// Se connecter
function loginUser(email, password) {
    const users = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY)) || [];
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
        return { success: false, message: 'Email ou mot de passe incorrect!' };
    }
    
    // Enregistrer l'utilisateur connecté
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({
        id: user.id,
        fullname: user.fullname,
        email: user.email
    }));
    
    return { success: true, message: 'Connexion réussie!' };
}

// Vérifier si l'utilisateur est connecté
function isUserLoggedIn() {
    return localStorage.getItem(CURRENT_USER_KEY) !== null;
}

// Obtenir l'utilisateur actuel
function getCurrentUser() {
    const userJson = localStorage.getItem(CURRENT_USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
}

// Se déconnecter
function logout() {
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem(REMEMBER_ME_KEY);
    window.location.href = 'index.html';
}

// Connexion en tant qu'invité
function loginAsGuest(e) {
    e.preventDefault();
    
    // Salvar usuário visitante
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({
        id: 0,
        fullname: 'Visitante',
        email: 'visitante@example.com'
    }));
    
    // Redirecionar para dashboard
    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 500);
}

// ===== FONCTIONS DE FORMULAIRE =====

document.addEventListener('DOMContentLoaded', function() {
    // Initialiser l'utilisateur par défaut
    initializeDefaultUser();
    
    // Vérifier si l'utilisateur est connecté (s'il est sur dashboard.html)
    const isDashboard = window.location.pathname.includes('dashboard.html');
    if (isDashboard && !isUserLoggedIn()) {
        window.location.href = 'index.html';
    }
    
    // Vérifier "Se souvenir de moi"
    if (window.location.pathname.includes('index.html')) {
        const rememberMe = localStorage.getItem(REMEMBER_ME_KEY);
        if (rememberMe) {
            const savedUser = JSON.parse(rememberMe);
            document.getElementById('email').value = savedUser.email;
            document.getElementById('remember').checked = true;
        }
    }
    
    // Remplir les informations de profil dans le tableau de bord
    if (isDashboard) {
        updateDashboardInfo();
    }
    
    // Écouteurs d'événements pour les formulaires
    setupFormListeners();
});

// Mettre à jour les informations sur le tableau de bord
function updateDashboardInfo() {
    const currentUser = getCurrentUser();
    if (currentUser) {
        document.getElementById('welcomeText').textContent = `Bienvenue, ${currentUser.fullname}!`;
        document.getElementById('profileName').textContent = currentUser.fullname;
        document.getElementById('profileEmail').textContent = currentUser.email;
        
        // Charger les performances de l'utilisateur
        loadUserPerformance();
        
        // Charger les performances du profil
        loadProfilePerformance();
    }
}

// Configurer les écouteurs d'événements des formulaires
function setupFormListeners() {
    // Formulaire de connexion
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Formulaire d'inscription
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
    
    // Formulaire de récupération de mot de passe
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', handleForgotPassword);
    }
}

// Gérer la connexion
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember').checked;
    
    // Validação básica
    if (!email || !password) {
        showError('emailError', 'Remplissez tous les champs');
        return;
    }
    
    if (!validateEmail(email)) {
        showError('emailError', 'Email invalide');
        return;
    }
    
    // Essayer de se connecter
    const result = loginUser(email, password);
    
    if (result.success) {
        // Enregistrer "Se souvenir de moi"
        if (remember) {
            localStorage.setItem(REMEMBER_ME_KEY, JSON.stringify({ email: email }));
        } else {
            localStorage.removeItem(REMEMBER_ME_KEY);
        }
        
        // Afficher la fenêtre modale de performance
        setTimeout(() => {
            document.getElementById('performanceModal').classList.remove('hidden');
        }, 300);
    } else {
        showError('emailError', result.message);
    }
}

// Gérer l'inscription
function handleSignup(e) {
    e.preventDefault();
    
    const fullname = document.getElementById('fullname').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const position = document.getElementById('position').value;
    const shirtnumber = document.getElementById('shirtnumber').value;
    const memberSince = document.getElementById('memberSince').value;
    const experienceValue = document.getElementById('experienceValue').value;
    
    // Collecter les spécialités
    const specialtiesCheckboxes = document.querySelectorAll('input[name="specialties"]:checked');
    const specialties = Array.from(specialtiesCheckboxes).map(cb => cb.value);
    
    // Validações - apenas campos obrigatórios
    if (!fullname || !email || !password || !confirmPassword) {
        showSignupMessage('Veuillez remplir tous les champs obligatoires', 'error')
        return;
    }
    
    if (!validateEmail(email)) {
        showSignupMessage('Email invalide', 'error');
        return;
    }
    
    if (password.length < 6) {
        showSignupMessage('Le mot de passe doit avoir au moins 6 caractères', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showSignupMessage('Les mots de passe ne correspondent pas', 'error');
        return;
    }
    
    // Préparer les données de profil
    const profileData = {
        position: position,
        shirtnumber: shirtnumber,
        memberSince: memberSince,
        experience: experienceValue,
        specialties: specialties
    };
    
    // Essayer de s'inscrire
    const result = registerUser(fullname, email, password, profileData);
    
    if (result.success) {
        showSignupMessage(result.message, 'success');
        setTimeout(() => {
            closeSignup();
            // Remplir l'email dans le formulaire de connexion
            document.getElementById('email').value = email;
            document.getElementById('password').value = '';
        }, 1000);
    } else {
        showSignupMessage(result.message, 'error');
    }
}

// Gérer la récupération de mot de passe
function handleForgotPassword(e) {
    e.preventDefault();
    
    const resetEmail = document.getElementById('resetEmail').value.trim();
    
    if (!resetEmail || !validateEmail(resetEmail)) {
        showForgotMessage('Email invalide', 'error');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY)) || [];
    const userExists = users.find(u => u.email === resetEmail);
    
    if (!userExists) {
        showForgotMessage('Email non trouvé', 'error');
        return;
    }
    
    showForgotMessage('Lien de récupération envoyé! (Simulé)', 'success');
    setTimeout(() => {
        closeForgotPassword();
    }, 1500);
}

// ===== MODALES ET MESSAGES =====

function showForgotPassword(e) {
    e.preventDefault();
    document.getElementById('forgotPasswordModal').classList.remove('hidden');
}

function closeForgotPassword() {
    document.getElementById('forgotPasswordModal').classList.add('hidden');
    document.getElementById('forgotPasswordForm').reset();
    document.getElementById('forgotMessage').textContent = '';
}

function showSignup(e) {
    e.preventDefault();
    document.getElementById('signupModal').classList.remove('hidden');
}

function closeSignup() {
    document.getElementById('signupModal').classList.add('hidden');
    document.getElementById('signupForm').reset();
    document.getElementById('signupMessage').textContent = '';
}

function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.color = '#F85149';
    }
}

function showForgotMessage(message, type) {
    const messageElement = document.getElementById('forgotMessage');
    messageElement.textContent = message;
    messageElement.className = `modal-message ${type}`;
}

function showSignupMessage(message, type) {
    const messageElement = document.getElementById('signupMessage');
    messageElement.textContent = message;
    messageElement.className = `modal-message ${type}`;
}

// ===== FONCTIONNALITÉS DU TABLEAU DE BORD =====

function switchTab(tabName, e) {
    if (e) e.preventDefault();
    
    // Remover active de todos os tabs
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // Adicionar active ao tab selecionado
    const selectedTab = document.getElementById(tabName);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Remover active de todos os links de navegação
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => link.classList.remove('active'));
    
    // Adicionar active ao link clicado
    event.target.classList.add('active');
    
    // Carregar dados específicos de cada aba
    if (tabName === 'ranking') {
        displayRanking();
    } else if (tabName === 'profile') {
        loadProfilePerformance();
        updateProfileStats();
        updateAdvancedStats();
        displayUserBadges();
    } else if (tabName === 'overview') {
        updateAdvancedStats();
    }
}

// ===== UTILITAIRES =====

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Fechar modais ao clicar fora
window.addEventListener('click', function(event) {
    const forgotModal = document.getElementById('forgotPasswordModal');
    const signupModal = document.getElementById('signupModal');
    
    if (event.target === forgotModal) {
        closeForgotPassword();
    }
    
    if (event.target === signupModal) {
        closeSignup();
    }
});

// Efeito de animação nas bolas de vôlei
window.addEventListener('mousemove', function(e) {
    const volleyballs = document.querySelectorAll('.volleyball');
    volleyballs.forEach((ball, index) => {
        const speed = (index + 1) * 0.02;
        ball.style.transform = `translate(${e.clientX * speed}px, ${e.clientY * speed}px)`;
    });
});

// ===== SISTEMA DE AVALIAÇÃO DE TREINO =====

function openRatingModal(trainingName) {
    document.getElementById('ratingModal').classList.remove('hidden');
    document.getElementById('ratingTitle').textContent = trainingName;
    document.getElementById('ratingForm').reset();
    document.getElementById('ratingValue').value = '0';
    resetStars();
}

function closeRatingModal() {
    document.getElementById('ratingModal').classList.add('hidden');
    document.getElementById('ratingMessage').textContent = '';
}

function setRating(rating) {
    document.getElementById('ratingValue').value = rating;
    
    // Atualizar visual das estrelas
    const stars = document.querySelectorAll('.star');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

function resetStars() {
    document.querySelectorAll('.star').forEach(star => {
        star.classList.remove('active');
    });
}

// Lidar com submissão de avaliação
document.addEventListener('DOMContentLoaded', function() {
    const ratingForm = document.getElementById('ratingForm');
    if (ratingForm) {
        ratingForm.addEventListener('submit', handleRatingSubmit);
    }
});

function handleRatingSubmit(e) {
    e.preventDefault();
    
    const rating = document.getElementById('ratingValue').value;
    const comment = document.getElementById('ratingComment').value;
    
    if (rating === '0') {
        showRatingMessage('Por favor, selecione uma nota!', 'error');
        return;
    }
    
    // Salvar avaliação
    const ratings = JSON.parse(localStorage.getItem('training_ratings')) || [];
    ratings.push({
        trainingName: document.getElementById('ratingTitle').textContent,
        rating: rating,
        comment: comment,
        date: new Date().toLocaleDateString('pt-BR')
    });
    localStorage.setItem('training_ratings', JSON.stringify(ratings));
    
    showRatingMessage('Avaliação registrada com sucesso! 🎉', 'success');
    setTimeout(() => {
        closeRatingModal();
    }, 1500);
}

function showRatingMessage(message, type) {
    const messageElement = document.getElementById('ratingMessage');
    messageElement.textContent = message;
    messageElement.className = `modal-message ${type}`;
}

// ===== INSCRIÇÃO DE PESSOA DE FORA =====

function openGuestSignupModal() {
    document.getElementById('guestSignupModal').classList.remove('hidden');
}

function closeGuestSignupModal() {
    document.getElementById('guestSignupModal').classList.add('hidden');
    document.getElementById('guestSignupForm').reset();
    document.getElementById('guestSignupMessage').textContent = '';
}

function showEditProfileModal() {
    const currentUser = JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || '{}');
    
    if (currentUser.email === 'guest@tcs.local') {
        showNotification('⚠️ Convidados não podem editar perfil', true);
        return;
    }

    // Preencher o formulário com os dados atuais
    document.getElementById('editPosition').value = currentUser.position || '';
    document.getElementById('editShirtnumber').value = currentUser.shirtnumber || '';
    document.getElementById('editMemberSince').value = currentUser.memberSince || '';
    document.getElementById('editExperienceValue').value = currentUser.experience || '';
    document.getElementById('editInstagram').value = currentUser.instagram || '';
    document.getElementById('editWhatsApp').value = currentUser.whatsapp || '';
    document.getElementById('editEmail').value = currentUser.socialEmail || '';

    // Desmarcar todas as checkboxes
    const specialtiesCheckboxes = document.querySelectorAll('input[name="editSpecialties"]');
    specialtiesCheckboxes.forEach(cb => cb.checked = false);

    // Marcar as especialidades do usuário
    if (currentUser.specialties && currentUser.specialties.length > 0) {
        currentUser.specialties.forEach(specialty => {
            const checkbox = document.querySelector(`input[name="editSpecialties"][value="${specialty}"]`);
            if (checkbox) checkbox.checked = true;
        });
    }

    document.getElementById('editProfileModal').classList.remove('hidden');
}

function closeEditProfileModal() {
    document.getElementById('editProfileModal').classList.add('hidden');
    document.getElementById('editProfileForm').reset();
}

// Lidar com submissão de inscrição de pessoa de fora
document.addEventListener('DOMContentLoaded', function() {
    const guestForm = document.getElementById('guestSignupForm');
    if (guestForm) {
        guestForm.addEventListener('submit', handleGuestSignup);
    }
    
    const editProfileForm = document.getElementById('editProfileForm');
    if (editProfileForm) {
        editProfileForm.addEventListener('submit', handleEditProfile);
    }
});

function handleGuestSignup(e) {
    e.preventDefault();
    
    const guestName = document.getElementById('guestName').value.trim();
    const guestEmail = document.getElementById('guestEmail').value.trim();
    const guestPhone = document.getElementById('guestPhone').value.trim();
    const trainingDay = document.getElementById('trainingDay').value;
    const guestMessage = document.getElementById('guestMessage').value.trim();
    
    // Validações
    if (!guestName || !guestEmail || !guestPhone || !trainingDay) {
        showGuestSignupMessage('Por favor, preencha todos os campos obrigatórios!', 'error');
        return;
    }
    
    if (!validateEmail(guestEmail)) {
        showGuestSignupMessage('Email inválido!', 'error');
        return;
    }
    
    // Salvar inscrição
    const guestSignups = JSON.parse(localStorage.getItem('guest_signups')) || [];
    guestSignups.push({
        name: guestName,
        email: guestEmail,
        phone: guestPhone,
        trainingDay: trainingDay,
        message: guestMessage,
        date: new Date().toLocaleDateString('pt-BR'),
        time: new Date().toLocaleTimeString('pt-BR')
    });
    localStorage.setItem('guest_signups', JSON.stringify(guestSignups));
    
    showGuestSignupMessage('Inscription reçue! Nous vous contacterons bientôt! 🎉', 'success');
    setTimeout(() => {
        closeGuestSignupModal();
    }, 2000);
}

function showGuestSignupMessage(message, type) {
    const messageElement = document.getElementById('guestSignupMessage');
    messageElement.textContent = message;
    messageElement.className = `modal-message ${type}`;
}

// ===== AVALIAÇÃO DE DESEMPENHO AO LOGIN =====

function selectPerformance(value, element) {
    // Remover seleção anterior
    document.querySelectorAll('.performance-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    
    // Adicionar seleção ao elemento clicado
    element.classList.add('selected');
    element.querySelector('input[type="radio"]').checked = true;
}

// Lidar com submissão de desempenho
document.addEventListener('DOMContentLoaded', function() {
    const performanceForm = document.getElementById('performanceForm');
    if (performanceForm) {
        performanceForm.addEventListener('submit', handlePerformanceSubmit);
    }
});

function handlePerformanceSubmit(e) {
    e.preventDefault();
    
    const performance = document.querySelector('input[name="performance"]:checked').value;
    const currentUser = getCurrentUser();
    
    // Salvar avaliação de desempenho
    const performanceRecords = JSON.parse(localStorage.getItem('performance_records')) || [];
    performanceRecords.push({
        user: currentUser.fullname,
        email: currentUser.email,
        performance: performance,
        date: new Date().toLocaleDateString('pt-BR'),
        time: new Date().toLocaleTimeString('pt-BR')
    });
    localStorage.setItem('performance_records', JSON.stringify(performanceRecords));
    
    // Redirecionar para dashboard
    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 500);
}

// ===== DESEMPENHO DO USUÁRIO =====
const USER_PERFORMANCE_KEY = 'user_performance';

function setUserPerformance(level, percentage) {
    const currentUser = getCurrentUser();
    console.log('setUserPerformance called with:', level, percentage);
    console.log('currentUser:', currentUser);
    
    if (!currentUser) {
        alert('Veuillez vous connecter pour enregistrer votre performance!');
        return;
    }
    
    const performances = JSON.parse(localStorage.getItem(USER_PERFORMANCE_KEY)) || {};
    
    const performanceMap = {
        'otimo': { text: 'Vous êtes en excellent forme! 💪', level: 'Excellent' },
        'bom': { text: 'Vous avez une bonne performance! 👍', level: 'Bien' },
        'regular': { text: 'Votre performance est acceptable. 🤔', level: 'Acceptable' },
        'precisa': { text: 'Vous avez besoin de vous entraîner plus! 💪', level: 'À améliorer' }
    };
    
    performances[currentUser.email] = {
        level: level,
        percentage: percentage,
        text: performanceMap[level].text,
        displayLevel: performanceMap[level].level
    };
    
    localStorage.setItem(USER_PERFORMANCE_KEY, JSON.stringify(performances));
    console.log('Performance saved:', performances);
    updatePerformanceDisplay();
}

function loadUserPerformance() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    const performances = JSON.parse(localStorage.getItem(USER_PERFORMANCE_KEY)) || {};
    const userPerf = performances[currentUser.email];
    
    if (userPerf) {
        updatePerformanceBar(userPerf.percentage, userPerf.text);
    } else {
        document.getElementById('performanceBar').style.width = '0%';
        document.getElementById('performanceText').textContent = 'Selecione seu desempenho';
    }
}

function updatePerformanceDisplay() {
    loadUserPerformance();
}

function updatePerformanceBar(percentage, text) {
    const bar = document.getElementById('performanceBar');
    const textEl = document.getElementById('performanceText');
    
    if (bar && textEl) {
        bar.style.width = percentage + '%';
        textEl.textContent = text;
    }
}

function loadProfilePerformance() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    const performances = JSON.parse(localStorage.getItem(USER_PERFORMANCE_KEY)) || {};
    const userPerf = performances[currentUser.email];
    const profilePerfElement = document.getElementById('profilePerformance');
    
    if (profilePerfElement) {
        if (userPerf) {
            profilePerfElement.textContent = userPerf.displayLevel;
        } else {
            profilePerfElement.textContent = '-';
        }
    }
    
    // Exibir redes sociais
    displaySocialMedia();
    
    // Exibir badges
    displayUserBadges();
    
    // Atualizar estatísticas
    updateProfileStats();
    
    // Atualizar estatísticas avançadas
    updateAdvancedStats();
}

// ========================================
// EDIT PROFILE
// ========================================
function handleEditProfile(e) {
    e.preventDefault();

    const position = document.getElementById('editPosition').value;
    const shirtnumber = document.getElementById('editShirtnumber').value;
    const memberSince = document.getElementById('editMemberSince').value;
    const experienceValue = document.getElementById('editExperienceValue').value;
    const instagram = document.getElementById('editInstagram').value;
    const whatsapp = document.getElementById('editWhatsApp').value;
    const email = document.getElementById('editEmail').value;
    const errorDiv = document.getElementById('editProfileError');

    // Não é obrigatório preencher nenhum campo - todos são opcionais
    const specialtiesCheckboxes = document.querySelectorAll('input[name="editSpecialties"]:checked');
    const specialties = Array.from(specialtiesCheckboxes).map(cb => cb.value);

    // Obter usuário atual
    const currentUser = JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || '{}');

    // Atualizar usuário no localStorage
    const users = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
    const userIndex = users.findIndex(u => u.email === currentUser.email);

    if (userIndex !== -1) {
        users[userIndex].position = position;
        users[userIndex].shirtnumber = shirtnumber;
        users[userIndex].memberSince = memberSince;
        users[userIndex].experience = experienceValue;
        users[userIndex].specialties = specialties;
        users[userIndex].instagram = instagram;
        users[userIndex].whatsapp = whatsapp;
        users[userIndex].socialEmail = email;

        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

        // Atualizar usuário atual em sessão
        currentUser.position = position;
        currentUser.shirtnumber = shirtnumber;
        currentUser.memberSince = memberSince;
        currentUser.experience = experienceValue;
        currentUser.specialties = specialties;
        currentUser.instagram = instagram;
        currentUser.whatsapp = whatsapp;
        currentUser.socialEmail = email;

        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));

        // Atualizar a visualização do perfil
        updateDashboardInfo();
        displaySocialMedia();

        showNotification('✅ Profil mis à jour avec succès!');
        closeEditProfileModal();
    } else {
        showError(errorDiv, 'Erreur lors de la mise à jour du profil');
    }
}

// Exibir redes sociais
function displaySocialMedia() {
    const currentUser = getCurrentUser();
    const socialDiv = document.getElementById('socialMediaDisplay');
    
    if (!socialDiv) return;
    
    socialDiv.innerHTML = '';
    
    if (currentUser.instagram) {
        const link = document.createElement('a');
        link.href = `https://instagram.com/${currentUser.instagram.replace('@', '')}`;
        link.target = '_blank';
        link.style.cssText = 'display: inline-block; padding: 8px 12px; background: rgba(225, 48, 108, 0.2); color: #E1306C; border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: 600;';
        link.textContent = `📱 ${currentUser.instagram}`;
        socialDiv.appendChild(link);
    }
    
    if (currentUser.whatsapp) {
        const link = document.createElement('a');
        link.href = `https://wa.me/${currentUser.whatsapp.replace(/\D/g, '')}`;
        link.target = '_blank';
        link.style.cssText = 'display: inline-block; padding: 8px 12px; background: rgba(37, 211, 102, 0.2); color: #25D366; border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: 600;';
        link.textContent = `💬 WhatsApp`;
        socialDiv.appendChild(link);
    }
    
    if (currentUser.socialEmail) {
        const link = document.createElement('a');
        link.href = `mailto:${currentUser.socialEmail}`;
        link.style.cssText = 'display: inline-block; padding: 8px 12px; background: rgba(255, 107, 53, 0.2); color: var(--primary-orange); border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: 600;';
        link.textContent = `📧 Email`;
        socialDiv.appendChild(link);
    }
}

// Funções para adicionar redes sociais
function addInstagram() {
    const currentUser = getCurrentUser();
    const instagram = prompt('Entrez votre pseudo Instagram (ex: @votre_utilisateur):');
    
    if (instagram) {
        currentUser.instagram = instagram;
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
        
        const users = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY));
        const userIndex = users.findIndex(u => u.email === currentUser.email);
        if (userIndex !== -1) {
            users[userIndex].instagram = instagram;
            localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
        }
        
        displaySocialMedia();
        showNotification('✅ Instagram ajouté!');
    }
}

function addWhatsApp() {
    const currentUser = getCurrentUser();
    const whatsapp = prompt('Entrez votre numéro WhatsApp (ex: +594 594 XX XX XX):');
    
    if (whatsapp) {
        currentUser.whatsapp = whatsapp;
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
        
        const users = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY));
        const userIndex = users.findIndex(u => u.email === currentUser.email);
        if (userIndex !== -1) {
            users[userIndex].whatsapp = whatsapp;
            localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
        }
        
        displaySocialMedia();
        showNotification('✅ WhatsApp ajouté!');
    }
}

function addEmail() {
    const currentUser = getCurrentUser();
    const email = prompt('Entrez votre email:');
    
    if (email && validateEmail(email)) {
        currentUser.socialEmail = email;
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
        
        const users = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY));
        const userIndex = users.findIndex(u => u.email === currentUser.email);
        if (userIndex !== -1) {
            users[userIndex].socialEmail = email;
            localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
        }
        
        displaySocialMedia();
        showNotification('✅ Email ajouté!');
    } else if (email) {
        showNotification('❌ Email invalide!');
    }
}

// Chamar displaySocialMedia ao atualizar o dashboard
function loadProfilePerformance() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    const performance = JSON.parse(localStorage.getItem(USER_PERFORMANCE_KEY) || '{}');
    const userPerformance = performance[currentUser.email] || 'Sans données';
    
    const performanceEl = document.getElementById('profilePerformance');
    if (performanceEl) {
        performanceEl.textContent = userPerformance;
    }
    
    // Exibir redes sociais
    displaySocialMedia();
}

// ========================================
// CONSEILS QUOTIDIENS ET MOTIVATION
// ========================================
const DAILY_TIPS = [
    "💪 Travaillez votre positionnement sur le terrain. Une bonne lecture du jeu est aussi importante que la technique!",
    "🎯 Concentrez-vous sur vos passes. Un bon passeur est l'âme de l'équipe au beach volley.",
    "🏐 N'oubliez pas de vous échauffer correctement avant chaque entraînement pour éviter les blessures.",
    "👥 La communication avec vos coéquipiers est essentielle. Parlez sur le terrain!",
    "⚡ Améliorez votre réactivité avec des exercices spécifiques de vitesse et de coordination.",
    "🌞 Hydratez-vous régulièrement, surtout lors des séances de beach volley sous le soleil.",
    "🎪 Travaillez votre service! Un bon service peut déséquilibrer l'équipe adverse.",
    "🤝 Entraînez-vous régulièrement avec les mêmes partenaires pour développer la chimie.",
    "💭 Analysez vos erreurs après chaque match pour progresser. La réflexion aide à l'apprentissage.",
    "🥇 Soyez compétitif mais fair-play. Le respect est la base du sport.",
    "🏃 La condition physique est essentielle. Entraînez votre cardio régulièrement!",
    "🧠 Étudiez le jeu adverse. Connaître les tactiques vous donne un avantage.",
    "⚖️ Équilibrez force et technique. Les deux sont nécessaires pour progresser.",
    "🎓 Ne cessez jamais d'apprendre. Demandez des conseils aux joueurs plus expérimentés.",
    "🌟 Ayez confiance en vous! La mentalité gagnante commence dans l'esprit."
];

function generateNewTip() {
    const randomTip = DAILY_TIPS[Math.floor(Math.random() * DAILY_TIPS.length)];
    const tipEl = document.getElementById('dailyTip');
    if (tipEl) {
        tipEl.textContent = randomTip;
    }
}

// Générer un conseil au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    generateNewTip();
});

// ========================================
// CLASSEMENT ET RANKING
// ========================================
function generateRankingData() {
    const users = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
    const performances = JSON.parse(localStorage.getItem(USER_PERFORMANCE_KEY) || '{}');
    const ratings = JSON.parse(localStorage.getItem(USER_RATINGS_KEY) || '{}');
    
    // Créer des données de classement
    const rankingData = users
        .filter(u => u.email !== 'user@example.com' && u.email !== 'guest@tcs.local')
        .map(user => {
            const perf = performances[user.email];
            let perfScore = 0;
            
            if (perf === 'Excellent') perfScore = 100;
            else if (perf === 'Bien') perfScore = 75;
            else if (perf === 'Acceptable') perfScore = 50;
            else if (perf === 'À améliorer') perfScore = 25;
            
            const userRatings = ratings[user.email] || [];
            const avgRating = userRatings.length > 0 
                ? userRatings.reduce((a, b) => a + b, 0) / userRatings.length 
                : 0;
            
            return {
                name: user.fullname,
                position: user.position || 'Non définie',
                performance: perf || 'Aucune',
                perfScore: perfScore,
                rating: avgRating.toFixed(1),
                participations: userRatings.length,
                email: user.email,
                shirtnumber: user.shirtnumber || '--'
            };
        })
        .sort((a, b) => {
            // Trier par score de performance, puis par évaluation
            if (b.perfScore !== a.perfScore) return b.perfScore - a.perfScore;
            return parseFloat(b.rating) - parseFloat(a.rating);
        });
    
    return rankingData;
}

function displayRanking() {
    const rankingData = generateRankingData();
    const topPlayersContainer = document.getElementById('topPlayersContainer');
    
    if (!topPlayersContainer) return;
    
    topPlayersContainer.innerHTML = '';
    
    if (rankingData.length === 0) {
        topPlayersContainer.innerHTML = '<div style="text-align: center; padding: 30px; color: var(--text-secondary);">Pas de données de classement disponibles</div>';
        return;
    }
    
    // Afficher le top 5
    const topPlayers = rankingData.slice(0, 5);
    const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
    
    topPlayers.forEach((player, index) => {
        const card = document.createElement('div');
        const position = index + 1;
        const borderColors = ['gold', '#C0C0C0', '#CD7F32', '#9999FF', '#FF99FF'];
        
        card.style.cssText = `
            background: var(--light-bg);
            padding: 15px;
            border-radius: 10px;
            border-left: 5px solid ${borderColors[index]};
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 15px;
        `;
        
        card.innerHTML = `
            <div style="flex: 1;">
                <p style="color: var(--text-secondary); font-size: 12px; margin-bottom: 5px;">${medals[index]} Posição #${position}</p>
                <p style="font-weight: 700; color: var(--text-primary); font-size: 16px; margin-bottom: 5px;">${player.name} ${player.shirtnumber ? `(#${player.shirtnumber})` : ''}</p>
                <p style="font-size: 12px; color: var(--text-secondary);">${player.position}</p>
            </div>
            <div style="text-align: right;">
                <div style="background: var(--primary-green); color: white; padding: 8px 12px; border-radius: 8px; margin-bottom: 5px; font-weight: 600;">
                    ⭐ ${player.perfScore}/100
                </div>
                <div style="font-size: 12px; color: var(--text-secondary);">
                    ${player.participations} participações
                </div>
            </div>
        `;
        
        topPlayersContainer.appendChild(card);
    });
    
    // Atualizar top cards
    const topPerformer = document.getElementById('topPerformer');
    const mostActive = document.getElementById('mostActive');
    
    if (topPerformer && rankingData.length > 0) {
        topPerformer.textContent = `🌟 ${rankingData[0].name}`;
    }
    
    if (mostActive && rankingData.length > 0) {
        const mostActivePlayer = rankingData.sort((a, b) => b.participations - a.participations)[0];
        mostActive.textContent = `⚡ ${mostActivePlayer.name}`;
    }
}

// ========================================
// SYSTÈME DE BADGES/RÉALISATIONS
// ========================================
const BADGES = {
    'first_login': { icon: '🎮', name: 'Débutant', desc: 'Première connexion' },
    'top_performer': { icon: '⭐', name: 'Top Performer', desc: 'Excellente performance' },
    'active_member': { icon: '⚡', name: 'Très Actif', desc: '10+ participations' },
    'social_butterfly': { icon: '🦋', name: 'Socialite', desc: 'Connecté aux réseaux sociaux' },
    'profile_complete': { icon: '✅', name: 'Profil Complet', desc: 'Toutes les infos remplies' },
    'team_player': { icon: '🤝', name: 'Joueur d\'Équipe', desc: '5+ participations' },
    'consistent': { icon: '📈', name: 'Constant', desc: 'Performance stable' },
    'first_place': { icon: '🥇', name: '1ère Place', desc: 'Champion d\'un tournoi!' },
    'second_place': { icon: '🥈', name: '2ème Place', desc: 'Vice-champion d\'un tournoi' },
    'third_place': { icon: '🥉', name: '3ème Place', desc: 'Podium d\'un tournoi' },
    'regular_attendance': { icon: '📍', name: 'Présence Régulière', desc: '20+ entraînements suivis' },
    'dedicated': { icon: '💪', name: 'Très Dédicacé', desc: '15+ entraînements avec bon effort' },
    'improvement': { icon: '🚀', name: 'En Progression', desc: 'Amélioration constante' },
    'inspiration': { icon: '🌟', name: 'Source d\'Inspiration', desc: 'Influence positive sur l\'équipe' },
    'training_master': { icon: '👑', name: 'Maître d\'Entraînement', desc: '30+ participations à l\'entraînement' },
    'never_give_up': { icon: '💯', name: 'Indomptable', desc: 'Participation sans interruption' }
};

function calculateUserBadges() {
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.email) return [];
    
    const users = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
    const user = users.find(u => u.email === currentUser.email);
    const performances = JSON.parse(localStorage.getItem(USER_PERFORMANCE_KEY) || '{}');
    const ratings = JSON.parse(localStorage.getItem(USER_RATINGS_KEY) || '{}');
    
    const badges = [];
    
    // Badge: Première connexion
    if (currentUser.fullname && currentUser.email) {
        badges.push('first_login');
    }
    
    // Badge: Top performer (Excellent)
    if (performances[currentUser.email] === 'Excellent') {
        badges.push('top_performer');
    }
    
    // Badge: Actif (10+ évaluations)
    const userRatings = ratings[currentUser.email] || [];
    if (userRatings.length >= 10) {
        badges.push('active_member');
    }
    
    // Badge: Joueur d'équipe (5+ évaluations)
    if (userRatings.length >= 5) {
        badges.push('team_player');
    }
    
    // Badge: Réseaux sociaux connectés
    if (user && (user.instagram || user.whatsapp || user.socialEmail)) {
        badges.push('social_butterfly');
    }
    
    // Badge: Profil complet
    if (user && user.position && user.shirtnumber && user.memberSince && user.experience && user.specialties && user.specialties.length > 0) {
        badges.push('profile_complete');
    }
    
    // Badge: Constant (performance stable)
    if (userRatings.length > 0 && userRatings.filter(r => r >= 3).length >= Math.ceil(userRatings.length * 0.7)) {
        badges.push('consistent');
    }
    
    // Badges de posição em torneios
    const tournamentPlacements = JSON.parse(localStorage.getItem('tournament_placements') || '{}');
    const userPlacements = tournamentPlacements[currentUser.email] || [];
    
    if (userPlacements.includes(1)) {
        badges.push('first_place');
    }
    if (userPlacements.includes(2)) {
        badges.push('second_place');
    }
    if (userPlacements.includes(3)) {
        badges.push('third_place');
    }
    
    // Badge: Présence régulière (20+ participations)
    if (userRatings.length >= 20) {
        badges.push('regular_attendance');
    }
    
    // Badge: Très dédicacé (15+ participations avec bon effort ou excellent)
    const excellentRatings = userRatings.filter(r => r >= 3.5).length;
    if (excellentRatings >= 15) {
        badges.push('dedicated');
    }
    
    // Badge: En progrès (moyenne des évaluations en amélioration)
    if (userRatings.length >= 5) {
        const firstHalf = userRatings.slice(0, Math.floor(userRatings.length / 2));
        const secondHalf = userRatings.slice(Math.floor(userRatings.length / 2));
        const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
        const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
        if (avgSecond > avgFirst) {
            badges.push('improvement');
        }
    }
    
    // Badge: Source d'inspiration (performance excellente constante + actif)
    if (performances[currentUser.email] === 'Excellent' && userRatings.length >= 10) {
        badges.push('inspiration');
    }
    
    // Badge: Maître d'entraînement (30+ participations)
    if (userRatings.length >= 30) {
        badges.push('training_master');
    }
    
    // Badge: Indomptable (20+ participations bonnes, sans abandons)
    const goodRatings = userRatings.filter(r => r >= 2).length;
    if (goodRatings >= 20 && userRatings.length === goodRatings) {
        badges.push('never_give_up');
    }
    
    return [...new Set(badges)];
}

function displayUserBadges() {
    const badgesContainer = document.getElementById('badgesContainer');
    if (!badgesContainer) return;
    
    const userBadges = calculateUserBadges();
    
    badgesContainer.innerHTML = '';
    
    if (userBadges.length === 0) {
        badgesContainer.innerHTML = `
            <div style="width: 100%; text-align: center; padding: 20px; color: var(--text-secondary);">
                <p style="margin: 0;">🔒 Aucun badge déverrouillé pour le moment</p>
                <p style="margin: 5px 0 0 0; font-size: 12px;">Participez à des entraînements pour en débloquer!</p>
            </div>
        `;
        return;
    }
    
    userBadges.forEach(badgeId => {
        const badge = BADGES[badgeId];
        if (badge) {
            const badgeEl = document.createElement('div');
            badgeEl.style.cssText = `
                text-align: center;
                padding: 10px;
                background: rgba(0, 168, 107, 0.1);
                border-radius: 8px;
                border: 2px solid var(--primary-green);
            `;
            badgeEl.title = badge.desc;
            badgeEl.innerHTML = `
                <p style="font-size: 24px; margin: 0;">${badge.icon}</p>
                <p style="font-size: 11px; color: var(--text-secondary); margin: 5px 0 0 0;">${badge.name}</p>
            `;
            badgesContainer.appendChild(badgeEl);
        }
    });
}

// Atualizar estatísticas do perfil
function updateProfileStats() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    const performances = JSON.parse(localStorage.getItem(USER_PERFORMANCE_KEY) || '{}');
    const ratings = JSON.parse(localStorage.getItem(USER_RATINGS_KEY) || '{}');
    const userRatings = ratings[currentUser.email] || [];
    const userBadges = calculateUserBadges();
    
    // Performances
    const perfEl = document.getElementById('profilePerformance');
    if (perfEl) {
        const perf = performances[currentUser.email] || '-';
        if (perf === 'Excellent') perfEl.textContent = '🔥 Excelente';
        else if (perf === 'Bien') perfEl.textContent = '✅ Bom';
        else if (perf === 'Acceptable') perfEl.textContent = '👍 Aceitável';
        else if (perf === 'À améliorer') perfEl.textContent = '📈 Melhorar';
        else perfEl.textContent = '-';
    }
    
    // Participations
    const participEl = document.getElementById('profileParticipations');
    if (participEl) {
        const count = userRatings.length;
        let icon = '🟢';
        if (count >= 10) icon = '🔥';
        else if (count >= 5) icon = '⭐';
        participEl.textContent = `${icon} ${count}`;
    }
    
    // Note moyenne
    const ratingEl = document.getElementById('profileAvgRating');
    if (ratingEl) {
        if (userRatings.length > 0) {
            const avg = (userRatings.reduce((a, b) => a + b, 0) / userRatings.length).toFixed(1);
            let stars = '';
            for (let i = 0; i < Math.round(avg); i++) stars += '⭐';
            ratingEl.textContent = `${stars} ${avg}/5`;
        } else {
            ratingEl.textContent = '0/5';
        }
    }
    
    // Badges
    const badgeEl = document.getElementById('profileBadgeCount');
    if (badgeEl) {
        const count = userBadges.length;
        let emoji = '🔒';
        if (count >= 7) emoji = '👑';
        else if (count >= 5) emoji = '🏆';
        else if (count >= 3) emoji = '🎯';
        badgeEl.textContent = `${emoji} ${count}`;
    }
}

// ========================================
// ESTATÍSTICAS AVANÇADAS
// ========================================
function updateAdvancedStats() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    const ratings = JSON.parse(localStorage.getItem(USER_RATINGS_KEY) || '{}');
    const userRatings = ratings[currentUser.email] || [];
    
    // Melhor Score
    const bestScoreEl = document.getElementById('bestScore');
    if (bestScoreEl && userRatings.length > 0) {
        const maxScore = Math.max(...userRatings);
        bestScoreEl.textContent = `${maxScore.toFixed(1)}⭐`;
    }
    
    // Tendência (comparar primeira metade com segunda metade)
    const trendEl = document.getElementById('trend');
    if (trendEl && userRatings.length >= 4) {
        const mid = Math.floor(userRatings.length / 2);
        const firstHalf = userRatings.slice(0, mid);
        const secondHalf = userRatings.slice(mid);
        const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
        const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
        const change = ((avgSecond - avgFirst) / avgFirst * 100).toFixed(0);
        const trend = change >= 0 ? `↗️ +${change}%` : `↘️ ${change}%`;
        trendEl.textContent = trend;
    }
    
    // Streak (participações consecutivas)
    const streakEl = document.getElementById('streak');
    if (streakEl) {
        const streak = Math.min(userRatings.length, 7); // Max 7 dias
        streakEl.textContent = `🔥 ${streak} jogo${streak > 1 ? 's' : ''}`;
    }
    
    // Global Rank
    const globalRankEl = document.getElementById('globalRank');
    if (globalRankEl) {
        const users = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
        const performances = JSON.parse(localStorage.getItem(USER_PERFORMANCE_KEY) || '{}');
        
        const ranking = users.map(u => {
            const userRatings = ratings[u.email] || [];
            const perf = performances[u.email];
            let perfScore = 0;
            if (perf === 'Excellent') perfScore = 100;
            else if (perf === 'Bien') perfScore = 75;
            else if (perf === 'Acceptable') perfScore = 50;
            else if (perf === 'À améliorer') perfScore = 25;
            
            const avgRating = userRatings.length > 0 
                ? userRatings.reduce((a, b) => a + b, 0) / userRatings.length 
                : 0;
            
            return { email: u.email, score: perfScore + (avgRating * 10) };
        }).sort((a, b) => b.score - a.score);
        
        const rank = ranking.findIndex(r => r.email === currentUser.email) + 1;
        globalRankEl.textContent = `#${rank} / ${ranking.length}`;
    }
    
    // Badges
    const badgeEl = document.getElementById('profileBadgeCount');
    if (badgeEl) badgeEl.textContent = userBadges.length;
}

