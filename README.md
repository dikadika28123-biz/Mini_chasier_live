# Mini Cashier V3 — Web Demo

Versi web sederhana dari Mini Cashier V3. UI menggunakan HTML, CSS, JavaScript; logika transaksi dan validasi berada di Python Flask.

## Menjalankan
1. Pastikan Python terpasang.
2. Buka terminal pada folder project.
3. Install Flask:
   `python -m pip install flask`
4. Jalankan:
   `python app.py`
5. Buka alamat yang muncul, biasanya `http://127.0.0.1:5000`.

## Struktur
- `app.py`: katalog, keranjang/session, validasi, diskon, checkout, dan kembalian.
- `templates/index.html`: struktur halaman.
- `static/style.css`: tampilan responsif.
- `static/app.js`: interaksi browser dan komunikasi ke backend.

Catatan: ini demo lokal. `secret_key` perlu diganti untuk deployment; data katalog masih hardcoded dan belum memakai database.
