const qs = s => document.querySelector(s);
const qsa = s => document.querySelectorAll(s);
const form = qs("#invoiceForm");
const previewCard = qs("#previewCard");

const printBtn = qs("#printBtn");
const downloadPdfBtn = qs("#downloadPdfBtn");
let lastInvoiceData = null;

function currency(n){ return "₹" + Number(n||0).toFixed(2) }

function calculate(data){
  const kms = parseFloat(data.kms) || 0;
  const rate = parseFloat(data.rate) || 0;
  const baseFare = parseFloat(data.baseFare)||0;
  const waiting = parseFloat(data.waiting)||0;
  const toll = parseFloat(data.toll)||0;
  const driver = parseFloat(data.driver)||0;
  const peak = parseFloat(data.peak)||0;
  const advance = parseFloat(data.advance)||0;

  const kmsFare = kms * rate;
  const waitingCharge = waiting;
  const subtotal = baseFare + kmsFare + waitingCharge + toll + driver + peak;
  const amountDue = Math.max(0, subtotal - advance);
  return { kmsFare, waitingCharge, subtotal, amountDue, advance };
}

function renderInvoice(data){
  const calc = calculate(data);
  const html = `
  <div class="invoice" id="invoice">
    <div class="header">
      <div style="display:flex;gap:12px;align-items:center">
        <div class="logo">
          <img src="images/logo.png" alt="Company Logo">
        </div>
        <div>
          <div style="font-weight:700">Trusty Yellow Cabs</div>
          <div style="color:#6b7280;font-size:13px">
            Coimbatore Tamilnadu 641007<br>IN<br>+91 88700 88020<br>trustyyellowcabs@gmail.com<br>www.trustyyellowcabs.in
          </div>
        </div>
      </div>
      <div style="text-align:right">
  <div style="color:#6b7280">Invoice Date</div>
  <div style="font-weight:700">
    ${data.invoiceDate 
      ? new Date(data.invoiceDate).toLocaleDateString() 
      : new Date().toLocaleDateString()}
  </div>

  ${data.tripDate 
    ? `<div style="color:#6b7280; margin-top:6px;">Trip Date</div>
       <div style="font-weight:600">${new Date(data.tripDate).toLocaleDateString()}</div>`
    : ""
  }
</div>

    </div>

    <div style="display:flex;justify-content:space-between;margin-top:12px;gap:12px;flex-wrap:wrap">
      <div>
        <div style="font-weight:700">Bill To</div>
        <div style="color:#6b7280">
          ${data.name || ""} ${data.phone? ("- "+data.phone):""}<br>
          ${data.pickup || ""} → ${data.drop || ""}
        </div>
      </div>
    <div style="text-align:right;color:#6b7280">
  <div>Service: Taxi / Cab</div>
  ${data.vehicleType ? `<div>Vehicle Type: <strong>${data.vehicleType}</strong></div>` : ""}
  ${data.driverName ? `<div>Driver: <strong>${data.driverName}</strong></div>` : ""}
  ${data.vehicleNumber ? `<div>Vehicle No: <strong>${data.vehicleNumber}</strong></div>` : ""}
</div>


    <table class="table" aria-label="items">
      <thead>
        <tr>
          <th>Description</th>
          <th style="text-align:right">KMs/Fare</th>
          <th style="text-align:right">Charges</th>
          <th style="text-align:right">Total</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>Base Fare</td><td style="text-align:right">—</td><td style="text-align:right">${currency(data.baseFare)}</td><td style="text-align:right">${currency(data.baseFare)}</td></tr>
        <tr><td>Kms Fare (${data.kms} km)</td><td style="text-align:right">${data.kms}</td><td style="text-align:right">${currency(data.rate)}</td><td style="text-align:right">${currency(calc.kmsFare)}</td></tr>
        <tr><td>Waiting Time Fare</td><td style="text-align:right">${data.waiting}</td><td style="text-align:right">—</td><td style="text-align:right">${currency(calc.waitingCharge)}</td></tr>
        <tr><td>Toll & Parking Charges</td><td style="text-align:right">—</td><td style="text-align:right">—</td><td style="text-align:right">${currency(data.toll)}</td></tr>
        <tr><td>Driver Beta</td><td style="text-align:right">—</td><td style="text-align:right">—</td><td style="text-align:right">${currency(data.driver)}</td></tr>
        <tr><td>Peak Time Surcharge</td><td style="text-align:right">—</td><td style="text-align:right">—</td><td style="text-align:right">${currency(data.peak)}</td></tr>
      </tbody>
    </table>

    <div class="summary">
      <div class="box">
        <div style="display:flex;justify-content:space-between;padding-bottom:6px">
          <div>Subtotal</div><div>${currency(calc.subtotal)}</div>
        </div>
        <div style="display:flex;justify-content:space-between;padding-bottom:6px">
          <div>Advance</div><div>${currency(calc.advance)}</div>
        </div>
        <div style="display:flex;justify-content:space-between;font-weight:700;border-top:1px solid #eef2f6;padding-top:8px">
          <div>Amount Due</div><div>${currency(calc.amountDue)}</div>
        </div>
      </div>
    </div>

    <div style="margin-top:12px;color:#6b728c;font-size:13px">
      Thank you! It was a pleasure doing business with you.<br>
      Website: <a href="https://www.trustyyellowcabs.in" target="_blank">trustyyellowcabs.in</a>
    </div>
  </div>
  `;
  previewCard.innerHTML = html;
  lastInvoiceData = {...data, calculated:calc, date: new Date().toISOString()};
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const fd = new FormData(form);
  const data = {};
  for (const [k,v] of fd.entries()) data[k]=v;
  renderInvoice(data);
  activateTab('preview');
});

printBtn.addEventListener("click", () => {
  const inv = qs("#invoice");
  if (!inv) { alert("Preview invoice first"); return; }
  document.body.innerHTML = inv.outerHTML;
  window.print();
  window.location.reload();
});

downloadPdfBtn.addEventListener("click", () => {
  const inv = qs("#invoice");
  if (!inv) { alert("Preview invoice first"); return; }
  const opt = {
    margin: 10,
    filename: 'Invoice.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };
  html2pdf().set(opt).from(inv).save();
});

function activateTab(tab){
  qsa('.tab').forEach(b=>{
    b.classList.toggle('active', b.dataset.tab===tab);
    b.setAttribute('aria-selected', b.dataset.tab===tab);
  });
  qsa('.panel').forEach(p=> p.classList.toggle('active', p.id===tab));
  window.scrollTo({top:0,behavior:'smooth'});
}
qsa('.tab').forEach(b=> b.addEventListener('click', ()=> activateTab(b.dataset.tab)));
activateTab('form');

// PDF animation button
const btn = document.getElementById('downloadPdfBtn');
const label = btn.querySelector('.label');

btn.addEventListener('click', () => {
  if (btn.disabled) return;
  btn.disabled = true;
  btn.classList.add('run');
  label.textContent = 'Preparing...';

  setTimeout(() => {
    btn.classList.remove('run');
    btn.classList.add('success');
    label.textContent = 'PDF Ready ✓';

    setTimeout(() => {
      btn.disabled = false;
      btn.classList.remove('success');
      label.textContent = 'Download PDF';
    }, 2000);
  }, 1200);
});
