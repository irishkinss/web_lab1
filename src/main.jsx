// ReactDOM нужен, чтобы «вмонтировать» наше приложение в HTML-страницу
import ReactDOM from 'react-dom/client'
// Главный компонент приложения — с него всё начинается
import App from './App.jsx'
// Общие стили для всей страницы (фон, шрифты и т.д.)
import './index.css'

// Без StrictMode: в dev он намеренно дважды вызывает эффекты и удваивает сетевые запросы,
// из‑за чего обновление страницы кажется «вечной» загрузкой.
ReactDOM.createRoot(document.getElementById('root')).render(<App />)
