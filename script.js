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
  const projectCards = document.querySelectorAll('.project-item');

  function filterProjects(category) {
    projectCards.forEach(card => {
      const cardCategory = card.getAttribute('data-category');
      if (cardCategory === category) {
        card.classList.remove('hide');
        card.classList.add('show');
      } else {
        card.classList.remove('show');
        card.classList.add('hide');
      }
    });
  }

  filterButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      filterButtons.forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');

      const filterValue = e.target.getAttribute('data-filter');
      filterProjects(filterValue);
    });
  });

  // Initialize with Key Projects active
  filterProjects('key');


  // --- Single Page Application Hash Router ---
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-link');

  function router() {
    // Get current hash, default to #about
    let hash = window.location.hash || '#about';
    
    // Validate hash corresponds to an existing section, otherwise fallback to #about
    let targetSection = document.querySelector(hash);
    if (!targetSection || targetSection.tagName !== 'SECTION') {
      hash = '#about';
      targetSection = document.querySelector(hash);
    }

    // Toggle active-section class to display the selected section
    sections.forEach(section => {
      if ('#' + section.getAttribute('id') === hash) {
        section.classList.add('active-section');
      } else {
        section.classList.remove('active-section');
      }
    });

    // Toggle active class on sidebar navigation links
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      const isActive = (href === hash) || (hash.startsWith('#blog-') && href === '#blogs');
      if (isActive) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Update document title and Open Graph/Twitter meta tags dynamically based on the current hash
    let pageTitle = 'Aditya Chowdhury | Personal Website';
    let pageDesc = 'Personal website of Aditya Chowdhury (whoisadi19).';
    
    if (hash === '#blogs' || hash.startsWith('#blog-')) {
      pageTitle = 'Aditya Chowdhury | Blogs';
      pageDesc = 'Read blogs by Aditya Chowdhury on machine learning, deep learning, and computer vision.';
    } else if (hash === '#achievements') {
      pageTitle = 'Aditya Chowdhury | Achievements';
      pageDesc = 'Achievements, awards, and certifications of Aditya Chowdhury.';
    } else if (hash === '#projects') {
      pageTitle = 'Aditya Chowdhury | Projects';
      pageDesc = 'Open source projects and research implementations by Aditya Chowdhury.';
    } else if (hash === '#resume') {
      pageTitle = 'Aditya Chowdhury | Resume';
      pageDesc = 'View and download Aditya Chowdhury\'s resume and CV.';
    } else if (hash === '#contact') {
      pageTitle = 'Aditya Chowdhury | Contact';
      pageDesc = 'Get in touch with Aditya Chowdhury via email, LinkedIn, or Twitter.';
    }
    
    document.title = pageTitle;
    
    // Dynamically update OG and Twitter title/description tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const twTitle = document.querySelector('meta[name="twitter:title"]');
    const ogDesc = document.querySelector('meta[property="og:description"]');
    const twDesc = document.querySelector('meta[name="twitter:description"]');
    const metaDesc = document.querySelector('meta[name="description"]');
    
    if (ogTitle) ogTitle.setAttribute('content', pageTitle);
    if (twTitle) twTitle.setAttribute('content', pageTitle);
    if (ogDesc) ogDesc.setAttribute('content', pageDesc);
    if (twDesc) twDesc.setAttribute('content', pageDesc);
    if (metaDesc) metaDesc.setAttribute('content', pageDesc);

    // Reset window scroll position to top
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  // Bind to hash changes and initial page load
  window.addEventListener('hashchange', router);
  router();


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

  // --- Fix 5: GitHub API Project Dates ---
  async function fetchProjectDates() {
    const projectItems = document.querySelectorAll('.project-item[data-repo]');
    if (!projectItems.length) return;

    try {
      // Fetch all public repos in one API call
      const res = await fetch('https://api.github.com/users/whoisadi19/repos?per_page=100');
      if (!res.ok) return;
      const repos = await res.json();

      // Build a quick lookup map: repoName -> created_at year
      const repoDateMap = {};
      repos.forEach(repo => {
        const year = new Date(repo.created_at).getFullYear();
        repoDateMap[repo.name.toLowerCase()] = year;
      });

      // Inject dates into each project item
      projectItems.forEach(item => {
        const repoName = item.getAttribute('data-repo');
        const dateSpan = item.querySelector('.project-date');
        if (dateSpan && repoName) {
          const year = repoDateMap[repoName.toLowerCase()];
          if (year) {
            dateSpan.textContent = year;
          }
        }
      });
    } catch (e) {
      // Fail silently — dates are a nice-to-have, not critical
    }
  }

  fetchProjectDates();
});
