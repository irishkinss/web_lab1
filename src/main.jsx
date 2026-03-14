// Подключаем React — библиотеку для создания интерфейса
import React from 'react'
// ReactDOM нужен, чтобы «вмонтировать» наше приложение в HTML-страницу
import ReactDOM from 'react-dom/client'
// Главный компонент приложения — с него всё начинается
import App from './App.jsx'
// Общие стили для всей страницы (фон, шрифты и т.д.)
import './index.css'

// Находим в index.html элемент с id="root" и рисуем внутри него наше приложение
// StrictMode — режим React, который помогает находить ошибки в коде
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
