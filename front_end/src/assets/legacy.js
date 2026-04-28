export function showTab(btn, name) {
    document.querySelectorAll('.account-nav-item').forEach(i => i.classList.remove('active'));
    btn.classList.add('active');
    ['profile', 'sensors', 'notifications', 'api', 'security'].forEach(t => {
        const el = document.getElementById('tab-' + t);
        if (el) el.style.display = t === name ? 'block' : 'none';
    });
}
export function filterAlerts(btn, type) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}
export function selectAlert(el, idx) {
    document.querySelectorAll('.alert-list-item').forEach(i => i.classList.remove('selected'));
    el.classList.add('selected');
}
export function showSettingsTab(btn, name) {
    document.querySelectorAll('.settings-nav-item').forEach(i => i.classList.remove('active'));
    btn.classList.add('active');
    ['thresholds', 'sensors', 'data', 'display'].forEach(t => {
        const el = document.getElementById('stab-' + t);
        if (el) el.style.display = t === name ? 'block' : 'none';
    });
}
export function handleFile(file) {
    if (!file) return;
    const prog = document.getElementById('upload-progress');
    prog.style.display = 'block';
    document.getElementById('upload-filename').textContent = file.name;
    document.getElementById('upload-size').textContent = (file.size / 1024 / 1024).toFixed(1) + ' MB · Uploading…';
    let pct = 0;
    const iv = setInterval(() => {
        pct += Math.random() * 15;
        if (pct >= 100) {
            pct = 100; clearInterval(iv);
            document.getElementById('upload-size').textContent = 'Upload complete — validating…';
            setTimeout(() => { prog.style.display = 'none'; document.getElementById('data-preview').style.display = 'block'; }, 800);
        }
        document.getElementById('progress-fill').style.width = pct + '%';
        document.getElementById('progress-text').textContent = Math.floor(pct) + '%';
    }, 200);
}
export function handleDrop(e, uploadZone) {
    e.preventDefault();
    uploadZone.classList.remove('drag-over');
    handleFile(e.dataTransfer.files[0]);
}

window.showTab = showTab;
window.filterAlerts = filterAlerts;
window.selectAlert = selectAlert;
window.showSettingsTab = showSettingsTab;
window.handleFile = handleFile;
window.handleDrop = handleDrop;
