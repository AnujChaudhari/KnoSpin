export const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "image1"); // Replace with your preset name
  formData.append("cloud_name", process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );
  const data = await res.json();
  return data.secure_url;
};