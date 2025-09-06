// Gestion robuste de l'authentification pour ParisZik

class ParisZikAuth {
    constructor() {
        this.initialized = false;
        this.services = null;
        this.user = null;
        this.retryCount = 0;
        this.maxRetries = 3;
    }
    
    // Initialiser l'authentification
    async initialize() {
        try {
            // Attendre que l'initialisation soit terminée
            if (!window.ParisZikInit) {
                throw new Error('Initialisation ParisZik non disponible');
            }
            
            await window.ParisZikInit.initializeFirebase();
            this.services = window.ParisZikInit.getServices();
            this.initialized = true;
            console.log('Authentification ParisZik initialisée - Mode:', this.services.isOnline ? 'en ligne' : 'offline');
            
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
            console.log('Début de l\'inscription pour:', email);
            
            // Créer l'utilisateur
            const userCredential = await this.services.auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;
            this.user = user;
            
            console.log('Utilisateur créé:', user.email);
            
            // Déterminer le rôle
            const isAdmin = window.ParisZikInit.isAdminUser(user);
            const role = isAdmin ? 'admin' : 'user';
            
            // Tenter d'enregistrer dans Firestore (mode dégradé si hors ligne)
            let firestoreSuccess = false;
            try {
                if (this.services.isOnline) {
                    await this.services.db.collection("users").doc(user.uid).set({
                        fullName: fullName,
                        email: email,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        role: role,
                        lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                    }, { merge: true });
                    
                    console.log('Données utilisateur enregistrées dans Firestore');
                    firestoreSuccess = true;
                } else {
                    console.log('Mode offline - Enregistrement Firestore différé');
                }
            } catch (firestoreError) {
                console.warn('Erreur Firestore (mode dégradé):', firestoreError.message);
                // En mode dégradé, on continue sans Firestore
            }
            
            return {
                success: true,
                user: user,
                role: role,
                firestoreSuccess: firestoreSuccess
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
            console.log('Tentative de connexion pour:', email);
            
            // Se connecter
            const userCredential = await this.services.auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;
            this.user = user;
            
            console.log('Connexion réussie:', user.email);
            
            // Déterminer le rôle
            const isAdmin = window.ParisZikInit.isAdminUser(user);
            const role = isAdmin ? 'admin' : 'user';
            
            // Tenter de mettre à jour Firestore (mode dégradé si hors ligne)
            let firestoreSuccess = false;
            try {
                if (this.services.isOnline) {
                    await this.services.db.collection("users").doc(user.uid).set({
                        lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                    }, { merge: true });
                    
                    console.log('Données utilisateur mises à jour dans Firestore');
                    firestoreSuccess = true;
                } else {
                    console.log('Mode offline - Mise à jour Firestore différée');
                }
            } catch (firestoreError) {
                console.warn('Erreur Firestore (mode dégradé):', firestoreError.message);
                // En mode dégradé, on continue sans Firestore
            }
            
            return {
                success: true,
                user: user,
                role: role,
                firestoreSuccess: firestoreSuccess
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
            console.log('Tentative de connexion Google...');
            
            const provider = new firebase.auth.GoogleAuthProvider();
            const result = await this.services.auth.signInWithPopup(provider);
            const user = result.user;
            this.user = user;
            
            console.log('Connexion Google réussie:', user.email);
            
            // Déterminer le rôle
            const isAdmin = window.ParisZikInit.isAdminUser(user);
            const role = isAdmin ? 'admin' : 'user';
            
            // Tenter de gérer Firestore (mode dégradé si hors ligne)
            let firestoreSuccess = false;
            try {
                if (this.services.isOnline) {
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
                    firestoreSuccess = true;
                } else {
                    console.log('Mode offline - Gestion Firestore différée');
                }
            } catch (firestoreError) {
                console.warn('Erreur Firestore (mode dégradé):', firestoreError.message);
                // En mode dégradé, on continue sans Firestore
            }
            
            return {
                success: true,
                user: user,
                role: role,
                firestoreSuccess: firestoreSuccess
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
            this.user = null;
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
                this.services.auth.onAuthStateChanged(this.handleAuthStateChange.bind(this, callback));
            }).catch(error => {
                console.error('Erreur initialisation:', error);
                // Appeler le callback avec null en cas d'erreur
                if (callback && typeof callback === 'function') {
                    callback(null);
                }
            });
        } else {
            this.services.auth.onAuthStateChanged(this.handleAuthStateChange.bind(this, callback));
        }
    }
    
    // Gérer le changement d'état d'authentification
    async handleAuthStateChange(callback, user) {
        if (user) {
            this.user = user;
            console.log('Utilisateur connecté:', user.email);
            
            // Tenter de récupérer le rôle depuis Firestore
            let role = 'user';
            try {
                if (this.services.isOnline) {
                    const userDoc = await this.services.db.collection("users").doc(user.uid).get();
                    if (userDoc.exists) {
                        const userData = userDoc.data();
                        role = userData.role || 'user';
                    } else {
                        // Si le document n'existe pas, créer avec le rôle approprié
                        const isAdmin = window.ParisZikInit.isAdminUser(user);
                        role = isAdmin ? 'admin' : 'user';
                        
                        await this.services.db.collection("users").doc(user.uid).set({
                            fullName: user.displayName || user.email.split('@')[0],
                            email: user.email,
                            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                            role: role,
                            lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                        }, { merge: true });
                    }
                } else {
                    // En mode offline, utiliser le rôle par défaut ou depuis localStorage
                    const storedRole = localStorage.getItem('userRole');
                    if (storedRole) {
                        role = storedRole;
                    } else {
                        const isAdmin = window.ParisZikInit.isAdminUser(user);
                        role = isAdmin ? 'admin' : 'user';
                    }
                }
            } catch (error) {
                console.warn('Erreur lors de la récupération du rôle (mode dégradé):', error.message);
                // Utiliser le rôle par défaut
                const isAdmin = window.ParisZikInit.isAdminUser(user);
                role = isAdmin ? 'admin' : 'user';
            }
            
            // Mettre à jour localStorage
            localStorage.setItem('userId', user.uid);
            localStorage.setItem('userName', user.displayName || user.email.split('@')[0]);
            localStorage.setItem('userRole', role);
            
            // Appeler le callback
            if (callback && typeof callback === 'function') {
                callback(user);
            }
        } else {
            this.user = null;
            console.log('Aucun utilisateur connecté');
            
            // Appeler le callback
            if (callback && typeof callback === 'function') {
                callback(null);
            }
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
        return this.user || this.services?.auth?.currentUser || null;
    }
    
    // Forcer le rôle admin pour un utilisateur spécifique
    async forceAdminRole(email) {
        if (!this.initialized) await this.initialize();
        
        try {
            // Vérifier si l'utilisateur existe
            const user = this.getCurrentUser();
            if (!user || user.email.toLowerCase() !== email.toLowerCase()) {
                throw new Error('Utilisateur non trouvé ou email non correspondant');
            }
            
            // Mettre à jour le rôle dans Firestore
            try {
                await this.services.db.collection("users").doc(user.uid).set({
                    role: 'admin'
                }, { merge: true });
                
                console.log('Rôle admin forcé pour:', email);
            } catch (firestoreError) {
                console.warn('Erreur Firestore lors du forçage du rôle admin:', firestoreError.message);
            }
            
            // Mettre à jour le localStorage
            localStorage.setItem('userRole', 'admin');
            
            return { success: true, message: 'Rôle admin attribué avec succès' };
        } catch (error) {
            console.error('Erreur lors du forçage du rôle admin:', error);
            throw error;
        }
    }
    
    // Obtenir le statut
    getStatus() {
        return {
            initialized: this.initialized,
            isOnline: this.services?.isOnline || false,
            user: this.user ? {
                email: this.user.email,
                uid: this.user.uid
            } : null
        };
    }
}

// Créer et exporter l'instance
const parisZikAuth = new ParisZikAuth();
window.ParisZikAuth = parisZikAuth;

console.log('Module d\'authentification ParisZik prêt - Initialisation en cours...');