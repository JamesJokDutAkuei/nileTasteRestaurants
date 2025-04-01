export async function signUp(email, password, name, phone) {
  const { data, error } = await window.supabaseClient.signUp({
    email,
    password,
    options: {
      data: {
        name,
        phone,
      },
    },
  });

  if (error) {
    throw new Error(`Signup failed: ${error.message}`);
  }

  const userId = data.user?.id;
  if (!userId) {
    throw new Error('User ID is missing after signup.');
  }

  const { data: userData, error: userDataError } = await window.supabaseClient
    .from('authUsers')
    .insert([{ authId: userId, name, phone }]);

  if (userDataError) {
    throw new Error(`Failed to insert user data: ${userDataError.message}`);
  }

  return { data, userData };
}

// Login function
export async function signIn(email, password) {
  const { data, error } = await window.supabaseClient.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(`Login failed: ${error.message}`);
  }

  return data;
}

// Logout function
export async function signOut() {
  const { error } = await window.supabaseClient.signOut();
  if (error) {
    throw new Error(`Logout failed: ${error.message}`);
  }
}

export async function loginUser({ email, password }) {
  const { data, error } = await window.supabaseClient.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (error) {
    throw new Error(error.message);
  }
  return data;
}

export async function getUser() {
  const { data: session } = await window.supabaseClient.auth.getSession();
  if (!session.session) return null;

  const { data, error } = await window.supabaseClient.auth.getUser();
  if (error) {
    throw new Error(error.message);
  }

  return data?.user;
}

export async function logoutUser() {
  const { error } = await window.supabaseClient.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
}
export async function updateUser({ name, phone, password }) {
  let updatedObject;

  if (name && phone) {
    updatedObject = { data: { name, phone } };
  }
  if (password) {
    updatedObject = { password };
  }

  // Keep the existing auth table update logic unchanged
  const { data: updatedUser, error } =
    await window.supabaseClient.auth.updateUser(updatedObject);

  if (error) {
    throw new Error(error.message);
  }

  // Update the authUsers table
  const userId = updatedUser.user.id;
  if (name && phone) {
    const { error: authError } = await window.supabaseClient
      .from('authUsers')
      .update({
        name,
        phone,
      })
      .eq('authUserId', userId);

    if (authError) {
      throw new Error(authError.message);
    }
  }

  return updatedUser;
}
