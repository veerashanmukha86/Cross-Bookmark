// Folder management for Cross Bookmark
let selectedCategoryIcon = null;

function showFolderPopup() {
  const popup = document.createElement('div');
  popup.className = 'folder-creation-popup';
  popup.innerHTML = `
    <div class="folder-popup-content">
      <h3>Create Folders</h3>
      <div class="folder-category-selector">
        <p>Click an icon to create a folder:</p>
        <div class="category-icons">
          <div class="category-icon" data-icon="fa-solid fa-dumbbell" data-name="Gym" onclick="selectCategoryIcon(this)">
            <i class="fa-solid fa-dumbbell"></i>
            <span>Gym</span>
          </div>
          <div class="category-icon" data-icon="fa-solid fa-bicycle" data-name="Bike" onclick="selectCategoryIcon(this)">
            <i class="fa-solid fa-bicycle"></i>
            <span>Bike</span>
          </div>
          <div class="category-icon" data-icon="fa-brands fa-instagram" data-name="Instagram" onclick="selectCategoryIcon(this)">
            <i class="fa-brands fa-instagram"></i>
            <span>Instagram</span>
          </div>
          <div class="category-icon" data-icon="fa-brands fa-whatsapp" data-name="WhatsApp" onclick="selectCategoryIcon(this)">
            <i class="fa-brands fa-whatsapp"></i>
            <span>WhatsApp</span>
          </div>
          <div class="category-icon" data-icon="fa-brands fa-youtube" data-name="YouTube" onclick="selectCategoryIcon(this)">
            <i class="fa-brands fa-youtube"></i>
            <span>YouTube</span>
          </div>
          <div class="category-icon" data-icon="fa-brands fa-reddit" data-name="Reddit" onclick="selectCategoryIcon(this)">
            <i class="fa-brands fa-reddit"></i>
            <span>Reddit</span>
          </div>
          <div class="category-icon" data-icon="fa-solid fa-music" data-name="Music" onclick="selectCategoryIcon(this)">
            <i class="fa-solid fa-music"></i>
            <span>Music</span>
          </div>
          <div class="category-icon" data-icon="fa-solid fa-location-dot" data-name="Places" onclick="selectCategoryIcon(this)">
            <i class="fa-solid fa-location-dot"></i>
            <span>Places</span>
          </div>
          <div class="category-icon" data-icon="fa-solid fa-book" data-name="Books" onclick="selectCategoryIcon(this)">
            <i class="fa-solid fa-book"></i>
            <span>Books</span>
          </div>
          <div class="category-icon" data-icon="fa-solid fa-shirt" data-name="Clothing" onclick="selectCategoryIcon(this)">
            <i class="fa-solid fa-shirt"></i>
            <span>Clothing</span>
          </div>
          <div class="category-icon" data-icon="fa-solid fa-tree" data-name="Nature" onclick="selectCategoryIcon(this)">
            <i class="fa-solid fa-tree"></i>
            <span>Nature</span>
          </div>
        </div>
      </div>
      <div class="folder-popup-actions">
        <button class="cancel-folder-btn" onclick="closeFolderPopup()">Cancel</button>
      </div>
    </div>
  `;
  document.body.appendChild(popup);

  popup.addEventListener('click', function(e) {
    if (e.target === popup) {
      closeFolderPopup();
    }
  });
}

function closeFolderPopup() {
  const popup = document.querySelector('.folder-creation-popup');
  if (popup) {
    popup.remove();
  }
}

function selectCategoryIcon(element) {
  // Remove the 'selected' class from all icons
  document.querySelectorAll('.category-icon').forEach(icon => {
    icon.classList.remove('selected');
  });
  
  // Add the 'selected' class to the clicked icon
  element.classList.add('selected');
  selectedCategoryIcon = element.getAttribute('data-icon');
  
  // Auto-create the folder when selecting an icon
  createNewFolder(element.getAttribute('data-name'));
}

