// LocaFlotte Application JavaScript

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname.split('/').pop();
    
    if (currentPage === 'dashboard.html' || currentPage === '') {
        initDashboard();
    } else if (currentPage === 'fleet.html') {
        initFleet();
    } else if (currentPage === 'new-rental.html') {
        initRentalForm();
    } else if (currentPage === 'car-detail.html') {
        initCarDetail();
    } else if (currentPage === 'add-car.html') {
        initAddCar();
    }
});

// Dashboard Functions
function initDashboard() {
    initCharts();
    initMap();
    populateRentedCars();
}

function initCharts() {
    // Revenue Chart
    const revenueCtx = document.getElementById('revenueChart');
    if (revenueCtx) {
        new Chart(revenueCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov'],
                datasets: [{
                    label: 'Revenus (DH)',
                    data: [32000, 35000, 38000, 36000, 42000, 45000, 48000, 44000, 46000, 50000, 52000],
                    borderColor: '#0a0a0a',
                    backgroundColor: 'rgba(10, 10, 10, 0.1)',
                    tension: 0.4,
                    fill: true,
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        ticks: {
                            callback: function(value) {
                                return value.toLocaleString() + ' DH';
                            }
                        }
                    }
                }
            }
        });
    }

    // Expense Chart
    const expenseCtx = document.getElementById('expenseChart');
    if (expenseCtx) {
        new Chart(expenseCtx, {
            type: 'doughnut',
            data: {
                labels: ['Maintenance', 'Carburant', 'Assurance', 'Autres'],
                datasets: [{
                    data: [45000, 38000, 42000, 17320],
                    backgroundColor: ['#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            usePointStyle: true
                        }
                    }
                }
            }
        });
    }
}

function initMap() {
    const mapElement = document.getElementById('map');
    if (!mapElement) return;

    // Initialize Leaflet map centered on Casablanca
    const map = L.map('map').setView([33.5731, -7.5898], 13);

    // Add OpenStreetMap tiles (free!)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);

    // Add markers for each car
    fleetData.forEach(car => {
        const color = car.status === 'rented' ? '#3b82f6' : '#10b981';
        const icon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="background: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
            iconSize: [20, 20]
        });

        const marker = L.marker([car.lat, car.lng], { icon: icon }).addTo(map);
        
        const popupContent = `
            <div style="font-family: system-ui; padding: 5px;">
                <strong style="font-size: 14px;">${car.model}</strong><br>
                <span style="color: #666; font-size: 12px;">${car.plate}</span><br>
                <span style="color: ${color}; font-size: 12px; font-weight: 600;">
                    ${car.status === 'rented' ? 'Loué à ' + car.renter : 'Disponible'}
                </span>
            </div>
        `;
        marker.bindPopup(popupContent);
    });
}

function populateRentedCars() {
    const grid = document.getElementById('rented-cars-grid');
    if (!grid) return;

    const rentedCars = fleetData.filter(car => car.status === 'rented');
    
    grid.innerHTML = rentedCars.map(car => `
        <div class="car-card" onclick="goToCarDetail(${car.id})">
            <img src="img/${car.image}" alt="${car.model}" class="car-image" onerror="this.src='https://via.placeholder.com/280x180/f5f5f5/999?text=Car+Image'">
            <div class="car-info">
                <h4 class="car-model">${car.model}</h4>
                <p class="car-plate">${car.plate}</p>
                <div class="car-renter-info">
                    <p class="car-renter">Loué à: ${car.renter}</p>
                    <p class="car-renter">Jusqu'au: ${car.rentalEnd}</p>
                </div>
            </div>
        </div>
    `).join('');
}

// Fleet Functions
function initFleet() {
    populateFleet('all');
}

function populateFleet(filter = 'all') {
    const grid = document.getElementById('fleet-grid');
    if (!grid) return;

    const filtered = filter === 'all' ? fleetData : fleetData.filter(car => car.status === filter);
    
    grid.innerHTML = filtered.map(car => `
        <div class="car-card" onclick="goToCarDetail(${car.id})">
            <img src="img/${car.image}" alt="${car.model}" class="car-image" onerror="this.src='https://via.placeholder.com/280x180/f5f5f5/999?text=Car+Image'">
            <div class="car-info">
                <h4 class="car-model">${car.model}</h4>
                <p class="car-plate">${car.plate}</p>
                <span class="status-badge status-${car.status}">
                    ${car.status === 'rented' ? 'Louée' : 'Disponible'}
                </span>
            </div>
        </div>
    `).join('');
}

function filterFleet(filter) {
    // Update active button
    document.querySelectorAll('.btn-filter').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Filter cars
    populateFleet(filter);
}

