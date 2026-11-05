(function () {
    "use strict";

    function initCheckout() {
        const productList = document.getElementById("product-list");
        const totalPrice = document.getElementById("total-price");
        const checkoutForm = document.getElementById("checkout-form");
        const bankInfo = document.getElementById("bank-info");
        const successMessage = document.getElementById("success-message");
        const orderInfo = document.getElementById("order-info");
        const emailStatus = document.getElementById("email-status");
        const retryEmailButton = document.getElementById("retry-email");
        const isAuthenticated = sessionStorage.getItem("mm_user_authenticated") === "true";
        if (!isAuthenticated) {
            window.location.replace("login.html?return=checkout.html");
            return;
        }

        const bankSelect = document.getElementById("bank-select");
        const bankAccount = document.getElementById("bank-account");
        const bankOwner = document.getElementById("bank-owner");
        const accountResult = document.getElementById("account-result");
        const message = document.createElement("p");
        let accountChecked = false;
        let createdOrder = null;

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

        function sendOrderConfirmation(order) {
            const config = window.EmailJSConfig;
            if (!window.emailjs || !config || !config.serviceId || !config.templateId || !config.publicKey) {
                throw new Error("EmailJS chưa được tải hoặc chưa được cấu hình.");
            }

            const paymentMethod = order.payment === "BANK"
                ? "Chuyển khoản ngân hàng"
                : "Thanh toán khi nhận hàng";
            const orderItems = order.items.map((item) =>
                `${item.name} x ${item.qty} - ${window.Shop.formatPrice(item.price * item.qty)}`
            ).join("\n");

            return window.emailjs.send(config.serviceId, config.templateId, {
                to_email: order.customer.email,
                customer_name: order.customer.name,
                order_id: order.id,
                order_date: new Date(order.createdAt).toLocaleString("vi-VN"),
                customer_phone: order.customer.phone,
                shipping_address: order.customer.address,
                payment_method: paymentMethod,
                order_items: orderItems,
                total: window.Shop.formatPrice(order.total)
            }, {
                publicKey: config.publicKey
            });
        }

        function getEmailErrorDetails(error) {
            if (!error) return "";

            const status = error.status ? `HTTP ${error.status}` : "";
            const detail = typeof error.text === "string"
                ? error.text
                : (typeof error.message === "string" ? error.message : "");
            return [status, detail].filter(Boolean).join(": ");
        }

        async function deliverOrderConfirmation(order) {
            retryEmailButton.disabled = true;
            retryEmailButton.hidden = true;
            emailStatus.textContent = "Đang gửi email xác nhận...";

            try {
                await sendOrderConfirmation(order);
                emailStatus.textContent = `EmailJS đã chấp nhận yêu cầu gửi tới ${order.customer.email}.`;
            } catch (error) {
                console.error("Không thể gửi email xác nhận đơn hàng.", error);
                const errorDetails = getEmailErrorDetails(error);
                emailStatus.textContent = errorDetails
                    ? `Đơn hàng đã được tạo nhưng email chưa gửi được (${errorDetails}). Kiểm tra cấu hình EmailJS rồi thử lại.`
                    : "Đơn hàng đã được tạo nhưng email chưa gửi được. Kiểm tra kết nối và cấu hình EmailJS rồi thử lại.";
                retryEmailButton.hidden = false;
            } finally {
                retryEmailButton.disabled = false;
            }
        }

        bankAccount.addEventListener("input", resetAccountCheck);
        bankSelect.addEventListener("change", resetAccountCheck);
        retryEmailButton.addEventListener("click", async () => {
            if (!createdOrder) {
                return;
            }
            await deliverOrderConfirmation(createdOrder);
        });

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

        checkoutForm.addEventListener("submit", async (event) => {
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
                message.textContent = "Vui lòng nhập họ tên, số điện thoại và email.";
                return;
            }

            try {
                createdOrder = window.Shop.createOrderFromCart({
                    name: customerName,
                    phone: customerPhone,
                    email: customerEmail,
                    address: document.getElementById("customer-address").value.trim(),
                    payment: payment.value,
                    bank: payment.value === "BANK" ? bankSelect.value : "",
                    accountNumber: payment.value === "BANK" ? bankAccount.value.trim() : "",
                    accountOwner: payment.value === "BANK" ? bankOwner.value : ""
                });
            } catch (error) {
                console.error("Không thể tạo đơn hàng.", error);
                message.textContent = error.message === "Giỏ hàng đang trống."
                    ? error.message
                    : "Không thể lưu đơn hàng trên trình duyệt này. Giỏ hàng của bạn vẫn được giữ lại.";
                return;
            }

            checkoutForm.hidden = true;
            orderInfo.hidden = true;
            document.getElementById("order-code").textContent = `Mã đơn hàng: ${createdOrder.id}`;
            successMessage.querySelector('a[href="orders.html"]').href =
                `orders.html?created=${encodeURIComponent(createdOrder.id)}`;
            successMessage.style.display = "block";

            await deliverOrderConfirmation(createdOrder);
        });
    }

    document.addEventListener("DOMContentLoaded", initCheckout);
})();
