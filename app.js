// Ortak Durum ve Yerel Hafıza (LocalStorage)
const STORAGE_KEY_STARS = 'mz_user_stars';
const STORAGE_KEY_READ = 'mz_read_stories';
const STORAGE_KEY_FAVS = 'mz_favorite_stories';

// Yıldızları Getir / Güncelle
function getYildizSayisi() {
  return parseInt(localStorage.getItem(STORAGE_KEY_STARS) || '0', 10);
}

function yildizEkle(puan = 1) {
  const yeni = getYildizSayisi() + puan;
  localStorage.setItem(STORAGE_KEY_STARS, yeni);
  guncelleYildizBari();
}

function guncelleYildizBari() {
  const el = document.getElementById('user-stars-count');
  if (el) el.innerText = getYildizSayisi();
}

// Okunan Masallar
function getOkunanMasallar() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY_READ) || '[]');
}

function masalOkunduIsaretle(id) {
  const liste = getOkunanMasallar();
  if (!liste.includes(id)) {
    liste.push(id);
    localStorage.setItem(STORAGE_KEY_READ, JSON.stringify(liste));
    yildizEkle(2); // Masal bitiren çocuğa +2 yıldız hediye
    return true;
  }
  return false;
}

// Favoriler
function getFavoriler() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY_FAVS) || '[]');
}

function favoriDegistir(id, btnEl) {
  let liste = getFavoriler();
  if (liste.includes(id)) {
    liste = liste.filter(x => x !== id);
    if (btnEl) btnEl.innerText = '🤍';
  } else {
    liste.push(id);
    if (btnEl) btnEl.innerText = '❤️';
  }
  localStorage.setItem(STORAGE_KEY_FAVS, JSON.stringify(liste));
}

// SESLİ OKUMA MOTORU (Gelişmiş & Sevimli TTS)
let aktifSes = null;
let okumaDevamEdiyor = false;

function sesliOkuDurdur(metin, btnEl) {
  if (!('speechSynthesis' in window)) {
    alert('Tarayıcınız sesli okuma özelliğini desteklemiyor.');
    return;
  }

  // Zaten çalıyorsa durdur
  if (okumaDevamEdiyor) {
    window.speechSynthesis.cancel();
    okumaDevamEdiyor = false;
    btnEl.innerHTML = '🔊 Masalı Sesli Dinle';
    btnEl.classList.remove('playing');
    return;
  }

  window.speechSynthesis.cancel();
  aktifSes = new SpeechSynthesisUtterance(metin);
  aktifSes.lang = 'tr-TR';

  // --- SEVİMLİ VE MASALCI AYARLARI ---
  // 1. Ses Tonu (Pitch): 1.0 normaldir. 1.18 - 1.25 arası sesi daha tatlı, genç ve masalcı yapar.
  aktifSes.pitch = 1.2;

  // 2. Okuma Hızı (Rate): 1.0 standarttır. 0.88 çocukların kelimeleri net yakalaması için idealdir.
  aktifSes.rate = 0.88;

  // 3. Cihazdaki En Kaliteli Doğal Türkçe Sesi Bulma
  const tumSesler = window.speechSynthesis.getVoices();
  const enIyiTurkceSes = tumSesler.find(v => 
    v.lang.includes('tr') && (
      v.name.includes('Natural') || 
      v.name.includes('Google') || 
      v.name.includes('Yelda') || 
      v.name.includes('Emel') ||
      v.name.includes('Seda')
    )
  ) || tumSesler.find(v => v.lang.includes('tr'));

  if (enIyiTurkceSes) {
    aktifSes.voice = enIyiTurkceSes;
  }

  aktifSes.onstart = () => {
    okumaDevamEdiyor = true;
    btnEl.innerHTML = '⏸ Okumayı Duraklat';
    btnEl.classList.add('playing');
  };

  aktifSes.onend = () => {
    okumaDevamEdiyor = false;
    btnEl.innerHTML = '🔊 Masalı Sesli Dinle';
    btnEl.classList.remove('playing');
  };

  aktifSes.onerror = () => {
    okumaDevamEdiyor = false;
    btnEl.innerHTML = '🔊 Masalı Sesli Dinle';
    btnEl.classList.remove('playing');
  };

  window.speechSynthesis.speak(aktifSes);
}

// Mobil cihazlarda seslerin arka planda gecikmeli yüklenmesini önleme
if ('speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
  };
}
// Sayfa Açılışında Yıldızları Bas
document.addEventListener('DOMContentLoaded', () => {
  guncelleYildizBari();
});
