---

# 💵 Aplikasi POS **KasirKu**

Aplikasi **KasirKu** adalah sistem Point of Sale (POS) sederhana yang terdiri dari dua bagian utama:

- **Client (Frontend)** → Dibangun menggunakan Node.js + framework frontend (misalnya React atau Vue).
- **Server (Backend)** → Menggunakan Node.js + Express + MySQL untuk pengelolaan data.

---

## ⚙️ Persiapan Awal (Setup)

### 1️⃣ Instalasi Dependency

Buka terminal, lalu jalankan perintah berikut:

```bash
# Masuk ke folder client
cd client
npm install

# Masuk ke folder server
cd ../server
npm install
```

---

### 2️⃣ Setup Database

Pastikan MySQL sudah berjalan di komputer kamu.
Masuk ke terminal MySQL dan jalankan perintah berikut:

```sql
-- 1. Buat Database
CREATE DATABASE IF NOT EXISTS kasirku_db;
USE kasirku_db;

-- 2. Buat Tabel 'users'
CREATE TABLE IF NOT EXISTS users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('owner', 'admin', 'kasir') NOT NULL DEFAULT 'owner',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- (Opsional) Tabel 'stores' untuk pengembangan berikutnya
-- CREATE TABLE IF NOT EXISTS stores (
--   store_id INT AUTO_INCREMENT PRIMARY KEY,
--   user_id INT NOT NULL,
--   store_name VARCHAR(100) NOT NULL,
--   address TEXT,
--   FOREIGN KEY (user_id) REFERENCES users(user_id),
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );
```

---

### 3️⃣ Konfigurasi Environment

Buat file `.env` di dalam folder **server** dengan isi sebagai berikut:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=isi_dengan_password_database_kamu
DB_NAME=kasirku_db
JWT_SECRET=rahasia_negara
```

---

### 4️⃣ Menjalankan Aplikasi

Setelah semua langkah di atas selesai:

```bash
# Jalankan server
cd server
npm run dev

# Jalankan client
cd ../client
npm start
```

Aplikasi akan berjalan pada:

- **Server Backend:** [http://localhost:5000](http://localhost:5000)
- **Client Frontend:** [http://localhost:3000](http://localhost:5173)

---

### 🧩 Catatan Tambahan

- Pastikan Node.js dan MySQL sudah terinstal.
- Jika ingin mengganti port atau nama database, ubah juga di file `.env`.
- Simpan **JWT_SECRET** dengan aman karena digunakan untuk autentikasi pengguna.

---
