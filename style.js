// Chuyển sang form Đăng nhập
function hienDangNhap() {
    document.getElementById("loginForm").hidden = false;
    document.getElementById("registerForm").hidden = true;

    document.getElementById("loginTab").classList.add("active");
    document.getElementById("registerTab").classList.remove("active");

    document.getElementById("message").innerHTML = "";
}

// Chuyển sang form Đăng ký
function hienDangKy() {
    document.getElementById("loginForm").hidden = true;
    document.getElementById("registerForm").hidden = false;

    document.getElementById("loginTab").classList.remove("active");
    document.getElementById("registerTab").classList.add("active");

    document.getElementById("message").innerHTML = "";
}

// Khi nhấn nút Đăng nhập trên giao diện
document.getElementById("loginTab").onclick = hienDangNhap;

// Khi nhấn nút Đăng ký trên giao diện
document.getElementById("registerTab").onclick = hienDangKy;

// Khi nhấn chữ Đăng ký ngay
document.getElementById("goRegister").onclick = function() {
    hienDangKy();
    return false;
};

// Khi nhấn chữ Đăng nhập
document.getElementById("goLogin").onclick = function() {
    hienDangNhap();
    return false;
};


// CHỨC NĂNG ĐĂNG KÝ
document.getElementById("registerForm").onsubmit = function() {
    var hoTen = document.getElementById("fullName").value;
    var email = document.getElementById("registerEmail").value;
    var matKhau = document.getElementById("registerPassword").value;
    var xacNhan = document.getElementById("confirmPassword").value;

    // Kiểm tra mật khẩu
    if (matKhau.length < 6) {
        document.getElementById("message").innerHTML =
            "Mật khẩu phải có ít nhất 6 ký tự!";
        return false;
    }

    // Kiểm tra xác nhận mật khẩu
    if (matKhau != xacNhan) {
        document.getElementById("message").innerHTML =
            "Mật khẩu xác nhận không khớp!";
        return false;
    }

    // Lấy tài khoản đã lưu
    var emailDaLuu = localStorage.getItem("email");
    var matKhauDaLuu = localStorage.getItem("matKhau");

    // Kiểm tra email đã được đăng ký chưa
    if (email == emailDaLuu) {
        document.getElementById("message").innerHTML =
            "Email này đã được đăng ký!";
        return false;
    }

    // Lưu tài khoản
    localStorage.setItem("hoTen", hoTen);
    localStorage.setItem("email", email);
    localStorage.setItem("matKhau", matKhau);

    alert("Đăng ký thành công! Hãy đăng nhập.");

    // Chuyển về form đăng nhập
    hienDangNhap();

    // Điền sẵn email vừa đăng ký
    document.getElementById("loginEmail").value = email;

    // Xóa dữ liệu trong form đăng ký
    document.getElementById("registerForm").reset();

    return false;
};


// CHỨC NĂNG ĐĂNG NHẬP
document.getElementById("loginForm").onsubmit = function() {
    var email = document.getElementById("loginEmail").value;
    var matKhau = document.getElementById("loginPassword").value;

    // Lấy tài khoản đã đăng ký
    var emailDaLuu = localStorage.getItem("email");
    var matKhauDaLuu = localStorage.getItem("matKhau");

    // Kiểm tra email và mật khẩu
    if (email == emailDaLuu && matKhau == matKhauDaLuu) {
        alert("Đăng nhập thành công!");

        // Chuyển đến trang M&M Shop
        window.location.href = "M&M_Shop.html";
    } else {
        document.getElementById("message").innerHTML =
            "Email hoặc mật khẩu không chính xác!";
    }

    return false;
};