(function () {
    "use strict";

    const PRODUCT_KEY = "mm_products";
    const CATEGORY_KEY = "mm_categories";
    const PRODUCT_VERSION_KEY = "mm_products_catalog_version";
    const PRODUCT_NAME_MIGRATION_KEY = "mm_product_names_migration_version";
    const productCategoryUpdates = [
        { id: "2", image: "product-02.png", previousCategory: "Đồng hồ", category: "Túi xách" },
        { id: "3", image: "product-03.png", previousCategory: "Giày nam", category: "Phụ kiện" },
        { id: "4", image: "product-04.png", previousCategory: "Thời trang nữ", category: "Phụ kiện" },
        { id: "5", image: "product-05.png", previousCategory: "Làm đẹp", category: "Phụ kiện" },
        { id: "6", image: "product-06.png", previousCategory: "Giày nữ", category: "Phụ kiện" },
        { id: "7", image: "product-07.png", previousCategory: "Túi xách", category: "Giày nữ" }
    ];

    const productNameUpdates = [
        { id: "1", image: "product-01.png", previousName: "Áo thời trang nam", name: "Áo thun đỏ in ngôi sao vàng" },
        { id: "2", image: "product-02.png", previousName: "Đồng hồ thanh lịch", name: "Túi đeo chéo mini xanh kem" },
        { id: "3", image: "product-03.png", previousName: "Giày thể thao nam", name: "Dây chuyền bạc mặt đá" },
        { id: "4", image: "product-04.png", previousName: "Trang phục nữ hiện đại", name: "Nón lưỡi trai trắng hình râu" },
        { id: "5", image: "product-05.png", previousName: "Sản phẩm chăm sóc sắc đẹp", name: "Lắc tay dây xích màu vàng" },
        { id: "6", image: "product-06.png", previousName: "Giày nữ phong cách", name: "Bông tai bạc đính đá" },
        { id: "7", image: "product-07.png", previousName: "Túi xách thời trang", name: "Dép sandal nữ quai ngang chấm bi" },
        { id: "8", image: "product-08.png", previousName: "Phụ kiện thời trang", name: "Kính mát gọng vàng tròng xanh" },
        { id: "11", image: "product-11.png", previousName: "Dây chuyền bạc hoa", name: "Dây chuyền bạc nơ đính đá" },
        { id: "16", image: "product-16.png", previousName: "Đồng hồ dây kim loại vàng", name: "Đồng hồ Seiko dây kim loại mặt xanh" }
    ];

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

    const defaultProducts = [
        { id: "1", name: "Áo thun đỏ in ngôi sao vàng", category: "Thời trang nam", image: "product-01.png", price: 399000, slot: "Áo" },
        { id: "2", name: "Túi đeo chéo mini xanh kem", category: "Túi xách", image: "product-02.png", price: 890000, slot: "Phụ kiện" },
        { id: "3", name: "Dây chuyền bạc mặt đá", category: "Phụ kiện", image: "product-03.png", price: 650000, slot: "Giày" },
        { id: "4", name: "Nón lưỡi trai trắng hình râu", category: "Phụ kiện", image: "product-04.png", price: 459000, slot: "Áo" },
        { id: "5", name: "Lắc tay dây xích màu vàng", category: "Phụ kiện", image: "product-05.png", price: 299000, slot: "Phụ kiện" },
        { id: "6", name: "Bông tai bạc đính đá", category: "Phụ kiện", image: "product-06.png", price: 579000, slot: "Giày" },
        { id: "7", name: "Dép sandal nữ quai ngang ", category: "Giày nữ", image: "product-07.png", price: 720000, slot: "Phụ kiện" },
        { id: "8", name: "Kính mát gọng vàng", category: "Phụ kiện", image: "product-08.png", price: 199000, slot: "Phụ kiện" },
        { id: "9", name: "Áo thun ONTOP Adventure", category: "Thời trang nam", image: "product-09.png", price: 199000, slot: "Áo" },
        { id: "10", name: "Giày thể thao phối màu", category: "Giày nữ", image: "product-10.png", price: 350000, slot: "Giày" },
        { id: "11", name: "Dây chuyền bạc nơ", category: "Phụ kiện", image: "product-11.png", price: 490000, slot: "Phụ kiện" },
        { id: "12", name: "Đồng hồ sang trọng", category: "Đồng hồ", image: "product-12.png", price: 1200000, slot: "Phụ kiện" },

        { id: "13", name: "Áo sơ mi caro đỏ đen", category: "Thời trang nam", image: "product-13.png", price: 329000, slot: "Áo" },
        { id: "14", name: "Áo sweater đỏ trái tim", category: "Thời trang nam", image: "product-14.png", price: 359000, slot: "Áo" },
        { id: "15", name: "Đồng hồ thể thao trắng", category: "Đồng hồ", image: "product-15.png", price: 1450000, slot: "Phụ kiện" },
        { id: "16", name: "Đồng hồ Seiko dây kim loại", category: "Đồng hồ", image: "product-16.png", price: 1890000, slot: "Phụ kiện" },
        { id: "17", name: "Kính mát gọng vàng", category: "Phụ kiện", image: "product-17.png", price: 259000, slot: "Phụ kiện" },
        { id: "18", name: "Kính mát đen phong cách", category: "Phụ kiện", image: "product-18.png", price: 229000, slot: "Phụ kiện" },
        { id: "19", name: "Túi xách mini màu kem", category: "Túi xách", image: "product-19.png", price: 690000, slot: "Phụ kiện" },
        { id: "20", name: "Túi đeo chéo họa tiết be", category: "Túi xách", image: "product-20.png", price: 790000, slot: "Phụ kiện" },
        { id: "21", name: "Túi xách tay trắng thanh lịch", category: "Túi xách", image: "product-21.png", price: 750000, slot: "Phụ kiện" },
        { id: "22", name: "Dây chuyền hoa đính đá", category: "Phụ kiện", image: "product-22.png", price: 520000, slot: "Phụ kiện" },
        { id: "23", name: "Giày lười da nam màu nâu", category: "Giày nam", image: "product-23.png", price: 890000, slot: "Giày" }
    ];

    function readData(key, defaults) {
        const saved = localStorage.getItem(key);

        if (saved === null) {
            return defaults.map(item => ({ ...item }));
        }

        try {
            const data = JSON.parse(saved);

            if (!Array.isArray(data)) {
                throw new Error("Dữ liệu không đúng định dạng.");
            }

            return data;
        } catch (error) {
            console.error("Không thể đọc dữ liệu " + key + ".", error);
            return defaults.map(item => ({ ...item }));
        }
    }

    function migrateProductName(item) {
        const imageName = String(item.image || "").split(/[\\/]/).pop();
        const update = productNameUpdates.find(candidate =>
            String(item.id) === candidate.id &&
            imageName === candidate.image &&
            item.name === candidate.previousName
        );

        if (!update) return false;
        item.name = update.name;
        return true;
    }

    function migrateProductCategory(item) {
        const imageName = String(item.image || "").split(/[\\/]/).pop();
        const update = productCategoryUpdates.find(candidate =>
            String(item.id) === candidate.id &&
            imageName === candidate.image &&
            item.category === candidate.previousCategory
        );

        if (!update) return false;
        item.category = update.category;
        return true;
    }

    function migrateSavedProductNames() {
        if (localStorage.getItem(PRODUCT_NAME_MIGRATION_KEY) === "1") return;

        let complete = true;
        ["cart", "orders"].forEach(key => {
            const stored = localStorage.getItem(key);
            if (stored === null) return;

            try {
                const records = JSON.parse(stored);
                if (!Array.isArray(records)) {
                    throw new Error("Dữ liệu không đúng định dạng.");
                }

                let changed = false;
                if (key === "cart") {
                    records.forEach(item => {
                        changed = migrateProductName(item) || changed;
                    });
                } else {
                    records.forEach(order => {
                        ["items", "products"].forEach(property => {
                            if (!Array.isArray(order[property])) return;
                            order[property].forEach(item => {
                                changed = migrateProductName(item) || changed;
                            });
                        });
                    });
                }

                if (changed) localStorage.setItem(key, JSON.stringify(records));
            } catch (error) {
                console.error("Không thể cập nhật tên sản phẩm đã lưu trong " + key + ".", error);
                complete = false;
            }
        });

        if (complete) localStorage.setItem(PRODUCT_NAME_MIGRATION_KEY, "1");
    }

    function readProducts() {
        let products = readData(PRODUCT_KEY, defaultProducts);

        const currentVersion = localStorage.getItem(PRODUCT_VERSION_KEY);

        if (currentVersion !== "5") {
            const savedIds = new Set(
                products.map(product => String(product.id))
            );

            const missingProducts = defaultProducts.filter(product =>
                !savedIds.has(String(product.id))
            );

            if (missingProducts.length > 0) {
                products = products.concat(missingProducts);

                localStorage.setItem(
                    PRODUCT_KEY,
                    JSON.stringify(products)
                );
            }

            let namesChanged = false;
            let categoriesChanged = false;
            products.forEach(product => {
                namesChanged = migrateProductName(product) || namesChanged;
                categoriesChanged = migrateProductCategory(product) || categoriesChanged;
            });

            if (namesChanged || categoriesChanged || localStorage.getItem(PRODUCT_KEY) !== null) {
                localStorage.setItem(PRODUCT_KEY, JSON.stringify(products));
            }

            localStorage.setItem(PRODUCT_VERSION_KEY, "5");
        }

        migrateSavedProductNames();
        return products;
    }

    window.CatalogStore = {
        PRODUCT_KEY,
        CATEGORY_KEY,
        readProducts,

        readCategories: function () {
            return readData(CATEGORY_KEY, defaultCategories);
        },

        saveProducts: function (products) {
            localStorage.setItem(
                PRODUCT_KEY,
                JSON.stringify(products)
            );
        },

        saveCategories: function (categories) {
            localStorage.setItem(
                CATEGORY_KEY,
                JSON.stringify(categories)
            );
        }
    };
})();
