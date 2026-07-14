// State management
let currentLang = 'en';
let currentTheme = 'light';
let formData = {
    phone: '',
    gender: '',
    smoking: '',
    occupation: '',
    age: ''
};

// Month names in English and Malay
const monthNames = {
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    my: ['Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun', 'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember']
};

// DOM Elements
const themeToggle = document.getElementById('themeToggle');
const langToggle = document.getElementById('langToggle');
const form = document.getElementById('leadForm');
const phoneInput = document.getElementById('phone');
const optionBtns = document.querySelectorAll('.option-btn');
const occupationSelect = document.getElementById('occupation');
const ageSelect = document.getElementById('age');
const successModal = document.getElementById('successModal');
const modalClose = document.querySelector('.modal-close');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initLanguage();
    initCountdown();
    initSpotsCounter();
    initButtonSelection();
    initDropdowns();
    initInfoIcons();
    updateLogoWithMonth();
});

// Theme Toggle
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    currentTheme = savedTheme;
    applyTheme();
}

themeToggle.addEventListener('click', () => {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', currentTheme);
    applyTheme();
});

function applyTheme() {
    document.body.className = currentTheme === 'light' ? 'light-mode' : 'dark-mode';
    // Update theme toggle emoji
    themeToggle.textContent = currentTheme === 'light' ? '☀︎' : '⏾';
}

// Language Toggle
function initLanguage() {
    const savedLang = localStorage.getItem('lang') || 'en';
    currentLang = savedLang;
    applyLanguage();
}

langToggle.addEventListener('click', () => {
    currentLang = currentLang === 'en' ? 'my' : 'en';
    localStorage.setItem('lang', currentLang);
    applyLanguage();
});

function applyLanguage() {
    const elements = document.querySelectorAll('[data-en]');
    elements.forEach(el => {
        const text = el.getAttribute(`data-${currentLang}`);
        if (text) {
            if (el.tagName === 'INPUT' && el.hasAttribute('placeholder')) {
                el.placeholder = text;
            } else if (el.tagName === 'OPTION') {
                el.textContent = text;
            } else {
                // Check if element has an info-icon child to preserve it
                const infoIcon = el.querySelector('.info-icon');
                if (infoIcon) {
                    // Update only the text node before the info icon
                    const textNode = el.firstChild;
                    if (textNode && textNode.nodeType === Node.TEXT_NODE) {
                        textNode.textContent = text;
                    }
                } else {
                    el.textContent = text;
                }
            }
        }
    });
    
    // Update language toggle button text
    langToggle.textContent = currentLang === 'en' ? 'EN' : 'MY';
    
    // Update logo with current month in the correct language
    updateLogoWithMonth();
    
    // Close any open tooltips when language changes
    document.querySelectorAll('.info-tooltip').forEach(tooltip => {
        tooltip.remove();
    });
}

// Countdown Timer
function initCountdown() {
    // Set countdown to 24 hours from now (or from a fixed time)
    let endTime = localStorage.getItem('countdownEnd');
    if (!endTime) {
        endTime = new Date(Date.now() + 10 * 60 * 1000).getTime();
        localStorage.setItem('countdownEnd', endTime);
    }

    function updateCountdown() {
        const now = new Date().getTime();
        const distance = endTime - now;

        if (distance < 0) {
            // Reset countdown
            endTime = new Date(Date.now() + 10 * 60 * 1000).getTime();
            localStorage.setItem('countdownEnd', endTime);
        }

        // const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 10)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
        document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
        document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// Spots Counter
function initSpotsCounter() {
    let spots = parseInt(localStorage.getItem('spotsCount')) || 7;
    
    function updateSpots() {
        document.getElementById('spotsCount').textContent = spots;
    }

    updateSpots();

    // Randomly decrease spots occasionally to create urgency
    setInterval(() => {
        if (spots > 3 && Math.random() > 0.85) {
            spots--;
            localStorage.setItem('spotsCount', spots);
            updateSpots();
        }
    }, 30000); // Check every 30 seconds
}

// Button Selection
function initButtonSelection() {
    optionBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Don't trigger selection if clicking on info icon
            if (e.target.classList.contains('info-icon')) {
                return;
            }

            const field = btn.getAttribute('data-field');
            const value = btn.getAttribute('data-value');

            // Check if button is already selected
            if (btn.classList.contains('selected')) {
                // Unselect the button
                btn.classList.remove('selected');
                // Clear form data for this field
                formData[field] = '';
            } else {
                // Remove selected class from all buttons in the same group
                document.querySelectorAll(`[data-field="${field}"]`).forEach(b => {
                    b.classList.remove('selected');
                });

                // Add selected class to clicked button
                btn.classList.add('selected');

                // Update form data
                formData[field] = value;
            }
        });
    });
}

// Dropdown Selection
function initDropdowns() {
    if (occupationSelect) {
        occupationSelect.addEventListener('change', (e) => {
            formData.occupation = e.target.value;
        });
    }

    if (ageSelect) {
        ageSelect.addEventListener('change', (e) => {
            formData.age = e.target.value;
        });
    }
}

