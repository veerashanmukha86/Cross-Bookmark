// Initialize Supabase client
const SUPABASE_URL = 'https://xodvvcdsflfpqszmmupj.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvZHZ2Y2RzZmxmcHFzem1tdXBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4MDU3MzQsImV4cCI6MjA2MzM4MTczNH0.XfhMxP652Br1dXhcsEa7es8NvuK2h_NCFGyDK7_kRqY';        // <-- Replace with your Supabase anon/public key

const supabase = window.supabase
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function removeOverlay() {
      const overlay = document.getElementById('card-overlay');
      if (overlay) overlay.remove();
    }    // Show section in a card overlay (add forms for login/signup)
    function showSection(section) {
      removeOverlay();
      const sectionMap = {
        bookmarks: { title: "My Bookmarks", cardClass: "bookmarks" },
        login: { title: "Login", cardClass: "login" },
        signup: { title: "Signup", cardClass: "signup" }
      };
      const info = sectionMap[section] || { title: section, cardClass: "" };
      let content = `<h2>${info.title}</h2>`;

      if (section === "login") {
        content += `
          <form id="login-form">
            <input type="email" id="login-email" placeholder="Email" required class="form-control mb-2"/>
            <input type="password" id="login-password" placeholder="Password" required class="form-control mb-2"/>
            <button type="submit" class="signup-explore-btn" style="width:100%;">Login</button>
          </form>
          <div id="login-message" style="margin-top:1rem;"></div>
        `;
      } else if (section === "signup") {
        content += `
          <form id="signup-form">
            <input type="email" id="signup-email" placeholder="Email" required class="form-control mb-2"/>
            <input type="password" id="signup-password" placeholder="Password" required class="form-control mb-2"/>
            <button type="submit" class="signup-explore-btn" style="width:100%;">Sign Up</button>
          </form>
          <div id="signup-message" style="margin-top:1rem;"></div>
        `;
      } else if (section === "bookmarks") {
        content += `
          <div class="bookmarks-container">
            <div class="bookmarks-header">
              <button class="add-folder-btn" onclick="showFolderPopup()">
                <i class="fa-solid fa-folder-plus"></i> Add Folder
              </button>
            </div>
            <div class="bookmarks-list">
              <!-- Bookmarks will load here -->
              <p>Your bookmarks will appear here.</p>
            </div>
          </div>
        `;
      } else {
        content += `<p>This is the ${info.title} section.</p>`;
      }

      const overlay = document.createElement('div');
      overlay.className = 'selected-card-overlay';
      overlay.id = 'card-overlay';
      overlay.innerHTML = `
        <div class="selected-card ${info.cardClass}">
          <button class="close-btn-large-x" onclick="removeOverlay()" aria-label="Close">&times;</button>
          ${content}
        </div>
      `;
      document.getElementById('card-overlay-root').appendChild(overlay);

      // Save the last opened section
      localStorage.setItem('lastSection', section);

      // Attach event listeners for forms
      if (section === "login") {

        e.preventDefault();
          const email = document.getElementById('login-email').value;
          const password = document.getElementById('login-password').value;
          const { error } = await supabase.auth.signInWithPassword({ email, password });
          const msg = document.getElementById('login-message');
          if (error) {
            msg.textContent = error.message;
            msg.style.color = "red";
          } else {
            msg.textContent = "Login successful!";
            msg.style.color = "green";
            setTimeout(() => {
              removeOverlay();
              updateLoginLogoutUI(true); // Update UI to show logout
            }, 1200);
          }
        });
      }
      if (section === "signup") {
        document.getElementById('signup-form').addEventListener('submit', async function(e) {
          e.preventDefault();
          const email = document.getElementById('signup-email').value;
          const password = document.getElementById('signup-password').value;
          const { error } = await supabase.auth.signUp({ email, password });
          const msg = document.getElementById('signup-message');
          if (error) {
            msg.textContent = error.message;
            msg.style.color = "red";
          } else {
            msg.textContent = "Signup successful! Please check your email to confirm.";
            msg.style.color = "green";
            setTimeout(removeOverlay, 1800);
          }
        });
      }
    }

    // Restore overlay on page load
    window.addEventListener('DOMContentLoaded', function() {
      const lastSection = localStorage.getItem('lastSection');
      if (lastSection) {
        showSection(lastSection);
      }
    });

    // When closing overlay, clear lastSection
    function removeOverlay() {
      const overlay = document.getElementById('card-overlay');
      if (overlay) overlay.remove();
      localStorage.removeItem('lastSection');
    }

    // Dummy theme toggle
    function toggleTheme() {
      document.body.classList.toggle('dark-theme');
    }

    document.addEventListener('DOMContentLoaded', function() {
      const navbarToggle = document.getElementById('navbar-toggle');
      const navbar = document.getElementById('navbar-custom');
      const navbarClose = document.getElementById('navbar-close');

      if (navbarToggle && navbar && navbarClose) {
        navbarToggle.addEventListener('click', function() {
          navbar.classList.add('open');
        });
        navbarClose.addEventListener('click', function() {
          navbar.classList.remove('open');
        });
        // Optional: close menu when clicking a nav item
        navbar.querySelectorAll('.nav-item-custom').forEach(item => {
          item.addEventListener('click', () => navbar.classList.remove('open'));
        });
      }
    });

    // Add this function at the end of your file
    function updateLoginLogoutUI(isLoggedIn) {
      let userEmail = null;

      // Immediately update logout button with placeholder if logged in
      document.querySelectorAll('.nav-item-custom').forEach(item => {
        const text = item.textContent.trim().toLowerCase();
        if (isLoggedIn && (text === 'login' || text === 'logout')) {
          item.innerHTML = `Logout`;
          item.style.display = '';
          item.onclick = async function() {
            await supabase.auth.signOut();
            window.location.reload();
          };
        }
        if (!isLoggedIn && text === 'logout') {
          item.textContent = 'Logout';
          item.style.display = 'none';
          item.removeAttribute('title');
        }
      });

      // Get user email if logged in and update logout button with first letter
      if (isLoggedIn && supabase.auth && supabase.auth.getUser) {
        supabase.auth.getUser().then(({ data }) => {
          userEmail = data?.user?.email || null;
          document.querySelectorAll('.nav-item-custom').forEach(item => {
            const text = item.textContent.trim().toLowerCase();
            if (text === 'login' || text === 'logout') {
              if (userEmail && userEmail.length > 0) {
                const firstLetter = userEmail[0].toUpperCase();
                // Add more space using CSS margin or multiple non-breaking spaces
                item.innerHTML = `Logout&nbsp;<b style="font-size:1.1em; margin-left:8px;">${firstLetter}</b>`;
              } else {
                item.textContent = 'Logout';
              }
              item.title = userEmail ? `Logged in as ${userEmail}` : '';
            }
          });
        });
      }

      // Show/hide Login and Signup
      document.querySelectorAll('.nav-item-custom').forEach(item => {
        const text = item.textContent.trim().toLowerCase();
        if (!isLoggedIn) {
          if (text === 'login') {
            item.textContent = 'Login';
            item.style.display = '';
            item.onclick = function() {
              showSection('login');
            };
          }
          if (text === 'signup') {
            item.textContent = 'Signup';
            item.style.display = '';
            item.onclick = function() {
              showSection('signup');
            };
          }
        } else {
          if (text === 'signup') {
            item.style.display = 'none';
          }
        }
      });

      // Show/hide signup card on homepage based on signup nav visibility
      const signupNav = Array.from(document.querySelectorAll('.nav-item-custom')).find(
        item => item.textContent.trim().toLowerCase() === 'signup'
      );
      const signupCard = document.querySelector('.signup-explore-box');
      if (signupCard) {
        if (signupNav && signupNav.style.display !== 'none') {
          signupCard.style.display = '';
        } else {
          signupCard.style.display = 'none';
        }
      }
    }

    // On page load, check auth state and update UI
    supabase.auth.getSession().then(({ data: { session } }) => {
      updateLoginLogoutUI(!!session);
    });