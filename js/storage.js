// Intégration avec Netlify Large Media pour ParisZik

class NetlifyStorage {
    constructor() {
        this.isInitialized = true;
        this.baseUrl = '';
        this.maxFileSize = 50 * 1024 * 1024; // 50MB
        this.allowedTypes = [
            'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/flac', 'audio/aac', 'audio/mp4',
            'video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm',
            'image/jpeg', 'image/png', 'image/gif', 'image/webp'
        ];
    }
    
    // Initialiser le stockage
    async initialize() {
        try {
            // Déterminer l'URL de base
            this.baseUrl = window.location.origin;
            console.log('Netlify Storage initialisé avec succès');
            return true;
        } catch (error) {
            console.error('Erreur lors de l\'initialisation:', error);
            throw error;
        }
    }
    
    // Upload d'un fichier vers Netlify
    async uploadFile(file, folderName = 'uploads') {
        try {
            // Vérifier la taille du fichier
            if (file.size > this.maxFileSize) {
                throw new Error(`Le fichier est trop volumineux (max ${this.formatFileSize(this.maxFileSize)}).`);
            }
            
            // Vérifier le type de fichier
            if (!this.isFileTypeAllowed(file)) {
                throw new Error('Type de fichier non supporté.');
            }
            
            // Créer un nom de fichier unique
            const fileName = `${folderName}/${Date.now()}_${this.sanitizeFileName(file.name)}`;
            
            // Créer un FormData pour l'upload
            const formData = new FormData();
            formData.append('file', file);
            formData.append('fileName', fileName);
            
            // Simuler l'upload (dans la réalité, vous devriez créer une fonction de build)
            console.log('Fichier prêt pour le déploiement:', fileName);
            
            // Retourner l'URL du fichier (après déploiement)
            const fileUrl = `${this.baseUrl}/${fileName}`;
            
            return {
                success: true,
                message: 'Fichier prêt pour le déploiement',
                fileUrl: fileUrl,
                fileName: file.name,
                fileSize: file.size,
                uploadDate: new Date().toISOString(),
                storagePath: fileName
            };
        } catch (error) {
            console.error('Erreur lors de la préparation de l\'upload:', error);
            throw error;
        }
    }
    
    // Vérifier si le type de fichier est autorisé
    isFileTypeAllowed(file) {
        return this.allowedTypes.includes(file.type) || this.isExtensionAllowed(file.name);
    }
    
    // Vérifier si l'extension est autorisée
    isExtensionAllowed(fileName) {
        const extension = fileName.split('.').pop().toLowerCase();
        const allowedExtensions = ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a', 'mp4', 'mov', 'avi', 'mkv', 'webm', 'jpg', 'jpeg', 'png', 'gif', 'webp'];
        return allowedExtensions.includes(extension);
    }
    
    // Nettoyer le nom de fichier
    sanitizeFileName(fileName) {
        return fileName
            .replace(/[^\w\-.]/g, '_')
            .replace(/_{2,}/g, '_')
            .substring(0, 255);
    }
    
    // Formater la taille des fichiers
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    // Supprimer un fichier (simulé - dans la réalité, vous devriez supprimer du dépôt)
    async deleteFile(filePath) {
        console.log('Pour supprimer un fichier, veuillez le supprimer du dépôt Git et redéployer.');
        return {
            success: true,
            message: 'Fichier marqué pour suppression (supprimez du dépôt Git)',
            filePath: filePath
        };
    }
}

// Créer une instance de l'intégration Netlify
const netlifyStorage = new NetlifyStorage();

// Fonction pour initialiser le stockage
async function initializeStorage() {
    try {
        await netlifyStorage.initialize();
        console.log('Netlify Storage initialisé avec succès');
        return true;
    } catch (error) {
        console.error('Erreur lors de l\'initialisation de Netlify Storage:', error);
        return false;
    }
}

// Exporter l'instance et les fonctions
window.ParisZikStorage = {
    instance: netlifyStorage,
    initialize: initializeStorage
};

console.log('Intégration Netlify Storage chargée');