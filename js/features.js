// ==========================================
// MedIntel AI - Feature Page JavaScript
// ==========================================

// ---------- BMI Calculator ----------

function calculateBMI() {
    const height = parseFloat(document.getElementById("height").value);
    const weight = parseFloat(document.getElementById("weight").value);

    const result = document.getElementById("bmiResult");
    const category = document.getElementById("bmiCategory");

    if (!height || !weight || height <= 0 || weight <= 0) {
        result.textContent = "--";
        category.textContent = "Please enter valid height and weight.";
        return;
    }

    const heightMeters = height / 100;
    const bmi = weight / (heightMeters * heightMeters);

    result.textContent = bmi.toFixed(1);

    let bmiCategory = "";

    if (bmi < 18.5) {
        bmiCategory = "Underweight";
    } else if (bmi < 25) {
        bmiCategory = "Normal weight";
    } else if (bmi < 30) {
        bmiCategory = "Overweight";
    } else {
        bmiCategory = "Obesity range";
    }

    category.textContent = bmiCategory;
}


// ---------- Water Intake Calculator ----------

function calculateWater() {
    const weight = parseFloat(document.getElementById("waterWeight").value);
    const activity = document.getElementById("activityLevel").value;

    const result = document.getElementById("waterResult");
    const glasses = document.getElementById("waterGlasses");

    if (!weight || weight <= 0) {
        result.textContent = "--";
        glasses.textContent = "Please enter a valid weight.";
        return;
    }

    let liters = weight * 0.035;

    if (activity === "moderate") {
        liters += 0.35;
    } else if (activity === "high") {
        liters += 0.7;
    }

    result.textContent = liters.toFixed(2) + " L";

    const glassCount = Math.round(liters / 0.25);

    glasses.textContent =
        "Approximately " + glassCount + " glasses of 250 ml.";
}



 // ---------- Load Supported Symptoms ----------



const symptomsList = [
    "abdominal_pain",
    "abnormal_menstruation",
    "acidity",
    "acute_liver_failure",
    "altered_sensorium",
    "anxiety",
    "back_pain",
    "belly_pain",
    "blackheads",
    "bladder_discomfort",
    "blister",
    "blood_in_sputum",
    "bloody_stool",
    "blurred_and_distorted_vision",
    "breathlessness",
    "brittle_nails",
    "bruising",
    "burning_micturition",
    "chest_pain",
    "chills",
    "cold_hands_and_feets",
    "coma",
    "congestion",
    "constipation",
    "continuous_feel_of_urine",
    "continuous_sneezing",
    "cough",
    "cramps",
    "dark_urine",
    "dehydration",
    "depression",
    "diarrhoea",
    "dischromic _patches",
    "distention_of_abdomen",
    "dizziness",
    "drying_and_tingling_lips",
    "enlarged_thyroid",
    "excessive_hunger",
    "extra_marital_contacts",
    "family_history",
    "fast_heart_rate",
    "fatigue",
    "fluid_overload",
    "foul_smell_of urine",
    "headache",
    "high_fever",
    "hip_joint_pain",
    "history_of_alcohol_consumption",
    "increased_appetite",
    "indigestion",
    "inflammatory_nails",
    "internal_itching",
    "irregular_sugar_level",
    "irritability",
    "irritation_in_anus",
    "itching",
    "joint_pain",
    "knee_pain",
    "lack_of_concentration",
    "lethargy",
    "loss_of_appetite",
    "loss_of_balance",
    "loss_of_smell",
    "malaise",
    "mild_fever",
    "mood_swings",
    "movement_stiffness",
    "mucoid_sputum",
    "muscle_pain",
    "muscle_wasting",
    "muscle_weakness",
    "nausea",
    "neck_pain",
    "nodal_skin_eruptions",
    "obesity",
    "pain_behind_the_eyes",
    "pain_during_bowel_movements",
    "pain_in_anal_region",
    "painful_walking",
    "palpitations",
    "passage_of_gases",
    "patches_in_throat",
    "phlegm",
    "polyuria",
    "prominent_veins_on_calf",
    "puffy_face_and_eyes",
    "pus_filled_pimples",
    "receiving_blood_transfusion",
    "receiving_unsterile_injections",
    "red_sore_around_nose",
    "red_spots_over_body",
    "redness_of_eyes",
    "restlessness",
    "runny_nose",
    "rusty_sputum",
    "scurring",
    "shivering",
    "silver_like_dusting",
    "sinus_pressure",
    "skin_peeling",
    "skin_rash",
    "slurred_speech",
    "small_dents_in_nails",
    "spinning_movements",
    "spotting_ urination",
    "stiff_neck",
    "stomach_bleeding",
    "stomach_pain",
    "sunken_eyes",
    "sweating",
    "swelled_lymph_nodes",
    "swelling_joints",
    "swelling_of_stomach",
    "swollen_blood_vessels",
    "swollen_extremeties",
    "swollen_legs",
    "throat_irritation",
    "toxic_look_(typhos)",
    "ulcers_on_tongue",
    "unsteadiness",
    "visual_disturbances",
    "vomiting",
    "watering_from_eyes",
    "weakness_in_limbs",
    "weakness_of_one_body_side",
    "weight_gain",
    "weight_loss",
    "yellow_crust_ooze",
    "yellow_urine",
    "yellowing_of_eyes",
    "yellowish_skin"
];

