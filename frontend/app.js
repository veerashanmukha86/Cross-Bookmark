// Adding the Supabase implementation
const SUPABASE_URL = 'https://xodvvcdsflfpqszmmupj.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvZHZ2Y2RzZmxmcHFzem1tdXBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4MDU3MzQsImV4cCI6MjA2MzM4MTczNH0.XfhMxP652Br1dXhcsEa7es8NvuK2h_NCFGyDK7_kRqY';       

const supabase = window.supabase
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function toggleTheme() {
  document.body.classList.toggle('light');
}
function showSection(section) {
  const main = document.getElementById('main-content'); if (section === 'account') {
    main.innerHTML = `<h2>Account Details</h2><p>Show user info here.</p>`;
  } else if (section === 'links') {
    main.innerHTML = `
      <div class="user-controls">
        <h2>My Links</h2>
        <button onclick="logout()" class="logout-btn">Logout</button>
      </div>
      <textarea id="links" placeholder="Paste your links here, one per line"></textarea><br>
      <button onclick="fetchMetadata()">Get Metadata</button>
      <div id="results"></div>
      <div id="folders" style="margin-top:32px;"></div>
      <div class="popup-btn" id="popupBtn" title="Create Folder" onclick="togglePopup()"> 
        +
      </div>
      <div class="popup-icons" id="popupIcons">
        <span title="WhatsApp" onclick="createFolder('WhatsApp', '🟢')">🟢</span>
        <span title="Instagram" onclick="createFolder('Instagram', '🟣')">🟣</span>
        <span title="X" onclick="createFolder('X', '⚫')">⚫</span>
        <span title="Gym" onclick="createFolder('Gym', '💪')">💪</span>
        <span title="Camera" onclick="createFolder('Camera', '📷')">📷</span>
        <span title="Mountains" onclick="createFolder('Mountains', '🏔️')">🏔️</span>
        <span title="Bikes" onclick="createFolder('Bikes', '🏍️')">🏍️</span>
        <span title="Cars" onclick="createFolder('Cars', '🚗')">🚗</span>
        <span title="Food" onclick="createFolder('Food', '🍔')">🍔</span>
        <span title="Travel" onclick="createFolder('Travel', '✈️')">✈️</span>
        <span title="Music" onclick="createFolder('Music', '🎵')">🎵</span>
        <span title="Books" onclick="createFolder('Books', '📚')">📚</span>
        <span title="Shopping" onclick="createFolder('Shopping', '🛒')">🛒</span>
        <span title="Study" onclick="createFolder('Study', '📖')">📖</span>
        <span title="Pets" onclick="createFolder('Pets', '🐶')">🐶</span>
        <span title="Sports" onclick="createFolder('Sports', '🏅')">🏅</span>
      </div>
    `;
    loadFoldersFromStorage();
  } else if (section === 'settings') {
    main.innerHTML = `<h2>Settings</h2><p>Theme, notifications, etc.</p>`;
  } else if (section === 'login') {
    main.innerHTML = `<h2>Login / Signup</h2>
      <div class="auth-tabs">
        <button id="login-tab" class="active">Login</button>
        <button id="signup-tab">Signup</button>
      </div>
      <form id="login-form">
        <input type="email" id="login-email" placeholder="Email" required /><br/>
        <input type="password" id="login-password" placeholder="Password" required /><br/>
        <button type="submit">Login</button>
        <div id="login-message"></div>
      </form>
      <form id="signup-form" style="display:none;">
        <input type="email" id="signup-email" placeholder="Email" required /><br/>
        <input type="password" id="signup-password" placeholder="Password" required /><br/>
        <input type="password" id="signup-confirm-password" placeholder="Confirm Password" required /><br/>
        <button type="submit">Sign Up</button>
        <div id="signup-message"></div>
      </form>`;

    // Add tab switching functionality
    document.getElementById('login-tab').addEventListener('click', function () {
      document.getElementById('login-form').style.display = 'block';
      document.getElementById('signup-form').style.display = 'none';
      this.classList.add('active');
      document.getElementById('signup-tab').classList.remove('active');
    });

    document.getElementById('signup-tab').addEventListener('click', function () {
      document.getElementById('login-form').style.display = 'none';
      document.getElementById('signup-form').style.display = 'block';
      this.classList.add('active');
      document.getElementById('login-tab').classList.remove('active');
    }); document.getElementById('login-form').addEventListener('submit', async function (e) {
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
        // Store user session data
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          localStorage.setItem('userId', user.id);
          // Redirect to links section after successful login
          setTimeout(() => showSection('links'), 1000);
        }
      }
    });

    document.getElementById('signup-form').addEventListener('submit', async function (e) {
      e.preventDefault();
      const email = document.getElementById('signup-email').value;
      const password = document.getElementById('signup-password').value;
      const confirmPassword = document.getElementById('signup-confirm-password').value;
      const msg = document.getElementById('signup-message');

      if (password !== confirmPassword) {
        msg.textContent = "Passwords do not match";
        msg.style.color = "red";
        return;
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin
        }
      });

      if (error) {
        msg.textContent = error.message;
        msg.style.color = "red";
      } else {
        msg.textContent = "Registration successful! Please check your email to confirm your account.";
        msg.style.color = "green";
      }
    });
  }

}



