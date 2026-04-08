export default {
  // App
  noPromptSelected: 'Kein Prompt ausgewählt',
  createNewPromptWith: 'Erstelle einen neuen Prompt mit',

  // Sidebar
  newPrompt: '+ Neuer Prompt',
  importMd: 'Importieren .md',
  folders: 'Ordner',
  newFolder: 'Neuer Ordner',
  folderNamePlaceholder: 'Ordnername...',
  all: 'Alle',
  general: 'Allgemein',
  rename: 'Umbenennen',
  context: 'Kontext',
  delete: 'Löschen',
  tags: 'Tags',
  promptCount: '{{count}} Prompt',
  promptCount_other: '{{count}} Prompts',
  totalCount: '({{count}} insgesamt)',
  options: 'Optionen',

  // StatusBar
  wordCount: '{{count}} Wort',
  wordCount_other: '{{count}} Wörter',
  chars: '{{count}} Zeichen',
  themeLight: 'Hell',
  themeDark: 'Dunkel',
  themeAuto: 'Auto',
  themeLabel: 'Thema',

  // EditorToolbar
  favorite: 'Favorit',
  editor: 'Editor',
  split: 'Split',
  preview: 'Vorschau',
  copyMarkdown: 'Markdown kopieren',
  copied: 'Kopiert!',
  copy: 'Kopieren',
  duplicate: 'Duplizieren',
  duplicateShortcut: 'Duplizieren (⌘ + D)',
  export: 'Exportieren',
  exportMd: 'Als .md exportieren',
  newFolderPlaceholder: 'Neuer Ordner...',

  // ConfirmDialog
  deletePromptTitle: 'Diesen Prompt löschen?',
  deletePromptMessage: 'Diese Aktion ist unwiderruflich. Der Prompt wird dauerhaft gelöscht.',
  cancel: 'Abbrechen',

  // CommandPalette & PaletteApp
  searchAllPrompts: 'Alle Prompts durchsuchen...',
  searchPrompt: 'Prompt suchen...',
  noResults: 'Keine Ergebnisse für „{{query}}"',
  noResultsShort: 'Keine Ergebnisse',
  navigate: 'navigieren',
  copyAction: 'kopieren',
  close: 'schließen',

  // SearchBar
  searchPlaceholder: 'Suchen... ⌘ + K',

  // PromptList
  noPrompts: 'Keine Prompts',

  // TagInput
  addTag: 'Tag hinzufügen...',

  // FolderContext
  folderContext: 'Ordnerkontext',
  folderContextDescription: 'dieser Text wird jedem aus diesem Ordner kopierten Prompt vorangestellt.',
  folderContextPlaceholder: 'Z.B.: Du bist ein React/TypeScript-Experte. Verwende immer funktionale Komponenten...',
  folderContextHint: '⌘ + Enter zum Speichern',
  save: 'Speichern',

  // Images
  image: 'Bild',
  insertImage: 'Bild einfügen',
  imageTooLarge: 'Bild zu groß (max. 10 MB)',
  unsupportedFormat: 'Nicht unterstütztes Bildformat',

  // Language
  language: 'Sprache'
} as const
