// ==================== GLOBAL VARIABLES ====================

let classifiedRequirements = [];
let currentUser = null;
let currentProject = null;
let projects = [];
let mlFeedback = [];
let auditLog = [];
let organizationStandards = {};
let i18nStrings = {};
let requirementsChart, qualityChart;
let classificationPatterns = {
    functional: [],
    nonFunctional: []
};

// ==================== INITIALIZATION FUNCTIONS ====================

// Initialize Charts
function initializeCharts() {
    const ctx = document.getElementById('requirementsChart').getContext('2d');
    requirementsChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Functional', 'Non-Functional'],
            datasets: [{
                data: [0, 0],
                backgroundColor: ['#4cc9f0', '#f72585'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom' },
                title: { display: true, text: 'Requirements Distribution' }
            }
        }
    });

    const qualityCtx = document.getElementById('qualityChart').getContext('2d');
    qualityChart = new Chart(qualityCtx, {
        type: 'bar',
        data: {
            labels: ['Excellent', 'Good', 'Fair', 'Poor'],
            datasets: [{
                label: 'Requirements Quality',
                data: [0, 0, 0, 0],
                backgroundColor: ['#4CAF50', '#8BC34A', '#FFC107', '#F44336'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
                title: { display: true, text: 'Quality Distribution' }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                }
            }
        }
    });
}

// Initialize User Database
function initializeUserDatabase() {
    if (!localStorage.getItem('users')) {
        const defaultUsers = [
            {
                id: 1,
                name: 'Admin User',
                email: 'admin@example.com',
                password: 'admin123', // In production, use proper hashing
                role: 'admin',
                organization: 'Default Organization',
                createdAt: new Date().toISOString(),
                lastLogin: null,
                preferences: { language: 'en', theme: 'light' }
            },
            {
                id: 2,
                name: 'Project Manager',
                email: 'pm@example.com',
                password: 'pm123',
                role: 'project_manager',
                organization: 'Default Organization',
                createdAt: new Date().toISOString(),
                lastLogin: null,
                preferences: { language: 'en', theme: 'light' }
            },
            {
                id: 3,
                name: 'Requirements Engineer',
                email: 're@example.com',
                password: 're123',
                role: 'requirement_engineer',
                organization: 'Default Organization',
                createdAt: new Date().toISOString(),
                lastLogin: null,
                preferences: { language: 'en', theme: 'light' }
            }
        ];
        localStorage.setItem('users', JSON.stringify(defaultUsers));
    }
    
    if (!localStorage.getItem('sessions')) {
        localStorage.setItem('sessions', JSON.stringify([]));
    }
}

// Initialize Project Database
function initializeProjectDatabase() {
    if (!localStorage.getItem('projects')) {
        const defaultProjects = [
            {
                id: 1,
                name: 'E-Commerce Platform',
                description: 'Online shopping platform with payment processing',
                type: 'software',
                template: 'agile',
                status: 'active',
                createdBy: 1,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                requirements: [],
                teamMembers: [1, 2, 3],
                compliance: { gdpr: true, pci: true }
            },
            {
                id: 2,
                name: 'Healthcare System',
                description: 'Patient management and records system',
                type: 'system',
                template: 'waterfall',
                status: 'planning',
                createdBy: 2,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                requirements: [],
                teamMembers: [1, 2],
                compliance: { hipaa: true }
            }
        ];
        localStorage.setItem('projects', JSON.stringify(defaultProjects));
    }
    
    projects = JSON.parse(localStorage.getItem('projects')) || [];
}

// Initialize ML Feedback System
function initializeMLFeedback() {
    if (!localStorage.getItem('mlFeedback')) {
        localStorage.setItem('mlFeedback', JSON.stringify([]));
    }
    
    if (!localStorage.getItem('classificationPatterns')) {
        const initialPatterns = {
            functional: [
                { pattern: 'user.*log.*in', weight: 0.9, category: 'authentication' },
                { pattern: 'create.*account', weight: 0.8, category: 'user_management' },
                { pattern: 'search.*product', weight: 0.85, category: 'search' },
                { pattern: 'add.*to.*cart', weight: 0.88, category: 'e-commerce' },
                { pattern: 'checkout.*process', weight: 0.87, category: 'e-commerce' },
                { pattern: 'view.*profile', weight: 0.82, category: 'user_management' },
                { pattern: 'edit.*settings', weight: 0.81, category: 'user_management' },
                { pattern: 'upload.*file', weight: 0.83, category: 'data_management' },
                { pattern: 'download.*report', weight: 0.84, category: 'reporting' },
                { pattern: 'send.*message', weight: 0.8, category: 'communication' }
            ],
            nonFunctional: [
                { pattern: 'within.*second', weight: 0.95, category: 'performance' },
                { pattern: 'available.*99', weight: 0.9, category: 'reliability' },
                { pattern: 'encrypt.*data', weight: 0.85, category: 'security' },
                { pattern: 'support.*concurrent', weight: 0.88, category: 'scalability' },
                { pattern: 'compatible.*browser', weight: 0.82, category: 'compatibility' },
                { pattern: 'response.*time', weight: 0.86, category: 'performance' },
                { pattern: 'uptime.*percent', weight: 0.89, category: 'reliability' },
                { pattern: 'secure.*connection', weight: 0.87, category: 'security' },
                { pattern: 'load.*balance', weight: 0.83, category: 'scalability' },
                { pattern: 'mobile.*responsive', weight: 0.81, category: 'usability' }
            ]
        };
        localStorage.setItem('classificationPatterns', JSON.stringify(initialPatterns));
    }
    
    classificationPatterns = JSON.parse(localStorage.getItem('classificationPatterns'));
    mlFeedback = JSON.parse(localStorage.getItem('mlFeedback')) || [];
}

// Initialize Audit Log
function initializeAuditLog() {
    if (!localStorage.getItem('auditLog')) {
        const initialLog = [
            {
                id: 1,
                timestamp: new Date().toISOString(),
                event: 'SYSTEM_START',
                action: 'System initialized',
                userId: null,
                details: { version: '1.0.0' },
                ipAddress: 'local',
                severity: 'info'
            }
        ];
        localStorage.setItem('auditLog', JSON.stringify(initialLog));
    }
    
    auditLog = JSON.parse(localStorage.getItem('auditLog')) || [];
}

// Initialize Internationalization
function initializeI18n() {
    if (!localStorage.getItem('i18nStrings')) {
        const defaultStrings = {
            en: {
                system_name: 'Requirements Classification System',
                welcome: 'Welcome',
                login: 'Login',
                logout: 'Logout',
                register: 'Register',
                classify: 'Classify Requirements',
                functional: 'Functional',
                nonFunctional: 'Non-Functional',
                quality: 'Quality',
                export: 'Export',
                save: 'Save',
                projects: 'Projects',
                profile: 'Profile',
                settings: 'Settings',
                dashboard: 'Dashboard',
                requirements: 'Requirements',
                analysis: 'Analysis',
                reports: 'Reports',
                help: 'Help',
                about: 'About'
            },
            es: {
                system_name: 'Sistema de Clasificación de Requisitos',
                welcome: 'Bienvenido',
                login: 'Iniciar Sesión',
                logout: 'Cerrar Sesión',
                register: 'Registrarse',
                classify: 'Clasificar Requisitos',
                functional: 'Funcional',
                nonFunctional: 'No Funcional',
                quality: 'Calidad',
                export: 'Exportar',
                save: 'Guardar',
                projects: 'Proyectos',
                profile: 'Perfil',
                settings: 'Configuración',
                dashboard: 'Panel',
                requirements: 'Requisitos',
                analysis: 'Análisis',
                reports: 'Informes',
                help: 'Ayuda',
                about: 'Acerca de'
            },
            fr: {
                system_name: 'Système de Classification des Exigences',
                welcome: 'Bienvenue',
                login: 'Connexion',
                logout: 'Déconnexion',
                register: 'S\'inscrire',
                classify: 'Classer les Exigences',
                functional: 'Fonctionnel',
                nonFunctional: 'Non Fonctionnel',
                quality: 'Qualité',
                export: 'Exporter',
                save: 'Enregistrer',
                projects: 'Projets',
                profile: 'Profil',
                settings: 'Paramètres',
                dashboard: 'Tableau de bord',
                requirements: 'Exigences',
                analysis: 'Analyse',
                reports: 'Rapports',
                help: 'Aide',
                about: 'À propos'
            },
            de: {
                system_name: 'Anforderungsklassifizierungssystem',
                welcome: 'Willkommen',
                login: 'Anmelden',
                logout: 'Abmelden',
                register: 'Registrieren',
                classify: 'Anforderungen klassifizieren',
                functional: 'Funktional',
                nonFunctional: 'Nicht-funktional',
                quality: 'Qualität',
                export: 'Exportieren',
                save: 'Speichern',
                projects: 'Projekte',
                profile: 'Profil',
                settings: 'Einstellungen',
                dashboard: 'Dashboard',
                requirements: 'Anforderungen',
                analysis: 'Analyse',
                reports: 'Berichte',
                help: 'Hilfe',
                about: 'Über'
            },
            ar: {
                system_name: 'نظام تصنيف المتطلبات',
                welcome: 'مرحباً',
                login: 'تسجيل الدخول',
                logout: 'تسجيل الخروج',
                register: 'التسجيل',
                classify: 'تصنيف المتطلبات',
                functional: 'وظيفي',
                nonFunctional: 'غير وظيفي',
                quality: 'الجودة',
                export: 'تصدير',
                save: 'حفظ',
                projects: 'المشاريع',
                profile: 'الملف الشخصي',
                settings: 'الإعدادات',
                dashboard: 'لوحة التحكم',
                requirements: 'المتطلبات',
                analysis: 'تحليل',
                reports: 'التقارير',
                help: 'مساعدة',
                about: 'حول'
            }
        };
        localStorage.setItem('i18nStrings', JSON.stringify(defaultStrings));
    }
    
    i18nStrings = JSON.parse(localStorage.getItem('i18nStrings'));
}

// Initialize Organization Standards
function initializeOrganizationStandards() {
    if (!localStorage.getItem('organizationStandards')) {
        const defaultStandards = {
            templates: {
                agile: {
                    name: 'Agile Methodology',
                    requirementFormat: 'As a [role], I want [feature] so that [benefit]',
                    categories: ['user_story', 'epic', 'task', 'bug', 'spike'],
                    qualityThreshold: 7,
                    mandatoryFields: ['acceptance_criteria', 'story_points'],
                    compliance: ['iso_9001', 'agile_manifesto']
                },
                waterfall: {
                    name: 'Waterfall Methodology',
                    requirementFormat: 'The system shall [action]',
                    categories: ['functional', 'non_functional', 'constraint', 'interface'],
                    qualityThreshold: 8,
                    mandatoryFields: ['specification', 'validation_criteria'],
                    compliance: ['iso_12207', 'cmmi']
                },
                medical: {
                    name: 'Medical Device Standards',
                    requirementFormat: 'In accordance with [regulation], the system must [action]',
                    categories: ['safety', 'efficacy', 'security', 'compliance', 'usability'],
                    qualityThreshold: 9,
                    mandatoryFields: ['risk_assessment', 'validation_protocol'],
                    compliance: ['fda_21_cfr', 'iec_62304', 'hipaa']
                },
                financial: {
                    name: 'Financial Services',
                    requirementFormat: 'Per [regulation/standard], the system shall [action]',
                    categories: ['security', 'compliance', 'audit', 'reporting', 'transaction'],
                    qualityThreshold: 9,
                    mandatoryFields: ['audit_trail', 'encryption_standard'],
                    compliance: ['pci_dss', 'sox', 'gdpr']
                }
            },
            complianceFrameworks: {
                gdpr: {
                    name: 'GDPR',
                    requirements: ['data_encryption', 'user_consent', 'data_retention', 'right_to_be_forgotten'],
                    enabled: true
                },
                hipaa: {
                    name: 'HIPAA',
                    requirements: ['phi_protection', 'access_controls', 'audit_trails', 'encryption'],
                    enabled: false
                },
                iso27001: {
                    name: 'ISO 27001',
                    requirements: ['risk_assessment', 'security_policy', 'asset_management', 'access_control'],
                    enabled: false
                },
                soc2: {
                    name: 'SOC 2',
                    requirements: ['security', 'availability', 'processing_integrity', 'confidentiality', 'privacy'],
                    enabled: false
                }
            },
            securityLevels: {
                low: {
                    name: 'Basic Security',
                    features: ['basic_encryption', 'password_policy'],
                    encryption: 'aes_128'
                },
                medium: {
                    name: 'Standard Security',
                    features: ['strong_encryption', '2fa', 'session_timeout', 'audit_logging'],
                    encryption: 'aes_256'
                },
                high: {
                    name: 'Enhanced Security',
                    features: ['end_to_end_encryption', 'mfa', 'ip_whitelisting', 'real_time_monitoring'],
                    encryption: 'aes_256_gcm'
                }
            },
            qualityStandards: {
                iso_25010: true,
                iso_9126: true,
                cmmi_level: 3,
                automated_testing: true,
                code_review: true
            }
        };
        localStorage.setItem('organizationStandards', JSON.stringify(defaultStandards));
    }
    
    organizationStandards = JSON.parse(localStorage.getItem('organizationStandards'));
}

// ==================== AUTHENTICATION & USER MANAGEMENT ====================

