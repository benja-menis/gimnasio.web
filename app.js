/**
 * =============================================
 * TESTIMONIAL CAROUSEL - Enhanced Slider
 * =============================================
 * Features:
 * - Responsive (3 cards on desktop, 2 on tablet, 1 on mobile)
 * - Touch/swipe support for mobile
 * - Keyboard navigation
 * - Auto-play with pause on hover
 * - Smooth animations and transitions
 */

(function() {
  'use strict';

  // DOM Elements
  const track = document.getElementById('testimonialTrack');
  const cards = document.querySelectorAll('.testimonial-card');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const dotsContainer = document.getElementById('carouselDots');

  // Carousel State
  let currentIndex = 0;
  let cardsPerView = getCardsPerView();
  let totalPages = Math.ceil(cards.length / cardsPerView);
  let autoPlayInterval = null;
  let isAnimating = false;

  // Configuration
  const AUTO_PLAY_DELAY = 5000; // 5 seconds
  const ANIMATION_DURATION = 500; // matches CSS transition

  /**
   * Determine how many cards to show based on viewport width
   */
  function getCardsPerView() {
    if (window.innerWidth <= 768) return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
  }

  /**
   * Calculate card width including gap
   */
  function getCardWidth() {
    if (!cards.length) return 0;
    const card = cards[0];
    const style = window.getComputedStyle(track);
    const gap = parseInt(style.gap) || 30;
    return card.offsetWidth + gap;
  }

  /**
   * Create navigation dots
   */
  function createDots() {
    dotsContainer.innerHTML = '';
    for (let i = 0; i < totalPages; i++) {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Ir a pagina ${i + 1} de testimonios`);
      dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      dot.addEventListener('click', () => goToPage(i));
      dotsContainer.appendChild(dot);
    }
  }

  /**
   * Update active dot indicator
   */
  function updateDots() {
    const dots = dotsContainer.querySelectorAll('.carousel-dot');
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndex);
      dot.setAttribute('aria-selected', i === currentIndex ? 'true' : 'false');
    });
  }

  /**
   * Update navigation button states
   */
  function updateButtons() {
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex >= totalPages - 1;
  }

  /**
   * Animate cards visibility with stagger effect
   */
  function animateCards() {
    cards.forEach((card, i) => {
      const startIndex = currentIndex * cardsPerView;
      const endIndex = startIndex + cardsPerView;
      const isVisible = i >= startIndex && i < endIndex;

      if (isVisible) {
        setTimeout(() => {
          card.classList.add('visible');
        }, (i - startIndex) * 100);
      } else {
        card.classList.remove('visible');
      }
    });
  }

  /**
   * Move carousel to specific page
   */
  function goToPage(pageIndex) {
    if (isAnimating || pageIndex === currentIndex) return;
    if (pageIndex < 0 || pageIndex >= totalPages) return;

    isAnimating = true;
    currentIndex = pageIndex;

    const offset = currentIndex * cardsPerView * getCardWidth();
    track.style.transform = `translateX(-${offset}px)`;

    updateDots();
    updateButtons();
    animateCards();

    setTimeout(() => {
      isAnimating = false;
    }, ANIMATION_DURATION);
  }

  /**
   * Navigate to next page
   */
  function nextPage() {
    if (currentIndex < totalPages - 1) {
      goToPage(currentIndex + 1);
    } else {
      goToPage(0); // Loop back to start
    }
  }

  /**
   * Navigate to previous page
   */
  function prevPage() {
    if (currentIndex > 0) {
      goToPage(currentIndex - 1);
    } else {
      goToPage(totalPages - 1); // Loop to end
    }
  }

  /**
   * Start auto-play
   */
  function startAutoPlay() {
    stopAutoPlay();
    autoPlayInterval = setInterval(nextPage, AUTO_PLAY_DELAY);
  }

  /**
   * Stop auto-play
   */
  function stopAutoPlay() {
    if (autoPlayInterval) {
      clearInterval(autoPlayInterval);
      autoPlayInterval = null;
    }
  }

  /**
   * Handle window resize
   */
  function handleResize() {
    const newCardsPerView = getCardsPerView();
    if (newCardsPerView !== cardsPerView) {
      cardsPerView = newCardsPerView;
      totalPages = Math.ceil(cards.length / cardsPerView);

      // Reset to valid page if needed
      if (currentIndex >= totalPages) {
        currentIndex = totalPages - 1;
      }

      createDots();
      goToPage(currentIndex);
    }
  }

  /**
   * Handle touch/swipe events
   */
  function setupTouchEvents() {
    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    const minSwipeDistance = 50;

    track.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      currentX = startX;
      isDragging = true;
      stopAutoPlay();
    }, { passive: true });

    track.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      currentX = e.touches[0].clientX;
      const diff = Math.abs(currentX - startX);
      // If horizontal swipe is detected, prevent vertical scrolling
      if (diff > 10) {
        e.preventDefault();
      }
    }, { passive: false });

    track.addEventListener('touchend', () => {
      if (!isDragging) return;
      isDragging = false;
      const distance = startX - currentX;
      if (Math.abs(distance) > minSwipeDistance) {
        if (distance > 0) {
          nextPage();
        } else {
          prevPage();
        }
      }
      startAutoPlay();
      startX = 0;
      currentX = 0;
    });
  }

  /**
   * Setup keyboard navigation
   */
  function setupKeyboardNav() {
    document.addEventListener('keydown', (e) => {
      const testimonialSection = document.getElementById('testimonials');
      const rect = testimonialSection.getBoundingClientRect();
      const isInView = rect.top < window.innerHeight && rect.bottom > 0;

      if (!isInView) return;

      if (e.key === 'ArrowLeft') {
        prevPage();
        stopAutoPlay();
      } else if (e.key === 'ArrowRight') {
        nextPage();
        stopAutoPlay();
      }
    });
  }

  /**
   * Initialize carousel
   */
  function init() {
    if (!track || !cards.length) return;

    // Create dots
    createDots();

    // Setup button events
    prevBtn.addEventListener('click', () => {
      prevPage();
      stopAutoPlay();
    });

    nextBtn.addEventListener('click', () => {
      nextPage();
      stopAutoPlay();
    });

    // Pause auto-play on hover
    const carousel = document.querySelector('.testimonial-carousel');
    carousel.addEventListener('mouseenter', stopAutoPlay);
    carousel.addEventListener('mouseleave', startAutoPlay);

    // Setup touch events for mobile
    setupTouchEvents();

    // Setup keyboard navigation
    setupKeyboardNav();

    // Handle resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(handleResize, 150);
    });

    // Initial setup
    updateButtons();
    animateCards();

    // Start auto-play
    startAutoPlay();

    // Intersection Observer for animation on scroll
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCards();
        }
      });
    }, { threshold: 0.2 });

    observer.observe(document.getElementById('testimonials'));
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

/**
 * =============================================
 * CONTACT FORM - Validation & Submission
 * =============================================
 * Features:
 * - Real-time field validation
 * - Email format validation
 * - Phone number validation (numbers only)
 * - Loading state on submit
 * - Success message display
 * - Form reset functionality
 */

(function() {
  'use strict';

  // DOM Elements
  const form = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');
  const formSuccess = document.getElementById('formSuccess');
  const resetFormBtn = document.getElementById('resetFormBtn');

  // Form Fields
  const fields = {
    name: document.getElementById('contactName'),
    email: document.getElementById('contactEmail'),
    phone: document.getElementById('contactPhone'),
    branch: document.getElementById('contactBranch'),
    plan: document.getElementById('contactPlan'),
    message: document.getElementById('contactMessage')
  };

  // Validation Rules
  const validators = {
    /**
     * Validate name field (min 2 characters)
     */
    name: (value) => {
      return value.trim().length >= 2;
    },

    /**
     * Validate email format using regex
     */
    email: (value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value.trim());
    },

    /**
     * Validate phone (only numbers, spaces, dashes, plus sign)
     * Must have at least 8 digits
     */
    phone: (value) => {
      const digitsOnly = value.replace(/[\s\-\+]/g, '');
      const phoneRegex = /^[0-9]+$/;
      return phoneRegex.test(digitsOnly) && digitsOnly.length >= 8;
    },

    /**
     * Validate branch selection
     */
    branch: (value) => {
      return value !== '' && value !== null;
    },

    /**
     * Validate plan selection (optional - always valid)
     */
    plan: (value) => {
      return true; // Plan is optional
    },

    /**
     * Validate message (min 10 characters)
     */
    message: (value) => {
      return value.trim().length >= 10;
    }
  };

  /**
   * Validate a single field
   * @param {string} fieldName - Name of the field to validate
   * @returns {boolean} - Whether the field is valid
   */
  function validateField(fieldName) {
    const field = fields[fieldName];
    const value = field.value;
    const isValid = validators[fieldName](value);
    const formGroup = field.closest('.form-group');

    // Update field state
    formGroup.classList.remove('error', 'valid');
    if (value.trim() !== '' || field.tagName === 'SELECT') {
      formGroup.classList.add(isValid ? 'valid' : 'error');
    }

    return isValid;
  }

  /**
   * Validate all form fields
   * @returns {boolean} - Whether all fields are valid
   */
  function validateForm() {
    let isFormValid = true;

    Object.keys(fields).forEach(fieldName => {
      if (!validateField(fieldName)) {
        isFormValid = false;
      }
    });

    return isFormValid;
  }

  /**
   * Set up real-time validation on blur and input
   */
  function setupFieldValidation() {
    Object.keys(fields).forEach(fieldName => {
      const field = fields[fieldName];

      // Validate on blur (when leaving field)
      field.addEventListener('blur', () => {
        validateField(fieldName);
      });

      // Clear error on input (if previously had error)
      field.addEventListener('input', () => {
        const formGroup = field.closest('.form-group');
        if (formGroup.classList.contains('error')) {
          validateField(fieldName);
        }
      });

      // Special handling for phone - filter non-numeric input
      if (fieldName === 'phone') {
        field.addEventListener('input', (e) => {
          // Allow only numbers, spaces, dashes, and plus sign
          e.target.value = e.target.value.replace(/[^0-9\s\-\+]/g, '');
        });
      }
    });
  }

  /**
   * Handle form submission
   * @param {Event} e - Submit event
   */
  function handleSubmit(e) {
    e.preventDefault();

    // Validate all fields
    if (!validateForm()) {
      // Focus first invalid field
      const firstError = form.querySelector('.form-group.error input, .form-group.error select, .form-group.error textarea');
      if (firstError) {
        firstError.focus();
      }
      return;
    }

    // Show loading state
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    // Simulate form submission (replace with actual API call)
    setTimeout(() => {
      // Hide form, show success message
      form.style.display = 'none';
      formSuccess.classList.add('show');

      // Reset loading state
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;

      // Log form data (for development)
      console.log('Form submitted:', {
        name: fields.name.value,
        email: fields.email.value,
        phone: fields.phone.value,
        branch: fields.branch.value,
        plan: fields.plan.value || 'No plan selected',
        message: fields.message.value
      });
    }, 1500);
  }

  /**
   * Reset form to initial state
   */
  function resetForm() {
    // Reset form fields
    form.reset();

    // Remove validation classes
    Object.keys(fields).forEach(fieldName => {
      const formGroup = fields[fieldName].closest('.form-group');
      formGroup.classList.remove('error', 'valid');
    });

    // Reset plan selection visual feedback
    const planSelectionGroup = fields.plan?.closest('.form-group.plan-selection');
    const selectedPlanBadge = document.getElementById('selectedPlanBadge');
    if (planSelectionGroup) {
      planSelectionGroup.classList.remove('plan-selected');
    }
    if (selectedPlanBadge) {
      selectedPlanBadge.classList.remove('visible');
    }

    // Hide success, show form
    formSuccess.classList.remove('show');
    form.style.display = 'grid';

    // Focus first field
    fields.name.focus();
  }

  /**
   * Initialize contact form
   */
  function init() {
    if (!form) return;

    // Setup field validation
    setupFieldValidation();

    // Handle form submission
    form.addEventListener('submit', handleSubmit);

    // Handle reset button
    resetFormBtn.addEventListener('click', resetForm);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

/**
 * Smooth scroll to contact section
 * Used by CTA buttons throughout the page
 */
function scrollToContact() {
  const contactSection = document.getElementById('contact');
  if (contactSection) {
    contactSection.scrollIntoView({ behavior: 'smooth' });
    // Focus the first form field after scroll
    setTimeout(() => {
      const firstField = document.getElementById('contactName');
      if (firstField) firstField.focus();
    }, 800);
  }
}

/**
 * =============================================
 * PRICING CAROUSEL - Mobile Swipeable Plans
 * =============================================
 * Features:
 * - Swipe/touch support for mobile
 * - Navigation buttons and dots
 * - Responsive (carousel on mobile, grid on desktop)
 * - Maintains all existing pricing functionality
 */
(function() {
  'use strict';

  // DOM Elements
  const carousel = document.getElementById('pricingCarousel');
  const track = document.getElementById('priceCardsTrack');
  const cards = track ? track.querySelectorAll('.price-card') : [];
  const prevBtn = document.getElementById('pricingPrevBtn');
  const nextBtn = document.getElementById('pricingNextBtn');
  const dotsContainer = document.getElementById('pricingDots');

  // State
  let currentIndex = 0;
  let isMobile = false;
  let startX = 0;
  let currentX = 0;
  let isDragging = false;

  // Configuration
  const MOBILE_BREAKPOINT = 768;
  const SWIPE_THRESHOLD = 50;

  /**
   * Check if we're in mobile view
   */
  function checkMobileView() {
    return window.innerWidth <= MOBILE_BREAKPOINT;
  }

  /**
   * Get card width including gap
   */
  function getCardWidth() {
    if (!cards.length) return 0;
    const card = cards[0];
    return card.offsetWidth;
  }

  /**
   * Create navigation dots
   */
  function createDots() {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';

    cards.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'pricing-dot' + (i === currentIndex ? ' active' : '');
      dot.setAttribute('aria-label', `Ir al plan ${i + 1}`);
      dot.addEventListener('click', () => goToSlide(i));
      dotsContainer.appendChild(dot);
    });
  }

  /**
   * Update active dot
   */
  function updateDots() {
    if (!dotsContainer) return;
    const dots = dotsContainer.querySelectorAll('.pricing-dot');
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndex);
    });
  }

  /**
   * Update navigation buttons state
   */
  function updateButtons() {
    if (prevBtn) prevBtn.disabled = currentIndex === 0;
    if (nextBtn) nextBtn.disabled = currentIndex >= cards.length - 1;
  }

  /**
   * Go to specific slide
   */
  function goToSlide(index) {
    if (index < 0 || index >= cards.length) return;
    currentIndex = index;

    if (isMobile && track) {
      const offset = currentIndex * getCardWidth();
      track.style.transform = `translateX(-${offset}px)`;
    }

    updateDots();
    updateButtons();
  }

  /**
   * Next slide
   */
  function nextSlide() {
    if (currentIndex < cards.length - 1) {
      goToSlide(currentIndex + 1);
    }
  }

  /**
   * Previous slide
   */
  function prevSlide() {
    if (currentIndex > 0) {
      goToSlide(currentIndex - 1);
    }
  }

  /**
   * Handle touch start
   */
  function handleTouchStart(e) {
    if (!isMobile) return;
    startX = e.touches[0].clientX;
    isDragging = true;
    track.style.transition = 'none';
  }

  /**
   * Handle touch move
   */
  function handleTouchMove(e) {
    if (!isMobile || !isDragging) return;
    currentX = e.touches[0].clientX;
    const diff = currentX - startX;
    // If horizontal swipe is detected, prevent vertical scrolling
    if (Math.abs(diff) > 10) {
      e.preventDefault();
    }
    const offset = currentIndex * getCardWidth() - diff;
    track.style.transform = `translateX(-${offset}px)`;
  }

  /**
   * Handle touch end
   */
  function handleTouchEnd() {
    if (!isMobile || !isDragging) return;
    isDragging = false;
    track.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';

    const diff = currentX - startX;

    if (Math.abs(diff) > SWIPE_THRESHOLD) {
      if (diff > 0 && currentIndex > 0) {
        prevSlide();
      } else if (diff < 0 && currentIndex < cards.length - 1) {
        nextSlide();
      } else {
        goToSlide(currentIndex);
      }
    } else {
      goToSlide(currentIndex);
    }

    startX = 0;
    currentX = 0;
  }

  /**
   * Handle window resize
   */
  function handleResize() {
    const wasMobile = isMobile;
    isMobile = checkMobileView();

    if (wasMobile !== isMobile) {
      if (isMobile) {
        // Switching to mobile - enable carousel
        goToSlide(0);
      } else {
        // Switching to desktop - reset transform
        if (track) {
          track.style.transform = '';
          track.style.transition = '';
        }
        currentIndex = 0;
        updateDots();
      }
    } else if (isMobile) {
      // Still mobile - recalculate position
      goToSlide(currentIndex);
    }
  }

  /**
   * Initialize pricing carousel
   */
  function init() {
    if (!carousel || !track || !cards.length) return;

    isMobile = checkMobileView();

    // Create dots
    createDots();

    // Setup button events
    if (prevBtn) {
      prevBtn.addEventListener('click', prevSlide);
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', nextSlide);
    }

    // Setup touch events
    track.addEventListener('touchstart', handleTouchStart, { passive: true });
    track.addEventListener('touchmove', handleTouchMove, { passive: false });
    track.addEventListener('touchend', handleTouchEnd);

    // Handle resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(handleResize, 150);
    });

    // Initial setup
    updateButtons();

    if (isMobile) {
      goToSlide(0);
    }

    console.log('Pricing carousel initialized');
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

/**
 * =============================================
 * MOBILE NAVIGATION - Hamburger Menu
 * =============================================
 * Features:
 * - Toggle mobile menu on hamburger click
 * - Close menu on overlay click
 * - Close menu on link click
 * - Close menu on escape key
 * - Prevent body scroll when menu is open
 */
(function() {
  'use strict';

  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('nav');
  const navOverlay = document.getElementById('navOverlay');
  const navLinks = nav ? nav.querySelectorAll('a') : [];

  /**
   * Toggle mobile menu state
   */
  function toggleMenu() {
    const isOpen = nav.classList.contains('active');

    hamburger.classList.toggle('active');
    nav.classList.toggle('active');
    navOverlay.classList.toggle('active');

    // Update aria attributes
    hamburger.setAttribute('aria-expanded', !isOpen);
    hamburger.setAttribute('aria-label', isOpen ? 'Abrir menú' : 'Cerrar menú');

    // Prevent body scroll when menu is open
    document.body.style.overflow = !isOpen ? 'hidden' : '';
  }

  /**
   * Close mobile menu
   */
  function closeMenu() {
    hamburger.classList.remove('active');
    nav.classList.remove('active');
    navOverlay.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Abrir menú');
    document.body.style.overflow = '';
  }

  /**
   * Initialize mobile navigation
   */
  function init() {
    if (!hamburger || !nav || !navOverlay) return;

    // Toggle menu on hamburger click
    hamburger.addEventListener('click', toggleMenu);

    // Close menu on overlay click
    navOverlay.addEventListener('click', closeMenu);

    // Close menu on link click
    navLinks.forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('active')) {
        closeMenu();
      }
    });

    // Close menu on window resize (if switching to desktop)
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && nav.classList.contains('active')) {
        closeMenu();
      }
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
