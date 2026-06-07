// İLİKİN VERİLƏNLƏR BAZASI (LocalStorage üzərindən Real SaaS İmitasiyası)
if (!localStorage.getItem('saasUsers')) {
    const demoUsers = [
        { name: "Ramil Əliyev", email: "ramil@gmail.com", country: "Azərbaycan, Bakı" },
        { name: "Ayan Vəliyeva", email: "ayan.v@mail.ru", country: "Azərbaycan, Gəncə" },
        { name: "John Doe", email: "john@tech.co.uk", country: "Böyük Britaniya, London" }
    ];
    localStorage.setItem('saasUsers', JSON.stringify(demoUsers));
}

if (!localStorage.getItem('saasTemplates')) {
    const demoTemplates = [
        { id: "creative", name: "Yaradıcı Krem (Zəngin)", styleClass: "cv-theme-creative", status: "Aktiv", featured: "Bəli" },
        { id: "executive", name: "Corporate Blue (Detallı)", styleClass: "cv-theme-executive", status: "Aktiv", featured: "Bəli" },
        { id: "minimal", name: "Zərif Minimalist", styleClass: "cv-theme-minimal", status: "Aktiv", featured: "Xeyr" }
    ];
    localStorage.setItem('saasTemplates', JSON.stringify(demoTemplates));
}

// Qlobal Dəyişənlər
let systemAdminLoggedIn = false;
let selectedTemplateId = "creative";
let cvCreationCounter = 3; 

// Səhifə Dəyişdirici
function switchPage(pageId) {
    if (pageId === 'admin' && !systemAdminLoggedIn) {
        alert("Giriş bloklandı! Admin panelə yalnız səlahiyyətli administrator daxil ola bilər.");
        switchPage('login');
        return;
    }

    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

    const target = document.getElementById(`page-${pageId}`);
    if (target) target.classList.add('active');

    const activeBtn = Array.from(document.querySelectorAll('.nav-btn')).find(b => b.getAttribute('onclick').includes(`'${pageId}'`));
    if (activeBtn) activeBtn.classList.add('active');

    if (pageId === 'admin') {
        calculateAndRenderAnalytics();
    }
}

// ADMİN GİRİŞİ (Yalnız teymurmemmedli323@gmail.com & teymur2002)
function executeLogin(e) {
    e.preventDefault();
    const email = document.getElementById('log-email').value.trim();
    const pass = document.getElementById('log-pass').value.trim();
    const errorField = document.getElementById('log-error-field');

    if (email === "teymurmemmedli323@gmail.com" && pass === "teymur2002") {
        systemAdminLoggedIn = true;
        errorField.textContent = "";
        
        document.getElementById('loginNavBtn').style.display = 'none';
        document.getElementById('registerNavBtn').style.display = 'none';
        document.getElementById('logoutBtn').style.display = 'block';

        switchPage('admin');
    } else {
        errorField.textContent = "Giriş rədd edildi! Email və ya Şifrə yanlışdır.";
    }
}

function logout() {
    systemAdminLoggedIn = false;
    document.getElementById('loginNavBtn').style.display = 'block';
    document.getElementById('registerNavBtn').style.display = 'block';
    document.getElementById('logoutBtn').style.display = 'none';
    alert("Sistemdən uğurla çıxış etdiniz.");
    switchPage('editor');
}

// REAL İSTİFADƏÇİ QEYDİYYATI
function executeRegister(e) {
    e.preventDefault();
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const country = document.getElementById('reg-country').value.trim();
    const successField = document.getElementById('reg-success-field');

    let users = JSON.parse(localStorage.getItem('saasUsers')) || [];

    if (users.some(u => u.email === email)) {
        alert("Bu e-mail ünvanı ilə artıq qeydiyyat mövcuddur!");
        return;
    }

    users.push({ name, email, country });
    localStorage.setItem('saasUsers', JSON.stringify(users));

    successField.textContent = `Hörmətli ${name}, qeydiyyatınız uğurludur! Məlumatlarınız CV Create Admin Panelinə ötürüldü.`;
    e.target.reset();
}

