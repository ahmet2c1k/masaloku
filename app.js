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

// SESLİ OKUMA MOTORU (TTS - SpeechSynthesis)
let aktifSes = null;
let okumaDevamEdiyor = false;

function sesliOkuDurdur(metin, btnEl) {
  if (!('speechSynthesis' in window)) {
    alert('Tarayıcınız sesli okuma özelliğini desteklemiyor.');
    return;
  }

  if (okumaDevamEdiyor) {
    window.speechSynthesis.cancel();
    okumaDevamEdiyor = false;
    btnEl.innerHTML = '🔊 Masalı Sesli Dinle';
    btnEl.classList.remove('playing');
    return;
  }

  window.speechSynthesis.cancel(); // Varsa öncekini sustur
  aktifSes = new SpeechSynthesisUtterance(metin);
  aktifSes.lang = 'tr-TR';
  aktifSes.rate = 0.9; // Çocuklar için sakin ve net hız

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

// PWA Service Worker Kaydı
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(err => console.log('SW hatası:', err));
  });
}

// Sayfa Açılışında Yıldızları Bas
document.addEventListener('DOMContentLoaded', () => {
  guncelleYildizBari();
});
