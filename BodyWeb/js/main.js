(function () {
    "use strict";

    const CART_KEY = "cart";

    function readCart() {
        const stored = localStorage.getItem(CART_KEY);
        if (!stored) return [];

        const parsed = JSON.parse(stored);
        if (!Array.isArray(parsed)) {
            throw new Error("Dữ liệu giỏ hàng không đúng định dạng.");
        }

        return parsed.map((item) => ({
            ...item,
            id: String(item.id),
            qty: Number(item.qty ?? item.quantity ?? 1)
        })).filter((item) => item.id && Number.isInteger(item.qty) && item.qty > 0);
    }

    function writeCart(items) {
        localStorage.setItem(CART_KEY, JSON.stringify(items));
        updateCartCount();
    }

    function addToCart(product, quantity) {
        const cart = readCart();
        const existing = cart.find((item) => item.id === String(product.id));
        if (existing) {
            existing.qty += quantity;
        } else {
            cart.push({
                id: String(product.id),
                name: product.name,
                image: product.image,
                price: Number(product.price),
                qty: quantity
            });
        }
        writeCart(cart);
    }

    function formatPrice(value) {
        return `${Number(value).toLocaleString("vi-VN")} ₫`;
    }

    function updateCartCount() {
        let count = 0;
        try {
            count = readCart().reduce((total, item) => total + item.qty, 0);
        } catch (error) {
            console.error("Không thể đọc giỏ hàng.", error);
            document.querySelectorAll("[data-cart-count]").forEach((badge) => {
                badge.textContent = "!";
                badge.setAttribute("aria-label", "Không đọc được giỏ hàng");
            });
            return;
        }
        document.querySelectorAll("[data-cart-count]").forEach((badge) => {
            badge.textContent = String(count);
        });
    }

    function rootPrefix() {
        return document.body.dataset.rootPrefix || "";
    }

    function showAuthTab(tabName) {
        document.querySelectorAll("[data-auth-form]").forEach((form) => {
            form.hidden = form.dataset.authForm !== tabName;
        });
        document.querySelectorAll("[data-auth-tab]").forEach((button) => {
            button.classList.toggle("is-active", button.dataset.authTab === tabName);
        });
        const message = document.querySelector("[data-auth-message]");
        if (message) message.textContent = "";
    }

    function initAuth() {
        const tabs = document.querySelectorAll("[data-auth-tab]");
        if (!tabs.length) return;

        tabs.forEach((button) => button.addEventListener("click", () => showAuthTab(button.dataset.authTab)));
        const registerForm = document.querySelector('[data-auth-form="register"]');
        const loginForm = document.querySelector('[data-auth-form="login"]');
        const message = document.querySelector("[data-auth-message]");

        registerForm.addEventListener("submit", (event) => {
            event.preventDefault();
            const name = document.getElementById("register-name").value.trim();
            const email = document.getElementById("register-email").value.trim();
            const password = document.getElementById("register-password").value;
            const confirmation = document.getElementById("confirm-password").value;
            if (password.length < 6 || password !== confirmation) {
                message.textContent = password.length < 6
                    ? "Mật khẩu cần có ít nhất 6 ký tự."
                    : "Mật khẩu xác nhận không khớp.";
                return;
            }

            try {
                if (localStorage.getItem("email") === email) {
                    message.textContent = "Email này đã được đăng ký.";
                    return;
                }
                localStorage.setItem("hoTen", name);
                localStorage.setItem("email", email);
                localStorage.setItem("matKhau", password);
                document.getElementById("login-email").value = email;
                registerForm.reset();
                showAuthTab("login");
                message.textContent = "Đăng ký thành công. Hãy đăng nhập.";
            } catch (error) {
                console.error("Không thể lưu tài khoản trên trình duyệt.", error);
                message.textContent = "Không thể lưu tài khoản trên trình duyệt này.";
            }
        });

        loginForm.addEventListener("submit", (event) => {
            event.preventDefault();
            try {
                const email = document.getElementById("login-email").value.trim();
                const password = document.getElementById("login-password").value;
                if (email === localStorage.getItem("email") && password === localStorage.getItem("matKhau")) {
                    window.location.href = `${rootPrefix()}index.html`;
                    return;
                }
                message.textContent = "Email hoặc mật khẩu không chính xác.";
            } catch (error) {
                console.error("Không thể xác thực tài khoản trên trình duyệt.", error);
                message.textContent = "Không thể truy cập thông tin tài khoản.";
            }
        });
    }

    document.addEventListener("DOMContentLoaded", () => {
        updateCartCount();
        initAuth();
        document.querySelectorAll("[data-search-form]").forEach((form) => {
            form.addEventListener("submit", (event) => {
                event.preventDefault();
                const query = form.querySelector("[data-search-input]").value.trim();
                const destination = `${rootPrefix()}pages/products.html`;
                window.location.href = query ? `${destination}?q=${encodeURIComponent(query)}` : destination;
            });
        });
    });

    window.Shop = { readCart, writeCart, addToCart, formatPrice };
})();
