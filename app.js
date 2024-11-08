// Wait for the DOM to load before executing the script
document.addEventListener('DOMContentLoaded', async function () {

    // Fetch South African public holidays from the Nager.Date API
    let publicHolidays = [];
    try {
        const response = await fetch('https://date.nager.at/api/v3/publicholidays/2024/ZA');
        if (response.ok) {
            publicHolidays = await response.json();
        } else {
            console.error("Failed to fetch public holidays:", response.statusText);
        }
    } catch (error) {
        console.error("Error fetching public holidays:", error);
        ;

    }
console.log(publicHolidays)
    // Convert public holidays to a list of disabled dates
    const holidayDates = publicHolidays.map(holiday => holiday.date);

    // Function to show or hide payment details based on selection
    function showPaymentDetails() {
        const cashInfo = document.getElementById("cash-info");
        const medicalAidInfo = document.getElementById("medical-aid-info");
        const cashOption = document.getElementById("cash").checked;
        const medicalAidOption = document.getElementById("medical-aid").checked;

        if (cashInfo && medicalAidInfo) {
            if (cashOption) {
                cashInfo.style.display = "block";
                medicalAidInfo.style.display = "none";
            } else if (medicalAidOption) {
                cashInfo.style.display = "none";
                medicalAidInfo.style.display = "block";
            }
        }
    }

    // Initialize flatpickr for date selection
    flatpickr("#appointment-date", {
        dateFormat: "Y-m-d",
        minDate: "today",
        disable: [
            function (date) {
                // Disable Sundays (0 represents Sunday)
                if (date.getDay() === 0) return true;

                // Check if the date matches any public holiday
                const formattedDate = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
                return holidayDates.includes(formattedDate);
            }
        ],
        onChange: function (selectedDates) {
            generateTimeSlots(selectedDates[0]);
        },
        disableMobile: true
    });

    // Function to generate time slots based on selected date
    function generateTimeSlots(selectedDate) {
        const timeSelect = document.getElementById("appointment-time");
        if (!timeSelect) {
            console.error("Time select element not found");
            return;
        }

        // Reset time options
        timeSelect.innerHTML = '<option value="">Select a Time</option>';

        if (!selectedDate) return;

        const date = new Date(selectedDate);
        const dayOfWeek = date.getDay();

        let startHour, endHour;
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
            // Monday to Friday: 11:00 - 18:00
            startHour = 11;
            endHour = 18;
        } else if (dayOfWeek === 6) {
            // Saturday: 11:00 - 14:00
            startHour = 11;
            endHour = 14;
        } else {
            // No time slots available for Sundays
            return;
        }

        const interval = 15; // 15-minute interval
        let currentTime = startHour * 60;
        const endTime = endHour * 60;

        while (currentTime < endTime) {
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

    // Handle form submission
    const appointmentForm = document.querySelector('.appointment-form');
    if (appointmentForm) {
        appointmentForm.addEventListener('submit', async function (event) {
            event.preventDefault();

            const formData = new FormData(this);

            try {
                const response = await fetch('/php/send_mail.php', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    alert("Appointment booked successfully!");
                    // Reset the form
                    this.reset();
                    // Clear the time slots
                    document.getElementById("appointment-time").innerHTML = '<option value="">Select a Time</option>';
                } else {
                    alert("Failed to book appointment: " + (result.message || "Unknown error"));
                }
            } catch (error) {
                console.error("Error:", error);
                alert("An error occurred while booking your appointment.");
            }
        });
    } else {
        console.error("Appointment form not found");
    }

    // Payment method selection handler
    const cashRadio = document.getElementById('cash');
    const medicalAidRadio = document.getElementById('medical-aid');

    if (cashRadio && medicalAidRadio) {
        cashRadio.addEventListener('click', showPaymentDetails);
        medicalAidRadio.addEventListener('click', showPaymentDetails);
    }
});
