import { auth } from "./firebase-config.js";

import {
    onAuthStateChanged,
    signOut
} from
    "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";


const welcomeMessage =
    document.getElementById(
        "welcomeMessage"
    );


onAuthStateChanged(
    auth,
    function (user) {

        if (!user) {

            // User is not logged in
            window.location.href =
                "index.html";

            return;
        }


        const name =
            user.displayName;


        if (name) {

            welcomeMessage.textContent =
                "Welcome, " +
                name +
                "! Your intelligent health-awareness companion.";

        } else {

            welcomeMessage.textContent =
                "Welcome! Your intelligent health-awareness companion.";

        }

    }
);


const logoutButton =
    document.getElementById(
        "logoutButton"
    );


logoutButton.addEventListener(
    "click",
    async function () {

        try {

            await signOut(auth);

            window.location.href =
                "index.html";

        } catch (error) {

            console.error(
                "Logout error:",
                error
            );

            alert(
                "Unable to logout. Please try again."
            );
        }

    }
);