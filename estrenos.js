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

    catalogContainer.innerHTML = '<div class="loading">Cargando estrenos...</div>';

    Papa.parse('games.csv', {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
            gamesData = results.data.map((game, index) => {
                return { ...game, id: index.toString() };
            });

            estrenosData = gamesData.filter(game => game.Estreno === 'true');

            // Mostrar solo 12 estrenos
            if (estrenosData.length > 12) {
                estrenosData = estrenosData.slice(0, 12);
            }

            renderEstrenos();
            updateCartCount();
            syncButtonsWithCart();
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

        catalogContainer.innerHTML = '';
        const fragment = document.createDocumentFragment();

        estrenosData.forEach(game => {
            const gameCard = createGameCard(game);
            fragment.appendChild(gameCard);
        });

        catalogContainer.appendChild(fragment);

        // Sincroniza estado de botones según el carrito actual
        syncButtonsWithCart();
    }

    function createGameCard(game) {
        const card = document.createElement('div');
        card.className = 'game-card';

        const coverPath = game.Portada || 'imagenes/placeholder.jpg';
        const precio = calcularPrecio(game.Nombre, game.Plataforma, game.Tamaño);

        // Igual que en la principal: usar .btn-group y respetar estado del carrito
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const isInCart = cart.some(item => item.id === game.id);

        card.innerHTML = `
            <img src="${coverPath}" alt="${game.Nombre}" class="game-cover" loading="lazy"
                 onerror="this.src='imagenes/placeholder.jpg'">
            <div class="game-info">
                <h3 class="game-title">${game.Nombre}</h3>
                <p class="game-size">📦 ${game.Tamaño || 'N/D'}   💲${precio} CUP</p>
                <div class="btn-group">
                    <button class="details-btn" data-id="${game.id}">Detalles</button>
                    <button class="add-cart-btn" data-id="${game.id}" 
                        ${isInCart ? 'disabled' : ''} 
                        style="${isInCart ? 'background-color:#777;' : ''}">
                        ${isInCart ? 'En carrito' : 'Comprar'}
                    </button>
                </div>
            </div>
        `;
        return card;
    }

    // Delegación de eventos para botones
    catalogContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('details-btn')) {
            const gameId = e.target.getAttribute('data-id');
            window.location.href = `details.html?id=${gameId}`;
        }

        if (e.target.classList.contains('add-cart-btn')) {
            const gameId = e.target.getAttribute('data-id');
            const game = estrenosData.find(j => j.id === gameId);
            if (game) {
                addToCart(game, e.target);
            }
        }
    });

    function addToCart(game, button) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existe = cart.find(j => j.id === game.id);
        if (!existe) {
            cart.push({
                id: game.id,
                Nombre: game.Nombre,
                Tamaño: game.Tamaño,
                Precio: calcularPrecio(game.Nombre, game.Plataforma, game.Tamaño)
            });
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCount();

            button.textContent = "En carrito";
            button.style.backgroundColor = "#777";
            button.disabled = true;
        }
    }

    // Contador del carrito unificado
    function updateCartCount() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const countSpan = document.querySelector('.cart-count');
        if (countSpan) {
            countSpan.textContent = cart.length;
            // pequeña animación (si tu CSS tiene .bump)
            countSpan.classList.add('bump');
            setTimeout(() => countSpan.classList.remove('bump'), 300);
        }
    }

    // Sincroniza botones con el estado del carrito (sin recargar)
    function syncButtonsWithCart() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const inCartIds = new Set(cart.map(item => item.id));

        document.querySelectorAll('.add-cart-btn').forEach(btn => {
            const id = btn.getAttribute('data-id');
            if (inCartIds.has(id)) {
                btn.textContent = "En carrito";
                btn.style.backgroundColor = "#777";
                btn.disabled = true;
            } else {
                btn.textContent = "Comprar";
                btn.style.backgroundColor = "";
                btn.disabled = false;
            }
        });
    }

    // Escucha cambios desde carrito.html y actualiza sin recargar
    window.addEventListener('storage', () => {
        updateCartCount();
        syncButtonsWithCart();
    });
});

// Animación de carga de imágenes
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
