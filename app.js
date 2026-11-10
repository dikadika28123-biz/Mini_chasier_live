const rupiah = n => "Rp" + Number(n).toLocaleString("id-ID");
const cartEl = document.getElementById("cart-items");
const totalEl = document.getElementById("cart-total");
const messageEl = document.getElementById("message");

async function refreshCart(){
  const res = await fetch("/api/cart");
  const data = await res.json();
  renderCart(data.items, data.total);
}
function renderCart(items,total){
  if(!items.length){
    cartEl.innerHTML='<div class="empty">Keranjang masih kosong.<br><small>Pilih produk untuk memulai.</small></div>';
  }else{
    cartEl.innerHTML=items.map(item=>`
      <div class="cart-item">
        <div><strong>${item.nama}</strong><br><small>${item.jumlah} × ${rupiah(item.harga)}</small></div>
        <div class="line-total">${rupiah(item.harga*item.jumlah)}</div>
      </div>`).join("");
  }
  totalEl.textContent=rupiah(total);
}
async function quickAdd(kode){ await addItem(kode,1); }
async function addFromForm(){
  const kode=document.getElementById("kode").value;
  const jumlah=document.getElementById("jumlah").value;
  await addItem(kode,jumlah);
}
async function addItem(kode,jumlah){
  messageEl.className="message";messageEl.textContent="";
  const res=await fetch("/api/cart/add",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({kode,jumlah})});
  const data=await res.json();
  if(!res.ok){messageEl.textContent=data.error;return;}
  renderCart(data.items,data.total);
  messageEl.className="message success";messageEl.textContent=data.message;
  document.getElementById("kode").value="";
  document.getElementById("jumlah").value=1;
}
async function clearCart(){
  const res=await fetch("/api/cart/clear",{method:"POST"});
  const data=await res.json();renderCart(data.items,data.total);
  messageEl.className="message";messageEl.textContent=data.message;
}
async function checkout(){
  messageEl.className="message";messageEl.textContent="";
  const member=document.getElementById("member").value;
  const uang=document.getElementById("uang").value;
  const res=await fetch("/api/checkout",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({member,uang})});
  const data=await res.json();
  if(!res.ok){messageEl.textContent=data.error;return;}
  messageEl.className="message success";messageEl.textContent=data.message;
  showReceipt(data.receipt);
  renderCart([],0);
  document.getElementById("uang").value="";
}
function showReceipt(r){
  const area=document.getElementById("receipt-area"),el=document.getElementById("receipt");
  const rows=r.items.map(i=>`<div class="receipt-row"><span>${i.nama} × ${i.jumlah}</span><span>${rupiah(i.harga*i.jumlah)}</span></div>`).join("");
  el.innerHTML=`
    <h3>MINI CASHIER V3</h3><div class="receipt-sub">Bukti transaksi pembelian</div>
    <hr>${rows}<hr>
    <div class="receipt-row"><span>Subtotal</span><span>${rupiah(r.total)}</span></div>
    <div class="receipt-row"><span>Member</span><span>${r.member}</span></div>
    <div class="receipt-row"><span>Diskon (${Math.round(r.diskon*100)}%)</span><span>-${rupiah(r.potongan)}</span></div>
    <hr><div class="receipt-row grand"><span>Total bayar</span><span>${rupiah(r.bayar)}</span></div>
    <div class="receipt-row"><span>Tunai</span><span>${rupiah(r.uang)}</span></div>
    <div class="receipt-row"><span>Kembalian</span><span>${rupiah(r.kembalian)}</span></div>
    <hr><div class="receipt-sub">Terima kasih telah berbelanja!</div>`;
  area.classList.remove("hidden");
  area.scrollIntoView({behavior:"smooth",block:"start"});
}
refreshCart();