async function createNewFolder(categoryName) {
  try {
    if (!selectedCategoryIcon) {
      return;
    }
    
    const folderName = categoryName || "New Folder";
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      alert("You must be logged in to create folders");
      return;
    }
    
    const iconClass = selectedCategoryIcon || 'fa-solid fa-folder';
    
    const { data, error } = await supabase
      .from('bookmark_folders')
      .insert([
        { 
          name: folderName, 
          user_id: user.id,
          icon: iconClass,
          created_at: new Date().toISOString()
        }      ]);
      if (error) {
        console.error("Error creating folder:", error);
        alert("Failed to create folder: " + error.message);
      } else {
        // Show success notification
      const notification = document.createElement('div');
      notification.className = 'folder-success-notification';
      notification.textContent = `Folder "${folderName}" created successfully!`;
      document.body.appendChild(notification);
      
      // Remove notification after some time
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 4000);
        // Close the popup after successful creation
      closeFolderPopup();
      // Refresh the bookmarks section to show the new folder
      await loadUserFolders();
      
      // Ensure scroll buttons are working after folder creation
      setTimeout(() => {
        const leftBtn = document.getElementById('scroll-left-btn');
        const rightBtn = document.getElementById('scroll-right-btn');
        const scrollContainer = document.getElementById('simple-folders-scroll');
        
        if (leftBtn && rightBtn && scrollContainer) {
          // Re-attach event listeners to ensure they work
          leftBtn.addEventListener('click', function() {
            scrollContainer.scrollBy({
              left: -200,
              behavior: 'smooth'
            });
          });
            rightBtn.addEventListener('click', function() {
            scrollContainer.scrollBy({
              left: 200,
              behavior: 'smooth'
            });
          });
        }
      }, 100); // Short delay to ensure DOM is updated
    }
  } catch (err) {
    console.error("Exception in createNewFolder:", err);
    alert("An error occurred: " + err.message);
  }
}

async function loadUserFolders() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return;
    }
    
    const { data, error } = await supabase
      .from('bookmark_folders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error loading folders:", error);
      return;
    }
    
    const bookmarksList = document.querySelector('.bookmarks-list');
    if (!bookmarksList) return;
    
    if (data && data.length > 0) {
      // Create folders container with direct event handlers in HTML
      let content = `
        <div class="simple-folders-container">
          <button id="scroll-left-btn" class="simple-scroll-btn left-btn">
            <i class="fa-solid fa-chevron-left"></i>
          </button>
          
          <div id="simple-folders-scroll" class="simple-folders-scroll">
            <div class="simple-folders-grid">
      `;        data.forEach(folder => {
        const iconClass = folder.icon || 'fa-solid fa-folder';
        content += `
          <div class="folder-item" data-folder-id="${folder.id}">
            <div class="folder-content" onclick="openFolder('${folder.id}')">
              <i class="${iconClass}"></i>
              <span>${folder.name}</span>
            </div>
            <button class="delete-folder-btn" onclick="toggleDeleteMode('${folder.id}', '${folder.name}', event)">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        `;
      });
      
      content += `
            </div>
          </div>
          
          <button id="scroll-right-btn" class="simple-scroll-btn right-btn">
            <i class="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      `;
      
      bookmarksList.innerHTML = content;      
      // Add event listeners AFTER the HTML is added to the DOM
      document.getElementById('scroll-left-btn').addEventListener('click', function() {
        document.getElementById('simple-folders-scroll').scrollBy({
          left: -200,
          behavior: 'smooth'
        });
      });
      
      document.getElementById('scroll-right-btn').addEventListener('click', function() {
        document.getElementById('simple-folders-scroll').scrollBy({
          left: 200,
          behavior: 'smooth'
        });
      });
    } else {
      bookmarksList.innerHTML = `
        <p>You don't have any folders yet.</p>
        <p>Click "Add Folder" to create your first folder.</p>
      `;
    }
  } catch (err) {
    console.error("Error in loadUserFolders:", err);
  }
}

/**
 * Updates the visibility of folder scroll buttons
 */
function updateFolderScrollButtons() {
  const scrollArea = document.getElementById('folders-scroll-area');
  const leftBtn = document.getElementById('folder-scroll-left');
  const rightBtn = document.getElementById('folder-scroll-right');
  
  if (!scrollArea || !leftBtn || !rightBtn) return;
  
  // Check if scrolling is possible
  const canScrollLeft = scrollArea.scrollLeft > 0;
  const canScrollRight = scrollArea.scrollLeft < (scrollArea.scrollWidth - scrollArea.clientWidth - 5);

  // Update button states
  leftBtn.classList.toggle('hidden', !canScrollLeft);
  rightBtn.classList.toggle('hidden', !canScrollRight);
}

