// Lấy các phần tử HTML
var productList = document.getElementById("product-list");
var totalPrice = document.getElementById("total-price");
var checkoutForm = document.getElementById("checkout-form");
var bankInfo = document.getElementById("bank-info");
var successMessage = document.getElementById("success-message");

// Lấy thông tin tài khoản khách hàng
var customerName = document.getElementById("customer-name");
var customerPhone = document.getElementById("customer-phone");
var customerEmail = document.getElementById("customer-email");

// Tự động lấy thông tin từ tài khoản đã đăng ký
customerName.value = localStorage.getItem("hoTen") || "";
customerPhone.value = localStorage.getItem("soDienThoai") || "";
customerEmail.value = localStorage.getItem("email") || "";

// Lấy các phần tử ngân hàng
var bankSelect = document.getElementById("bank-select");
var bankAccount = document.getElementById("bank-account");
var bankOwner = document.getElementById("bank-owner");
var checkAccount = document.getElementById("check-account");
var accountResult = document.getElementById("account-result");

// Ban đầu chưa có tên chủ tài khoản
var accountChecked = false;


// Khi nhập số tài khoản
bankAccount.addEventListener("input", function() {
    accountChecked = false;
    accountResult.style.display = "none";
    bankOwner.value = "";
});

// Khi thay đổi ngân hàng
bankSelect.addEventListener("change", function() {
    accountChecked = false;
    accountResult.style.display = "none";
    bankOwner.value = "";
});

// Nhấn nút kiểm tra
checkAccount.addEventListener("click", function() {

    var accountNumber = bankAccount.value.trim();

    if (bankSelect.value == "") {
        alert("Vui lòng chọn ngân hàng!");
        return;
    }

    if (accountNumber == "") {
        alert("Vui lòng nhập số tài khoản!");
        return;
    }

    // Lấy tên đã đăng ký Shop
    var name = localStorage.getItem("hoTen");

    if (!name) {
        alert("Không tìm thấy tên tài khoản!");
        return;
    }

    // Hiển thị tên chủ tài khoản
    bankOwner.value = name;
    accountResult.style.display = "block";

    accountChecked = true;
});


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

    // Kiểm tra thông tin tài khoản
    if (!customerName.value || !customerPhone.value || !customerEmail.value) {
        alert("Không tìm thấy thông tin tài khoản!");
        return;
    }

    // Lấy thông tin người nhận
    var name = customerName.value;
    var phone = customerPhone.value;
    var email = customerEmail.value;
    var address = document.getElementById("customer-address").value;

    // Lấy phương thức thanh toán
    var payment = document.querySelector(
        'input[name="payment"]:checked'
    ).value;

    // Lấy thông tin ngân hàng
    var bank = "";
    var accountNumber = "";
    var accountOwner = "";

    if (payment == "BANK") {

        bank = bankSelect.value;
        accountNumber = bankAccount.value.trim();
        accountOwner = bankOwner.value;

        if (bank == "" || accountNumber == "") {
            alert("Vui lòng chọn ngân hàng và nhập số tài khoản!");
            return;
        }

        if (accountChecked == false) {
            alert("Vui lòng nhấn Kiểm tra số tài khoản trước!");
            return;
        }
    }

    // Tạo đơn hàng
    var order = {
        id: "MM" + Date.now(),
        name: name,
        phone: phone,
        email: email,
        address: address,
        payment: payment,
        bank: bank,
        accountNumber: accountNumber,
        accountOwner: accountOwner,
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