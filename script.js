// Variables globales
let players = [];
let savedPlayers = JSON.parse(localStorage.getItem('savedPlayers') || '[]');

// Éléments DOM
const playerNameInput = document.getElementById('playerName');
const starsContainer = document.querySelector('.stars');
const ratingValue = document.getElementById('ratingValue');
const addPlayerBtn = document.getElementById('addPlayer');
const addPlayerRowBtn = document.getElementById('addPlayerRow');
const addAllPlayersBtn = document.getElementById('addAllPlayers');
const playersList = document.getElementById('playersList');
const playerCount = document.getElementById('playerCount');
const generateTeamsBtn = document.getElementById('generateTeams');
const clearAllBtn = document.getElementById('clearAll');
const shuffleTeamsBtn = document.getElementById('shuffleTeams');
const exportPlayersBtn = document.getElementById('exportPlayers');
const importPlayersBtn = document.getElementById('importPlayers');
const importFileInput = document.getElementById('importFile');
const teamsModal = document.getElementById('teamsModal');
const teamsDisplay = document.getElementById('teamsDisplay');
const closeModal = document.querySelector('.close');
const teamCountSelect = document.getElementById('teamCount');
const playersPerTeamSelect = document.getElementById('playersPerTeam');

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    updatePlayerCount();
    loadSavedPlayers();
    updateGenerateButton();
    setupLevelButtons();
});

// Configuration des boutons de niveau
function setupLevelButtons() {
    // Ajouter les événements pour les boutons de niveau existants
    document.querySelectorAll('.level-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const row = this.closest('.input-row');
            const levelButtons = row.querySelectorAll('.level-btn');
            levelButtons.forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
        });
    });
}

// Configuration des événements
function setupEventListeners() {
    addPlayerRowBtn.addEventListener('click', addPlayerRow);
    addAllPlayersBtn.addEventListener('click', addAllPlayers);
    clearAllBtn.addEventListener('click', clearAllPlayers);
    generateTeamsBtn.addEventListener('click', generateTeams);
    shuffleTeamsBtn.addEventListener('click', shuffleTeams);
    exportPlayersBtn.addEventListener('click', exportPlayers);
    importPlayersBtn.addEventListener('click', importPlayers);
    importFileInput.addEventListener('change', handleFileImport);
    closeModal.addEventListener('click', closeTeamsModal);
    
    // Fermer le modal en cliquant à l'extérieur
    window.addEventListener('click', function(event) {
        if (event.target === teamsModal) {
            closeTeamsModal();
        }
    });
    
    // Mettre à jour le bouton quand la configuration change
    teamCountSelect.addEventListener('change', updateGenerateButton);
    playersPerTeamSelect.addEventListener('change', updateGenerateButton);
    
    // Prévisualisation en temps réel
    teamCountSelect.addEventListener('change', showPreview);
    playersPerTeamSelect.addEventListener('change', showPreview);
}

// Ajouter une nouvelle ligne de joueur
function addPlayerRow() {
    const container = document.querySelector('.player-input-container');
    const newRow = document.createElement('div');
    newRow.className = 'input-row';
    newRow.innerHTML = `
        <button class="remove-player-btn" onclick="removePlayerRow(this)">
            <i class="fas fa-times"></i>
        </button>
        <input type="text" class="player-name-input" placeholder="Nom du joueur" maxlength="20">
        <div class="level-buttons">
            <button class="level-btn" data-level="1">1</button>
            <button class="level-btn" data-level="2">2</button>
            <button class="level-btn" data-level="3">3</button>
            <button class="level-btn" data-level="4">4</button>
            <button class="level-btn" data-level="5">5</button>
            <button class="level-btn" data-level="6">6</button>
            <button class="level-btn" data-level="7">7</button>
            <button class="level-btn" data-level="8">8</button>
            <button class="level-btn" data-level="9">9</button>
            <button class="level-btn" data-level="10">10</button>
        </div>
    `;
    
    container.appendChild(newRow);
    setupLevelButtons();
}

// Supprimer une ligne de joueur
function removePlayerRow(button) {
    const row = button.closest('.input-row');
    row.remove();
}

