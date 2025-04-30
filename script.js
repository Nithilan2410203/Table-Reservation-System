// This function is for logging out the user
function logout() {
    localStorage.removeItem("userRole");
    window.location.href = "index.html";
}

// This function sets up the navigation dynamically based on user role
function setupNavigation() {
    let userRole = localStorage.getItem("userRole");
    let nav = document.getElementById("dynamicNav");

    if (!userRole) {
        window.location.href = "index.html";
        return;
    }

    let navItems = `
        <li class="nav-item"><a class="nav-link" href="home.html">Home</a></li>
        <li class="nav-item"><a class="nav-link" href="menu.html">Menu</a></li>
    `;

    if (userRole === "user") {
        navItems += `<li class="nav-item"><a class="nav-link" href="contact.html">Contact</a></li>`;
        navItems += `<li class="nav-item"><a class="nav-link" href="reservation.html">Reserve Table</a></li>`;
    } else {
        navItems += `<li class="nav-item"><a class="nav-link" href="admin_dashboard.html">Reserved Tables</a></li>`;
    }

    navItems += `<li class="nav-item"><a class="nav-link text-danger" href="#" onclick="logout()">Logout</a></li>`;
    nav.innerHTML = navItems;
}

// Run on page load
window.onload = () => {
    const params = new URLSearchParams(window.location.search);
    const role = params.get("role");
    if (role) localStorage.setItem("userRole", role);
    setupNavigation();
};

// === Form Validation Logic ===
document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");

    if (!form) return;

    form.addEventListener("submit", (e) => {
        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const guests = parseInt(document.getElementById("guests").value);
        const date = document.getElementById("date").value;
        const time = document.getElementById("time").value;

        const today = new Date().toISOString().split("T")[0];
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const nameRegex = /^[A-Za-z\s]+$/;

        let errors = [];

        if (!name || !nameRegex.test(name)) {
            errors.push("Please enter a valid name using only letters and spaces.");
        }

        if (!email || !emailRegex.test(email)) {
            errors.push("Enter a valid email address.");
        }

        if (isNaN(guests) || guests < 1 || guests > 20) {
            errors.push("Number of guests must be between 1 and 20.");
        }

        if (!date || date < today) {
            errors.push("Reservation date must be today or a future date.");
        }

        if (!time || time.length < 4) {
            errors.push("Please select a reservation time.");
        }

        if (errors.length > 0) {
            e.preventDefault();
            alert(errors.join("\n"));
        }
    });
});
