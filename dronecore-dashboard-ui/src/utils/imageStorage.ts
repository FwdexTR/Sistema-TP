
interface StoredImage {
  id: string;
  taskId: string;
  entryIndex: number;
  photoIndex: number;
  dataUrl: string;
  filename: string;
  uploadDate: string;
}

export class ImageStorageManager {
  private static STORAGE_KEY = 'tpdrones_stored_images';

  static async storeImage(taskId: string, entryIndex: number, photoIndex: number, file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const dataUrl = e.target?.result as string;
          const imageId = `${taskId}_${entryIndex}_${photoIndex}_${Date.now()}`;
          
          const storedImage: StoredImage = {
            id: imageId,
            taskId,
            entryIndex,
            photoIndex,
            dataUrl,
            filename: file.name,
            uploadDate: new Date().toISOString()
          };

          const existingImages = this.getStoredImages();
          existingImages.push(storedImage);
          
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingImages));
          resolve(imageId);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  static getStoredImages(): StoredImage[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  static getImageById(imageId: string): StoredImage | null {
    const images = this.getStoredImages();
    return images.find(img => img.id === imageId) || null;
  }

  static getImagesForTask(taskId: string): StoredImage[] {
    const images = this.getStoredImages();
    return images.filter(img => img.taskId === taskId);
  }

  static deleteImage(imageId: string): boolean {
    try {
      const images = this.getStoredImages();
      const filteredImages = images.filter(img => img.id !== imageId);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredImages));
      return true;
    } catch {
      return false;
    }
  }

  static deleteImagesForTask(taskId: string): boolean {
    try {
      const images = this.getStoredImages();
      const filteredImages = images.filter(img => img.taskId !== taskId);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredImages));
      return true;
    } catch {
      return false;
    }
  }

  static clearAllImages(): boolean {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      return true;
    } catch {
      return false;
    }
  }

  static getStorageSize(): number {
    const images = this.getStoredImages();
    return images.reduce((size, img) => size + img.dataUrl.length, 0);
  }

  static getStorageSizeFormatted(): string {
    const bytes = this.getStorageSize();
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }
}