// Ajouter tous les joueurs
function addAllPlayers() {
    const inputRows = document.querySelectorAll('.input-row');
    let addedCount = 0;
    let errors = [];
    
    inputRows.forEach((row, index) => {
        const nameInput = row.querySelector('.player-name-input');
        const selectedLevelBtn = row.querySelector('.level-btn.selected');
        
        const name = nameInput.value.trim();
        const level = selectedLevelBtn ? parseInt(selectedLevelBtn.dataset.level) : null;
        
        if (!name) {
            errors.push(`Ligne ${index + 1}: Nom manquant`);
            return;
        }
        
        if (!level) {
            errors.push(`Ligne ${index + 1}: Niveau non sélectionné`);
            return;
        }
        
        if (players.some(player => player.name.toLowerCase() === name.toLowerCase())) {
            errors.push(`Ligne ${index + 1}: Nom "${name}" déjà existant`);
            return;
        }
        
        const player = {
            id: Date.now() + index,
            name: name,
            rating: level
        };
        
        players.push(player);
        addedCount++;
    });
    
    if (errors.length > 0) {
        showNotification(`Erreurs:\n${errors.join('\n')}`, 'error');
        return;
    }
    
    if (addedCount > 0) {
        updatePlayersList();
        updatePlayerCount();
        updateGenerateButton();
        savePlayers();
        showPreview();
        showNotification(`${addedCount} joueur(s) ajouté(s) avec succès`, 'success');
        
        // Réinitialiser les lignes
        inputRows.forEach(row => {
            const nameInput = row.querySelector('.player-name-input');
            const levelButtons = row.querySelectorAll('.level-btn');
            nameInput.value = '';
            levelButtons.forEach(btn => btn.classList.remove('selected'));
        });
    } else {
        showNotification('Aucun joueur valide à ajouter', 'warning');
    }
}

// Charger les joueurs sauvegardés
function loadSavedPlayers() {
    if (savedPlayers.length > 0) {
        players = [...savedPlayers];
        updatePlayersList();
        updatePlayerCount();
        showNotification(`${savedPlayers.length} joueurs chargés depuis la sauvegarde`, 'success');
    }
}

// Sauvegarder les joueurs
function savePlayers() {
    localStorage.setItem('savedPlayers', JSON.stringify(players));
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
            <div class="player-actions">
                <button class="edit-player" onclick="editPlayer(${player.id})" title="Modifier">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="remove-player" onclick="removePlayer(${player.id})" title="Supprimer">
                    <i class="fas fa-times"></i>
                </button>
            </div>
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

// Modifier un joueur
function editPlayer(id) {
    const player = players.find(p => p.id === id);
    if (!player) return;
    
    const newName = prompt('Nouveau nom du joueur:', player.name);
    if (newName && newName.trim() !== '') {
        const newRating = prompt('Nouveau niveau (1-10):', player.rating);
        const rating = parseInt(newRating);
        
        if (rating >= 1 && rating <= 10) {
            player.name = newName.trim();
            player.rating = rating;
            updatePlayersList();
            savePlayers();
            showPreview();
            showNotification(`Joueur "${player.name}" modifié`, 'success');
        } else {
            showNotification('Niveau invalide (1-10)', 'error');
        }
    }
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
        savePlayers();
        showPreview();
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
        savePlayers();
        hidePreview();
        showNotification('Tous les joueurs ont été supprimés', 'success');
    }
}

// Mettre à jour le compteur de joueurs
function updatePlayerCount() {
    playerCount.textContent = players.length;
}

// Mettre à jour le bouton de génération
function updateGenerateButton() {
    const teamCount = parseInt(teamCountSelect.value);
    const playersPerTeam = playersPerTeamSelect.value;
    
    let minPlayers = teamCount;
    if (playersPerTeam !== 'auto') {
        minPlayers = teamCount * parseInt(playersPerTeam);
    }
    
    const hasEnoughPlayers = players.length >= minPlayers;
    generateTeamsBtn.disabled = !hasEnoughPlayers;
    shuffleTeamsBtn.disabled = !hasEnoughPlayers;
}

// Prévisualisation des équipes
function showPreview() {
    if (players.length === 0) {
        hidePreview();
        return;
    }
    
    const teamCount = parseInt(teamCountSelect.value);
    const playersPerTeam = playersPerTeamSelect.value;
    
    let minPlayers = teamCount;
    if (playersPerTeam !== 'auto') {
        minPlayers = teamCount * parseInt(playersPerTeam);
    }
    
    if (players.length < minPlayers) {
        hidePreview();
        return;
    }
    
    const teams = generateBalancedTeams(players, teamCount, playersPerTeam);
    displayPreview(teams);
}

