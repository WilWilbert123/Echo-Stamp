export const uploadImageToCloudinary = async (fileUri) => {
  const cloudName = "dfch0leek";  
  const uploadPreset = "Echo-Stamp"; 
  
  const data = new FormData();

 
  const extension = fileUri.split('.').pop().toLowerCase();
  const isVideo = ['mp4', 'mov', 'm4v', 'avi'].includes(extension);

 
  data.append("file", {
    uri: fileUri,
    type: isVideo ? `video/${extension}` : `image/${extension || 'jpeg'}`, 
    name: `upload.${extension}`,
  });

  data.append("upload_preset", uploadPreset);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, 
      {
        method: "POST",
        body: data,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    const result = await response.json();
    
    if (result.error) {
        throw new Error(result.error.message);
    }

    return result.secure_url; 
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    throw error;
  }
};