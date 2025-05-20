function toggleTheme() {
  document.body.classList.toggle('light');
}
function showSection(section) {
  const main = document.getElementById('main-content');
  if (section === 'account') {
    main.innerHTML = `<h2>Account Details</h2><p>Show user info here.</p>`;
  } else if (section === 'links') {
    main.innerHTML = `
      <h2>My Links</h2>
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
      <form id="login-form">
        <input type="text" placeholder="Username" required /><br/>
        <input type="password" placeholder="Password" required /><br/>
        <button type="submit">Login</button>
      </form>`;
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
  folder.querySelector('.folder-header').addEventListener('click', function(e) {
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

  window.fetchFolderMetadata = async function(folderName) {
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

window.addEventListener('DOMContentLoaded', () => {
  if (window.innerWidth < 800) {
    document.querySelector('.sidebar').classList.add('closed');
  }
  loadFoldersFromStorage();
});