const users = {
    user: { username: "customer", password: "1234" },
    admin: { username: "admin", password: "admin123" }
};

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("user-login").addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            event.preventDefault(); 
            validateLogin("user");
        }
    });

    document.getElementById("admin-login").addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            event.preventDefault(); 
            validateLogin("admin");
        }
    });
});

function showLogin(role) {
    document.getElementById("user-login").classList.add("d-none");
    document.getElementById("admin-login").classList.add("d-none");
    document.getElementById(role + "-login").classList.remove("d-none");
}

function validateLogin(role) {
    let username = document.getElementById(role + "-username").value;
    let password = document.getElementById(role + "-password").value;
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
document.getElementById("reservationForm").addEventListener("submit", function (event) {
    event.preventDefault();
    
    let name = document.getElementById("name").value.trim();
    let email = document.getElementById("email").value.trim();
    let guests = parseInt(document.getElementById("guests").value);
    let date = document.getElementById("date").value;
    let time = document.getElementById("time").value;
    
    let now = new Date();
    let today = now.toISOString().split("T")[0];
    let selectedDate = new Date(date);
    let errorMessage = "";

    let namePattern = /^[A-Za-z\s]{3,}$/;
    if (!namePattern.test(name)) {
        errorMessage = "Please enter a valid name (only letters, min 3 characters).";
    }

    let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        errorMessage = "Please enter a valid email address.";
    }

    if (selectedDate < now.setHours(0, 0, 0, 0)) {
        errorMessage = "Please select today or a future date.";
    }

    let selectedTime = new Date(`1970-01-01T${time}:00`);
    let openingTime = new Date(`1970-01-01T10:00:00`);
    let closingTime = new Date(`1970-01-01T22:00:00`);
    
    if (date === today) {
        let currentTime = new Date(`1970-01-01T${now.getHours()}:${now.getMinutes()}:00`);
        if (selectedTime < currentTime) {
            errorMessage = "Please select a time from the current time onward.";
        }
    }

    if (selectedTime < openingTime || selectedTime > closingTime) {
        errorMessage = "Please select a time between 10:00 AM and 10:00 PM.";
    }

    if (guests < 1 || guests > 20) {
        errorMessage = "Number of guests must be between 1 and 20.";
    }

    if (errorMessage) {
        alert(errorMessage);
    } else {
        document.getElementById("confirmationMessage").innerText = "✅ Your table has been successfully reserved!";
        document.getElementById("reservationForm").reset();
    }

    let queryString = `name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&guests=${guests}&date=${date}&time=${time}`;

    fetch("/cgi-bin/reservation.cgi?" + queryString)
        .then(response => response.text())
        .then(data => {
            document.getElementById("confirmationMessage").innerText = data;
        })
        .catch(error => console.error("Error:", error));
});
