document.addEventListener("DOMContentLoaded", function () {
  let gamesData = [];
  let filteredGames = [];
  let currentIndex = 0;
  const batchSize = 12;
  const catalogContainer = document.getElementById("gameCatalog");
  const searchInput = document.getElementById("searchInput");
  const platformSelect = document.getElementById("platformSelect");
  let isLoading = false;

  function getCart() {
    try {
      return JSON.parse(localStorage.getItem("cart")) || [];
    } catch {
      return [];
    }
  }
  function setCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  // === Contador del carrito ===
  function updateCartCount() {
    const cart = getCart();
    const cartCount = document.querySelector(".cart-count");
    if (!cartCount) return;
    cartCount.textContent = String(cart.length);

    // Animación
    cartCount.classList.add("bump");
    setTimeout(() => {
      cartCount.classList.remove("bump");
    }, 300);
  }

  function initCartCount() {
    updateCartCount();
  }

  // Mostrar indicador de carga
  catalogContainer.innerHTML = '<div class="loading">Cargando juegos...</div>';

  // Cargar el archivo CSV
  Papa.parse("games.csv", {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: function (results) {
      gamesData = results.data.map((game, index) => {
        return { ...game, id: index.toString() };
      });

      filteredGames = [...gamesData];
      renderGames();
      setupScrollListener();
    },
    error: function (error) {
      catalogContainer.innerHTML = `<div class="error">Error al cargar los juegos: ${error.message}</div>`;
    },
  });

  function renderGames() {
    if (currentIndex === 0) {
      catalogContainer.innerHTML = "";
    }

    if (filteredGames.length === 0) {
      catalogContainer.innerHTML =
        '<div class="error">No se encontraron juegos.</div>';
      return;
    }

    const endIndex = Math.min(currentIndex + batchSize, filteredGames.length);
    const gamesToLoad = filteredGames.slice(currentIndex, endIndex);

    const fragment = document.createDocumentFragment();

    gamesToLoad.forEach((game) => {
      const gameCard = createGameCard(game);
      fragment.appendChild(gameCard);
    });

    catalogContainer.appendChild(fragment);
    currentIndex = endIndex;
  }

  function createGameCard(game) {
    const card = document.createElement("div");
    card.className = "game-card";

    const coverPath =
      game.Portada && game.Portada.trim() !== ""
        ? game.Portada
        : "imagenes/placeholder.jpg";
    const precio = calcularPrecio(game.Nombre, game.Plataforma, game.Tamaño);

    const cart = getCart();
    const isInCart = cart.some((item) => item.id === game.id);

    card.innerHTML = `
            <img src="${coverPath}" alt="${
      game.Nombre
    }" class="game-cover" loading="lazy"
                 onerror="this.src='imagenes/placeholder.jpg'">
            <div class="game-info">
                <h3 class="game-title">${game.Nombre}</h3>
                <p class="game-size">📦 ${
                  game.Tamaño || "Tamaño no disponible"
                }  💲${precio} CUP</p>
                <div class="btn-group">
                    <button class="details-btn" data-id="${
                      game.id
                    }">Detalles</button>
                    <button class="add-cart-btn" data-id="${game.id}"
                        ${isInCart ? "disabled" : ""}
                        style="${isInCart ? "background-color:#777;" : ""}">
                        ${isInCart ? "En carrito" : "Comprar"}
                    </button>
                </div>
            </div>
        `;
    return card;
  }

  function setupScrollListener() {
    window.addEventListener("scroll", () => {
      if (
        !isLoading &&
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 500
      ) {
        if (currentIndex < filteredGames.length) {
          isLoading = true;
          showLoadingIndicator();

          setTimeout(() => {
            renderGames();
            hideLoadingIndicator();
            isLoading = false;
          }, 500);
        }
      }
    });
  }

  function showLoadingIndicator() {
    let loadingIndicator = document.getElementById("loadingIndicator");

    if (!loadingIndicator) {
      loadingIndicator = document.createElement("div");
      loadingIndicator.id = "loadingIndicator";
      loadingIndicator.className = "loading-indicator";
      loadingIndicator.innerHTML =
        '<div class="loading-spinner"></div><p>Cargando más juegos...</p>';
      catalogContainer.appendChild(loadingIndicator);
    }

    loadingIndicator.style.display = "block";
  }

  function hideLoadingIndicator() {
    const loadingIndicator = document.getElementById("loadingIndicator");
    if (loadingIndicator) {
      loadingIndicator.style.display = "none";
    }
  }

  function filterGames() {
    const searchTerm = (searchInput.value || "").toLowerCase();
    const platform = platformSelect.value;

    currentIndex = 0;

    filteredGames = gamesData.filter((game) => {
      const matchesSearch =
        searchTerm === "" ||
        (game.Nombre || "").toLowerCase().includes(searchTerm);
      const matchesPlatform =
        platform === "all" || (game.Plataforma || "") === platform;
      return matchesSearch && matchesPlatform;
    });

    catalogContainer.innerHTML = "";
    renderGames();
  }

  // Event listeners
  searchInput.addEventListener("input", filterGames);
  platformSelect.addEventListener("change", filterGames);

  // Delegación de eventos para botones
  catalogContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("details-btn")) {
      const gameId = e.target.getAttribute("data-id");
      window.location.href = `detalles.html?id=${gameId}`;
    }
    if (e.target.classList.contains("add-cart-btn")) {
      const gameId = e.target.getAttribute("data-id");
      const game = gamesData.find((g) => g.id === gameId);

      if (game) {
        let cart = getCart();

        if (!cart.some((item) => item.id === game.id)) {
          cart.push({
            id: game.id,
            Nombre: game.Nombre,
            Tamaño: game.Tamaño,
            Precio: calcularPrecio(game.Nombre, game.Plataforma, game.Tamaño),
          });
          setCart(cart);

          e.target.textContent = "En carrito";
          e.target.style.backgroundColor = "#777";
          e.target.disabled = true;

          updateCartCount();
        }
      }
    }
  });

  // Escuchar cambios en localStorage (cuando se borra desde carrito.html)
  window.addEventListener("storage", () => {
    currentIndex = 0;
    catalogContainer.innerHTML = "";
    renderGames();
    updateCartCount();
  });

  // Inicializar contador al cargar
  initCartCount();
});

// Animación de imágenes al cargarse
document.addEventListener("DOMContentLoaded", function () {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.addEventListener("load", () => {
          img.classList.add("loaded");
        });
        observer.unobserve(img);
      }
    });
  });

  const catalogContainer = document.getElementById("gameCatalog");
  const config = { childList: true, subtree: true };

  const mutationObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) {
          const images = node.querySelectorAll("img.game-cover");
          images.forEach((img) => observer.observe(img));
        }
      });
    });
  });

  mutationObserver.observe(catalogContainer, config);
});
