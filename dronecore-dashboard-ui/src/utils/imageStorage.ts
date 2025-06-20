import { uploadImage } from '../services/api';

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
  static async storeImage(taskId: string, entryIndex: number, photoIndex: number, file: File): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const dataUrl = e.target?.result as string;
            
            const imageData = {
              filename: file.name,
              dataUrl,
              taskId,
              progressEntryId: null // Será definido quando a entrada de progresso for criada
            };

            const uploadedImage = await uploadImage(imageData);
            resolve(uploadedImage.id);
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      } catch (error) {
        reject(error);
      }
    });
  }

  static async getStoredImages(): Promise<StoredImage[]> {
    try {
      // Esta função agora precisaria de uma API para buscar imagens
      // Por enquanto, retornamos um array vazio
      return [];
    } catch {
      return [];
    }
  }

  static async getImageById(imageId: string): Promise<StoredImage | null> {
    try {
      // Esta função agora precisaria de uma API para buscar uma imagem específica
      // Por enquanto, retornamos null
      return null;
    } catch {
      return null;
    }
  }

  static async getImagesForTask(taskId: string): Promise<StoredImage[]> {
    try {
      // Esta função agora precisaria de uma API para buscar imagens de uma tarefa
      // Por enquanto, retornamos um array vazio
      return [];
    } catch {
      return [];
    }
  }

  static async deleteImage(imageId: string): Promise<boolean> {
    try {
      // Esta função agora precisaria de uma API para deletar uma imagem
      // Por enquanto, retornamos true
      return true;
    } catch {
      return false;
    }
  }

  static async deleteImagesForTask(taskId: string): Promise<boolean> {
    try {
      // Esta função agora precisaria de uma API para deletar imagens de uma tarefa
      // Por enquanto, retornamos true
      return true;
    } catch {
      return false;
    }
  }

  static async clearAllImages(): Promise<boolean> {
    try {
      // Esta função agora precisaria de uma API para limpar todas as imagens
      // Por enquanto, retornamos true
      return true;
    } catch {
      return false;
    }
  }

  static async getStorageSize(): Promise<number> {
    try {
      // Esta função agora precisaria de uma API para calcular o tamanho do armazenamento
      // Por enquanto, retornamos 0
      return 0;
    } catch {
      return 0;
    }
  }

  static async getStorageSizeFormatted(): Promise<string> {
    try {
      const bytes = await this.getStorageSize();
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      if (bytes === 0) return '0 Bytes';
      const i = Math.floor(Math.log(bytes) / Math.log(1024));
      return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    } catch {
      return '0 Bytes';
    }
  }
}
