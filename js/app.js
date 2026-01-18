let map;
let currentMarker = null;
let userFullName = null;
let userId = null;
let favoritePointIds = [];
let currentView = 'all';
ymaps.ready(initMap);
function initMap() {
    map = new ymaps.Map('map', {
        center: [55.7558, 37.6176],
        zoom: 10,
        controls: ['zoomControl', 'fullscreenControl']
    });
    document.querySelector('.sidebar').innerHTML = `
        <div class="sidebar-header">
            <h2><a href="https://data.mos.ru/opendata/1581?isRecommendationData=false&pageSize=50&pageIndex=0&isDynamic=false" target="_blank">Организации Москвы</a></h2>
            <div class="sidebar-subtitle">Карта социальных объектов</div>
        </div>
        <div class="search-section">
            <div class="search-container">
                <input id="searchInput" type="text" placeholder="Поиск организаций...">
                <button id="filterToggleBtn" onclick="toggleFilters()">
                    <i class="fas fa-sliders-h"></i>
                </button>
            </div>
            <div id="filtersContainer" style="display: none;">
                <select id="categoryFilter">
                    <option value="">Все категории товаров</option>
                </select>
                <select id="holderFilter">
                    <option value="">Все категории льготников</option>
                </select>
                <select id="admAreaFilter">
                    <option value="">Все округа</option>
                </select>
                <select id="districtFilter">
                    <option value="">Все районы</option>
                </select>
                <label>
                    <input type="checkbox" id="openNowFilter" onchange="loadOrganizations()"> Работают сейчас
                </label>
            </div>
        </div>
        <div id="viewTitle" style="padding: 18px 24px; font-size: 20px; font-weight: 700; color: var(--text-primary); background: var(--surface); border-bottom: 1px solid var(--border);">
            Все организации
        </div>
        <div class="sidebar-content">
            <div id="viewContent">
                <div id="orgList" class="organizations-list">
                    <div class="loading-state">
                        <div class="loader"></div>
                        <p>Загрузка организаций...</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.getElementById('searchInput').addEventListener('input', loadOrganizations);
    document.getElementById('categoryFilter').addEventListener('change', loadOrganizations);
    document.getElementById('holderFilter').addEventListener('change', loadOrganizations);
    document.getElementById('admAreaFilter').addEventListener('change', loadOrganizations);
    document.getElementById('districtFilter').addEventListener('change', loadOrganizations);
    //загрузка
    loadFilters();
    loadOrganizations();
}
function toggleFilters() {
    const container = document.getElementById('filtersContainer');
    container.style.display = container.style.display === 'none' ? 'block' : 'none';
}
function loadFilters() {
    fetch('/api/points/categories')
        .then(r => r.json())
        .then(data => fillSelect('categoryFilter', data));
    const holderCategories = [
        "Члены многодетных семей",
        "Инвалиды",
        "Ветераны ВОВ, боевых действий и службы",
        "Учащиеся",
        "Герои СССР, РФ, полные кавалеры орденов Славы и Трудовой славы",
        "Студенты, ординаторы, аспиранты",
        "Беременные женщины, молодые мамы",
        "Пенсионеры и ветераны труда",
        "Иные льготные категории",
        "Нельготная категория"
    ];
    fillSelect('holderFilter', holderCategories);
    fillSelect('benefitCategoryInput', holderCategories);
    fetch('/api/points/admAreas')
        .then(r => r.json())
        .then(data => fillSelect('admAreaFilter', data));
    fetch('/api/points/districts')
        .then(r => r.json())
        .then(data => fillSelect('districtFilter', data));
}
function fillSelect(selectId, items) {
    const select = document.getElementById(selectId);
    select.innerHTML = '';
    const defaultText = {
        'categoryFilter': 'Все категории товаров',
        'holderFilter': 'Все категории льготников',
        'admAreaFilter': 'Все округа',
        'districtFilter': 'Все районы',
        'benefitCategoryInput': 'Категория льготника'
    };
    const option = document.createElement('option');
    option.value = '';
    option.textContent = defaultText[selectId] || 'Все';
    select.appendChild(option);
    items.forEach(item => {
        if (item && item.trim()) {
            const option = document.createElement('option');
            option.value = item.trim();
            option.textContent = item.trim();
            select.appendChild(option);
        }
    });
}
function isOpenNow(workingHours) {
    if (!workingHours || workingHours.includes('24:00') || workingHours.toLowerCase().includes('круглосуточно')) {
        return true;
    }
    const now = new Date();
    const mskTime = new Date(now.getTime() + 3 * 60 * 60 * 1000);
    const currentMinutes = mskTime.getUTCHours() * 60 + mskTime.getUTCMinutes();
    const parts = workingHours.split('-');
    if (parts.length !== 2) return false;
    const openParts = parts[0].trim().split(':');
    const closeParts = parts[1].trim().split(':');
    const openMinutes = parseInt(openParts[0]) * 60 + parseInt(openParts[1] || 0);
    const closeMinutes = parseInt(closeParts[0]) * 60 + parseInt(closeParts[1] || 0);
    if (closeMinutes < openMinutes) {
        return currentMinutes >= openMinutes || currentMinutes < closeMinutes;
    }
    return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
}
function loadOrganizations() {
    if (currentView === 'favorites') {
        loadFavorites();
        return;
    }
    if (currentView === 'profile') {
        showProfile();
        return;
    }
    if (currentView === 'best_offers') {
        showBestOffers();
        return;
    }
    const search = document.getElementById('searchInput').value.trim();
    const category = document.getElementById('categoryFilter').value;
    const holderCategory = document.getElementById('holderFilter').value;
    const admArea = document.getElementById('admAreaFilter').value;
    const district = document.getElementById('districtFilter').value;
    const openNowChecked = document.getElementById('openNowFilter')?.checked || false;
    let url = '/api/points?';
    if (search) url += `name=${encodeURIComponent(search)}&`;
    if (category) url += `category=${encodeURIComponent(category)}&`;
    if (holderCategory) url += `holderCategory=${encodeURIComponent(holderCategory)}&`;
    if (admArea) url += `admArea=${encodeURIComponent(admArea)}&`;
    if (district) url += `district=${encodeURIComponent(district)}&`;
    url = url.replace(/&$/, '');
    fetch(url)
        .then(r => r.json())
        .then(data => {
            let orgs = data.content || data;
            if (openNowChecked) {
                orgs = orgs.filter(org => isOpenNow(org.workingHours));
            }
            displayOrganizations(orgs);
            showAllMarkers(orgs);
        })
        .catch(error => {
            console.error('Ошибка:', error);
            document.getElementById('orgList').innerHTML = '<li style="color:red;">Ошибка загрузки данных</li>';
        });
}
function displayOrganizations(orgs) {
    const list = document.getElementById('orgList');
    list.innerHTML = '';

    if (orgs.length === 0) {
        list.innerHTML = '<li style="padding: 20px; text-align: center;">Ничего не найдено</li>';
        return;
    }
    orgs.forEach(org => {
        const isFavorite = favoritePointIds.includes(org.id);
        const openNow = isOpenNow(org.workingHours);
        const status = openNow ? '<span style="color: green; font-weight: bold;">Открыто сейчас</span>' : '<span style="color: red; font-weight: bold;">Закрыто</span>';
        const li = document.createElement('li');
        li.className = 'org-item';
        li.style.padding = '15px';
        li.style.borderBottom = '1px solid #eee';
        li.style.cursor = 'pointer';
        li.innerHTML = `
            <div class="org-name"><strong>${escapeHtml(org.name || 'Без названия')}</strong></div>
            <div class="org-category">${escapeHtml(org.category || '')}</div>
            <div class="org-address">${escapeHtml(org.address || '')}</div>
            <div class="org-working-hours">${escapeHtml(org.workingHours || 'Не указано')} — ${status}</div>
            <button style="float: right; background: none; border: none; font-size: 20px; cursor: pointer;" onclick="event.stopPropagation(); toggleFavorite(${org.id})">
                ${isFavorite ? '★' : '☆'}
            </button>
        `;
        li.addEventListener('click', () => {
            document.querySelectorAll('.org-item').forEach(item => item.classList.remove('active'));
            li.classList.add('active');
            showOrganizationOnMap(org);
        });
        list.appendChild(li);
    });
}
function showAllMarkers(orgs) {
    map.geoObjects.removeAll();
    orgs.forEach(org => {
        if (org.latitude && org.longitude) {
            const openNow = isOpenNow(org.workingHours);
            const isFavorite = favoritePointIds.includes(org.id);
            const favoriteButton = userId ? `<br><button onclick="toggleFavorite(${org.id}); return false;">${isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}</button>` : '';
            const status = openNow ? '<br><strong style="color: green;">Открыто сейчас</strong>' : '<br><strong style="color: red;">Закрыто</strong>';
            const marker = new ymaps.Placemark([org.latitude, org.longitude], {
                hintContent: org.name,
                balloonContentHeader: org.name,
                balloonContentBody: org.address + '<br>Скидка: ' + (org.maxDiscount || 0) + '%' + '<br>Время работы: ' + (org.workingHours || 'Не указано') + status + '<br>Телефон: +7 ' + (org.phone || 'Не указано') + '<br>Сайт: ' + (org.website || 'Не указан') + favoriteButton
            }, { preset: openNow ? 'islands#greenDotIcon' : 'islands#redDotIcon' });
            marker.events.add('balloonclose', clearSelection);
            map.geoObjects.add(marker);
        }
    });
}
function showOrganizationOnMap(org) {
    if (currentMarker) map.geoObjects.remove(currentMarker);
    if (org.latitude && org.longitude) {
        const openNow = isOpenNow(org.workingHours);
        const isFavorite = favoritePointIds.includes(org.id);
        const favoriteButton = userId ? `<br><button onclick="toggleFavorite(${org.id}); return false;">${isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}</button>` : '';
        const status = openNow ? '<br><strong style="color: green;">Открыто сейчас</strong>' : '<br><strong style="color: red;">Закрыто</strong>';
        currentMarker = new ymaps.Placemark([org.latitude, org.longitude], {
            hintContent: org.name,
            balloonContentHeader: org.name,
            balloonContentBody: org.address + '<br>Скидка: ' + (org.maxDiscount || 0) + '%' + '<br>Время работы: ' + (org.workingHours || 'Не указано') + status + '<br>Телефон: +7 ' + (org.phone || 'Не указано') + '<br>Сайт: ' + (org.website || 'Не указан') + favoriteButton
        }, { preset: 'islands#redIcon' });
        currentMarker.events.add('balloonclose', clearSelection);
        map.geoObjects.add(currentMarker);
        map.setCenter([org.latitude, org.longitude], 16);
        currentMarker.balloon.open();
    }
}
function clearSelection() {
    document.querySelectorAll('.org-item').forEach(item => item.classList.remove('active'));
    if (currentMarker) {
        map.geoObjects.remove(currentMarker);
        currentMarker = null;
    }
}
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
//Избранное
function toggleFavorite(pointId) {
    if (!userId) {
        openAuthModal();
        return;
    }
    fetch('/api/favorites/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userId, pointId: pointId })
    })
    .then(r => r.json())
    .then(data => {
        if (data.added) {
            if (!favoritePointIds.includes(pointId)) favoritePointIds.push(pointId);
        } else {
            favoritePointIds = favoritePointIds.filter(id => id !== pointId);
        }
        loadOrganizations();
    });
}
function loadFavorites() {
    if (!userId) return;
    fetch(`/api/favorites?userId=${userId}`)
        .then(r => r.json())
        .then(data => {
            favoritePointIds = data;
            currentView = 'favorites';
            document.getElementById('viewTitle').textContent = 'Избранное';
            loadOrganizationsFromFavorites();
        });
}
function loadOrganizationsFromFavorites() {
    const search = document.getElementById('searchInput').value.trim();
    const category = document.getElementById('categoryFilter').value;
    const holderCategory = document.getElementById('holderFilter').value;
    const admArea = document.getElementById('admAreaFilter').value;
    const district = document.getElementById('districtFilter').value;
    const openNowChecked = document.getElementById('openNowFilter')?.checked || false;
    let url = '/api/points?';
    if (search) url += `name=${encodeURIComponent(search)}&`;
    if (category) url += `category=${encodeURIComponent(category)}&`;
    if (holderCategory) url += `holderCategory=${encodeURIComponent(holderCategory)}&`;
    if (admArea) url += `admArea=${encodeURIComponent(admArea)}&`;
    if (district) url += `district=${encodeURIComponent(district)}&`;
    url = url.replace(/&$/, '');
    fetch(url)
        .then(r => r.json())
        .then(data => {
            let allOrgs = data.content || data;
            let favoriteOrgs = allOrgs.filter(org => favoritePointIds.includes(org.id));

            if (openNowChecked) {
                favoriteOrgs = favoriteOrgs.filter(org => isOpenNow(org.workingHours));
            }

            displayOrganizations(favoriteOrgs);
            showAllMarkers(favoriteOrgs);
        });
}
function showFavorites() {
    currentView = 'favorites';
    document.getElementById('viewTitle').textContent = 'Избранное';
    document.getElementById('searchInput').style.display = 'block';
    const filterButton = document.querySelector('button[onclick="toggleFilters()"]');
    if (filterButton) filterButton.style.display = 'block';
    document.getElementById('filtersContainer').style.display = 'none';
    document.getElementById('viewContent').innerHTML = `
        <ul id="orgList" style="list-style: none; padding: 0; margin: 20px 0 0 0;">
            <li style="padding: 20px; text-align: center;">Загрузка...</li>
        </ul>
    `;
    loadFavorites();
}
function showAllOrganizations() {
    currentView = 'all';
    document.getElementById('viewTitle').textContent = 'Все организации';
    document.getElementById('searchInput').style.display = 'block';
    const filterButton = document.querySelector('button[onclick="toggleFilters()"]');
    if (filterButton) filterButton.style.display = 'block';
    document.getElementById('filtersContainer').style.display = 'none';
    document.getElementById('viewContent').innerHTML = `
        <ul id="orgList" style="list-style: none; padding: 0; margin: 20px 0 0 0;">
            <li style="padding: 20px; text-align: center;">Загрузка...</li>
        </ul>
    `;
    loadOrganizations();
}
function showProfile() {
    currentView = 'profile';
    document.getElementById('viewTitle').textContent = 'Мой профиль';
    document.getElementById('searchInput').style.display = 'none';
    document.getElementById('filterToggleBtn').style.display = 'none';
    document.getElementById('filtersContainer').style.display = 'none';
    fetch(`/api/auth/me?userId=${userId}`)
        .then(r => r.json())
        .then(user => {
            document.getElementById('viewContent').innerHTML = `
                <div class="profile-content">
                    <div class="profile-header">
                        <div class="profile-avatar">
                            <i class="fas fa-user"></i>
                        </div>
                        <div class="profile-info">
                            <h3>${escapeHtml(user.fullName || 'Пользователь')}</h3>
                            <div class="profile-email">${escapeHtml(user.email)}</div>
                        </div>
                    </div>
                    <div class="profile-form">
                        <div class="form-row">
                            <label class="form-label">
                                <i class="fas fa-user-edit"></i> ФИО
                            </label>
                            <input type="text" id="editFullName" class="profile-input"
                                   value="${escapeHtml(user.fullName)}"
                                   placeholder="Введите ваше ФИО">
                        </div>
                        <div class="form-row">
                            <label class="form-label">
                                <i class="fas fa-envelope"></i> Email
                            </label>
                            <input type="email" class="profile-input"
                                   value="${escapeHtml(user.email)}" disabled>
                        </div>
                        <div class="form-row">
                            <label class="form-label">
                                <i class="fas fa-heart"></i> Категория льготника
                            </label>
                            <select id="editBenefitCategory" class="profile-select">
                                <option value="">Не указана</option>
                                <option value="Члены многодетных семей">Члены многодетных семей</option>
                                <option value="Инвалиды">Инвалиды</option>
                                <option value="Ветераны ВОВ, боевых действий и службы">Ветераны ВОВ, боевых действий и службы</option>
                                <option value="Учащиеся">Учащиеся</option>
                                <option value="Студенты, ординаторы, аспиранты">Студенты, ординаторы, аспиранты</option>
                                <option value="Пенсионеры и ветераны труда">Пенсионеры и ветераны труда</option>
                                <option value="Иные льготные категории">Иные льготные категории</option>
                            </select>
                        </div>
                        <div class="profile-buttons">
                            <button class="save-btn" onclick="saveProfile()">
                                <i class="fas fa-save"></i> Сохранить изменения
                            </button>
                        </div>
                        <div id="profileMessage"></div>
                    </div>
                </div>
            `;
            const select = document.getElementById('editBenefitCategory');
            if (user.benefitCategory) select.value = user.benefitCategory;
            map.geoObjects.removeAll();
        })
        .catch(error => {
            console.error('Ошибка загрузки профиля:', error);
            document.getElementById('viewContent').innerHTML = `
                <div class="profile-content">
                    <div class="error-message">
                        <i class="fas fa-exclamation-triangle"></i>
                        <h3>Ошибка загрузки профиля</h3>
                        <p>Попробуйте обновить страницу</p>
                    </div>
                </div>
            `;
        });
}
function saveProfile() {
    const fullName = document.getElementById('editFullName').value.trim();
    const benefitCategory = document.getElementById('editBenefitCategory').value;
    if (!fullName) {
        const message = document.getElementById('profileMessage');
        message.textContent = 'ФИО обязательно для заполнения';
        message.className = 'error';
        message.style.display = 'block';
        message.style.animation = 'none';
        setTimeout(() => {
            message.style.animation = 'slideUp 0.3s ease';
        }, 10);
        return;
    }
    fetch('/api/auth/update', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            id: userId,
            fullName: fullName,
            benefitCategory: benefitCategory
        })
    })
    .then(r => {
        if (!r.ok) {
            throw new Error('Ошибка сети');
        }
        return r.json();
    })
    .then(data => {
        const message = document.getElementById('profileMessage');
        if (data.message && data.message.includes('успешно')) {
            message.textContent = 'Данные успешно сохранены!';
            message.className = 'success';
            // Обновление имени пользователя
            userFullName = fullName;
            showUserGreeting();
            message.style.animation = 'none';
            setTimeout(() => {
                message.style.animation = 'slideUp 0.3s ease';
            }, 10);
            setTimeout(() => {
                showProfile();
            }, 2000);
        } else {
            message.textContent = data.error || 'Ошибка сохранения';
            message.className = 'error';
            message.style.animation = 'none';
            setTimeout(() => {
                message.style.animation = 'slideUp 0.3s ease';
            }, 10);
        }
        message.style.display = 'block';
    })
    .catch(error => {
        console.error('Ошибка:', error);
        const message = document.getElementById('profileMessage');
        message.textContent = 'Ошибка соединения с сервером';
        message.className = 'error';
        message.style.display = 'block';
        message.style.animation = 'none';
        setTimeout(() => {
            message.style.animation = 'slideUp 0.3s ease';
        }, 10);
    });
}
function showBestOffers() {
    if (!userId) {
        openAuthModal();
        return;
    }
    currentView = 'best_offers';
    document.getElementById('viewTitle').textContent = 'Топ-3 выгодных предложений';
    document.getElementById('searchInput').style.display = 'none';
    document.getElementById('filterToggleBtn').style.display = 'none';
    document.getElementById('filtersContainer').style.display = 'none';
    Promise.all([
        fetch('/api/points/categories').then(r => r.json()),
        fetch('/api/points/admAreas').then(r => r.json())
    ]).then(([categories, admAreas]) => {
        let categoryOptions = '<option value="">Выберите категорию</option>';
        categories.forEach(cat => {
            categoryOptions += `<option value="${cat.trim()}">${cat.trim()}</option>`;
        });
        let admAreaOptions = '<option value="">Выберите округ</option>';
        admAreas.sort();
        admAreas.forEach(area => {
            admAreaOptions += `<option value="${area}">${area}</option>`;
        });
        document.getElementById('viewContent').innerHTML = `
            <div class="top-offers-content">
                <div class="top-offers-header">
                    <h3><i class="fas fa-crown"></i> Топ-3 лучших предложений</h3>
                    <p>Найдите самые выгодные скидки в вашем районе</p>
                </div>
                <div class="top-controls">
                    <div class="control-group">
                        <label class="control-label">
                            <i class="fas fa-tags"></i> Категория товаров
                        </label>
                        <select id="bestCategorySelect" class="top-select">
                            ${categoryOptions}
                        </select>
                    </div>
                    <div class="control-group">
                        <label class="control-label">
                            <i class="fas fa-city"></i> Округ
                        </label>
                        <select id="bestAdmAreaSelect" class="top-select">
                            ${admAreaOptions}
                        </select>
                    </div>
                    <div class="control-group">
                        <label class="control-label">
                            <i class="fas fa-map-pin"></i> Район
                        </label>
                        <select id="bestDistrictSelect" class="top-select">
                            <option value="">Сначала выберите округ</option>
                        </select>
                    </div>
                    <button class="find-top-btn" onclick="findBestInDistrict()">
                        <i class="fas fa-search"></i> Найти Топ-3
                    </button>
                </div>
                <div id="bestOffersResult" class="top-results">
                    <div class="no-results">
                        <i class="fas fa-chart-line"></i>
                        <p>Выберите параметры для поиска лучших предложений</p>
                    </div>
                </div>
            </div>
        `;
        document.getElementById('bestAdmAreaSelect').addEventListener('change', () => {
            const area = document.getElementById('bestAdmAreaSelect').value;
            if (!area) {
                document.getElementById('bestDistrictSelect').innerHTML = '<option value="">Сначала выберите округ</option>';
                return;
            }
            fetch(`/api/points?admArea=${encodeURIComponent(area)}`)
                .then(r => r.json())
                .then(data => {
                    const points = data.content || data;
                    const districts = [...new Set(points.map(p => p.district).filter(d => d))].sort();
                    let options = '<option value="">Выберите район</option>';
                    districts.forEach(d => options += `<option value="${d}">${d}</option>`);
                    document.getElementById('bestDistrictSelect').innerHTML = options;
                });
        });
        map.geoObjects.removeAll();
    });
}
//Лучшее предложения
function findBestInDistrict() {
    const category = document.getElementById('bestCategorySelect').value;
    const admArea = document.getElementById('bestAdmAreaSelect').value;
    const district = document.getElementById('bestDistrictSelect').value;
    if (!category || !admArea || !district) {
        document.getElementById('bestOffersResult').innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p style="color: #e74c3c;">Выберите категорию, округ и район</p>
            </div>
        `;
        return;
    }
    document.getElementById('bestOffersResult').innerHTML = `
        <div class="loading-state">
            <div class="loader"></div>
            <p>Поиск лучших предложений...</p>
        </div>
    `;
    fetch(`/api/points?category=${encodeURIComponent(category)}&admArea=${encodeURIComponent(admArea)}&district=${encodeURIComponent(district)}`)
        .then(r => r.json())
        .then(data => {
            let points = data.content || data;
            points.sort((a, b) => {
                const aOpen = isOpenNow(a.workingHours);
                const bOpen = isOpenNow(b.workingHours);
                if (aOpen && !bOpen) return -1;
                if (!aOpen && bOpen) return 1;
                return (b.maxDiscount || 0) - (a.maxDiscount || 0);
            });
            const top3 = points.slice(0, 3);
            let html = '';
            if (top3.length === 0) {
                html = `
                    <div class="no-results">
                        <i class="fas fa-search"></i>
                        <p>В этом районе ничего не найдено</p>
                    </div>
                `;
            } else {
                html = `
                    <h4><i class="fas fa-trophy"></i> Лучшие предложения в районе</h4>
                    <div class="top-list">
                `;
                top3.forEach((p, i) => {
                    const openStatus = isOpenNow(p.workingHours) ? 'open' : 'closed';
                    const statusText = isOpenNow(p.workingHours) ? 'Открыто сейчас' : 'Закрыто';
                    const statusIcon = isOpenNow(p.workingHours) ? 'fa-clock' : 'fa-door-closed';
                    html += `
                        <div class="top-item">
                            <div class="top-rank">${i + 1}</div>
                            <div class="top-item-name">${escapeHtml(p.name)}</div>
                            <div class="top-item-details">
                                <div class="top-item-detail">
                                    <i class="fas fa-percentage"></i>
                                    <span>Скидка: <span class="top-item-discount">${p.maxDiscount || 0}%</span></span>
                                </div>
                                <div class="top-item-detail">
                                    <i class="fas ${statusIcon}"></i>
                                    <span>Статус: <span class="top-item-status ${openStatus}">${statusText}</span></span>
                                </div>
                                <div class="top-item-detail">
                                    <i class="fas fa-map-marker-alt"></i>
                                    <span>${escapeHtml(p.address)}</span>
                                </div>
                                <div class="top-item-detail">
                                    <i class="fas fa-clock"></i>
                                    <span>${escapeHtml(p.workingHours || 'Не указано')}</span>
                                </div>
                            </div>
                        </div>
                    `;
                });
                html += '</div>';
            }
            document.getElementById('bestOffersResult').innerHTML = html;
            map.geoObjects.removeAll();
            top3.forEach(p => {
                if (p.latitude && p.longitude) {
                    const icon = isOpenNow(p.workingHours) ? 'islands#greenDotIcon' : 'islands#redDotIcon';
                    const placemark = new ymaps.Placemark([p.latitude, p.longitude], {
                        hintContent: p.name,
                        balloonContent: `
                            <div style="font-family: 'Inter', sans-serif; padding: 10px;">
                                <strong style="color: #2D3047;">${p.name}</strong><br>
                                <span style="color: #27ae60; font-weight: bold;">Скидка: ${p.maxDiscount}%</span><br>
                                ${escapeHtml(p.address)}
                            </div>
                        `
                    }, {
                        preset: icon,
                        balloonShadow: false
                    });
                    map.geoObjects.add(placemark);
                }
            });
            if (top3.length > 0) {
                map.setBounds(map.geoObjects.getBounds(), { checkZoomRange: true });
            }
        })
        .catch(() => {
            document.getElementById('bestOffersResult').innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p style="color: #e74c3c;">Ошибка загрузки данных</p>
                </div>
            `;
        });
}
//Авторизация пользователя
function openAuthModal() {
    document.getElementById('authModal').style.display = 'flex';
    document.getElementById('modalTitle').textContent = 'Регистрация';
    document.getElementById('fullNameInput').style.display = 'block';
    document.getElementById('addressInput').style.display = 'block';
    document.getElementById('benefitCategoryInput').style.display = 'block';
    document.getElementById('passwordConfirmInput').style.display = 'block';
    document.getElementById('registerBtn').style.display = 'inline';
    document.getElementById('loginBtn').style.display = 'none';
    document.getElementById('switchBtn').textContent = 'У меня уже есть аккаунт';
    document.getElementById('switchBtn').onclick = switchToLogin;
}
function closeAuthModal() {
    document.getElementById('authModal').style.display = 'none';
    document.getElementById('authMessage').textContent = '';
    document.getElementById('authMessage').style.color = 'red';
}
function switchToRegister() {
    document.getElementById('modalTitle').textContent = 'Регистрация';
    document.getElementById('fullNameInput').style.display = 'block';
    document.getElementById('passwordConfirmInput').style.display = 'block';
    document.getElementById('benefitCategoryInput').style.display = 'block';
    document.getElementById('registerBtn').style.display = 'inline';
    document.getElementById('loginBtn').style.display = 'none';
    document.getElementById('switchBtn').textContent = 'У меня уже есть аккаунт';
    document.getElementById('switchBtn').onclick = switchToLogin;
}
function switchToLogin() {
    document.getElementById('modalTitle').textContent = 'Вход';
    document.getElementById('fullNameInput').style.display = 'none';
    document.getElementById('passwordConfirmInput').style.display = 'none';
    document.getElementById('benefitCategoryInput').style.display = 'none';
    document.getElementById('registerBtn').style.display = 'none';
    document.getElementById('loginBtn').style.display = 'inline';
    document.getElementById('switchBtn').textContent = 'Зарегистрироваться';
    document.getElementById('switchBtn').onclick = switchToRegister;
}
function registerUser() {
    const fullName = document.getElementById('fullNameInput').value.trim();
    const email = document.getElementById('emailInput').value.trim();
    const password = document.getElementById('passwordInput').value;
    const passwordConfirm = document.getElementById('passwordConfirmInput').value;
    const benefitCategory = document.getElementById('benefitCategoryInput').value;
    if (!fullName || !email || !password || !benefitCategory) {
        document.getElementById('authMessage').textContent = 'Все поля обязательны для заполнения';
        document.getElementById('authMessage').style.color = 'red';
        return;
    }
    if (password !== passwordConfirm) {
        document.getElementById('authMessage').textContent = 'Пароли не совпадают';
        document.getElementById('authMessage').style.color = 'red';
        return;
    }
    fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password, benefitCategory })
    })
    .then(r => r.json())
    .then(data => {
        document.getElementById('authMessage').textContent = data.message || data.error;
        document.getElementById('authMessage').style.color = data.message ? 'green' : 'red';
        if (data.message && data.message.includes('успешна')) {
            userFullName = fullName;
            userId = data.user.id;
            showUserGreeting();
            closeAuthModal();
            loadFavorites();
            loadOrganizations();
        }
    });
}
function loginUser() {
    const email = document.getElementById('emailInput').value.trim();
    const password = document.getElementById('passwordInput').value;
    if (!email || !password) {
        document.getElementById('authMessage').textContent = 'Введите email и пароль';
        return;
    }
    fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
    .then(r => r.json())
    .then(data => {
        document.getElementById('authMessage').textContent = data.message || data.error;
        document.getElementById('authMessage').style.color = data.message ? 'green' : 'red';
        if (data.message && data.message.includes('успешно') || data.message && data.message.includes('Вход выполнен')) {
            userFullName = data.user.fullName;
            userId = data.user.id;
            showUserGreeting();
            closeAuthModal();
            loadFavorites();
            loadOrganizations();
        }
    });
}
function showUserGreeting() {
    document.getElementById('authButton').style.display = 'none';
    document.getElementById('loggedInPanel').style.display = 'block';
    const now = new Date();
    const mskTime = new Date(now.getTime() + 3 * 60 * 60 * 1000);
    const hour = mskTime.getUTCHours();
    let greeting;
    if (hour >= 5 && hour < 12) greeting = "Доброе утро";
    else if (hour >= 12 && hour < 17) greeting = "Добрый день";
    else if (hour >= 17 && hour < 23) greeting = "Добрый вечер";
    else greeting = "Доброй ночи";
    document.getElementById('userName').textContent = `${greeting}, ${userFullName}!`;
}
function logout() {
    fetch('/api/auth/logout', { method: 'POST' })
        .then(() => {
            userFullName = null;
            userId = null;
            favoritePointIds = [];
            document.getElementById('authButton').style.display = 'block';
            document.getElementById('loggedInPanel').style.display = 'none';
            currentView = 'all';
            document.getElementById('viewTitle').textContent = 'Все организации';
            document.getElementById('searchInput').style.display = 'block';
            const filterButton = document.querySelector('button[onclick="toggleFilters()"]');
            if (filterButton) filterButton.style.display = 'block';
            document.getElementById('filtersContainer').style.display = 'none';
            document.getElementById('viewContent').innerHTML = `
                <ul id="orgList" style="list-style: none; padding: 0; margin: 20px 0 0 0;">
                    <li style="padding: 20px; text-align: center;">Загрузка...</li>
                </ul>
            `;
            loadOrganizations();
        });
}
function switchAuthTab(tab) {
    if (tab === 'login') {
        switchToLogin();
    } else {
        switchToRegister();
    }
}