// Authentication-related functions

// Handle user login
async function handleLogin(email, password) {
  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
  return { error };
}

// Handle user signup
async function handleSignup(email, password) {
  const { error } = await supabaseClient.auth.signUp({ email, password });
  return { error };
}

// Handle user logout
async function handleLogout() {
  await supabaseClient.auth.signOut();
  window.location.reload();
}

// Get current user session
async function getCurrentSession() {
  const { data } = await supabaseClient.auth.getSession();
  return data.session;
}

// Get current user data
async function getCurrentUser() {
  const { data } = await supabaseClient.auth.getUser();
  return data?.user || null;
}

// Export for use in other files
window.authService = {
  handleLogin,
  handleSignup,
  handleLogout,
  getCurrentSession,
  getCurrentUser
};
