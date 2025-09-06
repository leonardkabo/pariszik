// Initialisation simplifiée pour ParisZik

class ParisZikInit {
    constructor() {
        this.initialized = false;
        this.firebaseApp = null;
        this.auth = null;
        this.isOnline = true;
    }
    
    // Initialiser Firebase (uniquement pour l'authentification de base)
    async initializeFirebase() {
        try {
            console.log('Début de l\'initialisation de Firebase (version simplifiée)...');
            
            // Charger la configuration
            const config = window.ParisZikConfig?.firebase;
            if (!config) {
                throw new Error('Configuration Firebase non trouvée');
            }
            
            // Initialiser Firebase
            if (!firebase.apps || firebase.apps.length === 0) {
                this.firebaseApp = firebase.initializeApp(config);
                console.log('Firebase initialisé avec succès (version simplifiée)');
            } else {
                this.firebaseApp = firebase.app();
                console.log('Firebase déjà initialisé (version simplifiée)');
            }
            
            // Initialiser uniquement l'authentification
            this.auth = firebase.auth();
            
            this.initialized = true;
            console.log('Firebase (authentification uniquement) prêt à l\'emploi');
            
            return true;
        } catch (error) {
            console.error('Erreur lors de l\'initialisation de Firebase:', error);
            
            // En cas d'erreur, continuer en mode dégradé
            this.initialized = true;
            console.log('Mode dégradé activé - Authentification uniquement');
            
            return true;
        }
    }
    
    // Obtenir les services initialisés
    getServices() {
        if (!this.initialized) {
            throw new Error('Firebase non initialisé');
        }
        
        return {
            app: this.firebaseApp,
            auth: this.auth,
            isOnline: this.isOnline
        };
    }
    
    // Vérifier si un utilisateur est admin
    isAdminUser(user) {
        if (!user || !user.email) return false;
        
        const adminEmails = window.ParisZikConfig?.adminEmails || [];
        return adminEmails.includes(user.email.toLowerCase());
    }
    
    // Obtenir l'état actuel
    getStatus() {
        return {
            initialized: this.initialized,
            isOnline: this.isOnline
        };
    }
}

// Créer une instance globale
const parisZikInit = new ParisZikInit();

// Initialiser au chargement de la page
document.addEventListener('DOMContentLoaded', async function() {
    try {
        await parisZikInit.initializeFirebase();
        window.ParisZikInit = parisZikInit;
        console.log('ParisZik initialisé avec succès (version simplifiée)');
    } catch (error) {
        console.error('Erreur lors de l\'initialisation de ParisZik:', error);
        window.ParisZikInit = parisZikInit;
    }
});

// Exporter pour utilisation globale
window.ParisZikInit = parisZikInit;