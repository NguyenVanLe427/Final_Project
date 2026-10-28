/* =====================================================
   PHÒNG THỬ ĐỒ  (TryOn.js)
   JavaScript thuần – không cần jQuery/Bootstrap
   ===================================================== */

/* ---------- 1. CẤU HÌNH ---------- */
const TRYON_CONFIG = {
    STATE_KEY: 'tryonState',   // lưu giới tính, màu da, bộ đồ đang mặc
    CART_KEY:  'cart'          // ĐỔI cho khớp key giỏ hàng trong web của bạn
};

// Các ô (slot) đồ. Mỗi ô chỉ mặc được 1 món.
// Thứ tự lớp (z-index) nằm trong TryOn.css (#layer-...)
const TRYON_SLOTS = [
    { key: 'top',     label: 'Áo' },
    { key: 'bottom',  label: 'Quần' },
    { key: 'outer',   label: 'Áo khoác' },
    { key: 'shoes',   label: 'Giày' },
    { key: 'watch',   label: 'Đồng hồ' },
    { key: 'hat',     label: 'Mũ' },
    { key: 'glasses', label: 'Kính' }
];

// Các màu da để chọn
const TRYON_SKINS = [
    { name: 'Rất sáng', color: '#fde0c8' },
    { name: 'Sáng',     color: '#f1c9a5' },
    { name: 'Trung bình', color: '#e0ac7e' },
    { name: 'Rám nắng', color: '#c68a5c' },
    { name: 'Nâu',      color: '#9a6540' },
    { name: 'Nâu đậm',  color: '#6b4429' }
];

/* ---------- 2. DỮ LIỆU SẢN PHẨM (ĐIỀN LINK ẢNH VÀO ĐÂY) ----------
   id      : mã sản phẩm, không trùng nhau
   name    : tên hiển thị
   price   : giá (số)
   slot    : top | bottom | outer | shoes | watch | hat | glasses
   gender  : 'male' | 'female' | 'unisex'
   thumb   : link ảnh sản phẩm hiện trong danh sách (ảnh bình thường)
   tryOn   : ảnh PNG NỀN TRONG SUỐT dùng để mặc lên hình nhân
             - Đồ dành riêng cho 1 giới  -> 1 link:   tryOn: "img/tryon/ao1.png"
             - Đồ unisex (dáng người khác nhau) -> 2 link:
                 tryOn: { male: "link-nam.png", female: "link-nu.png" }
   Ảnh tryOn PHẢI cùng tỉ lệ 1:2 (ví dụ 600x1200 px) và món đồ nằm đúng
   vị trí trên cơ thể, để chồng lên hình nhân là khớp.
   Để trống "" thì món đó vẫn hiện trong danh sách nhưng chưa mặc được.
*/
const TRYON_PRODUCTS = [
    // ----- ÁO -----
    { id: 'T01', name: 'Áo thun nam mẫu 1',  price: 199000, slot: 'top',    gender: 'male',   thumb: '', tryOn: '' },
    { id: 'T02', name: 'Áo sơ mi nam mẫu 2', price: 299000, slot: 'top',    gender: 'male',   thumb: '', tryOn: '' },
    { id: 'T03', name: 'Áo thun nữ mẫu 1',   price: 189000, slot: 'top',    gender: 'female', thumb: '', tryOn: '' },
    { id: 'T04', name: 'Áo kiểu nữ mẫu 2',   price: 259000, slot: 'top',    gender: 'female', thumb: '', tryOn: '' },

    // ----- QUẦN -----
    { id: 'B01', name: 'Quần jean nam mẫu 1', price: 399000, slot: 'bottom', gender: 'male',   thumb: '', tryOn: '' },
    { id: 'B02', name: 'Quần short nam mẫu 2', price: 229000, slot: 'bottom', gender: 'male',  thumb: '', tryOn: '' },
    { id: 'B03', name: 'Quần jean nữ mẫu 1',  price: 379000, slot: 'bottom', gender: 'female', thumb: '', tryOn: '' },
    { id: 'B04', name: 'Chân váy nữ mẫu 2',   price: 249000, slot: 'bottom', gender: 'female', thumb: '', tryOn: '' },

    // ----- ÁO KHOÁC (unisex: có 2 ảnh theo giới) -----
    { id: 'O01', name: 'Áo khoác mẫu 1', price: 499000, slot: 'outer', gender: 'unisex', thumb: '', tryOn: { male: '', female: '' } },
    { id: 'O02', name: 'Áo khoác mẫu 2', price: 559000, slot: 'outer', gender: 'unisex', thumb: '', tryOn: { male: '', female: '' } },

    // ----- GIÀY -----
    { id: 'S01', name: 'Giày sneaker mẫu 1', price: 650000, slot: 'shoes', gender: 'unisex', thumb: '', tryOn: { male: '', female: '' } },
    { id: 'S02', name: 'Giày da mẫu 2',      price: 780000, slot: 'shoes', gender: 'unisex', thumb: '', tryOn: { male: '', female: '' } },

    // ----- ĐỒNG HỒ -----
    { id: 'W01', name: 'Đồng hồ mẫu 1', price: 890000,  slot: 'watch', gender: 'unisex', thumb: '', tryOn: { male: '', female: '' } },
    { id: 'W02', name: 'Đồng hồ mẫu 2', price: 1290000, slot: 'watch', gender: 'unisex', thumb: '', tryOn: { male: '', female: '' } },

    // ----- MŨ -----
    { id: 'H01', name: 'Mũ lưỡi trai mẫu 1', price: 149000, slot: 'hat', gender: 'unisex', thumb: '', tryOn: { male: '', female: '' } },

    // ----- KÍNH -----
    { id: 'G01', name: 'Kính mát mẫu 1', price: 199000, slot: 'glasses', gender: 'unisex', thumb: '', tryOn: { male: '', female: '' } }
];

