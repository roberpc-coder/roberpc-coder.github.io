document.addEventListener("DOMContentLoaded", () => {
    const cartContainer = document.getElementById("cartList");
    const totalContainer = document.getElementById("cartTotal");
    const sendBtn = document.getElementById("sendWhatsApp");

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

                // 🔔 Avisar al catálogo que el carrito cambió
                window.dispatchEvent(new Event("storage"));
            };

            li.appendChild(removeBtn);
            cartContainer.appendChild(li);

            const p = parseFloat(game.Precio);
            if (!isNaN(p)) total += p;
        });

        totalContainer.textContent = `Total: ${total} CUP`;
    }

    sendBtn.addEventListener("click", () => {
        if (!cart || cart.length === 0) return;

        let message = "🛒 Lista de juegos:\n\n";
        let total = 0;

        cart.forEach(g => {
            message += `- ${g.Nombre} (${g.Tamaño}) - ${g.Precio} CUP\n`;
            const p = parseFloat(g.Precio);
            if (!isNaN(p)) total += p;
        });

        message += `\nTotal: ${total} CUP`;

        const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(url, "_blank");
    });

    updateCartView();
});
