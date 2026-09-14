// ===== UTILITAS UMUM =====
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
 }

 function tampilToast(pesan) {
  var toast = document.getElementById("toast");
  toast.innerText = pesan;
  toast.classList.add("tampil");
  setTimeout(function() {
    toast.classList.remove("tampil");
  }, 2500);
 }

 function tampilSkeleton() {
  var daftar = document.getElementById("daftarTugas");

  var skeletonHtml = "";
  for (var i = 0; i < 3; i++) {
    skeletonHtml +=
    "<div class='skeleton-card'>" +
    "<div class='skeleton-row'>" +
    "<div class='skeleton skeleton-icon'></div>" +
    "<div class='skeleton skeleton-teks'></div>" +
    "<div class='skeleton skeleton-tombol'></div>" +
    "<div class='skeleton skeleton-tombol'></div>" +
    "</div>" +
    "</div>"

  }
  daftar.innerHTML = skeletonHtml;
 }

    function mulai() {
        var namaInput =document.getElementById("inputNama").value;

        if (namaInput === "") {
            tampilToast("⚠️ Nama tidak boleh kosong!");
            return;
        }

        localStorage.setItem("nama", namaInput);
        showPage('halaman-utama')
        document.querySelector(".bottom-nav").style.display ="flex";
        pindahTab('home');
        tampilkanDashboard();
        tampilkanDaftarTugas();
        tampilOnboarding();
    }

    function tampilkanDashboard() {
        var nama = localStorage.getItem("nama");
        var sekarang = new Date();
        var hari = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
        var bulan = ["Jan","Feb","Mar","Apr","Mei","Jun","jul","Agu","Sep","Okt","Nov","Des"];
        var tanggal = hari[sekarang.getDay()] + ", " + sekarang.getDate() + " " + bulan[sekarang.getMonth()] + " " + sekarang.getFullYear();

        document.getElementById("sapaanNama").innerHTML = "Halo, " + nama + "! 👋";
        document.getElementById("profilNama").innerHTML =  nama;
        document.getElementById("tanggalHari").innerHTML = tanggal;
    }

    var daftarTugas = JSON.parse(localStorage.getItem("tugas")) || [];

    

     
    function tambahTugas() {
         var isiTugas = document.getElementById("inputTugas").value;

         if (isiTugas == "") {
            tampilToast("⚠️ Tugas tidak boleh kosong!");
            return;
         }

         var tugas = {
            teks: isiTugas,
            selesai: false,
            pin: false,
            tanggal: new Date().toDateString(),
            prioritas: document.getElementById("prioritasTugas").value,
            deadline: document.getElementById("deadlineTugas").value,
            kategori: document.getElementById("kategoriTugas").value,
            subtask: []
         };

         daftarTugas.push(tugas);
         localStorage.setItem("tugas",JSON.stringify(daftarTugas));
         tampilkanDaftarTugas();
         document.getElementById("inputTugas").value = "";
         tampilToast("✓ Tugas berhasil ditambahkan!");
         updateStatistik();
    }

    document.getElementById("inputTugas").addEventListener("keydown", function(e) {
          if (e.key === "Enter") tambahTugas()
         })

// ===== FILTER & KATEGORI TUGAS =====
var kategoriAktif = "semua";

function setKategori(kategori) {
  kategoriAktif = kategori;

  var semuakat = ["semua","kerja","belajar","rumah","personal"];
  semuakat.forEach(function(k) {
    document.getElementById("kat-" + k).classList.remove("aktif");
  });

  document.getElementById("kat-" + kategori).classList.add("aktif")

  tampilkanDaftarTugas();
  
}


var filterAktif = "semua";

function setFilter(filter) {
 filterAktif = filter;
 tampilkanDaftarTugas();
}

var modePilih = false;
var dipilih = [];

function toggleModePilih() {
  modePilih = !modePilih;
  dipilih = [];
  var btn = document.getElementById("btnModePilih");
  var batch = document.getElementById("batchAction");
  if (modePilih) {
    btn.innerHTML = "✕ Batal Pilih";   
    btn.style.background = "var(--peach)";
    batch.style.display = "flex";
  } else {
    btn.innerHTML = "☑️ Pilih";
    btn.style.background = "var(--peach-light)";
    batch.style.display = "none";
  }
  tampilkanDaftarTugas();
}

function toggleFilterPanel() {
  var panel = document.getElementById("filterPanel");
  panel.classList.toggle("terbuka");
}

function togglePilihTugas(index) {
  var pos = dipilih.indexOf(index);
  if (pos === -1) {
    dipilih.push(index);
  } else {
    dipilih.splice(pos, 1);
  }
}

function batchSelesai() {
  if (dipilih.length === 0) return;
  dipilih.forEach(function(index) {
    daftarTugas[index].selesai = true;
  });
  localStorage.setItem("tugas", JSON.stringify(daftarTugas));
  dipilih = [];
  tampilkanDaftarTugas();
}

function batchHapus() {
  if (dipilih.length === 0) return;
  dipilih.sort(function(a, b) { return b - a;});
  dipilih.forEach(function(index) {
    daftarTugas.splice(index, 1);
  });
  localStorage.setItem("tugas", JSON.stringify(daftarTugas));
  dipilih = [];
  tampilkanDaftarTugas();
}

function batchBatalPilih() {
  dipilih = [];
  tampilkanDaftarTugas();
}

