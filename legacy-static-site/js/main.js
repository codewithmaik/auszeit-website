// ===== Mobile nav toggle =====
document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
      var expanded = nav.classList.contains('open');
      toggle.setAttribute('aria-expanded', expanded);
    });
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { nav.classList.remove('open'); });
    });
  }

  // ===== Default booking dates (today / +3 days) =====
  var checkin = document.getElementById('checkin');
  var checkout = document.getElementById('checkout');
  if (checkin && checkout) {
    var today = new Date();
    var inDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    var outDate = new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000);
    var fmt = function (d) { return d.toISOString().split('T')[0]; };
    checkin.min = fmt(today);
    checkout.min = fmt(today);
    if (!checkin.value) checkin.value = fmt(inDate);
    if (!checkout.value) checkout.value = fmt(outDate);

    checkin.addEventListener('change', function () {
      var minOut = new Date(checkin.value);
      minOut.setDate(minOut.getDate() + 1);
      checkout.min = fmt(minOut);
      if (new Date(checkout.value) <= new Date(checkin.value)) {
        checkout.value = fmt(minOut);
      }
    });
  }

  // ===== Booking form submission =====
  var form = document.getElementById('booking-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var status = document.getElementById('form-status');

      // Basic validation
      var name = form.querySelector('[name="name"]').value.trim();
      var email = form.querySelector('[name="email"]').value.trim();
      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      if (!name || !emailOk) {
        status.textContent = 'Bitte Name und eine gültige E-Mail-Adresse angeben.';
        status.className = 'form-status error';
        return;
      }

      var endpoint = form.getAttribute('data-endpoint');
      var submitBtn = form.querySelector('button[type="submit"]');
      var originalText = submitBtn.textContent;

      // If no real form endpoint has been configured yet, fall back to a mailto draft
      // so the site is still fully usable out of the box.
      if (!endpoint || endpoint.indexOf('YOUR_FORM_ID') !== -1) {
        var data = Object.fromEntries(new FormData(form).entries());
        var body = Object.keys(data).map(function (k) { return k + ': ' + data[k]; }).join('%0D%0A');
        window.location.href = 'mailto:info@auszeit-mosel.de?subject=Buchungsanfrage%20AUSZEIT&body=' + body;
        status.textContent = 'Ihr E-Mail-Programm öffnet sich mit der ausgefüllten Anfrage.';
        status.className = 'form-status success';
        return;
      }

      submitBtn.textContent = 'Wird gesendet …';
      submitBtn.disabled = true;

      fetch(endpoint, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form)
      }).then(function (res) {
        if (res.ok) {
          status.textContent = 'Vielen Dank! Ihre Anfrage wurde versendet — wir melden uns schnellstmöglich.';
          status.className = 'form-status success';
          form.reset();
        } else {
          throw new Error('Request failed');
        }
      }).catch(function () {
        status.textContent = 'Da ist leider etwas schiefgelaufen. Bitte versuchen Sie es erneut oder schreiben Sie uns direkt eine E-Mail.';
        status.className = 'form-status error';
      }).finally(function () {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      });
    });
  }

  // Footer year
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});
