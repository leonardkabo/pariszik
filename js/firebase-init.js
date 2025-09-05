// Initialisation de Firebase pour ParisZik

// Charger les SDK Firebase
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Vérifier si Firebase est déjà chargé
        if (typeof firebase === 'undefined') {
            console.error('Firebase SDK non chargé');
            return;
        }
        
        // Configuration Firebase
        const firebaseConfig = {
            apiKey: "AIzaSyCLziaBhKhyr1Jz8C4mRt5vYMEWmxoUsxQ",
            authDomain: "pariszik-6ced1.firebaseapp.com",
            projectId: "pariszik-6ced1",
            storageBucket: "pariszik-6ced1.firebasestorage.app",
            messagingSenderId: "1065971112198",
            appId: "1:1065971112198:web:d997951efedb2c6bc3a687"
        };
        
        // Initialiser Firebase
        if (!firebase.apps || firebase.apps.length === 0) {
            firebase.initializeApp(firebaseConfig);
            console.log('Firebase initialisé avec succès');
        } else {
            console.log('Firebase déjà initialisé');
        }
        
        // Initialiser les services
        const auth = firebase.auth();
        const db = firebase.firestore();
        const storage = firebase.storage();
        
        // Configurer Firestore
        db.settings({
            ignoreUndefinedProperties: true
        });
        
        // Activer la persistance offline
        try {
            await db.enablePersistence();
            console.log('Persistance Firestore activée');
        } catch (err) {
            if (err.code == 'failed-precondition') {
                console.warn('La persistance multiple est désactivée');
            } else if (err.code == 'unimplemented') {
                console.warn('La persistance n\'est pas disponible sur ce navigateur');
            }
        }
        
        // Exposer les services globalement
        window.firebaseApp = firebase;
        window.firebaseAuth = auth;
        window.firebaseDb = db;
        window.firebaseStorage = storage;
        
        console.log('Services Firebase prêts à l\'emploi');
        
    } catch (error) {
        console.error('Erreur lors de l\'initialisation de Firebase:', error);
    }
});