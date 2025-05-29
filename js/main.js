document.getElementById("btnLanjut").addEventListener("click", () => {
  const juri = document.getElementById("inputJuri").value.trim();
  if (!juri) {
    alert("Silakan pilih nama juri terlebih dahulu.");
    return;
  }

  // Tampilkan tombol-tombol lomba
  document.getElementById("pilihanLomba").style.display = "block";

  // Simpan nama juri di sessionStorage
  sessionStorage.setItem("juri", juri);
});

document.querySelectorAll(".lombaBtn").forEach(btn => {
  btn.addEventListener("click", () => {
    const lomba = btn.getAttribute("data-lomba");
    const juri = sessionStorage.getItem("juri");
    if (!juri) {
      alert("Juri tidak dikenali. Silakan mulai ulang.");
      window.location.href = "index.html";
      return;
    }

    // Redirect ke halaman penilaian
    const url = `penilaian.html?lomba=${encodeURIComponent(lomba)}&juri=${encodeURIComponent(juri)}`;
    window.location.href = url;
  });
});
