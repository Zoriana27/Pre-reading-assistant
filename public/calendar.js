const icalForm = document.getElementById('ical-form');
const setupView = document.getElementById('setup-view');
const calendarView = document.getElementById('calendar-view');

icalForm.addEventListener('submit', async (e) => {
    e.preventDefault(); //Stop page reload
    const urlInput = document.getElementById('ical-url').value;
    try{
        const response = await fetch('/timetable', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ iURL: urlInput })
        });
        const data = await response.json();

        if(data.status === 'success'){
            setupView.classList.add('hidden');
            calendarView.classList.remove('hidden');
            renderCalendar(2025, 10, data.eventsByDate);
        }else{
            alert('Failed to process calendar URL.');
        }
    }catch(err){
        console.error('Error submitting timetable:', err);
        alert('Could not connect to server.');
    }
})
// Function to generate the 42 calendar cell objects
function generateCalendarCells(year, month) {
    // Convert JS Sunday-start (0) to Monday-start (0)
    const jsFirstDay = new Date(year, month, 1).getDay();
    const firstDayIndex = (jsFirstDay + 6) % 7; 

    const totalDays = new Date(year, month + 1, 0).getDate(); 
    const prevTotalDays = new Date(year, month, 0).getDate(); 

    const cells = [];

    // 1. Previous month overflow
    for (let i = firstDayIndex - 1; i >= 0; i--) {
        const prevDate = new Date(year, month - 1, prevTotalDays - i);
        cells.push({
            day: prevTotalDays - i,
            isCurrentMonth: false,
            dateString: prevDate.toISOString().split('T')[0]
        });
    }

    // 2. Current month days
    for (let i = 1; i <= totalDays; i++) {
        const currentDate = new Date(year, month, i);
        cells.push({
            day: i,
            isCurrentMonth: true,
            dateString: currentDate.toISOString().split('T')[0]
        });
    }

    // 3. Next month overflow
    const remainingCells = 42 - cells.length;
    for (let i = 1; i <= remainingCells; i++) {
        const nextDate = new Date(year, month + 1, i);
        cells.push({
            day: i,
            isCurrentMonth: false,
            dateString: nextDate.toISOString().split('T')[0]
        });
    }

    return cells;
}

// Function to render the calendar grid into HTML
function renderCalendar(year, month, eventsByDate = {}) {
    const gridContainer = document.getElementById('calendar');
    gridContainer.innerHTML = ''; // Clear existing grid

    const cells = generateCalendarCells(year, month); 

    cells.forEach(cell => {
        const cellEl = document.createElement('div');
        cellEl.classList.add('day-cell');
        if (!cell.isCurrentMonth) cellEl.classList.add('greyed-out');
        
        cellEl.dataset.date = cell.dateString;

        // Wrap day number in a span for CSS alignment
        const dayNumberEl = document.createElement('span');
        dayNumberEl.className = 'day-number';
        dayNumberEl.textContent = cell.day;
        cellEl.appendChild(dayNumberEl);

        // Render Event Pills (if events exist for this cell's date)
        const dayEvents = eventsByDate[cell.dateString] || [];
        if (dayEvents.length > 0) {
            const pill = document.createElement('div');
            pill.className = 'event-pill';
            pill.innerHTML = `<span class="badge-line"></span><span class="event-title">${dayEvents[0].course}</span>`;
            cellEl.appendChild(pill);

            if (dayEvents.length > 1) {
                const overflow = document.createElement('div');
                overflow.className = 'event-overflow';
                overflow.textContent = `+${dayEvents.length - 1} more`;
                cellEl.appendChild(overflow);
            }
        }

        gridContainer.appendChild(cellEl);
    });
}

// --- Event Listeners & Modal Handling ---

const modal = document.getElementById('lectureModal');
const modalDate = document.getElementById('modalDate');
const lectureList = document.getElementById('lectureList');
const closeModal = document.getElementById('closeModal');
const gridContainer = document.getElementById('calendar');

// Modal Click Delegate
gridContainer.addEventListener('click', async (event) => {
    const clickedCell = event.target.closest('.day-cell');
    if (!clickedCell || !clickedCell.dataset.date) return; 

    const dateClicked = clickedCell.dataset.date;
    const response = await fetch('/lectures-for-date?date=' + dateClicked);
    const lecturesToday = await response.json();

    // Update modal content
    modalDate.textContent = `Lectures for ${dateClicked}`;
    lectureList.innerHTML = ''; 

    if (lecturesToday.length === 0) {
        lectureList.innerHTML = '<li>No lectures today! 🎉</li>';
    } else {
        lecturesToday.forEach(lec => {
            const li = document.createElement('li');
            li.textContent = `${lec.time} - ${lec.course}`;
            lectureList.appendChild(li);
        });
    }

    modal.showModal();
});

closeModal.addEventListener('click', () => modal.close());

// Initial render test for May 2026 (Month index 4)
renderCalendar(2026, 4);