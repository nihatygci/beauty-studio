# Sırma Beauty Studio — Website

Statik HTML/CSS/JS ile hazırlanmış premium kuaför salonu web sitesi. Build aracı gerekmiyor, doğrudan yayınlanabilir.

## GitHub Pages'te Yayınlama (ücretsiz github.io adresi)

1. **GitHub'da yeni bir repo oluştur**
   - github.com → "New repository"
   - İsim: `sirma-beauty-studio` (farklı bir isim seçersen aşağıdaki adımlarda ve `index.html`, `robots.txt`, `sitemap.xml` içindeki URL'lerde de değiştir)
   - Public seç, "Add a README" işaretleme (bu klasörde zaten var)

2. **Dosyaları yükle**

   Terminalden:
   ```bash
   cd sirma-beauty-studio
   git init
   git add .
   git commit -m "İlk deploy"
   git branch -M main
   git remote add origin https://github.com/KULLANICI-ADIN/sirma-beauty-studio.git
   git push -u origin main
   ```

   Terminal kullanmak istemezsen: repo sayfasında "Add file" → "Upload files" ile klasördeki her şeyi (index.html, css/, js/, robots.txt, sitemap.xml) sürükle-bırak yükleyebilirsin.

3. **Pages'i etkinleştir**
   - Repo → **Settings** → **Pages**
   - Source: **Deploy from a branch**
   - Branch: **main**, klasör: **/ (root)**
   - **Save**
   - 1-2 dakika içinde `https://KULLANICI-ADIN.github.io/sirma-beauty-studio/` adresinde yayında olur

## Yayından Sonra Yapılacaklar

1. **`KULLANICI-ADIN` yerine gerçek GitHub kullanıcı adını yaz** — şu dosyalarda geçiyor:
   - `index.html` (canonical, og:url, JSON-LD içinde 3 yer)
   - `robots.txt`
   - `sitemap.xml`

   Hızlı yöntem: klasörde "KULLANICI-ADIN" ifadesini ara ve gerçek kullanıcı adınla değiştir (VS Code'da Ctrl+Shift+H / Cmd+Shift+H ile tüm dosyalarda tek seferde yapılır).

2. **Gerçek işletme bilgileri**: WhatsApp/telefon/adres, Instagram hesabı, JSON-LD'deki puan/yorum sayısı hâlâ demo verisi — gerçek müşteri için güncellenmeli.

3. **assets/images/ klasörü boş** — `og-cover.jpg` diye bir dosya meta etiketlerinde referans veriliyor ama yok. İsteğe bağlı, sosyal medya paylaşım önizlemesi için 1200×630 bir görsel ekleyebilirsin.

## Yerelde Test Etme

Build/npm install gerekmez, direkt bir statik sunucu yeterli:
```bash
python3 -m http.server 8000
```
sonra `http://localhost:8000` adresini aç.
