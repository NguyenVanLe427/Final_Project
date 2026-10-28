(function () {
    "use strict";

    function initCart() {
        const container = document.querySelector("[data-cart-items]");
        if (!container) return;

        const emptyState = document.querySelector("[data-cart-empty]");
        const message = document.querySelector("[data-cart-message]");
        const subtotalElement = document.querySelector("[data-cart-subtotal]");
        const totalElement = document.querySelector("[data-cart-total]");

        function render() {
            let cart;
            try {
                cart = window.Shop.readCart();
            } catch (error) {
                console.error("Không thể đọc giỏ hàng.", error);
                message.textContent = "Dữ liệu giỏ hàng bị lỗi. Hãy kiểm tra bộ nhớ trình duyệt trước khi tiếp tục.";
                container.replaceChildren();
                emptyState.hidden = true;
                return;
            }

            emptyState.hidden = cart.length > 0;
            container.innerHTML = cart.map((item) => `
                <article class="cart-item" data-cart-item="${item.id}">
                    <img src="${item.image}" alt="${item.name}">
                    <div>
                        <h2>${item.name.replace(/[&<>"']/g, "")}</h2>
                        <p>${window.Shop.formatPrice(item.price)}</p>
                    </div>
                    <div class="cart-item-actions">
                        <label class="sr-only" for="qty-${item.id}">Số lượng ${item.name}</label>
                        <input id="qty-${item.id}" type="number" min="1" max="99" value="${item.qty}" data-cart-quantity="${item.id}">
                        <button class="remove-item" type="button" data-remove-item="${item.id}">Xóa</button>
                    </div>
                </article>`).join("");

            const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
            subtotalElement.textContent = window.Shop.formatPrice(total);
            totalElement.textContent = window.Shop.formatPrice(total);
            message.textContent = "";
        }

        container.addEventListener("change", (event) => {
            const input = event.target.closest("[data-cart-quantity]");
            if (!input) return;
            const quantity = Number(input.value);
            if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
                message.textContent = "Số lượng phải từ 1 đến 99.";
                render();
                return;
            }
            try {
                const cart = window.Shop.readCart();
                const item = cart.find((entry) => entry.id === input.dataset.cartQuantity);
                if (item) item.qty = quantity;
                window.Shop.writeCart(cart);
                render();
            } catch (error) {
                console.error("Không thể cập nhật số lượng giỏ hàng.", error);
                message.textContent = "Không thể cập nhật giỏ hàng trên trình duyệt này.";
            }
        });

        container.addEventListener("click", (event) => {
            const button = event.target.closest("[data-remove-item]");
            if (!button) return;
            try {
                const cart = window.Shop.readCart().filter((item) => item.id !== button.dataset.removeItem);
                window.Shop.writeCart(cart);
                render();
            } catch (error) {
                console.error("Không thể xóa sản phẩm khỏi giỏ hàng.", error);
                message.textContent = "Không thể cập nhật giỏ hàng trên trình duyệt này.";
            }
        });

        document.querySelector("[data-checkout]").addEventListener("click", () => {
            message.textContent = "Chức năng đặt hàng sẽ được kết nối khi có hệ thống thanh toán.";
        });
        render();
    }

    document.addEventListener("DOMContentLoaded", initCart);
})();
