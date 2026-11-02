
(function () {
    "use strict";

    if (sessionStorage.getItem("mm_admin_authenticated") !== "true") {
        window.location.replace("login.html");
        return;
    }

    document.getElementById("admin-logout").addEventListener("click", function () {
        sessionStorage.removeItem("mm_admin_authenticated");
        window.location.replace("login.html");
    });

    // Khóa lưu dữ liệu trong LocalStorage
    const PRODUCT_KEY = "mm_products";
    const CATEGORY_KEY = "mm_categories";

    // Danh mục hiện có
    const defaultCategories = [
        { name: "Thời trang nam", image: "category-men-clothes.png" },
        { name: "Đồng hồ", image: "category-watches.png" },
        { name: "Giày nam", image: "category-men-shoes.png" },
        { name: "Thời trang nữ", image: "category-women-clothes.png" },
        { name: "Làm đẹp", image: "category-beauty.png" },
        { name: "Giày nữ", image: "category-women-shoes.png" },
        { name: "Túi xách", image: "category-bags.png" },
        { name: "Phụ kiện", image: "category-accessories.png" }
    ];

    // Sản phẩm ban đầu
    const defaultProducts = [
        { id: "1", name: "Áo thời trang nam", category: "Thời trang nam", image: "product-01.png", price: 399000, slot: "Áo" },
        { id: "2", name: "Đồng hồ thanh lịch", category: "Đồng hồ", image: "product-02.png", price: 890000, slot: "Phụ kiện" },
        { id: "3", name: "Giày thể thao nam", category: "Giày nam", image: "product-03.png", price: 650000, slot: "Giày" },
        { id: "4", name: "Trang phục nữ hiện đại", category: "Thời trang nữ", image: "product-04.png", price: 459000, slot: "Áo" },
        { id: "5", name: "Sản phẩm chăm sóc sắc đẹp", category: "Làm đẹp", image: "product-05.png", price: 299000, slot: "Phụ kiện" },
        { id: "6", name: "Giày nữ phong cách", category: "Giày nữ", image: "product-06.png", price: 579000, slot: "Giày" },
        { id: "7", name: "Túi xách thời trang", category: "Túi xách", image: "product-07.png", price: 720000, slot: "Phụ kiện" },
        { id: "8", name: "Phụ kiện thời trang", category: "Phụ kiện", image: "product-08.png", price: 199000, slot: "Phụ kiện" }
    ];

    // Đọc dữ liệu từ LocalStorage
    function readData(key, defaultData) {
        const saved = localStorage.getItem(key);

        if (!saved) {
            return defaultData.map(item => ({ ...item }));
        }

        try {
            const data = JSON.parse(saved);
            return Array.isArray(data) ? data : defaultData.map(item => ({ ...item }));
        } catch (error) {
            return defaultData.map(item => ({ ...item }));
        }
    }

    let products = readData(PRODUCT_KEY, defaultProducts);
    let categories = readData(CATEGORY_KEY, defaultCategories);

    // Khởi tạo dữ liệu khi mở Admin lần đầu
    if (!localStorage.getItem(PRODUCT_KEY)) {
        localStorage.setItem(PRODUCT_KEY, JSON.stringify(products));
    }

    if (!localStorage.getItem(CATEGORY_KEY)) {
        localStorage.setItem(CATEGORY_KEY, JSON.stringify(categories));
    }

    // Lấy phần tử HTML
    const productList = document.getElementById("product-list");
    const productModal = document.getElementById("product-modal");
    const productForm = document.getElementById("product-form");

    // Định dạng tiền Việt Nam
    function formatPrice(price) {
        return Number(price).toLocaleString("vi-VN") + " ₫";
    }

    // Lưu sản phẩm
    function saveProducts() {
        localStorage.setItem(PRODUCT_KEY, JSON.stringify(products));
    }

    // Lưu danh mục
    function saveCategories() {
        localStorage.setItem(CATEGORY_KEY, JSON.stringify(categories));
    }

    // Hiển thị danh mục trong bộ lọc và form
    function renderCategories() {
        const filter = document.getElementById("filter-category");
        const select = document.getElementById("product-category");

        filter.innerHTML = '<option value="">Tất cả danh mục</option>';
        select.innerHTML = "";

        categories.forEach(category => {
            const optionFilter = document.createElement("option");
            optionFilter.value = category.name;
            optionFilter.textContent = category.name;
            filter.appendChild(optionFilter);

            const optionForm = document.createElement("option");
            optionForm.value = category.name;
            optionForm.textContent = category.name;
            select.appendChild(optionForm);
        });
    }

    // Hiển thị sản phẩm
    function renderProducts() {
        const keyword = document
            .getElementById("search-product")
            .value.trim()
            .toLocaleLowerCase("vi");

        const selectedCategory =
            document.getElementById("filter-category").value;

        const filteredProducts = products.filter(product => {
            const matchName = product.name
                .toLocaleLowerCase("vi")
                .includes(keyword);

            const matchCategory =
                !selectedCategory || product.category === selectedCategory;

            return matchName && matchCategory;
        });

        productList.innerHTML = "";

        filteredProducts.forEach(product => {
            const row = document.createElement("tr");

            // Tạo nội dung hàng bằng DOM để tránh chèn dữ liệu nhập vào trực tiếp HTML
            const productCell = document.createElement("td");
            const info = document.createElement("div");
            info.className = "product-info";

            const image = document.createElement("img");
            image.src = "../images/products/" + product.image;
            image.alt = product.name;
            image.onerror = function () {
                this.style.visibility = "hidden";
            };

            const details = document.createElement("div");
            const name = document.createElement("strong");
            name.textContent = product.name;

            const id = document.createElement("div");
            id.className = "product-id";
            id.textContent = "Mã: " + product.id;

            details.append(name, id);
            info.append(image, details);
            productCell.append(info);

            const categoryCell = document.createElement("td");
            categoryCell.textContent = product.category;

            const priceCell = document.createElement("td");
            priceCell.textContent = formatPrice(product.price);

            const actionCell = document.createElement("td");
            const actions = document.createElement("div");
            actions.className = "action-buttons";

            const editButton = document.createElement("button");
            editButton.type = "button";
            editButton.className = "btn-edit";
            editButton.textContent = "Sửa";
            editButton.addEventListener("click", function () {
                editProduct(product.id);
            });

            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.className = "btn-delete";
            deleteButton.textContent = "Xóa";
            deleteButton.addEventListener("click", function () {
                deleteProduct(product.id);
            });

            actions.append(editButton, deleteButton);
            actionCell.append(actions);

            row.append(productCell, categoryCell, priceCell, actionCell);
            productList.appendChild(row);
        });

        document.getElementById("empty-message").hidden =
            filteredProducts.length > 0;

        document.getElementById("total-products").textContent =
            products.length;

        document.getElementById("total-categories").textContent =
            categories.length;
    }

    // Mở form
    function openModal() {
        productForm.reset();
        document.getElementById("product-id").value = "";
        document.getElementById("modal-title").textContent = "Thêm sản phẩm";
        document.getElementById("form-message").textContent = "";
        productModal.hidden = false;
    }

    // Đóng form
    function closeModal() {
        productModal.hidden = true;
    }

    // Thêm sản phẩm
    function addProduct(product) {
        product.id = String(Date.now());
        products.push(product);
        saveProducts();
        renderProducts();
    }

    // Sửa sản phẩm
    function editProduct(id) {
        const product = products.find(item => item.id === id);

        if (!product) return;

        document.getElementById("product-id").value = product.id;
        document.getElementById("product-name").value = product.name;
        document.getElementById("product-category").value = product.category;
        document.getElementById("product-price").value = product.price;
        document.getElementById("product-image").value = product.image;

        document.getElementById("modal-title").textContent = "Sửa sản phẩm";
        document.getElementById("form-message").textContent = "";

        productModal.hidden = false;
    }

    // Xóa sản phẩm
    function deleteProduct(id) {
        const product = products.find(item => item.id === id);

        if (!product) return;

        const confirmDelete = confirm(
            "Bạn có chắc muốn xóa sản phẩm " + product.name + " không?"
        );

        if (!confirmDelete) return;

        products = products.filter(item => item.id !== id);

        saveProducts();
        renderProducts();
    }

    // Xử lý khi nhấn nút lưu form
    productForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const id = document.getElementById("product-id").value;
        const name = document.getElementById("product-name").value.trim();
        const category = document.getElementById("product-category").value;
        const price = Number(document.getElementById("product-price").value);
        const image = document.getElementById("product-image").value.trim();

        if (!name || !category || !image || !Number.isFinite(price) || price < 0) {
            document.getElementById("form-message").textContent =
                "Vui lòng nhập thông tin hợp lệ.";
            return;
        }

        if (id) {
            // Cập nhật sản phẩm cũ
            products = products.map(product => {
                if (product.id === id) {
                    return {
                        ...product,
                        name,
                        category,
                        price,
                        image
                    };
                }

                return product;
            });
        } else {
            // Tạo sản phẩm mới
            addProduct({
                name,
                category,
                price,
                image,
                slot: "Phụ kiện"
            });
        }

        saveProducts();
        renderProducts();
        closeModal();
    });

    // Gắn sự kiện cho các nút
    document.getElementById("add-product")
        .addEventListener("click", openModal);

    document.getElementById("close-modal")
        .addEventListener("click", closeModal);

    document.getElementById("cancel-modal")
        .addEventListener("click", closeModal);

    document.getElementById("search-product")
        .addEventListener("input", renderProducts);

    document.getElementById("filter-category")
        .addEventListener("change", renderProducts);

    // Khởi chạy
    renderCategories();
    renderProducts();

})();