function hidePreview() {
    const existingPreview = document.getElementById('teamsPreview');
    if (existingPreview) {
        existingPreview.remove();
    }
}

function displayPreview(teams) {
    hidePreview();
    
    const previewDiv = document.createElement('div');
    previewDiv.id = 'teamsPreview';
    previewDiv.className = 'teams-preview';
    
    const totalScore = teams.reduce((sum, team) => sum + team.score, 0);
    const avgScore = totalScore / teams.length;
    const maxScore = Math.max(...teams.map(team => team.score));
    const minScore = Math.min(...teams.map(team => team.score));
    const scoreDifference = maxScore - minScore;
    
    previewDiv.innerHTML = `
        <h3><i class="fas fa-eye"></i> Prévisualisation des Équipes</h3>
        <div class="preview-teams">
            ${teams.map(team => `
                <div class="preview-team">
                    <div class="preview-team-header">
                        <span class="preview-team-name">${team.name}</span>
                        <span class="preview-team-score">${team.score}</span>
                    </div>
                    <div class="preview-team-players">
                        ${team.players.map(player => `
                            <div class="preview-team-player">
                                <span>${player.name}</span>
                                <div class="preview-player-rating">
                                    ${generateStarsHTML(player.rating)}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('')}
        </div>
        <div class="preview-stats">
            <div class="stat-item">
                <span class="stat-label">Différence max:</span>
                <span class="stat-value ${scoreDifference <= 2 ? 'good' : scoreDifference <= 5 ? 'warning' : 'bad'}">${scoreDifference}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Score moyen:</span>
                <span class="stat-value">${avgScore.toFixed(1)}</span>
            </div>
        </div>
    `;
    
    const teamsSection = document.querySelector('.teams-section');
    teamsSection.appendChild(previewDiv);
}

// Générer les équipes équilibrées
function generateTeams() {
    const teamCount = parseInt(teamCountSelect.value);
    const playersPerTeam = playersPerTeamSelect.value;
    
    let minPlayers = teamCount;
    if (playersPerTeam !== 'auto') {
        minPlayers = teamCount * parseInt(playersPerTeam);
    }
    
    if (players.length < minPlayers) {
        showNotification(`Il faut au moins ${minPlayers} joueurs pour former ${teamCount} équipes`, 'error');
        return;
    }
    
    const teams = generateBalancedTeams(players, teamCount, playersPerTeam);
    displayTeams(teams);
    teamsModal.style.display = 'block';
}

// Algorithme de génération d'équipes équilibrées
function generateBalancedTeams(players, teamCount, playersPerTeam) {
    // Trier les joueurs par niveau (du plus fort au plus faible)
    const sortedPlayers = [...players].sort((a, b) => b.rating - a.rating);
    
    // Calculer le nombre de joueurs par équipe
    let playersPerTeamCount = Math.floor(players.length / teamCount);
    if (playersPerTeam !== 'auto') {
        playersPerTeamCount = parseInt(playersPerTeam);
    }
    
    // Créer les équipes
    const teams = [];
    for (let i = 0; i < teamCount; i++) {
        teams.push({
            players: [],
            score: 0,
            name: `Équipe ${getTeamName(i + 1)}`
        });
    }
    
    // Répartir les joueurs de manière équilibrée
    let currentTeam = 0;
    for (let player of sortedPlayers) {
        // Trouver l'équipe avec le score le plus faible
        let minScoreTeam = 0;
        let minScore = Infinity;
        
        for (let i = 0; i < teams.length; i++) {
            if (teams[i].players.length < playersPerTeamCount && teams[i].score < minScore) {
                minScore = teams[i].score;
                minScoreTeam = i;
            }
        }
        
        // Si toutes les équipes ont le bon nombre de joueurs, prendre celle avec le score le plus faible
        if (teams[minScoreTeam].players.length >= playersPerTeamCount) {
            for (let i = 0; i < teams.length; i++) {
                if (teams[i].score < minScore) {
                    minScore = teams[i].score;
                    minScoreTeam = i;
                }
            }
        }
        
        teams[minScoreTeam].players.push(player);
        teams[minScoreTeam].score += player.rating;
    }
    
    return teams;
}

function getTeamName(index) {
    const teamNames = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon'];
    return teamNames[index - 1] || `Team ${index}`;
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
    const totalScore = teams.reduce((sum, team) => sum + team.score, 0);
    const avgScore = totalScore / teams.length;
    const maxScore = Math.max(...teams.map(team => team.score));
    const minScore = Math.min(...teams.map(team => team.score));
    const scoreDifference = maxScore - minScore;
    
    teamsDisplay.innerHTML = `
        <div class="teams-display">
            ${teams.map(team => `
                <div class="team">
                    <div class="team-header">
                        <span class="team-name">${team.name}</span>
                        <span class="team-score">Score: ${team.score}</span>
                    </div>
                    <div class="team-players">
                        ${team.players.map(player => `
                            <div class="team-player">
                                <span class="team-player-name">${player.name}</span>
                                <div class="team-player-rating">
                                    ${generateStarsHTML(player.rating)}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('')}
            
            <div class="teams-summary">
                <h3>Résumé de l'équilibrage</h3>
                <div class="summary-stats">
                    <div class="summary-stat">
                        <span class="stat-icon"><i class="fas fa-users"></i></span>
                        <span class="stat-label">Équipes:</span>
                        <span class="stat-value">${teams.length}</span>
                    </div>
                    <div class="summary-stat">
                        <span class="stat-icon"><i class="fas fa-balance-scale"></i></span>
                        <span class="stat-label">Différence max:</span>
                        <span class="stat-value ${scoreDifference <= 2 ? 'good' : scoreDifference <= 5 ? 'warning' : 'bad'}">${scoreDifference}</span>
                    </div>
                    <div class="summary-stat">
                        <span class="stat-icon"><i class="fas fa-calculator"></i></span>
                        <span class="stat-label">Score total:</span>
                        <span class="stat-value">${totalScore}</span>
                    </div>
                    <div class="summary-stat">
                        <span class="stat-icon"><i class="fas fa-chart-line"></i></span>
                        <span class="stat-label">Score moyen:</span>
                        <span class="stat-value">${avgScore.toFixed(1)}</span>
                    </div>
                </div>
                <div class="equilibrium-indicator">
                    <span class="indicator-label">Équilibrage:</span>
                    <span class="indicator-value ${scoreDifference <= 2 ? 'excellent' : scoreDifference <= 5 ? 'good' : scoreDifference <= 8 ? 'fair' : 'poor'}">
                        ${scoreDifference <= 2 ? 'Excellent' : scoreDifference <= 5 ? 'Bon' : scoreDifference <= 8 ? 'Correct' : 'À améliorer'}
                    </span>
                </div>
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
        white-space: pre-line;
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

// Mélanger les équipes
function shuffleTeams() {
    if (players.length === 0) {
        showNotification('Aucun joueur à mélanger', 'error');
        return;
    }
    
    // Mélanger aléatoirement les joueurs
    players = shuffleArray(players);
    updatePlayersList();
    savePlayers();
    showPreview();
    showNotification('Joueurs mélangés aléatoirement', 'success');
}

// Exporter les joueurs
function exportPlayers() {
    if (players.length === 0) {
        showNotification('Aucun joueur à exporter', 'error');
        return;
    }
    
    const dataStr = JSON.stringify(players, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `joueurs_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    showNotification('Joueurs exportés avec succès', 'success');
}

// Importer les joueurs
function importPlayers() {
    importFileInput.click();
}

function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedPlayers = JSON.parse(e.target.result);
            
            if (!Array.isArray(importedPlayers)) {
                throw new Error('Format de fichier invalide');
            }
            
            // Vérifier la structure des joueurs
            const validPlayers = importedPlayers.filter(player => 
                player && typeof player.name === 'string' && 
                typeof player.rating === 'number' && 
                player.rating >= 1 && player.rating <= 10
            );
            
            if (validPlayers.length === 0) {
                throw new Error('Aucun joueur valide trouvé dans le fichier');
            }
            
            // Ajouter les joueurs importés
            const existingNames = players.map(p => p.name.toLowerCase());
            const newPlayers = validPlayers.filter(player => 
                !existingNames.includes(player.name.toLowerCase())
            );
            
            if (newPlayers.length === 0) {
                showNotification('Tous les joueurs existent déjà', 'warning');
                return;
            }
            
            players.push(...newPlayers);
            updatePlayersList();
            updatePlayerCount();
            updateGenerateButton();
            savePlayers();
            showPreview();
            
            showNotification(`${newPlayers.length} joueurs importés avec succès`, 'success');
            
        } catch (error) {
            showNotification(`Erreur lors de l'import: ${error.message}`, 'error');
        }
    };
    
    reader.readAsText(file);
    event.target.value = ''; // Réinitialiser l'input
} 