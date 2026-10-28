(function () {
    "use strict";

    const categories = [
        { name: "Thời trang nam", image: "category-men-clothes.png" },
        { name: "Đồng hồ", image: "category-watches.png" },
        { name: "Giày nam", image: "category-men-shoes.png" },
        { name: "Thời trang nữ", image: "category-women-clothes.png" },
        { name: "Làm đẹp", image: "category-beauty.png" },
        { name: "Giày nữ", image: "category-women-shoes.png" },
        { name: "Túi xách", image: "category-bags.png" },
        { name: "Phụ kiện", image: "category-accessories.png" }
    ];

    const products = [
        { id: "1", name: "Áo thời trang nam", category: "Thời trang nam", image: "product-01.png", price: 399000, slot: "Áo" },
        { id: "2", name: "Đồng hồ thanh lịch", category: "Đồng hồ", image: "product-02.png", price: 890000, slot: "Phụ kiện" },
        { id: "3", name: "Giày thể thao nam", category: "Giày nam", image: "product-03.png", price: 650000, slot: "Giày" },
        { id: "4", name: "Trang phục nữ hiện đại", category: "Thời trang nữ", image: "product-04.png", price: 459000, slot: "Áo" },
        { id: "5", name: "Sản phẩm chăm sóc sắc đẹp", category: "Làm đẹp", image: "product-05.png", price: 299000, slot: "Phụ kiện" },
        { id: "6", name: "Giày nữ phong cách", category: "Giày nữ", image: "product-06.png", price: 579000, slot: "Giày" },
        { id: "7", name: "Túi xách thời trang", category: "Túi xách", image: "product-07.png", price: 720000, slot: "Phụ kiện" },
        { id: "8", name: "Phụ kiện thời trang", category: "Phụ kiện", image: "product-08.png", price: 199000, slot: "Phụ kiện" }
    ];

    function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, (character) => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
        })[character]);
    }

    function assetPath(filename) {
        return `${document.body.dataset.rootPrefix || ""}images/products/${filename}`;
    }

    function productUrl(id) {
        return `${document.body.dataset.rootPrefix || ""}pages/product-detail.html?id=${encodeURIComponent(id)}`;
    }

    function card(product) {
        const name = escapeHtml(product.name);
        const url = productUrl(product.id);
        return `
            <article class="product-card">
                <a href="${url}" aria-label="Xem ${name}">
                    <div class="product-card-image"><img src="${assetPath(product.image)}" alt="${name}" loading="lazy"></div>
                    <div class="product-card-copy">
                        <h3>${name}</h3>
                        <p class="product-price">${window.Shop.formatPrice(product.price)}</p>
                    </div>
                </a>
                <div class="product-card-copy">
                    <a class="button button-primary" href="${url}">Xem chi tiết</a>
                </div>
            </article>`;
    }

    function renderCategories() {
        const container = document.querySelector("[data-category-list]");
        if (!container) return;
        container.innerHTML = categories.map((category) => `
            <a class="category-card" href="${document.body.dataset.rootPrefix || ""}pages/products.html?category=${encodeURIComponent(category.name)}">
                <img src="${assetPath(category.image)}" alt="" loading="lazy">
                <span>${escapeHtml(category.name)}</span>
            </a>`).join("");
    }

    function renderListing() {
        const list = document.getElementById("product-list");
        const featured = document.getElementById("featured-products");
        if (featured) featured.innerHTML = products.slice(0, 4).map(card).join("");
        if (!list) return;

        const params = new URLSearchParams(window.location.search);
        const query = (params.get("q") || "").trim().toLocaleLowerCase("vi");
        const requestedCategory = params.get("category") || "";
        const filter = document.querySelector("[data-category-filter]");
        categories.forEach((category) => {
            const option = document.createElement("option");
            option.value = category.name;
            option.textContent = category.name;
            filter.append(option);
        });
        if (categories.some((category) => category.name === requestedCategory)) filter.value = requestedCategory;
        else if (requestedCategory) filter.value = "";

        const render = () => {
            const search = (filter.form?.elements.q?.value || query).trim().toLocaleLowerCase("vi");
            const selectedCategory = filter.value;
            const visible = products.filter((product) => {
                const matchesQuery = !search || `${product.name} ${product.category}`.toLocaleLowerCase("vi").includes(search);
                return matchesQuery && (!selectedCategory || product.category === selectedCategory);
            });
            list.innerHTML = visible.map(card).join("");
            document.querySelector("[data-product-summary]").textContent = `${visible.length} sản phẩm`;
            document.querySelector("[data-products-empty]").hidden = visible.length > 0;
        };
        filter.addEventListener("change", render);
        render();
    }

    function renderDetail() {
        const detail = document.querySelector("[data-product-detail]");
        if (!detail) return;

        const id = new URLSearchParams(window.location.search).get("id");
        const product = products.find((item) => item.id === id);
        const message = document.querySelector("[data-detail-message]");
        if (!product) {
            detail.innerHTML = '<div class="empty-state"><h1>Không tìm thấy sản phẩm</h1><a class="text-link" href="products.html">Quay lại danh sách sản phẩm</a></div>';
            return;
        }

        const image = detail.querySelector("[data-detail-image]");
        image.src = assetPath(product.image);
        image.alt = product.name;
        detail.querySelector("[data-detail-name]").textContent = product.name;
        detail.querySelector("[data-detail-price]").textContent = window.Shop.formatPrice(product.price);
        detail.querySelector("[data-detail-description]").textContent =
            `${product.category} thuộc bộ sưu tập M&M, thiết kế hiện đại và dễ kết hợp trong phong cách hằng ngày.`;
        detail.querySelector("[data-add-product]").addEventListener("click", () => {
            const input = detail.querySelector("[data-quantity]");
            const quantity = Number(input.value);
            if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
                message.textContent = "Số lượng phải từ 1 đến 99.";
                return;
            }
            try {
                window.Shop.addToCart({ ...product, image: assetPath(product.image) }, quantity);
                message.textContent = "Đã thêm sản phẩm vào giỏ hàng.";
            } catch (error) {
                console.error("Không thể thêm sản phẩm vào giỏ hàng.", error);
                message.textContent = "Không thể cập nhật giỏ hàng trên trình duyệt này.";
            }
        });
        detail.querySelectorAll("[data-quantity-step]").forEach((button) => {
            button.addEventListener("click", () => {
                const current = Number(detail.querySelector("[data-quantity]").value) || 1;
                detail.querySelector("[data-quantity]").value = String(Math.max(1, Math.min(99, current + Number(button.dataset.quantityStep))));
            });
        });
        const related = products.filter((item) => item.id !== product.id && item.category === product.category);
        document.getElementById("related-products").innerHTML = related.length ? related.map(card).join("") : products.filter((item) => item.id !== product.id).slice(0, 4).map(card).join("");
    }

    document.addEventListener("DOMContentLoaded", () => {
        renderCategories();
        renderListing();
        renderDetail();
    });
    window.ProductCatalog = { products, categories };
})();
