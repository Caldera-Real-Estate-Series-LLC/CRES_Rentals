function setLang(lang){
  document.querySelectorAll('[data-lang]').forEach(function(el){
    el.classList.toggle('is-visible', el.getAttribute('data-lang') === lang);
  });
  var btnEn = document.getElementById('btn-en');
  var btnEs = document.getElementById('btn-es');
  if (btnEn) btnEn.classList.toggle('active', lang === 'en');
  if (btnEs) btnEs.classList.toggle('active', lang === 'es');
  document.documentElement.setAttribute('lang', lang);
  document.querySelectorAll('#pets-select option').forEach(function(opt){
    opt.textContent = lang === 'es' ? opt.getAttribute('data-es') : opt.getAttribute('data-en');
  });
}
setLang('en');

/* ---------- Application form: Word download + email via Web3Forms ---------- */
var WEB3FORMS_ACCESS_KEY = 'bc02cf0b-0519-4651-9df0-8a0e96103974';

function downloadApplicationDoc(data){
  var fields = [
    ['Full name', data.full_name],
    ['Phone', data.phone],
    ['Email', data.email],
    ['Current address', data.current_address],
    ['Number of occupants', data.occupants],
    ['Pets', data.pets === 'yes' ? 'Yes' : 'No'],
    ['Property or area of interest', data.property_interest],
    ['Desired move-in date', data.move_in_date],
    ['Current monthly rent payment', data.current_rent],
    ['Employer', data.employer],
    ['Monthly income', data.income],
    ['Receives housing assistance', data.housing_assistance === 'Yes' ? 'Yes' : 'No'],
    ['Notes', data.notes]
  ];
  var rowsHtml = fields.map(function(f){
    var val = f[1] ? String(f[1]).replace(/&/g,'&amp;').replace(/</g,'&lt;') : '';
    return '<tr>' +
      '<td style="padding:6px 10px;border:1px solid #ccc;font-weight:bold;width:220px;">' + f[0] + '</td>' +
      '<td style="padding:6px 10px;border:1px solid #ccc;">' + val + '</td>' +
      '</tr>';
  }).join('');
  var html = '<html><head><meta charset="UTF-8"></head><body style="font-family:Calibri,Arial,sans-serif;">' +
    '<h2>The Cres Group &ndash; Rental Application</h2>' +
    '<p>Submitted: ' + new Date().toLocaleString() + '</p>' +
    '<table style="border-collapse:collapse;width:100%;">' + rowsHtml + '</table>' +
    '</body></html>';
  var blob = new Blob(['\ufeff', html], { type: 'application/msword' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  var safeName = (data.full_name || 'application').replace(/[^a-z0-9]+/gi, '-');
  a.href = url;
  a.download = 'TheCresGroup-Application-' + safeName + '.doc';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(function(){ URL.revokeObjectURL(url); }, 3000);
}

function showApplyResult(kind){
  var ok = document.getElementById('confirm-success');
  var err = document.getElementById('confirm-error');
  if (ok) ok.classList.toggle('show', kind === 'success');
  if (err) err.classList.toggle('show', kind === 'error');
}

var applyForm = document.getElementById('apply-form');
if (applyForm) {
  applyForm.addEventListener('submit', function(e){
    e.preventDefault();
    var form = e.target;
    var formData = new FormData(form);

    if (formData.get('botcheck')) { return; }

    var data = Object.fromEntries(formData.entries());
    data.housing_assistance = formData.get('housing_assistance') ? 'Yes' : 'No';

    var submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    showApplyResult(null);

    var payload = Object.assign({
      access_key: WEB3FORMS_ACCESS_KEY,
      subject: 'New Rental Application' + (data.full_name ? ' \u2014 ' + data.full_name : ''),
      from_name: 'The Cres Group Website'
    }, data);

    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(function(res){ return res.json(); })
    .then(function(result){
      submitBtn.disabled = false;
      if (result.success) {
        downloadApplicationDoc(data);
        showApplyResult('success');
        form.reset();
      } else {
        showApplyResult('error');
      }
    })
    .catch(function(){
      submitBtn.disabled = false;
      showApplyResult('error');
    });
  });
}

/* ---------- "Message us" form ---------- */
function showMessageResult(kind){
  var missing = document.getElementById('message-error-contact');
  var ok = document.getElementById('message-success');
  var err = document.getElementById('message-error');
  if (missing) missing.classList.toggle('show', kind === 'missing-contact');
  if (ok) ok.classList.toggle('show', kind === 'success');
  if (err) err.classList.toggle('show', kind === 'error');
}

var messageForm = document.getElementById('message-form');
if (messageForm) {
  messageForm.addEventListener('submit', function(e){
    e.preventDefault();
    var form = e.target;
    var formData = new FormData(form);

    if (formData.get('botcheck')) { return; }

    var email = (formData.get('email') || '').trim();
    var phone = (formData.get('phone') || '').trim();

    if (!email && !phone) {
      showMessageResult('missing-contact');
      return;
    }

    var data = Object.fromEntries(formData.entries());

    var submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    showMessageResult(null);

    var payload = Object.assign({
      access_key: WEB3FORMS_ACCESS_KEY,
      subject: 'New Website Message' + (data.name ? ' \u2014 ' + data.name : ''),
      from_name: 'The Cres Group Website'
    }, data);

    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(function(res){ return res.json(); })
    .then(function(result){
      submitBtn.disabled = false;
      if (result.success) {
        showMessageResult('success');
        form.reset();
      } else {
        showMessageResult('error');
      }
    })
    .catch(function(){
      submitBtn.disabled = false;
      showMessageResult('error');
    });
  });
}

/* ---------- Property galleries & lightbox ---------- */
var galleries = {
  rosalee: [
    'Rentals/Rosalee/Apt%203/FrontRosalee.jpg',
    'Rentals/Rosalee/Apt%203/LivingRoom.jpg',
    'Rentals/Rosalee/Apt%203/kitchen.jpg',
    'Rentals/Rosalee/Apt%203/Room.jpg',
    'Rentals/Rosalee/Apt%203/room1.jpg',
    'Rentals/Rosalee/Apt%203/Room2.jpg',
    'Rentals/Rosalee/Apt%203/bath.jpg',
    'Rentals/Rosalee/Apt%203/bath2.jpg',
    'Rentals/Rosalee/Apt%203/HVAC.jpg'
  ],
  milpaverde: [
    'Rentals/MilpaVerde/Front-Milpa4.jpg',
    'Rentals/MilpaVerde/Kitchen_Milpa_4.jpg',
    'Rentals/MilpaVerde/Bath-Milpa4.jpg',
    'Rentals/MilpaVerde/Bed2-Millpa4.jpg',
    'Rentals/MilpaVerde/Bedroom1-Milpa4.jpg'
  ],
  elvalle: [
    'Rentals/ElValle/KitechEV1.jpg',
    'Rentals/ElValle/LinvinfELV1.jpg',
    'Rentals/ElValle/Bed.jpg',
    'Rentals/ElValle/ClosetELV1.jpg',
    'Rentals/ElValle/Bath.jpg',
    'Rentals/ElValle/Bath2.jpg'
  ],
  sandyln: [
    'Rentals/SandyLn/Front_SandyLn.jpg',
    'Rentals/SandyLn/LivingRoom_SandyLn.jpg',
    'Rentals/SandyLn/LivingRoom2_SandyLn.jpg',
    'Rentals/SandyLn/Kitchen1_SandyLn.jpg',
    'Rentals/SandyLn/Kitchen2_SandyLn.jpg',
    'Rentals/SandyLn/Bed1_SandyLn.jpg',
    'Rentals/SandyLn/Bed2_SandyLn.jpg',
    'Rentals/SandyLn/Bed2_Sandy_Ln.jpg',
    'Rentals/SandyLn/Bath1_SandyLn.jpg',
    'Rentals/SandyLn/Bath2_SandyLn.jpg',
    'Rentals/SandyLn/Bath3_SandyLn.jpg',
    'Rentals/SandyLn/CLoset_SandyLn.jpg',
    'Rentals/SandyLn/HVA_SandyLn.jpg',
    'Rentals/SandyLn/DriveWasjer_Hooks_SandyLn.jpg',
    'Rentals/SandyLn/BackYard_SandyLn.jpg'
  ]
};
var lightboxState = { gallery: null, index: 0 };

function setMainPhoto(name, idx){
  document.getElementById(name + '-main').src = galleries[name][idx];
}
function openLightbox(name, idx){
  lightboxState = { gallery: name, index: idx };
  document.getElementById('lightbox-img').src = galleries[name][idx];
  document.getElementById('lightbox').classList.add('open');
}
function closeLightbox(){
  var lb = document.getElementById('lightbox');
  if (lb) lb.classList.remove('open');
}
function stepLightbox(dir){
  var imgs = galleries[lightboxState.gallery];
  lightboxState.index = (lightboxState.index + dir + imgs.length) % imgs.length;
  document.getElementById('lightbox-img').src = imgs[lightboxState.index];
}
document.addEventListener('keydown', function(e){
  var lb = document.getElementById('lightbox');
  if(!lb || !lb.classList.contains('open')) return;
  if(e.key === 'Escape') closeLightbox();
  if(e.key === 'ArrowLeft') stepLightbox(-1);
  if(e.key === 'ArrowRight') stepLightbox(1);
});