// ===== DAFTAR TUGAS (CRUD & TAMPILAN) =====
 function tampilkanDaftarTugas() {
    var daftar = document.getElementById("daftarTugas");
    daftar.innerHTML = "";

    var hari_ini = new Date();
    hari_ini.setHours(0,0,0,0);

    var tugasTampil = daftarTugas.filter(function(t) {
      if (filterAktif === "aktif") return !t.selesai;
      if (filterAktif === "selesai") return t.selesai;
      if (filterAktif === "terlambat") return !t.selesai && t.deadline && new Date(t.deadline) < hari_ini;
      return true;
    });

     if (kategoriAktif !== "semua") {
        tugasTampil = tugasTampil.filter(function(t) {
          return t.kategori === kategoriAktif
        })
      }

      var kataCari = document.getElementById("searchTugas").value.toLowerCase();
      if (kataCari !== "") {
        tugasTampil = tugasTampil.filter(function(t) {
          return t.teks.toLowerCase().includes(kataCari);
        });
      }

    var sortPilihan = document.getElementById("sortTugas").value;
    var urutanPrioritas ={ "tinggi": 1, "sedang": 2, "rendah": 3 };
    
    tugasTampil.sort(function(a, b ) {
      return (b.pin ? 1 : 0) - (a.pin ? 1 : 0);
    });

    if (sortPilihan === "prioritas") {
      tugasTampil.sort(function(a, b) {
        return urutanPrioritas[a.prioritas] - urutanPrioritas[b.prioritas];
      });     
    } else if (sortPilihan === "deadline") {
      tugasTampil.sort(function(a, b) {
        if (!a.deadline) return 1;
        if (!b .deadline) return -1;
        return new Date(a.deadline) - new Date(b.deadline);
      });
    } else if (sortPilihan === "dibuat") {
      tugasTampil.sort(function(a, b ) {
        return new Date(b.tanggal) - new Date(a.tanggal);
      });
    }

    if (daftarTugas.length === 0)  {
      daftar.innerHTML = 
      "<div class='empty-state'>" +
      "<div class='empty-state-icon'>🐱</div>" +
      "<div class='empty-state-judul'>Belum ada tugas nih~</div>" +
      "<p class='empty-state-teks'>Yuk mulai hari ini dengan<br>satu tugas kecil dulu! 🌱</p>" +
      "<button onclick='document.getElementById(\"inputTugas\").focus()' class='btn-empty-state'>Tambah Tugas</button>" +
      "</div>"
      return;     
    }

    var jumlahSelesai = 0;

    for (var i = 0; i < tugasTampil.length; i++) {
        var tugas = tugasTampil[i];
        var indexAsli = daftarTugas.indexOf(tugas);

        if (tugas.selesai === true) {
          jumlahSelesai = jumlahSelesai + 1; 
        }

        var kelasSelesai = tugas.selesai ? "selesai" : "";
        var kelasCheck = tugas.selesai ? "centang" : "";

        var badgeDeadline = "";
        var ikonKategori = { umum:"📋", kerja: "💼", belajar: "📚", rumah: "🏠", personal: "🎯"};
        var badgeKategori = tugas.kategori && tugas.kategori !== "umum"
        ? "<span class='badge-info'>" + ikonKategori[tugas.kategori] + " " + tugas.kategori + "</span>"
        : "";

        if (tugas.deadline) {
          var hari_ini = new Date ();
          hari_ini.setHours(0,0,0,0);
          var tgl_deadline = new Date(tugas.deadline);
          if (!tugas.selesai && tgl_deadline < hari_ini) {
            badgeDeadline = "<span class='badge-terlambat'>Terlambat ⚠️</span>";
          } else if (!tugas.selesai) {
            badgeDeadline = "<span class='badge-info'>📅 " + tugas.deadline + "</span>";
          }
        }

        var subtaskHtml = "";
        if (tugas.subtask && tugas.subtask.length > 0) {
          subtaskHtml += "<div class='subtask-wrap'>"
           for (var s = 0; s < tugas.subtask.length; s++) {
               var sub = tugas.subtask[s];
               var subCheck = sub.selesai ? "✓" : "";
               var kelasSubCheck = sub.selesai ? "subtask-check selesai" : "subtask-check";
               var kelasSubTeks = sub.selesai ? "subtask-teks selesai" : "subtask-teks";
               var idxAsli = indexAsli;
               var idxSub = s;
              subtaskHtml += "<div class='subtask-row'>" +
              "<div onclick='cekSubtask(" + idxAsli + "," + idxSub + ")' class='" + kelasSubCheck + "'>" + subCheck + "</div>" +
              "<span class='" + kelasSubTeks + "'>" + sub.teks + "</span>" +
              "<div onclick='hapusSubtask(" + idxAsli + "," + idxSub + ")' class='subtask-hapus'>✕</div>" +
              "</div>";
           }
            subtaskHtml += "</div>"
        }

        var inputSubtaskHtml = "<div class='input-subtask-wrap'>" +
          "<input id='inputSub" + indexAsli + "' type='text' placeholder='+ tambah sub-task...' class='input-subtask' onkeydown='if(event.key===\"Enter\") tambahSubtask(" + indexAsli + ")'>" +
          "<button onclick='tambahSubtask(" + indexAsli + ")' class='btn-tambah-subtask'>+</button>" +
          "</div>";

          daftar.innerHTML += "<div class='item-tugas item-tugas-kolom " + kelasSelesai + "'>" +
          "<div class='item-tugas-header'>" +
          (modePilih ? "<input type='checkbox' onchange='togglePilihTugas(" + indexAsli + ")' " + (dipilih.includes(indexAsli) ? "checked" : "") + " class='checkbox-pilih'>" : "") +
          "<div class='task-check " + kelasCheck + "' onclick='cekTugas(" + indexAsli + ")'></div>" +
          "<span class='tugas-teks-wrap'><span class='teks-tugas'>" + tugas.teks + " " + (tugas.prioritas === "tinggi" ? "🔴" : tugas.prioritas === "sedang" ? "🟡" : "🟢") + "</span> " + badgeDeadline + " " + badgeKategori + "</span>" +
          "<button class='btn-pin " + (tugas.pin ? "sudah-pin" : "") + "'  onclick='togglePin(" + indexAsli + ")'>📌</button>" +
          "<button onclick='editTugas(" + indexAsli + ")'>✏️</button>" +
          "<button onclick='hapusTugas(" + indexAsli + ")'>✕</button>" +
          "</div>" +
          subtaskHtml +
          inputSubtaskHtml +
          "</div>";
    }
    
    var persen = 0;
    if (daftarTugas.length > 0) {
      persen = (jumlahSelesai / daftarTugas.length) * 100;
    }

    var pb = document.getElementById("progressBar");
    if (pb) {
      pb.style.width = persen + "%";
    }  
    var st = document.getElementById("statusTugas");
    if(st) {
      st.innerHTML = jumlahSelesai + " dari " + daftarTugas.length + " tugas Selesai";
    }

    var elemelevel = document.getElementById("levelUser");
    if (elemelevel) {
    if (jumlahSelesai <= 2) {
      elemelevel.innerHTML = "⭐ Level: Pemula 🐣"
    } else if (jumlahSelesai <= 5) {
      elemelevel.innerHTML = "⭐ Level: Si Rajin 🔥";
    } else {
      elemelevel.innerHTML = "⭐ Level: Penakluk Hari 👑";
    }
  }
}

 function cekTugas(index) {
    daftarTugas[index].selesai = !daftarTugas[index].selesai;
    localStorage.setItem("tugas", JSON.stringify(daftarTugas));
    tampilkanDaftarTugas();
    updateStatistik();

    if (daftarTugas[index].selesai === true) {
      hitungStreak();
    }
 }

 var indexSedangDihapus = null;

 function hapusTugas(index) {
   indexSedangDihapus = index
   document.getElementById("modalHapus").style.display = "flex";
 }

 function tutupModalHapus() {
  document.getElementById("modalHapus").style.display = "none";
  indexSedangDihapus = null;
 }

 function konfirmasiHapus() {
  daftarTugas.splice(indexSedangDihapus, 1);
  localStorage.setItem("tugas", JSON.stringify(daftarTugas));
  tampilkanDaftarTugas();
  tutupModalHapus();
  tampilToast("🗑️ Tugas berhasil dihapus!");
  updateStatistik();
 }

 var indexSedangDiedit = null;

 function editTugas(index) {
  indexSedangDiedit = index;
  document.getElementById("inputEditTugas").value = daftarTugas[index].teks;
  var modal = document.getElementById("modalEdit");
  modal.style.display = "flex";
 }

 function tutupModal() {
  document.getElementById("modalEdit").style.display = "none";
  indexSedangDiedit = null;
 }

 function simpanEdit() {
  var teksbaru = document.getElementById("inputEditTugas").value.trim();
  if(teksbaru === "") return;
  daftarTugas[indexSedangDiedit].teks = teksbaru;
  localStorage.setItem("tugas", JSON.stringify(daftarTugas));
  tampilkanDaftarTugas();
  tutupModal();
  tampilToast("✓ Tugas berhasil diedit!");
  updateStatistik();
 }

 function tambahSubtask(index) {
  var input = document.getElementById("inputSub" + index);
  var teks = input.value.trim();
  if (teks === "") return;
  if (!daftarTugas[index].subtask) daftarTugas[index].subtask = [];
  daftarTugas[index].subtask.push({ teks: teks, selesai: false });
  localStorage.setItem("tugas",JSON.stringify(daftarTugas));
  tampilkanDaftarTugas();
 }

 function cekSubtask(indexTugas, indexSub) {
  daftarTugas[indexTugas].subtask[indexSub].selesai = !daftarTugas[indexTugas].subtask[indexSub].selesai;
  localStorage.setItem("tugas", JSON.stringify(daftarTugas));
  tampilkanDaftarTugas();
 }

 function hapusSubtask(indexTugas, indexSub) {
  daftarTugas[indexTugas].subtask.splice(indexSub, 1);
  localStorage.setItem("tugas", JSON.stringify(daftarTugas));
  tampilkanDaftarTugas();
 }

 var sedangTransisi = false;

