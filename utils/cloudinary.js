// utils/cloudinary.js

function getMimeTypeFromUri(uri) {
  if (!uri || typeof uri !== 'string') return 'image/jpeg';
  const clean = uri.split('?')[0].split('#')[0];
  const parts = clean.split('.');
  const ext = parts.length ? parts[parts.length - 1].toLowerCase() : '';
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'gif':
      return 'image/gif';
    case 'heic':
    case 'heif':
      return 'image/heic';
    case 'svg':
      return 'image/svg+xml';
    default:
      return 'image/jpeg';
  }
}

export async function uploadImageToCloudinary(imageFile) {
  try {
    const cloudName = "dakps43bh";
    const uploadPreset = "news_images";
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    // get uri string
    const imageUri = typeof imageFile === 'string' ? imageFile : imageFile?.uri;
    if (!imageUri) throw new Error('Invalid image URI');

    const formData = new FormData();

    // Append file directly with type and name
    formData.append('file', {
      uri: imageUri,
      type: getMimeTypeFromUri(imageUri),
      name: `upload_${Date.now()}.${(imageUri.split('.').pop() || 'jpg')}`,
    });
    formData.append('upload_preset', uploadPreset);

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      headers: {
        Accept: 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Upload failed');
    }

    return data.secure_url;
  } catch (error) {
    console.error('❌ Error uploading image to Cloudinary:', error);
    throw error;
  }
}
