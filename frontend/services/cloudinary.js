export const uploadImageToCloudinary = async (fileUri) => {
  const cloudName = "dfch0leek";  
  const uploadPreset = "Echo-Stamp";  
  const data = new FormData();

 
  const isVideo = fileUri.toLowerCase().endsWith('.mp4') || 
                  fileUri.toLowerCase().endsWith('.mov') || 
                  fileUri.toLowerCase().endsWith('.m4v');

  data.append("file", {
    uri: fileUri,
    
    type: isVideo ? "video/mp4" : "image/jpeg", 
    name: isVideo ? "upload.mp4" : "upload.jpg",
  });

  data.append("upload_preset", uploadPreset);

  try {
    const response = await fetch(
 
      `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, 
      {
        method: "POST",
        body: data,
      }
    );
    const result = await response.json();
    
    if (result.error) {
        console.error("Cloudinary API Error:", result.error.message);
        return null;
    }

    return result.secure_url; 
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    throw error;
  }
};