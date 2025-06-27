// Initializes the application and sets up event listeners

document.addEventListener('DOMContentLoaded', function() {
  // Setup the navbar functionality
  window.uiService.setupNavbar();
  
  // Restore overlay on page load if there was a previously open section
  const lastSection = localStorage.getItem('lastSection');
  if (lastSection) {
    window.uiService.showSection(lastSection);
  }
  
  // Check authentication state and update UI accordingly
  window.supabaseClient.auth.getSession().then(({ data: { session } }) => {
    window.uiService.updateLoginLogoutUI(!!session);
    
    // If authenticated and looking at bookmarks section, load folders
    if (session && document.querySelector('.bookmarks-list')) {
      window.bookmarkManager.loadUserFolders();
    }
  });
  
  // Setup auth state change listener
  window.supabaseClient.auth.onAuthStateChange((event, session) => {
    window.uiService.updateLoginLogoutUI(!!session);
    
    // If authenticated and looking at bookmarks section, load folders
    if (session && document.querySelector('.bookmarks-list')) {
      window.bookmarkManager.loadUserFolders();
    }
  });
});