// ANALİTİKA VƏ ŞABLON MENECERİ PANELİNİN QURULMASI
function calculateAndRenderAnalytics() {
    const users = JSON.parse(localStorage.getItem('saasUsers')) || [];
    const templates = JSON.parse(localStorage.getItem('saasTemplates')) || [];

    // 1. İstifadəçi Siyahısını Doldur
    const userTableBody = document.getElementById('real-users-table');
    userTableBody.innerHTML = "";
    users.forEach((u, i) => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${i+1}</td><td><strong>${u.name}</strong></td><td>${u.email}</td><td>📍 ${u.country}</td>`;
        userTableBody.appendChild(row);
    });

    // 2. Ölkə Statistikası Real Hesablanması
    const geoList = document.getElementById('geo-list');
    geoList.innerHTML = "";
    let countryCounts = {};
    users.forEach(u => {
        let cName = u.country.split(',')[0].trim();
        countryCounts[cName] = (countryCounts[cName] || 0) + 1;
    });
    for (let c in countryCounts) {
        const li = document.createElement('li');
        li.innerHTML = `<span>${c}</span><strong>${countryCounts[c]} istifadəçi</strong>`;
        geoList.appendChild(li);
    }

    // 3. Gündəlik Yaradılma Sayı
    document.getElementById('live-cv-stat').textContent = `Real yaradılan ümumi CV sayı: ${cvCreationCounter}`;

    // 4. Şablon Siyahısı
    renderTemplatesTable(templates);
}

function renderTemplatesTable(templates) {
    const tbody = document.getElementById('admin-templates-list');
    tbody.innerHTML = "";

    templates.forEach(t => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${t.name}</strong></td>
            <td><code>${t.styleClass}</code></td>
            <td><span class="status-badge ${t.status === 'Aktiv' ? 'active' : 'inactive'}">${t.status}</span></td>
            <td><button class="btn-toggle" onclick="previewTemplateAlert('${t.name}')">👁 Önizlə</button></td>
            <td>${t.featured}</td>
            <td>
                <button class="btn-toggle" onclick="toggleTemplateStatus('${t.id}')">Statusu Dəyiş</button>
                <button class="btn-delete" onclick="deleteTemplate('${t.id}')">Sil</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    if(templates.length > 0) {
        document.getElementById('fav-template-name').textContent = `🥇 ${templates[0].name}`;
    }
}

// ADMİNDƏN YENİ ŞABLON ƏLAVƏ ETMƏK
function addNewTemplateFromAdmin() {
    const name = document.getElementById('new-tpl-name').value.trim();
    const style = document.getElementById('new-tpl-style').value.trim();

    if(!name || !style) {
        alert("Zəhmət olmasa bütün xanaları doldurun!");
        return;
    }

    let templates = JSON.parse(localStorage.getItem('saasTemplates')) || [];
    const newId = "custom_" + Date.now();
    
    templates.push({ id: newId, name: name, styleClass: style, status: "Aktiv", featured: "Xeyr" });
    localStorage.setItem('saasTemplates', JSON.stringify(templates));
    
    const grid = document.querySelector('.template-grid');
    const btn = document.createElement('button');
    btn.className = "tpl-card";
    btn.id = `btn-${newId}`;
    btn.setAttribute('onclick', `changeTemplate('${newId}')`);
    btn.innerHTML = `<div class="tpl-thumb" style="background:#fef3c7; border:1px solid #f59e0b;"></div><span>${name}</span>`;
    grid.appendChild(btn);

    document.getElementById('new-tpl-name').value = "";
    document.getElementById('new-tpl-style').value = "";
    
    calculateAndRenderAnalytics();
    alert(`'${name}' şablonu uğurla platformaya inteqrasiya edildi!`);
}

function toggleTemplateStatus(id) {
    let templates = JSON.parse(localStorage.getItem('saasTemplates')) || [];
    templates = templates.map(t => {
        if(t.id === id) t.status = (t.status === 'Aktiv' ? 'Deaktiv' : 'Aktiv');
        return t;
    });
    localStorage.setItem('saasTemplates', JSON.stringify(templates));
    calculateAndRenderAnalytics();
}

function deleteTemplate(id) {
    let templates = JSON.parse(localStorage.getItem('saasTemplates')) || [];
    templates = templates.filter(t => t.id !== id);
    localStorage.setItem('saasTemplates', JSON.stringify(templates));
    calculateAndRenderAnalytics();
}

function previewTemplateAlert(name) {
    alert(`'${name}' şablonunun CSS/HTML kodu tam strukturlu şəkildə aktivdir.`);
}

// CV REDAKTOR - REAL VAXTDA MƏLUMAT YENİLƏMƏSİ (Dillər Bölməsi Daxil)
function updateCV() {
    document.getElementById('cv-txt-name').textContent = document.getElementById('in-name').value || "Ad Soyad";
    document.getElementById('cv-txt-title').textContent = document.getElementById('in-title').value || "Peşə Sahəsi";
    document.getElementById('cv-txt-email').textContent = document.getElementById('in-email').value || "mail@nümunə.com";
    document.getElementById('cv-txt-phone').textContent = document.getElementById('in-phone').value || "+994";
    document.getElementById('cv-txt-location').textContent = document.getElementById('in-location').value || "Şəhər, Ölkə";
    document.getElementById('cv-txt-web').textContent = document.getElementById('in-web').value || "vebsayt.com";
    document.getElementById('cv-txt-about').textContent = document.getElementById('in-about').value || "";
    document.getElementById('cv-txt-exp-title').textContent = document.getElementById('in-exp-title').value || "";
    document.getElementById('cv-txt-exp-desc').textContent = document.getElementById('in-exp-desc').value || "";
    document.getElementById('cv-txt-edu-title').textContent = document.getElementById('in-edu-title').value || "";
    document.getElementById('cv-txt-edu-desc').textContent = document.getElementById('in-edu-desc').value || "";

    // 1. DİLLƏRİ siyahı elementinə çevirmək
    const langInput = document.getElementById('in-languages').value;
    const langContainer = document.getElementById('cv-languages-list');
    langContainer.innerHTML = "";

    if (langInput.trim() !== "") {
        const langArr = langInput.split(',');
        langArr.forEach(l => {
            if(l.trim() !== "") {
                const parts = l.split('(');
                const lName = parts[0].trim();
                const lLevel = parts[1] ? parts[1].replace(')', '').trim() : 'Əla';

                const div = document.createElement('div');
                div.className = 'lang-item';
                div.innerHTML = `<span>${lName}</span><strong>${lLevel}</strong>`;
                langContainer.appendChild(div);
            }
        });
    }

    // 2. BACARIQLARI teqlərə çevirmək
    const skillsInput = document.getElementById('in-skills').value;
    const skillsContainer = document.getElementById('cv-skills-list');
    skillsContainer.innerHTML = "";
    
    if(skillsInput.trim() !== "") {
        const skillsArr = skillsInput.split(',');
        skillsArr.forEach(s => {
            if(s.trim() !== "") {
                const span = document.createElement('span');
                span.className = 'skill-tag';
                span.textContent = s.trim();
                skillsContainer.appendChild(span);
            }
        });
    }
}

// ŞABLON DEYİŞDİRİCİ
function changeTemplate(typeId) {
    const sheet = document.getElementById('cv-sheet');
    document.querySelectorAll('.tpl-card').forEach(c => c.classList.remove('active'));
    
    const activeCard = document.getElementById(`btn-${typeId}`);
    if(activeCard) activeCard.classList.add('active');

    sheet.className = "";
    if (typeId === 'creative') {
        sheet.className = "cv-theme-creative";
    } else if (typeId === 'executive') {
        sheet.className = "cv-theme-executive";
    } else if (typeId === 'minimal') {
        sheet.className = "cv-theme-minimal";
    } else {
        let templates = JSON.parse(localStorage.getItem('saasTemplates')) || [];
        let found = templates.find(t => t.id === typeId);
        if(found) {
            sheet.className = found.styleClass;
        } else {
            sheet.className = "cv-theme-creative";
        }
    }
}

// CANLI PROFIL ŞƏKLİ YÜKLƏMƏSİ
function previewImage(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function() {
            document.getElementById('cv-img-view').src = reader.result;
        }
        reader.readAsDataURL(file);
    }
}

function triggerCVPrint() {
    cvCreationCounter++;
    window.print();
}

// İlk açılış animasiyaları və render
document.addEventListener("DOMContentLoaded", () => {
    updateCV();
});