function loadSymptoms() {
    const symptomList = document.getElementById("symptomList");
    const status = document.getElementById("symptomStatus");

    // Other feature pages do not contain this element.
    if (!symptomList) return;

    symptomList.replaceChildren();

    symptomsList.forEach(symptom => {
        const item = document.createElement("label");
        item.className = "symptom-item";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = symptom;
        checkbox.addEventListener("change", updateSelectedSymptoms);

        const name = document.createElement("span");
        name.textContent = symptom
        .replace(/_/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/\b\w/g, char => char.toUpperCase());

        item.append(checkbox, name);
        symptomList.appendChild(item);
    });

    if (status) {
        status.textContent =
            `Loaded ${symptomsList.length} supported symptoms.`;
    }

    updateSelectedSymptoms();
    const searchInput = document.getElementById("symptomSearch");

if (searchInput && !searchInput.dataset.initialized) {
    searchInput.addEventListener("input", filterSymptoms);
    searchInput.dataset.initialized = "true";
}
}

// Works whether this script loads before or after DOMContentLoaded.
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadSymptoms);
} else {
    loadSymptoms();
}


function filterSymptoms() {
    const search = document
        .getElementById("symptomSearch")
        .value
        .toLowerCase();

    const items = document.querySelectorAll(".symptom-item");

    items.forEach(item => {
        const text = item.textContent.toLowerCase();

        if (text.includes(search)) {
            item.style.display = "block";
        } else {
            item.style.display = "none";
        }
    });
}


// ---------- Selected Symptoms ----------


function updateSelectedSymptoms() {
    const checkboxes = document.querySelectorAll(
        "#symptomList input[type='checkbox']:checked"
    );

    const container = document.getElementById("selectedSymptoms");

    if (!container) return;

    container.replaceChildren();

    if (checkboxes.length === 0) {
        container.textContent = "No symptoms selected.";
        return;
    }

    checkboxes.forEach(checkbox => {
        const tag = document.createElement("span");
        tag.className = "symptom-tag";
        tag.textContent = checkbox.value;
        container.appendChild(tag);
    });
}



// ---------- Prediction Placeholder ----------

function savePredictionToHistory(data, symptoms) {
    const storageKey = "medintel_prediction_history_v1";

    try {
        const history = JSON.parse(
            localStorage.getItem(storageKey) || "[]"
        );

        const predictions = (
            data.predictions || data.results || []
        ).slice(0, 3).map(prediction => {
            const rawScore =
                prediction.probability ?? prediction.confidence;

            let probability = null;

            if (typeof rawScore === "number" &&
                Number.isFinite(rawScore)) {
                // Preserve the API's probability percentage.
                probability = rawScore <= 1
                    ? rawScore * 100
                    : rawScore;
            }

            return {
                disease: String(
                    prediction.disease ||
                    prediction.name ||
                    prediction.label ||
                    "Unknown condition"
                ),
                probability
            };
        });

        const record = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            date: new Date().toISOString(),
            symptoms: symptoms.map(String),
            predictions
        };

        history.unshift(record);

        localStorage.setItem(
            storageKey,
            JSON.stringify(history.slice(0, 100))
        );
    } catch (error) {
        // A history-saving failure must not stop predictions.
        console.error("Could not save prediction history:", error);
    }
}

