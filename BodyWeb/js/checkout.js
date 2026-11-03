// Lấy các phần tử HTML
var productList = document.getElementById("product-list");
var totalPrice = document.getElementById("total-price");
var checkoutForm = document.getElementById("checkout-form");
var bankInfo = document.getElementById("bank-info");
var successMessage = document.getElementById("success-message");

// Lấy giỏ hàng
var cart = Shop.readCart();

// Tính tổng tiền
var total = 0;

// Hiển thị sản phẩm
if (cart.length == 0) {
    productList.innerHTML = "<p>Giỏ hàng đang trống!</p>";
    checkoutForm.style.display = "none";
} else {
    cart.forEach(function(product) {

        var itemTotal = product.price * product.qty;

        total = total + itemTotal;

        productList.innerHTML += `
            <div class="product-item">
                <span>${product.name} x ${product.qty}</span>
                <span>${Shop.formatPrice(itemTotal)}</span>
            </div>
        `;
    });

    totalPrice.innerHTML =
        "Tổng tiền: " + Shop.formatPrice(total);
}

// Chọn phương thức thanh toán
var paymentOptions = document.querySelectorAll(
    'input[name="payment"]'
);

paymentOptions.forEach(function(option) {

    option.addEventListener("change", function() {

        if (this.value == "BANK") {
            bankInfo.style.display = "block";
        } else {
            bankInfo.style.display = "none";
        }

    });

});

// Xác nhận đặt hàng
checkoutForm.addEventListener("submit", function(event) {

    event.preventDefault();

    if (cart.length == 0) {
        alert("Giỏ hàng đang trống!");
        return;
    }

    // Lấy thông tin người nhận
    var name = document.getElementById("customer-name").value;
    var phone = document.getElementById("customer-phone").value;
    var address = document.getElementById("customer-address").value;

    // Lấy phương thức thanh toán
    var payment = document.querySelector(
        'input[name="payment"]:checked'
    ).value;

    // Tạo đơn hàng
    var order = {
        id: "MM" + Date.now(),
        name: name,
        phone: phone,
        address: address,
        payment: payment,
        products: cart,
        total: total,
        date: new Date().toLocaleString("vi-VN"),
        status: "Đang xử lý"
    };

    // Lấy lịch sử đơn hàng
    var orders = JSON.parse(
        localStorage.getItem("orders")
    ) || [];

    // Thêm đơn hàng mới
    orders.push(order);

    // Lưu đơn hàng
    localStorage.setItem(
        "orders",
        JSON.stringify(orders)
    );

    // Xóa giỏ hàng
    Shop.writeCart([]);

    // Hiển thị thông báo thành công
    checkoutForm.style.display = "none";
    document.getElementById("order-info").style.display = "none";
    successMessage.style.display = "block";

    document.getElementById("order-code").innerHTML =
        "Mã đơn hàng: " + order.id;

});