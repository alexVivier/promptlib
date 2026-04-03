import { createRoot } from 'react-dom/client'
import './i18n'
import { PaletteApp } from './PaletteApp'
import './assets/main.css'

createRoot(document.getElementById('root')!).render(<PaletteApp />)
