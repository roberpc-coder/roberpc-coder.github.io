// =========================
// Función para calcular precio
// =========================
function calcularPrecio(nombre, plataforma, tamaño) {
    nombre = nombre.trim();
    plataforma = plataforma.toLowerCase();
    let t = parseFloat((tamaño || "").toLowerCase().replace("gb","").trim());

    const preciosEspeciales = {
    "EA SPORTS FC 26": 3000,
    "Battlefield 3 Zolemu": 250,
    "Battlefield 4 Zolemu": 250,
    "World of Warcraft Cataclysm": 150,
    "World of Warcraft Wrath of the Lich King": 150,
    "World of Warcraft Pandaria": 200,
	"Among Us": 100, 
    "World of Warcraft Legion": 250,
    };
    if (preciosEspeciales[nombre]) return preciosEspeciales[nombre];

    if (plataforma.includes("nintendo switch")) return 100;
    if (plataforma.includes("pc online")) return 500;
    if (plataforma.includes("pc emulado")) return 100;

    if (!isNaN(t)) {
        if (t <= 4.9) return 50;
        if (t <= 14.9) return 60;
        if (t <= 39.9) return 70;
        if (t <= 69.9) return 90;
        if (t <= 99.9) return 100;
        if (t >= 100) return 200;
    }
    return "N/D";
}

document.addEventListener('DOMContentLoaded', function() {
    let gamesData = [];
    let estrenosData = [];
    const catalogContainer = document.getElementById('gameCatalog');
    
    // Mostrar indicador de carga
    catalogContainer.innerHTML = '<div class="loading">Cargando estrenos...</div>';
    
    // Cargar el archivo CSV
    Papa.parse('games.csv', {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
            // Agregar un ID único a cada juego
            gamesData = results.data.map((game, index) => {
                return { ...game, id: index.toString() };
            });
            
            // Filtrar solo los juegos que son estrenos
            estrenosData = gamesData.filter(game => game.Estreno === 'true');
            
            // Si hay más de 12 estrenos, tomar solo los primeros 12
            if (estrenosData.length > 12) {
                estrenosData = estrenosData.slice(0, 12);
            }
            
            renderEstrenos();
        },
        error: function(error) {
            catalogContainer.innerHTML = `<div class="error">Error al cargar los estrenos: ${error.message}</div>`;
        }
    });
    
    function renderEstrenos() {
        if (estrenosData.length === 0) {
            catalogContainer.innerHTML = '<div class="error">No hay estrenos disponibles.</div>';
            return;
        }
        
        // Limpiar el contenedor
        catalogContainer.innerHTML = '';
        
        // Crear un fragmento de documento para mejor rendimiento
        const fragment = document.createDocumentFragment();
        
        estrenosData.forEach(game => {
            const gameCard = createGameCard(game);
            fragment.appendChild(gameCard);
        });
        
        catalogContainer.appendChild(fragment);
    }
    
    function createGameCard(game) {
        const card = document.createElement('div');
        card.className = 'game-card';
        
        const coverPath = game.Portada || 'imagenes/placeholder.jpg';
        let precio = calcularPrecio(game.Nombre, game.Plataforma, game.Tamaño);
        
        card.innerHTML = `
            <img src="${coverPath}" alt="${game.Nombre}" class="game-cover" loading="lazy" 
                 onerror="this.src='imagenes/placeholder.jpg'">
            <div class="game-info">
                <h3 class="game-title">${game.Nombre}</h3>
                <p class="game-size">📦 ${game.Tamaño || 'N/D'}   💲${precio} CUP</p>
                <button class="details-btn" data-id="${game.id}">Detalles</button>
            </div>
        `;
        
        return card;
    }
    
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
    
    const catalogContainer = document.getElementById('gameCatalog');
    const config = { childList: true, subtree: true };
    
    const mutationObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1) {
                    const images = node.querySelectorAll('img.game-cover');
                    images.forEach(img => observer.observe(img));
                }
            });
        });
    });
    
    mutationObserver.observe(catalogContainer, config);
});