async function predictDisease() {
    const checkboxes = document.querySelectorAll(
        "#symptomList input[type='checkbox']:checked"
    );

    const symptoms = Array.from(checkboxes).map(
        checkbox => checkbox.value
    );

    const resultContainer = document.getElementById("predictionResults");
    const predictButton = document.getElementById("predictButton");

    if (!resultContainer) return;

    if (symptoms.length === 0) {
        resultContainer.textContent =
            "Please select at least one symptom.";
        return;
    }

    predictButton.disabled = true;
    resultContainer.textContent = "Analyzing selected symptoms...";

    try {
        const response = await fetch(
            "https://medintelai-bz8y.onrender.com/api/predict",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ symptoms })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error || data.message ||
                `Server error: ${response.status}`
            );
        }

        // Adjust these fields to match your Flask response.
        const predictions =
            data.predictions || data.results || [];

        if (!predictions.length) {
            resultContainer.textContent =
                data.message || "No predictions were returned by the API.";
            return;
        }
        savePredictionToHistory(data, symptoms);

        resultContainer.replaceChildren();

        const heading = document.createElement("h3");
        heading.textContent = "Top Predictions";
        resultContainer.appendChild(heading);

        predictions.slice(0, 3).forEach((prediction, index) => {
            const item = document.createElement("div");
            item.className = "prediction-result";

            const name = document.createElement("strong");
            name.textContent =
                `${index + 1}. ${
                    prediction.disease ||
                    prediction.name ||
                    prediction.label ||
                    "Unknown condition"
                }`;

            const probability = document.createElement("p");
            const score =
                prediction.probability ?? prediction.confidence;

            if (typeof score === "number" && Number.isFinite(score)) {
                probability.textContent =
                    `Model score: ${
                        score <= 1
                            ? (score * 100).toFixed(1) + "%"
                            : score.toFixed(1) + "%"
                    }`;
            } else {
                probability.textContent =
                    "Model score not provided.";
            }

            item.append(name, probability);
            resultContainer.appendChild(item);
        });

    } catch (error) {
        console.error("Prediction API error:", error);

        resultContainer.textContent =
            "Could not get predictions. Check that the Flask server " +
            "is running, the API endpoint is correct, and CORS is configured. " +
            "Details: " + error.message;
    } finally {
        predictButton.disabled = false;
    }
}


// ---------- Medicine Reminder ----------

function addReminder() {

    const medicine = document.getElementById("medicineName").value;
    const dosage = document.getElementById("dosage").value;
    const time = document.getElementById("medicineTime").value;

    if (!medicine || !dosage || !time) {
        alert("Please fill in all medicine details.");
        return;
    }

    const container = document.getElementById("reminderList");

    const item = document.createElement("div");
    item.className = "reminder-item";

    item.innerHTML = `
        <div>
            <div class="reminder-name">💊 ${medicine}</div>
            <div class="reminder-time">
                ${dosage} · ${time}
            </div>
        </div>

        <button
            class="danger-btn"
            onclick="this.parentElement.remove()">
            Delete
        </button>
    `;

    container.appendChild(item);

    document.getElementById("medicineName").value = "";
    document.getElementById("dosage").value = "";
    document.getElementById("medicineTime").value = "";
}

 // ---------- AI Health Assistant ----------