/* ---------- 3. TRẠNG THÁI ---------- */
const tryonState = {
    gender: 'male',
    skin: TRYON_SKINS[1].color,
    tab: 'top',
    outfit: {}           // { top: 'T01', bottom: 'B01', ... }  (lưu id sản phẩm)
};

function loadState() {
    try {
        const saved = JSON.parse(localStorage.getItem(TRYON_CONFIG.STATE_KEY));
        if (saved && typeof saved === 'object') {
            if (saved.gender === 'male' || saved.gender === 'female') tryonState.gender = saved.gender;
            if (TRYON_SKINS.some(s => s.color === saved.skin)) tryonState.skin = saved.skin;
            if (saved.outfit && typeof saved.outfit === 'object') tryonState.outfit = saved.outfit;
        }
    } catch (e) { /* bỏ qua nếu dữ liệu lưu bị lỗi */ }
}

function saveState() {
    try {
        localStorage.setItem(TRYON_CONFIG.STATE_KEY, JSON.stringify({
            gender: tryonState.gender,
            skin: tryonState.skin,
            outfit: tryonState.outfit
        }));
    } catch (e) { /* localStorage bị chặn thì thôi */ }
}

/* ---------- 4. HÀM TIỆN ÍCH ---------- */
const $ = (sel) => document.querySelector(sel);

function esc(text) {
    const d = document.createElement('div');
    d.textContent = text;
    return d.innerHTML;
}

function formatPrice(n) {
    return Number(n).toLocaleString('vi-VN') + 'đ';
}

function findProduct(id) {
    return TRYON_PRODUCTS.find(p => p.id === id);
}

// Món này có hợp giới tính đang chọn không
function fitsGender(p) {
    return p.gender === 'unisex' || p.gender === tryonState.gender;
}

// Lấy link ảnh thử đồ theo giới tính đang chọn
function getTryOnImg(p) {
    if (!p.tryOn) return '';
    if (typeof p.tryOn === 'string') return p.tryOn;
    return p.tryOn[tryonState.gender] || '';
}