// Login function with security features
function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        showAlert('Please enter both email and password', 'danger');
        return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showAlert('Please enter a valid email address', 'danger');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
        logAuditEvent('AUTH_FAILURE', 'Invalid email attempt', { email });
        showAlert('Invalid email or password', 'danger');
        return;
    }
    
    if (password !== user.password) {
        // Check for too many failed attempts
        const failedAttempts = JSON.parse(localStorage.getItem('failedLoginAttempts') || '{}');
        const attempts = failedAttempts[email] || 0;
        failedAttempts[email] = attempts + 1;
        localStorage.setItem('failedLoginAttempts', JSON.stringify(failedAttempts));
        
        if (attempts >= 5) {
            logAuditEvent('ACCOUNT_LOCKED', 'Too many failed login attempts', { email, attempts });
            showAlert('Account locked due to too many failed attempts. Please contact administrator.', 'danger');
            return;
        }
        
        logAuditEvent('AUTH_FAILURE', 'Invalid password attempt', { email, attempts: attempts + 1 });
        showAlert(`Invalid email or password. ${5 - (attempts + 1)} attempts remaining.`, 'danger');
        return;
    }
    
    // Clear failed attempts on successful login
    const failedAttempts = JSON.parse(localStorage.getItem('failedLoginAttempts') || '{}');
    delete failedAttempts[email];
    localStorage.setItem('failedLoginAttempts', JSON.stringify(failedAttempts));
    
    // Create session with enhanced security
    const sessionId = generateSessionId();
    const session = {
        id: sessionId,
        userId: user.id,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + (24 * 60 * 60 * 1000)).toISOString(), // 24 hours
        lastActivity: new Date().toISOString(),
        ipAddress: 'local', // In production, get from request
        userAgent: navigator.userAgent,
        twoFactorVerified: false // For future 2FA implementation
    };
    
    const sessions = JSON.parse(localStorage.getItem('sessions')) || [];
    sessions.push(session);
    localStorage.setItem('sessions', JSON.stringify(sessions));
    localStorage.setItem('currentSession', sessionId);
    
    // Update user last login
    user.lastLogin = new Date().toISOString();
    localStorage.setItem('users', JSON.stringify(users));
    
    currentUser = user;
    
    // Set user preferences
    if (user.preferences && user.preferences.language) {
        changeLanguage(user.preferences.language);
    }
    
    updateUIForUser(user);
    
    // Hide modal
    const authModal = bootstrap.Modal.getInstance(document.getElementById('authModal'));
    if (authModal) authModal.hide();
    
    logAuditEvent('AUTH_SUCCESS', 'User logged in', { 
        userId: user.id, 
        email: user.email,
        role: user.role 
    });
    
    showAlert(`Welcome back, ${user.name}!`, 'success');
    
    // Load user's projects
    loadProjects();
}

// Enhanced registration with validation
function register() {
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    const role = document.getElementById('registerRole').value;
    const organization = document.getElementById('registerOrganization')?.value || 'Default Organization';
    
    // Validation
    if (!name || !email || !password || !confirmPassword) {
        showAlert('Please fill all required fields', 'danger');
        return;
    }
    
    if (password !== confirmPassword) {
        showAlert('Passwords do not match', 'danger');
        return;
    }
    
    if (password.length < 8) {
        showAlert('Password must be at least 8 characters', 'danger');
        return;
    }
    
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
        showAlert('Password must contain uppercase, lowercase letters and numbers', 'danger');
        return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showAlert('Please enter a valid email address', 'danger');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        showAlert('Email already registered', 'warning');
        return;
    }
    
    // Create user with enhanced profile
    const newUser = {
        id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
        name: name,
        email: email,
        password: password, // In production, HASH THIS!
        role: role,
        organization: organization,
        createdAt: new Date().toISOString(),
        lastLogin: null,
        preferences: {
            language: 'en',
            theme: 'light',
            notifications: true,
            autoSave: true
        },
        profile: {
            jobTitle: '',
            department: '',
            phone: '',
            location: ''
        },
        isActive: true,
        isVerified: false,
        twoFactorEnabled: false
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    logAuditEvent('USER_REGISTRATION', 'New user registered', { 
        userId: newUser.id, 
        email: newUser.email,
        role: newUser.role 
    });
    
    showAlert('Registration successful! Please login to continue.', 'success');
    showLoginForm();
}

// Enhanced logout with cleanup
function logout() {
    const sessionId = localStorage.getItem('currentSession');
    if (sessionId) {
        const sessions = JSON.parse(localStorage.getItem('sessions')) || [];
        const sessionIndex = sessions.findIndex(s => s.id === sessionId);
        
        if (sessionIndex !== -1) {
            // Update session end time
            sessions[sessionIndex].endedAt = new Date().toISOString();
            localStorage.setItem('sessions', JSON.stringify(sessions));
        }
    }
    
    localStorage.removeItem('currentSession');
    
    logAuditEvent('AUTH_LOGOUT', 'User logged out', { 
        userId: currentUser ? currentUser.id : null,
        userName: currentUser ? currentUser.name : null
    });
    
    currentUser = null;
    currentProject = null;
    
    updateUIForUser(null);
    
    showAlert('Successfully logged out', 'info');
    
    // Clear sensitive data from memory
    classifiedRequirements = [];
    if (requirementsChart) requirementsChart.destroy();
    if (qualityChart) qualityChart.destroy();
    
    // Navigate to home
    navigateToStep(1);
}

// Check session validity
function checkSession() {
    const sessionId = localStorage.getItem('currentSession');
    if (!sessionId) return false;
    
    const sessions = JSON.parse(localStorage.getItem('sessions')) || [];
    const session = sessions.find(s => s.id === sessionId);
    
    if (!session) {
        localStorage.removeItem('currentSession');
        return false;
    }
    
    // Check if session expired
    if (new Date(session.expiresAt) < new Date()) {
        // Remove expired session
        const updatedSessions = sessions.filter(s => s.id !== sessionId);
        localStorage.setItem('sessions', JSON.stringify(updatedSessions));
        localStorage.removeItem('currentSession');
        
        logAuditEvent('SESSION_EXPIRED', 'User session expired', { 
            userId: session.userId,
            sessionId: sessionId 
        });
        
        return false;
    }
    
    // Update last activity
    session.lastActivity = new Date().toISOString();
    
    // Extend session if close to expiry (within 1 hour)
    const oneHourBeforeExpiry = new Date(session.expiresAt).getTime() - (60 * 60 * 1000);
    if (Date.now() > oneHourBeforeExpiry) {
        session.expiresAt = new Date(Date.now() + (24 * 60 * 60 * 1000)).toISOString();
    }
    
    localStorage.setItem('sessions', JSON.stringify(sessions));
    
    // Get user data
    const users = JSON.parse(localStorage.getItem('users')) || [];
    currentUser = users.find(u => u.id === session.userId);
    
    return currentUser !== null;
}

// ==================== PROJECT MANAGEMENT ====================

// Create new project with enhanced features
function createNewProject() {
    document.getElementById('projectsList').style.display = 'none';
    document.getElementById('projectForm').style.display = 'block';
    document.getElementById('projectName').value = '';
    document.getElementById('projectDescription').value = '';
    document.getElementById('projectType').value = 'software';
    document.getElementById('projectTemplate').value = 'agile';
    
    // Show additional fields for new project
    const additionalFields = `
        <div class="row mb-3">
            <div class="col-md-6">
                <label for="projectStatus" class="form-label">Status</label>
                <select class="form-select" id="projectStatus">
                    <option value="planning">Planning</option>
                    <option value="active">Active</option>
                    <option value="on_hold">On Hold</option>
                    <option value="completed">Completed</option>
                </select>
            </div>
            <div class="col-md-6">
                <label for="projectPriority" class="form-label">Priority</label>
                <select class="form-select" id="projectPriority">
                    <option value="low">Low</option>
                    <option value="medium" selected>Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                </select>
            </div>
        </div>
        <div class="mb-3">
            <label for="projectCompliance" class="form-label">Compliance Requirements</label>
            <div class="form-check">
                <input class="form-check-input" type="checkbox" id="complianceGDPR">
                <label class="form-check-label" for="complianceGDPR">GDPR</label>
            </div>
            <div class="form-check">
                <input class="form-check-input" type="checkbox" id="complianceHIPAA">
                <label class="form-check-label" for="complianceHIPAA">HIPAA</label>
            </div>
            <div class="form-check">
                <input class="form-check-input" type="checkbox" id="compliancePCI">
                <label class="form-check-label" for="compliancePCI">PCI DSS</label>
            </div>
        </div>
    `;
    
    const projectForm = document.getElementById('projectForm');
    const existingAdditional = projectForm.querySelector('#additionalFields');
    if (!existingAdditional) {
        const additionalDiv = document.createElement('div');
        additionalDiv.id = 'additionalFields';
        additionalDiv.innerHTML = additionalFields;
        projectForm.insertBefore(additionalDiv, projectForm.querySelector('.d-flex'));
    }
}

// Save project with enhanced data
function saveProject() {
    if (!currentUser) {
        showAlert('Please login to save projects', 'warning');
        return;
    }
    
    const name = document.getElementById('projectName').value.trim();
    const description = document.getElementById('projectDescription').value.trim();
    const type = document.getElementById('projectType').value;
    const template = document.getElementById('projectTemplate').value;
    const status = document.getElementById('projectStatus')?.value || 'active';
    const priority = document.getElementById('projectPriority')?.value || 'medium';
    
    if (!name) {
        showAlert('Project name is required', 'warning');
        return;
    }
    
    // Collect compliance requirements
    const compliance = {
        gdpr: document.getElementById('complianceGDPR')?.checked || false,
        hipaa: document.getElementById('complianceHIPAA')?.checked || false,
        pci: document.getElementById('compliancePCI')?.checked || false
    };
    
    const newProject = {
        id: projects.length > 0 ? Math.max(...projects.map(p => p.id)) + 1 : 1,
        name: name,
        description: description,
        type: type,
        template: template,
        status: status,
        priority: priority,
        createdBy: currentUser.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        requirements: [],
        teamMembers: [currentUser.id],
        compliance: compliance,
        settings: {
            autoClassification: true,
            qualityThreshold: 7,
            notificationSettings: {
                email: true,
                inApp: true
            }
        },
        version: '1.0',
        tags: [type, template]
    };
    
    projects.push(newProject);
    localStorage.setItem('projects', JSON.stringify(projects));
    
    currentProject = newProject;
    loadProjects();
    
    document.getElementById('projectForm').style.display = 'none';
    document.getElementById('projectsList').style.display = 'block';
    
    logAuditEvent('PROJECT_CREATED', 'New project created', { 
        projectId: newProject.id, 
        projectName: newProject.name,
        template: newProject.template
    });
    
    showAlert('Project created successfully!', 'success');
    
    // Update project selector in UI if it exists
    updateProjectSelector();
}