// ===== NAVIGASI TAB =====
function pindahTab(namaTab) {
  if (sedangTransisi) return;
  sedangTransisi = true;

  var tabAktif = document.querySelector(".konten-tab.aktif-tab");

  var semuaTombol = document.querySelectorAll(".bottom-nav button");
  semuaTombol.forEach(function(tombol) {
    tombol.classList.remove("aktif");
  });
  document.getElementById("btn-" + namaTab).classList.add("aktif");

  if (tabAktif) {
    tabAktif.classList.remove("aktif-tab");
    setTimeout(function() {
      var tabTarget = document.getElementById("tab-" + namaTab);
      tabTarget.classList.add("aktif-tab");
      if (namaTab === 'statistik') updateStatistik();
      if (namaTab === 'kalender') renderKalender();
      sedangTransisi = false;
    }, 300);
  } else {
    var tabTarget = document.getElementById("tab-" + namaTab);
    tabTarget.classList.add("aktif-tab");
    if (namaTab === 'statistik') updateStatistik();
    if (namaTab === 'kalender') renderKalender();
    sedangTransisi = false;
  }
}

// ===== STATISTIK =====
 function updateStatistik() {
  var selesai = daftarTugas.filter(t => t.selesai).length;
  var belum = daftarTugas.length - selesai;
  var pct = daftarTugas.length > 0
    ? Math.round((selesai / daftarTugas.length)* 100)
    : 0;
  if (daftarTugas.length === 0) {
  document.getElementById("stat-total").innerText = "0";
  document.getElementById("stat-selesai").innerText = "0";
  document.getElementById("stat-belum").innerText = "0";
  document.getElementById("stat-pct").innerText = "0%";
  document.getElementById("chartMinggu").innerHTML =
  "<div style='text-align:center; padding:32px 0; color:var(--text-soft);'>" +
  "<div style='font-size:48px; margin-bottom:12px;'>📊</div>" +
  "<p>Belum ada data statistik.<br>Yuk tambah tugas dulu!</p>" +
  "</div>";
  return;
}

  document.getElementById("stat-total").innerText = daftarTugas.length;
  document.getElementById("stat-selesai").innerText = selesai;
  document.getElementById("stat-belum").innerText = belum;
  document.getElementById("stat-pct").innerText = pct + "%";


  var hari = ["Min","Sen","Sel","Rabu","Kam","Jum","Sab"];
  var sekarang = new Date();
  var isDark = document.body.classList.contains("dark")
  var barBg = isDark ? "#1e3a5f" : "var(--peach)";
  var barFill = isDark ? "#60a5fa" : "var(--brown-mid)";
  var labelWarna = isDark ? "#7a9cc0" : "var(--text-soft)";
  
  var chartHtml = "";

  for (var i = 0; i < 7; i++) {
    var tanggalHari = new Date();
    tanggalHari.setDate(sekarang.getDate() - (6 - i));
    var tanggalStr = tanggalHari.toDateString();

    var JumlahHari = daftarTugas.filter(function(t) {
      return t.tanggal === tanggalStr;
    }).length;

    var tinggi = JumlahHari * 20;
    if (tinggi > 100) tinggi = 100;
    chartHtml +=
    "<div style='display:flex;flex-direction:column;align-items:center;flex:1;gap:6px'>" +
        "<div style='font-size:11px;color:" + labelWarna + "'>" + JumlahHari + "</div>" +
        "<div style='width:100%;background:" + barBg + ";border-radius:6px;height:100px;display:flex;align-items:flex-end'>" +
          "<div style='width:100%;background:" + barFill + ";border-radius:6px;height:" + tinggi + "px;transition:height 0.3s'></div>" +
        "</div>" +
        "<div style='font-size:10px;color:" + labelWarna + "'>" + hari[tanggalHari.getDay()] + "</div>" +
      "</div>";
  }
  document.getElementById("chartMinggu").innerHTML = 
  "<div style='display:flex;gap:8px;align-items:flex-end;height:140px'>" + chartHtml + "</div>";
}

