/**
 * Asad Hospitality — Interactive behavior
 * Testimonial carousel, mobile nav, form, footer year
 */

(function () {
  "use strict";

  // Footer year
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Language switching
  var currentLang = localStorage.getItem("asadLang") || "en";
  var htmlEl = document.documentElement;

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
      var key = el.getAttribute("data-translate");
      var text = getNestedValue(translations[lang], key);
      if (text) {
        el.textContent = text;
      }
    });

    // Update placeholders
    document.querySelectorAll("[data-translate-placeholder]").forEach(function (el) {
      var key = el.getAttribute("data-translate-placeholder");
      var text = getNestedValue(translations[lang], key);
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
      var lang = this.getAttribute("data-lang");
      translatePage(lang);
      // If modal is open, re-render it with new language
      var modal = document.getElementById("property-modal");
      if (modal && modal.classList.contains("active")) {
        // We need to know which property is open. 
        // We can store it on the modal element itself.
        var currentApt = modal.getAttribute("data-current-apt");
        if (currentApt) {
          openPropertyModal(currentApt);
        }
      }
    });
  });

  // Mobile nav toggle
  var navToggle = document.querySelector(".nav-toggle");
  var navLinks = document.querySelector(".nav-links");
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
  var testimonials = document.querySelectorAll(".testimonial");
  var dots = document.querySelectorAll(".carousel-dots .dot");
  var prevBtn = document.querySelector(".carousel-prev");
  var nextBtn = document.querySelector(".carousel-next");

  if (testimonials.length > 0) {
    var current = 0;
    var total = testimonials.length;

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
    var carouselInterval = setInterval(function () {
      goTo(current + 1);
    }, 6000);

    // Pause on hover
    var carousel = document.querySelector(".testimonial-carousel");
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
      var targetId = this.getAttribute("href");
      if (targetId === "#") return;
      var target = document.querySelector(targetId);
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

  // ============================================================
  // FORMULAIRE DE CONTACT (FormSubmit + Toasts)
  // ============================================================
  var form = document.querySelector(".contact-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var btn = form.querySelector("button[type='submit']");
      var originalBtnText = btn.innerText;

      // Feedback : Bouton en chargement
      btn.innerText = "Sending...";
      btn.disabled = true;
      btn.style.opacity = "0.7";

      var formData = new FormData(form);

      // Envoi vers FormSubmit
      fetch("https://formsubmit.co/ajax/", { //info@asadhospitality.ma
        method: "POST",
        body: formData
      })
        .then(response => response.json())
        .then(data => {
          // SUCCÈS : On affiche le Toast au lieu de l'alerte
          var messages = {
            en: "Message sent! We'll contact you shortly.",
            fr: "Message envoyé ! Nous vous contacterons bientôt.",
            nl: "Bericht verzonden! We nemen spoedig contact op."
          };
          showToast(messages[currentLang] || messages.en, 'success');

          form.reset(); // Vide les champs
        })
        .catch(error => {
          // ERREUR : Toast d'erreur
          console.log(error);
          showToast("Connection error. Please try again.", 'error');
        })
        .finally(() => {
          // On remet le bouton normal
          btn.innerText = originalBtnText;
          btn.disabled = false;
          btn.style.opacity = "1";
        });
    });
  }

  // Property modal functionality
  var modal = document.getElementById("property-modal");
  var modalClose = document.querySelector(".modal-close");
  var modalMainImg = document.getElementById("modal-main-img");
  var modalThumbnails = document.getElementById("modal-thumbnails");
  var modalInfo = document.getElementById("modal-info");

  // Navigation arrows
  var modalPrev = document.querySelector(".modal-prev");
  var modalNext = document.querySelector(".modal-next");

  // Property data structure (text content moved to translations.js)
  var propertyIds = {
    1: { images: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
    2: { images: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
    3: { images: [1, 2, 3, 4, 5, 6, 7, 8] },
    4: { images: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
    5: { images: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }
  };

  var currentModalImageIndex = 0;
  var currentAptImages = [];
  var currentAptNum = 0;

  function setMainImage(imgNum) {
    // Find index of this imgNum in currentAptImages
    var idx = currentAptImages.indexOf(imgNum);
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
      modalMainImg.src = "img/Appartment_" + currentAptNum + "/" + imgNum + ".jpg";

      // Update thumbnails
      modalThumbnails.querySelectorAll("img").forEach(function (img, i) {
        var isActive = (i === idx);
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

  function openPropertyModal(aptNum) {
    var rawData = propertyIds[aptNum];
    if (!rawData) return;

    // Get translated content
    var transData = translations[currentLang].propertiesData[aptNum];
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
      var thumb = document.createElement("img");
      thumb.src = "img/Appartment_" + aptNum + "/" + imgNum + ".jpg";
      thumb.alt = "View " + imgNum;
      thumb.addEventListener("click", function () {
        setMainImage(imgNum);
      });
      modalThumbnails.appendChild(thumb);
    });
    // Set active state for first thumb
    modalThumbnails.children[0].classList.add("active");

    // Set info
    modalInfo.innerHTML = "<h3>" + transData.title + "</h3>" +
      "<p class='property-location'>" + transData.location + "</p>" +
      "<p class='property-description'>" + transData.description + "</p>" +
      "<ul class='property-features'>" +
      transData.features.map(function (f) {
        return "<li>" + f + "</li>";
      }).join("") +
      "</ul>";

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
      var aptNum = this.getAttribute("data-apt");
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