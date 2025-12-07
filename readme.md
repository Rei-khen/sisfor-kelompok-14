Kasirku - Aplikasi Point of Sales (POS)

**Kasirku** adalah aplikasi kasir berbasis web yang dirancang untuk membantu UMKM mengelola penjualan, stok produk, dan laporan keuangan dengan mudah.

Tech Stack

- **Frontend:** React (Vite) + TypeScript
- **Backend:** Node.js + Express
- **Database:** MySQL
- **Styling:** CSS (Inline / Standard)
- **Charts:** Recharts
- **Export:** html2canvas (Download Struk)

---

Prasyarat (Requirements)

Sebelum memulai, pastikan di komputermu sudah terinstall:

1.  **Node.js** (Versi 18 atau lebih baru).
2.  **MySQL Server** (XAMPP, Laragon, atau MySQL Workbench).
3.  **Git**.

---

Cara Menjalankan Aplikasi (Setup Guide)

Ikuti langkah-langkah ini secara berurutan agar aplikasi berjalan lancar.

### 1\. Setup Database

Ini langkah paling penting. Pastikan struktur database sama di semua komputer tim.

1.  Buka aplikasi database manager (phpMyAdmin / DBeaver / Terminal).
2.  Buat database baru bernama **`kasirku_db`**.
3.  Jalankan (Copy-Paste) perintah SQL berikut untuk membuat semua tabel:

<!-- end list -->

```sql
-- Hapus tabel lama jika ada (urutan penting karena Foreign Keys)
DROP TABLE IF EXISTS user_permissions;
DROP TABLE IF EXISTS transaction_details;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS stock_movement;
DROP TABLE IF EXISTS product_images;
DROP TABLE IF EXISTS product_price_variants;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS stores;
DROP TABLE IF EXISTS users;

-- 1. Tabel Users
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    store_id INT,
    email VARCHAR(100) NOT NULL UNIQUE,
    username VARCHAR(50),
    password_hash VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    role ENUM('owner', 'admin', 'kasir') NOT NULL DEFAULT 'owner',
    status ENUM('aktif', 'tidak aktif') DEFAULT 'aktif',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Tabel Stores
CREATE TABLE stores (
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

-- 3. Tabel Kategori
CREATE TABLE categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    store_id INT NOT NULL,
    category_name VARCHAR(100) NOT NULL,
    transaction_type ENUM('Umum', 'Saldo') DEFAULT 'Umum',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES stores(store_id) ON DELETE CASCADE
);

-- 4. Tabel Produk Utama
CREATE TABLE products (
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

-- 5. Tabel Variasi Harga
CREATE TABLE product_price_variants (
    variant_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    variant_name VARCHAR(100) NOT NULL,
    price DECIMAL(15, 2) NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

-- 6. Tabel Gambar Produk
CREATE TABLE product_images (
    image_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    image_url TEXT NOT NULL,
    is_thumbnail BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

-- 7. Tabel Riwayat Stok (Restok)
CREATE TABLE stock_movement (
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

-- 8. Tabel Transaksi (Header)
CREATE TABLE transactions (
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

-- 9. Tabel Detail Transaksi (Items)
CREATE TABLE transaction_details (
    detail_id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price_per_unit DECIMAL(15, 2) NOT NULL,
    total_price DECIMAL(15, 2) NOT NULL,
    FOREIGN KEY (transaction_id) REFERENCES transactions(transaction_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

-- 10. Tabel Hak Akses Karyawan
CREATE TABLE user_permissions (
    permission_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    feature_name VARCHAR(50) NOT NULL,
    is_enabled BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
```

---

### 2\. Setup Backend (Server)

1.  Buka terminal, masuk ke folder server:
    ```bash
    cd server
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  **PENTING:** Buat file **`.env`** di dalam folder `server`, lalu isi:
    ```env
    PORT=5000
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=          <-- Isi jika MySQL kamu pakai password
    DB_NAME=kasirku_db
    JWT_SECRET=rahasia_kasirku_123
    ```
4.  Pastikan ada folder bernama **`uploads`** di dalam folder `server`. Jika belum ada, buat folder baru:
    ```bash
    mkdir uploads
    ```
5.  Jalankan server:
    ```bash
    npm run dev
    ```

---

### 3\. Setup Frontend (Client)

1.  Buka terminal baru, masuk ke folder client:
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
4.  Akses aplikasi di browser: **`http://localhost:5173`**

---

Panduan Singkat

1.  **Registrasi:** Saat pertama kali buka, masuk ke menu **Register**. Gunakan **Email** dan Password.
2.  **Setup Toko:** Setelah login, kamu akan diminta mengisi Nama Toko dan Alamat.
3.  **Kategori:** Pergi ke menu Kategori, buat minimal satu kategori (misal: "Makanan").
4.  **Produk:**
    - Menu **Produk** -\> **Tambah Produk**.
    - Isi data wajib (Nama, Harga Jual).
    - Bisa upload gambar (Drag & Drop).
    - Bisa tambah variasi harga.
5.  **Restok:** Jika stok habis, masuk ke menu **Restok**, cari barangnya, dan tambah jumlahnya.
6.  **Penjualan (Kasir):**
    - Masuk ke menu **Penjualan**.
    - Cari produk, klik tombol keranjang 🛒.
    - Klik tombol **Pembayaran**.
    - Pilih Tunai/Non-Tunai -\> Bayar.
7.  **Laporan:**
    - **Histori:** Lihat riwayat transaksi, filter tanggal/metode bayar, lihat detail, print/download struk.
    - **Grafik:** Lihat analisa penjualan harian dan produk terlaris.
8.  **Karyawan:** Tambah akun kasir baru dan atur fitur apa saja yang boleh mereka akses.

---

Troubleshooting

- **Gambar Produk Tidak Muncul:** Pastikan folder `server/uploads` ada.
- **Grafik Tidak Muncul:** Coba tambahkan minimal satu transaksi penjualan agar ada datanya.