// ===== PROFIL & PENGATURAN =====
 function resetData() {
  if (confirm("Yakin mau hapus semua data? Gak bisa balik lagi loh!")) {
    localStorage.clear();
    location.reload();
  }
 }

 function gantiNama() {
  var namaBaru = document.getElementById("inputNamaBaru").value.trim();
  if(!namaBaru) return;
  localStorage.setItem("nama", namaBaru);
  tampilkanDashboard();
  tampilToast("✓ Nama berhasil diganti!");
 }

 function toggleDarkMode() {
  document.body.classList.toggle("dark");
  var btn = document.getElementById("btnDark");
  if (document.body.classList.contains("dark")) {
    btn.innerHTML = "☀️ Light"
    localStorage.setItem("darkMode" , "on");
  } else {
    btn.innerHTML = "🌙 Dark"
    localStorage.setItem("darkMode" , "off");
  }
  tampilkanDaftarTugas();
 }

// ===== KALENDER =====
 function klikTanggal(tanggal) {
  var namaBulan = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
  var bulan = namaBulan[tanggalKalender.getMonth()]
  var tahun = tanggalKalender.getFullYear();
  
  var tanggalDipilih = new Date(tahun, tanggalKalender.getMonth(), tanggal).toDateString();

  var tugasHariItu = daftarTugas.filter(function(t) { 
    return t.tanggal === tanggalDipilih;
  });

  document.getElementById("modalTanggalJudul").textContent = tanggal + " " + bulan + " " + tahun;

  var isiModal = document.getElementById("modalTanggalIsi");

  if (tugasHariItu.length === 0) {
    isiModal.innerHTML = "<p style='text-align:center; color:var(--text-soft);'>Belum ada tugas di hari ini!</p>";
  } else { 
    isiModal.innerHTML = tugasHariItu.map(function(t) {
      return "<p style='margin-bottom:8px'>• " + t.teks + "</p>"
    }).join(""); 
  }
 
 document.getElementById("modalTanggal").style.display = "flex";
 }

 function tutupModalTanggal() {
  document.getElementById("modalTanggal").style.display = "none";
 }

 var tanggalKalender = new Date();

 function renderKalender() {
  var namaBulan = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];

  document.getElementById("judulBulan").textContent = 
  namaBulan[tanggalKalender.getMonth()] + " " + tanggalKalender.getFullYear();

  var grid = document.getElementById("kalGrid");
  var namaHari = ["Min","Sen","Sel","Rab","Kam","Jum","Sab"]

  var html = namaHari.map(function(h) {
    return "<div class ='kal-nama-hari'>" + h + "</div>";
  }).join('')

  var hariPertama = new Date(
    tanggalKalender.getFullYear(),
    tanggalKalender.getMonth(),
    1
  ).getDay();

  var hariTerakhir = new Date(
    tanggalKalender.getFullYear(),
    tanggalKalender.getMonth() + 1,
    0
  ).getDate();

  var sekarang = new Date();

  for (var i = 0; i <hariPertama; i++) {
    html += "<div class='kal-hari kosong'></div>";
  }
  
  for (var d = 1; d <= hariTerakhir; d++) {
    var adaHariIni = 
    d === sekarang.getDate() &&
    tanggalKalender.getMonth() === sekarang.getMonth() &&
    tanggalKalender.getFullYear() === sekarang.getFullYear();

    var kelasHariIni = adaHariIni ? "hari-ini" : "";

    var tglCek = new Date(tanggalKalender.getFullYear(), tanggalKalender.getMonth(),d).toDateString();
    var adaTugas = daftarTugas.some(function(t) {
      return t.tanggal === tglCek || t.deadline === new Date(tanggalKalender.getFullYear(), tanggalKalender.getMonth(),d).toISOString().split('T')[0];
    });
    var kelasDot = adaHariIni ? "kal-dot putih" : "kal-dot";
    var dotHtml = adaTugas ? "<div class='" + kelasDot + "'></div>" : "";

    html += "<div class='kal-hari " + kelasHariIni + "' onclick='klikTanggal(" + d + ")'>" + d + dotHtml + "</div>";
  }

  grid.innerHTML = html;
 }
 
 function gantiBulan(arah) {
  tanggalKalender.setMonth(tanggalKalender.getMonth() + arah);
  renderKalender();
 }

