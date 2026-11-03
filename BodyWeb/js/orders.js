(function () {
    "use strict";

    function initOrders() {
        const tabs = document.querySelector("[data-order-tabs]");
        const list = document.querySelector("[data-orders-list]");
        if (!tabs || !list) return;

        const emptyState = document.querySelector("[data-orders-empty]");
        const message = document.querySelector("[data-orders-message]");
        let selectedStatus = window.Shop.orderStatuses[0];
        let orders;

        function createElement(tag, className, text) {
            const element = document.createElement(tag);
            if (className) element.className = className;
            if (text !== undefined) element.textContent = text;
            return element;
        }

        function renderTabs() {
            tabs.replaceChildren();
            window.Shop.orderStatuses.forEach((status) => {
                const button = createElement("button", "order-tab", status);
                button.type = "button";
                button.setAttribute("role", "tab");
                button.setAttribute("aria-selected", String(status === selectedStatus));
                button.addEventListener("click", () => {
                    selectedStatus = status;
                    renderTabs();
                    renderOrders();
                });
                tabs.append(button);
            });
        }

        function renderOrder(order) {
            const card = createElement("article", "order-card");
            const header = createElement("div", "order-header");
            const reference = createElement("div");
            const title = createElement("h2", "order-reference", `Đơn hàng ${order.id}`);
            const date = new Date(order.createdAt);
            const dateText = Number.isNaN(date.getTime())
                ? "Ngày đặt không xác định"
                : `Đặt ngày ${date.toLocaleString("vi-VN")}`;
            reference.append(title, createElement("p", "order-date", dateText));
            header.append(reference, createElement("span", "order-status", order.status));

            const items = createElement("div", "order-items");
            order.items.forEach((item) => {
                const row = createElement("div", "order-item");
                const image = document.createElement("img");
                image.src = item.image;
                image.alt = item.name;
                const details = createElement("div");
                details.append(
                    createElement("h3", "order-item-name", item.name),
                    createElement("p", "order-item-detail", `Số lượng: ${item.qty}`)
                );
                row.append(
                    image,
                    details,
                    createElement("span", "order-item-price", window.Shop.formatPrice(item.price * item.qty))
                );
                items.append(row);
            });

            const footer = createElement("div", "order-footer");
            const total = createElement("div", "order-total");
            total.append(
                createElement("span", "", "Tổng thanh toán: "),
                createElement("strong", "", window.Shop.formatPrice(order.total))
            );
            footer.append(total);
            if (order.status === "Chờ xác nhận") {
                const cancel = createElement("button", "order-cancel", "Hủy đơn hàng");
                cancel.type = "button";
                cancel.dataset.cancelOrder = order.id;
                footer.append(cancel);
            }

            card.append(header, items, footer);
            return card;
        }

        function renderOrders() {
            const visibleOrders = orders.filter((order) => order.status === selectedStatus);
            list.replaceChildren(...visibleOrders.map(renderOrder));
            emptyState.hidden = visibleOrders.length > 0;
            emptyState.textContent = visibleOrders.length
                ? ""
                : `Chưa có đơn hàng ở trạng thái "${selectedStatus}".`;
        }

        list.addEventListener("click", (event) => {
            const cancelButton = event.target.closest("[data-cancel-order]");
            if (!cancelButton) return;
            const order = orders.find((item) => item.id === cancelButton.dataset.cancelOrder);
            if (!order || order.status !== "Chờ xác nhận") return;
            order.status = "Đã hủy";
            try {
                window.Shop.writeOrders(orders);
                selectedStatus = "Đã hủy";
                message.textContent = "Đơn hàng đã được hủy.";
                renderTabs();
                renderOrders();
            } catch (error) {
                console.error("Không thể hủy đơn hàng.", error);
                message.textContent = "Không thể cập nhật đơn hàng trên trình duyệt này.";
            }
        });

        try {
            orders = window.Shop.readOrders();
        } catch (error) {
            console.error("Không thể đọc danh sách đơn hàng.", error);
            orders = [];
            message.textContent = "Không thể đọc dữ liệu đơn hàng. Hãy kiểm tra bộ nhớ trình duyệt.";
            emptyState.hidden = true;
        }
        renderTabs();
        renderOrders();

        const createdOrderId = new URLSearchParams(window.location.search).get("created");
        if (createdOrderId && orders.some((order) => order.id === createdOrderId)) {
            message.textContent = `Đặt hàng thành công! Mã đơn hàng: ${createdOrderId}.`;
            window.history.replaceState({}, "", window.location.pathname);
        }
    }

    document.addEventListener("DOMContentLoaded", initOrders);
})();
