export const uploadImageToCloudinary = async (fileUri) => {
const cloudName = "dfch0leek";  
  const uploadPreset = "Echo-Stamp";  
  const data = new FormData();
  data.append("file", {
    uri: fileUri,
    type: "image/jpeg",
    name: "upload.jpg",
  });
  data.append("upload_preset", uploadPreset);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: data,
      }
    );
    const result = await response.json();
    return result.secure_url; // THE HTTPS LINK!
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    throw error;
  }
};