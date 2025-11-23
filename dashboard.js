// ======================================
// LOG SYSTEM
// ======================================
const logs = document.getElementById("logs");
const log = (msg) => {
    const time = new Date().toLocaleTimeString();
    logs.innerHTML = `<li>${time} — ${msg}</li>` + logs.innerHTML;
};

// ======================================
// CHART INIT
// ======================================
let ctx = document.getElementById("waterChart");
let chart = new Chart(ctx, {
    type: "line",
    data: {
        labels: [],
        datasets: [
            {
                label: "Water Level (m)",
                data: [],
                borderColor: "#00eaff",
                borderWidth: 2,
                tension: 0.3,
                pointRadius: 0
            }
        ]
    },
    options: {
        responsive: true,
        scales: {
            y: { beginAtZero: true, suggestedMax: 5 },
            x: { ticks: { display: false } }
        }
    }
});

// ======================================
// THINGSPEAK SETTINGS
// ======================================
// ⚠ Replace with your real channel ID and READ API key
const channelID = 3176166;          // example: 214598 — NO QUOTES
const readAPIKey = "1D9V0Z3NNZW76XZA";             // example: "ABCD1234XYZ"

function fetchData() {
    if (!channelID || readAPIKey === "") {
        log("⚠ ThingSpeak not configured. Set channelID & readAPIKey.");
        return;
    }

    fetch(`https://api.thingspeak.com/channels/${channelID}/feeds/last.json?api_key=${readAPIKey}`)
        .then(res => res.json())
        .then(data => {
            const water = parseFloat(data.field1);
            const ship = parseInt(data.field2);
            const alert = parseInt(data.field3);

            if (!isNaN(water)) updateWater(water);
            updateShip(ship);
            updateAlert(alert);
        })
        .catch(err => {
            console.error("ThingSpeak Fetch Error:", err);
            log("⚠ Error fetching ThingSpeak");
        });
}

// Run fetch every 5 seconds
setInterval(fetchData, 5000);
fetchData();

// ======================================
// UI UPDATE FUNCTIONS
// ======================================
function updateWater(val) {
    document.getElementById("water-level-value").innerText = val.toFixed(2) + " m";

    chart.data.labels.push("");
    chart.data.datasets[0].data.push(val);
    if (chart.data.labels.length > 30) {
        chart.data.labels.shift();
        chart.data.datasets[0].data.shift();
    }
    chart.update();

    if (val < 2) updateLevelCard("Normal", "Safe", "#22ff55");
    else if (val < 3) updateLevelCard("Warning", "Medium Risk", "#ffc600");
    else updateLevelCard("Danger", "Flood Risk!", "#ff4e4e");
}

function updateLevelCard(status, msg, color) {
    document.getElementById("water-level-status").innerText = status;
    document.getElementById("alert-level").innerText = status;
    document.getElementById("alert-msg").innerText = msg;
    document.getElementById("alert-msg").style.color = color;
    document.getElementById("water-level-value").style.color = color;

    log(`Water Status → ${status}`);
}

function updateShip(val) {
    if (val === 1) {
        document.getElementById("ship-value").innerText = "Ship Detected";
        document.getElementById("ship-distance").innerText = "Nearby";
        log("Ship approaching");
    } else {
        document.getElementById("ship-value").innerText = "No Ship";
        document.getElementById("ship-distance").innerText = "—";
    }
}

function updateAlert(val) {
    if (val === 1) {
        log("Manual alert triggered from ThingSpeak");
    }
    if (val === 2) {
        log("⚠ CRITICAL FLOOD ALERT!!!");
    }
}

// ======================================
// BRIDGE CONTROLS
// ======================================
document.getElementById("btn-lift").onclick = () => log("Bridge Lifted (Manual)");
document.getElementById("btn-lower").onclick = () => log("Bridge Lowered (Manual)");
document.getElementById("send-alert-btn").onclick = () => {
    const val = document.getElementById("alert-input").value.trim();
    if (!val) {
        log("Alert not sent — empty message");
        return;
    }
    log("Custom alert sent → " + val);
    document.getElementById("alert-input").value = "";
};
function updateShip(val) {
    const shipValueEl = document.getElementById("ship-value");
    const shipDistanceEl = document.getElementById("ship-distance");
    const blip = document.getElementById("ship-blip");

    if (val === 1) {
        shipValueEl.innerText = "Ship Detected";
        shipDistanceEl.innerText = "Nearby";
        blip.style.opacity = 1;
        blip.style.transform = "translate(-50%, -50%) scale(1.5)";
        setTimeout(() => {
            blip.style.transform = "translate(-50%, -50%) scale(1)";
        }, 600);
        log("Ship approaching");
    } else {
        shipValueEl.innerText = "No Ship";
        shipDistanceEl.innerText = "—";
        blip.style.opacity = 0;
    }
    
}
