// Lecteur audio pour ParisZik

class AudioPlayer {
    constructor() {
        this.audio = null;
        this.isPlaying = false;
        this.currentContent = null;
        this.playlist = [];
        this.currentIndex = -1;
        this.volume = 0.7;
        this.isMuted = false;
        this.initialized = false;
    }
    
    // Initialiser le lecteur audio
    init() {
        try {
            // Créer l'élément audio
            this.audio = new Audio();
            this.audio.preload = 'metadata';
            
            // Configurer les événements
            this.setupEventListeners();
            
            // Initialiser le volume
            this.setVolume(this.volume);
            
            // Marquer comme initialisé
            this.initialized = true;
            console.log('Lecteur audio initialisé');
            
            return true;
        } catch (error) {
            console.error('Erreur lors de l\'initialisation du lecteur audio:', error);
            return false;
        }
    }
    
    // Configurer les écouteurs d'événements
    setupEventListeners() {
        // Événements audio
        this.audio.addEventListener('play', () => {
            this.isPlaying = true;
            this.updatePlayButton();
            console.log('Lecture démarrée');
        });
        
        this.audio.addEventListener('pause', () => {
            this.isPlaying = false;
            this.updatePlayButton();
            console.log('Lecture en pause');
        });
        
        this.audio.addEventListener('ended', () => {
            this.isPlaying = false;
            this.updatePlayButton();
            this.playNext();
            console.log('Lecture terminée');
        });
        
        this.audio.addEventListener('timeupdate', () => {
            this.updateProgress();
        });
        
        this.audio.addEventListener('loadedmetadata', () => {
            this.updateTotalTime();
        });
        
        this.audio.addEventListener('error', (e) => {
            console.error('Erreur de lecture:', e);
            alert('Erreur lors de la lecture du fichier audio. Veuillez réessayer.');
        });
        
        // Événements de l'interface
        const playBtn = document.getElementById('playBtn');
        if (playBtn) {
            playBtn.addEventListener('click', () => {
                this.togglePlayPause();
            });
        }
        
        const prevBtn = document.getElementById('prevBtn');
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                this.playPrevious();
            });
        }
        
        const nextBtn = document.getElementById('nextBtn');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.playNext();
            });
        }
        
        const progressBar = document.querySelector('.progress-bar-container');
        if (progressBar) {
            progressBar.addEventListener('click', (e) => {
                this.seek(e);
            });
        }
        
        const volumeBtn = document.getElementById('volumeBtn');
        if (volumeBtn) {
            volumeBtn.addEventListener('click', () => {
                this.toggleMute();
            });
        }
        
        const volumeSlider = document.querySelector('.volume-slider-container');
        if (volumeSlider) {
            volumeSlider.addEventListener('click', (e) => {
                this.setVolumeFromSlider(e);
            });
        }
        
        const playerFavoriteBtn = document.getElementById('playerFavoriteBtn');
        if (playerFavoriteBtn) {
            playerFavoriteBtn.addEventListener('click', () => {
                this.toggleFavorite();
            });
        }
    }
    
    // Jouer un contenu
    play(content) {
        if (!this.initialized) {
            this.init();
        }
        
        try {
            // Vérifier si le contenu est déjà en lecture
            if (this.currentContent && this.currentContent.id === content.id && this.isPlaying) {
                this.pause();
                return;
            }
            
            // Mettre à jour le contenu actuel
            this.currentContent = content;
            
            // Mettre à jour l'interface
            this.updatePlayerUI();
            
            // Charger et jouer le fichier
            this.audio.src = content.fileUrl;
            this.audio.load();
            this.audio.play().catch(error => {
                console.error('Erreur lors de la lecture:', error);
                alert('Impossible de lire ce fichier. Veuillez vérifier que le fichier est accessible.');
            });
            
            // Ajouter aux lectures récentes
            this.addToRecentPlays(content);
            
            // Incrémenter le nombre de vues
            this.incrementViews(content.id);
            
        } catch (error) {
            console.error('Erreur lors de la lecture du contenu:', error);
            alert('Erreur lors de la lecture du contenu: ' + error.message);
        }
    }
    
    // Mettre à jour l'interface du lecteur
    updatePlayerUI() {
        if (!this.currentContent) return;
        
        // Mettre à jour la couverture
        const playerImg = document.querySelector('.player-img');
        if (playerImg) {
            playerImg.src = this.currentContent.thumbnailUrl || 'assets/images/default-cover.webp';
        }
        
        // Mettre à jour le titre
        const playerTitle = document.querySelector('.player-title');
        if (playerTitle) {
            playerTitle.textContent = this.currentContent.title;
        }
        
        // Mettre à jour l'artiste
        const playerArtist = document.querySelector('.player-artist');
        if (playerArtist) {
            playerArtist.textContent = this.currentContent.artist;
        }
        
        // Mettre à jour le bouton favori
        const playerFavoriteBtn = document.getElementById('playerFavoriteBtn');
        if (playerFavoriteBtn) {
            // Vérifier si le contenu est en favori
            const contents = JSON.parse(localStorage.getItem('pariszik_contents') || '[]');
            const content = contents.find(c => c.id === this.currentContent.id);
            if (content && content.isFavorite) {
                playerFavoriteBtn.style.color = '#dc3545';
            } else {
                playerFavoriteBtn.style.color = '';
            }
        }
    }
    
    // Basculer lecture/pause
    togglePlayPause() {
        if (!this.currentContent) return;
        
        if (this.isPlaying) {
            this.pause();
        } else {
            this.resume();
        }
    }
    
    // Mettre en pause
    pause() {
        if (this.audio) {
            this.audio.pause();
        }
    }
    
    // Reprendre la lecture
    resume() {
        if (this.audio && this.currentContent) {
            this.audio.play().catch(error => {
                console.error('Erreur lors de la reprise de la lecture:', error);
                alert('Erreur lors de la lecture du fichier audio.');
            });
        }
    }
    
    // Mettre à jour le bouton lecture
    updatePlayButton() {
        const playBtn = document.getElementById('playBtn');
        if (playBtn) {
            playBtn.textContent = this.isPlaying ? '⏸' : '▶';
        }
    }
    
    // Mettre à jour la progression
    updateProgress() {
        if (!this.audio) return;
        
        const progressBar = document.getElementById('progressBar');
        if (progressBar) {
            const progress = (this.audio.currentTime / this.audio.duration) * 100;
            progressBar.style.width = `${progress}%`;
        }
        
        const currentTime = document.getElementById('currentTime');
        if (currentTime) {
            currentTime.textContent = this.formatTime(this.audio.currentTime);
        }
    }
    
    // Mettre à jour le temps total
    updateTotalTime() {
        if (!this.audio) return;
        
        const totalTime = document.getElementById('totalTime');
        if (totalTime) {
            totalTime.textContent = this.formatTime(this.audio.duration);
        }
    }
    
    // Formater le temps (secondes -> mm:ss)
    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }
    
    // Rechercher dans le fichier
    seek(e) {
        if (!this.audio || !this.audio.duration) return;
        
        const progressBar = document.querySelector('.progress-bar-container');
        const clickX = e.offsetX;
        const width = progressBar.offsetWidth;
        const seekTime = (clickX / width) * this.audio.duration;
        
        this.audio.currentTime = seekTime;
    }
    
    // Jouer le contenu précédent
    playPrevious() {
        if (this.playlist.length === 0) return;
        
        this.currentIndex = (this.currentIndex - 1 + this.playlist.length) % this.playlist.length;
        this.play(this.playlist[this.currentIndex]);
    }
    
    // Jouer le contenu suivant
    playNext() {
        if (this.playlist.length === 0) return;
        
        this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
        this.play(this.playlist[this.currentIndex]);
    }
    
    // Activer/Désactiver le son
    toggleMute() {
        if (!this.audio) return;
        
        this.isMuted = !this.isMuted;
        this.audio.muted = this.isMuted;
        
        const volumeBtn = document.getElementById('volumeBtn');
        if (volumeBtn) {
            volumeBtn.textContent = this.isMuted ? '🔇' : '🔊';
        }
    }
    
    // Définir le volume
    setVolume(volume) {
        if (!this.audio) return;
        
        this.volume = Math.max(0, Math.min(1, volume));
        this.audio.volume = this.volume;
        
        const volumeBar = document.getElementById('volumeBar');
        if (volumeBar) {
            volumeBar.style.width = `${this.volume * 100}%`;
        }
        
        const volumeBtn = document.getElementById('volumeBtn');
        if (volumeBtn) {
            if (this.volume === 0) {
                volumeBtn.textContent = '🔇';
            } else if (this.volume < 0.5) {
                volumeBtn.textContent = '🔉';
            } else {
                volumeBtn.textContent = '🔊';
            }
        }
    }
    
    // Définir le volume à partir du slider
    setVolumeFromSlider(e) {
        const volumeSlider = document.querySelector('.volume-slider-container');
        const clickX = e.offsetX;
        const width = volumeSlider.offsetWidth;
        const volume = clickX / width;
        
        this.setVolume(volume);
    }
    
    // Ajouter aux lectures récentes
    addToRecentPlays(content) {
        try {
            let recentPlays = JSON.parse(localStorage.getItem('pariszik_recent_plays') || '[]');
            
            // Supprimer le contenu s'il existe déjà
            recentPlays = recentPlays.filter(item => item.id !== content.id);
            
            // Ajouter au début
            recentPlays.unshift({
                id: content.id,
                title: content.title,
                artist: content.artist,
                thumbnailUrl: content.thumbnailUrl,
                fileUrl: content.fileUrl,
                playedAt: new Date().toISOString()
            });
            
            // Garder seulement les 10 dernières lectures
            if (recentPlays.length > 10) {
                recentPlays = recentPlays.slice(0, 10);
            }
            
            localStorage.setItem('pariszik_recent_plays', JSON.stringify(recentPlays));
        } catch (error) {
            console.error('Erreur lors de l\'ajout aux lectures récentes:', error);
        }
    }
    
    // Incrémenter le nombre de vues
    incrementViews(contentId) {
        try {
            const contents = JSON.parse(localStorage.getItem('pariszik_contents') || '[]');
            const contentIndex = contents.findIndex(c => c.id === contentId);
            
            if (contentIndex !== -1) {
                contents[contentIndex].views = (contents[contentIndex].views || 0) + 1;
                localStorage.setItem('pariszik_contents', JSON.stringify(contents));
            }
        } catch (error) {
            console.error('Erreur lors de l\'incrémentation des vues:', error);
        }
    }
    
    // Basculer favori
    toggleFavorite() {
        if (!this.currentContent) return;
        
        try {
            const contents = JSON.parse(localStorage.getItem('pariszik_contents') || '[]');
            const contentIndex = contents.findIndex(c => c.id === this.currentContent.id);
            
            if (contentIndex !== -1) {
                contents[contentIndex].isFavorite = !contents[contentIndex].isFavorite;
                
                const playerFavoriteBtn = document.getElementById('playerFavoriteBtn');
                if (playerFavoriteBtn) {
                    playerFavoriteBtn.style.color = contents[contentIndex].isFavorite ? '#dc3545' : '';
                }
                
                localStorage.setItem('pariszik_contents', JSON.stringify(contents));
                
                if (contents[contentIndex].isFavorite) {
                    alert('Ajouté aux favoris');
                } else {
                    alert('Retiré des favoris');
                }
            }
        } catch (error) {
            console.error('Erreur lors de la gestion des favoris:', error);
        }
    }
}

// Créer une instance globale
const audioPlayer = new AudioPlayer();
window.AudioPlayer = audioPlayer;

console.log('Lecteur audio ParisZik prêt');