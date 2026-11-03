(function () {
    "use strict";

    const PRODUCT_KEY = "mm_products";
    const CATEGORY_KEY = "mm_categories";
    const PRODUCT_VERSION_KEY = "mm_products_catalog_version";

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
        { id: "1", name: "Áo thời trang nam", category: "Thời trang nam", image: "product-01.png", price: 399000, slot: "Áo" },
        { id: "2", name: "Đồng hồ thanh lịch", category: "Đồng hồ", image: "product-02.png", price: 890000, slot: "Phụ kiện" },
        { id: "3", name: "Giày thể thao nam", category: "Giày nam", image: "product-03.png", price: 650000, slot: "Giày" },
        { id: "4", name: "Trang phục nữ hiện đại", category: "Thời trang nữ", image: "product-04.png", price: 459000, slot: "Áo" },
        { id: "5", name: "Sản phẩm chăm sóc sắc đẹp", category: "Làm đẹp", image: "product-05.png", price: 299000, slot: "Phụ kiện" },
        { id: "6", name: "Giày nữ phong cách", category: "Giày nữ", image: "product-06.png", price: 579000, slot: "Giày" },
        { id: "7", name: "Túi xách thời trang", category: "Túi xách", image: "product-07.png", price: 720000, slot: "Phụ kiện" },
        { id: "8", name: "Phụ kiện thời trang", category: "Phụ kiện", image: "product-08.png", price: 199000, slot: "Phụ kiện" },
        { id: "9", name: "Áo thun ONTOP Adventure", category: "Thời trang nam", image: "product-09.png", price: 199000, slot: "Áo" },
        { id: "10", name: "Giày thể thao phối màu", category: "Giày nữ", image: "product-10.png", price: 350000, slot: "Giày" },
        { id: "11", name: "Dây chuyền bạc hoa", category: "Phụ kiện", image: "product-11.png", price: 490000, slot: "Phụ kiện" },
        { id: "12", name: "Đồng hồ sang trọng", category: "Đồng hồ", image: "product-12.png", price: 1200000, slot: "Phụ kiện" }
    ];

    function readData(key, defaults) {
        const saved = localStorage.getItem(key);
        if (saved === null) return defaults.map(item => ({ ...item }));

        try {
            const data = JSON.parse(saved);
            if (!Array.isArray(data)) {
                throw new Error("Dữ liệu danh mục sản phẩm không đúng định dạng.");
            }
            return data;
        } catch (error) {
            console.error("Không thể đọc dữ liệu " + key + ".", error);
            return defaults.map(item => ({ ...item }));
        }
    }

    function readProducts() {
        let products = readData(PRODUCT_KEY, defaultProducts);

        if (localStorage.getItem(PRODUCT_VERSION_KEY) === null) {
            const legacyProductIds = defaultProducts.slice(0, 8).map(product => product.id);
            const hasLegacyCatalog = legacyProductIds.every(id =>
                products.some(product => String(product.id) === id)
            );

            if (hasLegacyCatalog) {
                const missingDefaults = defaultProducts.slice(8).filter(product =>
                    !products.some(savedProduct => String(savedProduct.id) === product.id)
                );

                if (missingDefaults.length > 0) {
                    products = products.concat(missingDefaults);
                    localStorage.setItem(PRODUCT_KEY, JSON.stringify(products));
                }
            }

            localStorage.setItem(PRODUCT_VERSION_KEY, "2");
        }

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
            localStorage.setItem(PRODUCT_KEY, JSON.stringify(products));
        },
        saveCategories: function (categories) {
            localStorage.setItem(CATEGORY_KEY, JSON.stringify(categories));
        }
    };
})();
