/**
 * Secure File Upload Utilities
 * Implements enterprise-grade file security validation
 * Prevents malware uploads and validates file integrity
 */

import { 
  AllowedMimeTypes, 
  SecureFileValidation, 
  SecureFileUploadResponse,
  SECURITY_CONFIG 
} from '@/types/security';

/**
 * File validation error interface
 */
export interface FileValidationError {
  readonly code: string;
  readonly message: string;
  readonly severity: 'error' | 'warning';
}

/**
 * File validation result
 */
export interface FileValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly FileValidationError[];
  readonly sanitizedFile?: File;
}

/**
 * Validates file security constraints
 */
export function validateFileUpload(file: File): FileValidationResult {
  const errors: FileValidationError[] = [];

  // Check file existence
  if (!file) {
    errors.push({
      code: 'FILE_REQUIRED',
      message: 'Archivo es requerido',
      severity: 'error'
    });
    return { isValid: false, errors: Object.freeze(errors) };
  }

  // Check file size
  const maxSizeBytes = SECURITY_CONFIG.FILE_UPLOAD.MAX_SIZE_MB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    errors.push({
      code: 'FILE_TOO_LARGE',
      message: `Archivo demasiado grande. Máximo permitido: ${SECURITY_CONFIG.FILE_UPLOAD.MAX_SIZE_MB}MB`,
      severity: 'error'
    });
  }

  // Minimum file size check (prevent empty files)
  if (file.size < 100) {
    errors.push({
      code: 'FILE_TOO_SMALL',
      message: 'Archivo demasiado pequeño o corrupto',
      severity: 'error'
    });
  }

  // MIME type validation
  const allowedMimeTypes = Object.values(AllowedMimeTypes);
  if (!allowedMimeTypes.includes(file.type as AllowedMimeTypes)) {
    errors.push({
      code: 'INVALID_FILE_TYPE',
      message: `Tipo de archivo no permitido. Permitidos: ${allowedMimeTypes.join(', ')}`,
      severity: 'error'
    });
  }

  // File extension validation (double-check against MIME type)
  const fileExtension = getFileExtension(file.name).toLowerCase();
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.pdf'];
  if (!allowedExtensions.includes(fileExtension)) {
    errors.push({
      code: 'INVALID_FILE_EXTENSION',
      message: `Extensión de archivo no permitida. Permitidas: ${allowedExtensions.join(', ')}`,
      severity: 'error'
    });
  }

  // File name validation (prevent path traversal attacks)
  if (!isValidFileName(file.name)) {
    errors.push({
      code: 'INVALID_FILE_NAME',
      message: 'Nombre de archivo contiene caracteres no válidos',
      severity: 'error'
    });
  }

  // MIME type and extension mismatch check
  if (!isMimeTypeExtensionMatch(file.type, fileExtension)) {
    errors.push({
      code: 'MIME_EXTENSION_MISMATCH',
      message: 'El tipo de archivo no coincide con su extensión',
      severity: 'warning'
    });
  }

  return {
    isValid: errors.length === 0,
    errors: Object.freeze(errors)
  };
}

/**
 * Validates multiple files for batch upload
 */
export function validateMultipleFiles(files: FileList | File[]): {
  readonly isValid: boolean;
  readonly errors: readonly FileValidationError[];
  readonly validFiles: readonly File[];
} {
  const allErrors: FileValidationError[] = [];
  const validFiles: File[] = [];
  const fileArray = Array.from(files);

  // Check total file count
  if (fileArray.length > SECURITY_CONFIG.FILE_UPLOAD.MAX_FILES_PER_REQUEST) {
    allErrors.push({
      code: 'TOO_MANY_FILES',
      message: `Demasiados archivos. Máximo permitido: ${SECURITY_CONFIG.FILE_UPLOAD.MAX_FILES_PER_REQUEST}`,
      severity: 'error'
    });
    return {
      isValid: false,
      errors: Object.freeze(allErrors),
      validFiles: Object.freeze([])
    };
  }

  // Validate each file
  let totalSize = 0;
  for (let i = 0; i < fileArray.length; i++) {
    const file = fileArray[i];
    if (!file) continue; // Skip undefined files
    
    const validation = validateFileUpload(file);
    
    if (validation.isValid) {
      validFiles.push(file);
      totalSize += file.size;
    } else {
      // Add file index to error messages
      validation.errors.forEach(error => {
        allErrors.push({
          ...error,
          message: `Archivo ${i + 1}: ${error.message}`
        });
      });
    }
  }

  // Check total upload size
  const maxTotalSizeBytes = SECURITY_CONFIG.FILE_UPLOAD.MAX_SIZE_MB * 1024 * 1024 * 2; // 2x for multiple files
  if (totalSize > maxTotalSizeBytes) {
    allErrors.push({
      code: 'TOTAL_SIZE_TOO_LARGE',
      message: 'Tamaño total de archivos demasiado grande',
      severity: 'error'
    });
  }

  return {
    isValid: allErrors.length === 0,
    errors: Object.freeze(allErrors),
    validFiles: Object.freeze(validFiles)
  };
}

