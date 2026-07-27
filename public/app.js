(() => {
  const OPEN_HOUR = 9;
  const CLOSE_HOUR = 23;
  const PHONE_RE = /^\+?\d{7,15}$/;

  const i18n = {
    uz: {
      tagline: 'Barbershop',
      nameLabel: "To'liq ism",
      namePlaceholder: 'Ism Familiya',
      phoneLabel: 'Telefon raqami',
      dateLabel: 'Sana',
      timeLabel: 'Vaqt',
      submit: 'Yozilish',
      submitting: 'Yuborilmoqda...',
      hours: 'Ish vaqti: 09:00 – 23:00',
      errName: "Ismingizni to'liq kiriting",
      errPhone: "Telefon raqamini to'g'ri kiriting",
      errDate: "Sanani tanlang (o'tmish sana bo'lmasin)",
      errTime: 'Vaqtni tanlang',
      successMsg: "Rahmat! Sizning buyurtmangiz qabul qilindi. Tez orada siz bilan bog'lanamiz.",
      errorMsg: "Xatolik yuz berdi. Iltimos, birozdan so'ng qayta urinib ko'ring.",
    },
    ru: {
      tagline: 'Барбершоп',
      nameLabel: 'Полное имя',
      namePlaceholder: 'Имя Фамилия',
      phoneLabel: 'Номер телефона',
      dateLabel: 'Дата',
      timeLabel: 'Время',
      submit: 'Записаться',
      submitting: 'Отправка...',
      hours: 'Время работы: 09:00 – 23:00',
      errName: 'Введите ваше полное имя',
      errPhone: 'Введите корректный номер телефона',
      errDate: 'Выберите дату (не в прошлом)',
      errTime: 'Выберите время',
      successMsg: 'Спасибо! Ваша запись принята. Мы скоро с вами свяжемся.',
      errorMsg: 'Произошла ошибка. Пожалуйста, попробуйте ещё раз чуть позже.',
    },
  };

  let lang = 'uz';

  const form = document.getElementById('booking-form');
  const nameInput = document.getElementById('name');
  const phoneInput = document.getElementById('phone');
  const dateInput = document.getElementById('date');
  const timeSelect = document.getElementById('time');
  const submitBtn = document.getElementById('submit-btn');
  const statusEl = document.getElementById('status');
  const langButtons = document.querySelectorAll('.lang-btn');

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  function buildTimeSlots() {
    const slots = [];
    for (let h = OPEN_HOUR; h <= CLOSE_HOUR; h++) {
      slots.push(`${pad(h)}:00`);
      if (h !== CLOSE_HOUR) slots.push(`${pad(h)}:30`);
    }
    return slots;
  }

  function populateTimeSelect() {
    const previous = timeSelect.value;
    timeSelect.innerHTML = '';
    buildTimeSlots().forEach((slot) => {
      const opt = document.createElement('option');
      opt.value = slot;
      opt.textContent = slot;
      timeSelect.appendChild(opt);
    });
    if (previous && [...timeSelect.options].some((o) => o.value === previous)) {
      timeSelect.value = previous;
    }
  }

  function setMinDate() {
    const today = new Date();
    dateInput.min = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
    if (!dateInput.value) dateInput.value = dateInput.min;
  }

  function applyLang() {
    const dict = i18n[lang];
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) el.textContent = dict[key];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (dict[key]) el.placeholder = dict[key];
    });
    langButtons.forEach((btn) => {
      btn.classList.toggle('is-active', btn.dataset.lang === lang);
    });
    clearErrors();
    statusEl.textContent = '';
    statusEl.className = 'status';
  }

  function clearErrors() {
    ['name', 'phone', 'date', 'time'].forEach((field) => {
      document.getElementById(`${field}-error`).textContent = '';
      document.getElementById(field).classList.remove('is-invalid');
    });
  }

  function showFieldError(field, message) {
    document.getElementById(`${field}-error`).textContent = message;
    document.getElementById(field).classList.add('is-invalid');
  }

  function validate() {
    const dict = i18n[lang];
    let valid = true;
    clearErrors();

    const name = nameInput.value.trim();
    if (name.length < 2 || name.length > 80) {
      showFieldError('name', dict.errName);
      valid = false;
    }

    const phone = phoneInput.value.trim();
    if (!PHONE_RE.test(phone)) {
      showFieldError('phone', dict.errPhone);
      valid = false;
    }

    const date = dateInput.value;
    if (!date || date < dateInput.min) {
      showFieldError('date', dict.errDate);
      valid = false;
    }

    const time = timeSelect.value;
    if (!time) {
      showFieldError('time', dict.errTime);
      valid = false;
    }

    return valid;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const dict = i18n[lang];
    if (!validate()) return;

    submitBtn.disabled = true;
    submitBtn.querySelector('span').textContent = dict.submitting;
    statusEl.textContent = '';
    statusEl.className = 'status';

    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nameInput.value.trim(),
          phone: phoneInput.value.trim(),
          date: dateInput.value,
          time: timeSelect.value,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'request_failed');

      statusEl.textContent = dict.successMsg;
      statusEl.className = 'status success';
      form.reset();
      setMinDate();
      populateTimeSelect();
    } catch (err) {
      statusEl.textContent = dict.errorMsg;
      statusEl.className = 'status error';
    } finally {
      submitBtn.disabled = false;
      submitBtn.querySelector('span').textContent = dict.submit;
    }
  }

  langButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      lang = btn.dataset.lang;
      applyLang();
    });
  });

  form.addEventListener('submit', handleSubmit);

  populateTimeSelect();
  setMinDate();
  applyLang();
})();
