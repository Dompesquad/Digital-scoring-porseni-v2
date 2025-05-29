// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDCxWbuScND_kc4oS_WZN7s4q6CmNooNpg",
  authDomain: "digital-scoring-porseni.firebaseapp.com",
  projectId: "digital-scoring-porseni",
  storageBucket: "digital-scoring-porseni.appspot.com",
  messagingSenderId: "673985819962",
  appId: "1:673985819962:web:e985d20a4d5d478df58c03"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Ambil parameter dari URL
const urlParams = new URLSearchParams(window.location.search);
const lomba = urlParams.get("lomba");
const juri = urlParams.get("juri");

// Validasi
if (!lomba || !juri) {
  alert("Parameter URL tidak lengkap.");
  window.location.href = "index.html";
}

// Update judul
document.getElementById("judulLomba").textContent = `Penilaian Lomba: ${lomba}`;
document.getElementById("infoJuri").textContent = `Anda menilai sebagai: ${juri}`;

// Event submit nilai
document.getElementById("formNilai").addEventListener("submit", async (e) => {
  e.preventDefault();

  const peserta = document.getElementById("inputPeserta").value.trim();
  const nilai1 = parseFloat(document.getElementById("nilai1").value);
  const nilai2 = parseFloat(document.getElementById("nilai2").value);
  const nilai3 = parseFloat(document.getElementById("nilai3").value);
  const total = ((nilai1 + nilai2 + nilai3) / 3).toFixed(2);

  await addDoc(collection(db, "nilai"), {
    peserta,
    lomba,
    juri,
    nilai1,
    nilai2,
    nilai3,
    total: parseFloat(total),
    timestamp: new Date()
  });

  alert("Nilai berhasil disimpan!");
  tampilkanDaftarNilai();
  e.target.reset();
});

// Tampilkan nilai per peserta
async function tampilkanDaftarNilai() {
  const daftarDiv = document.getElementById("daftarNilai");
  daftarDiv.innerHTML = "<em>Memuat data...</em>";

  const nilaiRef = collection(db, "nilai");
  const q = query(nilaiRef, where("lomba", "==", lomba));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    daftarDiv.innerHTML = "<p>Belum ada nilai.</p>";
    return;
  }

  const data = {};
  snapshot.forEach(doc => {
    const d = doc.data();
    if (!data[d.peserta]) data[d.peserta] = [];
    data[d.peserta].push({ juri: d.juri, total: d.total });
  });

  const hasil = Object.entries(data).map(([peserta, penilaian]) => {
    const rata = penilaian.reduce((s, p) => s + p.total, 0) / penilaian.length;
    return { peserta, penilaian, rata };
  }).sort((a, b) => b.rata - a.rata);

  daftarDiv.innerHTML = hasil.map((d, i) => `
    <div class="card-nilai">
      <strong>${i + 1}. ${d.peserta}</strong><br/>
      Rata-rata: <strong>${d.rata.toFixed(2)}</strong>
      <ul>
        ${d.penilaian.map(p => `<li>${p.juri}: ${p.total.toFixed(2)}</li>`).join("")}
      </ul>
    </div>
  `).join("");
}

tampilkanDaftarNilai();

// Export ke Excel
document.getElementById("btnExportExcel").addEventListener("click", exportKeExcel);
document.getElementById("btnExportJuri").addEventListener("click", exportPerJuri);
document.getElementById("btnExportSemua").addEventListener("click", exportSemuaLomba);

async function exportKeExcel() {
  const nilaiRef = collection(db, "nilai");
  const q = query(nilaiRef, where("lomba", "==", lomba));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return alert("Tidak ada data.");

  const data = {};
  snapshot.forEach(doc => {
    const d = doc.data();
    if (!data[d.peserta]) data[d.peserta] = [];
    data[d.peserta].push({ juri: d.juri, total: d.total });
  });

  const rows = [["No", "Peserta", "Rata-rata", "Juri", "Nilai"]];
  let no = 1;
  for (const [peserta, penilaian] of Object.entries(data)) {
    const rata = penilaian.reduce((s, p) => s + p.total, 0) / penilaian.length;
    penilaian.forEach((p, i) => {
      rows.push([
        i === 0 ? no : "",
        i === 0 ? peserta : "",
        i === 0 ? rata.toFixed(2) : "",
        p.juri,
        p.total.toFixed(2)
      ]);
    });
    no++;
  }

  const ws = XLSX.utils.aoa_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Nilai");
  XLSX.writeFile(wb, `Nilai_${lomba}.xlsx`);
}

async function exportPerJuri() {
  const nilaiRef = collection(db, "nilai");
  const q = query(nilaiRef, where("lomba", "==", lomba), where("juri", "==", juri));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return alert("Tidak ada nilai dari juri ini.");

  const rows = [["No", "Peserta", "Total"]];
  let no = 1;
  snapshot.forEach(doc => {
    const d = doc.data();
    rows.push([no++, d.peserta, d.total.toFixed(2)]);
  });

  const ws = XLSX.utils.aoa_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, `Lomba-${lomba}`);
  XLSX.writeFile(wb, `Nilai_${lomba}_juri-${juri}.xlsx`);
}

async function exportSemuaLomba() {
  const nilaiRef = collection(db, "nilai");
  const snapshot = await getDocs(nilaiRef);
  if (snapshot.empty) return alert("Tidak ada data.");

  const semua = {};
  snapshot.forEach(doc => {
    const d = doc.data();
    if (!semua[d.lomba]) semua[d.lomba] = [];
    semua[d.lomba].push(d);
  });

  const wb = XLSX.utils.book_new();
  for (const [lombaNama, data] of Object.entries(semua)) {
    const rows = [["No", "Peserta", "Juri", "Total"]];
    let no = 1;
    data.forEach(d => {
      rows.push([no++, d.peserta, d.juri, d.total.toFixed(2)]);
    });
    const ws = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, lombaNama.substring(0, 31));
  }

  XLSX.writeFile(wb, "Nilai_Semua_Lomba.xlsx");
}
