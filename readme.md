# 📘 Dokumentasi & Panduan Setup Proyek "Kasirku"

Proyek ini adalah aplikasi Point of Sale (POS) berbasis web yang dibangun menggunakan:

- **Frontend:** React (Vite) + TypeScript
- **Backend:** Node.js + Express
- **Database:** MySQL

## 1\. Prasyarat (Wajib Install)

Pastikan di komputer sudah terinstall:

1.  **Node.js** (Versi 18 atau terbaru disarankan).
2.  **MySQL Server** (XAMPP/Laragon atau MySQL Installer).
3.  **Git** (Untuk clone repository).

---

## 2\. Setup Database (MySQL)

Langkah ini paling krusial. Temanmu harus membuat database dan tabel yang sesuai agar aplikasi tidak error.

1.  Buka terminal database (atau phpMyAdmin/DBeaver).
2.  Buat database baru bernama `kasirku_db`.
3.  Jalankan skrip SQL lengkap di bawah ini secara berurutan:

<!-- end list -->

```sql
-- 1. Buat Database
CREATE DATABASE IF NOT EXISTS kasirku_db;
USE kasirku_db;

-- 2. Tabel Users (Menyimpan data Owner & Karyawan)
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    store_id INT, -- Nanti direlasikan ke tabel stores
    email VARCHAR(100) NOT NULL UNIQUE,
    username VARCHAR(50),
    password_hash VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    role ENUM('owner', 'admin', 'kasir') NOT NULL DEFAULT 'owner',
    status ENUM('aktif', 'tidak aktif') DEFAULT 'aktif',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. Tabel Stores (Data Toko)
CREATE TABLE IF NOT EXISTS stores (
    store_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    store_name VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    address TEXT,
    province VARCHAR(100),
    regency VARCHAR(100),
    phone_number VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 4. Tabel Kategori Produk
CREATE TABLE IF NOT EXISTS categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    store_id INT NOT NULL,
    category_name VARCHAR(100) NOT NULL,
    transaction_type ENUM('Umum', 'Saldo') DEFAULT 'Umum',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES stores(store_id) ON DELETE CASCADE
);

-- 5. Tabel Produk Utama
CREATE TABLE IF NOT EXISTS products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    store_id INT NOT NULL,
    category_id INT,
    product_name VARCHAR(255) NOT NULL,
    description TEXT,
    barcode VARCHAR(100) UNIQUE,
    unit VARCHAR(50),
    weight DECIMAL(10, 2),
    serial_number VARCHAR(255),
    purchase_price DECIMAL(15, 2) NOT NULL DEFAULT 0,
    selling_price DECIMAL(15, 2) NOT NULL DEFAULT 0,
    stock_management_type ENUM('stock_based', 'no_stock_management') DEFAULT 'stock_based',
    current_stock INT NOT NULL DEFAULT 0,
    min_stock_alert INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES stores(store_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE SET NULL
);

-- 6. Tabel Variasi Harga Produk
CREATE TABLE IF NOT EXISTS product_price_variants (
    variant_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    variant_name VARCHAR(100) NOT NULL,
    price DECIMAL(15, 2) NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

-- 7. Tabel Gambar Produk
CREATE TABLE IF NOT EXISTS product_images (
    image_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    image_url TEXT NOT NULL,
    is_thumbnail BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

-- 8. Tabel Riwayat Stok (Restok/Penjualan)
CREATE TABLE IF NOT EXISTS stock_movement (
    movement_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    store_id INT NOT NULL,
    recorded_by_user_id INT,
    movement_type ENUM('in', 'out', 'adjustment') NOT NULL,
    quantity INT NOT NULL,
    unit_cost DECIMAL(15, 2) DEFAULT 0,
    total_cost DECIMAL(15, 2) DEFAULT 0,
    movement_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (store_id) REFERENCES stores(store_id) ON DELETE CASCADE,
    FOREIGN KEY (recorded_by_user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- 9. Tabel Transaksi (Header)
CREATE TABLE IF NOT EXISTS transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    store_id INT NOT NULL,
    user_id INT NOT NULL,
    total_price DECIMAL(15, 2) NOT NULL,
    discount DECIMAL(15, 2) DEFAULT 0,
    subtotal DECIMAL(15, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    customer_name VARCHAR(100),
    transaction_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES stores(store_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- 10. Tabel Detail Transaksi (Items)
CREATE TABLE IF NOT EXISTS transaction_details (
    detail_id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price_per_unit DECIMAL(15, 2) NOT NULL,
    total_price DECIMAL(15, 2) NOT NULL,
    FOREIGN KEY (transaction_id) REFERENCES transactions(transaction_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

-- 11. Tabel Hak Akses Karyawan
CREATE TABLE IF NOT EXISTS user_permissions (
    permission_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    feature_name VARCHAR(50) NOT NULL,
    is_enabled BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
```

---

## 3\. Setup Backend (Server)

1.  Buka terminal, masuk ke folder `server`:
    ```bash
    cd server
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Buat file `.env` di dalam folder `server` dan isi konfigurasi berikut (sesuaikan password database jika ada):
    ```env
    PORT=5000
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=
    DB_NAME=kasirku_db
    JWT_SECRET=rahasia_kunci_jwt_ganti_dengan_yang_rumit
    ```
4.  Pastikan folder `uploads` sudah ada di dalam `server`. Jika belum, buat folder kosong bernama `uploads`.
5.  Jalankan server:
    ```bash
    npm run dev
    ```
    _Indikator sukses: Terminal menampilkan "Server berjalan di http://localhost:5000" dan "Berhasil terhubung ke database MySQL\!"._

---

## 4\. Setup Frontend (Client)

1.  Buka terminal baru (jangan matikan terminal server), masuk ke folder `client`:
    ```bash
    cd client
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Jalankan frontend:
    ```bash
    npm run dev
    ```
4.  Buka link yang muncul (biasanya `http://localhost:5173`) di browser.

---

## 5\. Alur Penggunaan Saat Ini

Untuk teman-temanmu yang baru bergabung, berikut alur aplikasi saat ini:

1.  **Register:** Buat akun baru (email & password).
2.  **Setup Toko:** Setelah register, wajib isi nama toko & alamat.
3.  **Dashboard:** Halaman utama dengan menu navigasi.
4.  **Kategori:** Buat kategori produk dulu (misal: Makanan, Minuman).
5.  **Produk:** Tambah produk baru (bisa upload gambar, atur stok, harga, variasi).
6.  **Restok:** Tambah stok produk yang sudah ada.
7.  **Penjualan (Kasir):** Masukkan barang ke keranjang -\> Bayar (Tunai/Non-Tunai).
8.  **Histori:** Lihat riwayat transaksi, detail item, dan cetak struk.
9.  **Grafik:** Lihat analisis penjualan harian/mingguan.
10. **Karyawan:** Tambah akun karyawan baru dan atur hak akses mereka.

## 6\. Catatan Teknis untuk Developer

- **Library Utama:**
  - Backend: `express`, `mysql2` (raw queries), `multer` (upload), `jsonwebtoken` (auth).
  - Frontend: `react-router-dom`, `axios`, `recharts` (grafik), `html2canvas` (download struk).
- **Struktur Kode:**
  - Frontend menggunakan **Context API** (`CartContext`) untuk manajemen keranjang belanja global.
  - Halaman dibungkus oleh komponen `MainLayout` agar sidebar & header konsisten.
  - Backend menggunakan arsitektur MVC sederhana (Routes -\> Controllers -\> Database).
