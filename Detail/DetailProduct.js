const categories = [
    {
        id: 1,
        name: "Men Clothes",
        image: "Myproject/image.png"
    },
    {
        id: 2,
        name: "Watches",
        image: "Myproject/image copy 19.png"
    },
    {
        id: 3,
        name: "Men Shoes",
        image: "Myproject/image copy 6.png"
    },
    {
        id: 4,
        name: "Women Clothes",
        image: "Myproject/image copy.png"
    },
    {
        id: 5,
        name: "Beauty",
        image: "Myproject/image copy 12.png"
    },
    {
        id: 6,
        name: "Women Shoes",
        image: "Myproject/image copy 14.png"
    },
    {
        id: 7,
        name: "Women Bags",
        image: "Myproject/image copy 15.png"
    },
    {
        id: 8,
        name: "Fashion Accessories",
        image: "Myproject/image copy 16.png"
    }
];const params = new URLSearchParams(window.location.search);
const id = Number(params.get("id"));

const category = categories.find(item => item.id === id);

if (category) {
    document.getElementById("product-name").textContent = category.name;
    document.getElementById("product-image").src = category.image;
    document.getElementById("product-image").alt = category.name;
} else {
    document.getElementById("product-name").textContent = "Không tìm thấy danh mục";
}

const addCartButton = document.getElementById("add-cart");
const quantityInput = document.getElementById("quantity");
const message = document.getElementById("message");
const cartCount = document.getElementById("cart-count");

function getCart() {
    return JSON.parse(localStorage.getItem("cart")) || [];
}

function updateCartCount() {
    const cart = getCart();

    const total = cart.reduce((sum, item) => {
        return sum + Number(item.quantity);
    }, 0);

    if (cartCount) {
        cartCount.textContent = total;
    }
}

document.getElementById("increase").addEventListener("click", function () {
    let quantity = Number(quantityInput.value) || 1;

    if (quantity < 99) {
        quantityInput.value = quantity + 1;
    }
});

document.getElementById("decrease").addEventListener("click", function () {
    let quantity = Number(quantityInput.value) || 1;

    if (quantity > 1) {
        quantityInput.value = quantity - 1;
    }
});

addCartButton.addEventListener("click", function () {
    const id = new URLSearchParams(window.location.search).get("id");
    const name = document.getElementById("product-name").textContent.trim();
    const image = document.getElementById("product-image").getAttribute("src");
    const priceText = document.getElementById("product-price").textContent;
    const price = Number(priceText.replace(/[^\d]/g, ""));
    const quantity = Number(quantityInput.value);

    if (!name || !image || !price || !Number.isInteger(quantity)
        || quantity < 1 || quantity > 99) {
        message.textContent = "Thông tin sản phẩm hoặc số lượng không hợp lệ!";
        return;
    }

    const cart = getCart();

    const existingItem = cart.find(item => String(item.id) === String(id));

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: id,
            name: name,
            image: image,
            price: price,
            quantity: quantity
        });
    }

    localStorage.setItem("cart", JSON.stringify(cart));

    updateCartCount();

    message.textContent = "Đã thêm sản phẩm vào giỏ hàng!";
});

updateCartCount();
