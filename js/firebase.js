// Configuration Firebase pour ParisZik
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY || "AIzaSyCLziaBhKhyr1Jz8C4mRt5vYMEWmxoUsxQ",
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || "pariszik-6ced1.firebaseapp.com",
    projectId: process.env.FIREBASE_PROJECT_ID || "pariszik-6ced1",
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "pariszik-6ced1.firebasestorage.app",
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "1065971112198",
    appId: process.env.FIREBASE_APP_ID || "1:1065971112198:web:d997951efedb2c6bc3a687"
};

// Initialiser Firebase
if (typeof firebase !== 'undefined') {
    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const db = firebase.firestore();
    const storage = firebase.storage();
    
    console.log('Firebase initialisé avec succès');
    
    // Fonction pour s'inscrire
    function signUp(email, password, fullName) {
        return auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Enregistrer les informations supplémentaires dans Firestore
                return db.collection("users").doc(userCredential.user.uid).set({
                    fullName: fullName,
                    email: email,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    role: "user"
                });
            })
            .then(() => {
                console.log('Utilisateur créé avec succès');
                return true;
            })
            .catch((error) => {
                console.error('Erreur lors de la création de l\'utilisateur:', error);
                throw error;
            });
    }
    
    // Fonction pour se connecter
    function signIn(email, password) {
        return auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                console.log('Utilisateur connecté avec succès');
                return userCredential.user;
            })
            .catch((error) => {
                console.error('Erreur lors de la connexion:', error);
                throw error;
            });
    }
    
    // Fonction pour se déconnecter
    function signOut() {
        return auth.signOut()
            .then(() => {
                console.log('Utilisateur déconnecté avec succès');
                return true;
            })
            .catch((error) => {
                console.error('Erreur lors de la déconnexion:', error);
                throw error;
            });
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
    function resetPassword(email) {
        return auth.sendPasswordResetEmail(email)
            .then(() => {
                console.log('Email de réinitialisation envoyé');
                return true;
            })
            .catch((error) => {
                console.error('Erreur lors de l\'envoi de l\'email de réinitialisation:', error);
                throw error;
            });
    }
    
    // Fonction pour uploader un fichier
    function uploadFile(file, path) {
        const storageRef = storage.ref();
        const fileRef = storageRef.child(path);
        
        return fileRef.put(file)
            .then((snapshot) => {
                console.log('Fichier uploadé avec succès');
                return snapshot.ref.getDownloadURL();
            })
            .catch((error) => {
                console.error('Erreur lors de l\'upload du fichier:', error);
                throw error;
            });
    }
    
    // Fonction pour télécharger un fichier
    function downloadFile(path) {
        const storageRef = storage.ref();
        const fileRef = storageRef.child(path);
        
        return fileRef.getDownloadURL()
            .then((url) => {
                console.log('URL de téléchargement obtenue:', url);
                return url;
            })
            .catch((error) => {
                console.error('Erreur lors de l\'obtention de l\'URL de téléchargement:', error);
                throw error;
            });
    }
    
    // Fonction pour supprimer un fichier
    function deleteFile(path) {
        const storageRef = storage.ref();
        const fileRef = storageRef.child(path);
        
        return fileRef.delete()
            .then(() => {
                console.log('Fichier supprimé avec succès');
                return true;
            })
            .catch((error) => {
                console.error('Erreur lors de la suppression du fichier:', error);
                throw error;
            });
    }
    
    // Fonction pour obtenir les informations de l'utilisateur
    function getUserInfo(uid) {
        return db.collection("users").doc(uid).get()
            .then((doc) => {
                if (doc.exists) {
                    return doc.data();
                } else {
                    throw new Error('Utilisateur non trouvé');
                }
            })
            .catch((error) => {
                console.error('Erreur lors de la récupération des informations de l\'utilisateur:', error);
                throw error;
            });
    }
    
    // Fonction pour mettre à jour les informations de l'utilisateur
    function updateUserInfo(uid, data) {
        return db.collection("users").doc(uid).update(data)
            .then(() => {
                console.log('Informations de l\'utilisateur mises à jour avec succès');
                return true;
            })
            .catch((error) => {
                console.error('Erreur lors de la mise à jour des informations de l\'utilisateur:', error);
                throw error;
            });
    }
    
    // Fonction pour vérifier si l'utilisateur est admin
    function isAdmin(uid) {
        return db.collection("users").doc(uid).get()
            .then((doc) => {
                if (doc.exists) {
                    const userData = doc.data();
                    return userData.role === 'admin';
                } else {
                    return false;
                }
            })
            .catch((error) => {
                console.error('Erreur lors de la vérification du rôle admin:', error);
                return false;
            });
    }
    
    // Export des fonctions Firebase
    window.ParisZikFirebase = {
        auth,
        db,
        storage,
        signUp,
        signIn,
        signOut,
        checkAuthState,
        resetPassword,
        uploadFile,
        downloadFile,
        deleteFile,
        getUserInfo,
        updateUserInfo,
        isAdmin
    };
    
    console.log('Fonctions Firebase exportées');
} else {
    console.warn('Firebase n\'est pas chargé. Veuillez inclure le SDK Firebase.');
    
    // Créer une version simulée pour le développement
    window.ParisZikFirebase = {
        auth: {
            signInWithEmailAndPassword: (email, password) => {
                console.log('Simulation: connexion avec', email);
                return Promise.resolve({ user: { email, uid: 'simulated-uid' } });
            },
            createUserWithEmailAndPassword: (email, password) => {
                console.log('Simulation: création de compte avec', email);
                return Promise.resolve({ user: { email, uid: 'simulated-uid' } });
            },
            signOut: () => {
                console.log('Simulation: déconnexion');
                return Promise.resolve();
            },
            onAuthStateChanged: (callback) => {
                console.log('Simulation: état d\'authentification');
                // Simuler un utilisateur non connecté
                callback(null);
            },
            sendPasswordResetEmail: (email) => {
                console.log('Simulation: réinitialisation du mot de passe pour', email);
                return Promise.resolve();
            }
        },
        db: {
            collection: (name) => ({
                doc: (id) => ({
                    set: (data) => Promise.resolve(),
                    get: () => Promise.resolve({ exists: true, data: () => ({ fullName: 'Utilisateur Test', email: 'test@example.com', role: 'user' }) }),
                    update: (data) => Promise.resolve()
                })
            })
        },
        storage: {
            ref: () => ({
                child: (path) => ({
                    put: (file) => Promise.resolve({ ref: { getDownloadURL: () => Promise.resolve('https://example.com/simulated-file-url') } }),
                    getDownloadURL: () => Promise.resolve('https://example.com/simulated-file-url'),
                    delete: () => Promise.resolve()
                })
            })
        },
        signUp: (email, password, fullName) => {
            console.log('Simulation: inscription avec', email, fullName);
            return Promise.resolve(true);
        },
        signIn: (email, password) => {
            console.log('Simulation: connexion avec', email);
            return Promise.resolve({ email, uid: 'simulated-uid' });
        },
        signOut: () => {
            console.log('Simulation: déconnexion');
            return Promise.resolve(true);
        },
        checkAuthState: (callback) => {
            console.log('Simulation: vérification de l\'état d\'authentification');
            callback(null);
        },
        resetPassword: (email) => {
            console.log('Simulation: réinitialisation du mot de passe pour', email);
            return Promise.resolve(true);
        },
        uploadFile: (file, path) => {
            console.log('Simulation: upload de fichier', file.name, 'vers', path);
            return Promise.resolve('https://example.com/simulated-file-url');
        },
        downloadFile: (path) => {
            console.log('Simulation: téléchargement de fichier depuis', path);
            return Promise.resolve('https://example.com/simulated-file-url');
        },
        deleteFile: (path) => {
            console.log('Simulation: suppression de fichier', path);
            return Promise.resolve(true);
        },
        getUserInfo: (uid) => {
            console.log('Simulation: récupération des informations de l\'utilisateur', uid);
            return Promise.resolve({ fullName: 'Utilisateur Test', email: 'test@example.com', role: 'user' });
        },
        updateUserInfo: (uid, data) => {
            console.log('Simulation: mise à jour des informations de l\'utilisateur', uid, data);
            return Promise.resolve(true);
        },
        isAdmin: (uid) => {
            console.log('Simulation: vérification si l\'utilisateur est admin', uid);
            return Promise.resolve(false);
        }
    };
    
    console.log('Version simulée de Firebase créée pour le développement');
}

