// Sample data for holidays and custom engineer unavailability
const holidays = ["2024-11-28", "2024-12-25"]; // Example holidays
const engineerAvailability = {
    "Anthony": { "unavailableDates": ["2024-11-08", "2024-12-20"] },
    "Steven": { "unavailableDates": ["2024-12-01"] },
    "James": { "unavailableDates": ["2024-11-14"] },
    "Bill": { "unavailableDates": ["2024-12-06", "2024-12-18"] },
};

let schedules = []; // Store booked consultations

// Utility function to check if a date is a weekend
function isWeekend(date) {
    const day = date.getDay();
    return day === 6 || day === 0; // 6 is Saturday, 0 is Sunday
}

// Utility function to check if a date is a holiday
function isHoliday(dateString) {
    return holidays.includes(dateString);
}

// Utility function to check if an engineer is unavailable
function isEngineerUnavailable(engineer, dateString) {
    return engineerAvailability[engineer].unavailableDates.includes(dateString);
}

// Function to render the calendar grid
function renderCalendar(month, year) {
    const calendarElement = document.getElementById('calendar');
    calendarElement.innerHTML = ''; // Clear previous calendar
    
    // Add the header row with days of the week
    const daysOfWeek = ["M", "T", "W", "T", "F", "S", "S"];
    daysOfWeek.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.classList.add('day', 'day-header');
        dayHeader.innerText = day;
        calendarElement.appendChild(dayHeader);
    });

    // Get first day of the month
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sunday, 1 = Monday, etc.
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Adjust so Monday is the first day of the week
    let startDay = firstDayOfMonth - 1;
    if (startDay < 0) startDay = 6; // Shift Sunday to the end

    // Add blank divs for days before the 1st
    for (let i = 0; i < startDay; i++) {
        const blankDay = document.createElement('div');
        blankDay.classList.add('day');
        calendarElement.appendChild(blankDay);
    }

    // Populate the calendar days
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayElement = document.createElement('div');
        dayElement.classList.add('day');
        dayElement.innerText = day;
        
        if (isWeekend(date)) {
            dayElement.classList.add('weekend');
        }

        if (isHoliday(dateString)) {
            dayElement.classList.add('holiday');
        }

        const schedule = schedules.find(s => s.date === dateString);
        if (schedule) {
            dayElement.classList.add('engagement-day');
            dayElement.innerHTML += `<br>${schedule.engineer} - ${schedule.company}`;
        }
        
        calendarElement.appendChild(dayElement);
    }
}

// Booking form logic with travel day handling
document.getElementById('booking-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const newSchedule = {
        date: formData.get('start-date'),
        engineer: formData.get('engineer'),
        company: formData.get('company'),
        size: formData.get('size'),
        type: formData.get('type'),
        duration: parseInt(formData.get('duration')),
    };

    const startDate = new Date(newSchedule.date);

    // Add the new schedule to the schedules array
    bookEngagement(newSchedule);
    
    // Re-render the calendar after booking
    renderCalendar(today.getMonth(), today.getFullYear());
});

// Function to book the engagement
function bookEngagement(schedule) {
    const startDate = new Date(schedule.date);
    for (let i = 0; i < schedule.duration; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(currentDate.getDate() + i);
        const dateString = currentDate.toISOString().split('T')[0];
        
        schedules.push({
            date: dateString,
            engineer: schedule.engineer,
            company: schedule.company,
            size: schedule.size,
            type: schedule.type,
            duration: schedule.duration
        });
    }
}

// Initial rendering of the calendar for the current month and year
const today = new Date();
renderCalendar(today.getMonth(), today.getFullYear());
