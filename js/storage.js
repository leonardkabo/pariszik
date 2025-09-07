// Intégration avec Netlify Functions pour ParisZik

class NetlifyFunctionsStorage {
    constructor() {
        this.isInitialized = true;
        this.maxFileSize = 50 * 1024 * 1024; // 50MB
        this.allowedTypes = [
            'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/flac', 'audio/aac', 'audio/mp4',
            'video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm',
            'image/jpeg', 'image/png', 'image/gif', 'image/webp'
        ];
        this.uploadEndpoint = '/.netlify/functions/upload';
    }
    
    // Initialiser le stockage
    async initialize() {
        try {
            console.log('Netlify Functions Storage initialisé avec succès');
            return true;
        } catch (error) {
            console.error('Erreur lors de l\'initialisation:', error);
            throw error;
        }
    }
    
    // Upload d'un fichier vers Netlify Functions
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
            
            // Lire le fichier comme ArrayBuffer
            const arrayBuffer = await this.readFileAsArrayBuffer(file);
            
            // Convertir en base64
            const base64String = this.arrayBufferToBase64(arrayBuffer);
            
            // Préparer les données pour l'upload
            const uploadData = {
                file: base64String,
                fileName: file.name,
                folderName: folderName
            };
            
            // Envoyer la requête à la fonction Netlify
            const response = await fetch(this.uploadEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(uploadData)
            });
            
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error || 'Erreur lors de l\'upload');
            }
            
            // Retourner les informations du fichier
            return {
                success: true,
                message: result.message,
                fileUrl: result.fileUrl,
                fileName: result.fileName,
                fileSize: result.fileSize,
                uploadDate: new Date().toISOString(),
                storagePath: result.fileUrl
            };
        } catch (error) {
            console.error('Erreur lors de l\'upload:', error);
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
    
    // Lire un fichier comme ArrayBuffer
    readFileAsArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    }
    
    // Convertir un ArrayBuffer en base64
    arrayBufferToBase64(buffer) {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }
    
    // Formater la taille des fichiers
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    // Supprimer un fichier (simulé)
    async deleteFile(filePath) {
        console.log('Pour supprimer un fichier, veuillez le supprimer manuellement du dépôt.');
        return {
            success: true,
            message: 'Fichier marqué pour suppression',
            filePath: filePath
        };
    }
}

// Créer une instance de l'intégration Netlify Functions
const netlifyFunctionsStorage = new NetlifyFunctionsStorage();

// Fonction pour initialiser le stockage
async function initializeStorage() {
    try {
        await netlifyFunctionsStorage.initialize();
        console.log('Netlify Functions Storage initialisé avec succès');
        return true;
    } catch (error) {
        console.error('Erreur lors de l\'initialisation de Netlify Functions Storage:', error);
        return false;
    }
}

// Exporter l'instance et les fonctions
window.ParisZikStorage = {
    instance: netlifyFunctionsStorage,
    initialize: initializeStorage
};

console.log('Intégration Netlify Functions Storage chargée');