// Gestion des contenus pour ParisZik

class ContentManager {
    constructor() {
        this.db = firebase.firestore();
        this.storage = firebase.storage();
        this.contents = [];
        this.currentContent = null;
    }
    
    // Charger tous les contenus
    async loadAllContents() {
        try {
            const snapshot = await this.db.collection("contents")
                .orderBy("uploadedAt", "desc")
                .get();
            
            this.contents = [];
            snapshot.forEach(doc => {
                this.contents.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            console.log('Contenus chargés:', this.contents.length);
            return this.contents;
        } catch (error) {
            console.error('Erreur lors du chargement des contenus:', error);
            throw error;
        }
    }
    
    // Charger les contenus populaires
    async loadPopularContents(limit = 10) {
        try {
            const snapshot = await this.db.collection("contents")
                .orderBy("views", "desc")
                .limit(limit)
                .get();
            
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Erreur lors du chargement des contenus populaires:', error);
            throw error;
        }
    }
    
    // Charger les contenus en direct
    async loadLiveContents() {
        try {
            const snapshot = await this.db.collection("contents")
                .where("isLive", "==", true)
                .orderBy("uploadedAt", "desc")
                .get();
            
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Erreur lors du chargement des contenus en direct:', error);
            throw error;
        }
    }
    
    // Charger les nouveaux contenus
    async loadNewContents(limit = 10) {
        try {
            const snapshot = await this.db.collection("contents")
                .orderBy("uploadedAt", "desc")
                .limit(limit)
                .get();
            
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Erreur lors du chargement des nouveaux contenus:', error);
            throw error;
        }
    }
    
    // Charger un contenu spécifique
    async loadContentById(contentId) {
        try {
            const doc = await this.db.collection("contents").doc(contentId).get();
            
            if (doc.exists) {
                this.currentContent = {
                    id: doc.id,
                    ...doc.data()
                };
                return this.currentContent;
            } else {
                throw new Error('Contenu non trouvé');
            }
        } catch (error) {
            console.error('Erreur lors du chargement du contenu:', error);
            throw error;
        }
    }
    
    // Créer un nouveau contenu
    async createContent(contentData) {
        try {
            // Ajouter les champs par défaut
            const data = {
                ...contentData,
                uploadedAt: firebase.firestore.FieldValue.serverTimestamp(),
                uploadedBy: firebase.auth().currentUser.uid,
                views: 0,
                likes: 0,
                comments: 0,
                isPublished: true
            };
            
            const docRef = await this.db.collection("contents").add(data);
            
            console.log('Contenu créé avec ID:', docRef.id);
            return {
                id: docRef.id,
                ...data
            };
        } catch (error) {
            console.error('Erreur lors de la création du contenu:', error);
            throw error;
        }
    }
    
    // Mettre à jour un contenu
    async updateContent(contentId, updateData) {
        try {
            await this.db.collection("contents").doc(contentId).update({
                ...updateData,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            console.log('Contenu mis à jour:', contentId);
            return true;
        } catch (error) {
            console.error('Erreur lors de la mise à jour du contenu:', error);
            throw error;
        }
    }
    
    // Supprimer un contenu
    async deleteContent(contentId) {
        try {
            await this.db.collection("contents").doc(contentId).delete();
            console.log('Contenu supprimé:', contentId);
            return true;
        } catch (error) {
            console.error('Erreur lors de la suppression du contenu:', error);
            throw error;
        }
    }
    
    // Ajouter une vue
    async addView(contentId) {
        try {
            await this.db.collection("contents").doc(contentId).update({
                views: firebase.firestore.FieldValue.increment(1)
            });
            return true;
        } catch (error) {
            console.error('Erreur lors de l\'ajout d\'une vue:', error);
            return false;
        }
    }
    
    // Ajouter un like
    async addLike(contentId) {
        try {
            await this.db.collection("contents").doc(contentId).update({
                likes: firebase.firestore.FieldValue.increment(1)
            });
            return true;
        } catch (error) {
            console.error('Erreur lors de l\'ajout d\'un like:', error);
            return false;
        }
    }
    
    // Ajouter un commentaire
    async addComment(contentId, commentData) {
        try {
            const comment = {
                ...commentData,
                userId: firebase.auth().currentUser.uid,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            const commentRef = await this.db.collection("contents").doc(contentId)
                .collection("comments").add(comment);
            
            // Mettre à jour le compteur de commentaires
            await this.db.collection("contents").doc(contentId).update({
                comments: firebase.firestore.FieldValue.increment(1)
            });
            
            return {
                id: commentRef.id,
                ...comment
            };
        } catch (error) {
            console.error('Erreur lors de l\'ajout d\'un commentaire:', error);
            throw error;
        }
    }
    
    // Charger les commentaires d'un contenu
    async loadComments(contentId) {
        try {
            const snapshot = await this.db.collection("contents").doc(contentId)
                .collection("comments")
                .orderBy("createdAt", "desc")
                .get();
            
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Erreur lors du chargement des commentaires:', error);
            throw error;
        }
    }
    
    // Rechercher des contenus
    async searchContents(query) {
        try {
            // Pour une recherche simple, on peut utiliser une requête sur le titre
            const snapshot = await this.db.collection("contents")
                .where("title", ">=", query)
                .where("title", "<=", query + "\uf8ff")
                .limit(20)
                .get();
            
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Erreur lors de la recherche de contenus:', error);
            throw error;
        }
    }
}

// Créer une instance globale
const contentManager = new ContentManager();

// Exporter pour utilisation globale
window.ParisZikContent = contentManager;

console.log('ContentManager initialisé');