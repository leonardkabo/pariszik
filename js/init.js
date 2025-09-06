// Initialisation robuste pour ParisZik avec gestion des erreurs Firestore

class ParisZikInit {
    constructor() {
        this.initialized = false;
        this.firebaseApp = null;
        this.auth = null;
        this.db = null;
        this.storage = null;
        this.isOnline = true;
        this.retryCount = 0;
        this.maxRetries = 5;
        this.initializationPromise = null;
    }
    
    // Initialiser Firebase avec gestion robuste des erreurs
    async initializeFirebase() {
        if (this.initializationPromise) {
            return this.initializationPromise;
        }
        
        this.initializationPromise = this._initializeFirebase();
        return this.initializationPromise;
    }
    
    async _initializeFirebase() {
        try {
            console.log('Début de l\'initialisation de Firebase...');
            
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
            
            // Activer la persistance offline avec gestion des erreurs
            try {
                await this.db.enablePersistence({
                    synchronizeTabs: true
                });
                console.log('Persistance Firestore activée');
            } catch (err) {
                console.warn('Persistance Firestore non disponible:', err.message);
                
                // Si la persistance échoue, désactiver la persistance et continuer
                if (err.code === 'failed-precondition') {
                    // Désactiver la persistance si elle est déjà activée ailleurs
                    console.log('Désactivation de la persistance pour permettre l\'initialisation');
                }
            }
            
            // Tester la connexion à Firestore avec une approche plus robuste
            await this.testFirestoreConnection();
            
            // Configurer la détection de l'état réseau
            this.setupNetworkDetection();
            
            this.initialized = true;
            console.log('Services Firebase prêts à l\'emploi');
            
            return true;
        } catch (error) {
            console.error('Erreur critique lors de l\'initialisation de Firebase:', error);
            
            // En cas d'erreur, continuer en mode dégradé
            this.initialized = true; // On considère que l'initialisation est réussie même en mode offline
            console.log('Mode dégradé activé - Fonctionnalités limitées');
            
            return true;
        }
    }
    
    // Tester la connexion à Firestore avec plusieurs tentatives
    async testFirestoreConnection() {
        try {
            console.log('Test de connexion Firestore...');
            
            // Faire une petite requête de test avec timeout
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Timeout de connexion Firestore')), 10000);
            });
            
            const testPromise = this.db.collection("test").doc("connection").get();
            
            const testDoc = await Promise.race([testPromise, timeoutPromise]);
            
            console.log('Connexion Firestore testée avec succès');
            this.isOnline = true;
            return true;
        } catch (error) {
            console.warn('Erreur lors du test de connexion Firestore:', error);
            
            // Si c'est une erreur de connexion, on continue en mode offline
            if (error.code === 'unavailable' || 
                error.message.includes('offline') || 
                error.message.includes('network') ||
                error.message.includes('timeout')) {
                
                console.log('Mode offline activé - Les fonctionnalités de base restent disponibles');
                this.isOnline = false;
                return true;
            }
            
            // Pour les autres erreurs, on relance
            throw error;
        }
    }
    
    // Configurer la détection de l'état réseau
    setupNetworkDetection() {
        // Écouter les changements de connexion
        window.addEventListener('online', () => {
            console.log('Connexion réseau rétablie');
            this.isOnline = true;
            this.retryFirestoreConnection();
        });
        
        window.addEventListener('offline', () => {
            console.log('Connexion réseau perdue');
            this.isOnline = false;
        });
        
        // Vérifier l'état initial
        this.isOnline = navigator.onLine;
        console.log('État réseau initial:', this.isOnline ? 'en ligne' : 'hors ligne');
    }
    
    // Réessayer la connexion Firestore
    async retryFirestoreConnection() {
        if (this.retryCount >= this.maxRetries) {
            console.log('Nombre maximum de tentatives atteint');
            return;
        }
        
        this.retryCount++;
        console.log(`Tentative de reconnexion Firestore (${this.retryCount}/${this.maxRetries})...`);
        
        try {
            await this.testFirestoreConnection();
            if (this.isOnline) {
                console.log('Reconnexion Firestore réussie');
                this.retryCount = 0;
            }
        } catch (error) {
            console.error('Échec de la reconnexion Firestore:', error);
            
            // Réessayer après un délai
            if (this.retryCount < this.maxRetries) {
                setTimeout(() => {
                    this.retryFirestoreConnection();
                }, Math.pow(2, this.retryCount) * 1000); // Backoff exponentiel
            }
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
            storage: this.storage,
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
            isOnline: this.isOnline,
            retryCount: this.retryCount
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
        console.log('ParisZik initialisé avec succès - État:', parisZikInit.getStatus());
    } catch (error) {
        console.error('Erreur lors de l\'initialisation de ParisZik:', error);
        // Même en cas d'erreur, on expose l'instance pour les fonctionnalités de base
        window.ParisZikInit = parisZikInit;
    }
});

// Exporter pour utilisation globale
window.ParisZikInit = parisZikInit;