// Rental Form Functions
function initRentalForm() {
    populateCarSelect();
    
    const form = document.getElementById('rental-form');
    if (form) {
        form.addEventListener('submit', handleRentalSubmit);
    }

    // AI Document Upload Handler
    const aiUpload = document.getElementById('ai-documents-upload');
    if (aiUpload) {
        aiUpload.addEventListener('change', handleAIDocumentUpload);
    }
}

let uploadedAIFiles = [];

function handleAIDocumentUpload(e) {
    const files = Array.from(e.target.files);
    const preview = document.getElementById('ai-files-preview');
    const processing = document.getElementById('ai-processing');
    
    if (files.length === 0) return;

    // Show processing animation
    processing.style.display = 'block';

    // Add files to preview
    files.forEach(file => {
        uploadedAIFiles.push(file);
        const fileItem = document.createElement('div');
        fileItem.className = 'ai-file-item';
        fileItem.innerHTML = `
            <svg class="ai-file-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <span class="ai-file-name">${file.name}</span>
            <button type="button" class="ai-file-remove" onclick="removeAIFile('${file.name}')">×</button>
        `;
        preview.appendChild(fileItem);
    });

    // Simulate AI processing
    setTimeout(() => {
        processing.style.display = 'none';
        
        // Auto-fill form with extracted data (simulated)
        const form = document.getElementById('rental-form');
        const mockData = {
            name: 'Mohammed El Amrani',
            cin: 'AB123456',
            startDate: '2025-11-20',
            endDate: '2025-11-27'
        };

        // Fill form fields
        const inputs = form.querySelectorAll('input');
        inputs[0].value = mockData.name; // Name
        inputs[1].value = mockData.cin;  // CIN
        
        const dateInputs = form.querySelectorAll('input[type="date"]');
        if (dateInputs.length >= 2) {
            dateInputs[0].value = mockData.startDate;
            dateInputs[1].value = mockData.endDate;
        }

        // Show success notification
        showNotification('✅ Informations extraites avec succès!', 'success');
    }, 2500);
}

