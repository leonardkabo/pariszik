// Configuration et initialisation Firebase pour ParisZik

// Définir la configuration Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCLziaBhKhyr1Jz8C4mRt5vYMEWmxoUsxQ",
    authDomain: "pariszik-6ced1.firebaseapp.com",
    projectId: "pariszik-6ced1",
    storageBucket: "pariszik-6ced1.firebasestorage.app",
    messagingSenderId: "1065971112198",
    appId: "1:1065971112198:web:d997951efedb2c6bc3a687"
};

// Initialiser Firebase
let firebaseApp;
let auth;
let db;
let storage;

try {
    // Vérifier si Firebase est déjà initialisé
    if (!firebase.apps || firebase.apps.length === 0) {
        firebaseApp = firebase.initializeApp(firebaseConfig);
        console.log('Firebase initialisé avec succès');
    } else {
        firebaseApp = firebase.app();
        console.log('Firebase déjà initialisé');
    }
    
    // Initialiser les services Firebase
    auth = firebase.auth();
    db = firebase.firestore();
    storage = firebase.storage();
    
    // Configurer Firestore pour gérer les cas offline
    db.settings({
        ignoreUndefinedProperties: true
    });
    
    // Activer la persistance offline pour Firestore
    db.enablePersistence()
        .catch((err) => {
            if (err.code == 'failed-precondition') {
                console.warn('La persistance multiple est désactivée');
            } else if (err.code == 'unimplemented') {
                console.warn('La persistance n\'est pas disponible sur ce navigateur');
            }
        });
    
    console.log('Services Firebase initialisés avec succès');
} catch (error) {
    console.error('Erreur lors de l\'initialisation de Firebase:', error);
}

// Fonction pour s'inscrire
async function signUp(email, password, fullName) {
    try {
        // Créer l'utilisateur avec email et mot de passe
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        console.log('Utilisateur créé avec succès:', user.uid);
        
        // Enregistrer les informations supplémentaires dans Firestore
        try {
            await db.collection("users").doc(user.uid).set({
                fullName: fullName,
                email: email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                role: email.toLowerCase() === 'leonardkabo32@gmail.com' ? 'admin' : 'user',
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
            
            console.log('Informations utilisateur enregistrées dans Firestore');
            return { success: true, user: user };
        } catch (firestoreError) {
            console.error('Erreur Firestore:', firestoreError);
            // Même si Firestore échoue, on considère que l'inscription est réussie
            return { success: true, user: user };
        }
    } catch (error) {
        console.error('Erreur lors de l\'inscription:', error);
        throw error;
    }
}

// Fonction pour se connecter
async function signIn(email, password) {
    try {
        // Se connecter avec email et mot de passe
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        console.log('Utilisateur connecté avec succès:', user.uid);
        
        // Récupérer les informations utilisateur de Firestore
        try {
            const userDoc = await db.collection("users").doc(user.uid).get();
            
            if (!userDoc.exists) {
                // Créer le document utilisateur s'il n'existe pas
                await db.collection("users").doc(user.uid).set({
                    fullName: user.displayName || user.email.split('@')[0],
                    email: user.email,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    role: user.email.toLowerCase() === 'leonardkabo32@gmail.com' ? 'admin' : 'user',
                    lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
                
                console.log('Document utilisateur créé dans Firestore');
            } else {
                // Mettre à jour la date de dernière connexion
                await db.collection("users").doc(user.uid).update({
                    lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
            
            return { success: true, user: user };
        } catch (firestoreError) {
            console.error('Erreur Firestore lors de la récupération des données utilisateur:', firestoreError);
            // Même si Firestore échoue, on considère que la connexion est réussie
            return { success: true, user: user };
        }
    } catch (error) {
        console.error('Erreur lors de la connexion:', error);
        throw error;
    }
}

// Fonction pour se connecter avec Google
async function signInWithGoogle() {
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        const result = await auth.signInWithPopup(provider);
        const user = result.user;
        
        console.log('Connexion Google réussie:', user.uid);
        
        // Récupérer les informations utilisateur de Firestore
        try {
            const userDoc = await db.collection("users").doc(user.uid).get();
            
            if (!userDoc.exists) {
                // Créer le document utilisateur s'il n'existe pas
                await db.collection("users").doc(user.uid).set({
                    fullName: user.displayName || user.email.split('@')[0],
                    email: user.email,
                    photoURL: user.photoURL || '',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    role: user.email.toLowerCase() === 'leonardkabo32@gmail.com' ? 'admin' : 'user',
                    lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
                
                console.log('Document utilisateur créé dans Firestore');
            } else {
                // Mettre à jour la date de dernière connexion
                await db.collection("users").doc(user.uid).update({
                    lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
            
            return { success: true, user: user };
        } catch (firestoreError) {
            console.error('Erreur Firestore lors de la récupération des données utilisateur:', firestoreError);
            // Même si Firestore échoue, on considère que la connexion est réussie
            return { success: true, user: user };
        }
    } catch (error) {
        console.error('Erreur lors de la connexion Google:', error);
        throw error;
    }
}

// Fonction pour se déconnecter
async function signOut() {
    try {
        await auth.signOut();
        console.log('Déconnexion réussie');
        return { success: true };
    } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
        throw error;
    }
}

// Fonction pour vérifier l'état de l'authentification
function checkAuthState(callback) {
    auth.onAuthStateChanged((user) => {
        if (callback && typeof callback === 'function') {
            callback(user);
        }
    });
}

// Fonction pour réinitialiser le mot de passe
async function resetPassword(email) {
    try {
        await auth.sendPasswordResetEmail(email);
        console.log('Email de réinitialisation envoyé à:', email);
        return { success: true };
    } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'email de réinitialisation:', error);
        throw error;
    }
}

// Exporter les fonctions et services
window.ParisZikFirebase = {
    auth,
    db,
    storage,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    checkAuthState,
    resetPassword
};

console.log('Firebase configuré et prêt à l\'emploi');