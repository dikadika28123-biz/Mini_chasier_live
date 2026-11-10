from flask import Flask, render_template, request, jsonify, session

app = Flask(__name__)
app.secret_key = "mini-cashier-development-key"

KATALOG = [
    {"kode": 1, "nama": "Buku", "harga": 15000},
    {"kode": 2, "nama": "Pensil", "harga": 3000},
    {"kode": 3, "nama": "Pulpen", "harga": 5000},
    {"kode": 4, "nama": "Penghapus", "harga": 2000},
    {"kode": 5, "nama": "Penggaris", "harga": 4000},
]

def get_cart():
    return session.setdefault("keranjang", [])

def hitung_total(cart):
    return sum(item["harga"] * item["jumlah"] for item in cart)

@app.route("/")
def index():
    return render_template("index.html", katalog=KATALOG)

@app.get("/api/cart")
def cart_data():
    cart = get_cart()
    total = hitung_total(cart)
    return jsonify({"items": cart, "total": total})

@app.post("/api/cart/add")
def add_item():
    data = request.get_json(silent=True) or {}
    try:
        kode = int(data.get("kode", 0))
        jumlah = int(data.get("jumlah", 0))
    except (TypeError, ValueError):
        return jsonify({"error": "Kode dan jumlah harus berupa angka bulat."}), 400

    if jumlah <= 0:
        return jsonify({"error": "Jumlah harus lebih dari 0."}), 400

    barang = next((b for b in KATALOG if b["kode"] == kode), None)
    if barang is None:
        return jsonify({"error": "Kode barang tidak ditemukan."}), 404

    cart = get_cart()
    existing = next((i for i in cart if i["kode"] == kode), None)
    if existing:
        existing["jumlah"] += jumlah
    else:
        cart.append({
            "kode": barang["kode"],
            "nama": barang["nama"],
            "harga": barang["harga"],
            "jumlah": jumlah
        })

    session["keranjang"] = cart
    return jsonify({"message": "Barang berhasil ditambahkan.", "items": cart, "total": hitung_total(cart)})

@app.post("/api/cart/clear")
def clear_cart():
    session["keranjang"] = []
    return jsonify({"message": "Keranjang dikosongkan.", "items": [], "total": 0})

@app.post("/api/checkout")
def checkout():
    data = request.get_json(silent=True) or {}
    cart = get_cart()

    if not cart:
        return jsonify({"error": "Keranjang masih kosong."}), 400

    member = str(data.get("member", "")).strip().lower()
    if member not in ("iya", "tidak"):
        return jsonify({"error": "Member hanya boleh Iya atau Tidak."}), 400

    try:
        uang = int(data.get("uang", 0))
    except (TypeError, ValueError):
        return jsonify({"error": "Uang pelanggan harus berupa angka bulat."}), 400

    if uang <= 0:
        return jsonify({"error": "Uang pelanggan harus lebih dari 0."}), 400

    total = hitung_total(cart)
    diskon = 0
    if member == "iya":
        diskon = 0.10 if total >= 25000 else 0.05

    potongan = int(total * diskon)
    bayar = total - potongan

    if uang < bayar:
        return jsonify({"error": f"Uang kurang Rp{bayar-uang:,}.", "kurang": bayar-uang}), 400

    receipt = {
        "items": cart,
        "total": total,
        "member": member.capitalize(),
        "diskon": diskon,
        "potongan": potongan,
        "bayar": bayar,
        "uang": uang,
        "kembalian": uang - bayar
    }
    session["keranjang"] = []
    return jsonify({"message": "Transaksi berhasil.", "receipt": receipt})

if __name__ == "__main__":
    app.run(debug=True)
