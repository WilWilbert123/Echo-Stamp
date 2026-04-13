export const uploadImageToCloudinary = async (fileUri) => {
  const cloudName = "dfch0leek";  
  const uploadPreset = "Echo-Stamp"; 
  
  const data = new FormData();

 
  const extension = fileUri.split('.').pop().toLowerCase().split('?')[0];
  const isVideo = ['mp4', 'mov', 'm4v', 'avi'].includes(extension);
    const isAudio = ['m4a', 'mp3', 'wav', '3gp', 'caf'].includes(extension);

  // Fallback for URIs without clear extensions (common on Android)
  let mimeType = isVideo ? 'video/mp4' : 'image/jpeg';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) mimeType = `image/${extension === 'jpg' ? 'jpeg' : extension}`;
  if (isAudio) mimeType = `audio/${extension === 'm4a' ? 'mp4' : extension}`;

 
  data.append("file", {
    uri: fileUri,
    type: mimeType, 
    name: `upload.${extension}`,
  });

  data.append("upload_preset", uploadPreset);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, 
      {
        method: "POST",
        headers: {
          Accept: 'application/json',
        },
        body: data,
      }
    );

    const result = await response.json();
    console.log("Cloudinary API response result:", result); // <-- ADD THIS LOG
    
    if (!response.ok || result.error) {
        throw new Error(result.error.message);
    }

    return result.secure_url; 
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    throw error;
  }
};

export const uploadWithConcurrency = async (items, iteratorFn, concurrency = 3) => {
  if (!Array.isArray(items) || items.length === 0) return [];

  const results = new Array(items.length);
  let currentIndex = 0;

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (currentIndex < items.length) {
      const index = currentIndex++;
      results[index] = await iteratorFn(items[index], index, items);
    }
  });

  await Promise.all(workers);
  return results;
};