/**
 * Opens a specific folder to show its bookmarks
 * @param {string} folderId - The ID of the folder to open
 */
async function openFolder(folderId) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return;
    }
    
    // Get folder info
    const { data: folderData, error: folderError } = await supabase
      .from('bookmark_folders')
      .select('*')
      .eq('id', folderId)
      .single();
    
    if (folderError) {
      console.error("Error loading folder:", folderError);
      return;
    }
    
    // Get bookmarks for this folder
    const { data: bookmarks, error: bookmarksError } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('folder_id', folderId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (bookmarksError) {
      console.error("Error loading bookmarks:", bookmarksError);
      return;
    }
    
    // Show the folder view
    showFolderContents(folderData, bookmarks);
  } catch (err) {
    console.error("Error in openFolder:", err);
  }
}

/**
 * Shows the folder contents with bookmarks
 * @param {Object} folder - The folder data
 * @param {Array} bookmarks - The bookmarks in this folder
 */
function showFolderContents(folder, bookmarks) {
  const bookmarksList = document.querySelector('.bookmarks-list');
  if (!bookmarksList) return;
  
  let content = `
    <div class="folder-view">
      <div class="folder-header fixed-folder-header">
        <div class="folder-header-left">
          <button class="back-to-folders-btn" onclick="loadUserFolders()">
            <i class="fa-solid fa-arrow-left"></i> Back
          </button>
          <h3><i class="${folder.icon}"></i> ${folder.name}</h3>
        </div>
        <div class="folder-header-right">
          <button class="add-bookmark-btn" onclick="showAddBookmarkPopup('${folder.id}')">
            <i class="fa-solid fa-plus"></i> Add Bookmark
          </button>
        </div>
      </div>
      <div class="bookmarks-content">
        <div class="bookmarks-grid">
  `;
  
  if (bookmarks && bookmarks.length > 0) {
    bookmarks.forEach(bookmark => {      // Check if it's a Twitter/X URL
      const isTwitter = /twitter\.com|x\.com/.test(bookmark.url);
      
      // Set appropriate placeholder if it's Twitter
      let placeholderIcon = isTwitter ? 
        (bookmark.url.includes('x.com') ? 'fa-brands fa-x-twitter' : 'fa-brands fa-twitter') : 
        'fa-solid fa-link';
      
      // Check if thumbnail exists and is a valid URL
      let thumbnailHtml;
      if (bookmark.thumbnail && isValidUrl(bookmark.thumbnail)) {
        thumbnailHtml = `
          <div class="bookmark-thumbnail">
            <img src="${bookmark.thumbnail}" alt="${escapeHtml(bookmark.title || '')}" 
                 onerror="this.onerror=null; this.parentNode.innerHTML='<div class=\'bookmark-thumbnail-placeholder\'><i class=\'${placeholderIcon}\'></i></div>'">
          </div>`;
      } else {
        thumbnailHtml = `
          <div class="bookmark-thumbnail bookmark-thumbnail-placeholder">
            <i class="${placeholderIcon}"></i>
          </div>`;
      }

      // Create favicon HTML if it exists and is valid
      let faviconHtml = '';
      if (bookmark.favicon && isValidUrl(bookmark.favicon)) {
        faviconHtml = `<img src="${bookmark.favicon}" class="bookmark-favicon" 
                          onerror="this.onerror=null; this.style.display='none'">`;
      } else if (isTwitter) {
        faviconHtml = `<i class="${placeholderIcon} bookmark-favicon-icon"></i>`;
      }
      
      // Prepare description (if exists) - limit to 2 lines only
      let descriptionHtml = '';
      if (bookmark.description && bookmark.description.trim()) {
        const shortDesc = bookmark.description.length > 100 ? 
                          bookmark.description.substr(0, 100) + '...' : 
                          bookmark.description;
        descriptionHtml = `<div class="bookmark-description">${escapeHtml(shortDesc)}</div>`;
      }
      
      content += `
        <div class="bookmark-item" data-bookmark-id="${bookmark.id}">
          <a href="${bookmark.url}" target="_blank" rel="noopener noreferrer">
            ${thumbnailHtml}
            <div class="bookmark-content">
              <div class="bookmark-title">
                ${faviconHtml}
                ${escapeHtml(bookmark.title || new URL(bookmark.url).hostname)}
              </div>
              ${descriptionHtml}
              <div class="bookmark-url">${new URL(bookmark.url).hostname}</div>
            </div>
          </a>
          <button class="delete-bookmark-btn" onclick="event.preventDefault(); event.stopPropagation(); deleteBookmark('${bookmark.id}')">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      `;
    });
  } else {
    content += `
      <p class="no-bookmarks-message">No bookmarks in this folder yet.</p>
      <p>Click "Add Bookmark" to add your first bookmark.</p>
    `;
  }
  
  content += `
        </div>
      </div>
    </div>
  `;
  
  bookmarksList.innerHTML = content;
}