// Initialiser l'authentification au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    if (window.ParisZikFirebase && window.ParisZikFirebase.checkAuthState) {
        window.ParisZikFirebase.checkAuthState(function(user) {
            if (user) {
                console.log('Utilisateur connecté:', user.email);
                // Mettre à jour l'interface utilisateur
                updateUIForLoggedInUser(user);
            } else {
                console.log('Aucun utilisateur connecté');
                // Mettre à jour l'interface utilisateur
                updateUIForLoggedOutUser();
            }
        });
    }
});

// Fonction pour mettre à jour l'interface utilisateur quand un utilisateur est connecté
function updateUIForLoggedInUser(user) {
    // Cacher les boutons de connexion/inscription
    const loginBtn = document.querySelector('.btn-secondary[href="login.html"]');
    const signupBtn = document.querySelector('.btn-primary[href="signup.html"]');
    if (loginBtn) loginBtn.style.display = 'none';
    if (signupBtn) signupBtn.style.display = 'none';
    
    // Afficher le nom de l'utilisateur ou un bouton de profil
    const authButtons = document.querySelector('.auth-buttons');
    if (authButtons) {
        // Vérifier si le bouton de profil existe déjà
        if (!document.querySelector('.user-profile-btn')) {
            const profileBtn = document.createElement('a');
            profileBtn.href = '#';
            profileBtn.className = 'btn btn-secondary user-profile-btn';
            profileBtn.textContent = user.email.split('@')[0];
            authButtons.appendChild(profileBtn);
            
            // Ajouter un gestionnaire d'événements pour le bouton de profil
            profileBtn.addEventListener('click', function(e) {
                e.preventDefault();
                alert('Profil de ' + user.email);
            });
        }
    }
    
    // Si l'utilisateur est admin, afficher le bouton d'administration
    if (user && user.uid) {
        window.ParisZikFirebase.isAdmin(user.uid).then(isAdmin => {
            if (isAdmin) {
                const adminBtn = document.querySelector('.btn-admin');
                if (adminBtn) {
                    adminBtn.style.display = 'inline-block';
                }
            }
        });
    }
}

// Fonction pour mettre à jour l'interface utilisateur quand aucun utilisateur n'est connecté
function updateUIForLoggedOutUser() {
    // Afficher les boutons de connexion/inscription
    const loginBtn = document.querySelector('.btn-secondary[href="login.html"]');
    const signupBtn = document.querySelector('.btn-primary[href="signup.html"]');
    if (loginBtn) loginBtn.style.display = 'inline-block';
    if (signupBtn) signupBtn.style.display = 'inline-block';
    
    // Cacher le bouton de profil
    const profileBtn = document.querySelector('.user-profile-btn');
    if (profileBtn) profileBtn.style.display = 'none';
    
    // Cacher le bouton d'administration
    const adminBtn = document.querySelector('.btn-admin');
    if (adminBtn) adminBtn.style.display = 'none';
}

// Export des fonctions d'authentification
window.ParisZikAuth = {
    updateUIForLoggedInUser,
    updateUIForLoggedOutUser
};