function removeAIFile(fileName) {
    uploadedAIFiles = uploadedAIFiles.filter(f => f.name !== fileName);
    const preview = document.getElementById('ai-files-preview');
    const fileItems = preview.querySelectorAll('.ai-file-item');
    fileItems.forEach(item => {
        if (item.querySelector('.ai-file-name').textContent === fileName) {
            item.remove();
        }
    });
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 2rem;
        right: 2rem;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        font-weight: 600;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animations to styles
if (!document.querySelector('#notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

function populateCarSelect() {
    const select = document.getElementById('car-select');
    if (!select) return;

    const available = fleetData.filter(car => car.status === 'available');
    select.innerHTML = '<option value="">Choisir une voiture disponible...</option>' +
        available.map(car => `<option value="${car.id}">${car.model} - ${car.plate}</option>`).join('');
}

function handleRentalSubmit(e) {
    e.preventDefault();
    alert('Location enregistrée avec succès!');
    window.location.href = 'dashboard.html';
}

// Car Detail Functions
function initCarDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const carId = parseInt(urlParams.get('id'));
    
    if (carId) {
        showCarDetail(carId);
    } else {
        window.location.href = 'fleet.html';
    }
}

function goToCarDetail(carId) {
    window.location.href = `car-detail.html?id=${carId}`;
}

function showCarDetail(carId) {
    const car = fleetData.find(c => c.id === carId);
    if (!car) {
        window.location.href = 'fleet.html';
        return;
    }

    const content = document.getElementById('car-detail-content');
    if (!content) return;

    content.innerHTML = `
        <div class="detail-grid">
            <div class="detail-main">
                <div class="card">
                    <img src="img/${car.image}" alt="${car.model}" style="width: 100%; height: 300px; object-fit: cover; border-radius: 0.75rem; margin-bottom: 1.5rem;" onerror="this.src='https://via.placeholder.com/800x300/f5f5f5/999?text=Car+Image'">
                    <h2 style="font-size: 1.875rem; font-weight: 800; margin-bottom: 0.5rem;">${car.model}</h2>
                    <p style="color: #666; margin-bottom: 1rem;">${car.plate}</p>
                    <span class="status-badge status-${car.status}">
                        ${car.status === 'rented' ? 'Louée' : 'Disponible'}
                    </span>
                </div>

                <div class="card">
                    <h3 class="card-title">Statistiques Financières</h3>
                    <div class="detail-stats">
                        <div class="detail-stat">
                            <p class="detail-stat-label">Revenus Totaux</p>
                            <p class="detail-stat-value" style="color: #10b981;">${car.revenue.toLocaleString()} DH</p>
                        </div>
                        <div class="detail-stat">
                            <p class="detail-stat-label">Dépenses</p>
                            <p class="detail-stat-value" style="color: #ef4444;">${car.expenses.toLocaleString()} DH</p>
                        </div>
                        <div class="detail-stat">
                            <p class="detail-stat-label">Bénéfice</p>
                            <p class="detail-stat-value" style="color: #3b82f6;">${(car.revenue - car.expenses).toLocaleString()} DH</p>
                        </div>
                    </div>
                    <div class="chart-container" style="margin-top: 2rem;">
                        <canvas id="carRevenueChart"></canvas>
                    </div>
                </div>

                <div class="card">
                    <h3 class="card-title">Calendrier de Location</h3>
                    <div class="calendar-section">
                        ${generateCarCalendar(car)}
                    </div>
                </div>
            </div>

            <div class="detail-sidebar">
                <div class="card">
                    <h3 class="card-title">Localisation</h3>
                    <div id="car-map" style="height: 250px; border-radius: 0.75rem;"></div>
                </div>

                <div class="card">
                    <h3 class="card-title">Maintenance</h3>
                    <p class="detail-stat-label">Dernière vidange</p>
                    <p style="font-weight: 700; font-size: 1.1rem; margin-bottom: 1rem;">${car.lastMaintenance}</p>
                    <button class="btn btn-primary" onclick="openMaintenanceModal(${car.id})" style="width: 100%; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">
                        Planifier Maintenance
                    </button>
                </div>

                ${car.status === 'rented' ? `
                <div class="card">
                    <h3 class="card-title">Location Actuelle</h3>
                    <p class="detail-stat-label">Locataire</p>
                    <p style="font-weight: 700; font-size: 1.1rem;">${car.renter}</p>
                    <p class="detail-stat-label" style="margin-top: 0.75rem;">Fin de location</p>
                    <p style="font-weight: 700; font-size: 1.1rem;">${car.rentalEnd}</p>
                </div>
                ` : ''}
            </div>
        </div>
    `;

    // Initialize car-specific chart
    setTimeout(() => {
        const ctx = document.getElementById('carRevenueChart');
        if (ctx) {
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov'],
                    datasets: [{
                        label: 'Revenus',
                        data: Array.from({length: 11}, () => Math.floor(Math.random() * 5000) + 2000),
                        backgroundColor: 'rgba(16, 185, 129, 0.8)',
                        borderWidth: 0
                    }, {
                        label: 'Dépenses',
                        data: Array.from({length: 11}, () => Math.floor(Math.random() * 2000) + 500),
                        backgroundColor: 'rgba(239, 68, 68, 0.8)',
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }

        // Initialize car map
        const carMapElement = document.getElementById('car-map');
        if (carMapElement) {
            const carMap = L.map('car-map').setView([car.lat, car.lng], 15);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(carMap);
            
            L.marker([car.lat, car.lng]).addTo(carMap)
                .bindPopup(`<strong>${car.model}</strong><br>${car.plate}`)
                .openPopup();
        }
    }, 100);
}

function generateCarCalendar(car) {
    // Initialize calendar state if not exists
    if (!window.calendarState) {
        window.calendarState = {
            currentMonth: 10, // November (0-indexed)
            currentYear: 2025
        };
    }
    
    const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    const days = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
    
    const month = window.calendarState.currentMonth;
    const year = window.calendarState.currentYear;
    
    // Get first day of month and total days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDay = firstDay === 0 ? 6 : firstDay - 1; // Adjust for Monday start
    
    let html = `
        <div class="unified-calendar">
            <div class="calendar-header">
                <button class="calendar-nav-btn" onclick="changeMonth(${car.id}, -1)">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 1.25rem; height: 1.25rem;">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                    </svg>
                </button>
                <h4 class="calendar-title">${monthNames[month]} ${year}</h4>
                <button class="calendar-nav-btn" onclick="changeMonth(${car.id}, 1)">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 1.25rem; height: 1.25rem;">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                    </svg>
                </button>
            </div>
            <div class="calendar-grid">
                ${days.map(d => `<div class="calendar-day header">${d}</div>`).join('')}
                ${Array.from({length: startDay}, () => '<div class="calendar-day empty"></div>').join('')}
                ${Array.from({length: daysInMonth}, (_, i) => {
                    const day = i + 1;
                    const isRented = Math.random() > 0.6;
                    const isMaintenance = day === 15;
                    const isToday = month === 10 && year === 2025 && day === 19;
                    
                    let className = 'calendar-day';
                    if (isMaintenance) className += ' maintenance';
                    else if (isRented) className += ' rented';
                    if (isToday) className += ' today';
                    
                    return `<div class="${className}">${day}</div>`;
                }).join('')}
            </div>
            <div class="calendar-legend">
                <span class="legend-item">
                    <span class="legend-color" style="background: #dbeafe;"></span> Louée
                </span>
                <span class="legend-item">
                    <span class="legend-color" style="background: #fed7aa;"></span> Maintenance
                </span>
                <span class="legend-item">
                    <span class="legend-color" style="background: #10b981;"></span> Aujourd'hui
                </span>
            </div>
        </div>
    `;
    
    return html;
}

function changeMonth(carId, direction) {
    if (!window.calendarState) {
        window.calendarState = {
            currentMonth: 10,
            currentYear: 2025
        };
    }
    
    window.calendarState.currentMonth += direction;
    
    if (window.calendarState.currentMonth > 11) {
        window.calendarState.currentMonth = 0;
        window.calendarState.currentYear++;
    } else if (window.calendarState.currentMonth < 0) {
        window.calendarState.currentMonth = 11;
        window.calendarState.currentYear--;
    }
    
    // Refresh car detail to show updated calendar
    showCarDetail(carId);
}

// Add Car Functions
function initAddCar() {
    const form = document.getElementById('add-car-form');
    const imageUpload = document.getElementById('car-image-upload');
    const imagePreview = document.getElementById('image-preview');
    
    // Handle image upload preview
    if (imageUpload) {
        imageUpload.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    imagePreview.innerHTML = `
                        <div class="preview-image-container">
                            <img src="${event.target.result}" alt="Preview" style="max-width: 100%; height: auto; border-radius: 0.5rem;">
                            <button type="button" class="remove-preview-btn" onclick="removeCarImagePreview()">×</button>
                        </div>
                    `;
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Handle form submission
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const formData = new FormData(form);
            const newCar = {
                id: fleetData.length + 1,
                model: form.elements[0].value,
                plate: form.elements[1].value,
                status: form.elements[2].value,
                lastMaintenance: form.elements[3].value,
                lat: parseFloat(form.elements[4].value),
                lng: parseFloat(form.elements[5].value),
                revenue: parseFloat(form.elements[6].value),
                expenses: parseFloat(form.elements[7].value),
                image: 'hyundai-tucson.jpg' // Default image
            };
            
            // Add to fleet data (in a real app, this would be saved to backend)
            fleetData.push(newCar);
            
            // Show success notification
            showNotification('Voiture ajoutée avec succès!', 'success');
            
            // Reset form
            form.reset();
            imagePreview.innerHTML = '';
            
            // Redirect to fleet page after 1.5 seconds
            setTimeout(() => {
                window.location.href = 'fleet.html';
            }, 1500);
        });
    }
}

function removeCarImagePreview() {
    const imagePreview = document.getElementById('image-preview');
    const imageUpload = document.getElementById('car-image-upload');
    if (imagePreview) imagePreview.innerHTML = '';
    if (imageUpload) imageUpload.value = '';
}

// Maintenance Scheduling Functions
function openMaintenanceModal(carId) {
    const car = fleetData.find(c => c.id === carId);
    if (!car) return;
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">Planifier Maintenance - ${car.model}</h3>
                <button class="modal-close" onclick="closeMaintenanceModal()">×</button>
            </div>
            <div class="modal-body">
                <form id="maintenance-form">
                    <div class="form-group">
                        <label class="form-label">Type de Maintenance</label>
                        <select class="form-input" id="maintenance-type" required>
                            <option value="">Sélectionner le type</option>
                            <option value="vidange">Vidange d'huile</option>
                            <option value="freins">Freins</option>
                            <option value="pneus">Pneus</option>
                            <option value="revision">Révision complète</option>
                            <option value="autre">Autre</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Date Prévue</label>
                        <input type="date" class="form-input" id="maintenance-date" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Notes (optionnel)</label>
                        <textarea class="form-input" id="maintenance-notes" rows="3" placeholder="Notes supplémentaires..."></textarea>
                    </div>
                    <div class="modal-actions">
                        <button type="button" class="btn btn-secondary" onclick="closeMaintenanceModal()">Annuler</button>
                        <button type="submit" class="btn btn-primary">Planifier</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Handle form submission
    const form = document.getElementById('maintenance-form');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        scheduleMaintenance(carId);
    });
    
    // Add animation
    setTimeout(() => modal.classList.add('active'), 10);
}

function closeMaintenanceModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }
}

function scheduleMaintenance(carId) {
    const type = document.getElementById('maintenance-type').value;
    const date = document.getElementById('maintenance-date').value;
    const notes = document.getElementById('maintenance-notes').value;
    
    // In a real app, this would save to backend
    showNotification(`Maintenance planifiée pour ${date}`, 'success');
    closeMaintenanceModal();
    
    // Optionally reload car detail to show updated info
    setTimeout(() => {
        showCarDetail(carId);
    }, 500);
}
