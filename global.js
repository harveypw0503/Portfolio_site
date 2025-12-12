// Only handles navbar loading + hamburger menu

function initNavbar() {
  const navbarContainer = document.getElementById('navbar');
  if (!navbarContainer) {
    console.error('#navbar not found');
    return;
  }

  fetch('navbar.html')
    .then(res => res.text())
    .then(html => {
      navbarContainer.innerHTML = html;

      const hamburger = document.getElementById('hamburger');
      const navLinks = document.querySelector('.nav-links');

      if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
          navLinks.classList.toggle('active');
        });

        navLinks.querySelectorAll('a').forEach(a => {
          a.addEventListener('click', () => navLinks.classList.remove('active'));
        });
      }
    })
    .catch(err => console.error('Navbar load failed:', err));
}

document.addEventListener('DOMContentLoaded', initNavbar);

