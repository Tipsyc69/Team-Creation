// Variables globales
let players = [];
let currentRating = 3;

// Éléments DOM
const playerNameInput = document.getElementById('playerName');
const starsContainer = document.querySelector('.stars');
const ratingValue = document.getElementById('ratingValue');
const addPlayerBtn = document.getElementById('addPlayer');
const playersList = document.getElementById('playersList');
const playerCount = document.getElementById('playerCount');
const generateTeamsBtn = document.getElementById('generateTeams');
const clearAllBtn = document.getElementById('clearAll');
const teamsModal = document.getElementById('teamsModal');
const teamsDisplay = document.getElementById('teamsDisplay');
const closeModal = document.querySelector('.close');

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    initializeStars();
    setupEventListeners();
    updatePlayerCount();
});

// Configuration du système d'étoiles
function initializeStars() {
    const stars = starsContainer.querySelectorAll('i');
    
    // Définir la note initiale
    updateStars(5);
    
    // Ajouter les événements de clic
    stars.forEach(star => {
        star.addEventListener('click', function() {
            const rating = parseInt(this.dataset.rating);
            currentRating = rating;
            updateStars(rating);
            console.log('Rating sélectionné:', rating); // Debug
        });
    });
}

function updateStars(rating) {
    const stars = starsContainer.querySelectorAll('i');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
    ratingValue.textContent = rating;
    console.log('Étoiles mises à jour:', rating); // Debug
}

// Configuration des événements
function setupEventListeners() {
    addPlayerBtn.addEventListener('click', addPlayer);
    clearAllBtn.addEventListener('click', clearAllPlayers);
    generateTeamsBtn.addEventListener('click', generateTeams);
    closeModal.addEventListener('click', closeTeamsModal);
    
    // Fermer le modal en cliquant à l'extérieur
    window.addEventListener('click', function(event) {
        if (event.target === teamsModal) {
            closeTeamsModal();
        }
    });
    
    // Ajouter un joueur avec Entrée
    playerNameInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addPlayer();
        }
    });
}

// Ajouter un joueur
function addPlayer() {
    const name = playerNameInput.value.trim();
    
    if (!name) {
        showNotification('Veuillez entrer un nom de joueur', 'error');
        return;
    }
    
    if (players.some(player => player.name.toLowerCase() === name.toLowerCase())) {
        showNotification('Ce nom de joueur existe déjà', 'error');
        return;
    }
    
    const player = {
        id: Date.now(),
        name: name,
        rating: currentRating
    };
    
    console.log('Joueur ajouté:', player); // Debug
    
    players.push(player);
    updatePlayersList();
    updatePlayerCount();
    updateGenerateButton();
    
    // Réinitialiser le formulaire
    playerNameInput.value = '';
    currentRating = 5;
    updateStars(5);
    
    showNotification(`Joueur "${name}" ajouté avec succès`, 'success');
}