// ===== NOTIFIKASI BROWSER =====
 function mintaIzinNotifikasi() {
  if (!("Notification" in window)) {
    tampilToast("❌ Browser kamu tidak support notifikasi");
    return;
  }

  Notification.requestPermission().then(function(izin) {
    if (izin === "granted") {
      tampilToast("🔔 Notifikasi berhasil diaktifkan!");
      cekNotifikasiDeadline();
    } else {
      tampilToast("❌ Izin notifikasi ditolak");
    }
  });
 }

 function kirimNotifikasi(judul, isi) {
  if (Notification.permission !== "granted") return;

  new Notification(judul, {
    body: isi,
    icon: "https://cdn.jsdelivr.net/npm/twemoji@14/assets/72x72/1f431.png"
  });
 }

// ===== UTILITAS UI LAIN =====
 function scrollKeAtas() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== ONBOARDING =====
function tampilOnboarding() {
  if (!localStorage.getItem("sudahOnboarding")) {
    document.getElementById("overlayOnboarding").classList.add("tampil");
  }
}

function tutupOnboarding() {
  document.getElementById("overlayOnboarding").classList.remove("tampil");
  localStorage.setItem("sudahOnboarding", "ya")
}

window.addEventListener('scroll', function() {
  var btn = document.getElementById("btnScrollTop");
  if (window.scrollY > 300) {
    btn.style.display = "block";
  } else {
    btn.style.display = "none";
  }
});

// ===== STREAK HARIAN =====
function hitungStreak() {
  var streakHitung = parseInt(localStorage.getItem("streakHitung")) || 0;
  var streakTerakhir = localStorage.getItem("streakTerakhir");
  var hariIni = new Date().toDateString();

  if (streakTerakhir === hariIni) {

    tampilStreak(streakHitung);
    return;
  }

  if (streakTerakhir) {
    var tglTerakhir = new Date(streakTerakhir);
    var tglHariIni = new Date(hariIni);
    var selisihHari = Math.round((tglHariIni - tglTerakhir) / (1000 * 60 * 60 * 24))

    if (selisihHari === 1) {
      streakHitung = streakHitung + 1;
    } else {

      streakHitung = 1;
    }
  } else {
    streakHitung = 1;
  } 

  localStorage.setItem("streakHitung", streakHitung);
  localStorage.setItem("streakTerakhir", hariIni);
  tampilStreak(streakHitung);
}

function tampilStreak(angka) {
  var el = document.getElementById("streakDisplay");
  if (!el) return;
  var emoji = angka >= 7 ? "🔥🔥" : "🔥"
  el.innerHTML = emoji + "Streak: " + angka + " Hari";
}

function muatStreak() {
  var streakHitung = parseInt(localStorage.getItem("streakHitung")) || 0;
  tampilStreak(streakHitung);
}


    window.onload = function() {
  if (localStorage.getItem("darkMode") === "on") {
    document.body.classList.add("dark");
    var btn = document.getElementById("btnDark");
    if (btn) btn.innerHTML = "☀️ Light";
  }

  var namaTerdaftar = localStorage.getItem("nama");
  if (namaTerdaftar) {
    showPage('halaman-utama');
    document.querySelector(".bottom-nav").style.display = "flex";
    var sapaan = document.getElementById("sapaanNama");
    if (sapaan) sapaan.innerText = "Halo, " + namaTerdaftar + "! 👋";

    pindahTab('home');
    tampilkanDashboard();
    tampilSkeleton();
    tampilOnboarding();
    muatStreak();
    muatMood();
    tampilQuotes();
    muatTema();
    cekNotifikasiDeadline();
    muatHabit();
    muatJurnal();

    setTimeout(function() {
      tampilkanDaftarTugas();
    }, 500);

  } else {
    showPage('halaman-sambutan');
  }
}

