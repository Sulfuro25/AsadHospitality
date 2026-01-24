/**
 * Asad Hospitality — Interactive behavior
 * Testimonial carousel, mobile nav, form, footer year
 */

(function () {
  "use strict";

  // Footer year
  let yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Language switching
  let currentLang = localStorage.getItem("asadLang") || "en";
  let htmlEl = document.documentElement;

  function getNestedValue(obj, path) {
    return path.split(".").reduce(function (o, p) {
      return o && o[p];
    }, obj);
  }

  function translatePage(lang) {
    if (!translations || !translations[lang]) return;

    // Update HTML lang attribute
    htmlEl.setAttribute("lang", lang);

    // Update all elements with data-translate
    document.querySelectorAll("[data-translate]").forEach(function (el) {
      let key = el.getAttribute("data-translate");
      let text = getNestedValue(translations[lang], key);
      if (text) {
        el.textContent = text;
      }
    });

    // Update placeholders
    document.querySelectorAll("[data-translate-placeholder]").forEach(function (el) {
      let key = el.getAttribute("data-translate-placeholder");
      let text = getNestedValue(translations[lang], key);
      if (text) {
        el.placeholder = text;
      }
    });

    // Update language buttons
    document.querySelectorAll(".lang-btn").forEach(function (btn) {
      btn.classList.toggle("active", btn.getAttribute("data-lang") === lang);
    });

    // Save preference
    localStorage.setItem("asadLang", lang);
    currentLang = lang;
  }

  // Initialize language
  translatePage(currentLang);

  // Language switcher buttons
  document.querySelectorAll(".lang-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      let lang = this.getAttribute("data-lang");
      translatePage(lang);
      // If modal is open, re-render it with new language
      let modal = document.getElementById("property-modal");
      if (modal && modal.classList.contains("active")) {
        // We need to know which property is open. 
        // We can store it on the modal element itself.
        let currentApt = modal.getAttribute("data-current-apt");
        if (currentApt) {
          openPropertyModal(currentApt);
        }
      }
    });
  });

  // Mobile nav toggle
  let navToggle = document.querySelector(".nav-toggle");
  let navLinks = document.querySelector(".nav-links");
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      navLinks.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", navLinks.classList.contains("open"));
    });

    // Close on link click (for anchor links)
    navLinks.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        navLinks.classList.remove("open");
      });
    });
  }

  // Testimonial carousel
  let testimonials = document.querySelectorAll(".testimonial");
  let dots = document.querySelectorAll(".carousel-dots .dot");
  let prevBtn = document.querySelector(".carousel-prev");
  let nextBtn = document.querySelector(".carousel-next");

  if (testimonials.length > 0) {
    let current = 0;
    let total = testimonials.length;

    function goTo(index) {
      current = (index + total) % total;
      testimonials.forEach(function (t, i) {
        t.classList.toggle("active", i === current);
      });
      dots.forEach(function (d, i) {
        d.classList.toggle("active", i === current);
        d.setAttribute("aria-selected", i === current);
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        goTo(current - 1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        goTo(current + 1);
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        goTo(i);
      });
    });

    // Optional: auto-advance carousel
    let carouselInterval = setInterval(function () {
      goTo(current + 1);
    }, 6000);

    // Pause on hover
    let carousel = document.querySelector(".testimonial-carousel");
    if (carousel) {
      carousel.addEventListener("mouseenter", function () {
        clearInterval(carouselInterval);
      });
      carousel.addEventListener("mouseleave", function () {
        carouselInterval = setInterval(function () {
          goTo(current + 1);
        }, 6000);
      });
    }
  }

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      let targetId = this.getAttribute("href");
      if (targetId === "#") return;
      let target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  // ============================================================
  // GESTION DES NOTIFICATIONS (TOASTS)
  // ============================================================
  function showToast(message, type = 'success') {
    const toast = document.getElementById('notification-toast');
    const toastMessage = document.getElementById('toast-message');
    const toastIcon = document.getElementById('toast-icon');

    // 1. On remplit le message
    toastMessage.textContent = message;

    // 2. On change l'icône et la couleur selon le type
    if (type === 'success') {
      toast.classList.remove('error');
      toastIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    } else {
      toast.classList.add('error');
      toastIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
    }

    // 3. On affiche (Ajoute la classe .show)
    toast.classList.add('show');

    // 4. On cache automatiquement après 5 secondes
    setTimeout(() => {
      toast.classList.remove('show');
    }, 5000);
  }

  // Fancy Phone Input Initialization
  const phoneInput = document.querySelector("#phone");
  let iti = null;
  if (phoneInput && window.intlTelInput) {
    iti = window.intlTelInput(phoneInput, {
      initialCountry: "ma",
      preferredCountries: ["ma", "be", "nl", "fr", "gb"],
      separateDialCode: true,
      utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@24.5.0/build/js/utils.js",
    });
  }

  // ============================================================
  // FORMULAIRE DE CONTACT (FormSubmit + Toasts)
  // ============================================================
  // 5. Contact Form (Secure)
  const form = document.querySelector(".contact-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const btn = form.querySelector("button[type='submit']");
      const originalBtnText = btn.innerText;

      btn.innerText = "Sending...";
      btn.disabled = true;

      const formData = new FormData(form);

      // Get the full international number
      if (iti) {
        formData.set("phone", iti.getNumber());
      }

      // C'EST ICI LA SÉCURITÉ : L'email est défini dans le JS, pas dans le HTML
      const targetEmail = "fadilx4@gmail.com";

      fetch(`https://formsubmit.co/ajax/${targetEmail}`, {
        method: "POST",
        body: formData
      })
        .then(response => response.json())
        .then(data => {
          const messages = {
            en: "Thank you! We'll contact you soon.",
            fr: "Merci ! Nous vous contacterons bientôt.",
            nl: "Bedankt! We nemen binnenkort contact op."
          };
          showToast(messages[currentLang] || messages.en, 'success');
          form.reset();
        })
        .catch(error => {
          console.error(error);
          showToast("Connection error. Please try again.", 'error');
        })
        .finally(() => {
          btn.innerText = originalBtnText;
          btn.disabled = false;
        });
    });
  }

  // Property modal functionality
  let modal = document.getElementById("property-modal");
  let modalClose = document.querySelector(".modal-close");
  let modalMainImg = document.getElementById("modal-main-img");
  let modalThumbnails = document.getElementById("modal-thumbnails");
  let modalInfo = document.getElementById("modal-info");

  // Navigation arrows
  let modalPrev = document.querySelector(".modal-prev");
  let modalNext = document.querySelector(".modal-next");

  // Property data structure (text content moved to translations.js)
  let propertyIds = {
    1: { images: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
    2: { images: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
    3: { images: [1, 2, 3, 4, 5, 6, 7, 8] },
    4: { images: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
    5: { images: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }
  };

  let currentModalImageIndex = 0;
  let currentAptImages = [];
  let currentAptNum = 0;

  function setMainImage(imgNum) {
    // Find index of this imgNum in currentAptImages
    let idx = currentAptImages.indexOf(imgNum);
    if (idx !== -1) {
      currentModalImageIndex = idx;

      // ANIMATION LOGIC:
      // 1. Remove fade class
      modalMainImg.classList.remove('fade');
      // 2. Trigger reflow (browser repaint) so animation restarts
      void modalMainImg.offsetWidth;
      // 3. Add fade class back
      modalMainImg.classList.add('fade');

      // Set source
      const imgSrc = "img/Appartment_" + currentAptNum + "/" + imgNum + ".jpg";
      modalMainImg.src = imgSrc;

      // Sync blurred background (Cinema Effect)
      const mainImageContainer = modalMainImg.parentElement;
      if (mainImageContainer) {
        mainImageContainer.style.backgroundImage = `url('${imgSrc}')`;
      }

      // Update thumbnails
      modalThumbnails.querySelectorAll("img").forEach(function (img, i) {
        let isActive = (i === idx);
        img.classList.toggle("active", isActive);

        // Auto-scroll the thumbnail strip to keep active image in view
        if (isActive) {
          img.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      });
    }
  }

  function nextImage() {
    currentModalImageIndex = (currentModalImageIndex + 1) % currentAptImages.length;
    setMainImage(currentAptImages[currentModalImageIndex]);
  }

  function prevImage() {
    currentModalImageIndex = (currentModalImageIndex - 1 + currentAptImages.length) % currentAptImages.length;
    setMainImage(currentAptImages[currentModalImageIndex]);
  }

  function getFeatureIcon(text) {
    const lower = text.toLowerCase();

    // Bedroom
    if (lower.includes("bedroom") || lower.includes("chambre") || lower.includes("slaapkamer") || lower.includes("lit") || lower.includes("bed")) {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg>`;
    }
    // Bathroom
    if (lower.includes("bath") || lower.includes("salle de bain") || lower.includes("badkamer") || lower.includes("douche") || lower.includes("wash")) {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6 7 12h14l-2-6Z"/><path d="M10 12v8"/><path d="M14 12v8"/><path d="M19 10L5 3"/><path d="m5 21 3-3V8"/><path d="M21 21L1 1"/></svg>`;
    }
    // Kitchen
    if (lower.includes("kitchen") || lower.includes("cuisine") || lower.includes("keuken")) {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>`;
    }
    // Parking
    if (lower.includes("parking") || lower.includes("stationnement") || lower.includes("garage")) {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 17V7h4a3 3 0 0 1 0 6H9"/></svg>`;
    }
    // Living room
    if (lower.includes("living") || lower.includes("salon") || lower.includes("woonkamer")) {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3"/><rect width="20" height="8" x="2" y="11" rx="2"/><path d="M6 11v-1"/><path d="M18 11v-1"/><path d="M2 11h20"/></svg>`;
    }
    // Outdoor / View / Air
    if (lower.includes("terrace") || lower.includes("balcony") || lower.includes("balcon") || lower.includes("terrasse") || lower.includes("view") || lower.includes("vue")) {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`;
    }
    // Pool / Water
    if (lower.includes("pool") || lower.includes("piscine") || lower.includes("zwembad")) {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6c.6.5 1.2 1 2.5 1C5.8 7 7 6 7 6s1.2-1 2.5-1c1.3 0 2.5 1 2.5 1s1.2 1 2.5 1c1.3 0 2.5-1 2.5-1s1.2-1 2.5-1 2.5 1 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 1.3 0 2.5-1 2.5-1s1.2-1 2.5-1c1.3 0 2.5 1 2.5 1s1.2 1 2.5 1c1.3 0 2.5-1 2.5-1s1.2-1 2.5-1 2.5 1 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 1.3 0 2.5-1 2.5-1s1.2-1 2.5-1c1.3 0 2.5 1 2.5 1s1.2 1 2.5 1c1.3 0 2.5-1 2.5-1s1.2-1 2.5-1 2.5 1 2.5 1"/></svg>`;
    }
    // AC / Air
    if (lower.includes("air condition") || lower.includes("climatisation") || lower.includes("ac")) {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><path d="M6 12V9a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v3"/><path d="M12 3v4"/><path d="M9 18l-3 3"/><path d="M15 18l3 3"/></svg>`;
    }
    // Security
    if (lower.includes("secure") || lower.includes("sécurisée") || lower.includes("beveiligde") || lower.includes("24/7")) {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>`;
    }

    // Default icon (Chevron/Arrow)
    return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`;
  }

  function openPropertyModal(aptNum) {
    let rawData = propertyIds[aptNum];
    if (!rawData) return;

    // Get translated content
    let transData = translations[currentLang].propertiesData[aptNum];
    let modalLabels = translations[currentLang].modal;
    if (!transData) return;

    currentAptNum = aptNum;
    currentAptImages = rawData.images;
    currentModalImageIndex = 0;

    // Store current apt for language switching
    modal.setAttribute("data-current-apt", aptNum);

    // Set main image
    setMainImage(currentAptImages[0]);
    modalMainImg.alt = transData.title;

    // Create thumbnails
    modalThumbnails.innerHTML = "";
    currentAptImages.forEach(function (imgNum) {
      let thumb = document.createElement("img");
      thumb.src = "img/Appartment_" + aptNum + "/" + imgNum + ".jpg";
      thumb.alt = "View " + imgNum;
      thumb.addEventListener("click", function () {
        setMainImage(imgNum);
      });
      modalThumbnails.appendChild(thumb);
    });
    // Set active state for first thumb
    modalThumbnails.children[0].classList.add("active");

    // Construct Modal Info with premium structure
    modalInfo.innerHTML = `
      <div class="modal-info-header">
        <h3>${transData.title}</h3>
        <span class="property-location">${transData.location}</span>
      </div>
      
      <div class="modal-description-wrap">
        <h4>${modalLabels.description}</h4>
        <p>${transData.description}</p>
      </div>
      
      <div class="modal-features-wrap">
        <h4>${modalLabels.features}</h4>
        <ul class="property-features">
          ${transData.features.map(f => `
            <li>
              ${getFeatureIcon(f)}
              <span>${f}</span>
            </li>
          `).join("")}
        </ul>
      </div>
    `;

    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closePropertyModal() {
    modal.classList.remove("active");
    document.body.style.overflow = "";
    modal.removeAttribute("data-current-apt");
  }

  // Open modal on button click
  document.querySelectorAll(".property-view-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      let aptNum = this.getAttribute("data-apt");
      openPropertyModal(aptNum);
    });
  });

  // Modal Arrow Events
  if (modalPrev) {
    modalPrev.addEventListener("click", function (e) {
      e.stopPropagation(); // Prevent modal close
      prevImage();
    });
  }
  if (modalNext) {
    modalNext.addEventListener("click", function (e) {
      e.stopPropagation(); // Prevent modal close
      nextImage();
    });
  }

  // Close modal
  if (modalClose) {
    modalClose.addEventListener("click", closePropertyModal);
  }

  // Close on background click
  if (modal) {
    modal.addEventListener("click", function (e) {
      if (e.target === modal) {
        closePropertyModal();
      }
    });
  }

  // Close on Escape key
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal.classList.contains("active")) {
      closePropertyModal();
    }
    // Arrow keys for gallery
    if (modal.classList.contains("active")) {
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "ArrowRight") nextImage();
    }
  });
})();