function initializeBookmarksScroll() {
  const leftBtn = document.querySelector('.bookmarks-scroll .left-scroll');
  const rightBtn = document.querySelector('.bookmarks-scroll .right-scroll');
  const scrollArea = document.querySelector('.bookmarks-scroll-area');
  
  if (!leftBtn || !rightBtn || !scrollArea) return;
  
  // Adjust for vertical scrolling in bookmarks
  leftBtn.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';
  rightBtn.innerHTML = '<i class="fa-solid fa-arrow-down"></i>';
  
  // Update scroll button visibility initially
  updateBookmarksScrollButtonVisibility();
  
  // Scroll up button functionality
  leftBtn.addEventListener('click', () => {
    scrollArea.scrollBy({ top: -300, behavior: 'smooth' });
  });
  
  // Scroll down button functionality
  rightBtn.addEventListener('click', () => {
    scrollArea.scrollBy({ top: 300, behavior: 'smooth' });
  });
  
  // Update scroll button visibility when scrolling
  scrollArea.addEventListener('scroll', updateBookmarksScrollButtonVisibility);
  
  // Update scroll button visibility on window resize
  window.addEventListener('resize', updateBookmarksScrollButtonVisibility);
  
  function updateBookmarksScrollButtonVisibility() {
    const canScrollUp = scrollArea.scrollTop > 0;
    const canScrollDown = scrollArea.scrollTop < (scrollArea.scrollHeight - scrollArea.clientHeight - 5);
    
    leftBtn.classList.toggle('hidden', !canScrollUp);
    rightBtn.classList.toggle('hidden', !canScrollDown);
    
    // Hide both buttons if content fits without scrolling
    if (scrollArea.scrollHeight <= scrollArea.clientHeight) {
      leftBtn.classList.add('hidden');
      rightBtn.classList.add('hidden');
    }
  }
}

async function fetchURLMetadata(url) {
  try {
    // Using the Render.com deployed backend URL
    const apiUrl = 'https://cross-bookmark-backend.onrender.com/extract-metadata';
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: url }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch metadata');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching URL metadata:', error);
    // Return basic metadata if the service fails
    return {
      title: new URL(url).hostname,
      description: 'No description available',
      url: url
    };
  }
}

