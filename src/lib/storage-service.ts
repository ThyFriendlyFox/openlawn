import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject, 
  listAll 
} from 'firebase/storage';
import { storage } from './firebase';

// Photo compression and upload service
export class PhotoService {
  // Compress image to WebP format
  static async compressImage(file: File, maxWidth: number = 1920, maxHeight: number = 1080): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions maintaining aspect ratio
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          'image/webp',
          0.8 // Quality setting
        );
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }
  
  // Upload photo to Firebase Storage
  static async uploadPhoto(
    file: File, 
    customerId: string, 
    type: 'before' | 'after',
    timestamp: number = Date.now()
  ): Promise<string> {
    try {
      // Compress the image
      const compressedBlob = await this.compressImage(file);
      
      // Create storage reference
      const fileName = `${file.name.replace(/\.[^/.]+$/, '')}.webp`;
      const storageRef = ref(storage, `customers/${customerId}/photos/${timestamp}/${type}/${fileName}`);
      
      // Upload compressed image
      await uploadBytes(storageRef, compressedBlob);
      
      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading photo:', error);
      throw error;
    }
  }
  
  // Upload multiple photos
  static async uploadPhotos(
    files: File[], 
    customerId: string, 
    type: 'before' | 'after',
    timestamp: number = Date.now()
  ): Promise<string[]> {
    const uploadPromises = files.map(file => 
      this.uploadPhoto(file, customerId, type, timestamp)
    );
    
    return Promise.all(uploadPromises);
  }
  
  // Delete photo from Firebase Storage
  static async deletePhoto(photoURL: string): Promise<void> {
    try {
      const photoRef = ref(storage, photoURL);
      await deleteObject(photoRef);
    } catch (error) {
      console.error('Error deleting photo:', error);
      throw error;
    }
  }
  
  // Delete all photos for a customer
  static async deleteCustomerPhotos(customerId: string): Promise<void> {
    try {
      const customerPhotosRef = ref(storage, `customers/${customerId}/photos`);
      const result = await listAll(customerPhotosRef);
      
      const deletePromises = result.items.map(itemRef => deleteObject(itemRef));
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error deleting customer photos:', error);
      throw error;
    }
  }
  
  // Get photo URLs for a customer's service record
  static async getServicePhotos(
    customerId: string, 
    timestamp: number
  ): Promise<{ before: string[]; after: string[] }> {
    try {
      const beforeRef = ref(storage, `customers/${customerId}/photos/${timestamp}/before`);
      const afterRef = ref(storage, `customers/${customerId}/photos/${timestamp}/after`);
      
      const [beforeResult, afterResult] = await Promise.all([
        listAll(beforeRef).catch(() => ({ items: [] })),
        listAll(afterRef).catch(() => ({ items: [] }))
      ]);
      
      const beforeURLs = await Promise.all(
        beforeResult.items.map(itemRef => getDownloadURL(itemRef))
      );
      
      const afterURLs = await Promise.all(
        afterResult.items.map(itemRef => getDownloadURL(itemRef))
      );
      
      return {
        before: beforeURLs,
        after: afterURLs
      };
    } catch (error) {
      console.error('Error getting service photos:', error);
      return { before: [], after: [] };
    }
  }
  
  // Clean up old photos (for auto-cleanup functionality)
  static async cleanupOldPhotos(daysOld: number = 90): Promise<void> {
    try {
      const cutoffDate = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
      const customersRef = ref(storage, 'customers');
      const customers = await listAll(customersRef);
      
      for (const customerRef of customers.prefixes) {
        const photosRef = ref(storage, `${customerRef.fullPath}/photos`);
        const photoFolders = await listAll(photosRef);
        
        for (const photoFolder of photoFolders.prefixes) {
          const timestamp = parseInt(photoFolder.name);
          if (timestamp < cutoffDate) {
            // Delete old photo folder
            await deleteObject(photoFolder);
          }
        }
      }
    } catch (error) {
      console.error('Error cleaning up old photos:', error);
      throw error;
    }
  }
}

// Service record photo management
export class ServiceRecordService {
  // Add photos to a service record
  static async addPhotosToServiceRecord(
    customerId: string,
    serviceRecordId: string,
    beforeFiles: File[],
    afterFiles: File[]
  ): Promise<{ beforePhotos: string[]; afterPhotos: string[] }> {
    const timestamp = Date.now();
    
    const [beforePhotos, afterPhotos] = await Promise.all([
      PhotoService.uploadPhotos(beforeFiles, customerId, 'before', timestamp),
      PhotoService.uploadPhotos(afterFiles, customerId, 'after', timestamp)
    ]);
    
    return { beforePhotos, afterPhotos };
  }
  
  // Update service record with new photos
  static async updateServiceRecordPhotos(
    customerId: string,
    serviceRecordId: string,
    beforeFiles: File[],
    afterFiles: File[]
  ): Promise<{ beforePhotos: string[]; afterPhotos: string[] }> {
    // Delete existing photos first
    const existingPhotos = await PhotoService.getServicePhotos(customerId, parseInt(serviceRecordId));
    
    await Promise.all([
      ...existingPhotos.before.map(url => PhotoService.deletePhoto(url)),
      ...existingPhotos.after.map(url => PhotoService.deletePhoto(url))
    ]);
    
    // Upload new photos
    return this.addPhotosToServiceRecord(customerId, serviceRecordId, beforeFiles, afterFiles);
  }
  
  // Delete service record photos
  static async deleteServiceRecordPhotos(
    customerId: string,
    serviceRecordId: string
  ): Promise<void> {
    const timestamp = parseInt(serviceRecordId);
    const photosRef = ref(storage, `customers/${customerId}/photos/${timestamp}`);
    
    try {
      const result = await listAll(photosRef);
      const deletePromises = result.items.map(itemRef => deleteObject(itemRef));
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error deleting service record photos:', error);
      throw error;
    }
  }
}

// Export convenience functions
export const uploadCustomerPhotos = PhotoService.uploadPhotos;
export const deleteCustomerPhotos = PhotoService.deleteCustomerPhotos;
export const getServicePhotos = PhotoService.getServicePhotos;
export const cleanupOldPhotos = PhotoService.cleanupOldPhotos; 