/**
 * Generates secure file name for upload
 */
export function generateSecureFileName(originalName: string): string {
  const extension = getFileExtension(originalName);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  
  // Remove any path information and special characters
  const safeName = originalName
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/\.+/g, '.')
    .substring(0, 50);
    
  return `${timestamp}_${random}_${safeName}${extension}`;
}

/**
 * Gets file extension from filename
 */
export function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  return lastDot === -1 ? '' : filename.substring(lastDot);
}

/**
 * Validates file name for security
 */
export function isValidFileName(filename: string): boolean {
  // Check for null bytes and control characters
  if (/[\x00-\x1f\x7f]/.test(filename)) {
    return false;
  }

  // Check for path traversal attempts
  if (filename.includes('../') || filename.includes('..\\')) {
    return false;
  }

  // Check for reserved names (Windows)
  const reservedNames = [
    'CON', 'PRN', 'AUX', 'NUL',
    'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
    'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'
  ];
  
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '').toUpperCase();
  if (reservedNames.includes(nameWithoutExt)) {
    return false;
  }

  // Check length
  if (filename.length > 255) {
    return false;
  }

  return true;
}

/**
 * Checks if MIME type matches file extension
 */
export function isMimeTypeExtensionMatch(mimeType: string, extension: string): boolean {
  const mimeExtensionMap: Record<string, string[]> = {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/webp': ['.webp'],
    'application/pdf': ['.pdf']
  };

  const expectedExtensions = mimeExtensionMap[mimeType];
  return expectedExtensions ? expectedExtensions.includes(extension.toLowerCase()) : false;
}

/**
 * Creates a secure FormData object for file upload
 */
export function createSecureFormData(file: File, additionalData?: Record<string, string>): FormData {
  const formData = new FormData();
  
  // Generate secure filename
  const secureFileName = generateSecureFileName(file.name);
  
  // Create new file with secure name
  const secureFile = new File([file], secureFileName, {
    type: file.type,
    lastModified: file.lastModified
  });
  
  formData.append('file', secureFile);
  formData.append('originalName', file.name);
  formData.append('uploadTimestamp', new Date().toISOString());
  
  // Add additional data if provided
  if (additionalData) {
    Object.entries(additionalData).forEach(([key, value]) => {
      // Sanitize additional data
      const sanitizedKey = key.replace(/[^a-zA-Z0-9_]/g, '');
      const sanitizedValue = value.replace(/[<>]/g, '');
      formData.append(sanitizedKey, sanitizedValue);
    });
  }
  
  return formData;
}

/**
 * Calculates file hash for integrity checking
 */
export async function calculateFileHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Validates uploaded file response from server
 */
export function validateFileUploadResponse(response: unknown): response is SecureFileUploadResponse {
  return (
    typeof response === 'object' &&
    response !== null &&
    'url' in response &&
    'filename' in response &&
    'size' in response &&
    'mimeType' in response &&
    'checksum' in response &&
    'uploadedAt' in response &&
    typeof (response as any).url === 'string' &&
    typeof (response as any).filename === 'string' &&
    typeof (response as any).size === 'number' &&
    typeof (response as any).mimeType === 'string' &&
    typeof (response as any).checksum === 'string' &&
    typeof (response as any).uploadedAt === 'string'
  );
}