function showAddBookmarkPopup(folderId) {
  const popup = document.createElement('div');
  popup.className = 'folder-creation-popup';
  popup.innerHTML = `
    <div class="folder-popup-content">
      <h3>Add New Bookmark</h3>
      <input type="url" id="bookmark-url" placeholder="Paste URL (https://...)" class="folder-name-input">
      
      <div id="url-preview-container" class="url-preview-container" style="display:none;">
        <div class="url-preview-loading" id="url-preview-loading">
          <i class="fa-solid fa-spinner fa-spin"></i> Loading preview...
        </div>
        <div class="url-preview" id="url-preview"></div>
      </div>
      
      <div class="folder-popup-actions">
        <button class="cancel-folder-btn" onclick="closeFolderPopup()">Cancel</button>
        <button class="create-folder-btn" id="add-bookmark-btn" disabled>Add Bookmark</button>
      </div>
    </div>
  `;
  document.body.appendChild(popup);

  // Get elements
  const urlInput = document.getElementById('bookmark-url');
  const previewContainer = document.getElementById('url-preview-container');
  const previewLoading = document.getElementById('url-preview-loading');
  const preview = document.getElementById('url-preview');
  const addBookmarkBtn = document.getElementById('add-bookmark-btn');

  // Set up auto metadata fetching on paste or input
  urlInput.addEventListener('input', debounce(async function() {
    let url = urlInput.value.trim();
    if (!url) {
      previewContainer.style.display = 'none';
      addBookmarkBtn.disabled = true;
      return;
    }

    // Ensure URL has http:// or https:// prefix
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
      urlInput.value = url;
    }

    // Show loading indicator
    previewContainer.style.display = 'block';
    previewLoading.style.display = 'block';
    preview.style.display = 'none';
    addBookmarkBtn.disabled = true;
    
    try {
      // Fetch metadata using the Python backend API
      const metadata = await fetchURLMetadata(url);
      
      // Hide loading indicator
      previewLoading.style.display = 'none';
      preview.style.display = 'block';
      
      // Enable the add button once metadata is loaded
      addBookmarkBtn.disabled = false;
      
      // If metadata was successfully fetched
      if (metadata) {        
        // Create preview HTML
        let previewHTML = `<div class="preview-content">`;
        
        // Add image if available
        if (metadata.image) {
          previewHTML += `
            <div class="preview-image">
              <img src="${metadata.image}" alt="Preview" style="max-width: 20%; height: auto;" onerror="this.onerror=null; this.src='https://via.placeholder.com/100x60?text=No+Image'">
            </div>
          `;
        }
        
        previewHTML += `
            <div class="preview-details">
              <div class="preview-title">${metadata.title || 'No title'}</div>
              ${metadata.description ? `<div class="preview-description">${metadata.description}</div>` : ''}
              <div class="preview-url">
                ${metadata.favicon ? `<img src="${metadata.favicon}" class="favicon" alt="" />` : ''}
                ${new URL(url).hostname}
              </div>
            </div>
          </div>
        `;
        
        preview.innerHTML = previewHTML;
        
        // Store metadata for later use
        preview.dataset.metadata = JSON.stringify(metadata);
      } else {
        preview.innerHTML = `<div class="preview-error">Could not generate preview for this URL</div>`;
        // Enable button anyway - we can still add with basic info
        addBookmarkBtn.disabled = false;
      }
    } catch (error) {
      console.error('Error previewing URL:', error);
      previewLoading.style.display = 'none';
      preview.style.display = 'block';
      preview.innerHTML = `<div class="preview-error">Error generating preview: ${error.message}</div>`;
      // Enable button anyway - we can still add with basic info
      addBookmarkBtn.disabled = false;
    }
  }, 500)); // Debounce to prevent too many requests while typing

  // Set up event listener for add bookmark button
  addBookmarkBtn.addEventListener('click', async () => {
    const url = urlInput.value.trim();
    
    if (!url) {
      alert("Please enter a URL");
      return;
    }
    
    // Get metadata from the preview if available
    let title = new URL(url).hostname;
    let description = '';
    let thumbnail = null;
    let favicon = null;
    let siteName = null;
    
    try {
      if (preview.dataset.metadata) {
        const metadata = JSON.parse(preview.dataset.metadata);
        title = metadata.title || title;
        description = metadata.description || '';
        thumbnail = metadata.image || null;
        favicon = metadata.favicon || null;
        siteName = metadata.site_name || null;
      }
    } catch (err) {
      console.error("Error parsing metadata:", err);
    }
    
    await addBookmark(folderId, url, title, description, thumbnail, favicon, siteName);
  });

  // Add an event listener to close when clicking outside
  popup.addEventListener('click', function(e) {
    if (e.target === popup) {
      closeFolderPopup();
    }
  });
}

/**
 * Helper function to debounce input events
 */
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

