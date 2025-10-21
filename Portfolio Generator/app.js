// ---------- Simple Login System ----------
const loginSection = document.getElementById('loginSection');
const mainContent = document.getElementById('mainContent');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');

const LOGIN_KEY = 'portfolio_logged_in_user';

// Check login status
function checkLogin() {
    const user = localStorage.getItem(LOGIN_KEY);
    if (user) {
        loginSection.style.display = 'none';
        mainContent.style.display = 'flex';
        logoutBtn.style.display = 'inline-block';
    } else {
        loginSection.style.display = 'block';
        mainContent.style.display = 'none';
        logoutBtn.style.display = 'none';
    }
}

// Login handler
loginBtn.addEventListener('click', () => {
    const email = loginEmail.value.trim();
    const password = loginPassword.value.trim();

    // Basic email validation
    const emailPattern = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;

    if (!email || !password) {
        alert('Please enter both email and password.');
        return;
    }

    // Check lowercase rule
    if (email !== email.toLowerCase()) {
        alert('Email must be in lowercase letters only.');
        return;
    }

    // Check valid email format
    if (!emailPattern.test(email)) {
        alert('Please enter a valid email address.');
        return;
    }

    // Save login session
    localStorage.setItem(LOGIN_KEY, JSON.stringify({ email }));
    checkLogin();
});



// Logout handler
logoutBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to log out?')) {
        localStorage.removeItem(LOGIN_KEY);
        checkLogin();
    }
});

// Run on load
checkLogin();



// script.js
// Frontend-only dynamic portfolio generator
// Saves to localStorage and generates PDF using html2pdf.js

// ---------- Helpers ----------
const $ = id => document.getElementById(id);
const toList = s => (s || '').split(',').map(x => x.trim()).filter(x => x);

// ---------- Elements ----------
const form = $('portfolioForm');
const inputs = {
    fullName: $('fullName'),
    contactInfo: $('contactInfo'),
    photoInput: $('photoInput'),
    bio: $('bio'),
    softSkills: $('softSkills'),
    techSkills: $('techSkills'),
    institute: $('institute'),
    degree: $('degree'),
    year: $('year'),
    grade: $('grade'),
    company: $('company'),
    duration: $('duration'),
    responsibilities: $('responsibilities'),
    projects: $('projects')
};

const preview = $('preview');
const previewPhoto = $('previewPhoto');
const previewName = $('previewName');
const previewContact = $('previewContact');
const previewBio = $('previewBio');
const previewSoft = $('previewSoft');
const previewTech = $('previewTech');
const previewAcademicsSection = $('previewAcademicsSection');
const previewAcademics = $('previewAcademics');
const previewCompany = $('previewCompany');
const previewResponsibilities = $('previewResponsibilities');
const previewProjectsSection = $('previewProjectsSection');
const previewProjects = $('previewProjects');

const saveBtn = $('saveBtn');
const generatePdfBtn = $('generatePdfBtn');
const clearFormBtn = $('clearFormBtn');
const profilesList = $('profilesList');

const STORAGE_KEY = 'dynamic_portfolio_profiles_v1';

// ---------- State ----------
let currentPhotoDataUrl = ''; // base64 data URL of the image

// ---------- Update preview ----------
function updatePreview() {
    previewName.textContent = inputs.fullName.value.trim() || 'Full Name';
    previewContact.textContent = inputs.contactInfo.value.trim() || 'Contact information';
    previewBio.textContent = inputs.bio.value.trim() || 'Short bio appears here.';
    previewSoft.textContent = (inputs.softSkills.value ? toList(inputs.softSkills.value).join(', ') : '—');
    previewTech.textContent = (inputs.techSkills.value ? toList(inputs.techSkills.value).join(', ') : '—');

    // Photo
    if (currentPhotoDataUrl) {
        previewPhoto.src = currentPhotoDataUrl;
    } else {
        previewPhoto.src = ''; // empty (shows background)
    }

    // Academics (hide if empty)
    const institute = inputs.institute.value.trim();
    const degree = inputs.degree.value.trim();
    const year = inputs.year.value.trim();
    const grade = inputs.grade.value.trim();
    if (institute || degree || year || grade) {
        previewAcademicsSection.style.display = 'block';
        const parts = [institute, degree, year, grade].filter(Boolean);
        previewAcademics.textContent = parts.join(' — ');
    } else {
        previewAcademicsSection.style.display = 'none';
    }

    // Experience
    const company = inputs.company.value.trim();
    const duration = inputs.duration.value.trim();
    previewCompany.textContent = (company || 'Company') + (duration ? ` (${duration})` : '');
    // Responsibilities list
    previewResponsibilities.innerHTML = '';
    const respLines = inputs.responsibilities.value.split('\n').map(r => r.trim()).filter(Boolean);
    if (respLines.length) {
        respLines.forEach(r => {
            const li = document.createElement('li');
            li.textContent = r;
            previewResponsibilities.appendChild(li);
        });
    } else {
        const li = document.createElement('li');
        li.textContent = 'No responsibilities provided.';
        previewResponsibilities.appendChild(li);
    }

    // Projects
    const projLines = inputs.projects.value.split('\n').map(p => p.trim()).filter(Boolean);
    if (projLines.length) {
        previewProjectsSection.style.display = 'block';
        previewProjects.innerHTML = '';
        projLines.forEach(p => {
            const li = document.createElement('li');
            li.textContent = p;
            previewProjects.appendChild(li);
        });
    } else {
        previewProjectsSection.style.display = 'none';
    }
}

