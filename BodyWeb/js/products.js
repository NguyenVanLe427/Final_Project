
(function () {
    "use strict";

    const categories = window.CatalogStore.readCategories();
    const products = window.CatalogStore.readProducts();


    // 3. XỬ LÝ KÝ TỰ ĐẶC BIỆT
    function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, (character) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[character]);
    }


    // 4. TẠO ĐƯỜNG DẪN HÌNH ẢNH
    function assetPath(filename) {
        return `${document.body.dataset.rootPrefix || ""}images/products/${filename}`;
    }


    // 5. TẠO ĐƯỜNG DẪN CHI TIẾT SẢN PHẨM
    function productUrl(id) {
        return `${document.body.dataset.rootPrefix || ""}pages/product-detail.html?id=${encodeURIComponent(id)}`;
    }


    // 6. TẠO THẺ SẢN PHẨM
    function card(product) {
        const name = escapeHtml(product.name);
        const url = productUrl(product.id);

        return `
            <article class="product-card">
                <a href="${url}" aria-label="Xem ${name}">
                    <div class="product-card-image">
                        <img src="${assetPath(product.image)}" alt="${name}" loading="lazy">
                    </div>

                    <div class="product-card-copy">
                        <h3>${name}</h3>
                        <p class="product-price">${window.Shop.formatPrice(product.price)}</p>
                    </div>
                </a>

                <div class="product-card-copy">
                    <a class="button button-primary" href="${url}">
                        Xem chi tiết
                    </a>
                </div>
            </article>
        `;
    }


    // 7. HIỂN THỊ DANH MỤC
    function renderCategories() {
        const container = document.querySelector("[data-category-list]");

        if (!container) return;

        container.innerHTML = categories.map((category) => `
            <a class="category-card" href="${document.body.dataset.rootPrefix || ""}pages/products.html?category=${encodeURIComponent(category.name)}">
                <img src="${assetPath(category.image)}" alt="" loading="lazy">
                <span>${escapeHtml(category.name)}</span>
            </a>
        `).join("");
    }


    // 8. HIỂN THỊ DANH SÁCH SẢN PHẨM
    function renderListing() {

        const list = document.getElementById("product-list");
        const featured = document.getElementById("featured-products");
        const bestSelling = document.getElementById("best-selling-products");


        // HIỂN THỊ 4 SẢN PHẨM NỔI BẬT
        if (featured) {
            featured.innerHTML = products.slice(0, 4).map(card).join("");
        }


        // Hiển thị các sản phẩm còn lại để toàn bộ danh mục có mặt trên trang chủ
        if (bestSelling) {
            bestSelling.innerHTML = products.slice(4).map(card).join("");
        }


        // Nếu không có danh sách sản phẩm thì dừng
        if (!list) return;


        // LẤY THÔNG TIN TÌM KIẾM TỪ URL
        const params = new URLSearchParams(window.location.search);

        const query = (params.get("q") || "")
            .trim()
            .toLocaleLowerCase("vi");

        const requestedCategory = params.get("category") || "";

        const filter = document.querySelector("[data-category-filter]");


        // THÊM DANH MỤC VÀO Ô LỰA CHỌN
        categories.forEach((category) => {
            const option = document.createElement("option");

            option.value = category.name;
            option.textContent = category.name;

            filter.append(option);
        });


        if (categories.some((category) => category.name === requestedCategory)) {
            filter.value = requestedCategory;
        } else if (requestedCategory) {
            filter.value = "";
        }


        // HÀM TÌM KIẾM VÀ LỌC SẢN PHẨM
        const render = () => {

            const search = (filter.form?.elements.q?.value || query)
                .trim()
                .toLocaleLowerCase("vi");

            const selectedCategory = filter.value;


            const visible = products.filter((product) => {

                const matchesQuery = !search ||
                    `${product.name} ${product.category}`
                        .toLocaleLowerCase("vi")
                        .includes(search);

                return matchesQuery &&
                    (!selectedCategory || product.category === selectedCategory);
            });


            // HIỂN THỊ SẢN PHẨM
            list.innerHTML = visible.map(card).join("");


            // HIỂN THỊ SỐ LƯỢNG SẢN PHẨM
            document.querySelector("[data-product-summary]").textContent =
                `${visible.length} sản phẩm`;


            // HIỂN THỊ THÔNG BÁO KHI KHÔNG CÓ SẢN PHẨM
            document.querySelector("[data-products-empty]").hidden =
                visible.length > 0;
        };


        filter.addEventListener("change", render);

        render();
    }


    // 9. HIỂN THỊ CHI TIẾT SẢN PHẨM
    function renderDetail() {

        const detail = document.querySelector("[data-product-detail]");

        if (!detail) return;


        // LẤY ID SẢN PHẨM TỪ URL
        const id = new URLSearchParams(window.location.search).get("id");


        // TÌM SẢN PHẨM THEO ID
        const product = products.find((item) => item.id === id);

        const message = document.querySelector("[data-detail-message]");


        // KIỂM TRA SẢN PHẨM
        if (!product) {

            detail.innerHTML = `
                <div class="empty-state">
                    <h1>Không tìm thấy sản phẩm</h1>
                    <a class="text-link" href="products.html">
                        Quay lại danh sách sản phẩm
                    </a>
                </div>
            `;

            return;
        }


        // HIỂN THỊ HÌNH ẢNH
        const image = detail.querySelector("[data-detail-image]");

        image.src = assetPath(product.image);
        image.alt = product.name;


        // HIỂN THỊ TÊN VÀ GIÁ
        detail.querySelector("[data-detail-name]").textContent = product.name;

        detail.querySelector("[data-detail-price]").textContent =
            window.Shop.formatPrice(product.price);


        // HIỂN THỊ MÔ TẢ
        detail.querySelector("[data-detail-description]").textContent =
            `${product.category} thuộc bộ sưu tập M&M, thiết kế hiện đại và dễ kết hợp trong phong cách hằng ngày.`;


        // XỬ LÝ NÚT THÊM VÀO GIỎ HÀNG
        detail.querySelector("[data-add-product]").addEventListener("click", () => {

            const input = detail.querySelector("[data-quantity]");

            const quantity = Number(input.value);


            // KIỂM TRA SỐ LƯỢNG
            if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {

                message.textContent = "Số lượng phải từ 1 đến 99.";

                return;
            }


            // THÊM SẢN PHẨM VÀO GIỎ HÀNG
            try {

                window.Shop.addToCart(
                    { ...product, image: assetPath(product.image) },
                    quantity
                );

                message.textContent = "Đã thêm sản phẩm vào giỏ hàng.";

            } catch (error) {

                console.error("Không thể thêm sản phẩm vào giỏ hàng.", error);

                message.textContent =
                    "Không thể cập nhật giỏ hàng trên trình duyệt này.";
            }
        });


        // XỬ LÝ NÚT TĂNG VÀ GIẢM SỐ LƯỢNG
        detail.querySelectorAll("[data-quantity-step]").forEach((button) => {

            button.addEventListener("click", () => {

                const input = detail.querySelector("[data-quantity]");

                const current = Number(input.value) || 1;

                const step = Number(button.dataset.quantityStep);

                const quantity = Math.max(1, Math.min(99, current + step));

                input.value = String(quantity);
            });
        });


        // HIỂN THỊ SẢN PHẨM LIÊN QUAN
        const related = products.filter((item) =>
            item.id !== product.id &&
            item.category === product.category
        );


        // Nếu không có sản phẩm cùng danh mục thì hiển thị 4 sản phẩm khác
        const relatedProducts = related.length
            ? related
            : products.filter((item) => item.id !== product.id).slice(0, 4);


        document.getElementById("related-products").innerHTML =
            relatedProducts.map(card).join("");
    }


    // 10. CHẠY CÁC HÀM SAU KHI HTML ĐƯỢC TẢI XONG
    document.addEventListener("DOMContentLoaded", () => {

        renderCategories();

        renderListing();

        renderDetail();

    });

    window.addEventListener("storage", (event) => {
        const catalogKeys = [
            window.CatalogStore.PRODUCT_KEY,
            window.CatalogStore.CATEGORY_KEY
        ];

        if (event.key === null || catalogKeys.includes(event.key)) {
            window.location.reload();
        }
    });


    // 11. CHO PHÉP FILE JAVASCRIPT KHÁC SỬ DỤNG DỮ LIỆU
    window.ProductCatalog = {
        products,
        categories
    };

})();
