// Initialisation améliorée pour ParisZik

class ParisZikInit {
    constructor() {
        this.initialized = false;
        this.firebaseApp = null;
        this.auth = null;
        this.db = null;
        this.storage = null;
        this.retryCount = 0;
        this.maxRetries = 3;
    }
    
    // Initialiser Firebase avec gestion des erreurs
    async initializeFirebase() {
        try {
            // Charger la configuration
            const config = window.ParisZikConfig?.firebase;
            if (!config) {
                throw new Error('Configuration Firebase non trouvée');
            }
            
            // Initialiser Firebase
            if (!firebase.apps || firebase.apps.length === 0) {
                this.firebaseApp = firebase.initializeApp(config);
                console.log('Firebase initialisé avec succès');
            } else {
                this.firebaseApp = firebase.app();
                console.log('Firebase déjà initialisé');
            }
            
            // Initialiser les services
            this.auth = firebase.auth();
            this.db = firebase.firestore();
            this.storage = firebase.storage();
            
            // Configurer Firestore avec des paramètres plus tolérants
            this.db.settings({
                ignoreUndefinedProperties: true,
                cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
            });
            
            // Essayer d'activer la persistance offline
            try {
                await this.db.enablePersistence({
                    synchronizeTabs: true
                });
                console.log('Persistance Firestore activée');
            } catch (err) {
                console.warn('Persistance Firestore non disponible:', err.message);
                
                // Si la persistance échoue, continuer sans
                // C'est normal dans certains environnements
            }
            
            // Tester la connexion à Firestore
            await this.testFirestoreConnection();
            
            this.initialized = true;
            console.log('Services Firebase prêts à l\'emploi');
            
            return true;
        } catch (error) {
            console.error('Erreur critique lors de l\'initialisation de Firebase:', error);
            throw error;
        }
    }
    
    // Tester la connexion à Firestore
    async testFirestoreConnection() {
        try {
            // Faire une petite requête de test
            const testDoc = await this.db.collection("test").doc("connection").get();
            console.log('Connexion Firestore testée avec succès');
            return true;
        } catch (error) {
            console.warn('Erreur lors du test de connexion Firestore:', error);
            
            // Si c'est une erreur de connexion, on continue quand même
            if (error.code === 'unavailable' || error.message.includes('offline')) {
                console.log('Mode offline détecté - Continuer avec les fonctionnalités de base');
                return true;
            }
            
            // Pour les autres erreurs, on relance
            throw error;
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
            db: this.db,
            storage: this.storage
        };
    }
    
    // Vérifier si un utilisateur est admin
    isAdminUser(user) {
        if (!user || !user.email) return false;
        
        const adminEmails = window.ParisZikConfig?.adminEmails || [];
        return adminEmails.includes(user.email.toLowerCase());
    }
}

// Créer une instance globale
const parisZikInit = new ParisZikInit();

// Initialiser au chargement de la page
document.addEventListener('DOMContentLoaded', async function() {
    try {
        await parisZikInit.initializeFirebase();
        window.ParisZikInit = parisZikInit;
        console.log('ParisZik initialisé avec succès');
    } catch (error) {
        console.error('Erreur lors de l\'initialisation de ParisZik:', error);
        alert('Erreur lors de l\'initialisation de l\'application. Veuillez rafraîchir la page.');
    }
});

// Exporter pour utilisation globale
window.ParisZikInit = parisZikInit;