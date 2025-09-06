// Système d'authentification admin simplifié pour ParisZik

class SimpleAdminAuth {
    constructor() {
        this.adminEmail = 'leonardkabo32@gmail.com';
        this.adminPassword = 'pariszik@2025'; // Mot de passe admin par défaut
        this.isAuthenticated = false;
    }
    
    // Vérifier les identifiants admin
    checkAdminCredentials(email, password) {
        // Vérifier si c'est l'email admin
        if (email.toLowerCase() === this.adminEmail.toLowerCase()) {
            // Vérifier le mot de passe
            if (password === this.adminPassword) {
                return true;
            }
        }
        return false;
    }
    
    // Se connecter en tant qu'admin
    login(email, password) {
        if (this.checkAdminCredentials(email, password)) {
            // Stocker l'état d'authentification dans localStorage
            localStorage.setItem('isAdminAuthenticated', 'true');
            localStorage.setItem('adminEmail', email);
            this.isAuthenticated = true;
            return { success: true, message: 'Connexion admin réussie' };
        } else {
            return { success: false, message: 'Identifiants admin incorrects' };
        }
    }
    
    // Vérifier si l'utilisateur est authentifié comme admin
    isAuthenticatedAsAdmin() {
        const authStatus = localStorage.getItem('isAdminAuthenticated');
        if (authStatus === 'true') {
            this.isAuthenticated = true;
            return true;
        }
        return false;
    }
    
    // Se déconnecter
    logout() {
        localStorage.removeItem('isAdminAuthenticated');
        localStorage.removeItem('adminEmail');
        this.isAuthenticated = false;
        return { success: true, message: 'Déconnexion admin réussie' };
    }
    
    // Obtenir l'email admin
    getAdminEmail() {
        return localStorage.getItem('adminEmail') || this.adminEmail;
    }
}

// Créer une instance globale
const simpleAdminAuth = new SimpleAdminAuth();
window.SimpleAdminAuth = simpleAdminAuth;

console.log('Système d\'authentification admin simplifié prêt');