async function sendMessage() {
    const input = document.getElementById("assistantInput");
    const messages = document.getElementById("chatMessages");
    const sendButton = document.querySelector(".chat-input button");

    if (!input || !messages || !sendButton) return;
    if (sendButton.disabled) return;

    const message = input.value.trim();

    if (!message) return;

    // Create and display the user's message safely.
    const userMessage = document.createElement("div");
    userMessage.className = "chat-message user-message";
    userMessage.textContent = message;
    messages.appendChild(userMessage);

    input.value = "";
    input.disabled = true;
    sendButton.disabled = true;

    const loadingMessage = document.createElement("div");
    loadingMessage.className = "chat-message bot-message";
    loadingMessage.textContent = "Thinking... Please wait.";
    messages.appendChild(loadingMessage);
    messages.scrollTop = messages.scrollHeight;

    // Keep recent conversation context in this page session.
    if (!window.medIntelConversation) {
        window.medIntelConversation = [];
    }

    const conversation = window.medIntelConversation;

    conversation.push({
        role: "user",
        content: message
    });

    // The backend accepts the latest 10 messages.
    while (conversation.length > 10) {
        conversation.shift();
    }

    try {
        const response = await fetch(
            "https://medintelai-bz8y.onrender.com/api/health-assistant",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    messages: conversation
                })
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(
                data.message || `Request failed (${response.status})`
            );
        }

        loadingMessage.textContent = data.reply;

        conversation.push({
            role: "assistant",
            content: data.reply
        });

        while (conversation.length > 10) {
            conversation.shift();
        }

    } catch (error) {
        console.error("AI Health Assistant error:", error);

        loadingMessage.textContent =
            "Unable to connect to the AI assistant. " +
            "Please check that Flask is running, your Gemini API key " +
            "is configured, and the /api/health-assistant endpoint exists.";

        // Remove the failed user message from the conversation so
        // it can be retried without corrupting the chat history.
        const lastUserIndex = conversation.length - 1;

        if (
            lastUserIndex >= 0 &&
            conversation[lastUserIndex].role === "user" &&
            conversation[lastUserIndex].content === message
        ) {
            conversation.pop();
        }

    } finally {
        input.disabled = false;
        sendButton.disabled = false;
        input.focus();
        messages.scrollTop = messages.scrollHeight;
    }
}


/* =========================================================
   MedIntel AI - Medicine Reminder
   Uses browser localStorage; runs only on medicines.html.
   ========================================================= */

