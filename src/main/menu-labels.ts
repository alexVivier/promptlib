type Language = 'fr' | 'en' | 'es' | 'pt' | 'de'

interface MenuLabels {
  file: string
  newPrompt: string
  importMarkdown: string
  edit: string
  view: string
  window: string
}

const labels: Record<Language, MenuLabels> = {
  fr: {
    file: 'Fichier',
    newPrompt: 'Nouveau prompt',
    importMarkdown: 'Importer Markdown...',
    edit: 'Édition',
    view: 'Affichage',
    window: 'Fenêtre'
  },
  en: {
    file: 'File',
    newPrompt: 'New prompt',
    importMarkdown: 'Import Markdown...',
    edit: 'Edit',
    view: 'View',
    window: 'Window'
  },
  es: {
    file: 'Archivo',
    newPrompt: 'Nuevo prompt',
    importMarkdown: 'Importar Markdown...',
    edit: 'Edición',
    view: 'Vista',
    window: 'Ventana'
  },
  pt: {
    file: 'Arquivo',
    newPrompt: 'Novo prompt',
    importMarkdown: 'Importar Markdown...',
    edit: 'Edição',
    view: 'Visualização',
    window: 'Janela'
  },
  de: {
    file: 'Datei',
    newPrompt: 'Neuer Prompt',
    importMarkdown: 'Markdown importieren...',
    edit: 'Bearbeiten',
    view: 'Ansicht',
    window: 'Fenster'
  }
}

export function getMenuLabels(lang: Language): MenuLabels {
  return labels[lang] || labels.fr
}