async function addBookmark(folderId, url, title, description = "", thumbnail = null, favicon = null, siteName = null) {
  // Ensure URL has http:// or https:// prefix
  let finalUrl = url;
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    finalUrl = 'https://' + url;
  }
  
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    alert("You must be logged in to add bookmarks");
    return;
  }
  
  try {
    // Save the bookmark to Supabase
    const { data, error } = await supabase
      .from('bookmarks')
      .insert([
        { 
          title: title,
          url: finalUrl,
          description: description,
          folder_id: folderId,
          user_id: user.id,
          thumbnail: thumbnail,
          favicon: favicon,
          site_name: siteName,
          created_at: new Date().toISOString()
        }
      ]);
    
    if (error) {
      console.error("Error adding bookmark:", error);
      alert("Failed to add bookmark. Please try again.");
    } else {
      alert("Bookmark added successfully!");
      closeFolderPopup();
      // Reload the folder contents
      openFolder(folderId);
    }
  } catch (err) {
    console.error("Exception in addBookmark:", err);
    alert("An error occurred: " + err.message);
  }
}

async function deleteBookmark(bookmarkId) {
  if (!confirm("Are you sure you want to delete this bookmark?")) {
    return;
  }
  
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    alert("You must be logged in to delete bookmarks");
    return;
  }
  
  // Get the folder ID first (so we can reload the folder after deletion)
  const { data: bookmark, error: getError } = await supabase
    .from('bookmarks')
    .select('folder_id')
    .eq('id', bookmarkId)
    .single();
    if (getError) {
    console.error("Error getting bookmark:", getError);
    return;
  }
  
  const folderId = bookmark.folder_id;
  
  // Delete the bookmark
  const { error } = await supabase
    .from('bookmarks')
    .delete()
    .eq('id', bookmarkId)
    .eq('user_id', user.id);  // Ensure only the owner can delete
  
  if (error) {
    console.error("Error deleting bookmark:", error);
    alert("Failed to delete bookmark. Please try again.");
  } else {
    // Reload the folder contents
    openFolder(folderId);
  }
}

// Modify showSection function in app.js to include bookmarks content
function updateBookmarksSection() {
  // This function should be called when the bookmarks section is displayed
  if (document.querySelector('.bookmarks-list')) {
    // Remove existing bookmarks header if it exists
    const existingHeader = document.querySelector('.bookmarks-header');
    if (existingHeader) {
      existingHeader.remove();
    }
    
    // Add the "Add Folder" button
    const bookmarksContainer = document.querySelector('.bookmarks-container') || 
                               document.querySelector('.selected-card.bookmarks');
    
    if (bookmarksContainer) {
      const headerDiv = document.createElement('div');
      headerDiv.className = 'bookmarks-header';
      headerDiv.innerHTML = `
        <button class="add-folder-btn" onclick="showFolderPopup()">
          <i class="fa-solid fa-folder-plus"></i> Add Folder
        </button>
      `;
      
      // Add the bookmarks list container if it doesn't exist
      let bookmarksList = document.querySelector('.bookmarks-list');
      if (!bookmarksList) {
        bookmarksList = document.createElement('div');
        bookmarksList.className = 'bookmarks-list';
        bookmarksContainer.appendChild(bookmarksList);
      }
      
      // Insert the header before the bookmarks list
      bookmarksContainer.insertBefore(headerDiv, bookmarksList);
      
      // Load the folders
      loadUserFolders();
    }
  }
}

// Initialize folder management
document.addEventListener('DOMContentLoaded', function() {
  // Set up a MutationObserver to detect when the bookmarks section is shown
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'childList' && mutation.addedNodes.length) {
        // Check if the bookmarks section was added
        for (let i = 0; i < mutation.addedNodes.length; i++) {
          const node = mutation.addedNodes[i];
          if (node.nodeType === 1 && node.classList && 
              node.classList.contains('selected-card') && 
              node.classList.contains('bookmarks')) {
            updateBookmarksSection();
            break;
          }
        }
      }
    });
  });
  
  // Start observing the document body for changes
  observer.observe(document.body, { childList: true, subtree: true });
  
  // Modify the showSection function to include bookmarks container
  const originalShowSection = window.showSection;
  if (typeof originalShowSection === 'function') {
    window.showSection = function(section) {
      // Call the original function
      originalShowSection(section);
      
      // If it's the bookmarks section, add our content
      if (section === 'bookmarks') {
        setTimeout(updateBookmarksSection, 100);
      }
    };
  }
});

function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

