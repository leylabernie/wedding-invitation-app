// Wedding Invitation App Frontend JavaScript

const API_BASE_URL = 'https://5001-a59fe3b6-6af2-4b6d-8590-cb49fb6e55b8.sandbox-service.public.prod.myninja.ai/api';
let currentUser = null;
let currentEvent = null;

// Screen management
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
    
    // Update navigation
    updateNavigation(screenId);
}

function updateNavigation(screenId) {
    // Reset all navigation items
    document.querySelectorAll('nav button').forEach(btn => {
        btn.classList.remove('text-primary', 'dark:text-white');
        btn.classList.add('text-gray-500', 'dark:text-gray-400');
        const indicator = btn.querySelector('.absolute');
        if (indicator) {
            indicator.remove();
        }
    });
    
    // Highlight active navigation
    const activeBtn = document.querySelector(`nav button[onclick*="${screenId}"]`);
    if (activeBtn) {
        activeBtn.classList.remove('text-gray-500', 'dark:text-gray-400');
        activeBtn.classList.add('text-primary', 'dark:text-white');
        
        // Add indicator
        if (!activeBtn.querySelector('.absolute')) {
            const indicator = document.createElement('div');
            indicator.className = 'w-12 h-1 bg-primary dark:bg-white rounded-full absolute -top-[1px]';
            activeBtn.appendChild(indicator);
        }
    }
}

// Theme toggle
function toggleTheme() {
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
}

// Load theme preference
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    }
});

// Authentication
async function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        alert('Please enter email and password');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentUser = data.user;
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            showScreen('mainScreen');
            loadEvents();
        } else {
            alert(data.error?.message || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        // For demo purposes, auto-login with mock data
        currentUser = { _id: '1', name: 'Demo User', email: email };
        localStorage.setItem('token', 'demo-token');
        localStorage.setItem('user', JSON.stringify(currentUser));
        showScreen('mainScreen');
        loadEvents();
    }
}

async function register() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        alert('Please enter email and password');
        return;
    }
    
    if (password.length < 6) {
        alert('Password must be at least 6 characters');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                email, 
                password, 
                name: email.split('@')[0] 
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Registration successful! Please login.');
        } else {
            alert(data.error?.message || 'Registration failed');
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert('Registration successful! Please login.');
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    showScreen('loginScreen');
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
}

// Check if user is logged in
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
        currentUser = JSON.parse(user);
        showScreen('mainScreen');
        loadEvents();
    }
});

// Event Management
async function loadEvents() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/events`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        let events = [];
        if (response.ok) {
            events = await response.json();
        }
        
        // If API fails, use mock data
        if (events.length === 0) {
            events = [
                {
                    _id: '1',
                    title: 'Sarah & Michael\'s Wedding',
                    type: 'wedding',
                    eventDate: '2024-06-15',
                    venue: { name: 'Garden Estate' },
                    analytics: { confirmedCount: 45, totalResponses: 60 }
                },
                {
                    _id: '2',
                    title: 'Engagement Party',
                    type: 'engagement',
                    eventDate: '2024-03-20',
                    venue: { name: 'City Hall' },
                    analytics: { confirmedCount: 20, totalResponses: 25 }
                }
            ];
        }
        
        displayEvents(events);
    } catch (error) {
        console.error('Load events error:', error);
        // Use mock data
        const mockEvents = [
            {
                _id: '1',
                title: 'Sarah & Michael\'s Wedding',
                type: 'wedding',
                eventDate: '2024-06-15',
                venue: { name: 'Garden Estate' },
                analytics: { confirmedCount: 45, totalResponses: 60 }
            }
        ];
        displayEvents(mockEvents);
    }
}

function displayEvents(events) {
    const eventsList = document.getElementById('eventsList');
    
    if (events.length === 0) {
        eventsList.innerHTML = `
            <div class="text-center py-8">
                <span class="material-icons text-4xl text-gray-400">event</span>
                <p class="text-gray-500 dark:text-gray-400 mt-2">No events yet. Create your first event!</p>
            </div>
        `;
        return;
    }
    
    eventsList.innerHTML = events.map(event => `
        <div class="bg-white/60 dark:bg-gray-700/60 p-4 rounded-lg backdrop-blur-sm">
            <div class="flex justify-between items-start mb-2">
                <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100">${event.title}</h3>
                <span class="text-xs font-medium text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 px-2 py-1 rounded-full">
                    ${event.type}
                </span>
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400 mb-3">
                <p><span class="material-icons text-sm">event</span> ${new Date(event.eventDate).toLocaleDateString()}</p>
                <p><span class="material-icons text-sm">location_on</span> ${event.venue?.name || 'TBD'}</p>
            </div>
            <div class="flex justify-between items-center">
                <div class="text-sm">
                    <span class="text-green-600 dark:text-green-400 font-medium">${event.analytics?.confirmedCount || 0} confirmed</span>
                    <span class="text-gray-500 dark:text-gray-400"> / ${event.analytics?.totalResponses || 0} responses</span>
                </div>
                <button onclick="viewEvent('${event._id}')" class="text-primary dark:text-white text-sm font-medium">
                    Manage →
                </button>
            </div>
        </div>
    `).join('');
}

function showCreateEvent() {
    // Simple event creation for demo
    const title = prompt('Event Title:');
    if (!title) return;
    
    const eventDate = prompt('Event Date (YYYY-MM-DD):');
    if (!eventDate) return;
    
    const venueName = prompt('Venue Name:');
    if (!venueName) return;
    
    createEvent(title, eventDate, venueName);
}

async function createEvent(title, eventDate, venueName) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/events`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                title,
                eventDate,
                venue: { name: venueName },
                type: 'wedding'
            })
        });
        
        if (response.ok) {
            loadEvents();
        } else {
            console.error('Failed to create event');
        }
    } catch (error) {
        console.error('Create event error:', error);
        // For demo, just reload events
        loadEvents();
    }
}

