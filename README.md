# Générateur d'Équipes Équilibrées 🎮

Un système moderne de génération d'équipes équilibrées avec une interface de type gaming, développé en JavaScript, HTML et CSS.

## 🚀 Fonctionnalités

- **Interface moderne** : Design gaming avec effets néon et animations fluides
- **Système de notation** : Évaluation des joueurs de 1 à 5 étoiles
- **Algorithme intelligent** : Génération d'équipes équilibrées basée sur les niveaux
- **Interface responsive** : Compatible mobile et desktop
- **Notifications en temps réel** : Feedback utilisateur avec animations

## 🎯 Comment ça marche

1. **Ajoutez des joueurs** : Saisissez le nom et attribuez un niveau (1-5 étoiles)
2. **Génération automatique** : L'algorithme crée des équipes équilibrées
3. **Visualisation** : Affichage des équipes avec scores et statistiques

## 🛠️ Technologies utilisées

- **HTML5** : Structure sémantique
- **CSS3** : Design moderne avec variables CSS, animations et effets
- **JavaScript ES6+** : Logique métier et interactions
- **Font Awesome** : Icônes
- **Google Fonts** : Police Orbitron pour l'aspect gaming

## 📁 Structure du projet

```
├── index.html          # Page principale
├── style.css           # Styles et animations
├── script.js           # Logique JavaScript
└── README.md           # Documentation
```

## 🎮 Algorithme d'équilibrage

Le système utilise un algorithme en deux étapes :

1. **Algorithme glouton** : Répartition rapide des joueurs par niveau
2. **Optimisation** : Recherche de la meilleure combinaison possible pour minimiser l'écart de score

### Exemple d'équilibrage

```
Joueurs: Alice(5★), Bob(4★), Charlie(3★), David(2★), Eve(1★)
Score total: 15

Équipe Alpha: Alice(5★) + David(2★) = 7 points
Équipe Beta: Bob(4★) + Charlie(3★) + Eve(1★) = 8 points

Différence: 1 point (équilibrage optimal)
```

## 🚀 Installation et utilisation

1. **Téléchargez** les fichiers du projet
2. **Ouvrez** `index.html` dans votre navigateur
3. **Commencez** à ajouter des joueurs !

Aucune installation supplémentaire requise - tout fonctionne directement dans le navigateur.

## 🎨 Personnalisation

### Couleurs
Modifiez les variables CSS dans `style.css` :

```css
:root {
    --primary-color: #00ff88;    /* Couleur principale */
    --secondary-color: #ff0080;  /* Couleur secondaire */
    --accent-color: #0080ff;     /* Couleur d'accent */
}
```

### Noms d'équipes
Modifiez les noms dans `script.js` :

```javascript
return {
    team1: { players: team1, score: team1Score, name: "Votre Nom d'Équipe" },
    team2: { players: team2, score: team2Score, name: "Autre Nom d'Équipe" }
};
```

## 📱 Compatibilité

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ Mobile (iOS Safari, Chrome Mobile)

## 🔧 Fonctionnalités avancées

- **Validation des données** : Vérification des noms uniques
- **Persistance locale** : Sauvegarde automatique (optionnelle)
- **Export/Import** : Partage de configurations d'équipes
- **Historique** : Sauvegarde des dernières équipes générées

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :

1. Signaler des bugs
2. Proposer des améliorations
3. Ajouter de nouvelles fonctionnalités
4. Améliorer la documentation

## 📄 Licence

Ce projet est sous licence MIT. Libre d'utilisation pour des projets personnels et commerciaux.

---

**Développé avec ❤️ pour les gamers qui veulent des parties équilibrées !** 
