(function () {
    "use strict";

    function initCheckout() {
        const productList = document.getElementById("product-list");
        const totalPrice = document.getElementById("total-price");
        const checkoutForm = document.getElementById("checkout-form");
        const bankInfo = document.getElementById("bank-info");
        const successMessage = document.getElementById("success-message");
        const orderInfo = document.getElementById("order-info");
        const cart = window.Shop.readCart();
        const message = document.createElement("p");
        message.className = "form-message";
        message.setAttribute("role", "status");
        message.setAttribute("aria-live", "polite");
        checkoutForm.before(message);

        if (cart.length === 0) {
            productList.textContent = "Giỏ hàng đang trống!";
            checkoutForm.hidden = true;
            return;
        }

        const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
        cart.forEach((item) => {
            const row = document.createElement("div");
            row.className = "product-item";
            const name = document.createElement("span");
            name.textContent = `${item.name} x ${item.qty}`;
            const price = document.createElement("span");
            price.textContent = window.Shop.formatPrice(item.price * item.qty);
            row.append(name, price);
            productList.append(row);
        });
        totalPrice.textContent = `Tổng tiền: ${window.Shop.formatPrice(total)}`;

        document.querySelectorAll('input[name="payment"]').forEach((option) => {
            option.addEventListener("change", () => {
                bankInfo.style.display = option.value === "BANK" && option.checked ? "block" : "none";
            });
        });

        checkoutForm.addEventListener("submit", (event) => {
            event.preventDefault();
            const payment = document.querySelector('input[name="payment"]:checked');
            if (!payment) {
                message.textContent = "Vui lòng chọn phương thức thanh toán.";
                return;
            }

            try {
                const order = window.Shop.createOrderFromCart({
                    name: document.getElementById("customer-name").value.trim(),
                    phone: document.getElementById("customer-phone").value.trim(),
                    address: document.getElementById("customer-address").value.trim(),
                    payment: payment.value
                });
                checkoutForm.hidden = true;
                orderInfo.hidden = true;
                document.getElementById("order-code").textContent = `Mã đơn hàng: ${order.id}`;
                successMessage.querySelector('a[href="orders.html"]').href =
                    `orders.html?created=${encodeURIComponent(order.id)}`;
                successMessage.style.display = "block";
            } catch (error) {
                console.error("Không thể tạo đơn hàng.", error);
                message.textContent = error.message === "Giỏ hàng đang trống."
                    ? error.message
                    : "Không thể lưu đơn hàng trên trình duyệt này. Giỏ hàng của bạn vẫn được giữ lại.";
            }
        });
    }

    document.addEventListener("DOMContentLoaded", initCheckout);
})();
