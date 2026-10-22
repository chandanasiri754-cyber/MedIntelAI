import { initializeApp } from
    "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";

import { getAuth } from
    "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";


// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
apiKey: "AIzaSyAHMm1Da4Sx91N_fdAXGDqu4qr_wYCCpho",
authDomain: "medintelai-f431e.firebaseapp.com",
projectId: "medintelai-f431e",
storageBucket: "medintelai-f431e.firebasestorage.app",
messagingSenderId: "1095119481776",
appId: "1:1095119481776:web:4d522d33ae523c3dfec475",
measurementId: "G-F7XXTTQS3B"
};


const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

export { auth };