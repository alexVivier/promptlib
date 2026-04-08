export default {
  // App
  noPromptSelected: 'Ningún prompt seleccionado',
  createNewPromptWith: 'Crea un nuevo prompt con',

  // Sidebar
  newPrompt: '+ Nuevo prompt',
  importMd: 'Importar .md',
  folders: 'Carpetas',
  newFolder: 'Nueva carpeta',
  folderNamePlaceholder: 'Nombre de la carpeta...',
  all: 'Todos',
  general: 'General',
  rename: 'Renombrar',
  context: 'Contexto',
  delete: 'Eliminar',
  tags: 'Etiquetas',
  promptCount: '{{count}} prompt',
  promptCount_other: '{{count}} prompts',
  totalCount: '({{count}} en total)',
  options: 'Opciones',

  // StatusBar
  wordCount: '{{count}} palabra',
  wordCount_other: '{{count}} palabras',
  chars: '{{count}} car.',
  themeLight: 'Claro',
  themeDark: 'Oscuro',
  themeAuto: 'Auto',
  themeLabel: 'Tema',

  // EditorToolbar
  favorite: 'Favorito',
  editor: 'Editor',
  split: 'Split',
  preview: 'Vista previa',
  copyMarkdown: 'Copiar markdown',
  copied: '¡Copiado!',
  copy: 'Copiar',
  duplicate: 'Duplicar',
  duplicateShortcut: 'Duplicar (⌘ + D)',
  export: 'Exportar',
  exportMd: 'Exportar como .md',
  newFolderPlaceholder: 'Nueva carpeta...',

  // ConfirmDialog
  deletePromptTitle: '¿Eliminar este prompt?',
  deletePromptMessage: 'Esta acción es irreversible. El prompt se eliminará permanentemente.',
  cancel: 'Cancelar',

  // CommandPalette & PaletteApp
  searchAllPrompts: 'Buscar en todos los prompts...',
  searchPrompt: 'Buscar un prompt...',
  noResults: 'Sin resultados para "{{query}}"',
  noResultsShort: 'Sin resultados',
  navigate: 'navegar',
  copyAction: 'copiar',
  close: 'cerrar',

  // SearchBar
  searchPlaceholder: 'Buscar... ⌘ + K',

  // PromptList
  noPrompts: 'Sin prompts',

  // TagInput
  addTag: 'Añadir etiqueta...',

  // FolderContext
  folderContext: 'Contexto de la carpeta',
  folderContextDescription: 'este texto se añadirá al inicio de cada prompt copiado desde esta carpeta.',
  folderContextPlaceholder: 'Ej.: Eres un experto en React/TypeScript. Usa siempre componentes funcionales...',
  folderContextHint: '⌘ + Enter para guardar',
  save: 'Guardar',

  // Images
  image: 'Imagen',
  insertImage: 'Insertar imagen',
  imageTooLarge: 'Imagen demasiado grande (máx. 10 MB)',
  unsupportedFormat: 'Formato de imagen no soportado',

  // Language
  language: 'Idioma',

  // Server panel
  servers: 'Servidores',
  local: 'Local',
  addServer: 'Agregar servidor',
  editServer: 'Editar servidor',
  serverName: 'Nombre',
  connect: 'Conectar',
  disconnect: 'Desconectar',
  connectedTo: 'Conectado al servidor',
  connectedAs: 'Conectado como',
  noServers: 'No hay servidores configurados. Agrega uno para colaborar.',
  password: 'Contraseña',
  displayName: 'Nombre para mostrar',
  login: 'Iniciar sesión',
  signup: 'Registrarse',
  signupAndConnect: 'Registrarse y conectar',
  noAccount: '¿No tienes cuenta? Regístrate',
  hasAccount: '¿Ya tienes cuenta? Inicia sesión',
  back: 'Volver',
  edit: 'Editar',

  // Admin
  admin: 'Admin',
  users: 'Usuarios',
  active: 'Activo',
  inactive: 'Inactivo',
  activate: 'Activar',
  deactivate: 'Desactivar',
  noUsers: 'Sin usuarios',
  adminPanel: 'Administración',
  userManagement: 'Gestión de usuarios'
} as const
