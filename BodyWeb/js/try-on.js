(function () {
    "use strict";

    const slots = ["Áo", "Giày", "Phụ kiện"];
    const state = { gender: "male", skin: "#f1c9a5", slot: slots[0], outfit: {} };

    function notify(text) {
        const element = document.querySelector("[data-tryon-message]");
        element.textContent = text;
        element.classList.add("is-visible");
        window.clearTimeout(notify.timer);
        notify.timer = window.setTimeout(() => element.classList.remove("is-visible"), 2200);
    }

    function render() {
        const stage = document.querySelector("[data-tryon-stage]");
        stage.dataset.gender = state.gender;
        stage.style.setProperty("--skin", state.skin);
        document.querySelectorAll("[data-gender]").forEach((button) => {
            button.classList.toggle("is-active", button.dataset.gender === state.gender);
        });
        document.querySelectorAll("[data-skin]").forEach((button) => {
            button.classList.toggle("is-active", button.dataset.skin === state.skin);
        });

        document.querySelector("[data-tryon-tabs]").innerHTML = slots.map((slot) => `
            <button class="tryon-tab${state.slot === slot ? " is-active" : ""}" type="button" data-slot="${slot}">${slot}</button>
        `).join("");

        const products = window.ProductCatalog.products.filter((product) => product.slot === state.slot);
        document.querySelector("[data-tryon-products]").innerHTML = products.length
            ? products.map((product) => {
                const selected = state.outfit[product.slot] === product.id;
                return `
                    <article class="product-card">
                        <div class="product-card-image"><img src="../images/products/${product.image}" alt="${product.name}"></div>
                        <div class="product-card-copy">
                            <h3>${product.name}</h3>
                            <p class="product-price">${window.Shop.formatPrice(product.price)}</p>
                            <button class="button ${selected ? "button-secondary" : "button-primary"} button-full" type="button" data-try-product="${product.id}">${selected ? "Bỏ chọn" : "Chọn thử"}</button>
                        </div>
                    </article>`;
            }).join("")
            : '<p class="empty-state">Chưa có sản phẩm trong danh mục này.</p>';

        const chosen = slots.map((slot) => state.outfit[slot]).filter(Boolean)
            .map((id) => window.ProductCatalog.products.find((product) => product.id === id)).filter(Boolean);
        document.querySelector("[data-outfit-list]").innerHTML = chosen.length
            ? chosen.map((product) => `<li><span>${product.name}</span><strong>${window.Shop.formatPrice(product.price)}</strong></li>`).join("")
            : '<li class="sum-none">Chưa chọn sản phẩm nào</li>';
        document.querySelector("[data-outfit-total]").textContent = window.Shop.formatPrice(
            chosen.reduce((sum, product) => sum + product.price, 0)
        );
    }

    function init() {
        const container = document.querySelector("[data-tryon]");
        if (!container) return;

        container.addEventListener("click", (event) => {
            const gender = event.target.closest("[data-gender]");
            if (gender) {
                state.gender = gender.dataset.gender;
                render();
                return;
            }
            const skin = event.target.closest("[data-skin]");
            if (skin) {
                state.skin = skin.dataset.skin;
                render();
                return;
            }
            const tab = event.target.closest("[data-slot]");
            if (tab) {
                state.slot = tab.dataset.slot;
                render();
                return;
            }
            const productButton = event.target.closest("[data-try-product]");
            if (productButton) {
                const product = window.ProductCatalog.products.find((item) => item.id === productButton.dataset.tryProduct);
                if (state.outfit[product.slot] === product.id) delete state.outfit[product.slot];
                else state.outfit[product.slot] = product.id;
                render();
                notify("Đã cập nhật bộ đồ lựa chọn.");
                return;
            }
            if (event.target.closest("[data-outfit-clear]")) {
                state.outfit = {};
                render();
                notify("Đã xóa lựa chọn.");
                return;
            }
            if (event.target.closest("[data-outfit-add]")) {
                const chosen = Object.values(state.outfit)
                    .map((id) => window.ProductCatalog.products.find((product) => product.id === id)).filter(Boolean);
                if (!chosen.length) {
                    notify("Bạn chưa chọn sản phẩm nào.");
                    return;
                }
                try {
                    chosen.forEach((product) => window.Shop.addToCart({ ...product, image: `../images/products/${product.image}` }, 1));
                    notify(`Đã thêm ${chosen.length} sản phẩm vào giỏ hàng.`);
                } catch (error) {
                    console.error("Không thể thêm bộ đồ vào giỏ hàng.", error);
                    notify("Không thể cập nhật giỏ hàng trên trình duyệt này.");
                }
            }
        });
        render();
    }

    document.addEventListener("DOMContentLoaded", init);
})();
