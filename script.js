// Mobile nav toggle
const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.site-nav');
if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });
}

// Dark/Light mode toggle with persistence
const themeToggle = document.querySelector('.theme-toggle');
const rootEl = document.documentElement;
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') rootEl.classList.add('dark');
if (themeToggle) {
  updateThemeButton();
  themeToggle.addEventListener('click', () => {
    rootEl.classList.toggle('dark');
    const isDark = rootEl.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeButton();
  });
}
function updateThemeButton() {
  const isDark = rootEl.classList.contains('dark');
  themeToggle.setAttribute('aria-pressed', String(isDark));
  themeToggle.textContent = isDark ? '☀️' : '🌙';
}

// Smooth scroll for same-page links
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const targetId = link.getAttribute('href');
    if (targetId && targetId.length > 1) {
      const el = document.querySelector(targetId);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        nav?.classList.remove('open');
        navToggle?.setAttribute('aria-expanded', 'false');
      }
    }
  });
});

// Footer year
const y = document.getElementById('year');
if (y) y.textContent = new Date().getFullYear();

// Auto-detect if iframe has a real src (not placeholder) and reveal
// (Removed iframe usage)


// Option B: Google Forms relay (HTML inputs -> Google Forms -> linked Sheet)
// 1) Open your Google Form → three dots → Get pre-filled link OR inspect preview to find entry IDs
// 2) Set formAction to https://docs.google.com/forms/d/e/FORM_ID/formResponse
// 3) Map each local field to its entry.<ID>
const GOOGLE_FORMS = {
  enabled: true, // set to true after you fill formAction and entryMap
  formAction: 'https://docs.google.com/forms/d/e/1FAIpQLScohT3CCsiwNlyBknt30aHCC_DLweZ-q0UyiF6Eo6AXCV1rrg/formResponse',
  entryMap: {
    // localFieldName: 'entry.XXXXXXXX'
    name: 'entry.260959729',
    email: 'entry.331625622',
    category: 'entry.2145299222',
    title: 'entry.481703640',
    story: 'entry.2084074414',
  }
};

// Submit native form to backend
const form = document.getElementById('storyForm');
const statusEl = document.getElementById('formStatus');
const submitBtn = document.getElementById('submitBtn');

