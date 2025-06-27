// Bookmark management functions

// Load user folders
async function loadUserFolders() {
  try {
    const { data: { user } } = await window.supabaseClient.auth.getUser();
    
    if (!user) {
      console.log("No user logged in");
      return;
    }
    
    const { data: folders, error } = await window.supabaseClient
      .from('bookmark_folders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error("Error loading folders:", error);
      return;
    }
    
    // Get bookmarks list container
    const bookmarksList = document.querySelector('.bookmarks-list');
    if (!bookmarksList) return;
    
    // Clear previous content
    bookmarksList.innerHTML = '';
    
    // If no folders, show message
    if (!folders || folders.length === 0) {
      bookmarksList.innerHTML = `
        <div class="no-folders">
          <p>You haven't created any folders yet.</p>
          <p>Click "Add Folder" to get started!</p>
        </div>
      `;
      return;
    }
    
    // Create scrollable folders container
    const foldersContainer = document.createElement('div');
    foldersContainer.className = 'simple-folders-container';
    foldersContainer.innerHTML = `
      <button id="scroll-left-btn" class="scroll-btn left-scroll">
        <i class="fas fa-chevron-left"></i>
      </button>
      <div id="simple-folders-scroll" class="simple-folders-scroll">
        <div class="simple-folders-wrapper">
          <!-- Folders will be added here -->
        </div>
      </div>
      <button id="scroll-right-btn" class="scroll-btn right-scroll">
        <i class="fas fa-chevron-right"></i>
      </button>
    `;
    bookmarksList.appendChild(foldersContainer);
    
    const foldersWrapper = foldersContainer.querySelector('.simple-folders-wrapper');
    
    // Add folders
    folders.forEach(folder => {
      const folderItem = document.createElement('div');
      folderItem.className = 'folder-item';
      folderItem.setAttribute('data-folder-id', folder.id);
      folderItem.innerHTML = `
        <div class="folder-icon">
          <i class="${folder.icon || 'fa-solid fa-folder'}"></i>
        </div>
        <div class="folder-name">${folder.name}</div>
        <div class="folder-actions">          <button class="add-bookmark-btn" onclick="window.folderManager.showAddBookmarkPopup('${folder.id}')">
            <i class="fa-solid fa-plus"></i>
          </button>
          <button class="delete-folder-btn" onclick="initiateFolderDelete(this, '${folder.id}')">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      `;
      foldersWrapper.appendChild(folderItem);
      
      // Load bookmarks for this folder
      loadBookmarksForFolder(folder.id, folderItem);
    });
    
    // Setup scroll buttons
    const leftBtn = document.getElementById('scroll-left-btn');
    const rightBtn = document.getElementById('scroll-right-btn');
    const scrollContainer = document.getElementById('simple-folders-scroll');
    
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
    
    // Check if scroll is needed
    function checkScroll() {
      if (scrollContainer.scrollWidth > scrollContainer.clientWidth) {
        leftBtn.style.display = '';
        rightBtn.style.display = '';
      } else {
        leftBtn.style.display = 'none';
        rightBtn.style.display = 'none';
      }
    }
    
    // Initial check
    checkScroll();
    
    // Also check after window resize
    window.addEventListener('resize', checkScroll);
  } catch (err) {
    console.error("Error in loadUserFolders:", err);
  }
}

