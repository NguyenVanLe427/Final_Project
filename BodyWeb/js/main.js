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
    const USER_SESSION_KEY = "mm_user_authenticated";
    const USERS_KEY = "mm_users";

    function readUsers() {
        const storedUsers = localStorage.getItem(USERS_KEY);
        if (storedUsers !== null) {
            const users = JSON.parse(storedUsers);
            if (!Array.isArray(users)) {
                throw new Error("Dữ liệu tài khoản không đúng định dạng.");
            }
            return users;
        }

        const legacyEmail = (localStorage.getItem("email") || "").trim().toLowerCase();
        const legacyPassword = localStorage.getItem("matKhau");
        if (!legacyEmail || legacyPassword === null) return [];

        return [{
            name: localStorage.getItem("hoTen") || "",
            email: legacyEmail,
            password: legacyPassword
        }];
    }

    function saveUsers(users) {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }

    function loginDestination() {
        const returnTo = new URLSearchParams(window.location.search).get("return");
        return returnTo === "checkout.html"
            ? `${rootPrefix()}pages/checkout.html`
            : `${rootPrefix()}index.html`;
    }

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
        if (sessionStorage.getItem(USER_SESSION_KEY) !== "true") {
            throw new Error("Vui lòng đăng nhập trước khi đặt hàng.");
        }

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

    function initUserSession() {
        const loginLink = document.querySelector("[data-user-login]");
        const logoutButton = document.querySelector("[data-user-logout]");
        if (!loginLink || !logoutButton) return;

        const isAuthenticated = sessionStorage.getItem(USER_SESSION_KEY) === "true";
        loginLink.hidden = isAuthenticated;
        logoutButton.hidden = !isAuthenticated;
        logoutButton.addEventListener("click", () => {
            sessionStorage.removeItem(USER_SESSION_KEY);
            window.location.href = `${rootPrefix()}index.html`;
        });
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

    function clearLoginFields() {
        const email = document.getElementById("login-email");
        const password = document.getElementById("login-password");
        if (email) email.value = "";
        if (password) password.value = "";
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
<<<<<<< HEAD
                const users = readUsers();
                if (users.some((user) => user.email === email)) {
                    message.textContent = "Email này đã được đăng ký.";
                    return;
                }
                users.push({ name, email, password });
                saveUsers(users);
                document.getElementById("login-email").value = email;
=======
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

>>>>>>> 07693e6deea967c0069cb7573016eefc40b41704
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

                    sessionStorage.removeItem(USER_SESSION_KEY);
                    sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
                    window.location.href = `${rootPrefix()}pages/admin.html`;
                    return;
                }

<<<<<<< HEAD
                const user = readUsers().find((account) => account.email === email && account.password === password);
                if (user) {
=======
                // Kiểm tra tài khoản khách hàng
                if (
                    username === (localStorage.getItem("tenDangNhap") || "").toLowerCase() &&
                    password === localStorage.getItem("matKhau")
                ) {
>>>>>>> 07693e6deea967c0069cb7573016eefc40b41704
                    sessionStorage.removeItem(ADMIN_SESSION_KEY);
                    sessionStorage.setItem(USER_SESSION_KEY, "true");
                    window.location.href = loginDestination();
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
        initUserSession();
        clearLoginFields();
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

    window.addEventListener("pageshow", clearLoginFields);

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
