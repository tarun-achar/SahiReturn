let selectedRole = "Customer";

const roleButtons = document.querySelectorAll(".role-option");

const emailInput = document.getElementById("email");

const message = document.getElementById("message");


// Role Selection
roleButtons.forEach(button => {

    button.addEventListener("click", () => {

        roleButtons.forEach(btn => {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        selectedRole = button.dataset.role;

        message.textContent = "";

    });

});


// Demo Login
function demoLogin(role) {

    selectedRole = role;

    roleButtons.forEach(button => {

        button.classList.toggle(
            "active",
            button.dataset.role === role
        );

    });

    emailInput.value =
        role.toLowerCase() + "@sahireturn.com";

    message.style.color = "#082d49";

    message.textContent =
        role + " demo selected. Click Sign In to open the dashboard.";

}


// Sign In
document.getElementById("loginForm")
    .addEventListener("submit", function(event) {

        event.preventDefault();

        const email = emailInput.value.trim();

        if (!email) {

            message.style.color = "#b42318";

            message.textContent =
                "Please enter your email address.";

            return;
        }

        message.style.color = "#082d49";

        message.textContent = "Signed in as " + selectedRole + ". Opening dashboard…";
        window.openDashboard(selectedRole, email);

    });

// Show the dashboard after the demo login form is submitted.


/* Dashboard application */
const $ = s => document.querySelector(s);
const KEY = 'returnshield_v1';
let currentRole = 'Retailer';
const inr = n => '₹' + Number(n).toLocaleString('en-IN');

const ph = (e, c) => 'data:image/svg+xml,' + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><rect width="160" height="160" fill="${c}"/><text x="80" y="104" font-size="70" text-anchor="middle">${e}</text></svg>`
);

const seed = () => ({
  products: [
    {id:'PRD-101',name:'Wireless Earbuds Pro',price:2499,stock:42,cond:'New – sealed',img:ph('🎧','#ede9fe')},
    {id:'PRD-102',name:'Running Shoes X1',price:3299,stock:18,cond:'New – boxed',img:ph('👟','#dbeafe')},
    {id:'PRD-103',name:'Smart Watch Active',price:5999,stock:9,cond:'New – sealed',img:ph('⌚','#fce7f3')},
    {id:'PRD-104',name:'Cotton Kurta Set',price:1299,stock:60,cond:'New – tagged',img:ph('👘','#fef3c7')},
    {id:'PRD-105',name:'Steel Water Bottle',price:699,stock:120,cond:'New – boxed',img:ph('🥶','#d1fae5')}
  ],
  orders: [
    {id:'ORD-5001',cust:'Priya Nair',pid:'PRD-101',date:'2026-11-02',value:2499,ship:'Delivered',elig:'Eligible'},
    {id:'ORD-5002',cust:'Rahul Verma',pid:'PRD-102',date:'2026-11-05',value:3299,ship:'Delivered',elig:'Eligible'},
    {id:'ORD-5003',cust:'Sneha Rao',pid:'PRD-103',date:'2026-11-08',value:5999,ship:'In transit',elig:'Not yet'},
    {id:'ORD-5004',cust:'Karthik S',pid:'PRD-104',date:'2026-10-12',value:1299,ship:'Delivered',elig:'Expired'},
    {id:'ORD-5005',cust:'Meera Iyer',pid:'PRD-105',date:'2026-11-10',value:699,ship:'Delivered',elig:'Eligible'}
  ],
  returns: [
    {id:'RET-901',order:'ORD-5001',pid:'PRD-101',reason:'Item damaged on arrival',date:'2026-11-12',status:'Pending',amount:2499,risk:'High'},
    {id:'RET-902',order:'ORD-5002',pid:'PRD-102',reason:'Wrong size received',date:'2026-11-13',status:'Flagged',amount:3299,risk:'Medium'},
    {id:'RET-903',order:'ORD-5005',pid:'PRD-105',reason:'Changed my mind',date:'2026-11-14',status:'Approved',amount:699,risk:'Low'}
  ],
  reports: [],
  notes: ['Welcome to ReturnShield 👋'],
  read: true
});

let S = JSON.parse(localStorage.getItem(KEY) || 'null') || seed();
S.asIsListings = S.asIsListings || [];

const save = () => localStorage.setItem(KEY, JSON.stringify(S));
const escapeHTML = value => String(value ?? '').replace(/[&<>\"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[ch]));

function addAsIsListing() {
  const get = id => ($('#'+id).value || '').trim();
  const item = {
    name:get('asName'), category:get('asCategory'), price:Number(get('asPrice')),
    location:get('asLocation'), condition:get('asCondition'), contact:get('asContact'),
    phone:get('asPhone'), email:get('asEmail'), defects:get('asDefects'),
    encumbrances:get('asEncumbrances') || 'Not specified', status:'Available',
    createdAt:new Date().toISOString()
  };
  if(!item.name || !item.price || item.price < 1 || !item.location || !item.contact || !item.phone || !item.defects) {
    return toast('Fill all required fields, including known defects and asking price');
  }
  if(!$('#asConfirm').checked) return toast('Please confirm the listing disclosures');
  S.asIsListings.unshift(item);
  save();
  go('asis');
  notify('As Is Where Is listing added: '+item.name);
  toast('Asset listing published');
}

function removeAsIsListing(index) {
  confirmBox('Remove this As Is Where Is listing?', () => {
    S.asIsListings.splice(index,1);
    save();
    go('asis');
    toast('Listing removed');
  });
}

const prod = id => S.products.find(p => p.id === id) || {
  name: 'Unknown',
  img: ph('📦','#eee')
};

const pill = t => `<span class="pill ${{Approved:'ok',Eligible:'ok',Delivered:'ok',Low:'ok',Pending:'warn',Medium:'warn','In transit':'warn','Not yet':'warn',Flagged:'info',Rejected:'bad',High:'bad',Expired:'bad'}[t] || 'info'}">${t}</span>`;

const empty = (i,t,s) => `<div class="empty"><i class="fa-solid ${i}"></i><h3>${t}</h3><p>${s}</p></div>`;

function toast(m) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = m;
  $('#toasts').append(t);
  setTimeout(() => t.remove(), 3200);
}

function notify(m) {
  S.notes.unshift(m);
  S.read = false;
  save();
  bell();
}

function bell() {
  $('#notes').innerHTML = S.notes.slice(0,8).map(n => `<p>${n}</p>`).join('');
  const b = $('#badge');
  b.style.display = S.read ? 'none' : 'block';
  b.textContent = S.notes.length;
}

function modal(html) {
  $('#modalBox').innerHTML = html;
  $('#modal').classList.add('open');
}

const closeModal = () => $('#modal').classList.remove('open');

function confirmBox(msg,fn) {
  modal(`<h3>Are you sure?</h3><p class="sub">${msg}</p><div class="actions"><button class="btn" id="yes">Confirm</button><button class="btn ghost" id="no">Cancel</button></div>`);
  $('#yes').onclick = () => {
    closeModal();
    fn();
  };
  $('#no').onclick = closeModal;
}

$('#modal').onclick = e => {
  if(e.target.id === 'modal') closeModal();
};

function download(name,text) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text],{type:'text/plain'}));
  a.download = name;
  a.click();
  toast('Downloaded ' + name);
}

const charts = [];

const mk = (id,cfg) => {
  const c = $('#' + id);
  if(c && window.Chart) charts.push(new Chart(c,cfg));
};

const months = ['Jun','Jul','Aug','Sep','Oct','Nov'];

const money = () => {
  const lost = S.returns.filter(r => r.status === 'Approved').reduce((a,r) => a+r.amount*.4,0)+48200;
  const saved = S.returns.filter(r => r.status === 'Rejected' || r.status === 'Flagged').reduce((a,r) => a+r.amount,0)+96500;
  return {lost:Math.round(lost),saved:Math.round(saved)};
};

const pages = {

  dashboard() {
    const m = money();
    const h = new Date().getHours();
    const g = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
    const risky = S.returns.filter(r => r.risk !== 'Low');

    return `<div class="card hero"><h1>${g}, ${currentRole}!</h1><p>Protect your business. Reduce your return losses.</p></div>
    <div class="grid g4">${[['Total Orders',S.orders.length+1240,'fa-box','#ede9fe','#7c3aed','orders'],['Total Returns',S.returns.length+86,'fa-rotate-left','#fef3c7','#b45309','returns'],['Money Lost',inr(m.lost),'fa-arrow-trend-down','#fee2e2','#b91c1c','analytics'],['Money Saved',inr(m.saved),'fa-shield-heart','#d1fae5','#047857','analytics']].map(s=>`<div class="card stat" onclick="go('${s[5]}')"><div class="ic" style="background:${s[3]};color:${s[4]}"><i class="fa-solid ${s[2]}"></i></div><div><b>${s[1]}</b><span>${s[0]}</span></div></div>`).join('')}</div>
    <div class="grid g21" style="margin-top:18px"><div class="card"><h3>Return activity</h3><canvas id="c1" height="130"></canvas></div>
    <div class="card"><h3>AI Risk Alerts <span class="demo-tag">Demo</span></h3>${risky.length ? risky.map(r=>`<div class="alert"><i class="fa-solid fa-triangle-exclamation"></i><div><b>${r.id} · ${prod(r.pid).name}</b><br><small>${r.risk} risk – ${r.reason}</small></div></div>`).join('') : empty('fa-circle-check','All clear','No suspicious returns right now.')}</div></div>
    <div class="card" style="margin-top:18px"><h3>Recent return requests</h3>${retTable(S.returns)}</div>`;
  },

  products() {
    return `<div class="head"><div><h1>Products</h1><p class="sub">Register products and their condition before dispatch.</p></div><button class="btn" onclick="addProduct()"><i class="fa-solid fa-plus"></i>Add New Product</button></div>
    <div class="toolbar"><input id="pq" placeholder="Search products…" oninput="listProducts()"><select id="pf" onchange="listProducts()"><option value="">All stock</option><option value="low">Low stock (&lt;20)</option><option value="ok">In stock</option></select></div><div id="plist" class="grid g3"></div>`;
  },

  orders() {
    return `<div class="head"><div><h1>Orders</h1><p class="sub">Track shipments and return eligibility.</p></div></div><div class="card wrap"><table class="tbl"><tr><th>Order ID</th><th>Customer</th><th>Product</th><th>Date</th><th>Value</th><th>Shipping</th><th>Return eligibility</th></tr>${S.orders.map(o=>`<tr><td><b>${o.id}</b></td><td>${o.cust}</td><td>${prod(o.pid).name}</td><td>${o.date}</td><td>${inr(o.value)}</td><td>${pill(o.ship)}</td><td>${pill(o.elig)}</td></tr>`).join('')}</table></div>`;
  },

  returns() {
    return `<div class="head"><div><h1>Return Requests</h1><p class="sub">Compare evidence and decide each case.</p></div></div>${S.returns.length ? S.returns.map(r => {
      const p = prod(r.pid);
      return `<div class="card rcard" style="margin-bottom:16px"><div><div class="row" style="margin:0 0 10px"><h3 style="margin:0">${r.id} · ${p.name}</h3>${pill(r.status)}</div><p class="sub" style="margin:0 0 12px">Order ${r.order} · Requested ${r.date} · ${inr(r.amount)}<br>Reason: ${r.reason}</p>
      <div class="imgs"><figure><img src="${p.img}" alt="Dispatch">Original dispatch</figure><figure><img src="${ph('📦','#fee2e2')}" alt="Return">Customer upload</figure></div>
      <div class="actions"><button class="btn ok sm" onclick="setStatus('${r.id}','Approved')">Approve</button><button class="btn bad sm" onclick="setStatus('${r.id}','Rejected')">Reject</button><button class="btn warn sm" onclick="setStatus('${r.id}','Flagged')">Flag for Review</button></div></div>
      <div style="min-width:170px"><small class="sub">AI inspection <span class="demo-tag">Demo</span></small><p style="margin:8px 0">${pill(r.risk+' risk')}</p><div class="meter"><i style="width:${{High:86,Medium:58,Low:22}[r.risk]}%"></i></div><small class="sub">Risk score ${{High:86,Medium:58,Low:22}[r.risk]}/100</small></div></div>`;
    }).join('') : empty('fa-inbox','No return requests','New requests will appear here.')}`;
  },

  inspect() {
    return `<div class="head"><div><h1>AI Inspection</h1><p class="sub">Compare the dispatched product with the returned one.</p></div><span class="demo-tag"><i class="fa-solid fa-flask"></i> Demo simulation – not real AI detection</span></div>
    <div class="card inspect-price-input"><div class="field"><label for="inspectBasePrice">Product value before damage (₹) *</label><input id="inspectBasePrice" type="number" min="1" placeholder="Enter original / current market value"></div><small class="sub">This value is the starting point for the indicative damage-based resale estimate.</small></div>
    <div class="grid g2">${['orig:Original product image','ret:Returned product image'].map(x=>{const [k,l]=x.split(':');return `<label class="drop" id="d-${k}"><i class="fa-solid fa-cloud-arrow-up" style="font-size:30px"></i><b>${l}</b><small>Click to upload</small><input type="file" accept="image/*" hidden onchange="preview(this,'${k}')"></label>`}).join('')}</div>
    <div class="actions"><button class="btn" id="cmp" onclick="compare()"><i class="fa-solid fa-wand-magic-sparkles"></i>Compare Images</button></div><div id="res" style="margin-top:18px"></div>`;
  },

  asis() {
    const listings = S.asIsListings || [];
    return `<div class="head"><div><h1>As Is Where Is</h1><p class="sub">List assets for sale in their exact current condition and location, with known defects and encumbrances disclosed.</p></div><span class="demo-tag">Seller disclosure required</span></div>
    <div class="card asis-notice"><b><i class="fa-solid fa-circle-info"></i> What this means</b><p>Items are offered in their present condition and location. Buyers should inspect the asset and verify ownership, title and any encumbrances before purchase. Record all known faults honestly.</p></div>
    <div class="card" style="margin-top:18px"><h3>List an asset</h3><div class="grid g2">
      <div class="field"><label for="asName">Asset / product name *</label><input id="asName" placeholder="e.g. Used commercial refrigerator"></div>
      <div class="field"><label for="asCategory">Category</label><select id="asCategory"><option>Electronics</option><option>Machinery / Equipment</option><option>Vehicle</option><option>Furniture</option><option>Real Estate</option><option>Other</option></select></div>
      <div class="field"><label for="asPrice">Asking price (₹) *</label><input id="asPrice" type="number" min="1" placeholder="Enter asking price"></div>
      <div class="field"><label for="asLocation">Current location *</label><input id="asLocation" placeholder="City, area / warehouse"></div>
      <div class="field"><label for="asCondition">Current condition</label><select id="asCondition"><option>Good – used</option><option>Fair – visible wear</option><option>Poor – needs repair</option><option>For parts / scrap</option><option>Uninspected</option></select></div>
      <div class="field"><label for="asContact">Contact person *</label><input id="asContact" placeholder="Name"></div>
      <div class="field"><label for="asPhone">Contact phone *</label><input id="asPhone" type="tel" placeholder="Phone number"></div>
      <div class="field"><label for="asEmail">Contact email</label><input id="asEmail" type="email" placeholder="Email (optional)"></div>
    </div>
    <div class="field"><label for="asDefects">Known defects / faults *</label><textarea id="asDefects" rows="3" placeholder="Describe scratches, missing parts, damage, repair needs, etc."></textarea></div>
    <div class="field"><label for="asEncumbrances">Encumbrances / liabilities</label><textarea id="asEncumbrances" rows="2" placeholder="Disclose any loans, liens, pending dues, ownership claims or write ‘None known’."></textarea></div>
    <label class="asis-check"><input type="checkbox" id="asConfirm"> I confirm that the details above are accurate to the best of my knowledge and known defects / encumbrances have been disclosed.</label>
    <div class="actions"><button class="btn" onclick="addAsIsListing()"><i class="fa-solid fa-plus"></i>Publish listing</button></div></div>
    <div class="head" style="margin-top:24px"><div><h2>Current listings</h2><p class="sub">${listings.length} asset${listings.length===1?'':'s'} listed in this browser</p></div></div>
    ${listings.length ? `<div class="grid g2">${listings.map((x,i)=>`<div class="card asis-card"><div class="row"><h3>${escapeHTML(x.name)}</h3>${pill(x.status || 'Available')}</div><p class="sub">${escapeHTML(x.category)} · ${escapeHTML(x.condition)}</p><div class="asis-price">${inr(x.price)}</div><p><b>Location:</b> ${escapeHTML(x.location)}</p><p><b>Known defects:</b> ${escapeHTML(x.defects)}</p><p><b>Encumbrances:</b> ${escapeHTML(x.encumbrances || 'Not specified')}</p><p><b>Contact:</b> ${escapeHTML(x.contact)} · ${escapeHTML(x.phone)}${x.email ? ' · '+escapeHTML(x.email) : ''}</p><div class="actions"><button class="btn bad sm" onclick="removeAsIsListing(${i})"><i class="fa-regular fa-trash-can"></i>Remove</button></div></div>`).join('')}</div>` : `<div class="card">${empty('fa-warehouse','No As Is Where Is listings yet','Use the form above to list an asset with its current condition, location and disclosures.')}</div>`}
    <p class="sub asis-legal-note">This is a listing and disclosure record, not a legal contract or title verification. Get appropriate legal advice and complete required ownership / encumbrance checks before a sale.</p>`;
  },

  analytics() {
    const m = money();
    return `<div class="head"><div><h1>Loss Analytics</h1><p class="sub">See where returns cost you the most.</p></div></div>
    <div class="grid g4">${[['Total return losses',inr(m.lost)],['Shipping losses',inr(Math.round(m.lost*.35))],['Product damage losses',inr(Math.round(m.lost*.45))],['Recovered amount',inr(m.saved)]].map(s=>`<div class="card stat"><div><b>${s[1]}</b><span>${s[0]}</span></div></div>`).join('')}</div>
    <div class="grid g21" style="margin-top:18px"><div class="card"><h3>Monthly loss</h3><canvas id="c2" height="130"></canvas></div><div class="card"><h3>Loss reduction</h3><b style="font-size:40px;color:var(--purple)">${Math.round(m.saved/(m.saved+m.lost)*100)}%</b><div class="meter"><i style="width:${Math.round(m.saved/(m.saved+m.lost)*100)}%"></i></div><small class="sub">Share of return value recovered or prevented</small></div></div>
    <div class="card" style="margin-top:18px"><h3>Most returned products</h3><canvas id="c3" height="90"></canvas></div>`;
  },

  evidence() {
    return `<div class="head"><div><h1>Evidence Center</h1><p class="sub">Everything you need to win a return dispute.</p></div><button class="btn" onclick="dispute()"><i class="fa-solid fa-file-shield"></i>Generate dispute summary</button></div>
    <div class="card"><h3>Saved product &amp; dispatch images</h3><div class="imgs">${S.products.map(p=>`<figure><img src="${p.img}" alt="${p.name}">${p.name}</figure>`).join('') || empty('fa-image','No images yet','Add products to store evidence.')}</div></div>
    <div class="card" style="margin-top:18px"><h3>Return evidence</h3><div class="imgs">${S.returns.map(r=>`<figure><img src="${ph('📦','#fee2e2')}" alt="">${r.id}</figure>`).join('')}</div></div>
    <div class="card" style="margin-top:18px"><h3>Inspection reports</h3>${S.reports.length ? S.reports.map((r,i)=>`<div class="row"><span>${r.title} <small class="sub">${r.when}</small></span><button class="btn ghost sm" onclick="dlReport(${i})"><i class="fa-solid fa-download"></i>Download</button></div>`).join('') : empty('fa-file-circle-question','No reports yet','Run an AI Inspection and generate a report.')}</div>`;
  },

  settings() {
    return `<div class="head"><div><h1>Settings</h1><p class="sub">Demo data is saved in this browser.</p></div></div><div class="card"><h3>Demo data</h3><p class="sub">Restore the original sample products, orders and returns.</p><button class="btn bad" onclick="confirmBox('This erases your changes and restores sample data.',()=>{S=seed();save();bell();go('dashboard');toast('Demo data reset')})">Reset demo data</button></div>`;
  }
};

function retTable(rows) {
  return rows.length ? `<div class="wrap"><table class="tbl"><tr><th>Product</th><th>Order ID</th><th>Reason</th><th>Status</th><th>Amount</th><th></th></tr>${rows.map(r=>{const p=prod(r.pid);return `<tr><td><img class="thumb" src="${p.img}" alt="">${p.name}</td><td>${r.order}</td><td>${r.reason}</td><td>${pill(r.status)}</td><td>${inr(r.amount)}</td><td><button class="btn ghost sm" onclick="go('returns')">View Details</button></td></tr>`}).join('')}</table></div>` : empty('fa-inbox','No returns yet','Return requests will show up here.');
}

function listProducts() {
  const q = ($('#pq').value || '').toLowerCase();
  const f = $('#pf').value;

  const l = S.products.filter(p=>(p.name+p.id).toLowerCase().includes(q) && (!f || (f==='low' ? p.stock<20 : p.stock>=20)));

  $('#plist').innerHTML = l.length ? l.map(p=>`<div class="card pcard"><img src="${p.img}" alt="${p.name}"><b>${p.name}</b><br><small>${p.id} · ${p.cond}</small><div class="row"><b>${inr(p.price)}</b>${pill(p.stock<20?'Low':'In stock').replace('Low','Low: '+p.stock).replace('In stock',p.stock+' in stock')}</div><div class="actions"><button class="btn ghost sm" onclick="qr('${p.id}')"><i class="fa-solid fa-qrcode"></i>QR code</button><button class="btn ghost sm" onclick="delProduct('${p.id}')"><i class="fa-regular fa-trash-can"></i></button></div></div>`).join('') : `<div class="card" style="grid-column:1/-1">${empty('fa-box-open','No products found','Add a product or change your search.')}</div>`;
}

function addProduct() {
  modal(`<h3>Add new product</h3><br>${[['n','Product name','text'],['p','Price (₹)','number'],['s','Stock','number']].map(f=>`<div class="field"><label>${f[1]}</label><input id="f${f[0]}" type="${f[2]}" min="0"></div>`).join('')}<div class="field"><label>Condition at dispatch</label><select id="fc"><option>New – sealed</option><option>New – boxed</option><option>New – tagged</option><option>Open box</option></select></div><div class="field"><label>Product photo</label><input type="file" id="fi" accept="image/*"></div><div class="actions"><button class="btn" id="sv">Save product</button><button class="btn ghost" onclick="closeModal()">Cancel</button></div>`);

  $('#sv').onclick = () => {
    const n = $('#fn').value.trim();
    const p = +$('#fp').value;
    const s = +$('#fs').value;

    if(!n || !p) return toast('Enter a name and price');

    const add = img => {
      S.products.unshift({
        id:'PRD-'+(100+S.products.length+1+Math.floor(Math.random()*90)),
        name:n,
        price:p,
        stock:s||0,
        cond:$('#fc').value,
        img
      });
      save();
      closeModal();
      go('products');
      toast('Product added');
      notify('Product registered: '+n);
    };

    const f = $('#fi').files[0];
    if(f) {
      const r = new FileReader();
      r.onload = () => add(r.result);
      r.readAsDataURL(f);
    } else add(ph('📦','#ede9fe'));
  };
}

function delProduct(id) {
  confirmBox('Delete this product?',()=>{
    S.products = S.products.filter(p=>p.id!==id);
    save();
    go('products');
    toast('Product deleted');
  });
}

function qr(id) {
  const p = prod(id);
  modal(`<h3>${p.name}</h3><p class="sub">${id} – scan at dispatch and on return.</p><div id="qrbox" style="display:grid;place-items:center;padding:14px"></div><div class="actions"><button class="btn" onclick="closeModal()">Done</button></div>`);

  if(window.QRCode) {
    new QRCode($('#qrbox'),{text:`ReturnShield|${id}|${p.name}`,width:180,height:180});
  } else {
    $('#qrbox').textContent='QR library not loaded (check internet).';
  }

  toast('QR code generated');
}

function setStatus(id,st) {
  confirmBox(`Mark ${id} as ${st}?`,()=>{
    S.returns.find(r=>r.id===id).status = st;
    save();
    notify(`${id} marked ${st}`);
    go('returns');
    toast(`Return ${st.toLowerCase()}`);
  });
}

const imgs = {};

function preview(inp,k) {
  const f = inp.files[0];
  if(!f) return;

  const r = new FileReader();

  r.onload = () => {
    imgs[k] = r.result;
    $('#d-'+k).innerHTML = `<img src="${r.result}" alt=""><small>${f.name}</small><input type="file" accept="image/*" hidden onchange="preview(this,'${k}')">`;
  };

  r.readAsDataURL(f);
}

function compare() {
  if(!imgs.orig || !imgs.ret) return toast('Upload both images first');
  const basePrice = Number($('#inspectBasePrice').value);
  if(!basePrice || basePrice < 1) return toast('Enter the product value before damage');

  const b = $('#cmp');
  b.disabled = true;

  $('#res').innerHTML = '<div class="card"><div class="spin"></div><p style="text-align:center" class="sub">Analysing images…</p></div>';

  setTimeout(()=>{
    b.disabled = false;

    const conf = 70+Math.floor(Math.random()*28);
    const dmg = Math.floor(Math.random()*60);
    const mis = Math.floor(Math.random()*50);
    const flag = dmg>35 || mis>30;
    // Transparent demo markdown bands; replace with market/category valuation when real AI is connected.
    const markdown = dmg<=10 ? 0.05 : dmg<=20 ? 0.10 : dmg<=30 ? 0.15 : dmg<=40 ? 0.25 : dmg<=50 ? 0.35 : 0.45;
    const estimatedPrice = Math.max(0, Math.round(basePrice * (1-markdown)));

    window.last = {conf,dmg,mis,flag,basePrice,markdown,estimatedPrice};

    $('#res').innerHTML = `<div class="card"><div class="row" style="margin:0 0 14px"><h3 style="margin:0">Inspection result</h3><span class="demo-tag">Demo simulation – not real AI detection</span></div>
    <div class="grid g2"><figure><img src="${imgs.orig}" style="width:100%;border-radius:12px" alt=""><small class="sub">Original</small></figure><figure><img src="${imgs.ret}" style="width:100%;border-radius:12px;outline:3px solid ${flag?'#ef4444':'#10b981'}" alt=""><small class="sub">Returned</small></figure></div>
    ${[['Possible damage',dmg],['Product mismatch',mis],['AI confidence',conf]].map(x=>`<p style="margin-top:14px"><b>${x[0]}</b> – ${x[1]}%</p><div class="meter"><i style="width:${x[1]}%"></i></div>`).join('')}
    <p style="margin-top:14px">${flag?pill('High').replace('High','Review recommended'):pill('Low').replace('Low','Looks consistent')}</p>
    <div class="price-result"><div><small>Value before damage</small><b>${inr(basePrice)}</b></div><div><small>Indicative damage markdown</small><b>${Math.round(markdown*100)}%</b></div><div class="suggested-price"><small>Suggested as-is resale price</small><strong>${inr(estimatedPrice)}</strong></div></div>
    <small class="sub">Pricing is an illustrative demo estimate based on the simulated damage score, not a verified market valuation. Confirm functionality, repair cost, age, category and local resale prices before making an offer.</small>
    <div class="actions"><button class="btn" onclick="report()"><i class="fa-solid fa-file-lines"></i>Generate inspection report</button></div></div>`;
  },1600);
}

function report() {
  const l = window.last;
  const n = S.reports.length+1;

  const t = `RETURNSHIELD INSPECTION REPORT #${n}
Date: ${new Date().toLocaleString()}
NOTE: Demo simulation – not real AI detection.

Damage indicator: ${l.dmg}%
Mismatch indicator: ${l.mis}%
Confidence: ${l.conf}%
Value before damage: ${inr(l.basePrice)}
Indicative markdown: ${Math.round(l.markdown*100)}%
Suggested as-is resale price: ${inr(l.estimatedPrice)}
Recommendation: ${l.flag?'Flag for manual review':'No issues found'}
NOTE: Price is an illustrative demo estimate, not a verified market valuation.
`;

  S.reports.unshift({
    title:'Inspection report #'+n,
    when:new Date().toLocaleDateString(),
    text:t
  });

  save();
  notify('Inspection report #'+n+' saved to Evidence Center');
  download(`inspection-report-${n}.txt`,t);
}

const dlReport = i => download(`inspection-report-${S.reports.length-i}.txt`,S.reports[i].text);

function dispute() {
  const t = `DISPUTE EVIDENCE SUMMARY
Generated: ${new Date().toLocaleString()}

`+S.returns.map(r=>`${r.id} | ${r.order} | ${prod(r.pid).name} | ${r.reason} | ${r.status} | ${inr(r.amount)}`).join('\n')+`

Inspection reports on file: ${S.reports.length}
Dispatch images on file: ${S.products.length}
`;

  download('dispute-summary.txt',t);
}

const NAV = [
  ['dashboard','Dashboard','fa-gauge-high'],
  ['products','Products','fa-box-open'],
  ['orders','Orders','fa-receipt'],
  ['returns','Return Requests','fa-rotate-left'],
  ['inspect','AI Inspection','fa-wand-magic-sparkles'],
  ['asis','As Is Where Is','fa-warehouse'],
  ['analytics','Loss Analytics','fa-chart-line'],
  ['evidence','Evidence Center','fa-folder-open'],
  ['settings','Settings','fa-gear']
];

function go(p) {
  charts.splice(0).forEach(c=>c.destroy());

  $('#view').innerHTML = `<div class="spin"></div>`;

  setTimeout(()=>{
    $('#view').innerHTML = pages[p]();

    document.querySelectorAll('#nav a').forEach(a=>a.classList.toggle('on',a.dataset.p===p));

    $('#sidebar').classList.remove('open');
    $('#scrim').classList.remove('open');

    location.hash = p;

    if(p==='products') listProducts();

    const g = 'rgba(124,58,237,';

    if(p==='dashboard') {
      mk('c1',{
        type:'line',
        data:{
          labels:months,
          datasets:[
            {label:'Returns',data:[14,18,12,22,17,S.returns.length+14],borderColor:'#7c3aed',backgroundColor:g+'.12)',fill:true,tension:.4},
            {label:'Recovered (₹k)',data:[20,26,18,35,30,42],borderColor:'#10b981',tension:.4}
          ]
        },
        options:{plugins:{legend:{position:'bottom'}}}
      });
    }

    if(p==='analytics') {
      mk('c2',{
        type:'bar',
        data:{
          labels:months,
          datasets:[
            {label:'Loss (₹k)',data:[52,61,44,70,58,48],backgroundColor:'#7c3aed',borderRadius:8},
            {label:'Recovered (₹k)',data:[20,26,18,35,30,42],backgroundColor:'#c4b5fd',borderRadius:8}
          ]
        },
        options:{plugins:{legend:{position:'bottom'}}}
      });

      mk('c3',{
        type:'bar',
        data:{
          labels:S.products.slice(0,5).map(p=>p.name),
          datasets:[
            {label:'Returns',data:[23,17,14,9,6],backgroundColor:'#0f1535',borderRadius:8}
          ]
        },
        options:{indexAxis:'y',plugins:{legend:{display:false}}}
      });
    }
  },250);
}

$('#nav').innerHTML = NAV.map(n=>`<a data-p="${n[0]}" onclick="go('${n[0]}')"><i class="fa-solid ${n[2]}"></i>${n[1]}</a>`).join('')+'<div class="sep"></div><a onclick="confirmBox(\'Log out of ReturnShield demo?\',logoutDemo)"><i class="fa-solid fa-right-from-bracket"></i>Logout</a>';

$('#today').textContent = new Date().toLocaleDateString('en-IN',{
  weekday:'long',
  day:'numeric',
  month:'long',
  year:'numeric'
});

$('#bell').onclick = () => {
  $('#notes').classList.toggle('open');
  S.read = true;
  save();
  bell();
};

$('#menuBtn').onclick = () => {
  $('#sidebar').classList.toggle('open');
  $('#scrim').classList.toggle('open');
};

$('#scrim').onclick = () => {
  $('#sidebar').classList.remove('open');
  $('#scrim').classList.remove('open');
};

$('#globalSearch').onkeydown = e => {
  if(e.key==='Enter') {
    go('products');
    setTimeout(()=>{
      $('#pq').value = e.target.value;
      listProducts();
    },400);
  }
};

bell();

window.openDashboard = function(role, email) {
  currentRole = role;
  $('#loginScreen').hidden = true;
  $('#app').hidden = false;
  const displayName = role === 'Retailer' ? 'Aarav Retail' : (email.split('@')[0] || 'Customer');
  document.querySelector('.user strong').textContent = displayName;
  document.querySelector('.user small').textContent = role + ' · SahiReturn';
  document.querySelector('.avatar').textContent = displayName.slice(0,2).toUpperCase();
  const heroRole = role === 'Retailer' ? 'Retailer' : 'Customer';
  // Keep the supplied retailer dashboard content and navigate to its landing page.
  go('dashboard');
};

function logoutDemo() {
  closeModal();
  $('#app').hidden = true;
  $('#loginScreen').hidden = false;
  $('#loginForm').reset();
  selectedRole = 'Customer';
  document.querySelectorAll('.role-option').forEach(btn =>
    btn.classList.toggle('active', btn.dataset.role === 'Customer')
  );
  $('#message').textContent = 'You have been logged out.';
  $('#message').style.color = '#082d49';
  location.hash = '';
}