(() => {
    const nameInput = document.getElementById("medicineName");

    // This file is shared with other feature pages.
    if (!nameInput) return;

    const dosageInput = document.getElementById("dosage");
    const timeInput = document.getElementById("medicineTime");
    const addButton = document.getElementById("addReminderButton");
    const reminderList = document.getElementById("reminderList");

    const STORAGE_KEY = "medintel_medicine_reminders_v1";
    const LOG_KEY = "medintel_medicine_dose_log_v1";

    let reminders = loadData(STORAGE_KEY, []);
    let doseLog = loadData(LOG_KEY, {});

    function loadData(key, fallback) {
        try {
            const stored = localStorage.getItem(key);
            return stored ? JSON.parse(stored) : fallback;
        } catch (error) {
            console.error("Could not load saved medicine data:", error);
            return fallback;
        }
    }

    function saveData() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
            localStorage.setItem(LOG_KEY, JSON.stringify(doseLog));
            return true;
        } catch (error) {
            alert("Could not save data in this browser. Check browser storage settings.");
            console.error("Could not save medicine data:", error);
            return false;
        }
    }

    function todayKey() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    function makeElement(tag, text, className) {
        const element = document.createElement(tag);
        element.textContent = text;

        if (className) element.className = className;

        return element;
    }

    function createButton(text, className, onClick) {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = text;
        button.className = className;
        button.addEventListener("click", onClick);
        return button;
    }

    function getDoseStatus(reminderId) {
        return doseLog[todayKey()]?.[reminderId] || "pending";
    }

    function setDoseStatus(reminderId, status) {
        const date = todayKey();

        if (!doseLog[date]) doseLog[date] = {};

        doseLog[date][reminderId] = status;

        if (saveData()) renderReminders();
    }

    function renderReminders() {
        reminderList.replaceChildren();

        if (reminders.length === 0) {
            reminderList.appendChild(
                makeElement(
                    "p",
                    "No medicine reminders added yet.",
                    "empty-state"
                )
            );
            return;
        }

        const sorted = [...reminders].sort((a, b) =>
            a.time.localeCompare(b.time)
        );

        sorted.forEach(reminder => {
            const card = document.createElement("div");
            card.className = "card medicine-reminder-item";

            const title = makeElement("h4", reminder.name);
            const dosage = makeElement("p", `Dosage: ${reminder.dosage}`);
            const time = makeElement("p", `Reminder time: ${reminder.time}`);

            const status = getDoseStatus(reminder.id);
            const statusText = {
                pending: "Status: Pending",
                taken: "Status: Taken",
                skipped: "Status: Skipped"
            }[status] || "Status: Pending";

            const statusElement = makeElement("p", statusText);
            statusElement.setAttribute("aria-live", "polite");

            const actions = document.createElement("div");
            actions.className = "medicine-reminder-actions";

            actions.appendChild(
                createButton("Taken", "primary-btn", () => {
                    setDoseStatus(reminder.id, "taken");
                })
            );

            actions.appendChild(
                createButton("Skipped", "primary-btn", () => {
                    setDoseStatus(reminder.id, "skipped");
                })
            );

            actions.appendChild(
                createButton("Delete", "secondary-btn", () => {
                    if (!confirm(`Delete the reminder for "${reminder.name}"?`)) {
                        return;
                    }

                    reminders = reminders.filter(item => item.id !== reminder.id);

                    // Remove this reminder's dose history.
                    Object.keys(doseLog).forEach(date => {
                        if (doseLog[date]) delete doseLog[date][reminder.id];
                    });

                    if (saveData()) renderReminders();
                })
            );

            card.append(title, dosage, time, statusElement, actions);
            reminderList.appendChild(card);
        });
    }

    function addReminder() {
        const name = nameInput.value.trim();
        const dosage = dosageInput.value.trim();
        const time = timeInput.value;

        if (!name || !dosage || !time) {
            alert("Please enter the medicine name, dosage, and reminder time.");
            return;
        }

        const reminder = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            name,
            dosage,
            time
        };

        reminders.push(reminder);

        if (!saveData()) {
            reminders = reminders.filter(item => item.id !== reminder.id);
            return;
        }

        nameInput.value = "";
        dosageInput.value = "";
        timeInput.value = "";

        renderReminders();
    }

    addButton.addEventListener("click", addReminder);

    // In-page reminders work only while this page is open.
    // Notify at most once per reminder per local calendar day.
    const notifiedToday = new Set();

    function checkDueReminders() {
        const now = new Date();
        const currentTime =
            `${String(now.getHours()).padStart(2, "0")}:` +
            `${String(now.getMinutes()).padStart(2, "0")}`;

        reminders.forEach(reminder => {
            const notificationKey = `${todayKey()}-${reminder.id}`;

            if (reminder.time !== currentTime) return;
            if (notifiedToday.has(notificationKey)) return;
            if (getDoseStatus(reminder.id) !== "pending") return;

            notifiedToday.add(notificationKey);

            alert(
                `Medicine reminder: ${reminder.name}\n` +
                `Dosage entered: ${reminder.dosage}\n` +
                `Scheduled time: ${reminder.time}\n\n` +
                "Follow your prescribed instructions. This reminder does not confirm that a dose should be taken."
            );
        });
    }

    renderReminders();
    checkDueReminders();
    setInterval(checkDueReminders, 15000);
})();

/* =========================================================
   MedIntel AI - Nearby Hospitals
   Uses OpenStreetMap Nominatim and Overpass services.
   ========================================================= */

