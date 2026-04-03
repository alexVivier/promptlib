# PromptLib

**PromptLib** est une application desktop pour macOS qui permet d'ecrire, organiser et retrouver rapidement vos prompts IA en Markdown.

<img src="resources/icon.png" alt="PromptLib" width="128">

---

## Installation

### Telecharger la derniere version

Rendez-vous sur la page [**Releases**](../../releases/latest) du projet GitHub et telechargez le fichier correspondant a votre machine :

| Fichier | Description |
|---------|-------------|
| `promptlib-x.x.x.dmg` | Installeur macOS (glisser dans Applications) |
| `promptlib-x.x.x-arm64.zip` | Archive ZIP pour Mac Apple Silicon (M1/M2/M3/M4) |

### Installer depuis le DMG

1. Telechargez le fichier `.dmg`
2. Double-cliquez pour l'ouvrir
3. Glissez **PromptLib** dans le dossier **Applications**
4. Lancez l'app depuis le Launchpad ou le dossier Applications

> **Note** : Au premier lancement, macOS peut afficher un avertissement car l'app n'est pas signee par le Mac App Store. Allez dans **Reglages Systeme > Confidentialite et securite** et cliquez sur **Ouvrir quand meme**.

---

## Fonctionnalites

### Gestion des prompts

- **Creer** un nouveau prompt avec le bouton `+ Nouveau prompt` ou `Cmd+N`
- **Editer** le titre en cliquant dessus, le contenu dans l'editeur Markdown
- **Dupliquer** un prompt avec le bouton `Dupliquer` ou `Cmd+D`
- **Supprimer** un prompt avec confirmation de securite
- **Copier** le contenu Markdown dans le presse-papiers (`Copier` ou `Cmd+Shift+C`)
- **Exporter** un prompt en fichier `.md`
- **Importer** des fichiers `.md` ou `.txt` existants via le bouton `Importer .md`

### Organisation

- **Dossiers** : classez vos prompts par categorie (Cmd+clic sur un dossier pour filtrer)
  - Creer un dossier avec le bouton `+` a cote de "Dossiers"
  - Renommer ou supprimer un dossier en survolant et cliquant sur `...`
- **Tags** : ajoutez des tags en tapant dans le champ "Ajouter un tag..." puis `Entree`
  - Supprimez un tag avec le `x` a cote du tag
  - Filtrez par tag en cliquant dessus dans la sidebar
- **Favoris** : marquez un prompt en favori avec l'etoile. Les favoris apparaissent en haut de la liste

### Modes d'affichage

| Mode | Description |
|------|-------------|
| **Editeur** | Editeur Markdown plein ecran |
| **Split** | Editeur a gauche, apercu a droite (par defaut) |
| **Preview** | Apercu du rendu Markdown plein ecran |

### Recherche

- **Recherche sidebar** (`Cmd+K`) : filtre les prompts par titre et tags
- **Palette de commandes** (`Cmd+Alt+P`) : recherche globale dans tous les prompts (titre, contenu, tags). Fonctionne meme quand l'app est en arriere-plan. Selectionnez un resultat et appuyez sur `Entree` pour copier le contenu

### Theme

Cliquez sur le bouton de theme dans la barre de statut (en bas a droite) pour basculer entre :
- **Clair** : theme lumineux
- **Sombre** : theme fonce
- **Auto** : suit le reglage systeme de macOS

---

## Raccourcis clavier

| Raccourci | Action |
|-----------|--------|
| `Cmd+N` | Nouveau prompt |
| `Cmd+D` | Dupliquer le prompt actif |
| `Cmd+K` | Recherche dans la sidebar |
| `Cmd+Alt+P` | Palette de commandes (recherche globale) |
| `Cmd+B` | Afficher / masquer la sidebar |
| `Cmd+Shift+C` | Copier le Markdown dans le presse-papiers |
| `Cmd+S` | Sauvegarder (l'app sauvegarde aussi automatiquement) |
| `Cmd+Shift+I` | Importer des fichiers Markdown |

---

## Barre de statut

La barre en bas de la fenetre affiche :
- **Nombre de mots** du prompt actif
- **Nombre de caracteres** (utile pour estimer les tokens)
- **Dossier** du prompt actif
- **Tags** du prompt actif
- **Bouton de theme** (clic pour changer)

---

## Stockage des donnees

Vos prompts sont stockes localement sur votre machine dans :

```
~/Library/Application Support/PromptLib/prompts/
```

Chaque prompt est un fichier JSON individuel. Un fichier `index.json` contient les metadonnees pour un chargement rapide. Aucune donnee n'est envoyee sur internet.

---

## Pour les developpeurs

### Prerequis

- Node.js >= 18
- npm

### Installation des dependances

```bash
npm install
```

### Lancer en mode developpement

```bash
npm run dev
```

### Verifier les types TypeScript

```bash
npm run typecheck
```

### Build de production

```bash
npm run build
```

### Creer le package distributable (DMG + ZIP)

```bash
npm run package
```

Les fichiers sont generes dans le dossier `dist/`.

---

## Stack technique

| Technologie | Role |
|-------------|------|
| Electron | Framework desktop |
| React 19 | Interface utilisateur |
| TypeScript | Typage statique |
| Tailwind CSS 4 | Styles |
| CodeMirror | Editeur de code Markdown |
| Zustand | Gestion d'etat |
| Fuse.js | Recherche floue |
| Marked + DOMPurify | Rendu Markdown securise |

---

## Licence

ISC
