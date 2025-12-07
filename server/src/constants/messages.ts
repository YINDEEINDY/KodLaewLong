/**
 * Centralized error and success messages
 * Supports both Thai and English for future i18n
 */

export const MESSAGES = {
  // Error messages
  ERRORS: {
    // General
    INTERNAL_ERROR: 'เกิดข้อผิดพลาดภายในระบบ',
    INVALID_REQUEST: 'คำขอไม่ถูกต้อง',
    NOT_FOUND: 'ไม่พบข้อมูลที่ต้องการ',
    UNAUTHORIZED: 'กรุณาเข้าสู่ระบบ',
    FORBIDDEN: 'ไม่มีสิทธิ์เข้าถึง',
    RATE_LIMITED: 'คำขอมากเกินไป กรุณารอสักครู่',

    // Apps
    APP_NOT_FOUND: 'ไม่พบแอปพลิเคชันที่ต้องการ',
    APPS_FETCH_FAILED: 'เกิดข้อผิดพลาดในการดึงข้อมูลแอป',
    SOME_APPS_NOT_FOUND: 'ไม่พบบางแอปพลิเคชันที่เลือก',

    // Generate
    NO_APPS_SELECTED: 'ต้องเลือกอย่างน้อย 1 แอปพลิเคชัน',
    TOO_MANY_APPS: 'เลือกได้สูงสุด {max} แอปพลิเคชัน',
    INVALID_APP_IDS: 'รหัสแอปพลิเคชันไม่ถูกต้อง',
    GENERATE_FAILED: 'เกิดข้อผิดพลาดในการสร้าง installer',
    INVALID_BUILD_ID: 'รหัสไฟล์ไม่ถูกต้อง',
    BUILD_NOT_FOUND: 'ไม่พบไฟล์ที่ต้องการดาวน์โหลด',
    ARCHIVE_ERROR: 'เกิดข้อผิดพลาดในการสร้างไฟล์',

    // Selections
    SELECTIONS_FETCH_FAILED: 'เกิดข้อผิดพลาดในการดึงข้อมูลการเลือก',
    SELECTIONS_SAVE_FAILED: 'เกิดข้อผิดพลาดในการบันทึกการเลือก',
    INVALID_APP_IDS_FORMAT: 'รูปแบบข้อมูลไม่ถูกต้อง',

    // Admin
    ADMIN_ONLY: 'เฉพาะผู้ดูแลระบบเท่านั้น',
    CATEGORY_CREATE_FAILED: 'เกิดข้อผิดพลาดในการสร้างหมวดหมู่',
    CATEGORY_UPDATE_FAILED: 'เกิดข้อผิดพลาดในการอัพเดทหมวดหมู่',
    CATEGORY_DELETE_FAILED: 'เกิดข้อผิดพลาดในการลบหมวดหมู่',
    APP_CREATE_FAILED: 'เกิดข้อผิดพลาดในการสร้างแอป',
    APP_UPDATE_FAILED: 'เกิดข้อผิดพลาดในการอัพเดทแอป',
    APP_DELETE_FAILED: 'เกิดข้อผิดพลาดในการลบแอป',
    USER_UPDATE_FAILED: 'เกิดข้อผิดพลาดในการอัพเดทผู้ใช้',

    // Changelogs
    CHANGELOG_FETCH_FAILED: 'เกิดข้อผิดพลาดในการดึงข้อมูล changelog',
    CHANGELOG_CREATE_FAILED: 'เกิดข้อผิดพลาดในการสร้าง changelog',
    CHANGELOG_UPDATE_FAILED: 'เกิดข้อผิดพลาดในการอัพเดท changelog',
    CHANGELOG_DELETE_FAILED: 'เกิดข้อผิดพลาดในการลบ changelog',
  },

  // Success messages
  SUCCESS: {
    CATEGORY_CREATED: 'สร้างหมวดหมู่สำเร็จ',
    CATEGORY_UPDATED: 'อัพเดทหมวดหมู่สำเร็จ',
    CATEGORY_DELETED: 'ลบหมวดหมู่สำเร็จ',
    APP_CREATED: 'สร้างแอปสำเร็จ',
    APP_UPDATED: 'อัพเดทแอปสำเร็จ',
    APP_DELETED: 'ลบแอปสำเร็จ',
    USER_UPDATED: 'อัพเดทผู้ใช้สำเร็จ',
    SELECTIONS_SAVED: 'บันทึกการเลือกสำเร็จ',
    SELECTION_ADDED: 'เพิ่มการเลือกสำเร็จ',
    SELECTION_REMOVED: 'ลบการเลือกสำเร็จ',
    SELECTIONS_CLEARED: 'ล้างการเลือกทั้งหมดสำเร็จ',
    CHANGELOG_CREATED: 'สร้าง changelog สำเร็จ',
    CHANGELOG_UPDATED: 'อัพเดท changelog สำเร็จ',
    CHANGELOG_DELETED: 'ลบ changelog สำเร็จ',
  },
} as const;

// Type helper for error messages
export type ErrorMessageKey = keyof typeof MESSAGES.ERRORS;
export type SuccessMessageKey = keyof typeof MESSAGES.SUCCESS;

// Helper function to get message with interpolation
export function getMessage(key: ErrorMessageKey, params?: Record<string, string | number>): string {
  let message: string = MESSAGES.ERRORS[key];
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      message = message.replace(`{${k}}`, String(v));
    });
  }
  return message;
}