(() => {
    const form = document.getElementById("hospitalSearchForm");

    // features.js is shared across multiple feature pages.
    if (!form) return;

    const locationInput = document.getElementById("hospitalLocation");
    const searchButton = document.getElementById("hospitalSearchButton");
    const status = document.getElementById("hospitalStatus");
    const results = document.getElementById("hospitalResults");

    const NOMINATIM_URL =
        "https://nominatim.openstreetmap.org/search";

    const OVERPASS_URL =
        "https://overpass-api.de/api/interpreter";

    let requestNumber = 0;

    function setStatus(message) {
        status.textContent = message;
    }

    function createElement(tag, text, className) {
        const element = document.createElement(tag);
        element.textContent = text;
        if (className) element.className = className;
        return element;
    }

    function addLink(parent, text, url) {
        const link = document.createElement("a");
        link.textContent = text;
        link.href = url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        parent.appendChild(link);
    }

    async function searchHospitals(location, currentRequest) {
        // Find the coordinates of the entered city or area.
        const geocodeUrl = new URL(NOMINATIM_URL);
        geocodeUrl.searchParams.set("format", "jsonv2");
        geocodeUrl.searchParams.set("q", location);
        geocodeUrl.searchParams.set("limit", "1");

        const geocodeResponse = await fetch(geocodeUrl);

        if (!geocodeResponse.ok) {
            throw new Error("Could not look up that location.");
        }

        const places = await geocodeResponse.json();

        if (currentRequest !== requestNumber) return;

        if (!places.length) {
            setStatus("Location not found. Try a more specific city or area.");
            return;
        }

        const latitude = Number(places[0].lat);
        const longitude = Number(places[0].lon);

        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
            throw new Error("The location returned invalid coordinates.");
        }

        // Search for hospitals, clinics, and doctors within approximately
        // 5 km of the selected location.
        const query = `
[out:json][timeout:25];
(
  node["amenity"~"^(hospital|clinic|doctors)$"](around:5000,${latitude},${longitude});
  way["amenity"~"^(hospital|clinic|doctors)$"](around:5000,${latitude},${longitude});
  relation["amenity"~"^(hospital|clinic|doctors)$"](around:5000,${latitude},${longitude});
);
out center tags;
`;

        const response = await fetch(OVERPASS_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
            },
            body: "data=" + encodeURIComponent(query)
        });

        if (!response.ok) {
            throw new Error("The hospital search service is temporarily unavailable.");
        }

        const data = await response.json();

        if (currentRequest !== requestNumber) return;

        const facilities = (data.elements || [])
            .map(item => {
                const lat = item.lat ?? item.center?.lat;
                const lon = item.lon ?? item.center?.lon;
                const tags = item.tags || {};

                if (!Number.isFinite(Number(lat)) ||
                    !Number.isFinite(Number(lon))) {
                    return null;
                }

                const name = tags.name ||
                    tags["name:en"] ||
                    "Unnamed healthcare facility";

                const address = [
                    tags["addr:housenumber"],
                    tags["addr:street"],
                    tags["addr:suburb"],
                    tags["addr:city"] || tags["addr:town"]
                ].filter(Boolean).join(", ");

                const typeLabels = {
                    hospital: "Hospital",
                    clinic: "Clinic",
                    doctors: "Doctor / Medical Practice"
                };

                return {
                    id: `${item.type}-${item.id}`,
                    name,
                    type: typeLabels[tags.amenity] || "Healthcare facility",
                    address,
                    latitude: Number(lat),
                    longitude: Number(lon)
                };
            })
            .filter(Boolean);

        // Avoid displaying the same facility more than once.
        const uniqueFacilities = [
            ...new Map(facilities.map(item => [item.id, item])).values()
        ];

        uniqueFacilities.sort((a, b) =>
            a.name.localeCompare(b.name)
        );

        renderFacilities(uniqueFacilities);

        setStatus(
            `${uniqueFacilities.length} healthcare facility/facilities found ` +
            "within approximately 5 km of the selected location."
        );
    }

    function renderFacilities(facilities) {
        results.replaceChildren();

        if (facilities.length === 0) {
            results.appendChild(
                createElement(
                    "p",
                    "No mapped facilities found nearby. Try another area or search using a larger city.",
                    "empty-state"
                )
            );
            return;
        }

        facilities.forEach(facility => {
            const card = document.createElement("article");
            card.className = "hospital-card";

            card.appendChild(
                createElement("h4", `🏥 ${facility.name}`)
            );

            card.appendChild(
                createElement("p", `Type: ${facility.type}`)
            );

            if (facility.address) {
                card.appendChild(
                    createElement("p", `Address: ${facility.address}`)
                );
            } else {
                card.appendChild(
                    createElement("p", "Address not available in map data.")
                );
            }

            const latitude = facility.latitude;
            const longitude = facility.longitude;

            const mapUrl =
                `https://www.openstreetmap.org/?mlat=${latitude}` +
                `&mlon=${longitude}#map=17/${latitude}/${longitude}`;

            const directionsUrl =
                `https://www.google.com/maps/dir/?api=1&destination=` +
                `${latitude}%2C${longitude}`;

            const links = document.createElement("p");
            addLink(links, "View on Map", mapUrl);
            links.appendChild(document.createTextNode(" | "));
            addLink(links, "Get Directions", directionsUrl);

            card.appendChild(links);
            results.appendChild(card);
        });

        const attribution = createElement(
            "p",
            "Map data © OpenStreetMap contributors"
        );
        attribution.style.fontSize = "0.85rem";
        results.appendChild(attribution);
    }

    form.addEventListener("submit", async event => {
        event.preventDefault();

        const location = locationInput.value.trim();

        if (!location) {
            setStatus("Please enter a city or area.");
            return;
        }

        const currentRequest = ++requestNumber;

        searchButton.disabled = true;
        searchButton.textContent = "Searching...";
        results.replaceChildren();
        setStatus("Finding the location and searching for nearby facilities...");

        try {
            await searchHospitals(location, currentRequest);
        } catch (error) {
            if (currentRequest === requestNumber) {
                setStatus(
                    "Could not complete the hospital search. Check your internet connection and try again."
                );
                results.replaceChildren();
                results.appendChild(
                    createElement(
                        "p",
                        error.message || "The search service is unavailable."
                    )
                );
                console.error("Hospital search error:", error);
            }
        } finally {
            if (currentRequest === requestNumber) {
                searchButton.disabled = false;
                searchButton.textContent = "📍 Search Hospitals";
            }
        }
    });
})();

