flatpickr("#appointment-date", {
    dateFormat: "Y-m-d",
    minDate: "today",
    disable: [
        function(date) {
            return date.getDay() === 0;
        }
    ],
    onChange: function(selectedDates) {
        generateTimeSlots(selectedDates[0]);
    },
    disableMobile: true
});


function generateTimeSlots(selectedDate) {
    const timeSelect = document.getElementById("appointment-time");


    timeSelect.innerHTML = '<option value="">Select a Time</option>';

    if (!selectedDate) return;

    const date = new Date(selectedDate);
    const dayOfWeek = date.getDay();  // Get the day of the week (0 is Sunday, 6 is Saturday)

    let startHour, endHour;
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        startHour = 11;
        endHour = 18;
    } else if (dayOfWeek === 6) {
        startHour = 11;
        endHour = 14;
    } else {
        return;
    }

    const interval = 25;
    let currentTime = startHour * 60;
    const endTime = endHour * 60;


    while (currentTime <= endTime) {
        let hours = Math.floor(currentTime / 60);
        let minutes = currentTime % 60;
        let formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

        const option = document.createElement("option");
        option.value = formattedTime;
        option.textContent = formattedTime;
        timeSelect.appendChild(option);

        currentTime += interval;
    }
}

function showPaymentDetails() {
    const cashInfo = document.getElementById("cash-info");
    const medicalAidInfo = document.getElementById("medical-aid-info");
    const cashOption = document.getElementById("cash").checked;
    const medicalAidOption = document.getElementById("medical-aid").checked;

    if (cashOption) {
        cashInfo.style.display = "block";
        medicalAidInfo.style.display = "none";
    } else if (medicalAidOption) {
        cashInfo.style.display = "none";
        medicalAidInfo.style.display = "block";
    }
}

document.getElementById("sidebarToggle").addEventListener("click", function (event) {
    event.preventDefault();
    console.log("Sidebar toggle clicked"); // Check if the click is being captured
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("open");
});