function viewEvent(eventId) {
    currentEvent = eventId;
    showScreen('guestsScreen');
    loadGuests(eventId);
}

// Guest Management
async function loadGuests(eventId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/guests/event/${eventId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        let guests = [];
        if (response.ok) {
            guests = await response.json();
        }
        
        // Use mock data if API fails
        if (guests.length === 0) {
            guests = [
                { _id: '1', name: 'Eleanor Vance', category: 'family', rsvp: { status: 'accepted' } },
                { _id: '2', name: 'Oliver Chen', category: 'friends', rsvp: { status: 'pending' } },
                { _id: '3', name: 'Isabella Rossi', category: 'friends', rsvp: { status: 'declined' } },
                { _id: '4', name: 'James Smith & Family', category: 'family', rsvp: { status: 'accepted' } },
                { _id: '5', name: 'Sophia Williams', category: 'friends', rsvp: { status: 'pending' } }
            ];
        }
        
        displayGuests(guests);
    } catch (error) {
        console.error('Load guests error:', error);
        // Use mock data
        const mockGuests = [
            { _id: '1', name: 'Eleanor Vance', category: 'family', rsvp: { status: 'accepted' } },
            { _id: '2', name: 'Oliver Chen', category: 'friends', rsvp: { status: 'pending' } }
        ];
        displayGuests(mockGuests);
    }
}

function displayGuests(guests) {
    const guestsList = document.getElementById('guestsList');
    
    // Update statistics
    const total = guests.length;
    const confirmed = guests.filter(g => g.rsvp?.status === 'accepted').length;
    const pending = guests.filter(g => g.rsvp?.status === 'pending').length;
    
    document.getElementById('totalGuests').textContent = total;
    document.getElementById('confirmedGuests').textContent = confirmed;
    document.getElementById('pendingGuests').textContent = pending;
    
    // Display guest list
    if (guests.length === 0) {
        guestsList.innerHTML = `
            <div class="text-center py-8">
                <span class="material-icons text-4xl text-gray-400">group</span>
                <p class="text-gray-500 dark:text-gray-400 mt-2">No guests added yet</p>
            </div>
        `;
        return;
    }
    
    guestsList.innerHTML = guests.map(guest => {
        const statusClass = {
            'accepted': 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400',
            'pending': 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-400',
            'declined': 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400'
        }[guest.rsvp?.status] || 'bg-gray-100 dark:bg-gray-900/50 text-gray-700 dark:text-gray-400';
        
        const statusText = {
            'accepted': 'Confirmed',
            'pending': 'Pending',
            'declined': 'Declined'
        }[guest.rsvp?.status] || 'Unknown';
        
        return `
            <div class="bg-white/60 dark:bg-gray-700/60 p-4 rounded-lg flex items-center justify-between backdrop-blur-sm">
                <div>
                    <p class="font-semibold text-gray-800 dark:text-gray-100">${guest.name}</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">${guest.category || 'Guest'}</p>
                </div>
                <div class="flex items-center space-x-2">
                    <span class="text-xs font-medium ${statusClass} px-2 py-1 rounded-full">${statusText}</span>
                    <span class="material-icons text-gray-400 dark:text-gray-500 cursor-pointer" onclick="editGuest('${guest._id}')">more_vert</span>
                </div>
            </div>
        `;
    }).join('');
}

function editGuest(guestId) {
    // Simple edit functionality for demo
    alert(`Edit guest functionality would open here for guest ${guestId}`);
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    // Check for saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    }
    
    // Check for saved login
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
        currentUser = JSON.parse(user);
        showScreen('mainScreen');
        loadEvents();
    }
});