async function fetchMetadata() {
  const links = document.getElementById('links').value
    .split('\n')
    .map(l => l.trim())
    .filter(l => l);
  if (!links.length) return;

  document.getElementById('results').innerHTML = 'Loading...';

  try {
    const res = await fetch('http://localhost:8000/links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ links })
    });
    const data = await res.json();

    if (!data.length) {
      document.getElementById('results').innerHTML = '<p>No metadata found for the provided links.</p>';
      return;
    }
    function dropCard(event, folderContent) {
      event.preventDefault();
      const url = event.dataTransfer.getData('text/plain');
      const card = document.querySelector(`.card[data-url="${url}"]`);
      if (card && !folderContent.contains(card)) {
        if (folderContent.textContent.includes("Drop preview cards here...")) {
          folderContent.textContent = "";
        }
        folderContent.appendChild(card);
      }
    }
    document.getElementById('results').innerHTML = data.map(item => `
      <div class="card" draggable="true" data-url="${item.url}">
        ${item.thumbnail ? `<img class="thumb" src="${item.thumbnail}" alt="thumbnail">` : `<div class="thumb">No Image</div>`}
        <div class="meta">
          <h3>${item.title || 'No Title'}</h3>
          <p>${item.description || 'No Description'}</p>
          <a href="${item.url}" target="_blank">${item.url}</a>
          <div class="status-${item.status}">Status: ${item.status}</div>
        </div>
      </div>
    `).join('');
    addCardDragEvents();
  } catch (err) {
    document.getElementById('results').innerHTML = '<p style="color:red;">Failed to fetch metadata. Is the backend running?</p>';
  }
}

function togglePopup() {
  const popup = document.getElementById('popupIcons');
  popup.style.display = popup.style.display === 'flex' ? 'none' : 'flex';
}

function createFolder(name, icon, cards = []) {
  const folders = document.getElementById('folders');
  const folder = document.createElement('div');
  folder.className = 'folder-card';
  folder.innerHTML = `
    <div class="folder-header" style="cursor:pointer;">
      ${icon} <span>${name}</span>
      <button class="folder-btn" onclick="event.stopPropagation();deleteFolder(this)" title="Delete Folder">🗑️</button>
      <button class="folder-btn" onclick="event.stopPropagation();toggleFolderVisibility(this)" title="Hide/Show Folder">👁️</button>
    </div>
    <div class="folder-content" ondragover="event.preventDefault()" ondrop="dropCard(event, this, '${name}')">Drop preview cards here...</div>
  `;
  folder.querySelector('.folder-header').addEventListener('click', function (e) {
    if (e.target.classList.contains('folder-btn')) return;
    openFolderPage(name, icon);
  });
  folders.appendChild(folder);
  document.getElementById('popupIcons').style.display = 'none';
  saveFoldersToStorage();
}

function toggleFolderVisibility(btn) {
  const content = btn.closest('.folder-card').querySelector('.folder-content');
  if (content.style.display === 'none') {
    content.style.display = '';
    btn.textContent = '👁️';
  } else {
    content.style.display = 'none';
    btn.textContent = '🙈';
  }
}

function toggleSidebar() {
  document.querySelector('.sidebar').classList.toggle('closed');
}

function deleteFolder(btn) {
  btn.closest('.folder-card').remove();
  saveFoldersToStorage();
}

async function saveFoldersToDatabase() {
  const folders = [];
  document.querySelectorAll('.folder-card').forEach(folder => {
    const name = folder.querySelector('.folder-header span').textContent;
    const icon = folder.querySelector('.folder-header').childNodes[0].textContent.trim();
    const cards = [];
    folder.querySelectorAll('.card').forEach(card => {
      cards.push({
        url: card.getAttribute('data-url'),
        title: card.querySelector('h3').textContent,
        description: card.querySelector('p').textContent,
        thumbnail: card.querySelector('.thumb')?.src || '',
        status: card.querySelector('.status-success, .status-failed')?.textContent || ''
      });
    });
    folders.push({ name, icon, cards });
  });

  const userId = localStorage.getItem('userId');
  await fetch('http://localhost:8000/api/user-folders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userId}` },
    body: JSON.stringify({ folders })
  });
}

