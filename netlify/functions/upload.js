// netlify/functions/upload.js

const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
    try {
        // Vérifier si la requête est de type POST
        if (event.httpMethod !== 'POST') {
            return {
                statusCode: 405,
                body: JSON.stringify({ error: 'Méthode non autorisée' })
            };
        }

        // Parser le body de la requête
        const body = JSON.parse(event.body);
        
        // Vérifier si le fichier est présent
        if (!body.file || !body.fileName) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Fichier ou nom de fichier manquant' })
            };
        }

        // Créer un nom de fichier unique
        const fileName = `${Date.now()}_${body.fileName}`;
        const folderName = body.folderName || 'uploads';
        const filePath = path.join(process.cwd(), folderName, fileName);

        // Créer le dossier s'il n'existe pas
        if (!fs.existsSync(folderName)) {
            fs.mkdirSync(folderName, { recursive: true });
        }

        // Décoder le fichier base64
        const fileBuffer = Buffer.from(body.file, 'base64');

        // Écrire le fichier
        fs.writeFileSync(filePath, fileBuffer);

        // Retourner l'URL du fichier
        const fileUrl = `/${folderName}/${fileName}`;

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: JSON.stringify({
                success: true,
                message: 'Fichier uploadé avec succès',
                fileUrl: fileUrl,
                fileName: body.fileName,
                fileSize: fileBuffer.length
            })
        };

    } catch (error) {
        console.error('Erreur lors de l\'upload:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: JSON.stringify({
                success: false,
                error: 'Erreur serveur lors de l\'upload'
            })
        };
    }
};