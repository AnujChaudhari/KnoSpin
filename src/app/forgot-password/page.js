const handleReset = async (e) => {
  e.preventDefault();
  try {
    await resetPassword(email);
    toast.success("Password reset email sent!");
  } catch (err) {
    toast.error(err.message);
  }
};
