
document.querySelectorAll(".category[data-id]").forEach(category => {
    category.addEventListener("click", function () {
        const id = this.dataset.id;
        window.location.href = "DetailProduct.html?id=" + id;
    });
});