// Enhanced project loading
function loadProjects(searchTerm = '') {
    const projectsList = document.getElementById('projectsList');
    if (!projectsList) return;
    
    projectsList.innerHTML = '';
    
    let userProjects = projects.filter(p => 
        p.teamMembers.includes(currentUser.id) || 
        p.createdBy === currentUser.id
    );
    
    // Apply search filter
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        userProjects = userProjects.filter(p => 
            p.name.toLowerCase().includes(term) ||
            p.description.toLowerCase().includes(term) ||
            p.tags?.some(tag => tag.toLowerCase().includes(term))
        );
    }
    
    if (userProjects.length === 0) {
        projectsList.innerHTML = `
            <div class="text-center py-4">
                <i class="fas fa-folder-open fa-3x text-muted mb-3"></i>
                <p class="text-muted">No projects found. Create your first project!</p>
                <button class="btn btn-primary" onclick="createNewProject()">
                    <i class="fas fa-plus me-2"></i>Create Project
                </button>
            </div>
        `;
        return;
    }
    
    // Sort by last updated
    userProjects.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    
    userProjects.forEach(project => {
        const projectElement = document.createElement('div');
        projectElement.className = 'list-group-item project-item';
        
        // Determine status badge color
        let statusBadgeClass = 'bg-secondary';
        switch(project.status) {
            case 'active': statusBadgeClass = 'bg-success'; break;
            case 'planning': statusBadgeClass = 'bg-info'; break;
            case 'on_hold': statusBadgeClass = 'bg-warning'; break;
            case 'completed': statusBadgeClass = 'bg-primary'; break;
        }
        
        // Count compliance requirements
        const complianceCount = Object.values(project.compliance || {}).filter(v => v).length;
        
        projectElement.innerHTML = `
            <div class="d-flex justify-content-between align-items-start">
                <div class="flex-grow-1">
                    <div class="d-flex align-items-center mb-1">
                        <h6 class="mb-0 me-2">${project.name}</h6>
                        <span class="badge ${statusBadgeClass}">${project.status.replace('_', ' ')}</span>
                        <span class="badge bg-light text-dark ms-2">${project.template}</span>
                        ${complianceCount > 0 ? `<span class="badge bg-danger ms-2">${complianceCount} Compliance</span>` : ''}
                    </div>
                    <p class="text-muted mb-2 small">${project.description}</p>
                    <div class="project-meta">
                        <small>
                            <i class="fas fa-calendar me-1"></i>${new Date(project.updatedAt).toLocaleDateString()}
                            <span class="mx-2">•</span>
                            <i class="fas fa-file-alt me-1"></i>${project.requirements.length} requirements
                            <span class="mx-2">•</span>
                            <i class="fas fa-users me-1"></i>${project.teamMembers.length} members
                        </small>
                    </div>
                </div>
                <div class="project-actions ms-3">
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="loadProject(${project.id})" title="Open Project">
                            <i class="fas fa-folder-open"></i>
                        </button>
                        <button class="btn btn-outline-secondary" onclick="editProject(${project.id})" title="Edit Project">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="deleteProject(${project.id})" title="Delete Project">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        projectsList.appendChild(projectElement);
    });
}

// Load project with requirements
function loadProject(projectId) {
    currentProject = projects.find(p => p.id === projectId);
    
    if (!currentProject) {
        showAlert('Project not found', 'danger');
        return;
    }
    
    // Apply project template standards
    applyProjectTemplate(currentProject.template);
    
    // Load project requirements if any
    if (currentProject.requirements && currentProject.requirements.length > 0) {
        const requirementsText = currentProject.requirements
            .map(req => req.text)
            .join('\n');
        document.getElementById('requirementInput').value = requirementsText;
        
        // Reclassify requirements
        setTimeout(() => {
            classifyRequirements();
            showAlert(`Project "${currentProject.name}" loaded with ${currentProject.requirements.length} requirements`, 'success');
        }, 100);
    } else {
        showAlert(`Project "${currentProject.name}" loaded (no requirements yet)`, 'info');
    }
    
    // Close project modal if open
    const projectModal = bootstrap.Modal.getInstance(document.getElementById('projectModal'));
    if (projectModal) projectModal.hide();
    
    // Update current project indicator
    updateCurrentProjectIndicator();
    
    logAuditEvent('PROJECT_LOADED', 'Project loaded', {
        projectId: currentProject.id,
        projectName: currentProject.name
    });
}

// Save current project requirements
function saveCurrentProject() {
    if (!currentProject || !currentUser) {
        showAlert('Please create or load a project first', 'warning');
        return;
    }
    
    if (!checkPermission('save_project')) {
        showAlert('You do not have permission to save projects', 'danger');
        return;
    }
    
    // Create backup before saving
    const backup = {
        ...currentProject,
        backupCreatedAt: new Date().toISOString()
    };
    
    // Save project history
    const projectHistory = JSON.parse(localStorage.getItem('projectHistory') || '{}');
    if (!projectHistory[currentProject.id]) {
        projectHistory[currentProject.id] = [];
    }
    
    projectHistory[currentProject.id].push({
        timestamp: new Date().toISOString(),
        requirementsCount: classifiedRequirements.length,
        action: 'save'
    });
    
    // Keep only last 50 history entries
    if (projectHistory[currentProject.id].length > 50) {
        projectHistory[currentProject.id] = projectHistory[currentProject.id].slice(-50);
    }
    
    localStorage.setItem('projectHistory', JSON.stringify(projectHistory));
    
    // Update current project
    currentProject.requirements = classifiedRequirements.map(req => ({
        ...req,
        savedAt: new Date().toISOString(),
        savedBy: currentUser.id
    }));
    
    currentProject.updatedAt = new Date().toISOString();
    currentProject.version = incrementVersion(currentProject.version);
    
    // Update in projects array
    const projectIndex = projects.findIndex(p => p.id === currentProject.id);
    if (projectIndex !== -1) {
        projects[projectIndex] = currentProject;
        localStorage.setItem('projects', JSON.stringify(projects));
        
        showAlert(`Project saved successfully (Version ${currentProject.version})`, 'success');
        
        logAuditEvent('PROJECT_SAVED', 'Project requirements saved', {
            projectId: currentProject.id,
            requirementsCount: classifiedRequirements.length,
            version: currentProject.version
        });
    }
}

// ==================== ENHANCED CLASSIFICATION WITH ML ====================

// Enhanced classification with ML patterns
function enhancedClassificationWithML(requirement) {
    const basicClassification = enhancedClassification(requirement);
    
    // Apply learned patterns from ML feedback
    let mlWeight = 0;
    let patternMatch = null;
    
    // Check against learned patterns
    ['functional', 'nonFunctional'].forEach(type => {
        classificationPatterns[type].forEach(pattern => {
            const regex = new RegExp(pattern.pattern, 'i');
            if (regex.test(requirement)) {
                const weight = pattern.weight || 0.7;
                if (weight > mlWeight) {
                    mlWeight = weight;
                    patternMatch = {
                        type: type === 'functional' ? 'functional' : 'non-functional',
                        category: pattern.category,
                        confidence: weight
                    };
                }
            }
        });
    });
    
    // If ML pattern suggests different classification, adjust
    if (patternMatch && patternMatch.confidence > basicClassification.confidence) {
        basicClassification.type = patternMatch.type;
        basicClassification.category = patternMatch.category;
        basicClassification.confidence = patternMatch.confidence;
        basicClassification.analysis += ` (Enhanced by ML pattern matching)`;
    }
    
    return basicClassification;
}

// Original classification function
function enhancedClassification(requirement) {
    // Input validation
    if (!requirement || typeof requirement !== 'string') {
        return {
            type: 'functional',
            category: 'unknown',
            confidence: 0.5,
            analysis: 'Invalid requirement format',
            quality: {
                score: 1,
                issues: ['Invalid requirement format'],
                level: 'poor'
            }
        };
    }
    
    const lowerReq = requirement.toLowerCase().trim();
    
    // STRONG FUNCTIONAL INDICATORS
    const strongFunctionalPatterns = [
        /^as a .*, (i want|i need|i can) .* (so that|in order to) .*/i,
        /^as an? .*, (i want|i need|i can) .* (so that|in order to) .*/i,
        /\b(log in|login|sign in|register|create account)\b/i,
        /\b(search|find|filter|sort)\b/i,
        /\b(create|add|new|insert)\b/i,
        /\b(read|view|see|display|show)\b/i,
        /\b(update|edit|modify|change)\b/i,
        /\b(delete|remove|erase)\b/i,
        /\b(upload|download|export|import)\b/i,
        /\b(manage|administer|configure)\b/i,
        /\b(order|purchase|buy|checkout)\b/i,
        /\b(track|monitor|follow)\b/i,
        /\b(reset password|change password)\b/i,
        /\b(dashboard|profile|account)\b/i,
        /\b(shopping cart|cart|checkout)\b/i,
        /\b(notification|alert|email)\b/i
    ];

    // STRONG NON-FUNCTIONAL INDICATORS
    const strongNonFunctionalPatterns = {
        performance: [
            /\b(within|less than|under|maximum)\s+\d+\s*(second|millisecond|ms|minute)\b/i,
            /\b(response time|performance|throughput|latency)\b/i,
            /\b(load.*page|page.*load)\b/i,
            /\bconcurrent users\b/i
        ],
        reliability: [
            /\b(available|availability|uptime|downtime)\b/i,
            /\b(99\.\d+%|reliable|reliability)\b/i,
            /\b(error handling|logging)\b/i
        ],
        security: [
            /\b(encrypt|encryption|secure|security)\b/i,
            /\b(SSL|TLS|AES-256)\b/i,
            /\b(data.*transit|data.*rest)\b/i,
            /\b(session.*timeout|timeout.*session)\b/i
        ],
        scalability: [
            /\b(\d+,?\d* concurrent users)\b/i,
            /\b(scalable|scalability|performance degradation)\b/i
        ],
        compatibility: [
            /\b(iOS.*Android|Android.*iOS)\b/i,
            /\b(compatible|compatibility)\b/i,
            /\b(consistent.*experience)\b/i
        ],
        maintainability: [
            /\b(maintainable|maintainability)\b/i,
            /\b(documentation|modular)\b/i,
            /\b(data integrity|backup|backups)\b/i
        ]
    };

    let type = 'functional';
    let category = 'feature';
    let confidence = 0.7;
    let matchedPatterns = [];

    // Check for STRONG functional indicators
    let strongFunctionalMatch = false;
    for (const pattern of strongFunctionalPatterns) {
        if (pattern.test(requirement)) {
            strongFunctionalMatch = true;
            confidence = 0.9;
            break;
        }
    }

    // Check for non-functional patterns
    let nonFunctionalMatchCount = 0;
    for (const [cat, patterns] of Object.entries(strongNonFunctionalPatterns)) {
        for (const pattern of patterns) {
            if (pattern.test(requirement)) {
                if (!matchedPatterns.includes(cat)) {
                    matchedPatterns.push(cat);
                }
                nonFunctionalMatchCount++;
                confidence = Math.max(confidence, 0.85);
            }
        }
    }

    // DECISION LOGIC
    if (strongFunctionalMatch) {
        type = 'functional';
        confidence = 0.95;
        
        if (nonFunctionalMatchCount >= 3) {
            type = 'non-functional';
            confidence = 0.8;
        }
    } else if (nonFunctionalMatchCount > 0) {
        type = 'non-functional';
        confidence = Math.min(0.95, 0.7 + (nonFunctionalMatchCount * 0.1));
    }

    // Categorize the requirement
    if (type === 'functional') {
        category = categorizeFunctionalRequirement(requirement);
    } else {
        category = matchedPatterns[0] || 'quality';
    }

    return {
        type: type,
        category: category,
        confidence: confidence,
        analysis: generateAnalysis(requirement, type, matchedPatterns, strongFunctionalMatch),
        quality: analyzeRequirementQuality(requirement, type)
    };
}

// Categorize functional requirements
function categorizeFunctionalRequirement(requirement) {
    const lowerReq = requirement.toLowerCase();
    
    if (/(log in|login|sign in|register|create account|reset password|change password)/i.test(requirement)) 
        return 'authentication';
    
    if (/(manage user|user account|activate|deactivate|admin)/i.test(requirement)) 
        return 'user management';
    
    if (/(search|find|filter|sort|browse)/i.test(requirement)) 
        return 'search';
    
    if (/(create|add|new|insert)/i.test(requirement)) 
        return 'data creation';
    if (/(view|see|display|show|read)/i.test(requirement)) 
        return 'data retrieval';
    if (/(update|edit|modify|change)/i.test(requirement)) 
        return 'data modification';
    if (/(delete|remove|erase)/i.test(requirement)) 
        return 'data deletion';
    
    if (/(shopping cart|cart|checkout|purchase|buy|order)/i.test(requirement)) 
        return 'e-commerce';
    
    if (/(notification|alert|email|track|monitor)/i.test(requirement)) 
        return 'notifications';
    
    if (/(profile|upload|personal information)/i.test(requirement)) 
        return 'profile management';
    
    return 'feature';
}

// Generate analysis text
function generateAnalysis(requirement, type, patterns, isUserStory) {
    if (isUserStory) {
        return `User story describing specific user capability - clearly functional`;
    }
    
    if (type === 'functional') {
        return `Functional requirement describing specific system behavior or user action`;
    } else {
        const areas = patterns.length > 0 ? patterns.join(', ') : 'quality';
        return `Non-functional requirement focusing on system ${areas} attributes`;
    }
}

// Quality analysis
function analyzeRequirementQuality(requirement, type) {
    const issues = [];
    let score = 10;
    
    // Check for ambiguous language
    if (/\b(may|might|could|should)\b/i.test(requirement)) {
        issues.push('Ambiguous language detected');
        score -= 2;
    }
    
    // Check length
    const wordCount = requirement.split(' ').length;
    if (wordCount < 5) {
        issues.push('Requirement may be too vague');
        score -= 2;
    } else if (wordCount > 50) {
        issues.push('Requirement may be too complex');
        score -= 1;
    }
    
    // Check for testability
    if (!/\b(must|shall|will)\b/i.test(requirement)) {
        issues.push('Requirement may not be testable');
        score -= 1;
    }
    
    // Check for measurable criteria in non-functional requirements
    if (type === 'non-functional' && !/\d+/.test(requirement)) {
        issues.push('Non-functional requirement lacks measurable criteria');
        score -= 1;
    }
    
    // Bonus for good user story format
    if (/as a .* i want .* so that .*/i.test(requirement)) {
        score += 1;
    }
    
    // Bonus for specific measurable criteria
    if (/\b(\d+|percent|percentage)\b/i.test(requirement) && type === 'non-functional') {
        score += 1;
    }
    
    // Apply organization quality standards
    if (currentProject && currentProject.settings && currentProject.settings.qualityThreshold) {
        const threshold = currentProject.settings.qualityThreshold;
        if (score < threshold) {
            issues.push(`Below organization quality threshold (${threshold}/10)`);
        }
    }
    
    return {
        score: Math.max(1, Math.min(10, Math.round(score * 10) / 10)),
        issues: issues,
        level: getQualityLevel(score)
    };
}

function getQualityLevel(score) {
    if (score >= 9) return 'excellent';
    if (score >= 7) return 'good';
    if (score >= 5) return 'fair';
    return 'poor';
}

// ==================== MACHINE LEARNING FEEDBACK SYSTEM ====================

// Add ML feedback from user corrections
function addMLFeedback(requirementId, userCorrection, originalClassification) {
    const requirement = classifiedRequirements.find(r => r.id === requirementId);
    if (!requirement) return;
    
    const feedback = {
        id: mlFeedback.length + 1,
        requirementId: requirementId,
        originalClassification: originalClassification,
        userCorrection: userCorrection,
        requirementText: requirement.text,
        timestamp: new Date().toISOString(),
        userId: currentUser ? currentUser.id : null,
        applied: false,
        reviewed: false
    };
    
    mlFeedback.push(feedback);
    localStorage.setItem('mlFeedback', JSON.stringify(mlFeedback));
    
    // Update patterns based on correction
    updateClassificationPatterns(requirement.text, userCorrection.type, userCorrection.category);
    
    updateMLFeedbackDisplay();
    
    logAuditEvent('ML_FEEDBACK', 'User provided ML feedback', {
        requirementId: requirementId,
        original: originalClassification.type,
        corrected: userCorrection.type
    });
}

// Update classification patterns based on feedback
function updateClassificationPatterns(text, correctedType, correctedCategory) {
    const words = text.toLowerCase().split(/\W+/).filter(word => word.length > 3);
    const relevantWords = words.slice(0, 5); // Take first 5 meaningful words
    
    relevantWords.forEach(word => {
        const patternType = correctedType === 'functional' ? 'functional' : 'nonFunctional';
        const existingPattern = classificationPatterns[patternType].find(p => 
            p.pattern.includes(word));
        
        if (existingPattern) {
            // Increase weight
            existingPattern.weight = Math.min(0.95, existingPattern.weight + 0.1);
        } else {
            // Add new pattern
            classificationPatterns[patternType].push({
                pattern: word,
                weight: 0.7,
                category: correctedCategory
            });
        }
    });
    
    localStorage.setItem('classificationPatterns', JSON.stringify(classificationPatterns));
}

// Apply ML improvements to classification system
function applyMLImprovements() {
    const unappliedFeedback = mlFeedback.filter(f => !f.applied);
    
    if (unappliedFeedback.length === 0) {
        showAlert('No new feedback to apply', 'info');
        return;
    }
    
    let improvementsApplied = 0;
    
    unappliedFeedback.forEach(feedback => {
        if (!feedback.applied) {
            updateClassificationPatterns(
                feedback.requirementText,
                feedback.userCorrection.type,
                feedback.userCorrection.category
            );
            
            feedback.applied = true;
            feedback.appliedAt = new Date().toISOString();
            improvementsApplied++;
        }
    });
    
    localStorage.setItem('mlFeedback', JSON.stringify(mlFeedback));
    localStorage.setItem('classificationPatterns', JSON.stringify(classificationPatterns));
    
    showAlert(`Applied ${improvementsApplied} ML improvements to classification system`, 'success');
    
    logAuditEvent('ML_IMPROVEMENTS', 'ML improvements applied', {
        improvementsApplied: improvementsApplied
    });
}

// Display ML feedback
function updateMLFeedbackDisplay() {
    const feedbackList = document.getElementById('mlFeedbackList');
    if (!feedbackList) return;
    
    feedbackList.innerHTML = '';
    
    const recentFeedback = mlFeedback
        .filter(f => !f.applied)
        .slice(-3); // Show last 3 unapplied feedback items
    
    if (recentFeedback.length === 0) {
        feedbackList.innerHTML = `
            <div class="text-center py-3">
                <i class="fas fa-check-circle fa-2x text-success mb-2"></i>
                <p class="text-muted mb-0">No pending feedback</p>
                <small class="text-muted">All ML feedback has been applied</small>
            </div>
        `;
        return;
    }
    
    recentFeedback.forEach(feedback => {
        const feedbackItem = document.createElement('div');
        feedbackItem.className = `feedback-item ${feedback.applied ? 'feedback-correct' : 'feedback-incorrect'}`;
        feedbackItem.innerHTML = `
            <div class="d-flex justify-content-between align-items-start">
                <div>
                    <small><strong>Correction #${feedback.id}</strong></small>
                    <p class="mb-1 small">${feedback.requirementText.substring(0, 100)}...</p>
                </div>
                <small class="text-muted">${new Date(feedback.timestamp).toLocaleTimeString()}</small>
            </div>
            <div class="feedback-controls mt-2">
                <div class="d-flex align-items-center">
                    <small class="me-3">
                        Original: <span class="badge bg-secondary">${feedback.originalClassification.type}</span>
                    </small>
                    <small>
                        Corrected: <span class="badge bg-primary">${feedback.userCorrection.type}</span>
                    </small>
                </div>
                <div class="mt-2">
                    <button class="btn btn-sm btn-outline-success" onclick="markFeedbackApplied(${feedback.id})">
                        <i class="fas fa-check me-1"></i>Mark Applied
                    </button>
                    <button class="btn btn-sm btn-outline-danger ms-2" onclick="dismissFeedback(${feedback.id})">
                        <i class="fas fa-times me-1"></i>Dismiss
                    </button>
                </div>
            </div>
        `;
        feedbackList.appendChild(feedbackItem);
    });
}

// ==================== SECURITY & AUDIT FUNCTIONS ====================

// Log audit events
function logAuditEvent(event, action, details = {}) {
    const logEntry = {
        id: auditLog.length + 1,
        timestamp: new Date().toISOString(),
        event: event,
        action: action,
        userId: currentUser ? currentUser.id : null,
        userName: currentUser ? currentUser.name : null,
        details: details,
        ipAddress: 'local',
        severity: getEventSeverity(event)
    };
    
    auditLog.push(logEntry);
    
    // Keep only last 1000 entries
    if (auditLog.length > 1000) {
        auditLog = auditLog.slice(-1000);
    }
    
    localStorage.setItem('auditLog', JSON.stringify(auditLog));
}

function getEventSeverity(event) {
    const highSeverityEvents = ['AUTH_FAILURE', 'DATA_BREACH', 'SYSTEM_ERROR', 'SECURITY_VIOLATION'];
    const mediumSeverityEvents = ['USER_REGISTRATION', 'PROJECT_DELETED', 'EXPORT_DATA', 'CLASSIFICATION_OVERRIDE'];
    
    if (highSeverityEvents.includes(event)) return 'danger';
    if (mediumSeverityEvents.includes(event)) return 'warning';
    return 'info';
}

// Show audit log
function showAuditLog() {
    const recentEntries = auditLog.slice(-50).reverse(); // Show last 50 entries
    
    const modalContent = `
        <div class="modal-header">
            <h5 class="modal-title"><i class="fas fa-history me-2"></i>System Audit Log</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
            <div class="d-flex justify-content-between mb-3">
                <div>
                    <button class="btn btn-sm btn-outline-primary" onclick="exportAuditLog()">
                        <i class="fas fa-download me-1"></i>Export Log
                    </button>
                    <button class="btn btn-sm btn-outline-info ms-2" onclick="filterAuditLog('danger')">
                        <i class="fas fa-exclamation-triangle me-1"></i>Show Critical
                    </button>
                </div>
                <small class="text-muted">Showing last 50 entries</small>
            </div>
            <div style="max-height: 400px; overflow-y: auto;">
                ${recentEntries.map(entry => {
                    const severityClass = `audit-log-${entry.severity}`;
                    const severityIcon = entry.severity === 'danger' ? 'fa-exclamation-triangle' : 
                                       entry.severity === 'warning' ? 'fa-exclamation-circle' : 'fa-info-circle';
                    return `
                        <div class="audit-log-entry ${severityClass}">
                            <div class="d-flex justify-content-between align-items-start">
                                <div>
                                    <i class="fas ${severityIcon} me-2"></i>
                                    <strong>${entry.event}</strong>
                                </div>
                                <small class="text-muted">${new Date(entry.timestamp).toLocaleTimeString()}</small>
                            </div>
                            <div class="mt-1">${entry.action}</div>
                            <div class="mt-1 small">
                                <span class="text-muted">User:</span> ${entry.userName || 'System'}
                                ${entry.details && Object.keys(entry.details).length > 0 ? 
                                    `<span class="ms-3 text-muted">Details:</span> ${JSON.stringify(entry.details)}` : ''}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
    
    showCustomModal('audit-log-modal', 'Audit Log', modalContent, 'lg');
}

// Export audit log
function exportAuditLog() {
    const exportData = {
        exported: new Date().toISOString(),
        exportedBy: currentUser ? currentUser.name : 'System',
        totalEntries: auditLog.length,
        logEntries: auditLog.slice(-100) // Last 100 entries
    };
    
    const exportString = JSON.stringify(exportData, null, 2);
    downloadFile(exportString, `audit-log-${new Date().toISOString().split('T')[0]}.json`);
    
    logAuditEvent('AUDIT_LOG_EXPORTED', 'Audit log exported', {
        entriesCount: exportData.logEntries.length
    });
    
    showAlert('Audit log exported successfully', 'success');
}

// ==================== INTERNATIONALIZATION ====================

// Change language
function changeLanguage(lang) {
    if (!i18nStrings[lang]) {
        lang = 'en'; // Default to English
    }
    
    localStorage.setItem('preferredLanguage', lang);
    
    // Set document direction for RTL languages
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    
    // Update UI text
    updateUIText(lang);
    
    // Update user preference if logged in
    if (currentUser) {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
            users[userIndex].preferences.language = lang;
            localStorage.setItem('users', JSON.stringify(users));
            currentUser = users[userIndex];
        }
    }
    
    showAlert(`Language changed to ${getLanguageName(lang)}`, 'info');
}

function getLanguageName(code) {
    const languages = {
        en: 'English',
        es: 'Spanish',
        fr: 'French',
        de: 'German',
        ar: 'Arabic'
    };
    return languages[code] || code;
}

// Update UI text with translations
function updateUIText(lang) {
    const strings = i18nStrings[lang] || i18nStrings['en'];
    
    // Update navigation
    const navbarBrand = document.querySelector('.navbar-brand');
    if (navbarBrand) {
        navbarBrand.innerHTML = navbarBrand.innerHTML.replace(/Requirements Classification System/, strings.system_name);
    }
    
    // Update buttons
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (strings[key]) {
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = strings[key];
            } else {
                element.textContent = strings[key];
            }
        }
    });
    
    // Update specific elements by ID or class
    const elements = {
        '#loginBtn': strings.login,
        '#userName': currentUser ? currentUser.name.split(' ')[0] : strings.welcome,
        '.system-info-panel h5': 'About This System', // Keep English for now
        '.card-header i + span': function(el) {
            const icon = el.previousElementSibling.className;
            if (icon.includes('fa-pencil-alt')) return strings.requirements;
            if (icon.includes('fa-tasks')) return 'Classified Requirements';
            if (icon.includes('fa-chart-pie')) return strings.analysis;
            return el.textContent;
        }
    };
    
    Object.entries(elements).forEach(([selector, value]) => {
        const element = document.querySelector(selector);
        if (element) {
            element.textContent = typeof value === 'function' ? value(element) : value;
        }
    });
}

// ==================== ORGANIZATION STANDARDS & COMPLIANCE ====================

// Apply project template standards
function applyProjectTemplate(template) {
    const templateConfig = organizationStandards.templates[template];
    if (!templateConfig) return;
    
    // Apply template-specific settings
    showAlert(`Applied ${templateConfig.name} template standards`, 'info');
    
    // Update current project settings
    if (currentProject) {
        currentProject.settings = {
            ...currentProject.settings,
            qualityThreshold: templateConfig.qualityThreshold,
            requirementFormat: templateConfig.requirementFormat
        };
    }
    
    logAuditEvent('TEMPLATE_APPLIED', 'Project template applied', {
        template: template,
        projectId: currentProject ? currentProject.id : null
    });
}

// Apply organization standards
function applyOrganizationStandards() {
    if (!currentProject) {
        showAlert('Please create or load a project first', 'warning');
        return;
    }
    
    const standards = organizationStandards;
    
    // Apply compliance frameworks
    const appliedFrameworks = Object.entries(standards.complianceFrameworks)
        .filter(([_, framework]) => framework.enabled)
        .map(([key, _]) => key);
    
    // Apply security level
    const securityLevel = standards.securityLevels.medium; // Default to medium
    
    // Update project with standards
    currentProject.complianceFrameworks = appliedFrameworks;
    currentProject.securityLevel = securityLevel.name;
    currentProject.qualityStandards = standards.qualityStandards;
    
    // Save updated project
    const projectIndex = projects.findIndex(p => p.id === currentProject.id);
    if (projectIndex !== -1) {
        projects[projectIndex] = currentProject;
        localStorage.setItem('projects', JSON.stringify(projects));
    }
    
    showAlert('Organization standards applied successfully', 'success');
    
    logAuditEvent('STANDARDS_APPLIED', 'Organization standards applied', {
        projectId: currentProject.id,
        frameworks: appliedFrameworks,
        securityLevel: securityLevel.name
    });
}

// Generate compliance report
function generateComplianceReport() {
    if (!currentProject) {
        showAlert('Please create or load a project first', 'warning');
        return;
    }
    
    const report = {
        generated: new Date().toISOString(),
        project: {
            id: currentProject.id,
            name: currentProject.name,
            type: currentProject.type,
            template: currentProject.template
        },
        organization: currentUser ? currentUser.organization : 'Not specified',
        generatedBy: currentUser ? currentUser.name : 'System',
        
        compliance: {
            frameworks: currentProject.complianceFrameworks || [],
            requirements: currentProject.compliance || {}
        },
        
        security: {
            level: currentProject.securityLevel || 'medium',
            features: organizationStandards.securityLevels[currentProject.securityLevel || 'medium']?.features || []
        },
        
        requirementsAnalysis: {
            total: classifiedRequirements.length,
            functional: classifiedRequirements.filter(r => r.type === 'functional').length,
            nonFunctional: classifiedRequirements.filter(r => r.type === 'non-functional').length,
            averageQuality: classifiedRequirements.length > 0 ? 
                (classifiedRequirements.reduce((sum, r) => sum + r.quality.score, 0) / classifiedRequirements.length).toFixed(1) : 0
        },
        
        qualityStandards: organizationStandards.qualityStandards,
        
        auditSummary: {
            totalAuditEntries: auditLog.length,
            last30Days: auditLog.filter(entry => 
                new Date(entry.timestamp) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            ).length
        },
        
        recommendations: generateComplianceRecommendations()
    };
    
    const reportString = JSON.stringify(report, null, 2);
    document.getElementById('exportPreview').textContent = reportString;
    downloadFile(reportString, `compliance-report-${currentProject.name}-${new Date().toISOString().split('T')[0]}.json`);
    
    logAuditEvent('COMPLIANCE_REPORT', 'Compliance report generated', {
        projectId: currentProject.id,
        reportName: `compliance-report-${currentProject.name}.json`
    });
    
    showAlert('Compliance report generated successfully', 'success');
}

function generateComplianceRecommendations() {
    const recommendations = [];
    
    // Check for missing compliance
    if (currentProject.type === 'medical' && !currentProject.compliance?.hipaa) {
        recommendations.push('Consider adding HIPAA compliance for healthcare projects');
    }
    
    if (currentProject.type === 'financial' && !currentProject.compliance?.pci) {
        recommendations.push('PCI DSS compliance recommended for financial projects');
    }
    
    // Check quality thresholds
    const avgQuality = classifiedRequirements.length > 0 ? 
        classifiedRequirements.reduce((sum, r) => sum + r.quality.score, 0) / classifiedRequirements.length : 0;
    
    if (avgQuality < 7) {
        recommendations.push(`Improve requirement quality (current average: ${avgQuality.toFixed(1)}/10)`);
    }
    
    // Check for security requirements
    const securityReqs = classifiedRequirements.filter(r => 
        r.category === 'security' || r.text.toLowerCase().includes('security') || r.text.toLowerCase().includes('encrypt')
    ).length;
    
    if (securityReqs < 2 && currentProject.securityLevel === 'high') {
        recommendations.push('Add more security-specific requirements for high security projects');
    }
    
    return recommendations.length > 0 ? recommendations : ['All compliance standards met'];
}

// ==================== MAIN CLASSIFICATION FUNCTION ====================

function classifyRequirements() {
    const inputText = document.getElementById('requirementInput').value;
    const loadingIndicator = document.getElementById('loadingIndicator');
    const outputContainer = document.getElementById('requirementsOutput');
    
    if (!inputText || !inputText.trim()) {
        showAlert('Please enter some requirements to classify.', 'warning');
        return;
    }
    
    // Check permission
    if (!checkPermission('classify')) {
        showAlert('You do not have permission to classify requirements', 'danger');
        return;
    }
    
    // Show loading indicator
    loadingIndicator.style.display = 'block';
    outputContainer.innerHTML = '<p class="text-muted text-center py-4">Classifying requirements...</p>';
    
    // Add slight delay to show loading
    setTimeout(() => {
        try {
            // Process requirements
            const requirements = inputText.split('\n')
                .filter(req => req.trim() !== '')
                .map(req => req.trim());
            
            if (requirements.length === 0) {
                throw new Error('No valid requirements found after filtering');
            }
            
            classifiedRequirements = [];
            outputContainer.innerHTML = '';
            
            // Classify each requirement with ML enhancement
            for (let i = 0; i < requirements.length; i++) {
                const req = requirements[i];
                const classification = enhancedClassificationWithML(req);
                
                // Store classified requirement
                classifiedRequirements.push({
                    id: i + 1,
                    text: req,
                    ...classification,
                    classifiedAt: new Date().toISOString(),
                    classifiedBy: currentUser ? currentUser.id : null
                });
                
                // Display requirement with override options
                displayRequirement(i + 1, req, classification);
            }
            
            // Update statistics and charts
            updateStatistics();
            updateQualityChart();
            
            // Track quality improvement
            trackQualityImprovement();
            
            // Log classification event
            logAuditEvent('CLASSIFICATION', 'Requirements classified', {
                count: classifiedRequirements.length,
                projectId: currentProject ? currentProject.id : null
            });
            
        } catch (error) {
            console.error('Classification error:', error);
            outputContainer.innerHTML = `
                <div class="alert alert-danger">
                    <h6><i class="fas fa-exclamation-triangle me-2"></i>Classification Error</h6>
                    <p class="mb-1">Error classifying requirements: ${error.message}</p>
                    <small class="text-muted">Please check your input and try again.</small>
                </div>
            `;
            
            logAuditEvent('CLASSIFICATION_ERROR', 'Classification failed', {
                error: error.message
            });
        } finally {
            // Hide loading indicator
            loadingIndicator.style.display = 'none';
        }
    }, 500);
}

// Display requirement with override options
function displayRequirement(id, text, classification) {
    const outputContainer = document.getElementById('requirementsOutput');
    
    const requirementItem = document.createElement('div');
    requirementItem.className = `requirement-item ${classification.type}`;
    requirementItem.setAttribute('data-requirement-id', id);
    
    // Determine confidence class
    const confidenceClass = classification.confidence >= 0.8 ? 'confidence-high' : 
                          classification.confidence >= 0.6 ? 'confidence-medium' : 'confidence-low';
    
    // Determine quality badge class
    const qualityBadgeClass = `quality-${classification.quality.level}`;
    
    requirementItem.innerHTML = `
        <div class="d-flex justify-content-between align-items-start mb-2">
            <div>
                <span class="tag tag-${classification.type}">
                    ${classification.type === 'non-functional' ? 'Non-Functional' : 'Functional'}
                </span>
                <span class="tag tag-category">${classification.category}</span>
                <small class="text-muted ms-2">
                    Confidence: ${Math.round(classification.confidence * 100)}%
                </small>
                ${currentUser ? `
                    <div class="btn-group btn-group-sm ms-3">
                        <button class="btn btn-outline-primary btn-sm" onclick="overrideClassification(${id}, 'functional')" 
                                title="Mark as Functional">
                            <i class="fas fa-check-circle me-1"></i>F
                        </button>
                        <button class="btn btn-outline-danger btn-sm" onclick="overrideClassification(${id}, 'non-functional')"
                                title="Mark as Non-Functional">
                            <i class="fas fa-times-circle me-1"></i>NF
                        </button>
                    </div>
                ` : ''}
            </div>
            <small class="text-muted">#${id}</small>
        </div>
        <p class="mb-2">${escapeHtml(text)}</p>
        <div class="analysis-result">
            <small><strong>Analysis:</strong> ${classification.analysis}</small>
        </div>
        <div class="requirement-quality">
            <span class="quality-badge ${qualityBadgeClass}">
                Quality: ${classification.quality.score}/10
            </span>
            ${classification.quality.issues && classification.quality.issues.length > 0 ? `
                <button class="btn btn-link btn-sm text-danger" onclick="showQualityIssues(${id})" 
                        title="Show quality issues">
                    <i class="fas fa-exclamation-circle"></i>
                </button>
            ` : ''}
        </div>
        ${classification.quality.issues && classification.quality.issues.length > 0 ? `
            <div class="quality-issues" id="quality-issues-${id}" style="display: none;">
                <small><strong>Quality Issues:</strong></small>
                <ul class="mb-1">
                    ${classification.quality.issues.map(issue => `<li>${escapeHtml(issue)}</li>`).join('')}
                </ul>
            </div>
        ` : ''}
        <div class="confidence-bar">
            <div class="confidence-fill ${confidenceClass}" 
                 style="width: ${classification.confidence * 100}%"></div>
        </div>
    `;
    
    outputContainer.appendChild(requirementItem);
}

// Manual classification override
function overrideClassification(requirementId, newType) {
    if (!checkPermission('edit_requirements')) {
        showAlert('You do not have permission to override classifications', 'danger');
        return;
    }
    
    const requirement = classifiedRequirements.find(r => r.id === requirementId);
    if (!requirement) {
        showAlert('Requirement not found', 'danger');
        return;
    }
    
    const originalClassification = {
        type: requirement.type,
        category: requirement.category,
        confidence: requirement.confidence
    };
    
    // Update the requirement
    requirement.type = newType;
    requirement.category = newType === 'functional' ? 'manual_override' : 'manual_override';
    requirement.confidence = 1.0;
    requirement.analysis = `Manually classified as ${newType} by ${currentUser ? currentUser.name : 'user'}`;
    requirement.overriddenAt = new Date().toISOString();
    requirement.overriddenBy = currentUser ? currentUser.id : null;
    
    // Add ML feedback
    addMLFeedback(requirementId, {
        type: newType,
        category: 'manual_override'
    }, originalClassification);
    
    // Update display
    const requirementElement = document.querySelector(`[data-requirement-id="${requirementId}"]`);
    if (requirementElement) {
        requirementElement.className = `requirement-item ${newType}`;
        
        // Update type tag
        const typeTag = requirementElement.querySelector('.tag');
        if (typeTag) {
            typeTag.className = `tag tag-${newType}`;
            typeTag.textContent = newType === 'non-functional' ? 'Non-Functional' : 'Functional';
        }
        
        // Update analysis
        const analysisDiv = requirementElement.querySelector('.analysis-result small');
        if (analysisDiv) {
            analysisDiv.innerHTML = `<strong>Analysis:</strong> ${requirement.analysis}`;
        }
    }
    
    // Update statistics
    updateStatistics();
    
    showAlert(`Classification overridden to ${newType}`, 'info');
    
    logAuditEvent('CLASSIFICATION_OVERRIDE', 'Requirement classification overridden', {
        requirementId: requirementId,
        originalType: originalClassification.type,
        newType: newType,
        projectId: currentProject ? currentProject.id : null
    });
}

// ==================== EXPORT & INTEGRATION FUNCTIONS ====================

// Export to Jira format
function exportToJira() {
    if (classifiedRequirements.length === 0) {
        showAlert('No requirements to export.', 'warning');
        return;
    }
    
    let jiraFormat = "h2. Requirements Analysis Report\n\n";
    jiraFormat += "*Generated on:* " + new Date().toLocaleString() + "\n";
    jiraFormat += "*Project:* " + (currentProject ? currentProject.name : 'No Project') + "\n";
    jiraFormat += "*Generated by:* " + (currentUser ? currentUser.name : 'System') + "\n\n";
    
    jiraFormat += "h3. Functional Requirements\n";
    jiraFormat += "||#||Requirement||Category||Quality||\n";
    
    classifiedRequirements.filter(req => req.type === 'functional').forEach(req => {
        jiraFormat += `| ${req.id} | ${req.text} | ${req.category} | ${req.quality.score}/10 |\n`;
    });
    
    jiraFormat += "\nh3. Non-Functional Requirements\n";
    jiraFormat += "||#||Requirement||Category||Quality||\n";
    
    classifiedRequirements.filter(req => req.type === 'non-functional').forEach(req => {
        jiraFormat += `| ${req.id} | ${req.text} | ${req.category} | ${req.quality.score}/10 |\n`;
    });
    
    jiraFormat += "\nh3. Quality Summary\n";
    jiraFormat += "* Total Requirements: " + classifiedRequirements.length + "\n";
    jiraFormat += "* Functional: " + classifiedRequirements.filter(req => req.type === 'functional').length + "\n";
    jiraFormat += "* Non-Functional: " + classifiedRequirements.filter(req => req.type === 'non-functional').length + "\n";
    
    const avgQuality = classifiedRequirements.length > 0 ? 
        (classifiedRequirements.reduce((sum, req) => sum + req.quality.score, 0) / classifiedRequirements.length).toFixed(1) : 0;
    jiraFormat += "* Average Quality Score: " + avgQuality + "/10\n";
    
    document.getElementById('exportPreview').textContent = jiraFormat;
    downloadFile(jiraFormat, 'requirements-jira-format.txt');
    
    logAuditEvent('EXPORT_JIRA', 'Exported requirements to Jira format', {
        count: classifiedRequirements.length
    });
}

// Export to Trello format
function exportToTrello() {
    if (classifiedRequirements.length === 0) {
        showAlert('No requirements to export.', 'warning');
        return;
    }
    
    let trelloFormat = "REQUIREMENTS ANALYSIS\n";
    trelloFormat += "=====================\n\n";
    trelloFormat += "Generated: " + new Date().toLocaleString() + "\n";
    trelloFormat += "Project: " + (currentProject ? currentProject.name : 'No Project') + "\n";
    trelloFormat += "Generated by: " + (currentUser ? currentUser.name : 'System') + "\n\n";
    
    trelloFormat += "FUNCTIONAL REQUIREMENTS:\n";
    trelloFormat += "----------------------\n\n";
    
    classifiedRequirements.filter(req => req.type === 'functional').forEach((req, index) => {
        trelloFormat += `CARD ${index + 1}: ${req.text}\n`;
        trelloFormat += `Type: Functional\n`;
        trelloFormat += `Category: ${req.category}\n`;
        trelloFormat += `Quality Score: ${req.quality.score}/10\n`;
        trelloFormat += `Confidence: ${Math.round(req.confidence * 100)}%\n`;
        if (req.quality.issues.length > 0) {
            trelloFormat += `Issues: ${req.quality.issues.join(', ')}\n`;
        }
        trelloFormat += "\n";
    });
    
    trelloFormat += "NON-FUNCTIONAL REQUIREMENTS:\n";
    trelloFormat += "-------------------------\n\n";
    
    classifiedRequirements.filter(req => req.type === 'non-functional').forEach((req, index) => {
        trelloFormat += `CARD ${index + 1}: ${req.text}\n`;
        trelloFormat += `Type: Non-Functional\n`;
        trelloFormat += `Category: ${req.category}\n`;
        trelloFormat += `Quality Score: ${req.quality.score}/10\n`;
        trelloFormat += `Confidence: ${Math.round(req.confidence * 100)}%\n`;
        if (req.quality.issues.length > 0) {
            trelloFormat += `Issues: ${req.quality.issues.join(', ')}\n`;
        }
        trelloFormat += "\n";
    });
    
    document.getElementById('exportPreview').textContent = trelloFormat;
    downloadFile(trelloFormat, 'requirements-trello-format.txt');
    
    logAuditEvent('EXPORT_TRELLO', 'Exported requirements to Trello format', {
        count: classifiedRequirements.length
    });
}

// Generate PDF Report
function generatePDFReport() {
    let report = "REQUIREMENTS ANALYSIS REPORT\n";
    report += "============================\n\n";
    
    report += "EXECUTIVE SUMMARY:\n";
    report += "-----------------\n";
    report += `Generated: ${new Date().toLocaleString()}\n`;
    report += `Project: ${currentProject ? currentProject.name : 'No Project'}\n`;
    report += `Generated by: ${currentUser ? currentUser.name : 'System'}\n`;
    report += `Organization: ${currentUser ? currentUser.organization : 'Not specified'}\n\n`;
    
    report += "STATISTICS:\n";
    report += "-----------\n";
    report += `Total Requirements: ${classifiedRequirements.length}\n`;
    report += `Functional Requirements: ${classifiedRequirements.filter(req => req.type === 'functional').length}\n`;
    report += `Non-Functional Requirements: ${classifiedRequirements.filter(req => req.type === 'non-functional').length}\n`;
    
    const avgQuality = classifiedRequirements.length > 0 ? 
        (classifiedRequirements.reduce((sum, req) => sum + req.quality.score, 0) / classifiedRequirements.length).toFixed(1) : 0;
    report += `Average Quality Score: ${avgQuality}/10\n\n`;
    
    report += "DETAILED ANALYSIS:\n";
    report += "-----------------\n\n";
    
    classifiedRequirements.forEach((req, index) => {
        report += `REQUIREMENT ${index + 1}:\n`;
        report += `  Text: ${req.text}\n`;
        report += `  Type: ${req.type}\n`;
        report += `  Category: ${req.category}\n`;
        report += `  Confidence: ${Math.round(req.confidence * 100)}%\n`;
        report += `  Quality Score: ${req.quality.score}/10 (${req.quality.level})\n`;
        report += `  Analysis: ${req.analysis}\n`;
        if (req.quality.issues.length > 0) {
            report += `  Quality Issues:\n`;
            req.quality.issues.forEach(issue => {
                report += `    - ${issue}\n`;
            });
        }
        report += "\n";
    });
    
    report += "QUALITY DISTRIBUTION:\n";
    report += "--------------------\n";
    const excellent = classifiedRequirements.filter(req => req.quality.level === 'excellent').length;
    const good = classifiedRequirements.filter(req => req.quality.level === 'good').length;
    const fair = classifiedRequirements.filter(req => req.quality.level === 'fair').length;
    const poor = classifiedRequirements.filter(req => req.quality.level === 'poor').length;
    
    report += `Excellent (9-10): ${excellent}\n`;
    report += `Good (7-8): ${good}\n`;
    report += `Fair (5-6): ${fair}\n`;
    report += `Poor (1-4): ${poor}\n\n`;
    
    if (currentProject && currentProject.compliance) {
        report += "COMPLIANCE SUMMARY:\n";
        report += "------------------\n";
        Object.entries(currentProject.compliance).forEach(([key, value]) => {
            if (value) {
                report += `  • ${key.toUpperCase()}: Yes\n`;
            }
        });
        report += "\n";
    }
    
    report += "RECOMMENDATIONS:\n";
    report += "---------------\n";
    if (avgQuality < 7) {
        report += "1. Improve requirement quality by making them more specific and measurable\n";
    }
    if (classifiedRequirements.filter(req => req.type === 'non-functional').length < 3) {
        report += "2. Add more non-functional requirements (performance, security, reliability)\n";
    }
    if (classifiedRequirements.length > 20 && excellent + good < classifiedRequirements.length * 0.7) {
        report += "3. Review and refine requirements to improve overall quality\n";
    }
    
    document.getElementById('exportPreview').textContent = report;
    downloadFile(report, `requirements-report-${new Date().toISOString().split('T')[0]}.txt`);
    
    logAuditEvent('EXPORT_PDF', 'Generated PDF report', {
        count: classifiedRequirements.length,
        avgQuality: avgQuality
    });
    
    showAlert('PDF report generated successfully', 'success');
}

// Export to JSON
function exportToJSON() {
    const exportData = {
        exportInfo: {
            timestamp: new Date().toISOString(),
            version: '1.0',
            system: 'Requirements Classification System'
        },
        user: currentUser ? {
            id: currentUser.id,
            name: currentUser.name,
            email: currentUser.email,
            organization: currentUser.organization
        } : null,
        project: currentProject ? {
            id: currentProject.id,
            name: currentProject.name,
            description: currentProject.description
        } : null,
        requirements: classifiedRequirements.map(req => ({
            ...req,
            // Remove circular references if any
            classifiedAt: req.classifiedAt,
            classifiedBy: req.classifiedBy
        })),
        statistics: {
            total: classifiedRequirements.length,
            functional: classifiedRequirements.filter(req => req.type === 'functional').length,
            nonFunctional: classifiedRequirements.filter(req => req.type === 'non-functional').length,
            averageQuality: classifiedRequirements.length > 0 ? 
                (classifiedRequirements.reduce((sum, req) => sum + req.quality.score, 0) / classifiedRequirements.length).toFixed(1) : 0
        },
        charts: {
            requirementsDistribution: requirementsChart ? requirementsChart.data.datasets[0].data : [0, 0],
            qualityDistribution: qualityChart ? qualityChart.data.datasets[0].data : [0, 0, 0, 0]
        }
    };
    
    const jsonString = JSON.stringify(exportData, null, 2);
    document.getElementById('exportPreview').textContent = jsonString;
    downloadFile(jsonString, `requirements-export-${new Date().toISOString().split('T')[0]}.json`);
    
    logAuditEvent('EXPORT_JSON', 'Exported requirements as JSON', {
        count: classifiedRequirements.length
    });
    
    showAlert('JSON export completed successfully', 'success');
}

// ==================== HELPER FUNCTIONS ====================

// Update statistics and charts
function updateStatistics() {
    const functionalItems = classifiedRequirements.filter(req => req.type === 'functional').length;
    const nonFunctionalItems = classifiedRequirements.filter(req => req.type === 'non-functional').length;
    
    const functionalCount = document.getElementById('functionalCount');
    const nonFunctionalCount = document.getElementById('nonFunctionalCount');
    
    if (functionalCount) functionalCount.textContent = functionalItems;
    if (nonFunctionalCount) nonFunctionalCount.textContent = nonFunctionalItems;
    
    // Update chart
    if (requirementsChart) {
        requirementsChart.data.datasets[0].data = [functionalItems, nonFunctionalItems];
        requirementsChart.update();
    }
}

// Update quality chart
function updateQualityChart() {
    const qualityCounts = {
        excellent: 0,
        good: 0,
        fair: 0,
        poor: 0
    };
    
    let totalScore = 0;
    
    classifiedRequirements.forEach(req => {
        qualityCounts[req.quality.level]++;
        totalScore += req.quality.score;
    });
    
    const averageScore = classifiedRequirements.length > 0 ? 
        (totalScore / classifiedRequirements.length).toFixed(1) : '0';
    
    const qualityScore = document.getElementById('qualityScore');
    if (qualityScore) qualityScore.textContent = averageScore;
    
    // Update quality chart
    if (qualityChart) {
        qualityChart.data.datasets[0].data = [
            qualityCounts.excellent,
            qualityCounts.good,
            qualityCounts.fair,
            qualityCounts.poor
        ];
        qualityChart.update();
    }
}

// Track quality improvement over time
function trackQualityImprovement() {
    if (!currentProject) return;
    
    const projectHistory = JSON.parse(localStorage.getItem('projectHistory') || '{}');
    const projectId = currentProject.id;
    
    if (!projectHistory[projectId]) {
        projectHistory[projectId] = [];
    }
    
    const qualitySnapshot = {
        timestamp: new Date().toISOString(),
        totalRequirements: classifiedRequirements.length,
        averageQuality: classifiedRequirements.length > 0 ? 
            (classifiedRequirements.reduce((sum, r) => sum + r.quality.score, 0) / classifiedRequirements.length).toFixed(1) : 0,
        functionalCount: classifiedRequirements.filter(r => r.type === 'functional').length,
        nonFunctionalCount: classifiedRequirements.filter(r => r.type === 'non-functional').length,
        qualityDistribution: {
            excellent: classifiedRequirements.filter(r => r.quality.level === 'excellent').length,
            good: classifiedRequirements.filter(r => r.quality.level === 'good').length,
            fair: classifiedRequirements.filter(r => r.quality.level === 'fair').length,
            poor: classifiedRequirements.filter(r => r.quality.level === 'poor').length
        }
    };
    
    projectHistory[projectId].push(qualitySnapshot);
    
    // Keep only last 100 snapshots
    if (projectHistory[projectId].length > 100) {
        projectHistory[projectId] = projectHistory[projectId].slice(-100);
    }
    
    localStorage.setItem('projectHistory', JSON.stringify(projectHistory));
}

// Check user permissions
function checkPermission(action) {
    if (!currentUser) return false;
    
    const permissions = {
        admin: ['all'],
        project_manager: ['create_project', 'delete_project', 'export_data', 'view_reports', 'manage_team'],
        requirement_engineer: ['classify', 'edit_requirements', 'save_project', 'view_reports'],
        quality_analyst: ['classify', 'view_reports', 'analyze_quality', 'export_data'],
        stakeholder: ['view_only']
    };
    
    const userPermissions = permissions[currentUser.role] || permissions.stakeholder;
    return userPermissions.includes('all') || userPermissions.includes(action);
}

// Show alert messages
function showAlert(message, type) {
    // Remove existing alerts
    const existingAlerts = document.querySelectorAll('.alert-dismissible');
    existingAlerts.forEach(alert => {
        alert.classList.remove('show');
        setTimeout(() => alert.remove(), 300);
    });
    
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 1050; max-width: 400px;';
    alertDiv.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'danger' ? 'fa-exclamation-circle' : 'fa-info-circle'} me-2"></i>
            <div>${message}</div>
        </div>
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.classList.remove('show');
            setTimeout(() => alertDiv.remove(), 300);
        }
    }, 5000);
}

// Show custom modal
function showCustomModal(id, title, content, size = '') {
    // Remove existing modal if any
    const existingModal = document.getElementById(id);
    if (existingModal) existingModal.remove();
    
    const modalDiv = document.createElement('div');
    modalDiv.id = id;
    modalDiv.className = 'modal fade';
    modalDiv.innerHTML = `
        <div class="modal-dialog ${size ? `modal-${size}` : ''}">
            <div class="modal-content">
                ${content}
            </div>
        </div>
    `;
    
    document.body.appendChild(modalDiv);
    
    const modal = new bootstrap.Modal(modalDiv);
    modal.show();
    
    // Clean up on hide
    modalDiv.addEventListener('hidden.bs.modal', () => {
        setTimeout(() => {
            if (modalDiv.parentNode) modalDiv.remove();
        }, 300);
    });
}

// Generate session ID
function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Download file
function downloadFile(content, filename) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Update UI for user
function updateUIForUser(user) {
    const userDropdown = document.getElementById('userDropdown');
    const loginBtn = document.getElementById('loginBtn');
    const projectFeatures = document.querySelectorAll('.project-feature');
    
    if (user) {
        if (userDropdown) userDropdown.style.display = 'block';
        if (loginBtn) loginBtn.style.display = 'none';
        
        const userName = document.getElementById('userName');
        if (userName) userName.textContent = user.name.split(' ')[0];
        
        // Show project management features
        projectFeatures.forEach(el => {
            el.style.display = 'block';
        });
        
        // Update step indicators to show project options
        const step2 = document.querySelector('.step[data-step="2"] .step-label');
        if (step2) step2.innerHTML = 'Classification & Save';
        
    } else {
        if (userDropdown) userDropdown.style.display = 'none';
        if (loginBtn) loginBtn.style.display = 'block';
        
        // Hide project management features
        projectFeatures.forEach(el => {
            el.style.display = 'none';
        });
        
        // Reset step indicators
        const step2 = document.querySelector('.step[data-step="2"] .step-label');
        if (step2) step2.textContent = 'Classification';
    }
}

// Update current project indicator
function updateCurrentProjectIndicator() {
    const indicator = document.getElementById('currentProjectIndicator');
    if (!indicator) return;
    
    if (currentProject) {
        indicator.innerHTML = `
            <span class="badge bg-primary">
                <i class="fas fa-folder me-1"></i>${currentProject.name}
            </span>
        `;
        indicator.style.display = 'inline-block';
    } else {
        indicator.style.display = 'none';
    }
}

// Increment version number
function incrementVersion(version) {
    if (!version) return '1.0';
    
    const parts = version.split('.');
    if (parts.length === 2) {
        const minor = parseInt(parts[1]) + 1;
        return `${parts[0]}.${minor}`;
    }
    return version;
}

// Show login modal
function showLoginModal() {
    showLoginForm();
    const authModal = new bootstrap.Modal(document.getElementById('authModal'));
    authModal.show();
}

function showLoginForm() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('authModalTitle').textContent = 'Login to System';
}

function showRegisterForm() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
    document.getElementById('authModalTitle').textContent = 'Create Account';
}

// Show quality issues
function showQualityIssues(requirementId) {
    const issuesDiv = document.getElementById(`quality-issues-${requirementId}`);
    if (issuesDiv) {
        issuesDiv.style.display = issuesDiv.style.display === 'none' ? 'block' : 'none';
    }
}

// Show user profile
function showUserProfile() {
    if (!currentUser) return;
    
    const modalContent = `
        <div class="modal-header">
            <h5 class="modal-title"><i class="fas fa-user-circle me-2"></i>User Profile</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
            <div class="text-center mb-4">
                <div class="avatar-circle mb-3" style="width: 80px; height: 80px; background: linear-gradient(135deg, var(--primary-color), var(--secondary-color)); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; color: white; font-size: 2rem;">
                    ${currentUser.name.charAt(0).toUpperCase()}
                </div>
                <h4>${currentUser.name}</h4>
                <p class="text-muted">${currentUser.role.replace('_', ' ')}</p>
            </div>
            
            <div class="row">
                <div class="col-md-6">
                    <h6><i class="fas fa-envelope me-2"></i>Contact Information</h6>
                    <p><strong>Email:</strong> ${currentUser.email}</p>
                    <p><strong>Organization:</strong> ${currentUser.organization}</p>
                    <p><strong>Member Since:</strong> ${new Date(currentUser.createdAt).toLocaleDateString()}</p>
                </div>
                <div class="col-md-6">
                    <h6><i class="fas fa-chart-bar me-2"></i>Statistics</h6>
                    <p><strong>Last Login:</strong> ${currentUser.lastLogin ? new Date(currentUser.lastLogin).toLocaleString() : 'Never'}</p>
                    <p><strong>Projects:</strong> ${projects.filter(p => p.createdBy === currentUser.id).length}</p>
                    <p><strong>Role:</strong> ${currentUser.role.replace('_', ' ')}</p>
                </div>
            </div>
            
            <div class="mt-4">
                <h6><i class="fas fa-cog me-2"></i>Preferences</h6>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="autoSavePref" ${currentUser.preferences?.autoSave ? 'checked' : ''}>
                    <label class="form-check-label" for="autoSavePref">Auto-save projects</label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="notificationsPref" ${currentUser.preferences?.notifications ? 'checked' : ''}>
                    <label class="form-check-label" for="notificationsPref">Enable notifications</label>
                </div>
            </div>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-primary" onclick="updateUserPreferences()">Save Preferences</button>
        </div>
    `;
    
    showCustomModal('profile-modal', 'User Profile', modalContent);
}

// Update user preferences
function updateUserPreferences() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    
    if (userIndex !== -1) {
        users[userIndex].preferences = {
            ...users[userIndex].preferences,
            autoSave: document.getElementById('autoSavePref').checked,
            notifications: document.getElementById('notificationsPref').checked
        };
        
        localStorage.setItem('users', JSON.stringify(users));
        currentUser = users[userIndex];
        
        showAlert('Preferences updated successfully', 'success');
        
        const profileModal = bootstrap.Modal.getInstance(document.getElementById('profile-modal'));
        if (profileModal) profileModal.hide();
    }
}

// ==================== SAMPLE DATA FUNCTIONS ====================

function loadSampleData(type) {
    let sampleData = '';
    
    switch(type) {
        case 'functional':
            sampleData = `As a user, I want to be able to log in to the system using my email and password so that I can access my personal dashboard.
As an admin, I need to manage user accounts, including creating, editing, and deleting accounts.
Users should be able to search for products by name, category, or price range.
As a user, I want to create an account using my email and password so that I can access personalized features.
The system shall allow users to upload profile pictures in JPEG or PNG format.
Users must be able to reset their password via email verification.
The application shall provide a shopping cart where users can add, remove, and update items.
Users should receive email notifications for order confirmations and shipping updates.
The system must allow administrators to generate sales reports for any date range.
Users shall be able to track their order status in real-time.`;
            break;
            
        case 'non-functional':
            sampleData = `The system should respond to user actions within 2 seconds to ensure a smooth user experience.
The application must be available 99.9% of the time with proper error handling and logging.
The system must support at least 10,000 concurrent users without performance degradation.
All user data must be encrypted both in transit (SSL/TLS) and at rest (AES-256).
The user interface shall be compatible with the latest versions of Chrome, Firefox, and Safari.
The system must maintain data integrity with automatic backups every 24 hours.
The application shall comply with GDPR regulations for European users.
The search functionality must return results within 500 milliseconds for queries up to 10,000 items.
User sessions shall expire after 30 minutes of inactivity for security purposes.
The system must support internationalization with at least English, Spanish, and French languages.`;
            break;
            
        case 'mixed':
            sampleData = `As a user, I want to be able to log in to the system using my email and password so that I can access my personal dashboard.
The system should respond to user actions within 2 seconds to ensure a smooth user experience.
As an admin, I need to manage user accounts, including creating, editing, and deleting accounts.
The application must be available 99.9% of the time with proper error handling and logging.
Users should be able to search for products by name, category, or price range.
The system must support at least 10,000 concurrent users without performance degradation.
All user data must be encrypted both in transit (SSL/TLS) and at rest (AES-256).
The system shall allow users to upload profile pictures in JPEG or PNG format.
The user interface shall be compatible with the latest versions of Chrome, Firefox, and Safari.
Users must be able to reset their password via email verification for security.`;
            break;
    }
    
    document.getElementById('requirementInput').value = sampleData;
    
    // Switch to text input tab
    document.querySelectorAll('.input-method-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.input-method-content').forEach(content => content.classList.remove('active'));
    document.querySelector('.input-method-tab[data-method="text"]').classList.add('active');
    document.getElementById('text-input').classList.add('active');
}

// Test function
function testClassification() {
    const testRequirements = [
        "As a user, I want to be able to log in to the system using my email and password so that I can access my personal dashboard.",
        "The system should respond to user actions within 2 seconds to ensure a smooth user experience.",
        "As an admin, I need to manage user accounts, including creating, editing, and deleting accounts.",
        "The application must be available 99.9% of the time with proper error handling and logging.",
        "Users should be able to search for products by name, category, or price range.",
        "All user data must be encrypted both in transit (SSL/TLS) and at rest (AES-256)."
    ];
    
    document.getElementById('requirementInput').value = testRequirements.join('\n');
    classifyRequirements();
}

// ==================== NAVIGATION FUNCTIONS ====================

function navigateToStep(stepNumber) {
    // Update step indicator
    document.querySelectorAll('.step').forEach(step => {
        step.classList.remove('active', 'completed');
    });

    for (let i = 1; i <= stepNumber; i++) {
        const step = document.querySelector(`.step[data-step="${i}"]`);
        if (i < stepNumber) {
            step.classList.add('completed');
        } else {
            step.classList.add('active');
        }
    }

    // Show corresponding section
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    const stepElement = document.getElementById(`step${stepNumber}`);
    if (stepElement) {
        stepElement.classList.add('active');
    }
    
    // Auto-generate content when navigating to steps 3 and 4
    if (stepNumber === 3) {
        setTimeout(() => {
            generateClassDiagram();
            generateUserStories();
        }, 100);
    } else if (stepNumber === 4) {
        const exportPreview = document.getElementById('exportPreview');
        if (exportPreview) {
            exportPreview.textContent = 'Select an export option to see preview...';
        }
    }
}

function startOver() {
    document.getElementById('requirementInput').value = '';
    classifiedRequirements = [];
    navigateToStep(1);
    
    // Reset charts
    if (requirementsChart) {
        requirementsChart.data.datasets[0].data = [0, 0];
        requirementsChart.update();
    }
    
    if (qualityChart) {
        qualityChart.data.datasets[0].data = [0, 0, 0, 0];
        qualityChart.update();
    }
    
    // Clear output
    const outputContainer = document.getElementById('requirementsOutput');
    if (outputContainer) {
        outputContainer.innerHTML = '<p class="text-muted text-center py-4">Classified requirements will appear here</p>';
    }
    
    showAlert('Started new classification session', 'info');
}

// ==================== INITIALIZATION ====================

// Main initialization function
document.addEventListener('DOMContentLoaded', function() {
    console.log('Enhanced Requirements Classification System initialized');
    
    // Initialize all systems
    initializeUserDatabase();
    initializeProjectDatabase();
    initializeMLFeedback();
    initializeAuditLog();
    initializeI18n();
    initializeOrganizationStandards();
    initializeCharts();
    
    // Check for existing session
    if (checkSession()) {
        console.log('User session found:', currentUser);
        updateUIForUser(currentUser);
        loadProjects();
        
        // Load preferred language
        const preferredLanguage = currentUser?.preferences?.language || 
                                 localStorage.getItem('preferredLanguage') || 'en';
        changeLanguage(preferredLanguage);
    } else {
        console.log('No active session found');
        updateUIForUser(null);
        
        // Set default language
        const preferredLanguage = localStorage.getItem('preferredLanguage') || 'en';
        changeLanguage(preferredLanguage);
    }
    
    // Set up input method tabs
    document.querySelectorAll('.input-method-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const method = this.getAttribute('data-method');
            
            // Update active tab
            document.querySelectorAll('.input-method-tab').forEach(t => {
                t.classList.remove('active');
            });
            this.classList.add('active');
            
            // Show corresponding content
            document.querySelectorAll('.input-method-content').forEach(content => {
                content.classList.remove('active');
            });
            const contentElement = document.getElementById(`${method}-input`);
            if (contentElement) {
                contentElement.classList.add('active');
            }
        });
    });
    
    // Set up step navigation
    document.querySelectorAll('.step').forEach(step => {
        step.addEventListener('click', function() {
            const stepNumber = parseInt(this.getAttribute('data-step'));
            navigateToStep(stepNumber);
        });
    });
    
    // Set up navigation buttons
    const nextStep1 = document.getElementById('nextStep1');
    if (nextStep1) {
        nextStep1.addEventListener('click', function() {
            navigateToStep(2);
            classifyRequirements();
        });
    }
    
    const prevStep2 = document.getElementById('prevStep2');
    if (prevStep2) {
        prevStep2.addEventListener('click', function() {
            navigateToStep(1);
        });
    }
    
    const nextStep2 = document.getElementById('nextStep2');
    if (nextStep2) {
        nextStep2.addEventListener('click', function() {
            navigateToStep(3);
        });
    }
    
    const prevStep3 = document.getElementById('prevStep3');
    if (prevStep3) {
        prevStep3.addEventListener('click', function() {
            navigateToStep(2);
        });
    }
    
    const nextStep3 = document.getElementById('nextStep3');
    if (nextStep3) {
        nextStep3.addEventListener('click', function() {
            navigateToStep(4);
        });
    }
    
    const prevStep4 = document.getElementById('prevStep4');
    if (prevStep4) {
        prevStep4.addEventListener('click', function() {
            navigateToStep(3);
        });
    }
    
    // Initialize speech recognition if supported
    initializeSpeechRecognition();
    
    // Add save project button if user is logged in
    if (currentUser) {
        const step2Buttons = document.querySelector('#step2 .d-flex.justify-content-between');
        if (step2Buttons) {
            const saveButton = document.createElement('button');
            saveButton.className = 'btn btn-success project-feature';
            saveButton.innerHTML = '<i class="fas fa-save me-2"></i>Save to Project';
            saveButton.onclick = saveCurrentProject;
            step2Buttons.insertBefore(saveButton, step2Buttons.querySelector('#nextStep2'));
        }
    }
    
    // Log system startup
    logAuditEvent('SYSTEM_START', 'System initialized successfully', {
        version: '2.0',
        user: currentUser ? currentUser.email : 'Guest'
    });
});

// Speech recognition initialization
function initializeSpeechRecognition() {
    const speechButton = document.getElementById('speechButton');
    const speechTranscript = document.getElementById('speechTranscript');
    
    if (!speechButton || !speechTranscript) return;
    
    if ('webkitSpeechRecognition' in window) {
        const recognition = new webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        
        recognition.onstart = function() {
            speechButton.classList.add('listening');
            speechTranscript.innerHTML = '<p class="text-muted">Listening... Speak your requirements clearly.</p>';
        };
        
        recognition.onresult = function(event) {
            let interimTranscript = '';
            let finalTranscript = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript + ' ';
                } else {
                    interimTranscript += transcript;
                }
            }
            
            speechTranscript.innerHTML = `
                <p>${finalTranscript}</p>
                ${interimTranscript ? `<p class="text-muted">${interimTranscript}</p>` : ''}
            `;
            
            // Update the textarea with speech input
            const requirementInput = document.getElementById('requirementInput');
            if (requirementInput) {
                requirementInput.value = finalTranscript.trim();
            }
        };
        
        recognition.onerror = function(event) {
            console.error('Speech recognition error', event.error);
            speechButton.classList.remove('listening');
            speechTranscript.innerHTML = `<p class="text-danger">Error: ${event.error}</p>`;
        };
        
        recognition.onend = function() {
            speechButton.classList.remove('listening');
        };
        
        speechButton.addEventListener('click', function() {
            if (speechButton.classList.contains('listening')) {
                recognition.stop();
            } else {
                recognition.start();
            }
        });
    } else {
        speechButton.disabled = true;
        speechButton.innerHTML = '<i class="fas fa-microphone-slash"></i>';
        speechTranscript.innerHTML = '<p class="text-danger">Speech recognition not supported in this browser.</p>';
    }
}

// ==================== MODEL GENERATION FUNCTIONS ====================

function generateClassDiagram() {
    const diagramCode = document.getElementById('classDiagramCode');
    
    if (!diagramCode) return;
    
    if (classifiedRequirements.length === 0) {
        diagramCode.textContent = 'No requirements available to generate class diagram.';
        return;
    }
    
    const entities = extractEntities(classifiedRequirements);
    let plantUmlCode = "@startuml\n";
    plantUmlCode += "title System Class Diagram\n\n";
    
    // Add classes
    entities.forEach(entity => {
        plantUmlCode += `class ${entity.name} {\n`;
        entity.attributes.forEach(attr => {
            plantUmlCode += `  ${attr}\n`;
        });
        plantUmlCode += "}\n\n";
    });
    
    // Add relationships
    plantUmlCode += generateRelationships(entities);
    plantUmlCode += "@enduml";
    
    diagramCode.textContent = plantUmlCode;
}

function extractEntities(requirements) {
    const entities = [];
    const nounPatterns = [
        /\b(user|customer|admin|manager|employee)\b/gi,
        /\b(product|item|service|goods)\b/gi,
        /\b(order|purchase|transaction|sale)\b/gi,
        /\b(invoice|bill|receipt|payment)\b/gi,
        /\b(category|type|group|classification)\b/gi,
        /\b(system|application|software|platform)\b/gi
    ];
    
    requirements.forEach(req => {
        nounPatterns.forEach(pattern => {
            const matches = req.text.match(pattern);
            if (matches) {
                matches.forEach(match => {
                    const entityName = match.charAt(0).toUpperCase() + match.slice(1);
                    if (!entities.find(e => e.name === entityName)) {
                        entities.push({
                            name: entityName,
                            attributes: extractAttributes(req.text, entityName)
                        });
                    }
                });
            }
        });
    });
    
    // Add default entities if none found
    if (entities.length === 0) {
        entities.push(
            { name: 'User', attributes: ['+id: String', '+name: String', '+email: String'] },
            { name: 'Product', attributes: ['+id: String', '+name: String', '+price: Number'] },
            { name: 'Order', attributes: ['+id: String', '+date: Date', '+total: Number'] }
        );
    }
    
    return entities;
}

function extractAttributes(requirement, entityName) {
    const attributes = [];
    
    if (requirement.toLowerCase().includes('name')) attributes.push('+name: String');
    if (requirement.toLowerCase().includes('email')) attributes.push('+email: String');
    if (requirement.toLowerCase().includes('date')) attributes.push('+date: Date');
    if (requirement.toLowerCase().includes('price') || requirement.toLowerCase().includes('cost')) 
        attributes.push('+price: Number');
    if (requirement.toLowerCase().includes('id')) attributes.push('+id: String');
    if (requirement.toLowerCase().includes('description')) attributes.push('+description: String');
    
    if (attributes.length === 0) {
        attributes.push('+id: String', '+name: String');
    }
    
    return attributes.slice(0, 5);
}

function generateRelationships(entities) {
    let relationships = '';
    
    for (let i = 0; i < entities.length - 1; i++) {
        relationships += `${entities[i].name} -- ${entities[i + 1].name}\n`;
    }
    
    return relationships;
}

function generateUserStories() {
    const storiesContainer = document.getElementById('userStoriesOutput');
    
    if (!storiesContainer) return;
    
    if (classifiedRequirements.length === 0) {
        storiesContainer.innerHTML = '<p class="text-muted text-center py-4">No requirements available to generate user stories.</p>';
        return;
    }
    
    const functionalReqs = classifiedRequirements.filter(req => req.type === 'functional');
    let storiesHTML = '';
    
    functionalReqs.forEach((req, index) => {
        const story = formatUserStory(req.text, req.category);
        storiesHTML += `
            <div class="user-story">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <strong>Story ${index + 1}</strong>
                    <small class="text-muted">${req.category}</small>
                </div>
                <p class="mb-0">${story}</p>
                <small class="text-muted mt-2 d-block">Original: ${req.text.substring(0, 80)}...</small>
            </div>
        `;
    });
    
    storiesContainer.innerHTML = storiesHTML;
}

function formatUserStory(requirement, category) {
    if (/as a .* i want .* so that .*/i.test(requirement)) {
        return requirement;
    }
    
    const actors = ['user', 'admin', 'customer', 'manager'];
    const actor = actors[Math.floor(Math.random() * actors.length)];
    
    const actions = {
        'data creation': `create data`,
        'data retrieval': `view data`,
        'data modification': `modify data`,
        'data deletion': `delete data`,
        'search': `search for information`,
        'reporting': `generate reports`,
        'authentication': `access the system securely`,
        'feature': `use system features`
    };
    
    const action = actions[category] || `perform required actions`;
    const benefit = getBenefitFromCategory(category);
    
    return `As a ${actor}, I want to ${action}, so that ${benefit}.`;
}

function getBenefitFromCategory(category) {
    const benefits = {
        'data creation': 'I can add new information to the system',
        'data retrieval': 'I can access the information I need',
        'data modification': 'I can keep information up to date',
        'data deletion': 'I can remove unnecessary information',
        'search': 'I can find specific information quickly',
        'reporting': 'I can make informed decisions',
        'authentication': 'my data remains secure',
        'feature': 'I can accomplish my tasks efficiently'
    };
    
    return benefits[category] || 'I can benefit from this functionality';
}

function exportDiagram() {
    const diagramCode = document.getElementById('classDiagramCode')?.textContent;
    if (diagramCode && !diagramCode.includes('No requirements available')) {
        downloadFile(diagramCode, 'class-diagram.puml');
        showAlert('Class diagram exported successfully', 'success');
    } else {
        showAlert('No class diagram available to export.', 'warning');
    }
}

function exportUserStories() {
    const stories = document.querySelectorAll('.user-story');
    if (stories.length === 0) {
        showAlert('No user stories available to export.', 'warning');
        return;
    }
    
    let storiesText = "USER STORIES\n============\n\n";
    
    stories.forEach((story, index) => {
        const storyText = story.querySelector('p').textContent;
        storiesText += `Story ${index + 1}:\n${storyText}\n\n`;
    });
    
    downloadFile(storiesText, 'user-stories.txt');
    showAlert('User stories exported successfully', 'success');
}

// ==================== PROJECT MANAGEMENT MODAL FUNCTIONS ====================

function showProjectManagement() {
    loadProjects();
    const projectModal = new bootstrap.Modal(document.getElementById('projectModal'));
    projectModal.show();
}

function cancelProjectForm() {
    document.getElementById('projectForm').style.display = 'none';
    document.getElementById('projectsList').style.display = 'block';
}

function searchProjects() {
    const searchTerm = document.getElementById('projectSearch').value;
    loadProjects(searchTerm);
}

function editProject(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    document.getElementById('projectName').value = project.name;
    document.getElementById('projectDescription').value = project.description;
    document.getElementById('projectType').value = project.type;
    document.getElementById('projectTemplate').value = project.template;
    
    document.getElementById('projectsList').style.display = 'none';
    document.getElementById('projectForm').style.display = 'block';
}

function deleteProject(projectId) {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
        return;
    }
    
    const projectIndex = projects.findIndex(p => p.id === projectId);
    if (projectIndex !== -1) {
        const projectName = projects[projectIndex].name;
        projects.splice(projectIndex, 1);
        localStorage.setItem('projects', JSON.stringify(projects));
        
        if (currentProject && currentProject.id === projectId) {
            currentProject = null;
            updateCurrentProjectIndicator();
        }
        
        loadProjects();
        
        logAuditEvent('PROJECT_DELETED', 'Project deleted', {
            projectId: projectId,
            projectName: projectName
        });
        
        showAlert(`Project "${projectName}" deleted successfully`, 'success');
    }
}

// ==================== ML FEEDBACK FUNCTIONS ====================

function markFeedbackApplied(feedbackId) {
    const feedback = mlFeedback.find(f => f.id === feedbackId);
    if (feedback) {
        feedback.applied = true;
        feedback.appliedAt = new Date().toISOString();
        localStorage.setItem('mlFeedback', JSON.stringify(mlFeedback));
        updateMLFeedbackDisplay();
        showAlert('Feedback marked as applied', 'success');
    }
}

function dismissFeedback(feedbackId) {
    const feedback = mlFeedback.find(f => f.id === feedbackId);
    if (feedback) {
        feedback.applied = true;
        feedback.reviewed = true;
        localStorage.setItem('mlFeedback', JSON.stringify(mlFeedback));
        updateMLFeedbackDisplay();
        showAlert('Feedback dismissed', 'info');
    }
}

function showAllFeedback() {
    const modalContent = `
        <div class="modal-header">
            <h5 class="modal-title"><i class="fas fa-history me-2"></i>ML Feedback History</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
            <div class="mb-3">
                <div class="btn-group" role="group">
                    <button type="button" class="btn btn-outline-primary active" onclick="filterFeedback('all')">All</button>
                    <button type="button" class="btn btn-outline-primary" onclick="filterFeedback('applied')">Applied</button>
                    <button type="button" class="btn btn-outline-primary" onclick="filterFeedback('pending')">Pending</button>
                </div>
            </div>
            <div style="max-height: 400px; overflow-y: auto;">
                ${mlFeedback.map(feedback => `
                    <div class="feedback-item ${feedback.applied ? 'feedback-correct' : 'feedback-incorrect'} mb-2">
                        <div class="d-flex justify-content-between">
                            <small><strong>#${feedback.id}</strong> - ${feedback.userCorrection.type}</small>
                            <small class="text-muted">${new Date(feedback.timestamp).toLocaleDateString()}</small>
                        </div>
                        <p class="small mb-1">${feedback.requirementText.substring(0, 150)}...</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <small>
                                <span class="badge bg-secondary">${feedback.originalClassification.type}</span>
                                <i class="fas fa-arrow-right mx-2"></i>
                                <span class="badge bg-primary">${feedback.userCorrection.type}</span>
                            </small>
                            <small class="text-muted">${feedback.applied ? 'Applied' : 'Pending'}</small>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-danger" onclick="clearAllFeedback()">Clear All</button>
        </div>
    `;
    
    showCustomModal('feedback-history-modal', 'ML Feedback History', modalContent, 'lg');
}

function filterFeedback(filter) {
    // filter the feedback display
    console.log('Filtering feedback by:', filter);
}

function clearAllFeedback() {
    if (!confirm('Are you sure you want to clear all ML feedback? This action cannot be undone.')) {
        return;
    }
    
    mlFeedback = [];
    localStorage.setItem('mlFeedback', JSON.stringify(mlFeedback));
    updateMLFeedbackDisplay();
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('feedback-history-modal'));
    if (modal) modal.hide();
    
    showAlert('All ML feedback cleared', 'success');
}

// ==================== ADDITIONAL SECURITY FUNCTIONS ====================

function encryptData(data) {
    try {
        return btoa(unescape(encodeURIComponent(JSON.stringify(data))));
    } catch (error) {
        console.error('Encryption error:', error);
        return null;
    }
}

function decryptData(encryptedData) {
    try {
        return JSON.parse(decodeURIComponent(escape(atob(encryptedData))));
    } catch (error) {
        console.error('Decryption error:', error);
        return null;
    }
}

// ==================== FINAL INITIALIZATION ====================

window.enhancedClassificationWithML = enhancedClassificationWithML;
window.enhancedClassification = enhancedClassification;
window.classifyRequirements = classifyRequirements;
window.overrideClassification = overrideClassification;
window.saveCurrentProject = saveCurrentProject;
window.loadSampleData = loadSampleData;
window.testClassification = testClassification;
window.navigateToStep = navigateToStep;
window.startOver = startOver;
window.showLoginModal = showLoginModal;
window.showRegisterForm = showRegisterForm;
window.showLoginForm = showLoginForm;
window.login = login;
window.register = register;
window.logout = logout;
window.showUserProfile = showUserProfile;
window.showProjectManagement = showProjectManagement;
window.createNewProject = createNewProject;
window.saveProject = saveProject;
window.loadProject = loadProject;
window.cancelProjectForm = cancelProjectForm;
window.searchProjects = searchProjects;
window.editProject = editProject;
window.deleteProject = deleteProject;
window.generateClassDiagram = generateClassDiagram;
window.exportDiagram = exportDiagram;
window.generateUserStories = generateUserStories;
window.exportUserStories = exportUserStories;
window.exportToJira = exportToJira;
window.exportToTrello = exportToTrello;
window.generatePDFReport = generatePDFReport;
window.exportToJSON = exportToJSON;
window.generateComplianceReport = generateComplianceReport;
window.showAuditLog = showAuditLog;
window.changeLanguage = changeLanguage;
window.applyOrganizationStandards = applyOrganizationStandards;
window.applyMLImprovements = applyMLImprovements;
window.showAllFeedback = showAllFeedback;
window.showQualityIssues = showQualityIssues;
window.markFeedbackApplied = markFeedbackApplied;
window.dismissFeedback = dismissFeedback;
window.clearAllFeedback = clearAllFeedback;
window.exportAuditLog = exportAuditLog;