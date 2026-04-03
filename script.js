// --- 1. DATA STATE ---
let logs = JSON.parse(localStorage.getItem('logs')) || [];
let riwayatFisik = JSON.parse(localStorage.getItem('riwayatFisik')) || [];
let profile = JSON.parse(localStorage.getItem('profile')) || { 
    name: '', age: 0, weight: 0, height: 0, bmr: 0, tdee: 0 
};

updateUI();

// --- 2. NAVIGATION ---
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
}

// --- 3. INPUT LOGIC ---
function tambahItem() {
    const inputDate = document.getElementById('inputDate').value;
    const nama = document.getElementById('foodName').value;
    const tipe = document.getElementById('type').value;
    const kalori = parseInt(document.getElementById('calories').value);
    
    let tglFinal;
    if (!inputDate) {
        tglFinal = new Date().toLocaleDateString('id-ID');
    } else {
        const d = new Date(inputDate);
        tglFinal = d.toLocaleDateString('id-ID');
    }

    if (!nama || isNaN(kalori)) {
        alert("Harap isi Nama dan Kalori!");
        return;
    }

    logs.push({ tanggal: tglFinal, nama, tipe, kalori });
    saveData();
    updateUI();
    
    document.getElementById('inputDate').value = '';
    document.getElementById('foodName').value = '';
    document.getElementById('calories').value = '';
    showPage('dashboard');
}

// --- 4. BMR & TDEE LOGIC ---
function hitungBMR() {
    const gender = document.getElementById('gender').value;
    const age = parseInt(document.getElementById('bmr-age').value);
    const weight = parseFloat(document.getElementById('bmr-weight').value);
    const height = parseFloat(document.getElementById('bmr-height').value);
    const act = parseFloat(document.getElementById('activity').value);

    if (!weight || !height || !age) {
        alert("Lengkapi data fisik!");
        return;
    }

    let bmr = (10 * weight) + (6.25 * height) - (5 * age);
    bmr = (gender === 'male') ? bmr + 5 : bmr - 161;
    const tdee = Math.round(bmr * act);

    riwayatFisik.push({
        tanggal: new Date().toLocaleDateString('id-ID'),
        berat: weight,
        bmr: Math.round(bmr),
        tdee: tdee
    });

    profile.age = age; profile.weight = weight; profile.height = height;
    profile.bmr = Math.round(bmr); profile.tdee = tdee;

    saveData();
    
    const resBox = document.getElementById('bmr-result');
    resBox.style.display = 'block';
    resBox.innerHTML = `<div style="background:#e3f2fd; padding:15px; border-radius:8px; border:1px solid #2196f3; color:#0d47a1;">
        <strong>Kalkulasi Selesai!</strong><br>
        BMR Dasar: ${Math.round(bmr)} kcal | TDEE (Maintenance): <b>${tdee} kcal</b>
    </div>`;

    updateUI();
}

// --- 5. UI UPDATE (THE CORE) ---
function updateUI() {
    // A. TABEL DETAIL (ATAS)
    const tbodyLog = document.getElementById('tableBody');
    let totalInAll = 0, totalOutAll = 0;

    if (tbodyLog) {
        tbodyLog.innerHTML = '';
        logs.forEach((item, index) => {
            if (item.tipe === 'in') totalInAll += item.kalori;
            else totalOutAll += item.kalori;

            tbodyLog.innerHTML += `
                <tr>
                    <td><small>${item.tanggal || '-'}</small></td>
                    <td>${item.nama}</td>
                    <td>${item.tipe === 'in' ? 'Masuk' : 'Keluar'}</td>
                    <td style="color:${item.tipe === 'in' ? '#d9534f':'#5cb85c'}; font-weight:bold;">
                        ${item.tipe === 'in' ? '+':'-'}${item.kalori}
                    </td>
                    <td><button class="btn-hapus" onclick="hapusLog(${index})">x</button></td>
                </tr>`;
        });

        const netAll = totalInAll - totalOutAll;
        let ketAll = (netAll < 0) ? "(Defisit)" : (netAll > 0) ? "(Surplus)" : "(Seimbang)";
        let colorAll = (netAll < 0) ? "#5cb85c" : (netAll > 0) ? "#d9534f" : "#007bff";

        document.getElementById('dashIn').innerText = totalInAll;
        document.getElementById('dashOut').innerText = totalOutAll;
        document.getElementById('dashNet').innerHTML = `${netAll} kcal <span style="color:${colorAll}; font-weight:normal; font-size:0.75em; margin-left:5px;">${ketAll}</span>`;
    }

    // B. TABEL REKAPITULASI (BAWAH)
    const rekapBody = document.getElementById('rekapTableBody');
    if (rekapBody) {
        rekapBody.innerHTML = '';
        const rekapData = {};

        logs.forEach(item => {
            const tgl = item.tanggal;
            if (!rekapData[tgl]) rekapData[tgl] = { masuk: 0, keluar: 0 };
            if (item.tipe === 'in') rekapData[tgl].masuk += item.kalori;
            else rekapData[tgl].keluar += item.kalori;
        });

        Object.keys(rekapData).reverse().forEach(tgl => {
            const data = rekapData[tgl];
            const netHarian = data.masuk - data.keluar;
            let status = (netHarian < 0) ? "Defisit" : (netHarian > 0) ? "Surplus" : "Seimbang";
            let warnaStatus = (netHarian < 0) ? "#5cb85c" : (netHarian > 0) ? "#d9534f" : "#007bff";

            rekapBody.innerHTML += `
                <tr>
                    <td><b>${tgl}</b></td>
                    <td>${data.masuk} kcal</td>
                    <td>${data.keluar} kcal</td>
                    <td style="color:${warnaStatus}; font-weight:bold;">
                        ${netHarian} kcal <small style="font-weight:normal;">(${status})</small>
                    </td>
                </tr>`;
        });
    }

    // C. BMR HISTORY & PROFILE
    const tbodyBmr = document.getElementById('bmrTableBody');
    if (tbodyBmr) {
        tbodyBmr.innerHTML = '';
        riwayatFisik.forEach((item, index) => {
            tbodyBmr.innerHTML += `<tr><td>${item.tanggal}</td><td>${item.berat} kg</td><td>${item.bmr}</td><td>${item.tdee}</td><td><button class="btn-hapus" onclick="hapusBMR(${index})">x</button></td></tr>`;
        });
    }

    if(document.getElementById('profName')) document.getElementById('profName').value = profile.name || '';
    document.getElementById('dispAge').innerText = profile.age || '-';
    document.getElementById('dispWeight').innerText = profile.weight || '-';
    document.getElementById('dispHeight').innerText = profile.height || '-';
    if (profile.height > 0) {
        const ideal = (profile.height - 100) - ((profile.height - 100) * 0.1);
        document.getElementById('idealWeight').innerText = ideal.toFixed(1);
    }
}

// --- 6. STORAGE & HELPERS ---
function saveData() {
    localStorage.setItem('logs', JSON.stringify(logs));
    localStorage.setItem('riwayatFisik', JSON.stringify(riwayatFisik));
    localStorage.setItem('profile', JSON.stringify(profile));
}

function saveProfile() {
    profile.name = document.getElementById('profName').value;
    saveData();
}

function hapusLog(index) {
    if(confirm("Hapus data?")) { logs.splice(index, 1); saveData(); updateUI(); }
}

function hapusBMR(index) {
    if(confirm("Hapus riwayat?")) { riwayatFisik.splice(index, 1); saveData(); updateUI(); }
}