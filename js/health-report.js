
document.addEventListener("DOMContentLoaded", () => {
    const historyKey = "medintel_prediction_history_v1";

    const button = document.getElementById("generateReportButton");
    const status = document.getElementById("reportStatus");

    function getHistory() {
        try {
            const history = JSON.parse(
                localStorage.getItem(historyKey) || "[]"
            );
            return Array.isArray(history) ? history : [];
        } catch (error) {
            console.error("Could not read prediction history:", error);
            return [];
        }
    }

    function getLatestRecord() {
        const history = getHistory();
        return history.length ? history[0] : null;
    }

    function getPredictions(record) {
        return record && Array.isArray(record.predictions)
            ? record.predictions
            : [];
    }

    function displayHistory() {
        const record = getLatestRecord();
        const predictions = getPredictions(record);
        const top = predictions[0];

        document.getElementById("latestPrediction").textContent =
            top ? (top.disease || "Unknown condition") : "No prediction available";

        const score = top?.probability;

        document.getElementById("latestProbability").textContent =
            typeof score === "number" && Number.isFinite(score)
                ? `${score.toFixed(2)}% (model estimate)`
                : "--";

        document.getElementById("reportSymptoms").textContent =
            record && Array.isArray(record.symptoms) && record.symptoms.length
                ? record.symptoms.join(", ")
                : "--";
    }

    displayHistory();

    button.addEventListener("click", async () => {
        const name = document.getElementById("patientName").value.trim();
        const ageValue = document.getElementById("patientAge").value;
        const gender = document.getElementById("patientGender").value;
        const bmiValue = document.getElementById("reportBMI").value;
        const bmiCategory =
            document.getElementById("reportBMICategory").value.trim();
        const waterIntake =
            document.getElementById("reportWater").value.trim();

        if (!name) {
            status.textContent = "Please enter the patient's name.";
            return;
        }

        if (ageValue && (
            !Number.isInteger(Number(ageValue)) ||
            Number(ageValue) < 1 ||
            Number(ageValue) > 120
        )) {
            status.textContent = "Please enter a valid age between 1 and 120.";
            return;
        }

        if (bmiValue && (
            !Number.isFinite(Number(bmiValue)) ||
            Number(bmiValue) < 1 ||
            Number(bmiValue) > 100
        )) {
            status.textContent = "Please enter a valid BMI value.";
            return;
        }

        const record = getLatestRecord();
        const predictions = getPredictions(record);

        const payload = {
            patient_name: name,
            age: ageValue || "Not provided",
            gender: gender || "Not provided",
            bmi: bmiValue ? Number(bmiValue) : null,
            bmi_category: bmiCategory,
            water_intake: waterIntake,
            predictions: predictions,
            symptoms: record && Array.isArray(record.symptoms)
                ? record.symptoms
                : []
        };

        button.disabled = true;
        status.textContent = "Generating your PDF report...";

        try {
            const response = await fetch(
                "http://127.0.0.1:5000/api/health-report",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(payload)
                }
            );

            if (!response.ok) {
                throw new Error(`Server returned status ${response.status}`);
            }

            const contentType = response.headers.get("content-type") || "";

            if (!contentType.includes("application/pdf")) {
                throw new Error("The server did not return a PDF file.");
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = url;
            link.download = "MedIntel_Health_Report.pdf";
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);

            status.textContent = "Your health report has been generated.";
        } catch (error) {
            console.error("PDF generation failed:", error);
            status.textContent =
                "Could not generate the report. Check that Flask is running and try again.";
        } finally {
            button.disabled = false;
        }
    });
});
