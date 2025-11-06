document.addEventListener("DOMContentLoaded", () => {
    const cartContainer = document.getElementById("cartList");
    const totalContainer = document.getElementById("cartTotal");
    const sendBtn = document.getElementById("sendWhatsApp");
    const clearBtn = document.getElementById("clearCartBtn"); // debe existir en el HTML

    function getCart() {
        try {
            return JSON.parse(localStorage.getItem("cart")) || [];
        } catch {
            return [];
        }
    }
    function setCart(nextCart) {
        localStorage.setItem("cart", JSON.stringify(nextCart));
        // Notificar a otras páginas para sincronizar botones/contador
        window.dispatchEvent(new Event("storage"));
    }

    let cart = getCart();

    function updateCartView() {
        cartContainer.innerHTML = "";
        let total = 0;

        if (!cart || cart.length === 0) {
            cartContainer.innerHTML = "<li>Tu carrito está vacío.</li>";
            totalContainer.textContent = "Total: 0 CUP";
            return;
        }

        cart.forEach((game, index) => {
            const li = document.createElement("li");
            li.textContent = `${game.Nombre} (${game.Tamaño}) - ${game.Precio} CUP`;

            const removeBtn = document.createElement("button");
            removeBtn.textContent = "❌";
            removeBtn.onclick = () => {
                cart.splice(index, 1);
                setCart(cart);
                updateCartView();
            };

            li.appendChild(removeBtn);
            cartContainer.appendChild(li);

            const p = parseFloat(game.Precio);
            if (!isNaN(p)) total += p;
        });

        totalContainer.textContent = `Total: ${total} CUP`;
    }

    function vaciarCarrito() {
        localStorage.removeItem("cart");
        cart = [];
        updateCartView();
        // Notificar a otras páginas (estrenos/index) para re-habilitar botones
        window.dispatchEvent(new Event("storage"));
    }

    // Enviar por WhatsApp directo a tu número + confirmación para vaciar
    if (sendBtn) {
        sendBtn.addEventListener("click", () => {
            cart = getCart();
            if (!cart || cart.length === 0) return;

            let message = "🛒 Lista de juegos:\n\n";
            let total = 0;

            cart.forEach(g => {
                message += `- ${g.Nombre} (${g.Tamaño}) - ${g.Precio} CUP\n`;
                const p = parseFloat(g.Precio);
                if (!isNaN(p)) total += p;
            });

            message += `\nTotal: ${total} CUP`;

            const url = `https://wa.me/5358024782?text=${encodeURIComponent(message)}`;
            window.open(url, "_blank");

            if (confirm("¿Desea vaciar el carrito después de enviar el pedido?")) {
                vaciarCarrito();
            }
        });
    }

    // Botón “Vaciar carrito”
    if (clearBtn) {
        clearBtn.addEventListener("click", () => {
            if (confirm("¿Seguro que quieres vaciar todo el carrito?")) {
                vaciarCarrito();
            }
        });
    }

    updateCartView();
});
