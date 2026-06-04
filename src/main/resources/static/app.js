// State variables
let noClickCount = 0;
let selectedActivity = '';
let selectedDate = '';
let selectedTime = '';

// DOM Elements
const screens = {
  invite: document.getElementById('screen-invite'),
  activity: document.getElementById('screen-activity'),
  datetime: document.getElementById('screen-datetime'),
  success: document.getElementById('screen-success'),
  sad: document.getElementById('screen-sad')
};

const btnYes = document.getElementById('btn-yes');
const btnNo = document.getElementById('btn-no');
const btnActivityNext = document.getElementById('btn-activity-next');
const btnSubmitDate = document.getElementById('btn-submit-date');
const btnRetry = document.getElementById('btn-retry');

const activityCards = document.querySelectorAll('.activity-card');
const dateInput = document.getElementById('date-input');
const timeInput = document.getElementById('time-input');
const datetimeForm = document.getElementById('datetime-form');

const summaryActivity = document.getElementById('summary-activity');
const summaryDate = document.getElementById('summary-date');
const summaryTime = document.getElementById('summary-time');
const heartBg = document.getElementById('heart-bg');

// Array of funny responses for the "No" button clicks
const noButtonTexts = [
  "Нет 😢",
  "Ты уверен(а)? 🥺",
  "Пожалуйста... 👉👈",
  "А если подумать? 🧐",
  "Даже за шоколадку? 🍫",
  "Последний шанс! 😤"
];

// Array of text updates for the "Yes" button to make it more appealing
const yesButtonTexts = [
  "Да! 😍",
  "Да! ❤️",
  "Да-да! 💞",
  "Сюда! 💖",
  "Точно да! 🌸",
  "Конечно! 🌟"
];

// Initialize Background Hearts
function createFloatingHeart() {
  const heart = document.createElement('div');
  heart.classList.add('floating-heart');
  
  const heartTypes = ['❤️', '💖', '💝', '💕', '💗', '🌸'];
  heart.innerText = heartTypes[Math.floor(Math.random() * heartTypes.length)];
  
  heart.style.left = Math.random() * 100 + 'vw';
  heart.style.animationDuration = Math.random() * 5 + 5 + 's'; // 5s to 10s
  heart.style.fontSize = Math.random() * 1.5 + 1 + 'rem'; // 1rem to 2.5rem
  
  heartBg.appendChild(heart);
  
  // Clean up hearts after they float away
  setTimeout(() => {
    heart.remove();
  }, 10000);
}

// Generate hearts continuously
setInterval(createFloatingHeart, 800);

// Navigation Function
function showScreen(screenKey) {
  Object.keys(screens).forEach(key => {
    screens[key].classList.remove('active');
  });
  screens[screenKey].classList.add('active');
}

// Set Min Date on Date Input to Today
const today = new Date().toISOString().split('T')[0];
dateInput.min = today;

/* --- Screen 1: Invite Logic --- */

btnNo.addEventListener('click', () => {
  noClickCount++;
  
  if (noClickCount >= 6) {
    showScreen('sad');
  } else {
    // Shrink and shift the "No" button
    const noScale = Math.max(0.55, 1 - noClickCount * 0.08);
    const noTranslate = noClickCount * 8; // Reduced translation to avoid overflow
    btnNo.style.setProperty('--no-scale', noScale);
    btnNo.style.setProperty('--no-translate-x', `${noTranslate}px`);
    btnNo.style.transform = `scale(${noScale}) translateX(${noTranslate}px)`;
    btnNo.textContent = noButtonTexts[noClickCount] || "Нет 😢";
    
    // Grow and shift the "Yes" button
    const yesScale = 1 + noClickCount * 0.08; // Reduced scaling to avoid overflow
    const yesTranslate = noClickCount * -8; // Reduced translation to avoid overflow
    btnYes.style.transform = `scale(${yesScale}) translateX(${yesTranslate}px)`;
    btnYes.textContent = yesButtonTexts[noClickCount] || "Да! 😍";

    // Wiggle animation using CSS variables for transform values
    btnNo.style.animation = 'none';
    btnNo.offsetHeight; // Trigger reflow
    btnNo.style.animation = 'wiggle 0.2s ease-in-out';
  }
});

btnYes.addEventListener('click', () => {
  showScreen('activity');
});

/* --- Screen 2: Activity Logic --- */

activityCards.forEach(card => {
  card.addEventListener('click', () => {
    // Remove selected state from all cards
    activityCards.forEach(c => c.classList.remove('selected'));
    
    // Set selected card
    card.classList.add('selected');
    selectedActivity = card.getAttribute('data-activity');
    
    // Enable Next button
    btnActivityNext.removeAttribute('disabled');
  });
});

btnActivityNext.addEventListener('click', () => {
  showScreen('datetime');
});

/* --- Screen 3: Date & Time Logic --- */

datetimeForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  selectedDate = dateInput.value;
  selectedTime = timeInput.value;
  
  if (!selectedActivity || !selectedDate || !selectedTime) {
    alert('Пожалуйста, заполните все поля!');
    return;
  }
  
  // Format Russian Date representation
  const dateObj = new Date(selectedDate);
  const formattedDate = dateObj.toLocaleDateString('ru-RU', {
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric'
  });

  // Submit response to server
  fetch('/api/save-response', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      activity: selectedActivity,
      date: selectedDate,
      time: selectedTime
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // Setup details in the final success screen
      summaryActivity.textContent = selectedActivity;
      summaryDate.textContent = formattedDate;
      summaryTime.textContent = selectedTime;
      
      showScreen('success');
      triggerConfetti();
    } else {
      alert('Упс! Не удалось записать ответ на сервер. Но свидание всё равно в силе! 😉');
    }
  })
  .catch(err => {
    console.error('API Error:', err);
    // Fallback: Show success even if server fails to write, just tell the client
    summaryActivity.textContent = selectedActivity;
    summaryDate.textContent = formattedDate;
    summaryTime.textContent = selectedTime;
    showScreen('success');
    triggerConfetti();
  });
});

/* --- Screen 5: Sad Retry Logic --- */

btnRetry.addEventListener('click', () => {
  // Reset all state variables
  noClickCount = 0;
  selectedActivity = '';
  selectedDate = '';
  selectedTime = '';
  
  // Reset buttons and positions
  btnNo.style.transform = 'scale(1) translateX(0px)';
  btnNo.style.setProperty('--no-scale', '1');
  btnNo.style.setProperty('--no-translate-x', '0px');
  btnNo.textContent = noButtonTexts[0];
  btnYes.style.transform = 'scale(1) translateX(0px)';
  btnYes.textContent = yesButtonTexts[0];
  
  // Clear selections
  activityCards.forEach(c => c.classList.remove('selected'));
  btnActivityNext.setAttribute('disabled', 'true');
  dateInput.value = '';
  
  // Clear Time Slots
  const timeSlotsContainer = document.getElementById('time-slots');
  if (timeSlotsContainer) {
    const selectedTimeSlot = timeSlotsContainer.querySelector('.time-slot.selected');
    if (selectedTimeSlot) selectedTimeSlot.classList.remove('selected');
  }
  timeInput.value = '';
  
  showScreen('invite');
});

/* --- Confetti Generator for Success Screen --- */

function triggerConfetti() {
  const colors = ['#ff758c', '#ff7eb3', '#84fab0', '#8fd3f4', '#a1c4fd', '#c2e9fb', '#fecfef'];
  
  for (let i = 0; i < 100; i++) {
    const confetti = document.createElement('div');
    confetti.classList.add('confetti');
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    
    // Randomized animation properties
    confetti.style.animationDelay = Math.random() * 2 + 's';
    confetti.style.animationDuration = Math.random() * 3 + 2 + 's'; // 2-5s
    
    const size = Math.random() * 8 + 6 + 'px';
    confetti.style.width = size;
    confetti.style.height = size;
    
    // Add shapes: squares or circles
    if (Math.random() > 0.5) {
      confetti.style.borderRadius = '50%';
    }
    
    document.body.appendChild(confetti);
    
    // Clean up confetti
    setTimeout(() => {
      confetti.remove();
    }, 5000);
  }
}

// Add wiggling style animation in JavaScript to keep style.css cleaner
const styleSheet = document.createElement("style");
styleSheet.textContent = `
@keyframes wiggle {
  0% { transform: scale(var(--no-scale, 1)) translateX(var(--no-translate-x, 0px)) rotate(0deg); }
  25% { transform: scale(var(--no-scale, 1)) translateX(var(--no-translate-x, 0px)) rotate(-8deg); }
  75% { transform: scale(var(--no-scale, 1)) translateX(var(--no-translate-x, 0px)) rotate(8deg); }
  100% { transform: scale(var(--no-scale, 1)) translateX(var(--no-translate-x, 0px)) rotate(0deg); }
}
`;
document.head.appendChild(styleSheet);

// Initialize Dynamic Time Picker Slots
function initializeTimePicker() {
  const timeSlotsContainer = document.getElementById('time-slots');
  const hiddenTimeInput = document.getElementById('time-input');
  
  if (!timeSlotsContainer || !hiddenTimeInput) return;
  
  // Generate times from 10:00 to 22:00 in 30 minute steps
  const startHour = 10;
  const endHour = 22;
  for (let hour = startHour; hour <= endHour; hour++) {
    for (let min of ['00', '30']) {
      if (hour === endHour && min === '30') break; // End at 22:00
      const timeStr = `${hour.toString().padStart(2, '0')}:${min}`;
      
      const slot = document.createElement('div');
      slot.classList.add('time-slot');
      slot.textContent = timeStr;
      slot.setAttribute('data-time', timeStr);
      
      slot.addEventListener('click', () => {
        const selected = timeSlotsContainer.querySelector('.time-slot.selected');
        if (selected) selected.classList.remove('selected');
        
        slot.classList.add('selected');
        hiddenTimeInput.value = timeStr;
      });
      
      timeSlotsContainer.appendChild(slot);
    }
  }
}

initializeTimePicker();
