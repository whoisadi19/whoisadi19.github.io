document.addEventListener('DOMContentLoaded', () => {
  // Set Current Footer Year
  const yearSpan = document.getElementById('current-year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  // --- Theme Toggler ---
  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');
  const htmlElement = document.documentElement;

  // Initialize theme from local storage or system preference
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme) {
    htmlElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
  } else {
    const defaultTheme = systemPrefersDark ? 'dark' : 'light';
    htmlElement.setAttribute('data-theme', defaultTheme);
    updateThemeIcon(defaultTheme);
  }

  themeToggle.addEventListener('click', () => {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    htmlElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
  });

  function updateThemeIcon(theme) {
    if (theme === 'dark') {
      themeIcon.className = 'fa-solid fa-sun';
    } else {
      themeIcon.className = 'fa-solid fa-moon';
    }
  }

  // --- Project Filtering System ---
  const filterButtons = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      // Remove active class from all buttons and add to target
      filterButtons.forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');

      const filterValue = e.target.getAttribute('data-filter');

      projectCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');

        if (filterValue === 'all' || cardCategory === filterValue) {
          card.classList.remove('hide');
          card.classList.add('show');
        } else {
          card.classList.remove('show');
          card.classList.add('hide');
        }
      });
    });
  });


  // --- Active Navigation Link Scrolling ---
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let currentSectionId = '';
    const scrollPos = window.scrollY + 150; // offset for triggers

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;

      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        currentSectionId = section.getAttribute('id');
      }
    });

    if (currentSectionId) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSectionId}`) {
          link.classList.add('active');
        }
      });
    }
  });

  // --- Copy to Clipboard Utility ---
  const copyButtons = document.querySelectorAll('.copy-btn[data-clipboard]');

  copyButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-clipboard');
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        const textToCopy = targetElement.textContent.trim();
        navigator.clipboard.writeText(textToCopy).then(() => {
          // Success Feedback
          btn.classList.add('tooltip-copied', 'active');
          const originalHTML = btn.innerHTML;
          btn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
          
          setTimeout(() => {
            btn.classList.remove('active');
            setTimeout(() => {
              btn.classList.remove('tooltip-copied');
              btn.innerHTML = originalHTML;
            }, 300);
          }, 2000);
        }).catch(err => {
          console.error('Could not copy text: ', err);
        });
      }
    });
  });

  // --- Dynamic Experience Duration Tracker ---
  const dlDurationContainer = document.getElementById('dl-duration');
  if (dlDurationContainer) {
    const startDateStr = dlDurationContainer.getAttribute('data-start');
    const startDate = new Date(startDateStr);

    function updateDuration() {
      const now = new Date();
      const diffTime = Math.abs(now - startDate);
      
      const seconds = Math.floor(diffTime / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      
      const years = Math.floor(days / 365);
      const remainingDays = days % 365;
      const months = Math.floor(remainingDays / 30);
      const finalDays = remainingDays % 30;

      let durationText = '';
      if (years > 0) durationText += `${years} yr${years > 1 ? 's' : ''} `;
      if (months > 0) durationText += `${months} mo${months > 1 ? 's' : ''} `;
      durationText += `${finalDays} day${finalDays !== 1 ? 's' : ''} active`;

      dlDurationContainer.textContent = `⏱️ Live counter: ${durationText}`;
    }

    updateDuration();
    // Update counter daily (every 24h)
    setInterval(updateDuration, 86400000);
  }
});
