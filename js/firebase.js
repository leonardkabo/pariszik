// Gestion améliorée de l'authentification pour ParisZik

class ParisZikAuth {
    constructor() {
        this.initialized = false;
        this.services = null;
    }
    
    // Initialiser l'authentification
    async initialize() {
        try {
            // Attendre que l'initialisation soit terminée
            if (!window.ParisZikInit) {
                throw new Error('Initialisation ParisZik non disponible');
            }
            
            this.services = window.ParisZikInit.getServices();
            this.initialized = true;
            console.log('Authentification ParisZik initialisée');
            
            return true;
        } catch (error) {
            console.error('Erreur lors de l\'initialisation de l\'authentification:', error);
            throw error;
        }
    }
    
    // S'inscrire avec email et mot de passe
    async signUp(email, password, fullName) {
        if (!this.initialized) await this.initialize();
        
        try {
            // Créer l'utilisateur
            const userCredential = await this.services.auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            console.log('Utilisateur créé:', user.email);
            
            // Déterminer le rôle
            const isAdmin = window.ParisZikInit.isAdminUser(user);
            const role = isAdmin ? 'admin' : 'user';
            
            try {
                // Enregistrer dans Firestore (avec gestion des erreurs)
                await this.services.db.collection("users").doc(user.uid).set({
                    fullName: fullName,
                    email: email,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    role: role,
                    lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
                
                console.log('Données utilisateur enregistrées dans Firestore');
            } catch (firestoreError) {
                console.warn('Erreur Firestore (non bloquante):', firestoreError.message);
                // Continuer même si Firestore échoue
            }
            
            return {
                success: true,
                user: user,
                role: role
            };
        } catch (error) {
            console.error('Erreur inscription:', error);
            throw error;
        }
    }
    
    // Se connecter avec email et mot de passe
    async signIn(email, password) {
        if (!this.initialized) await this.initialize();
        
        try {
            // Se connecter
            const userCredential = await this.services.auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            console.log('Connexion réussie:', user.email);
            
            // Déterminer le rôle
            const isAdmin = window.ParisZikInit.isAdminUser(user);
            const role = isAdmin ? 'admin' : 'user';
            
            try {
                // Mettre à jour Firestore
                await this.services.db.collection("users").doc(user.uid).set({
                    lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
                
                console.log('Données utilisateur mises à jour dans Firestore');
            } catch (firestoreError) {
                console.warn('Erreur Firestore (non bloquante):', firestoreError.message);
                // Continuer même si Firestore échoue
            }
            
            return {
                success: true,
                user: user,
                role: role
            };
        } catch (error) {
            console.error('Erreur connexion:', error);
            throw error;
        }
    }
    
    // Se connecter avec Google
    async signInWithGoogle() {
        if (!this.initialized) await this.initialize();
        
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            const result = await this.services.auth.signInWithPopup(provider);
            const user = result.user;
            
            console.log('Connexion Google réussie:', user.email);
            
            // Déterminer le rôle
            const isAdmin = window.ParisZikInit.isAdminUser(user);
            const role = isAdmin ? 'admin' : 'user';
            
            try {
                // Vérifier/Mettre à jour Firestore
                const userDoc = await this.services.db.collection("users").doc(user.uid).get();
                
                if (!userDoc.exists) {
                    // Créer le document si inexistant
                    await this.services.db.collection("users").doc(user.uid).set({
                        fullName: user.displayName || user.email.split('@')[0],
                        email: user.email,
                        photoURL: user.photoURL || '',
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        role: role,
                        lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                    });
                } else {
                    // Mettre à jour la dernière connexion
                    await this.services.db.collection("users").doc(user.uid).update({
                        lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                    });
                }
                
                console.log('Données utilisateur gérées dans Firestore');
            } catch (firestoreError) {
                console.warn('Erreur Firestore (non bloquante):', firestoreError.message);
                // Continuer même si Firestore échoue
            }
            
            return {
                success: true,
                user: user,
                role: role
            };
        } catch (error) {
            console.error('Erreur connexion Google:', error);
            throw error;
        }
    }
    
    // Se déconnecter
    async signOut() {
        if (!this.initialized) await this.initialize();
        
        try {
            await this.services.auth.signOut();
            console.log('Déconnexion réussie');
            
            // Nettoyer le localStorage
            localStorage.removeItem('userId');
            localStorage.removeItem('userName');
            localStorage.removeItem('userRole');
            localStorage.removeItem('userPhoto');
            
            return { success: true };
        } catch (error) {
            console.error('Erreur déconnexion:', error);
            throw error;
        }
    }
    
    // Vérifier l'état d'authentification
    checkAuthState(callback) {
        if (!this.initialized) {
            console.warn('Authentification non initialisée - Initialisation en cours');
            this.initialize().then(() => {
                this.services.auth.onAuthStateChanged(callback);
            }).catch(error => {
                console.error('Erreur initialisation:', error);
            });
        } else {
            this.services.auth.onAuthStateChanged(callback);
        }
    }
    
    // Réinitialiser le mot de passe
    async resetPassword(email) {
        if (!this.initialized) await this.initialize();
        
        try {
            await this.services.auth.sendPasswordResetEmail(email);
            console.log('Email de réinitialisation envoyé');
            return { success: true };
        } catch (error) {
            console.error('Erreur réinitialisation mot de passe:', error);
            throw error;
        }
    }
    
    // Obtenir l'utilisateur actuel
    getCurrentUser() {
        if (!this.initialized || !this.services) {
            return null;
        }
        return this.services.auth.currentUser;
    }
}

// Créer et exporter l'instance
const parisZikAuth = new ParisZikAuth();
window.ParisZikAuth = parisZikAuth;

console.log('Module d\'authentification ParisZik prêt');