// ===== EXPORT PDF =====
function exportPDF() {
  var {jsPDF} = window.jspdf;
  var doc = new jsPDF();

  var nama = localStorage.getItem("nama") || "pengguna";
  var streak = parseInt(localStorage.getItem("streakHitung") || "0");
  var tugas = daftarTugas;
  var total = tugas.length;
  var selesai = tugas.filter(function(t) { return t.selesai;}).length;
  var belum = total - selesai;
  var pct = total > 0 ? Math.round((selesai / total) * 100) : 0;
  var tanggal = new Date().toLocaleDateString("id-ID", {
    weekday: "long", year: "numeric", month: "long", day: "numeric"
  });

  doc.setFillColor(139, 90, 60);
  doc.rect(0, 0, 210, 40, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("Daynest", 14, 20);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Ringkasan Statistik Produktivitas", 14, 30);

  doc.setTextColor(80, 50, 30);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Halo, " + nama + "!" , 14, 55);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(120, 90, 60);
  doc.text(tanggal, 14 , 63);

  doc.setDrawColor(200, 160, 120);
  doc.line(14, 68, 196, 68);

  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(80, 50, 30);
  doc.text("Statistik Tugas", 14, 80);

  var stats = [
    ["Total Tugas", total],
    ["Tugas Selesai", selesai],
    ["Belum Selesai", belum],
    ["Completion Rate", pct + "%"],
    ["Streak Harian", streak + " hari"]
  ];

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  stats.forEach(function(item, i) {
    var y = 92 + (i * 12);
    doc.setFillColor(250, 240, 230);
    doc.roundedRect(14, y - 7, 182, 10, 2, 2, "F");
    doc.setTextColor(100, 70, 40);
    doc.text(item[0], 20, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(139, 90, 60);
    doc.text(String(item[1]), 170, y, { align: "right"});
    doc.setFont("helvetica", "normal");
  });

  doc.setFontSize(9);
  doc.setTextColor(180, 150, 120);
  doc.text("Dibuat oleh Daynest •" + tanggal, 14, 280);

  doc.save("daynest-statistik.pdf");
  tampilToast("📄 PDF berhasil didownload!")
  }

  var pomodoroInterval = null;
  var pomodoroSisa = 25 * 60;
  var pomodoroJalan = false;
  var pomodoroModeAktif = "work";

  function togglePomodoro() {
    var panel = document.getElementById("pomodoroPanel");
    panel.classList.toggle("terbuka");
  }

  function setPomodoroMode(mode) {
    pomodoroModeAktif = mode;
    pomodoroReset();
    document.getElementById("pom-work").classList.toggle("aktif-mode", mode === "work");
    document.getElementById("pom-break").classList.toggle("aktif-mode", mode === "break");
    document.getElementById("pomodoroMode").textContent = mode === "work" ? "🍅 Work Time" : "☕ Break Time"
  }

  function pomodoroStart() {
    if (pomodoroJalan) {
      clearInterval(pomodoroInterval);
      pomodoroJalan = false;
      document.getElementById("btnPomStart").textContent = "▶ Start";
      return;
    }

    pomodoroJalan = true;
    document.getElementById("btnPomStart").textContent = "⏸ Pause";

    pomodoroInterval = setInterval(function() {
      pomodoroSisa--;
      tampilWaktuPomodoro();

      if (pomodoroSisa <= 0) {
        clearInterval(pomodoroInterval);
        pomodoroJalan = false;
        document.getElementById("btnPomStart").textContent = "▶ Start";

        if (pomodoroModeAktif === "work") {
          tampilToast("🍅 Sesi selesai! Waktunya istirahat ☕");
          setPomodoroMode("break");
        } else {
          tampilToast("☕ Break selesai! Siap kerja lagi? 💪");
          setPomodoroMode("work");
        }
      }
    }, 1000);
  }

  function pomodoroReset() {
    clearInterval(pomodoroInterval);
    pomodoroJalan = false;
    pomodoroSisa = pomodoroModeAktif === "work" ? 25 * 60 : 5 * 60;
    document.getElementById("btnPomStart").textContent = "▶ Start";
    tampilWaktuPomodoro();
  }

  function tampilWaktuPomodoro() {
    var menit = Math.floor(pomodoroSisa / 60);
    var detik = pomodoroSisa % 60;
    document.getElementById("pomodoroTimer").textContent = 
    String(menit).padStart(2, "0") + ":" + String(detik).padStart(2, "0")
  }

  function pilihMood(mood) {
    var hariIni = new Date().toDateString();
    var riwayat = JSON.parse(localStorage.getItem("moodRiwayat")) || {};

    riwayat[hariIni] = mood;
    localStorage.setItem("moodRiwayat", JSON.stringify(riwayat));

    tampilMoodHariIni();
    tampilRiwayatMood();
    tampilToast("mood tesimpan " + mood);
  }

  function tampilMoodHariIni() {
    var hariIni = new Date(). toDateString();
    var riwayat = JSON.parse(localStorage.getItem("moodRiwayat")) || {};
    var moodHariIni = riwayat[hariIni];

  var tombol = ["mood-senang", "mood-netral", "mood-sedih"];
  tombol.forEach(function(id) {
    document.getElementById(id).classList.remove("mood-aktif");
  }); 

  var terpilihEl = document.getElementById("moodTerpilih");

  if (moodHariIni) {
    var map = { "😊": "mood-senang", "😐": "mood-netral", "😔": "mood-sedih" };
    if (map[moodHariIni]) {
      document.getElementById(map[moodHariIni]).classList.add("mood-aktif");
    }
    terpilihEl.textContent = "mood hari ini: " + moodHariIni;
  } else {
    terpilihEl.textContent = "Belum pilih mood hari ini";
  }
} 

// ===== MOOD TRACKER =====
function tampilRiwayatMood() {
  var riwayat = JSON.parse(localStorage.getItem("moodRiwayat")) || {};
  var kontainer = document.getElementById("moodRiwayat");
  if(!kontainer) return;

  var hasil = "";
  for ( var i = 6; i >= 0; i--) {
    var tgl = new Date();
    tgl.setDate(tgl.getDate() - i);
    var key = tgl.toDateString();
    var mood = riwayat[key] || "—";
    var label = i === 0 ? "Hari ini" : tgl.toLocaleDateString("id-ID", { weekday: "short"});

    hasil += '<div class="mood-riwayat-item"><span>' + mood + '</span>' + label + '</div>';
  }
  kontainer.innerHTML = hasil;
}

function muatMood() {
  tampilMoodHariIni();
  tampilRiwayatMood();
}

// ===== QUOTES HARIAN =====
var daftarQuotes = [
  "Mulai dari mana kamu berada, gunakan apa yang kamu punya. 🌱",
  "Satu tugas selesai hari ini lebih baik dari rencana sempurna yang tidak pernah dimulai. 🚀",
  "Konsistensi kecil mengalahkan motivasi besar yang datang sesekali. 🔥",
  "Kamu tidak harus hebat untuk memulai, tapi kamu harus memulai untuk menjadi hebat. ⭐",
  "Setiap hari adalah kesempatan baru untuk menjadi versi terbaik dirimu. 🌿",
  "Jangan bandingkan perjalananmu dengan orang lain — kamu punya jalur sendiri. 🛤️",
  "Progres sekecil apapun tetap progres. Terus melangkah! 👣",
  "Hari ini kerja keras, hari esok nikmati hasilnya. 💪",
  "Yang penting bukan seberapa cepat, tapi seberapa konsisten. ⏳",
  "Satu langkah setiap hari akan membawamu jauh lebih jauh dari yang kamu bayangkan. 🌄",
  "Produktivitas bukan tentang sibuk — tapi tentang hasil. 🎯",
  "Istirahat juga bagian dari proses. Jangan lupa jaga dirimu. 🌙",
  "Kamu sudah lebih maju dari kemarin. Itu sudah luar biasa! 🏆",
  "Kesuksesan adalah hasil dari kebiasaan kecil yang dilakukan setiap hari. 📈",
  "Mulai hari ini dengan niat yang jelas dan hati yang tenang. ☀️"
];

function tampilQuotes() {
  var hariIni = new Date().toDateString();
  var tersimpan = JSON.parse(localStorage.getItem("quotesHari")) || {};

  if (!tersimpan.tanggal || tersimpan.tanggal !== hariIni) {
    var index = Math.floor(Math.random() * daftarQuotes.length);
    tersimpan = { tanggal: hariIni, quote: daftarQuotes[index] };
    localStorage.setItem("quotesHari", JSON.stringify(tersimpan));
  }

  var el = document.getElementById("quotesHari");
  if (el) el.textContent = "✨ " + tersimpan.quote;
}

// ===== TEMA WARNA =====
var daftarTema = ["default", "biru", "hijau", "ungu"];

function pilihTema(tema) {
  daftarTema.forEach(function(t) {
    document.body.classList.remove("tema-" + t)
  });

  if (tema !== "default") {
    document.body.classList.add("tema-" + tema);
  }

  localStorage.setItem("temaTerpilih", tema);
  updateTombolTema(tema);
  tampilToast("🎨 Tema" + tema + "diterapkan!");
}

function updateTombolTema(tema) {
  daftarTema.forEach(function(t) {
    var btn = document.getElementById("tema-" + t);
    if (btn) btn.classList.remove("aktif-tema");
  });
  var aktif = document.getElementById("tema-" + tema);
  if (aktif) aktif.classList.remove("aktif-tema");
}

function muatTema() {
  var tema = localStorage.getItem("temaTerpilih") || "default";
  pilihTema(tema);
}

// ===== NOTIFIKASI TERJADWAL ===== 

function cekNotifikasiDeadline() {
  if (Notification.permission !== "granted") return;
  if (localStorage.getItem("notifikasiAktif") !== "true") return;

  var hariIni = new Date();
  hariIni.setHours(0, 0, 0, 0);

  var tugasTerlambat = [];
  var tugasHariIni = [];

  daftarTugas.forEach(function(t) {
    if (t.selesai || !t.deadline) return;

    var tgldeadline = new Date(t.deadline);
    tgldeadline.setHours(0, 0, 0, 0);

    var selisih = (tgldeadline - hariIni) / (1000 * 60 * 60 * 24);

    if (selisih < 0) {
      tugasTerlambat.push(t.teks);
    } else if (selisih === 0) {
      tugasHariIni.push(t.teks);
    }
  });

  if (tugasTerlambat.length > 0) {
    kirimNotifikasi(
      "⚠️ Tugas Terlambat!",
      tugasTerlambat.length + " tugas sudah melewati deadline: " + tugasTerlambat.join(", ")
    );
  }

  if (tugasHariIni.length > 0) {
    kirimNotifikasi(
      "📅 Deadline Hari Ini",
      tugasHariIni.length + "tugas jatuh tempo hari ini: " + tugasHariIni.join(", ")
    );
  }
}


function toggleNotifikasi() {
  var aktif = localStorage.getItem("notifikasiAktif") === "true";

  if (aktif) {
    localStorage.setItem("notifikasiAktif", "false");
    tampilToast("🔕 Notifikasi dimatikan");
    updateTombolNotifikasi();
  } else {
    mintaIzinNotifikasi();
    localStorage.setItem("notifikasiAktif", "true");
    updateTombolNotifikasi();
  }
}

function updateTombolNotifikasi() {
  var aktif = localStorage.getItem("notifikasiAktif") === "true";
  var btn = document.getElementById("btnNotifikasi");
  if (!btn) return;

  if (aktif) {
    btn.textContent = "🔕 Matikan Notifikasi";
    btn.style.background = "var(--brown-mid)";
    btn.style.color = "white";
  } else {
    btn.textContent = "🔔 Aktifkan Notifikasi"
    btn.style.background = "var(--peach-light)";
    btn.style.color = "var(--brown-mid)";
  }
}

// ===== HABIT TRACKER =====
var daftarHabit = JSON.parse(localStorage.getItem("habitData")) || [];

function tambahHabit() {
  var input = document.getElementById("inputHabit");
  var nama = input.value.trim();
  if (!nama) return;

  var habit = {
    id: Date.now(),
    nama: nama,
    streak: 0,
    terakhirCentang: null,
    centangHariIni: false
  };

  daftarHabit.push(habit);
  simpanHabit();
  input.value = "";
  tampilHabit();
  tampilToast("🌱 Habit baru ditambahkan!");
}

function centangHabit(id) {
  var hariIni = new Date().toDateString();

  daftarHabit = daftarHabit.map(function(h) {
    if (h.id !== id) return h;

    if (h.centangHariIni) {
      h.centangHariIni = false;
      h.streak = Math.max(0, h.streak - 1);
      h.terakhirCentang = null;
    } else {
      h.centangHariIni = true;

      if (h.terakhirCentang) {
        var tglTerakhir = new Date(h.terakhirCentang);
        var tglHariIni = new Date(hariIni);
        var selisih = Math.round((tglHariIni - tglTerakhir) / (1000 * 60 * 60 * 24))
        h.streak = selisih === 1 ? h.streak + 1 : 1;
      } else {
        h.streak = 1;
      }
      h.terakhirCentang = hariIni;
    }

    return h;
  });

  simpanHabit();
  tampilHabit();
}

function hapusHabit(id) {
  daftarHabit = daftarHabit.filter(function(h) { return h.id !== id; });
  simpanHabit();
  tampilHabit();
  tampilToast("🗑️ Habit dihapus");
}

function simpanHabit() {
  localStorage.setItem("habitData", JSON.stringify(daftarHabit));
}

function resetCentangHarian() {
  var hariIni = new Date().toDateString();
  var terakhirReset = localStorage.getItem("habitResetTerakhir");

  if (terakhirReset === hariIni) return;

  daftarHabit = daftarHabit.map(function(h) {
    h.centangHariIni = false;
    return h;
  });

  localStorage.setItem("habitResetTerakhir", hariIni);
  simpanHabit();
}

function tampilHabit() {
  var kontainer = document.getElementById("daftarHabit");
  if (!kontainer) return;

  if (daftarHabit.length === 0) {
    kontainer.innerHTML = "<p class='habit-empty'>Belum ada habit. Tambah kebiasaan pertamamu! 🌱</p>"
    return;
  }

  kontainer.innerHTML = daftarHabit.map(function(h) {
    return "<div class='habit-card'>" +
    "<div class='habit-check " + (h.centangHariIni ? "sudah-centang" : "") + "' onclick='centangHabit(" + h.id + ")'>" +
    (h.centangHariIni ? "✓" : "") +
    "</div>" +
    "<div class='habit-info'>" + 
    "<div class='habit-nama'>" + h.nama + "</div>" + 
    "<div class='habit-streak'>🔥 Streak: " + h.streak + " hari</div>" +
    "</div>" +
    "<button class='habit-hapus' onclick='hapusHabit(" + h.id + ")'>✕</button>" +
    "</div>";
  }).join("");
}

function muatHabit() {
  resetCentangHarian();
  tampilHabit();
}

// ===== JURNAL TAB =====

function formatJurnal(perintah) {
  document.execCommand(perintah, false, null);
  document.getElementById("jurnalEditor").focus();
}

function simpanJurnal() {
  var editor = document.getElementById("jurnalEditor");
  var isi = editor.innerHTML.trim();

  if (!isi || isi === "") {
    tampilToast("⚠️ Jurnal kosong!");
    return;
  }

  var hariIni = new Date().toDateString();
  var riwayat = JSON.parse(localStorage.getItem("jurnalData")) || {};

  riwayat[hariIni] = isi;
  localStorage.setItem("jurnalData", JSON.stringify(riwayat));

  tampilToast("💾 Jurnal tersimpan!")
  tampilRiwayatJurnal();
}

function tampilRiwayatJurnal() {
  var riwayat = JSON.parse(localStorage.getItem("jurnalData")) || {};
  var kontainer = document.getElementById("jurnalRiwayat");
  if (!kontainer) return;

  var keys = Object.keys(riwayat).reverse();

  if (keys.length === 0) {
    kontainer.innerHTML = "<p class='jurnal-empty'>Belum ada jurnal tersimpan 📝</p>";
    return;
  }

  kontainer.innerHTML = keys.map(function(tgl) {
    return "<div class='jurnal-item'>" +
      "<div class='jurnal-item-tanggal'>📅 " + tgl + "</div>" +
      "<div class='jurnal-item-isi'>" + riwayat[tgl] + "</div>" +
      "<button class='jurnal-item-hapus' onclick='hapusJurnal(\"" + tgl + "\")'>🗑️ Hapus</button>" +
      "</div>";
  }).join("");
}

function hapusJurnal(tgl) {
  var riwayat = JSON.parse(localStorage.getItem("jurnalData")) || {};
  delete riwayat[tgl];
  localStorage.setItem("jurnalData", JSON.stringify(riwayat));
  tampilRiwayatJurnal();
  tampilToast("🗑️ Jurnal dihapus")
}

function muatJurnal() {
  var tanggalEl = document.getElementById("jurnalTanggal");
  if (tanggalEl) {
    tanggalEl.textContent = new Date().toLocaleDateString("id-ID", {
       weekday: "long", year: "numeric", month: "long", day: "numeric"
    });
  }

  var hariIni = new Date().toDateString();
  var riwayat = JSON.parse(localStorage.getItem("jurnalData")) || {};
  var editor = document.getElementById("jurnalEditor");

if (editor && riwayat[hariIni]) {
  editor.innerHTML = riwayat[hariIni]
}

tampilRiwayatJurnal();
}

// ===== PIN TUGAS =====

function togglePin(index) {
  daftarTugas[index].pin = !daftarTugas[index].pin;
  localStorage.setItem("tugas",JSON.stringify(daftarTugas));
  tampilkanDaftarTugas();

  if (daftarTugas[index].pin) {
    tampilToast("📌 Tugas di-pin!");
  } else {
    tampilToast("📌 Pin dilepas");
  }
}