// Load bookmarks for a specific folder
async function loadBookmarksForFolder(folderId, folderElement) {
  try {
    const { data: { user } } = await window.supabaseClient.auth.getUser();
    
    if (!user) return;
    
    const { data: bookmarks, error } = await window.supabaseClient
      .from('bookmarks')
      .select('*')
      .eq('folder_id', folderId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error loading bookmarks:", error);
      return;
    }
    
    // Create bookmarks container if it doesn't exist
    let bookmarksContainer = folderElement.querySelector('.folder-bookmarks');
    if (!bookmarksContainer) {
      bookmarksContainer = document.createElement('div');
      bookmarksContainer.className = 'folder-bookmarks';
      folderElement.appendChild(bookmarksContainer);
    }
    
    // Clear previous content
    bookmarksContainer.innerHTML = '';
    
    // Add bookmarks count
    const countElement = document.createElement('div');
    countElement.className = 'bookmarks-count';
    countElement.textContent = `${bookmarks ? bookmarks.length : 0} bookmarks`;
    bookmarksContainer.appendChild(countElement);
    
    // If no bookmarks, show message
    if (!bookmarks || bookmarks.length === 0) {
      const emptyMessage = document.createElement('div');
      emptyMessage.className = 'empty-bookmarks-message';
      emptyMessage.textContent = 'No bookmarks in this folder yet.';
      bookmarksContainer.appendChild(emptyMessage);
      return;
    }
    
    // Create bookmark grid
    const bookmarkGrid = document.createElement('div');
    bookmarkGrid.className = 'bookmark-grid';
    bookmarksContainer.appendChild(bookmarkGrid);
    
    // Add bookmarks
    bookmarks.forEach(bookmark => {
      const bookmarkItem = document.createElement('div');
      bookmarkItem.className = 'bookmark-item';
      bookmarkItem.setAttribute('data-bookmark-id', bookmark.id);
      
      // Determine icon based on URL
      let icon = 'fa-solid fa-bookmark';
      let domain = '';
      
      try {
        const url = new URL(bookmark.url);
        domain = url.hostname;
        
        if (domain.includes('youtube') || domain.includes('youtu.be')) {
          icon = 'fa-brands fa-youtube';
        } else if (domain.includes('instagram')) {
          icon = 'fa-brands fa-instagram';
        } else if (domain.includes('twitter') || domain.includes('x.com')) {
          icon = 'fa-brands fa-twitter';
        } else if (domain.includes('reddit')) {
          icon = 'fa-brands fa-reddit';
        } else if (domain.includes('github')) {
          icon = 'fa-brands fa-github';
        } else if (domain.includes('linkedin')) {
          icon = 'fa-brands fa-linkedin';
        } else if (domain.includes('facebook')) {
          icon = 'fa-brands fa-facebook';
        }
      } catch (e) {
        console.warn("Invalid URL:", bookmark.url);
      }
      
      // Format date
      const createdDate = new Date(bookmark.created_at);
      const dateFormatted = createdDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      
      // Set bookmark content
      bookmarkItem.innerHTML = `
        <div class="bookmark-header">
          <div class="bookmark-icon">
            <i class="${icon}"></i>
          </div>
          <div class="bookmark-actions">
            <button class="delete-bookmark-btn" onclick="deleteBookmark('${bookmark.id}', this)">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>
        <a href="${bookmark.url}" target="_blank" class="bookmark-link">
          <div class="bookmark-title">${bookmark.title || 'No Title'}</div>
          <div class="bookmark-url">${domain || bookmark.url}</div>
        </a>
        <div class="bookmark-date">${dateFormatted}</div>
      `;
      
      bookmarkGrid.appendChild(bookmarkItem);
    });
  } catch (err) {
    console.error("Error in loadBookmarksForFolder:", err);  }
}

// Add a bookmark
async function addBookmark(folderId, url, title, description = "", thumbnail = null, favicon = null, siteName = null) {
  try {
    const { data: { user } } = await window.supabaseClient.auth.getUser();
    
    if (!user) {
      throw new Error("You must be logged in to add bookmarks");
    }
    
    let finalTitle = title;
    
    // If no title provided, try to fetch metadata
    if (!finalTitle) {
      try {
        const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
        const data = await response.json();
        
        if (data.contents) {
          // Create a temporary DOM element to parse the HTML
          const parser = new DOMParser();
          const doc = parser.parseFromString(data.contents, 'text/html');
          
          // Get the title
          const pageTitle = doc.querySelector('title');
          if (pageTitle) {
            finalTitle = pageTitle.textContent;
          }
        }
      } catch (err) {
        console.warn("Failed to get page title:", err);
        // Continue with empty title if metadata fetch fails
      }
    }
    
    // If still no title, use the URL as title
    if (!finalTitle) {
      finalTitle = url;
    }
    
    const { data, error } = await window.supabaseClient
      .from('bookmarks')
      .insert([
        {
          url,
          title: finalTitle,
          folder_id: folderId,
          user_id: user.id,
          created_at: new Date().toISOString()
        }
      ]);
    
    if (error) {
      throw error;
    }
    
    // Refresh the folder's bookmarks
    const folderItem = document.querySelector(`.folder-item[data-folder-id="${folderId}"]`);
    if (folderItem) {
      loadBookmarksForFolder(folderId, folderItem);
    }
    
    return data;
  } catch (err) {
    console.error("Error in addBookmark:", err);
    throw err;
  }
}