async function handleSubmit(event) {
  event.preventDefault();

  if (!form) return;
  const story = form.story?.value?.trim();
  if (!story) {
    statusEl.textContent = 'Vui lòng viết nội dung câu chuyện.';
    statusEl.style.color = '#d7263d';
    form.story?.focus();
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Đang gửi...';
  statusEl.textContent = '';

  const payload = {
    name: form.name?.value?.trim() || '',
    email: form.email?.value?.trim() || '',
    category: form.category?.value || 'Khác',
    title: form.title?.value?.trim() || '',
    story,
    consent: Boolean(form.consent?.checked)
  };

  try {
    if (GOOGLE_FORMS.enabled) {
      await submitToGoogleForms(payload);
    } else {
      await submitToAppsScript(payload);
    }
    statusEl.textContent = 'Đã gửi! Cảm ơn bạn đã chia sẻ.';
    statusEl.style.color = '#2a9d8f';
    form.reset();
  } catch (err) {
    statusEl.textContent = 'Có lỗi xảy ra khi gửi. Vui lòng thử lại sau.';
    statusEl.style.color = '#d7263d';
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Gửi câu chuyện';
  }
}

form?.addEventListener('submit', handleSubmit);

async function submitToAppsScript(payload) {
  if (typeof APPS_SCRIPT_URL === 'undefined' || !APPS_SCRIPT_URL || APPS_SCRIPT_URL.includes('REPLACE_WITH')) {
    throw new Error('APPS_SCRIPT_URL chưa được cấu hình. Đang dùng Google Forms.');
  }
  await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}

async function submitToGoogleForms(payload) {
  if (!GOOGLE_FORMS.formAction || !GOOGLE_FORMS.entryMap) {
    throw new Error('Google Forms chưa được cấu hình.');
  }
  if (GOOGLE_FORMS.formAction.includes('FORM_ID') || GOOGLE_FORMS.formAction.includes('preview')) {
    throw new Error('formAction chưa đúng. Hãy dùng https://docs.google.com/forms/d/e/FORM_ID/formResponse');
  }

  // Create a hidden iframe as target to avoid navigating away
  const iframeId = 'gform_iframe';
  let iframe = document.getElementById(iframeId);
  if (!iframe) {
    iframe = document.createElement('iframe');
    iframe.id = iframeId;
    iframe.name = iframeId;
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
  }

  // Create a temporary form mirroring Google Form entry names
  const tempForm = document.createElement('form');
  tempForm.method = 'POST';
  tempForm.action = GOOGLE_FORMS.formAction;
  tempForm.target = iframeId;
  tempForm.style.display = 'none';

  const map = GOOGLE_FORMS.entryMap;
  Object.entries({
    [map.name]: payload.name,
    [map.email]: payload.email,
    [map.category]: payload.category,
    [map.title]: payload.title,
    [map.story]: payload.story,
    [map.consent]: payload.consent ? 'yes' : 'no'
  }).forEach(([name, value]) => {
    if (!name || typeof value === 'undefined') return;
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = String(value);
    tempForm.appendChild(input);
  });

  document.body.appendChild(tempForm);
  tempForm.submit();
  tempForm.remove();
}

// Render sample stories (you can later replace with data pulled from your Sheet via Apps Script)
const storiesList = document.getElementById('storiesList');
if (storiesList) {
  const samples = [
    {
      title: 'Mùi phấn bảng cuối thu',
      content: 'Lớp học nhỏ, quạt trần kẽo kẹt và mùi phấn bảng bám trên tay áo. Cô bảo: “Mỗi người đều có một câu chuyện đáng kể.” Tôi đã im lặng rất lâu, tưởng như chẳng có gì để kể. Nhưng rồi một chiều cuối thu, khi ánh nắng chảy dài trên bậu cửa, tôi nhận ra những điều mình cố giấu đi mới là điều cần được nói ra. Hóa ra, nói thật với lòng mình là một dạng can đảm.',
      author: 'Một bạn ẩn danh',
      category: 'Chuyện trường lớp',
      time: '2 ngày trước'
    },
    {
      title: 'Thầy Hiệu trưởng và cô thư kí',
      content: 'Tôi đã chứng kiến cảnh này nhiều lần, tôi đã không tin đấy là sự thật cho đến một ngày tôi thấy họ đang tay trong tay bước ra từ nhà nghỉ. Tôi định giữ kín chuyện này cho riêng mình, nhưng tôi nhận ra việc 1 người điều hành cả 1 hệ thống giáo dục mà lại có những hành động như thế thì thật không đáng.',
      author: 'N.T.',
      category: 'Khó nói',
      time: '1 tuần trước'
    },
    {
      title: 'Tiếng trống tan trường',
      content: 'Tiếng trống chiều hè dội vào khoảng trời rực nắng, đám bạn ùa ra cổng như bầy chim nhỏ. Tôi đứng lại một lúc, đếm từng chiếc lá me rơi xuống vai áo. Con đường đất đỏ, đôi dép lấm bụi, mồ hôi mằn mặn nơi khóe mắt. Lớn lên rồi vẫn nhớ, vì có những hồi âm chỉ vang trong lòng, nhưng không bao giờ tắt.',
      author: 'P.L.',
      category: 'Chuyện cá nhân',
      time: '3 tuần trước'
    },
    {
      title: 'Ngày tôi học cách xin lỗi',
      content: 'Tôi từng nghĩ mình đúng chỉ vì mình tổn thương. Cho đến khi nhìn thấy đôi mắt buồn của mẹ, tôi hiểu rằng lời xin lỗi không làm mình nhỏ đi. Ngày tôi cúi đầu nói “con xin lỗi”, căn nhà im như thở phào. Hóa ra, trưởng thành không ồn ào, chỉ là biết nói dịu dàng với người mình thương.',
      author: 'H.L.',
      category: 'Chuyện cá nhân',
      time: '5 ngày trước'
    },
    {
      title: 'Bài kiểm tra điểm 4',
      content: 'Tôi mang tờ giấy điểm nhàu nát về, tay run như vừa đi qua cơn mưa lớn. Tưởng sẽ bị mắng, nhưng bố chỉ bảo: “Điểm không nói hết con người. Hôm nay con buồn, mai con cố hơn.” Tối hôm đó tôi học lại từ đầu, không phải vì sợ điểm kém, mà vì lần đầu thấy mình được tin cậy.',
      author: 'K.A.',
      category: 'Chuyện trường lớp',
      time: '10 ngày trước'
    },
    {
      title: 'Chiếc ghế cuối lớp',
      content: 'Tôi chọn ngồi cuối lớp để không ai thấy mình loay hoay. Nhưng hóa ra nơi cuối lớp lại nhìn thấy tất cả: một bạn ngủ gật vì làm thêm, bạn khác cắn bút viết nốt hồ sơ học bổng, còn cô giáo thì lặng lẽ dừng lại lâu hơn mỗi khi đọc tên tôi. Không ai vô hình cả, chỉ là đôi khi mình chưa dám bước ra thôi.',
      author: 'Ẩn danh',
      category: 'Chuyện trường lớp',
      time: '2 tuần trước'
    }
  ];

  const frag = document.createDocumentFragment();
  for (const s of samples) {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <div class="meta"><span class="dot"></span><span>${s.time}</span></div>
      <div class="title">${s.title}</div>
      <div class="content">${s.content}</div>
      <div class="tags"><span class="tag">${s.category}</span><span class="tag">${s.author}</span></div>
    `;
    frag.appendChild(card);
  }
  // To create an infinite loop, duplicate the set so total width >= 200%
  storiesList.appendChild(frag.cloneNode(true));
  storiesList.appendChild(frag);

  // Enable marquee mode
  const storiesSection = document.getElementById('cau-chuyen');
  if (storiesSection) storiesSection.classList.add('loop');
  storiesList.classList.add('marquee-running');

  // Modal interactions for story cards
  const modal = document.getElementById('storyModal');
  const mTitle = document.getElementById('storyModalTitle');
  const mContent = document.getElementById('storyModalContent');
  const mCat = document.getElementById('storyModalCategory');
  const mAuthor = document.getElementById('storyModalAuthor');
  const mTime = document.getElementById('storyModalTime');

  function openModal(data) {
    mTitle.textContent = data.title || '';
    mContent.textContent = data.content || '';
    mCat.textContent = data.category || '';
    mAuthor.textContent = data.author || '';
    mTime.textContent = data.time || '';
    modal?.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    modal?.classList.remove('open');
    document.body.style.overflow = '';
  }

  modal?.addEventListener('click', (e) => {
    if (e.target.closest('[data-close]')) closeModal();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  // Delegate: click on card
  storiesList.addEventListener('click', (e) => {
    const card = e.target.closest('.card');
    if (!card) return;
    // Reconstruct basic data from DOM
    const title = card.querySelector('.title')?.textContent?.trim() || '';
    const content = card.querySelector('.content')?.textContent?.trim() || '';
    const tags = [...card.querySelectorAll('.tags .tag')].map(t => t.textContent.trim());
    const [category = '', author = ''] = tags;
    const time = card.querySelector('.meta span:nth-child(2)')?.textContent?.trim() || '';
    openModal({ title, content, category, author, time });
  });
}

// Reveal on scroll animations
const reveals = document.querySelectorAll('.reveal');
if (reveals.length) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = Number(entry.target.getAttribute('data-reveal') || 0);
        setTimeout(() => entry.target.classList.add('in'), delay);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  reveals.forEach(el => io.observe(el));
}

// Parallax for blobs
const blobs = document.querySelectorAll('.blob[data-parallax]');
if (blobs.length) {
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    blobs.forEach(b => {
      const speed = Number(b.getAttribute('data-parallax')) || 10;
      b.style.transform = `translate3d(0, ${y / speed}px, 0)`;
    });
  }, { passive: true });
}

// Intro images: scroll fly-in (no mouse-follow)
const introStack = document.querySelector('.intro-media .stack');
if (introStack) {
  // Initial state: offset
  introStack.classList.add('init');
  const imgs = introStack.querySelectorAll('.card-img');

  // Replay on every scroll into view
  const ioIntro = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        imgs.forEach((img, i) => {
          // restart appear animation
          img.style.animation = 'none';
          // force reflow
          // eslint-disable-next-line no-unused-expressions
          img.offsetHeight;
          img.style.animation = `appearIn .6s ${i * 120}ms both`;
          img.classList.add('in');
        });
      } else {
        imgs.forEach((img) => {
          img.classList.remove('in');
          img.style.animation = 'none';
        });
      }
    });
  }, { threshold: 0.3 });

  ioIntro.observe(introStack);
}


const select = document.getElementById("category");

select.addEventListener("change", function () {
  if (this.value === "") {
    this.style.color = "rgb(190, 175, 123)"; // màu placeholder
  } else {
    this.style.color = "#000"; // màu option khác
  }
});

document.addEventListener('DOMContentLoaded', function () {
  const storyItems = document.querySelectorAll('.li-stories-mobile');
  const popupOverlay = document.getElementById('popupOverlay');
  const popupTitle = document.getElementById('popupTitle');
  const popupMeta = document.getElementById('popupMeta');
  const popupContent = document.getElementById('popupContent');
  const closeBtn = document.getElementById('closeBtn');

  // Thêm event listener cho mỗi story item
  storyItems.forEach(function (item) {
    item.addEventListener('click', function () {
      // Lấy thông tin từ thẻ li được click
      const title = this.querySelector('.li-title-stories-mobile').textContent;
      const meta = this.querySelector('.sp-li-stories').textContent;
      const content = this.getAttribute('data-content');

      // Cập nhật nội dung popup
      popupTitle.textContent = title;
      popupMeta.textContent = meta;
      popupContent.textContent = content;

      // Hiển thị popup
      popupOverlay.style.display = 'block';
      document.body.style.overflow = 'hidden'; // Ngăn scroll trang chính
    });
  });

  // Đóng popup khi click nút close
  closeBtn.addEventListener('click', function () {
    closePopup();
  });

  // Đóng popup khi click vào overlay (nền đen)
  popupOverlay.addEventListener('click', function (e) {
    if (e.target === popupOverlay) {
      closePopup();
    }
  });

  // Đóng popup khi nhấn phím ESC
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && popupOverlay.style.display === 'block') {
      closePopup();
    }
  });

  function closePopup() {
    popupOverlay.style.display = 'none';
    document.body.style.overflow = 'auto'; // Cho phép scroll trang chính trở lại
  }
});


const emailInput = document.getElementById('email');

emailInput.addEventListener('blur', validateEmail);
emailInput.addEventListener('input', validateEmail);

function validateEmail() {
  const email = emailInput.value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Xóa thông báo lỗi cũ
  removeErrorMessage();

  if (email === '') {
    showError('Email không được để trống');
    return false;
  }

  if (!emailRegex.test(email)) {
    showError('Vui lòng nhập đúng định dạng email');
    return false;
  }

  return true;
}

function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.style.color = 'red';
  errorDiv.style.fontSize = '14px';
  errorDiv.textContent = message;

  emailInput.parentNode.insertBefore(errorDiv, emailInput.nextSibling);
}

function removeErrorMessage() {
  const errorMsg = document.querySelector('.error-message');
  if (errorMsg) {
    errorMsg.remove();
  }
}

document.addEventListener('DOMContentLoaded', function () {
  const categorySelect = document.getElementById('category');

  // Validation khi thay đổi lựa chọn
  categorySelect.addEventListener('change', function () {
    validateCategory();
  });

  // Validation khi submit form
  const form = categorySelect.closest('form');
  if (form) {
    form.addEventListener('submit', function (e) {
      if (!validateCategory()) {
        e.preventDefault();
        categorySelect.focus();
      }
    });
  }

  function validateCategory() {
    const selectedValue = categorySelect.value;

    // Xóa thông báo lỗi cũ
    removeErrorMessage();

    if (selectedValue === '' || selectedValue === 'default') {
      showError('Vui lòng chọn chủ đề');
      return false;
    }

    return true;
  }

  function showError(message) {
    // Kiểm tra xem đã có thông báo lỗi chưa
    if (document.querySelector('.category-error')) return;

    const errorDiv = document.createElement('div');
    errorDiv.className = 'category-error';
    // errorDiv.style.cssText = 'color: #e74c3c; font-size: 14px; margin-top: 5px;';
    errorDiv.textContent = message;

    categorySelect.parentNode.appendChild(errorDiv);
  }

  function removeErrorMessage() {
    const errorMsg = document.querySelector('.category-error');
    if (errorMsg) {
      errorMsg.remove();
    }
  }
});

document.addEventListener('DOMContentLoaded', function () {
  const emailInput = document.getElementById('email');
  const submitBtn = document.getElementById('submitBtn');
  const formStatus = document.getElementById('formStatus');
  const form = submitBtn.closest('form');

  // Reset trạng thái ban đầu
  emailInput.style.border = '';
  emailInput.classList.remove('input-error', 'input-success');

  // Disable button ban đầu chỉ khi email rỗng
  checkEmailAndEnableButton();

  emailInput.addEventListener('input', function () {
    checkEmailAndEnableButton();
  });

  emailInput.addEventListener('blur', function () {
    // Chỉ validate khi blur và có giá trị
    if (emailInput.value.trim() !== '') {
      validateEmailAndShowBorder();
    }
  });

  emailInput.addEventListener('focus', function () {
    // Reset border khi focus (nếu muốn)
    emailInput.classList.remove('input-error');
    formStatus.textContent = '';
  });

  function checkEmailAndEnableButton() {
    const email = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (email !== '' && emailRegex.test(email)) {
      // Email hợp lệ
      submitBtn.disabled = false;
      submitBtn.style.opacity = '1';
      submitBtn.style.cursor = 'pointer';
      formStatus.textContent = '';
    } else {
      // Email không hợp lệ hoặc rỗng
      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.6';
      submitBtn.style.cursor = 'not-allowed';
    }
  }

  function validateEmailAndShowBorder() {
    const email = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Reset classes
    emailInput.classList.remove('input-error', 'input-success');

    if (email === '') {
      // Không hiện gì khi rỗng
      formStatus.textContent = '';
      return;
    }

    if (!emailRegex.test(email)) {
      // Email sai định dạng - hiện border đỏ
      emailInput.classList.add('input-error');
      formStatus.textContent = 'Email không đúng định dạng';
      formStatus.style.color = '#e74c3c';
    } else {
      // Email hợp lệ - hiện border xanh
      emailInput.classList.add('input-success');
      formStatus.textContent = '';
    }
  }

  // Validation khi submit
  form.addEventListener('submit', function (e) {
    const email = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (email === '') {
      e.preventDefault();
      emailInput.classList.add('input-error');
      formStatus.textContent = 'Vui lòng nhập email';
      formStatus.style.color = '#e74c3c';
      emailInput.focus();
      return false;
    }

    if (!emailRegex.test(email)) {
      e.preventDefault();
      emailInput.classList.add('input-error');
      formStatus.textContent = 'Email không đúng định dạng';
      formStatus.style.color = '#e74c3c';
      emailInput.focus();
      return false;
    }

    // Hiển thị trạng thái đang gửi
    formStatus.textContent = 'Đang gửi...';
    formStatus.style.color = '#3498db';
    submitBtn.disabled = true;

    const submitBtn = document.getElementById("submitBtn");
    const formStatus = document.getElementById("formStatus");

    submitBtn.addEventListener("click", function (e) {
      e.preventDefault(); // Ngăn form reload lại trang
      formStatus.textContent = "Đã gửi thành công ✅";
      formStatus.style.color = "green";
    });
  });
});


