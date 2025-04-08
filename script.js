const users = {
    user: { username: "customer", password: "1234" },
    admin: { username: "admin", password: "admin123" }
};

document.addEventListener("DOMContentLoaded", function () {
    // Ensure navigation setup runs after DOM is ready
    if (document.getElementById("dynamicNav")) {
        setupNavigation();
    }

    // Add form validation and submission handling
    const reservationForm = document.getElementById("reservationForm");
    if (reservationForm) {
        reservationForm.addEventListener("submit", validateReservation);
    }

    // Add event listeners for Enter key on login forms
    const userLoginForm = document.getElementById("user-login");
    if (userLoginForm) {
        userLoginForm.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                event.preventDefault(); // Prevent form submission
                validateLogin("user"); // Trigger user login validation
            }
        });
    }

    const adminLoginForm = document.getElementById("admin-login");
    if (adminLoginForm) {
        adminLoginForm.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                event.preventDefault(); // Prevent form submission
                validateLogin("admin"); // Trigger admin login validation
            }
        });
    }
});

function showLogin(role) {
    document.getElementById("user-login").classList.add("d-none");
    document.getElementById("admin-login").classList.add("d-none");
    document.getElementById(role + "-login").classList.remove("d-none");
}

function validateLogin(role) {
    let username = document.getElementById(role + "-username").value.trim();
    let password = document.getElementById(role + "-password").value.trim();
    let errorMessage = document.getElementById(role + "-error");

    if (username === users[role].username && password === users[role].password) {
        localStorage.setItem("userRole", role);
        window.location.href = "home.html";
    } else {
        errorMessage.textContent = "Invalid username or password!";
    }
}

function logout() {
    localStorage.removeItem("userRole");
    window.location.href = "index.html";
}

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
        <li class="nav-item"><a class="nav-link" href="contact.html">Contact</a></li>
    `;

    if (userRole === "user") {
        navItems += `<li class="nav-item"><a class="nav-link" href="reservation.html">Reserve Table</a></li>`;
    } else {
        navItems += `<li class="nav-item"><a class="nav-link" href="admin_dashboard.html">Reserved Tables</a></li>`;
    }

    navItems += `<li class="nav-item"><a class="nav-link text-danger" href="#" onclick="logout()">Logout</a></li>`;
    nav.innerHTML = navItems;
}

function validateReservation(event) {
    event.preventDefault();

    let name = document.getElementById("name").value.trim();
    let email = document.getElementById("email").value.trim();
    let guests = parseInt(document.getElementById("guests").value);
    let date = document.getElementById("date").value;
    let time = document.getElementById("time").value;
    let confirmationMessage = document.getElementById("confirmationMessage");

    confirmationMessage.innerText = ""; // Clear any previous messages          

    let now = new Date();
    let today = now.toISOString().split("T")[0];
    let selectedDate = new Date(date);
    let errors = [];

    // Name validation
    if (!/^[A-Za-z\s]{3,}$/.test(name)) {
        errors.push("Please enter a valid name (only letters, min 3 characters).");
    }

    // Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push("Please enter a valid email address.");
    }

    // Date validation
    if (selectedDate.setHours(0, 0, 0, 0) < now.setHours(0, 0, 0, 0)) {
        errors.push("Please select today or a future date.");
    }

    // Time validation
    let selectedTime = new Date(`1970-01-01T${time}:00`);
    let openingTime = new Date("1970-01-01T10:00:00");
    let closingTime = new Date("1970-01-01T22:00:00");

    if (date === today) {
        let currentTime = new Date(`1970-01-01T${now.getHours()}:${now.getMinutes()}:00`);
        if (selectedTime < currentTime) {
            errors.push("Please select a time from the current time onward.");
        }
    }

    if (selectedTime < openingTime || selectedTime > closingTime) {
        errors.push("Please select a time between 10:00 AM and 10:00 PM.");
    }

    // Guests validation
    if (guests < 1 || guests > 20) {
        errors.push("Number of guests must be between 1 and 20.");
    }

    if (errors.length > 0) {
        alert(errors.join(""));
    } else {
        document.getElementById("confirmationMessage").innerText = "✅ Your table has been successfully reserved!";
        document.getElementById("reservationForm").reset();

        // Simulate successful submission
        fetch(`/cgi-bin/reservation.cgi?name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&guests=${guests}&date=${date}&time=${time}`)
            .then(response => response.text())
            .then(data => {
                confirmationMessage.innerText = "✅ Your table has been successfully reserved!";
                document.getElementById("reservationForm").reset();
            })
            .catch(error => console.error("Error:", error));
    }
}
