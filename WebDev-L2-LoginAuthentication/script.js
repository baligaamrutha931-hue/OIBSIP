

/* GET USERS FROM LOCAL STORAGE*/

function getUsers() {
    const users = localStorage.getItem("users");
    if (!users) {
        return [];
    }

    return JSON.parse(users);
}


/* SAVE USERS TO LOCAL STORAGE */

function saveUsers(users) {
    localStorage.setItem("users", JSON.stringify(users));
}


/*HASH PASSWORD USING SHA-256 */

async function hashPassword(password) {

    const encoder = new TextEncoder();

    const data = encoder.encode(password);

    const hashBuffer = await crypto.subtle.digest("SHA-256", data);

    const hashArray = Array.from(new Uint8Array(hashBuffer));

    const hashHex = hashArray
        .map(byte => byte.toString(16).padStart(2, "0"))
        .join("");

    return hashHex;
}


/* VALIDATE REGISTRATION*/

function validateRegistration(username, email, password, confirmPassword) {

    if (!username || !email || !password || !confirmPassword) {
        return "Please fill in all fields.";
    }

    // Basic email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
        return "Please enter a valid email address.";
    }

    if (password.length < 8) {
        return "Password must be at least 8 characters long.";
    }

    // Check for at least one number
    const numberPattern = /[0-9]/;

    if (!numberPattern.test(password)) {
        return "Password must contain at least one number.";
    }

    if (password !== confirmPassword) {
        return "Passwords do not match.";
    }

    return "";
}


/*HANDLE REGISTRATION */

async function handleRegistration(event) {

    event.preventDefault();

    const usernameInput = document.getElementById("registerUsername");
    const emailInput = document.getElementById("registerEmail");
    const passwordInput = document.getElementById("registerPassword");
    const confirmPasswordInput = document.getElementById("confirmPassword");
    const message = document.getElementById("registerMessage");

    const username = usernameInput.value.trim();
    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    // Validate input
    const validationError = validateRegistration(
        username,
        email,
        password,
        confirmPassword
    );

    if (validationError) {
        message.textContent = validationError;
        message.className = "message error";
        return;
    }

    // Get existing users
    const users = getUsers();

    // Check duplicate username or email
    const existingUser = users.find(user =>
        user.username.toLowerCase() === username.toLowerCase() ||
        user.email.toLowerCase() === email
    );

    if (existingUser) {
        message.textContent = "Username or email already exists.";
        message.className = "message error";
        return;
    }

    // Hash password before storing
    const passwordHash = await hashPassword(password);

    // Create new user
    const newUser = {
        username: username,
        email: email,
        passwordHash: passwordHash
    };

    // Add user
    users.push(newUser);

    // Save users
    saveUsers(users);

    // Show success message
    message.textContent = "Registration successful! Please login.";
    message.className = "message success";

    // Clear form
    document.getElementById("registerForm").reset();

    // Redirect to login after 1.5 seconds
    setTimeout(() => {
        window.location.href = "index.html";
    }, 1500);
}


/* HANDLE LOGIN */

async function handleLogin(event) {

    event.preventDefault();

    const identifierInput = document.getElementById("loginIdentifier");
    const passwordInput = document.getElementById("loginPassword");
    const message = document.getElementById("loginMessage");

    const identifier = identifierInput.value.trim().toLowerCase();
    const password = passwordInput.value;

    // Basic validation
    if (!identifier || !password) {
        message.textContent =
            "Please enter your username/email and password.";

        message.className = "message error";
        return;
    }

    // Get users
    const users = getUsers();

    // Find user using username OR email
    const user = users.find(currentUser =>
        currentUser.username.toLowerCase() === identifier ||
        currentUser.email.toLowerCase() === identifier
    );

    /*
    Hash the entered password.

    We still calculate the hash even when the user is not found
    so that the code does not reveal which field is incorrect.
    */

    const passwordHash = await hashPassword(password);

    // Check credentials
    if (!user || user.passwordHash !== passwordHash) {

        message.textContent = "Invalid username/email or password.";
        message.className = "message error";

        return;
    }

    // Create login session
    const loggedInUser = {
        username: user.username,
        email: user.email
    };

    localStorage.setItem(
        "loggedInUser",
        JSON.stringify(loggedInUser)
    );

    // Redirect to dashboard
    window.location.href = "dashboard.html";
}


/* CHECK AUTHENTICATION */

function checkAuthentication() {

    const loggedInUser = localStorage.getItem("loggedInUser");

    // No session found
    if (!loggedInUser) {
        window.location.href = "index.html";
        return;
    }

    try {

        const user = JSON.parse(loggedInUser);

        // Display username
        const dashboardUsername =
            document.getElementById("dashboardUsername");

        const dashboardUsernameInfo =
            document.getElementById("dashboardUsernameInfo");

        const dashboardEmail =
            document.getElementById("dashboardEmail");

        if (dashboardUsername) {
            dashboardUsername.textContent = user.username;
        }

        if (dashboardUsernameInfo) {
            dashboardUsernameInfo.textContent = user.username;
        }

        if (dashboardEmail) {
            dashboardEmail.textContent = user.email;
        }

    } catch (error) {

        // If stored session is invalid
        localStorage.removeItem("loggedInUser");

        window.location.href = "index.html";
    }
}


/* LOGOUT */

function logout() {

    // Remove current login session
    localStorage.removeItem("loggedInUser");

    // Redirect to login page
    window.location.href = "index.html";
}


/* PAGE INITIALIZATION*/

document.addEventListener("DOMContentLoaded", () => {

    /* Registration page*/

    const registerForm =
        document.getElementById("registerForm");

    if (registerForm) {
        registerForm.addEventListener(
            "submit",
            handleRegistration
        );
    }


    /* Login page */

    const loginForm =
        document.getElementById("loginForm");

    if (loginForm) {
        loginForm.addEventListener(
            "submit",
            handleLogin
        );
    }


    /* Dashboard page */

    const logoutButton =
        document.getElementById("logoutButton");

    if (logoutButton) {

        // Protect dashboard
        checkAuthentication();

        // Logout functionality
        logoutButton.addEventListener(
            "click",
            logout
        );
    }

});