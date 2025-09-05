// Script principal pour ParisZik

document.addEventListener('DOMContentLoaded', function() {
    // Initialisation de l'application
    console.log('ParisZik initialisé');
    
    // Gestion du menu mobile
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('nav ul');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            nav.classList.toggle('active');
        });
    }
    
    // Gestion des onglets
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            const tabType = this.getAttribute('data-tab');
            console.log(`Onglet sélectionné: ${tabType}`);
            
            // Ici, vous pouvez charger du contenu dynamique selon l'onglet sélectionné
            loadTabContent(tabType);
        });
    });
    
    // Fonction pour charger le contenu des onglets (à implémenter)
    function loadTabContent(tabType) {
        // Cette fonction sera implémentée plus tard pour charger du contenu dynamique
        console.log(`Chargement du contenu pour l'onglet: ${tabType}`);
    }
    
    // Gestion des formulaires
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            // Empêcher la soumission par défaut pour validation
            // La validation spécifique sera gérée dans chaque page
        });
    });
    
    // Gestion des boutons de lecture
    const playButtons = document.querySelectorAll('.play-btn');
    playButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const title = this.getAttribute('data-title') || 'Titre inconnu';
            const artist = this.getAttribute('data-artist') || 'Artiste inconnu';
            
            // Mettre à jour le player
            const playerTitle = document.querySelector('.player-title');
            const playerArtist = document.querySelector('.player-artist');
            
            if (playerTitle && playerArtist) {
                playerTitle.textContent = title;
                playerArtist.textContent = artist;
            }
            
            // Simuler la lecture
            console.log(`Lecture de "${title}" par ${artist}`);
            
            // Dans une version réelle, vous lanceriez la lecture du fichier
            alert(`Lecture de "${title}" par ${artist}`);
        });
    });
    
    // Gestion de la barre de progression
    const progressBars = document.querySelectorAll('.progress');
    progressBars.forEach(progress => {
        progress.addEventListener('click', function(e) {
            const percent = (e.offsetX / this.offsetWidth) * 100;
            const progressBar = this.querySelector('.progress-bar');
            if (progressBar) {
                progressBar.style.width = `${percent}%`;
            }
        });
    });
    
    // Gestion des cartes (effet au survol)
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Gestion du scroll (effets de révélation)
    const revealElements = document.querySelectorAll('.card, .admin-card, section');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = "1";
                entry.target.style.transform = "translateY(0)";
            }
        });
    }, { threshold: 0.1 });
    
    revealElements.forEach(element => {
        element.style.opacity = "0";
        element.style.transform = "translateY(30px)";
        element.style.transition = "all 0.6s ease";
        observer.observe(element);
    });
    
    // Gestion du formulaire de recherche
    const searchButton = document.querySelector('.search-bar button');
    if (searchButton) {
        searchButton.addEventListener('click', function() {
            const searchInput = document.querySelector('.search-bar input');
            if (searchInput && searchInput.value.trim() !== '') {
                const searchTerm = searchInput.value.trim();
                console.log(`Recherche: ${searchTerm}`);
                // Dans une version réelle, vous redirigeriez vers une page de résultats
                alert(`Recherche de: ${searchTerm}`);
            }
        });
    }
    
    // Gestion de la navigation (liens actifs)
    const currentLocation = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        if (linkHref === currentLocation || (currentLocation === '' && linkHref === 'index.html')) {
            link.classList.add('active');
        }
    });
    
    // Gestion du menu admin (si connecté comme admin)
    const adminBtn = document.querySelector('.btn-admin');
    if (adminBtn) {
        adminBtn.addEventListener('click', function(e) {
            e.preventDefault();
            // Vérifier si l'utilisateur est connecté comme admin
            // Pour l'instant, on redirige directement
            window.location.href = 'admin.html';
        });
    }
    
    // Gestion des messages flash (si présents)
    const flashMessages = document.querySelectorAll('.flash-message');
    flashMessages.forEach(message => {
        setTimeout(() => {
            message.style.opacity = '0';
            message.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                message.remove();
            }, 300);
        }, 5000);
    });
    
    // Gestion du thème (à implémenter)
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-theme');
            // Sauvegarder la préférence dans localStorage
            if (document.body.classList.contains('dark-theme')) {
                localStorage.setItem('theme', 'dark');
            } else {
                localStorage.setItem('theme', 'light');
            }
        });
        
        // Appliquer le thème sauvegardé
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
        }
    }
    
    // Gestion du responsive (menu hamburger)
    const hamburger = document.querySelector('.hamburger');
    const mobileNav = document.querySelector('.mobile-nav');
    
    if (hamburger && mobileNav) {
        hamburger.addEventListener('click', function() {
            mobileNav.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }
    
    // Gestion des notifications (à implémenter)
    const notificationBell = document.querySelector('.notification-bell');
    if (notificationBell) {
        notificationBell.addEventListener('click', function() {
            const notificationDropdown = document.querySelector('.notification-dropdown');
            if (notificationDropdown) {
                notificationDropdown.classList.toggle('active');
            }
        });
    }
    
    // Fermer les dropdowns quand on clique ailleurs
    document.addEventListener('click', function(e) {
        const notificationDropdown = document.querySelector('.notification-dropdown');
        if (notificationDropdown && !e.target.closest('.notification-bell') && !e.target.closest('.notification-dropdown')) {
            notificationDropdown.classList.remove('active');
        }
    });
    
    console.log('ParisZik prêt à l\'emploi !');
});

