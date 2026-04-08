export default {
  // App
  noPromptSelected: 'Aucun prompt sélectionné',
  createNewPromptWith: 'Crée un nouveau prompt avec',

  // Sidebar
  newPrompt: '+ Nouveau prompt',
  importMd: 'Importer .md',
  folders: 'Dossiers',
  newFolder: 'Nouveau dossier',
  folderNamePlaceholder: 'Nom du dossier...',
  all: 'Tous',
  general: 'Général',
  rename: 'Renommer',
  context: 'Contexte',
  delete: 'Supprimer',
  tags: 'Tags',
  promptCount: '{{count}} prompt',
  promptCount_other: '{{count}} prompts',
  totalCount: '({{count}} au total)',
  options: 'Options',

  // StatusBar
  wordCount: '{{count}} mot',
  wordCount_other: '{{count}} mots',
  chars: '{{count}} car.',
  themeLight: 'Clair',
  themeDark: 'Sombre',
  themeAuto: 'Auto',
  themeLabel: 'Thème',

  // EditorToolbar
  favorite: 'Favori',
  editor: 'Éditeur',
  split: 'Split',
  preview: 'Aperçu',
  copyMarkdown: 'Copier le markdown',
  copied: 'Copié !',
  copy: 'Copier',
  duplicate: 'Dupliquer',
  duplicateShortcut: 'Dupliquer (⌘ + D)',
  export: 'Export',
  exportMd: 'Exporter en .md',
  newFolderPlaceholder: 'Nouveau dossier...',

  // ConfirmDialog
  deletePromptTitle: 'Supprimer ce prompt ?',
  deletePromptMessage: 'Cette action est irréversible. Le prompt sera définitivement supprimé.',
  cancel: 'Annuler',

  // CommandPalette & PaletteApp
  searchAllPrompts: 'Rechercher dans tous les prompts...',
  searchPrompt: 'Rechercher un prompt...',
  noResults: 'Aucun résultat pour « {{query}} »',
  noResultsShort: 'Aucun résultat',
  navigate: 'naviguer',
  copyAction: 'copier',
  close: 'fermer',

  // SearchBar
  searchPlaceholder: 'Rechercher... ⌘ + K',

  // PromptList
  noPrompts: 'Aucun prompt',

  // TagInput
  addTag: 'Ajouter un tag...',

  // FolderContext
  folderContext: 'Contexte du dossier',
  folderContextDescription: 'ce texte sera ajouté au début de chaque prompt copié depuis ce dossier.',
  folderContextPlaceholder: 'Ex: Tu es un expert React/TypeScript. Utilise toujours des composants fonctionnels...',
  folderContextHint: '⌘ + Enter pour sauvegarder',
  save: 'Enregistrer',

  // Images
  image: 'Image',
  insertImage: 'Insérer une image',
  imageTooLarge: 'Image trop volumineuse (max 10 Mo)',
  unsupportedFormat: "Format d'image non supporté",

  // Language
  language: 'Langue',

  // Server panel
  servers: 'Serveurs',
  local: 'Local',
  addServer: 'Ajouter un serveur',
  editServer: 'Modifier le serveur',
  serverName: 'Nom',
  connect: 'Connecter',
  disconnect: 'Déconnecter',
  connectedTo: 'Connecté au serveur',
  connectedAs: 'Connecté en tant que',
  noServers: 'Aucun serveur configuré. Ajoutez-en un pour collaborer.',
  password: 'Mot de passe',
  displayName: 'Nom d\'affichage',
  login: 'Se connecter',
  signup: 'Créer un compte',
  signupAndConnect: 'Créer un compte et se connecter',
  noAccount: 'Pas de compte ? Créer un compte',
  hasAccount: 'Déjà un compte ? Se connecter',
  back: 'Retour',
  edit: 'Modifier',

  // Admin
  admin: 'Admin',
  users: 'Utilisateurs',
  active: 'Actif',
  inactive: 'Inactif',
  activate: 'Activer',
  deactivate: 'Désactiver',
  noUsers: 'Aucun utilisateur',
  adminPanel: 'Administration',
  userManagement: 'Gestion des utilisateurs'
} as const
