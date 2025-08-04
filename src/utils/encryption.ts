import CryptoJS from 'crypto-js';

// AES Encryption
export const encryptAES = (text: string, password: string): string => {
  try {
    return CryptoJS.AES.encrypt(text, password).toString();
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt text');
  }
};

// AES Decryption
export const decryptAES = (ciphertext: string, password: string): string => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, password);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt text. Check your password and encrypted text.');
  }
};

// Generate a random key
export const generateKey = (length = 32): string => {
  return CryptoJS.lib.WordArray.random(length).toString();
};

// Hash a password (for storage)
export const hashPassword = (password: string): string => {
  return CryptoJS.SHA256(password).toString();
};

// Double encryption with two different algorithms
export const doubleEncrypt = (text: string, password1: string, password2: string): string => {
  const firstPass = encryptAES(text, password1);
  return encryptAES(firstPass, password2);
};

// Double decryption
export const doubleDecrypt = (ciphertext: string, password1: string, password2: string): string => {
  const firstPass = decryptAES(ciphertext, password2);
  return decryptAES(firstPass, password1);
};

// Store encryption key securely in localStorage (with expiration)
export const storeKey = (keyId: string, key: string, expirationHours = 24): void => {
  const expiration = new Date();
  expiration.setHours(expiration.getHours() + expirationHours);
  
  const keyData = {
    key,
    expiration: expiration.toISOString(),
  };
  
  localStorage.setItem(`cipher_key_${keyId}`, JSON.stringify(keyData));
};

// Retrieve encryption key from localStorage (if not expired)
export const retrieveKey = (keyId: string): string | null => {
  const keyDataString = localStorage.getItem(`cipher_key_${keyId}`);
  if (!keyDataString) return null;
  
  try {
    const keyData = JSON.parse(keyDataString);
    const expiration = new Date(keyData.expiration);
    
    if (expiration > new Date()) {
      return keyData.key;
    } else {
      // Key has expired, remove it
      localStorage.removeItem(`cipher_key_${keyId}`);
      return null;
    }
  } catch (error) {
    console.error('Error retrieving key:', error);
    return null;
  }
};

// List all stored keys
export const listStoredKeys = (): {id: string, expiration: Date}[] => {
  const keys = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('cipher_key_')) {
      try {
        const keyData = JSON.parse(localStorage.getItem(key) || '{}');
        const id = key.replace('cipher_key_', '');
        keys.push({
          id,
          expiration: new Date(keyData.expiration)
        });
      } catch (error) {
        console.error('Error parsing key data:', error);
      }
    }
  }
  
  return keys;
};

// Delete a stored key
export const deleteKey = (keyId: string): void => {
  localStorage.removeItem(`cipher_key_${keyId}`);
};

// Clear memory after use
export const clearMemory = (variable: any): void => {
  if (typeof variable === 'string') {
    // Overwrite the variable with empty string
    variable = '';
  } else if (Array.isArray(variable)) {
    // Clear array
    variable.length = 0;
  } else if (typeof variable === 'object' && variable !== null) {
    // Clear object
    for (const key in variable) {
      if (Object.prototype.hasOwnProperty.call(variable, key)) {
        delete variable[key];
      }
    }
  }
};

// File encryption utilities
export const encryptFile = async (file: File, password: string): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const base64Data = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    return encryptAES(base64Data, password);
  } catch (error) {
    console.error('File encryption error:', error);
    throw new Error('Failed to encrypt file');
  }
};

export const decryptFile = (encryptedData: string, password: string, originalFileName: string): Blob => {
  try {
    const decryptedBase64 = decryptAES(encryptedData, password);
    const binaryString = atob(decryptedBase64);
    const bytes = new Uint8Array(binaryString.length);
    
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Determine MIME type based on file extension
    const extension = originalFileName.split('.').pop()?.toLowerCase();
    let mimeType = 'application/octet-stream';
    
    if (extension) {
      const mimeTypes: { [key: string]: string } = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp',
        'mp4': 'video/mp4',
        'webm': 'video/webm',
        'avi': 'video/avi',
        'mov': 'video/quicktime',
        'mp3': 'audio/mpeg',
        'wav': 'audio/wav',
        'ogg': 'audio/ogg',
        'm4a': 'audio/mp4'
      };
      mimeType = mimeTypes[extension] || mimeType;
    }
    
    return new Blob([bytes], { type: mimeType });
  } catch (error) {
    console.error('File decryption error:', error);
    throw new Error('Failed to decrypt file. Check your password.');
  }
};