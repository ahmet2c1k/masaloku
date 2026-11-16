// app.js - Ortak Yıldız Cüzdanı, Okuma ve Ses Sistemi

// Eski önbellekleri temizle
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(regs => {
    regs.forEach(reg => reg.update());
  });
}

const YILDIZ_KEY = 'masal_yildiz_cuzdan';

// İlk geçişte eski yıldızları koru
(function migrasyon() {
  if (localStorage.getItem(YILDIZ_KEY) === null) {
    const eski = localStorage.getItem('masal_yildiz') || localStorage.getItem('toplam_yildiz') || localStorage.getItem('yildizlar') || '10';
    localStorage.setItem(YILDIZ_KEY, eski);
  }
})();

function getYildizSayisi() {
  return parseInt(localStorage.getItem(YILDIZ_KEY) || '0', 10);
}

function setYildizSayisi(yeniMiktar) {
  const deger = Math.max(0, parseInt(yeniMiktar, 10));
  localStorage.setItem(YILDIZ_KEY, deger);
  localStorage.setItem('masal_yildiz', deger);
  localStorage.setItem('toplam_yildiz', deger);
  yildizEkraniGuncelle();
  return deger;
}

function yildizEkle(miktar) {
  const suAn = getYildizSayisi();
  return setYildizSayisi(suAn + miktar);
}

function yildizHarca(miktar) {
  const suAn = getYildizSayisi();
  if (suAn < miktar) return false;
  setYildizSayisi(suAn - miktar);
  return true;
}

function yildizEkraniGuncelle() {
  const el = document.getElementById('user-stars-count');
  if (el) el.innerText = getYildizSayisi();
}

function getOkunanMasallar() {
  return JSON.parse(localStorage.getItem('okunan_masallar') || '[]');
}

function masalOkunduIsaretle(id) {
  const okunanlar = getOkunanMasallar();
  if (!okunanlar.includes(id)) {
    okunanlar.push(id);
    localStorage.setItem('okunan_masallar', JSON.stringify(okunanlar));
    yildizEkle(2);
    return true;
  }
  return false;
}

function getFavoriler() {
  return JSON.parse(localStorage.getItem('favori_masallar') || '[]');
}

function favoriDegistir(id, btnElement) {
  let favlar = getFavoriler();
  if (favlar.includes(id)) {
    favlar = favlar.filter(x => x !== id);
    if (btnElement) btnElement.innerText = '🤍';
  } else {
    favlar.push(id);
    if (btnElement) btnElement.innerText = '❤️';
  }
  localStorage.setItem('favori_masallar', JSON.stringify(favlar));
}

// Sesli Okuma Sistemi
let okumaDevamEdiyor = false;
function sesliOkuDurdur(metin, btn) {
  if (!('speechSynthesis' in window)) {
    alert('Cihazınız sesli okumayı desteklemiyor.');
    return;
  }
  if (okumaDevamEdiyor) {
    window.speechSynthesis.cancel();
    okumaDevamEdiyor = false;
    if (btn) btn.innerHTML = '🔊 Sesli Dinle';
    return;
  }
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(metin);
  u.lang = 'tr-TR';
  u.rate = 0.92;
  u.pitch = 1.1;
  u.onend = () => {
    okumaDevamEdiyor = false;
    if (btn) btn.innerHTML = '🔊 Sesli Dinle';
  };
  okumaDevamEdiyor = true;
  if (btn) btn.innerHTML = '⏹️ Okumayı Durdur';
  window.speechSynthesis.speak(u);
}

document.addEventListener('DOMContentLoaded', () => {
  yildizEkraniGuncelle();
});