let toastTimer = null;
function showToast(msg) {
    const t = $('#tryon-toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}

/* ---------- 5. VẼ GIAO DIỆN ---------- */
function renderStage() {
    const stage = $('#tryon-stage');
    stage.dataset.gender = tryonState.gender;
    document.querySelector('.tryon-section').style.setProperty('--skin', tryonState.skin);

    TRYON_SLOTS.forEach(slot => {
        const layer = $('#layer-' + slot.key);
        const p = findProduct(tryonState.outfit[slot.key]);
        const src = p ? getTryOnImg(p) : '';
        if (src) {
            layer.src = src;
            layer.alt = p.name;
            layer.classList.add('on');
        } else {
            layer.removeAttribute('src');
            layer.classList.remove('on');
        }
    });
}

function renderControls() {
    document.querySelectorAll('.gender-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.gender === tryonState.gender);
    });
    document.querySelectorAll('.skin-dot').forEach(dot => {
        dot.classList.toggle('active', dot.dataset.color === tryonState.skin);
    });
}

function renderTabs() {
    $('#tryon-tabs').innerHTML = TRYON_SLOTS.map(s =>
        `<button type="button" class="tab-btn${s.key === tryonState.tab ? ' active' : ''}" data-tab="${s.key}">${s.label}</button>`
    ).join('');
}

function renderProducts() {
    const list = TRYON_PRODUCTS.filter(p => p.slot === tryonState.tab && fitsGender(p));
    const box = $('#tryon-products');

    if (!list.length) {
        box.innerHTML = '<p class="tryon-empty">Chưa có sản phẩm cho mục này.</p>';
        return;
    }

    box.innerHTML = list.map(p => {
        const worn = tryonState.outfit[p.slot] === p.id;
        const thumb = p.thumb
            ? `<div class="tp-thumb"><img src="${esc(p.thumb)}" alt="${esc(p.name)}"></div>`
            : `<div class="tp-thumb no-img">Chưa có ảnh</div>`;
        return `
            <div class="tp-card${worn ? ' worn' : ''}">
                ${thumb}
                <p class="tp-name">${esc(p.name)}</p>
                <p class="tp-price">${formatPrice(p.price)}</p>
                <button type="button" class="tp-btn" data-id="${p.id}">${worn ? 'Cởi ra' : 'Thử đồ'}</button>
            </div>`;
    }).join('');
}

function renderSummary() {
    const items = TRYON_SLOTS
        .map(s => findProduct(tryonState.outfit[s.key]))
        .filter(Boolean);

    $('#sum-list').innerHTML = items.length
        ? items.map(p => `<li><span>${esc(p.name)}</span><span>${formatPrice(p.price)}</span></li>`).join('')
        : '<li class="sum-none">Chưa chọn món nào</li>';

    const total = items.reduce((sum, p) => sum + p.price, 0);
    $('#sum-total').textContent = formatPrice(total);
}

function renderAll() {
    renderStage();
    renderControls();
    renderTabs();
    renderProducts();
    renderSummary();
}

/* ---------- 6. HÀNH ĐỘNG ---------- */
function toggleItem(id) {
    const p = findProduct(id);
    if (!p) return;

    if (tryonState.outfit[p.slot] === id) {
        delete tryonState.outfit[p.slot];          // bấm lần nữa = cởi ra
    } else {
        tryonState.outfit[p.slot] = id;            // mặc món mới (thay món cũ cùng ô)
        if (!getTryOnImg(p)) showToast('Món này chưa có ảnh thử đồ');
    }
    saveState();
    renderAll();
}

function setGender(gender) {
    if (gender === tryonState.gender) return;
    tryonState.gender = gender;

    // Cởi những món không hợp giới tính mới
    Object.keys(tryonState.outfit).forEach(slot => {
        const p = findProduct(tryonState.outfit[slot]);
        if (!p || !fitsGender(p)) delete tryonState.outfit[slot];
    });
    saveState();
    renderAll();
}

function setSkin(color) {
    tryonState.skin = color;
    saveState();
    renderStage();
    renderControls();
}

function clearOutfit() {
    tryonState.outfit = {};
    saveState();
    renderAll();
}

// Thêm cả bộ vào giỏ hàng (localStorage)
// Mỗi phần tử giỏ: { id, name, price, qty } – chỉnh lại cho khớp cấu trúc giỏ của bạn
function addOutfitToCart() {
    const items = TRYON_SLOTS
        .map(s => findProduct(tryonState.outfit[s.key]))
        .filter(Boolean);

    if (!items.length) {
        showToast('Bạn chưa chọn món nào');
        return;
    }

    let cart = [];
    try {
        cart = JSON.parse(localStorage.getItem(TRYON_CONFIG.CART_KEY)) || [];
        if (!Array.isArray(cart)) cart = [];
    } catch (e) { cart = []; }

    items.forEach(p => {
        const found = cart.find(c => c.id === p.id);
        if (found) found.qty += 1;
        else cart.push({ id: p.id, name: p.name, price: p.price, qty: 1 });
    });

    try {
        localStorage.setItem(TRYON_CONFIG.CART_KEY, JSON.stringify(cart));
        showToast('Đã thêm ' + items.length + ' món vào giỏ hàng');
    } catch (e) {
        showToast('Không lưu được giỏ hàng');
    }
}

/* ---------- 7. KHỞI TẠO ---------- */
function initTryOn() {
    // Vẽ danh sách màu da
    $('#skin-list').innerHTML = TRYON_SKINS.map(s =>
        `<button type="button" class="skin-dot" data-color="${s.color}" title="${s.name}" aria-label="${s.name}" style="background:${s.color}"></button>`
    ).join('');

    loadState();

    // Sự kiện (dùng event delegation)
    document.querySelector('.tryon-section').addEventListener('click', (e) => {
        const gBtn = e.target.closest('.gender-btn');
        if (gBtn) return setGender(gBtn.dataset.gender);

        const skin = e.target.closest('.skin-dot');
        if (skin) return setSkin(skin.dataset.color);

        const tab = e.target.closest('.tab-btn');
        if (tab) {
            tryonState.tab = tab.dataset.tab;
            renderTabs();
            renderProducts();
            return;
        }

        const item = e.target.closest('.tp-btn');
        if (item) return toggleItem(item.dataset.id);

        if (e.target.closest('#btn-clear')) return clearOutfit();
        if (e.target.closest('#btn-cart'))  return addOutfitToCart();
    });

    renderAll();
}

document.addEventListener('DOMContentLoaded', initTryOn);