/* ==========================================
   MedIntel AI - Prediction History
   ========================================== */

(() => {
    const historyList = document.getElementById("historyList");

    // Run only on the Prediction History page.
    if (!historyList) return;

    const status = document.getElementById("historyStatus");
    const clearButton = document.getElementById("clearHistoryButton");
    const STORAGE_KEY = "medintel_prediction_history_v1";

    function getHistory() {
        try {
            const data = JSON.parse(
                localStorage.getItem(STORAGE_KEY) || "[]"
            );
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error("History read error:", error);
            return [];
        }
    }

    function makeElement(tag, text, className) {
        const element = document.createElement(tag);
        element.textContent = text;
        if (className) element.className = className;
        return element;
    }

    function renderHistory() {
        const history = getHistory();
        historyList.replaceChildren();

        status.textContent =
            `${history.length} saved prediction record(s).`;

        clearButton.disabled = history.length === 0;

        if (history.length === 0) {
            historyList.appendChild(
                makeElement(
                    "p",
                    "No predictions saved yet. Open Disease Prediction, select symptoms, and generate a prediction first.",
                    "empty-state"
                )
            );
            return;
        }

        history.forEach(record => {
            const card = document.createElement("article");
            card.className = "history-item";

            const date = new Date(record.date);
            card.appendChild(
                makeElement(
                    "div",
                    Number.isNaN(date.getTime())
                        ? "Date unavailable"
                        : date.toLocaleString(),
                    "history-date"
                )
            );

            card.appendChild(
                makeElement(
                    "p",
                    "Symptoms: " +
                    (Array.isArray(record.symptoms)
                        ? record.symptoms.join(", ")
                        : "Not recorded")
                )
            );

            const predictions = Array.isArray(record.predictions)
                ? record.predictions
                : [];

            const list = document.createElement("ol");

            predictions.forEach(prediction => {
                const item = document.createElement("li");
                const score = prediction.probability;

                item.textContent =
                    String(prediction.disease || "Unknown condition") +
                    (typeof score === "number" && Number.isFinite(score)
                        ? ` — Model probability estimate: ${score.toFixed(2)}%`
                        : "");

                list.appendChild(item);
            });

            if (predictions.length) {
                card.appendChild(
                    makeElement("h4", "Top predicted conditions")
                );
                card.appendChild(list);
            }

            const deleteButton = makeElement(
                "button",
                "Delete Record",
                "secondary-btn"
            );
            deleteButton.type = "button";

            deleteButton.addEventListener("click", () => {
                if (!confirm("Delete this prediction record?")) return;

                const remaining = getHistory().filter(
                    item => item.id !== record.id
                );

                localStorage.setItem(
                    STORAGE_KEY,
                    JSON.stringify(remaining)
                );

                renderHistory();
            });

            card.appendChild(deleteButton);
            historyList.appendChild(card);
        });
    }

    clearButton.addEventListener("click", () => {
        if (!getHistory().length) return;

        if (!confirm("Delete all prediction history in this browser?")) {
            return;
        }

        localStorage.removeItem(STORAGE_KEY);
        renderHistory();
    });

    renderHistory();
})();


