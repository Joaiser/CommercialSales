// public/js/app.js
import { initRouter, handleRoute } from './router.js';

document.addEventListener('DOMContentLoaded', () => {
    initRouter();
    handleRoute(window.location.pathname); // carga inicial
});