function loadFoldersFromStorage() {
  const folders = JSON.parse(localStorage.getItem('folders') || '[]');
  folders.forEach(f => createFolderFromStorage(f.name, f.icon, f.cards));
}

function createFolderFromStorage(name, icon, cards = []) {
  createFolder(name, icon, cards);
}

function addCardDragEvents() {
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('dragstart', function (e) {
      e.dataTransfer.setData('text/plain', card.getAttribute('data-url'));
      e.dataTransfer.effectAllowed = 'move';
    });
  });
}

function dropCard(event, folderContent, folderName) {
  event.preventDefault();
  const url = event.dataTransfer.getData('text/plain');
  const card = document.querySelector(`.card[data-url="${url}"]`);
  if (card && !folderContent.contains(card)) {
    if (folderContent.textContent.includes("Drop preview cards here...")) {
      folderContent.textContent = "";
    }
    folderContent.appendChild(card);

    const folders = JSON.parse(localStorage.getItem('folders') || '[]');
    const folder = folders.find(f => f.name === folderName);
    if (folder) {

      const meta = {
        url,
        title: card.querySelector('h3').textContent,
        description: card.querySelector('p').textContent,
        thumbnail: card.querySelector('.thumb')?.src || '',
        status: card.querySelector('.status-success, .status-failed')?.textContent || ''
      };
      folder.cards = folder.cards || [];
      if (!folder.cards.some(c => c.url === url)) {
        folder.cards.push(meta);
        localStorage.setItem('folders', JSON.stringify(folders));
      }
    }
  }
}

function openFolderPage(name, icon) {
  const main = document.getElementById('main-content');
  const folders = JSON.parse(localStorage.getItem('folders') || '[]');
  const folder = folders.find(f => f.name === name);

  main.innerHTML = `
    <button onclick="showSection('links')" style="margin-bottom:16px;">⬅ Back</button>
    <h2>${icon} ${name}</h2>
    <textarea id="folder-links" placeholder="Paste your links here, one per line"></textarea><br>
    <button onclick="fetchFolderMetadata('${name}')">Add Cards to Folder</button>
    <div id="folder-cards"></div>
  `;

  renderFolderCards(folder);

  function renderFolderCards(folderObj) {
    const folderCardsDiv = document.getElementById('folder-cards');
    if (!folderObj || !folderObj.cards || folderObj.cards.length === 0) {
      folderCardsDiv.innerHTML = "<p>No cards in this folder yet.</p>";
    } else {
      folderCardsDiv.innerHTML = "";
      folderObj.cards.forEach(item => {
        folderCardsDiv.innerHTML += `
          <div class="card" data-url="${item.url}">
            ${item.thumbnail ? `<img class="thumb" src="${item.thumbnail}" alt="thumbnail">` : `<div class="thumb">No Image</div>`}
            <div class="meta">
              <h3>${item.title || 'No Title'}</h3>
              <p>${item.description || 'No Description'}</p>
              <a href="${item.url}" target="_blank">${item.url}</a>
              <div class="status-success">Status: ${item.status}</div>
            </div>
          </div>
        `;
      });
    }
  }

  window.fetchFolderMetadata = async function (folderName) {
    const links = document.getElementById('folder-links').value
      .split('\n')
      .map(l => l.trim())
      .filter(l => l);
    if (!links.length) return;

    const folderCardsDiv = document.getElementById('folder-cards');
    folderCardsDiv.innerHTML = 'Loading...';

    try {
      const res = await fetch('http://localhost:8000/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ links })
      });
      const data = await res.json();

      const folders = JSON.parse(localStorage.getItem('folders') || '[]');
      const folder = folders.find(f => f.name === folderName);
      if (folder) {
        folder.cards = folder.cards || [];
        data.forEach(item => {
          if (!folder.cards.some(c => c.url === item.url)) {
            folder.cards.push(item);
          }
        });
        localStorage.setItem('folders', JSON.stringify(folders));
        renderFolderCards(folder);
      }
    } catch (err) {
      folderCardsDiv.innerHTML = '<p style="color:red;">Failed to fetch metadata. Is the backend running?</p>';
    }
  };
}

// Logout function
async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error logging out:', error.message);
  } else {
    localStorage.removeItem('userId');
    showSection('login');
  }
}

// Check if user is logged in
async function checkUserSession() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      localStorage.setItem('userId', user.id);
      return true;
    }
  }
  return false;
}

window.addEventListener('DOMContentLoaded', async () => {
  if (window.innerWidth < 800) {
    document.querySelector('.sidebar').classList.add('closed');
  }

  // Check if user is logged in and show appropriate section
  const isLoggedIn = await checkUserSession();
  if (isLoggedIn) {
    showSection('links');
  } else {
    showSection('login');
  }
 
  loadFoldersFromStorage();
}); 