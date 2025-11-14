// utils/cloudinary.js

/**
 * Upload an image file to Cloudinary
 * @param {string|object} imageFile - the image URI string or object with { uri }
 * @returns {Promise<string>} - returns the secure URL of the uploaded image
 */
export async function uploadImageToCloudinary(imageFile) {
  try {
    // Cloudinary config
    const cloudName = "dakps43bh";
    const uploadPreset = "ml_default"; // unsigned upload preset
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    console.log('🌩️ Cloudinary config:', { cloudName, uploadPreset, url });

    // Accept either a URI string or an object with .uri
    const imageUri = typeof imageFile === 'string' ? imageFile : imageFile?.uri;
    if (!imageUri) {
      throw new Error('Invalid image URI provided to Cloudinary uploader');
    }

    // Convert local URI to blob (required for fetch uploads in React Native / Expo)
    console.log('📸 Converting URI to blob:', imageUri);
    const response = await fetch(imageUri);
    if (!response.ok) {
      const txt = await response.text().catch(() => 'no body');
      throw new Error(`Failed to fetch image URI. HTTP ${response.status}: ${txt}`);
    }
    const blob = await response.blob();
    console.log('📦 Blob size/type:', blob.size, blob.type);

    // Prepare form data
    const formData = new FormData();
    formData.append('file', blob);
    formData.append('upload_preset', uploadPreset);

    console.log('📤 Sending request to Cloudinary...');

    const uploadRes = await fetch(url, {
      method: 'POST',
      body: formData,
      headers: {
        Accept: 'application/json',
      },
    });

    const text = await uploadRes.text();
    console.log('📨 Cloudinary raw response status:', uploadRes.status, 'text length:', text?.length || 0);

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('❌ Failed to parse Cloudinary response as JSON:', text);
      throw new Error(`Invalid response from Cloudinary: ${text}`);
    }

    console.log('📨 Parsed response data:', data);

    if (uploadRes.ok && data.secure_url) {
      console.log('✅ Upload successful! URL:', data.secure_url);
      return data.secure_url;
    }
    throw new Error(data.error?.message || `Upload failed (status ${uploadRes.status})`);
  } catch (error) {
    console.error('❌ Error uploading image to Cloudinary:', error);
    throw error;
  }
}
