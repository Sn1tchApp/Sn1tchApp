import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Importa o componente principal App

// Cria a raiz para renderizar o app na div com id 'root' no HTML
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App /> {/* Renderiza o componente App */}
  </React.StrictMode>
);