function escapeHtml(html) {
  if (!html) return '';
  
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

function resetDeleteButton(folderItem) {
  if (folderItem) {
    folderItem.classList.remove('delete-mode');
    const deleteBtn = folderItem.querySelector('.delete-folder-btn');
    if (deleteBtn) {
      deleteBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
    }
  }
}

/**
 * Toggles delete mode for a folder
 * @param {string} folderId - The ID of the folder
 * @param {string} folderName - The name of the folder
 * @param {Event} event - The click event
 */
function toggleDeleteMode(folderId, folderName, event) {
  if (event) {
    event.stopPropagation();
  }
  
  const folderItem = event.target.closest('.folder-item');
  
  if (folderItem.classList.contains('delete-mode')) {
    confirmDeleteFolder(folderId, folderName, event);
  } else {
    // First click - enter delete mode
    document.querySelectorAll('.folder-item.delete-mode').forEach(item => {
      if (item !== folderItem) {
        item.classList.remove('delete-mode');
      }
    });
    
    folderItem.classList.add('delete-mode');
    
    // Show tooltip
    const notification = document.createElement('div');
    notification.className = 'delete-confirmation-tooltip';
    notification.textContent = 'Click trash icon again to confirm deletion';
    folderItem.appendChild(notification);
    
    // Remove tooltip after delay
    setTimeout(() => {
      if (notification && notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 2000);
  }
}

/**
 * Confirm before deleting a folder
 * @param {string} folderId - The ID of the folder to delete
 * @param {string} folderName - The name of the folder
 * @param {Event} event - The click event
 */
function confirmDeleteFolder(folderId, folderName, event) {
  if (event) {
    event.stopPropagation();
  }
  
  const confirmDelete = confirm(`Are you sure you want to delete the folder "${folderName}"? This will also delete all bookmarks within this folder.`);
  
  if (confirmDelete) {
    deleteFolder(folderId);
  } else {
    const folderItem = event.target.closest('.folder-item');
    if (folderItem) {
      folderItem.classList.remove('delete-mode');
    }
  }
}

/**
 * Delete a folder and all its bookmarks
 * @param {string} folderId - The ID of the folder to delete
 */
async function deleteFolder(folderId) {
  try {
    // Show loading indicator
    const folderItem = document.querySelector(`.folder-item[data-folder-id="${folderId}"]`);
    if (folderItem) {
      const deleteBtn = folderItem.querySelector('.delete-folder-btn');
      if (deleteBtn) {
        deleteBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
      }
    }
    
    // First, get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      alert("You must be logged in to delete folders");
      resetDeleteButton(folderItem);
      return;
    }
    
    // Start a Supabase transaction by getting a reference to the table operations
    // Delete all bookmarks in the folder first
    const { error: bookmarkError } = await supabase
      .from('bookmarks')
      .delete()
      .eq('folder_id', folderId);
    
    if (bookmarkError) {
      console.error("Error deleting bookmarks in folder:", bookmarkError);
      alert("Failed to delete bookmarks: " + bookmarkError.message);
      resetDeleteButton(folderItem);
      return;
    }
    
    // Then delete the folder
    const { error: folderError } = await supabase
      .from('bookmark_folders')
      .delete()
      .eq('id', folderId)
      .eq('user_id', user.id); // Make sure the folder belongs to the current user
      if (folderError) {
      console.error("Error deleting folder:", folderError);
      alert("Failed to delete folder: " + folderError.message);
      // If folder deletion fails, we should attempt to restore the bookmarks, but Supabase doesn't support transactions directly
      // So we'll just inform the user that there might be inconsistency
      alert("Warning: Bookmarks were deleted but the folder could not be deleted. Please try again.");
      resetDeleteButton(folderItem);
    } else {
      // Add visual feedback before removing the folder item
      if (folderItem) {
        folderItem.style.opacity = '0';
        folderItem.style.transform = 'scale(0.8)';
        folderItem.style.transition = 'opacity 0.3s, transform 0.3s';
        
        // Wait for the animation to complete before refreshing folders
        setTimeout(async () => {
          // Refresh the folders list
          await loadUserFolders();
        }, 300);
      } else {
        // If no folder item found, just refresh the folders
        await loadUserFolders();
      }
    }
  } catch (err) {
    console.error("Exception in deleteFolder:", err);
    alert("An error occurred: " + err.message);
    const folderItem = document.querySelector(`.folder-item[data-folder-id="${folderId}"]`);
    resetDeleteButton(folderItem);
  }
}