// Fonction utilitaire pour formater les dates
function formatDate(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString('fr-FR', options);
}

// Fonction utilitaire pour formater les nombres
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    } else {
        return num.toString();
    }
}

// Fonction pour afficher un message flash
function showFlashMessage(message, type = 'info') {
    const flashContainer = document.querySelector('.flash-container') || document.body;
    const flashMessage = document.createElement('div');
    flashMessage.className = `flash-message ${type}`;
    flashMessage.textContent = message;
    flashMessage.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transform: translateX(100%);
        transition: all 0.3s ease;
    `;
    
    if (type === 'success') {
        flashMessage.style.background = '#28a745';
    } else if (type === 'error') {
        flashMessage.style.background = '#dc3545';
    } else if (type === 'warning') {
        flashMessage.style.background = '#ffc107';
        flashMessage.style.color = '#212529';
    } else {
        flashMessage.style.background = '#007bff';
    }
    
    flashContainer.appendChild(flashMessage);
    
    // Animation d'entrée
    setTimeout(() => {
        flashMessage.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto-fermeture après 5 secondes
    setTimeout(() => {
        flashMessage.style.transform = 'translateX(100%)';
        setTimeout(() => {
            flashMessage.remove();
        }, 300);
    }, 5000);
    
    return flashMessage;
}

// Fonction pour confirmer une action
function confirmAction(message, callback) {
    if (confirm(message)) {
        if (typeof callback === 'function') {
            callback();
        }
        return true;
    }
    return false;
}

// Fonction pour charger du contenu dynamiquement
function loadContent(url, container) {
    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Erreur lors du chargement du contenu');
            }
            return response.text();
        })
        .then(html => {
            if (typeof container === 'string') {
                container = document.querySelector(container);
            }
            if (container) {
                container.innerHTML = html;
                return true;
            } else {
                throw new Error('Conteneur non trouvé');
            }
        })
        .catch(error => {
            console.error('Erreur:', error);
            showFlashMessage('Erreur lors du chargement du contenu', 'error');
            return false;
        });
}

// Export des fonctions utilitaires (pour les autres modules)
window.ParisZikUtils = {
    formatDate,
    formatNumber,
    showFlashMessage,
    confirmAction,
    loadContent
};

// Inclure le gestionnaire de contenus
if (typeof contentManager !== 'undefined') {
    window.ParisZikContent = contentManager;
}