// Attach input listeners
Object.values(inputs).forEach(el => {
    if (!el) return;
    el.addEventListener('input', updatePreview);
});

// Handle photo input
inputs.photoInput.addEventListener('change', ev => {
    const file = ev.target.files && ev.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
        alert('Please select a valid image (jpg or png).');
        return;
    }
    const reader = new FileReader();
    reader.onload = e => {
        currentPhotoDataUrl = e.target.result.toString();
        updatePreview();
    };
    reader.readAsDataURL(file);
});

// ---------- Persistence (localStorage) ----------
function loadProfiles() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        return JSON.parse(raw);
    } catch (e) {
        console.error('Failed to load profiles', e);
        return [];
    }
}
function saveProfiles(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function renderProfilesList() {
    const list = loadProfiles();
    profilesList.innerHTML = '';
    if (list.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'No saved profiles yet.';
        profilesList.appendChild(li);
        return;
    }
    list.forEach((p, idx) => {
        const li = document.createElement('li');
        const left = document.createElement('div');
        left.style.display = 'flex';
        left.style.alignItems = 'center';
        left.style.gap = '8px';

        const thumb = document.createElement('img');
        thumb.style.width = '40px';
        thumb.style.height = '40px';
        thumb.style.objectFit = 'cover';
        thumb.style.borderRadius = '6px';
        thumb.src = p.photo || '';
        left.appendChild(thumb);

        const title = document.createElement('div');
        title.innerHTML = `<strong style="display:block">${p.fullName || 'Unnamed'}</strong><small style="color:#666">${p.contactInfo || ''}</small>`;
        left.appendChild(title);

        const actions = document.createElement('div');
        actions.className = 'profile-actions';

        const loadBtn = document.createElement('button');
        loadBtn.textContent = 'Load';
        loadBtn.onclick = () => loadProfileToForm(idx);

        const downloadBtn = document.createElement('button');
        downloadBtn.textContent = 'PDF';
        downloadBtn.onclick = () => generatePdfFromProfile(p);

        const delBtn = document.createElement('button');
        delBtn.textContent = 'Delete';
        delBtn.style.color = 'var(--danger)';
        delBtn.onclick = () => {
            if (!confirm('Delete this profile?')) return;
            const arr = loadProfiles();
            arr.splice(idx, 1);
            saveProfiles(arr);
            renderProfilesList();
        };

        actions.appendChild(loadBtn);
        actions.appendChild(downloadBtn);
        actions.appendChild(delBtn);

        li.appendChild(left);
        li.appendChild(actions);
        profilesList.appendChild(li);
    });
}

function loadProfileToForm(index) {
    const arr = loadProfiles();
    const p = arr[index];
    if (!p) return;
    inputs.fullName.value = p.fullName || '';
    inputs.contactInfo.value = p.contactInfo || '';
    inputs.bio.value = p.bio || '';
    inputs.softSkills.value = (p.softSkills || []).join(', ');
    inputs.techSkills.value = (p.techSkills || []).join(', ');
    inputs.institute.value = p.institute || '';
    inputs.degree.value = p.degree || '';
    inputs.year.value = p.year || '';
    inputs.grade.value = p.grade || '';
    inputs.company.value = p.company || '';
    inputs.duration.value = p.duration || '';
    inputs.responsibilities.value = (p.responsibilities || []).join('\n');
    inputs.projects.value = (p.projects || []).join('\n');
    currentPhotoDataUrl = p.photo || '';
    // reset file input (can't set file programmatically)
    inputs.photoInput.value = '';
    updatePreview();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Save profile from current form
saveBtn.addEventListener('click', () => {
    const newProfile = {
        id: Date.now(),
        fullName: inputs.fullName.value.trim(),
        contactInfo: inputs.contactInfo.value.trim(),
        photo: currentPhotoDataUrl,
        bio: inputs.bio.value.trim(),
        softSkills: toList(inputs.softSkills.value),
        techSkills: toList(inputs.techSkills.value),
        institute: inputs.institute.value.trim(),
        degree: inputs.degree.value.trim(),
        year: inputs.year.value.trim(),
        grade: inputs.grade.value.trim(),
        company: inputs.company.value.trim(),
        duration: inputs.duration.value.trim(),
        responsibilities: inputs.responsibilities.value.split('\n').map(s => s.trim()).filter(Boolean),
        projects: inputs.projects.value.split('\n').map(s => s.trim()).filter(Boolean)
    };

    // Basic validation
    if (!newProfile.fullName || !newProfile.contactInfo) {
        alert('Please provide at least Full name and Contact info.');
        return;
    }

    const arr = loadProfiles();
    arr.unshift(newProfile); // newest first
    // keep only reasonable number (optional)
    if (arr.length > 30) arr.splice(30);
    saveProfiles(arr);
    renderProfilesList();
    alert('Profile saved locally.');
});

// Clear form
clearFormBtn.addEventListener('click', () => {
    if (!confirm('Clear form? Unsaved changes will be lost.')) return;
    form.reset();
    currentPhotoDataUrl = '';
    updatePreview();
});

// Generate PDF from current preview
generatePdfBtn.addEventListener('click', () => {
    // ensure required fields
    if (!inputs.fullName.value.trim() || !inputs.contactInfo.value.trim()) {
        if (!confirm('Name or Contact info is missing. Continue to generate PDF anyway?')) return;
    }
    // Make a clone of preview for PDF generation to ensure good layout
    const clone = preview.cloneNode(true);
    clone.style.boxShadow = 'none';
    clone.style.width = '800px'; // increase resolution on PDF
    // create container
    const wrapper = document.createElement('div');
    wrapper.style.padding = '20px';
    wrapper.appendChild(clone);

    const opt = {
        margin: 10,
        filename: `${(inputs.fullName.value.trim() || 'portfolio').replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // call html2pdf
    html2pdf().set(opt).from(wrapper).save();
});

// Generate PDF directly from saved profile (use a temporary DOM)
function generatePdfFromProfile(profile) {
    // build a temporary preview element
    const container = document.createElement('div');
    container.style.padding = '20px';
    container.style.background = '#fff';
    const card = document.createElement('div');
    card.style.width = '800px';
    card.style.fontFamily = 'Inter, Arial, sans-serif';
    card.style.color = '#111';
    card.style.background = '#fff';
    card.style.padding = '14px';
    card.style.borderRadius = '8px';
    card.style.boxSizing = 'border-box';

    // header
    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.gap = '12px';
    header.style.alignItems = 'center';
    const img = document.createElement('img');
    img.src = profile.photo || '';
    img.style.width = '120px';
    img.style.height = '120px';
    img.style.objectFit = 'cover';
    img.style.borderRadius = '8px';
    img.style.background = '#f3f4f6';
    header.appendChild(img);

    const htext = document.createElement('div');
    htext.innerHTML = `<h1 style="margin:0">${profile.fullName || ''}</h1>
      <div style="color:#666;margin-top:6px">${profile.contactInfo || ''}</div>`;
    header.appendChild(htext);
    card.appendChild(header);

    // bio
    const bioSec = document.createElement('div');
    bioSec.style.marginTop = '10px';
    bioSec.innerHTML = `<h3 style="margin:8px 0 6px 0">About</h3><div style="color:#222">${profile.bio || ''}</div>`;
    card.appendChild(bioSec);

    // skills
    const skills = document.createElement('div');
    skills.style.marginTop = '10px';
    skills.innerHTML = `<h3 style="margin:8px 0 6px 0">Skills</h3>
    <div><strong>Soft:</strong> ${(profile.softSkills || []).join(', ') || '—'}</div>
    <div><strong>Technical:</strong> ${(profile.techSkills || []).join(', ') || '—'}</div>`;
    card.appendChild(skills);

    // academics
    if (profile.institute || profile.degree || profile.year || profile.grade) {
        const acad = document.createElement('div');
        acad.style.marginTop = '10px';
        acad.innerHTML = `<h3 style="margin:8px 0 6px 0">Academics</h3>
      <div>${[profile.institute, profile.degree, profile.year, profile.grade].filter(Boolean).join(' — ')}</div>`;
        card.appendChild(acad);
    }

    // experience
    const exp = document.createElement('div');
    exp.style.marginTop = '10px';
    exp.innerHTML = `<h3 style="margin:8px 0 6px 0">Work Experience</h3>
    <div><strong>${profile.company || ''}</strong> ${profile.duration ? '(' + profile.duration + ')' : ''}</div>`;
    const ul = document.createElement('ul');
    (profile.responsibilities || []).forEach(r => {
        const li = document.createElement('li'); li.textContent = r; ul.appendChild(li);
    });
    exp.appendChild(ul);
    card.appendChild(exp);

    // projects
    if ((profile.projects || []).length) {
        const pr = document.createElement('div');
        pr.style.marginTop = '10px';
        pr.innerHTML = `<h3 style="margin:8px 0 6px 0">Projects / Publications</h3>`;
        const ul2 = document.createElement('ul');
        (profile.projects || []).forEach(p => {
            const li = document.createElement('li'); li.textContent = p; ul2.appendChild(li);
        });
        pr.appendChild(ul2);
        card.appendChild(pr);
    }

    container.appendChild(card);

    const opt = {
        margin: 10,
        filename: `${(profile.fullName || 'portfolio').replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(container).save();
}

// Initialize
updatePreview();
renderProfilesList();