// Delete a bookmark
async function deleteBookmark(bookmarkId, buttonElement) {
  try {
    // First disable the button to prevent multiple clicks
    if (buttonElement) {
      buttonElement.disabled = true;
      buttonElement.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
    }
    
    const { data: { user } } = await window.supabaseClient.auth.getUser();
    
    if (!user) {
      throw new Error("You must be logged in to delete bookmarks");
    }
    
    // Find the bookmark item element
    const bookmarkItem = buttonElement ? 
      buttonElement.closest('.bookmark-item') : 
      document.querySelector(`.bookmark-item[data-bookmark-id="${bookmarkId}"]`);
    
    // Get the folder element to refresh later
    let folderElement = null;
    if (bookmarkItem) {
      folderElement = bookmarkItem.closest('.folder-item');
    }
    
    // Delete from the database
    const { error } = await window.supabaseClient
      .from('bookmarks')
      .delete()
      .eq('id', bookmarkId)
      .eq('user_id', user.id);
    
    if (error) {
      console.error("Error deleting bookmark:", error);
      alert("Failed to delete bookmark: " + error.message);
      
      // Reset the button
      if (buttonElement) {
        buttonElement.disabled = false;
        buttonElement.innerHTML = '<i class="fa-solid fa-trash"></i>';
      }
      
      return;
    }
    
    // Animate removal of the bookmark item
    if (bookmarkItem) {
      bookmarkItem.style.transition = 'opacity 0.3s, transform 0.3s';
      bookmarkItem.style.opacity = '0';
      bookmarkItem.style.transform = 'scale(0.8)';
      
      setTimeout(() => {
        // Refresh the folder's bookmarks instead of just removing the item
        // This ensures the bookmark count is updated
        if (folderElement) {
          const folderId = folderElement.getAttribute('data-folder-id');
          if (folderId) {
            loadBookmarksForFolder(folderId, folderElement);
          }
        } else {
          // If we can't find the folder element, just remove the bookmark item
          bookmarkItem.remove();
        }
      }, 300);
    }
  } catch (err) {
    console.error("Error in deleteBookmark:", err);
    alert("An error occurred: " + err.message);
    
    // Reset the button
    if (buttonElement) {
      buttonElement.disabled = false;
      buttonElement.innerHTML = '<i class="fa-solid fa-trash"></i>';
    }
  }
}

// Initialize folder deletion
function initiateFolderDelete(buttonElement, folderId) {
  if (!buttonElement) return;
  
  // Get the folder item
  const folderItem = buttonElement.closest('.folder-item');
  if (!folderItem) return;
  
  // Change button to confirmation
  buttonElement.innerHTML = 'Confirm Delete?';
  buttonElement.className = 'delete-folder-btn confirm';
  buttonElement.onclick = function() {
    deleteFolder(folderId, folderItem);
  };
  
  // Add cancel option
  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'cancel-delete-btn';
  cancelBtn.innerHTML = 'Cancel';
  cancelBtn.onclick = function() {
    resetDeleteButton(folderItem);
  };
  
  // Insert cancel button after the confirm button
  buttonElement.parentNode.insertBefore(cancelBtn, buttonElement.nextSibling);
  
  // Set a timeout to reset if not confirmed
  setTimeout(() => {
    resetDeleteButton(folderItem);
  }, 5000);
}

// Reset delete button to original state
function resetDeleteButton(folderItem) {
  if (!folderItem) return;
  
  const confirmButton = folderItem.querySelector('.delete-folder-btn.confirm');
  const cancelButton = folderItem.querySelector('.cancel-delete-btn');
  
  if (confirmButton) {
    confirmButton.innerHTML = '<i class="fa-solid fa-trash"></i>';
    confirmButton.className = 'delete-folder-btn';
    confirmButton.onclick = function() {
      const folderId = folderItem.getAttribute('data-folder-id');
      initiateFolderDelete(confirmButton, folderId);
    };
  }
  
  if (cancelButton) {
    cancelButton.remove();
  }
}

// Delete a folder and all its bookmarks
async function deleteFolder(folderId, folderItem) {
  try {
    const { data: { user } } = await window.supabaseClient.auth.getUser();
    
    if (!user) {
      alert("You must be logged in to delete folders");
      resetDeleteButton(folderItem);
      return;
    }
    
    // First delete all bookmarks in the folder
    const { error: bookmarksError } = await window.supabaseClient
      .from('bookmarks')
      .delete()
      .eq('folder_id', folderId)
      .eq('user_id', user.id);
    
    if (bookmarksError) {
      console.error("Error deleting bookmarks:", bookmarksError);
      alert("Failed to delete bookmarks: " + bookmarksError.message);
      resetDeleteButton(folderItem);
      return;
    }
    
    // Then delete the folder
    const { error: folderError } = await window.supabaseClient
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

// Export for use in other files
window.bookmarkManager = {
  loadUserFolders,
  loadBookmarksForFolder,
  addBookmark,
  deleteBookmark,
  initiateFolderDelete,
  resetDeleteButton,
  deleteFolder
};

// Make these functions available globally for HTML onclick attributes
window.deleteBookmark = deleteBookmark;
window.initiateFolderDelete = initiateFolderDelete;
