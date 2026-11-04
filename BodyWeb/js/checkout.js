(function () {
    "use strict";

    function initCheckout() {
        const productList = document.getElementById("product-list");
        const totalPrice = document.getElementById("total-price");
        const checkoutForm = document.getElementById("checkout-form");
        const bankInfo = document.getElementById("bank-info");
        const successMessage = document.getElementById("success-message");
        const orderInfo = document.getElementById("order-info");
<<<<<<< HEAD
        const isAuthenticated = sessionStorage.getItem("mm_user_authenticated") === "true";
        if (!isAuthenticated) {
            window.location.replace("login.html?return=checkout.html");
            return;
        }

        const cart = window.Shop.readCart();
=======
        const bankSelect = document.getElementById("bank-select");
        const bankAccount = document.getElementById("bank-account");
        const bankOwner = document.getElementById("bank-owner");
        const accountResult = document.getElementById("account-result");
>>>>>>> 07693e6deea967c0069cb7573016eefc40b41704
        const message = document.createElement("p");
        let accountChecked = false;

        message.className = "form-message";
        message.setAttribute("role", "status");
        message.setAttribute("aria-live", "polite");
        checkoutForm.before(message);

        document.getElementById("customer-name").value = localStorage.getItem("hoTen") || "";
        document.getElementById("customer-phone").value = localStorage.getItem("soDienThoai") || "";
        document.getElementById("customer-email").value = localStorage.getItem("email") || "";

        const cart = window.Shop.readCart();
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

        function resetAccountCheck() {
            accountChecked = false;
            accountResult.style.display = "none";
            bankOwner.value = "";
        }

        bankAccount.addEventListener("input", resetAccountCheck);
        bankSelect.addEventListener("change", resetAccountCheck);

        document.getElementById("check-account").addEventListener("click", () => {
            if (!bankSelect.value) {
                message.textContent = "Vui lòng chọn ngân hàng!";
                return;
            }

            if (!bankAccount.value.trim()) {
                message.textContent = "Vui lòng nhập số tài khoản!";
                return;
            }

            const name = localStorage.getItem("hoTen");
            if (!name) {
                message.textContent = "Không tìm thấy tên tài khoản!";
                return;
            }

            bankOwner.value = name;
            accountResult.style.display = "block";
            accountChecked = true;
            message.textContent = "";
        });

        document.querySelectorAll('input[name="payment"]').forEach((option) => {
            option.addEventListener("change", () => {
                bankInfo.style.display = option.value === "BANK" && option.checked ? "block" : "none";
                message.textContent = "";
            });
        });

        checkoutForm.addEventListener("submit", (event) => {
            event.preventDefault();
            const payment = document.querySelector('input[name="payment"]:checked');
            if (!payment) {
                message.textContent = "Vui lòng chọn phương thức thanh toán.";
                return;
            }

            if (payment.value === "BANK") {
                if (!bankSelect.value || !bankAccount.value.trim()) {
                    message.textContent = "Vui lòng chọn ngân hàng và nhập số tài khoản!";
                    return;
                }

                if (!accountChecked) {
                    message.textContent = "Vui lòng nhấn Kiểm tra số tài khoản trước!";
                    return;
                }
            }

            const customerName = document.getElementById("customer-name").value.trim();
            const customerPhone = document.getElementById("customer-phone").value.trim();
            const customerEmail = document.getElementById("customer-email").value.trim();
            if (!customerName || !customerPhone || !customerEmail) {
                message.textContent = "Không tìm thấy thông tin tài khoản!";
                return;
            }

            try {
                const order = window.Shop.createOrderFromCart({
                    name: customerName,
                    phone: customerPhone,
                    email: customerEmail,
                    address: document.getElementById("customer-address").value.trim(),
                    payment: payment.value,
                    bank: payment.value === "BANK" ? bankSelect.value : "",
                    accountNumber: payment.value === "BANK" ? bankAccount.value.trim() : "",
                    accountOwner: payment.value === "BANK" ? bankOwner.value : ""
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
