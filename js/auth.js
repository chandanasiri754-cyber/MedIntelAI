import { auth } from "./firebase-config.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile
} from
    "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";


const registerForm =
    document.getElementById("registerForm");


if (registerForm) {

    registerForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const name =
                document
                    .getElementById("registerName")
                    .value
                    .trim();


            const email =
                document
                    .getElementById("registerEmail")
                    .value
                    .trim();


            const password =
                document
                    .getElementById("registerPassword")
                    .value;


            const confirmPassword =
                document
                    .getElementById("confirmPassword")
                    .value;


            const message =
                document.getElementById(
                    "registerMessage"
                );


            if (password !== confirmPassword) {

                message.textContent =
                    "Passwords do not match.";

                message.style.color = "red";

                return;
            }


            if (password.length < 6) {

                message.textContent =
                    "Password must be at least 6 characters.";

                message.style.color = "red";

                return;
            }


            try {

                message.textContent =
                    "Creating account...";

                message.style.color =
                    "#1976d2";


                const userCredential =
                    await createUserWithEmailAndPassword(
                        auth,
                        email,
                        password
                    );


                const user =
                    userCredential.user;


                await updateProfile(
                    user,
                    {
                        displayName: name
                    }
                );


                message.textContent =
                    "Account created successfully!";

                message.style.color =
                    "green";


                setTimeout(function () {

                    window.location.href =
                        "dashboard.html";

                }, 1000);


            } catch (error) {

                console.error(error);


                message.textContent =
                    getFirebaseErrorMessage(
                        error.code
                    );

                message.style.color =
                    "red";
            }

        }
    );
}




const loginForm =
    document.getElementById("loginForm");


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const email =
                document
                    .getElementById("loginEmail")
                    .value
                    .trim();


            const password =
                document
                    .getElementById("loginPassword")
                    .value;


            const message =
                document.getElementById(
                    "loginMessage"
                );


            try {

                message.textContent =
                    "Logging in...";

                message.style.color =
                    "#1976d2";


                await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );


                message.textContent =
                    "Login successful!";

                message.style.color =
                    "green";


                setTimeout(function () {

                    window.location.href =
                        "dashboard.html";

                }, 700);


            } catch (error) {

                console.error(error);


                message.textContent =
                    "Invalid email or password.";

                message.style.color =
                    "red";
            }

        }
    );
}


function getFirebaseErrorMessage(code) {

    switch (code) {

        case "auth/email-already-in-use":
            return "This email is already registered.";

        case "auth/invalid-email":
            return "Please enter a valid email address.";

        case "auth/weak-password":
            return "Password is too weak.";

        case "auth/network-request-failed":
            return "Network error. Please try again.";

        default:
            return "Registration failed. Please try again.";
    }
}