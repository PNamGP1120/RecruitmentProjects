// src/utils/generateSlug.js

export const generateSlug = (text) => {
  return text
    .toLowerCase() // Chuyển tất cả ký tự thành chữ thường
    .replace(/\s+/g, '-') // Thay thế khoảng trắng bằng dấu gạch nối
    .replace(/[^\w\-]+/g, '') // Loại bỏ ký tự đặc biệt
    .replace(/\-\-+/g, '-') // Thay thế nhiều dấu gạch nối liên tiếp bằng một dấu
    .trim(); // Loại bỏ dấu gạch nối ở đầu và cuối
};
