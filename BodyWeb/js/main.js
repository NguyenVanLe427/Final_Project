(function() {
    "use strict";

    const CART_KEY = "cart";
    const ORDERS_KEY = "orders";
    const ORDER_STATUSES = [
        "Chờ xác nhận",
        "Vận chuyển",
        "Chờ giao hàng",
        "Hoàn thành",
        "Trả hàng",
        "Đã hủy"
    ];
    const ADMIN_EMAIL = "admin12@gmail.com";
    const ADMIN_PASSWORD = "admin";
    const ADMIN_SESSION_KEY = "mm_admin_authenticated";

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

    function readOrders() {
        const stored = localStorage.getItem(ORDERS_KEY);
        if (!stored) return [];

        const parsed = JSON.parse(stored);
        if (!Array.isArray(parsed)) {
            throw new Error("Dữ liệu đơn hàng không đúng định dạng.");
        }
        return parsed;
    }

    function writeOrders(orders) {
        localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    }

    function createOrderFromCart(details = {}) {
        const cart = readCart();
        if (!cart.length) {
            throw new Error("Giỏ hàng đang trống.");
        }

        const order = {
            id: `MM-${Date.now()}`,
            createdAt: new Date().toISOString(),
            status: ORDER_STATUSES[0],
            items: cart.map((item) => ({ ...item })),
            total: cart.reduce((sum, item) => sum + item.price * item.qty, 0),
            customer: {
                name: details.name || "",
                phone: details.phone || "",
                email: details.email || "",
                address: details.address || ""
            },
            payment: details.payment || "COD",
            bank: details.bank || "",
            accountNumber: details.accountNumber || "",
            accountOwner: details.accountOwner || ""
        };
        const orders = readOrders();
        orders.unshift(order);
        writeOrders(orders);
        writeCart([]);
        return order;
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

        tabs.forEach((button) => {
            button.addEventListener("click", () => showAuthTab(button.dataset.authTab));
        });

        const registerForm = document.querySelector('[data-auth-form="register"]');
        const loginForm = document.querySelector('[data-auth-form="login"]');
        const message = document.querySelector("[data-auth-message]");

        // PHẦN THÊM: HIỂN THỊ HOẶC ẨN MẬT KHẨU
        document.querySelectorAll(".toggle-password").forEach((button) => {
            button.addEventListener("click", () => {
                const input = document.getElementById(button.dataset.target);

                if (input.type === "password") {
                    input.type = "text";
                    button.textContent = "🙈";
                    button.setAttribute("aria-label", "Ẩn mật khẩu");
                } else {
                    input.type = "password";
                    button.textContent = "👁";
                    button.setAttribute("aria-label", "Hiển thị mật khẩu");
                }
            });
        });

        // ĐĂNG KÝ TÀI KHOẢN
        registerForm.addEventListener("submit", (event) => {
            event.preventDefault();

            const name = document.getElementById("register-name").value.trim();
            const username = document.getElementById("register-username").value.trim().toLowerCase();
            const phone = document.getElementById("register-phone").value.trim();
            const email = document.getElementById("register-email").value.trim().toLowerCase();
            const password = document.getElementById("register-password").value;
            const confirmation = document.getElementById("confirm-password").value;

            if (password.length < 6 || password !== confirmation) {
                message.textContent = password.length < 6 ?
                    "Mật khẩu cần có ít nhất 6 ký tự." :
                    "Mật khẩu xác nhận không khớp.";
                return;
            }

            if (username === ADMIN_EMAIL) {
                message.textContent = "Tên đăng nhập này không được sử dụng.";
                return;
            }

            if (email === ADMIN_EMAIL) {
                message.textContent = "Email này được dành riêng cho tài khoản quản trị.";
                return;
            }

            try {
                if ((localStorage.getItem("tenDangNhap") || "").toLowerCase() === username) {
                    message.textContent = "Tên đăng nhập này đã được sử dụng.";
                    return;
                }

                if ((localStorage.getItem("email") || "").toLowerCase() === email) {
                    message.textContent = "Email này đã được đăng ký.";
                    return;
                }

                localStorage.setItem("hoTen", name);
                localStorage.setItem("tenDangNhap", username);
                localStorage.setItem("soDienThoai", phone);
                localStorage.setItem("email", email);
                localStorage.setItem("matKhau", password);

                document.getElementById("login-username").value = username;

                registerForm.reset();
                showAuthTab("login");

                message.textContent = "Đăng ký thành công. Hãy đăng nhập.";

            } catch (error) {
                console.error("Không thể lưu tài khoản trên trình duyệt.", error);
                message.textContent = "Không thể lưu tài khoản trên trình duyệt này.";
            }
        });

        // ĐĂNG NHẬP TÀI KHOẢN
        loginForm.addEventListener("submit", (event) => {
            event.preventDefault();

            try {
                const username = document.getElementById("login-username").value.trim().toLowerCase();
                const password = document.getElementById("login-password").value;

                // Đăng nhập Admin
                if (username === ADMIN_EMAIL) {
                    if (password !== ADMIN_PASSWORD) {
                        message.textContent = "Tên đăng nhập hoặc mật khẩu không chính xác.";
                        return;
                    }

                    sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
                    window.location.href = `${rootPrefix()}pages/admin.html`;
                    return;
                }

                // Kiểm tra tài khoản khách hàng
                if (
                    username === (localStorage.getItem("tenDangNhap") || "").toLowerCase() &&
                    password === localStorage.getItem("matKhau")
                ) {
                    sessionStorage.removeItem(ADMIN_SESSION_KEY);
                    window.location.href = `${rootPrefix()}index.html`;
                    return;
                }

                message.textContent = "Tên đăng nhập hoặc mật khẩu không chính xác.";

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

                window.location.href = query ?
                    `${destination}?q=${encodeURIComponent(query)}` :
                    destination;
            });
        });
    });

    window.Shop = {
        readCart,
        writeCart,
        addToCart,
        readOrders,
        writeOrders,
        createOrderFromCart,
        orderStatuses: ORDER_STATUSES,
        formatPrice
    };
})();
