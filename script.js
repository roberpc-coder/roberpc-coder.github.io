document.addEventListener('DOMContentLoaded', function() {
    let gamesData = [];
    let filteredGames = [];
    let currentIndex = 0;
    const batchSize = 12; // Cargar 50 juegos a la vez
    const catalogContainer = document.getElementById('gameCatalog');
    const searchInput = document.getElementById('searchInput');
    const platformSelect = document.getElementById('platformSelect');
    
    // Mostrar indicador de carga
    catalogContainer.innerHTML = '<div class="loading">Cargando juegos...</div>';
    
    // Cargar el archivo CSV
    Papa.parse('games.csv', {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
            // Agregar un ID único a cada juego (usando el índice)
            gamesData = results.data.map((game, index) => {
                return { ...game, id: index.toString() };
            });
            filteredGames = [...gamesData];
            renderGames();
            setupScrollListener();
        },
        error: function(error) {
            catalogContainer.innerHTML = `<div class="error">Error al cargar los juegos: ${error.message}</div>`;
        }
    });
    
    // Renderizar juegos (por lotes)
    function renderGames() {
        // Si es una nueva búsqueda, limpiar y empezar desde 0
        if (currentIndex === 0) {
            catalogContainer.innerHTML = '';
        }
        
        if (filteredGames.length === 0) {
            catalogContainer.innerHTML = '<div class="error">No se encontraron juegos.</div>';
            return;
        }
        
        // Determinar cuántos juegos cargar en este lote
        const endIndex = Math.min(currentIndex + batchSize, filteredGames.length);
        const gamesToLoad = filteredGames.slice(currentIndex, endIndex);
        
        // Crear un fragmento de documento para mejor rendimiento
        const fragment = document.createDocumentFragment();
        
        gamesToLoad.forEach(game => {
            const gameCard = createGameCard(game);
            fragment.appendChild(gameCard);
        });
        
        catalogContainer.appendChild(fragment);
        
        // Actualizar el índice
        currentIndex = endIndex;
        
        // Mostrar cuántos juegos se están viendo
        updateGamesCounter();
    }
    
    // Crear tarjeta de juego
    function createGameCard(game) {
        const card = document.createElement('div');
        card.className = 'game-card';
        
        // Obtener la ruta de la portada desde el CSV
        const coverPath = game.Portada || '';
        
        card.innerHTML = `
            <img src="${coverPath}" alt="${game.Nombre}" class="game-cover" loading="lazy">
            <div class="game-info">
                <h3 class="game-title">${game.Nombre}</h3>
                <p class="game-size">${game.Tamaño}</p>
                <button class="details-btn" data-id="${game.id}">Detalles</button>
            </div>
        `;
        
        return card;
    }
    
    // Configurar listener de scroll
    function setupScrollListener() {
        window.addEventListener('scroll', () => {
            // Verificar si estamos cerca del final de la página
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
                // Si aún hay juegos por cargar
                if (currentIndex < filteredGames.length) {
                    // Mostrar indicador de carga
                    showLoadingIndicator();
                    
                    // Cargar más juegos después de un pequeño retraso
                    setTimeout(() => {
                        renderGames();
                        hideLoadingIndicator();
                    }, 500);
                }
            }
        });
    }
    
    // Mostrar indicador de carga
    function showLoadingIndicator() {
        let loadingIndicator = document.getElementById('loadingIndicator');
        
        if (!loadingIndicator) {
            loadingIndicator = document.createElement('div');
            loadingIndicator.id = 'loadingIndicator';
            loadingIndicator.className = 'loading-indicator';
            loadingIndicator.innerHTML = '<div class="loading-spinner"></div><p>Cargando más juegos...</p>';
            document.body.appendChild(loadingIndicator);
        }
        
        loadingIndicator.style.display = 'block';
        loadingIndicator.style.position = 'fixed';
        loadingIndicator.style.bottom = '20px';
        loadingIndicator.style.left = '50%';
        loadingIndicator.style.transform = 'translateX(-50%)';
        loadingIndicator.style.zIndex = '1000';
    }
    
    // Ocultar indicador de carga
    function hideLoadingIndicator() {
        const loadingIndicator = document.getElementById('loadingIndicator');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
    }
    
    // Actualizar contador de juegos
    function updateGamesCounter() {
        let counter = document.getElementById('gamesCounter');
        
        if (!counter) {
            counter = document.createElement('div');
            counter.id = 'gamesCounter';
            counter.className = 'games-counter';
            catalogContainer.insertBefore(counter, catalogContainer.firstChild);
        }
        
        counter.textContent = `Mostrando ${currentIndex} de ${filteredGames.length} juegos`;
    }
    
    // Filtrar juegos - MODIFICADO PARA BUSCAR POR LETRA INICIAL
    function filterGames() {
        const searchTerm = searchInput.value.toLowerCase();
        const platform = platformSelect.value;
        
        // Resetear el índice cuando se filtra
        currentIndex = 0;
        
        filteredGames = gamesData.filter(game => {
            // Buscar por el inicio del nombre (letra inicial)
            const matchesSearch = searchTerm === '' || 
                                 game.Nombre.toLowerCase().startsWith(searchTerm);
            const matchesPlatform = platform === 'all' || game.Plataforma === platform;
            return matchesSearch && matchesPlatform;
        });
        
        // Volver a renderizar
        catalogContainer.innerHTML = '';
        renderGames();
    }
    
    // Event listeners
    searchInput.addEventListener('input', filterGames);
    platformSelect.addEventListener('change', filterGames);
    
    // Delegación de eventos para botones de detalles
    catalogContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('details-btn')) {
            const gameId = e.target.getAttribute('data-id');
            window.location.href = `details.html?id=${gameId}`;
        }
    });
});

// Detectar cuando las imágenes se cargan para aplicar la animación
document.addEventListener('DOMContentLoaded', function() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.addEventListener('load', () => {
                    img.classList.add('loaded');
                });
                observer.unobserve(img);
            }
        });
    });
    
    // Observar todas las imágenes que se agreguen dinámicamente
    const catalogContainer = document.getElementById('gameCatalog');
    const config = { childList: true, subtree: true };
    
    const mutationObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1) { // Es un elemento
                    const images = node.querySelectorAll('img.game-cover');
                    images.forEach(img => observer.observe(img));
                }
            });
        });
    });
    
    mutationObserver.observe(catalogContainer, config);
});