// Info Icons
function initInfoIcons() {
    const infoIcons = document.querySelectorAll('.info-icon');
    
    infoIcons.forEach(icon => {
        // Show tooltip on hover
        icon.addEventListener('mouseenter', (e) => {
            // Remove any existing tooltips
            document.querySelectorAll('.info-tooltip').forEach(tooltip => {
                tooltip.remove();
            });
            
            // Get the appropriate text based on current language
            const infoText = icon.getAttribute(`data-info-${currentLang}`);
            
            // Create tooltip
            const tooltip = document.createElement('div');
            tooltip.className = 'info-tooltip active';
            tooltip.textContent = infoText;
            
            // Position tooltip beside the icon using fixed positioning
            const rect = icon.getBoundingClientRect();
            tooltip.style.left = `${rect.right + 5}px`;
            tooltip.style.top = `${rect.top + (rect.height / 2) - (tooltip.offsetHeight / 2)}px`;
            
            document.body.appendChild(tooltip);
            
            // Recalculate position after tooltip is rendered to get correct height
            setTimeout(() => {
                tooltip.style.top = `${rect.top + (rect.height / 2) - (tooltip.offsetHeight / 2)}px`;
            }, 0);
            
            // Store reference to tooltip for cleanup
            icon.dataset.tooltipId = Date.now();
        });
        
        // Hide tooltip when mouse leaves
        icon.addEventListener('mouseleave', () => {
            document.querySelectorAll('.info-tooltip').forEach(tooltip => {
                tooltip.remove();
            });
        });
    });
}

// Phone Input
phoneInput.addEventListener('input', (e) => {
    formData.phone = e.target.value;
});

// Form Submission
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Get values from dropdowns
    if (occupationSelect) {
        formData.occupation = occupationSelect.value;
    }
    if (ageSelect) {
        formData.age = ageSelect.value;
    }

    // Validation
    if (!formData.phone) {
        alert(currentLang === 'en' ? 'Please enter your phone number' : 'Sila masukkan nombor telefon anda');
        return;
    }

    if (!formData.gender) {
        alert(currentLang === 'en' ? 'Please select your gender' : 'Sila pilih jantina anda');
        return;
    }

    if (!formData.smoking) {
        alert(currentLang === 'en' ? 'Please select smoking status' : 'Sila pilih status merokok');
        return;
    }

    if (!formData.occupation) {
        alert(currentLang === 'en' ? 'Please select occupation type' : 'Sila pilih jenis pekerjaan');
        return;
    }

    if (!formData.age) {
        alert(currentLang === 'en' ? 'Please select age range' : 'Sila pilih julat umur');
        return;
    }

    // Submit data
    try {
        const response = await fetch('/api/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        if (response.ok) {
            // Show success modal
            successModal.classList.add('active');
            
            // Reset form
            form.reset();
            formData = {
                phone: '',
                gender: '',
                smoking: '',
                occupation: '',
                age: ''
            };
            optionBtns.forEach(btn => btn.classList.remove('selected'));

            // Decrease spots
            let spots = parseInt(localStorage.getItem('spotsCount')) || 47;
            if (spots > 0) {
                spots--;
                localStorage.setItem('spotsCount', spots);
                document.getElementById('spotsCount').textContent = spots;
            }
        } else {
            alert(currentLang === 'en' ? 'Error submitting form. Please try again.' : 'Ralat menghantar borang. Sila cuba lagi.');
        }
    } catch (error) {
        console.error('Error:', error);
        // For demo purposes, show success even without backend
        successModal.classList.add('active');
        
        // Reset form
        form.reset();
        formData = {
            phone: '',
            gender: '',
            smoking: '',
            occupation: '',
            age: ''
        };
        optionBtns.forEach(btn => btn.classList.remove('selected'));

        // Decrease spots
        let spots = parseInt(localStorage.getItem('spotsCount')) || 47;
        if (spots > 0) {
            spots--;
            localStorage.setItem('spotsCount', spots);
            document.getElementById('spotsCount').textContent = spots;
        }
    }
});

// Modal Close
modalClose.addEventListener('click', () => {
    successModal.classList.remove('active');
});

successModal.addEventListener('click', (e) => {
    if (e.target === successModal) {
        successModal.classList.remove('active');
    }
});

// Update Logo with Current Month
function updateLogoWithMonth() {
    const logoText = document.getElementById('logoText');
    const currentMonthIndex = new Date().getMonth();
    const monthName = monthNames[currentLang][currentMonthIndex];
    
    if (currentLang === 'en') {
        logoText.textContent = `${monthName} Special Offer!`;
        logoText.setAttribute('data-en', `${monthName} Special Offer!`);
        logoText.setAttribute('data-my', `Tawaran Istimewa ${monthNames.my[currentMonthIndex]}!`);
    } else {
        logoText.textContent = `Tawaran Istimewa ${monthName}!`;
        logoText.setAttribute('data-en', `${monthNames.en[currentMonthIndex]} Special Offer!`);
        logoText.setAttribute('data-my', `Tawaran Istimewa ${monthName}!`);
    }
}