// Mettre à jour la liste des joueurs
function updatePlayersList() {
    if (players.length === 0) {
        playersList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-user-friends"></i>
                <p>Aucun joueur ajouté</p>
            </div>
        `;
        return;
    }
    
    playersList.innerHTML = players.map(player => `
        <div class="player-card" data-id="${player.id}">
            <div class="player-info">
                <span class="player-name">${player.name}</span>
                <div class="player-rating">
                    ${generateStarsHTML(player.rating)}
                </div>
            </div>
            <button class="remove-player" onclick="removePlayer(${player.id})">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
}

function generateStarsHTML(rating) {
    let starsHTML = '';
    for (let i = 0; i < 10; i++) {
        if (i < rating) {
            starsHTML += `<i class="fas fa-star active"></i>`;
        } else {
            starsHTML += `<i class="fas fa-star"></i>`;
        }
    }
    return starsHTML;
}

// Supprimer un joueur
function removePlayer(id) {
    const playerIndex = players.findIndex(player => player.id === id);
    if (playerIndex !== -1) {
        const playerName = players[playerIndex].name;
        players.splice(playerIndex, 1);
        updatePlayersList();
        updatePlayerCount();
        updateGenerateButton();
        showNotification(`Joueur "${playerName}" supprimé`, 'success');
    }
}

// Effacer tous les joueurs
function clearAllPlayers() {
    if (players.length === 0) {
        showNotification('Aucun joueur à supprimer', 'info');
        return;
    }
    
    if (confirm('Êtes-vous sûr de vouloir supprimer tous les joueurs ?')) {
        players = [];
        updatePlayersList();
        updatePlayerCount();
        updateGenerateButton();
        showNotification('Tous les joueurs ont été supprimés', 'success');
    }
}

// Mettre à jour le compteur de joueurs
function updatePlayerCount() {
    playerCount.textContent = players.length;
}

// Mettre à jour le bouton de génération
function updateGenerateButton() {
    generateTeamsBtn.disabled = players.length < 2;
}

// Générer les équipes équilibrées
function generateTeams() {
    if (players.length < 2) {
        showNotification('Il faut au moins 2 joueurs pour former des équipes', 'error');
        return;
    }
    
    const teams = generateBalancedTeams(players);
    displayTeams(teams);
    teamsModal.style.display = 'block';
}

// Algorithme de génération d'équipes équilibrées
function generateBalancedTeams(players) {
    // Trier les joueurs par niveau (du plus fort au plus faible)
    const sortedPlayers = [...players].sort((a, b) => b.rating - a.rating);
    
    // Calculer le score total
    const totalScore = sortedPlayers.reduce((sum, player) => sum + player.rating, 0);
    const targetScore = totalScore / 2;
    
    // Algorithme glouton pour équilibrer les équipes
    let team1 = [];
    let team2 = [];
    let team1Score = 0;
    let team2Score = 0;
    
    for (let player of sortedPlayers) {
        if (team1Score <= team2Score) {
            team1.push(player);
            team1Score += player.rating;
        } else {
            team2.push(player);
            team2Score += player.rating;
        }
    }
    
    // Optimisation : essayer d'améliorer l'équilibre
    const difference = Math.abs(team1Score - team2Score);
    if (difference > 1) {
        // Essayer de trouver une meilleure combinaison
        const optimizedTeams = optimizeTeams(sortedPlayers, targetScore);
        if (optimizedTeams) {
            return optimizedTeams;
        }
    }
    
    return {
        team1: { players: team1, score: team1Score, name: "Équipe Alpha" },
        team2: { players: team2, score: team2Score, name: "Équipe Beta" }
    };
}

// Fonction d'optimisation des équipes
function optimizeTeams(players, targetScore) {
    const n = players.length;
    const half = Math.floor(n / 2);
    
    // Générer toutes les combinaisons possibles de taille half
    const combinations = generateCombinations(players, half);
    
    let bestDifference = Infinity;
    let bestTeams = null;
    
    for (let combination of combinations) {
        const team1Score = combination.reduce((sum, player) => sum + player.rating, 0);
        const team2Score = targetScore * 2 - team1Score;
        const difference = Math.abs(team1Score - team2Score);
        
        if (difference < bestDifference) {
            bestDifference = difference;
            const team2 = players.filter(player => !combination.includes(player));
            bestTeams = {
                team1: { players: combination, score: team1Score, name: "Équipe Alpha" },
                team2: { players: team2, score: team2Score, name: "Équipe Beta" }
            };
        }
    }
    
    return bestTeams;
}

// Générer toutes les combinaisons possibles
function generateCombinations(arr, size) {
    if (size === 0) return [[]];
    if (arr.length === 0) return [];
    
    const [first, ...rest] = arr;
    const combinations = [];
    
    // Combinaisons incluant le premier élément
    const withFirst = generateCombinations(rest, size - 1);
    for (let combo of withFirst) {
        combinations.push([first, ...combo]);
    }
    
    // Combinaisons sans le premier élément
    const withoutFirst = generateCombinations(rest, size);
    combinations.push(...withoutFirst);
    
    return combinations;
}

// Afficher les équipes
function displayTeams(teams) {
    const { team1, team2 } = teams;
    
    teamsDisplay.innerHTML = `
        <div class="teams-display">
            <div class="team">
                <div class="team-header">
                    <span class="team-name">${team1.name}</span>
                    <span class="team-score">Score: ${team1.score}</span>
                </div>
                <div class="team-players">
                    ${team1.players.map(player => `
                        <div class="team-player">
                            <span class="team-player-name">${player.name}</span>
                            <div class="team-player-rating">
                                ${generateStarsHTML(player.rating)}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="team">
                <div class="team-header">
                    <span class="team-name">${team2.name}</span>
                    <span class="team-score">Score: ${team2.score}</span>
                </div>
                <div class="team-players">
                    ${team2.players.map(player => `
                        <div class="team-player">
                            <span class="team-player-name">${player.name}</span>
                            <div class="team-player-rating">
                                ${generateStarsHTML(player.rating)}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="teams-summary">
                <h3>Résumé de l'équilibrage</h3>
                <p>Différence de score: <strong>${Math.abs(team1.score - team2.score)}</strong></p>
                <p>Score total: <strong>${team1.score + team2.score}</strong></p>
                <p>Score moyen par équipe: <strong>${((team1.score + team2.score) / 2).toFixed(1)}</strong></p>
            </div>
        </div>
    `;
}

// Fermer le modal
function closeTeamsModal() {
    teamsModal.style.display = 'none';
}

// Système de notifications
function showNotification(message, type = 'info') {
    // Supprimer les notifications existantes
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Styles pour la notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        font-family: 'Orbitron', monospace;
        font-weight: 600;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
    `;
    
    document.body.appendChild(notification);
    
    // Animation d'entrée
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Supprimer après 3 secondes
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function getNotificationIcon(type) {
    switch (type) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-exclamation-circle';
        case 'warning': return 'fa-exclamation-triangle';
        default: return 'fa-info-circle';
    }
}

function getNotificationColor(type) {
    switch (type) {
        case 'success': return 'var(--success-color)';
        case 'error': return 'var(--danger-color)';
        case 'warning': return 'var(--warning-color)';
        default: return 'var(--accent-color)';
    }
}

// Fonction utilitaire pour mélanger un tableau
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
} 
