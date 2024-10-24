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
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayElement = document.createElement('div');
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

// Utility function to find the Monday before a date, avoiding weekends
function getMondayBefore(date) {
    const dayOfWeek = date.getDay();
    const daysToSubtract = (dayOfWeek === 0) ? 6 : dayOfWeek - 1; // If Sunday, go back to the previous Monday
    const travelMonday = new Date(date.getFullYear(), date.getMonth(), date.getDate() - daysToSubtract);
    
    // Adjust if travelMonday lands on a weekend
    while (isWeekend(travelMonday)) {
        travelMonday.setDate(travelMonday.getDate() - 1);
    }
    return travelMonday;
}

// Utility function to find the Friday after a date, avoiding weekends
function getFridayAfter(date) {
    const dayOfWeek = date.getDay();
    const daysToAdd = (dayOfWeek <= 5) ? 5 - dayOfWeek : 0;
    const travelFriday = new Date(date.getFullYear(), date.getMonth(), date.getDate() + daysToAdd);
    
    // Adjust if travelFriday lands on a weekend
    while (isWeekend(travelFriday)) {
        travelFriday.setDate(travelFriday.getDate() + 1);
    }
    return travelFriday;
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

    // Onsite engagements require travel days
    if (newSchedule.type === 'On-Site') {
        const travelMonday = getMondayBefore(startDate);
        const endDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + newSchedule.duration - 1);
        const travelFriday = getFridayAfter(endDate);

        // Block travel days if they don't fall on holidays or weekends
        if (!isHoliday(travelMonday.toISOString().split('T')[0]) && !isWeekend(travelMonday)) {
            renderTravelDay(travelMonday, newSchedule.engineer, "Travel Day (Monday)");
        }

        if (!isHoliday(travelFriday.toISOString().split('T')[0]) && !isWeekend(travelFriday)) {
            renderTravelDay(travelFriday, newSchedule.engineer, "Travel Day (Friday)");
        }
    }

    // Add the new schedule to the schedules array
    bookEngagement(newSchedule);
    // Re-render the calendar after booking
    renderCalendar(today.getMonth(), today.getFullYear());
});

// Function to render a travel day
function renderTravelDay(date, engineer, label) {
    const dateString = date.toISOString().split('T')[0];
    const dayElement = document.querySelector(`[data-date='${dateString}']`);
    if (dayElement) {
        dayElement.classList.add('travel-day');
        dayElement.innerHTML += `<br>${engineer} - ${label}`;
    }
}

// Function to book the engagement
function bookEngagement(schedule) {
    const startDate = new Date(schedule.date);
    for (let i = 0; i < schedule.duration; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(currentDate.getDate() + i);
        const dateString = currentDate.toISOString().split('T')[0];
        
        // Block the actual engagement days
        const dayElement = document.querySelector(`[data-date='${dateString}']`);
        if (dayElement) {
            dayElement.classList.add('engagement-day');
            dayElement.innerHTML += `<br>${schedule.engineer} - ${schedule.company}`;
        }
    }

    // Add the schedule to the global schedules array
    schedules.push({
        date: schedule.date,
        engineer: schedule.engineer,
        company: schedule.company,
        size: schedule.size,
        type: schedule.type,
        duration: schedule.duration
    });
}

// Initial rendering of the calendar for the current month and year
const today = new Date();
renderCalendar(today.getMonth(), today.getFullYear());
