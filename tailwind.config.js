/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          green: '#0E5C4A',    // เขียวไม้ไผ่
          gold: '#D99A2B',     // ทองกระเทียมเจียว
          red: '#C0392B',      // แดงจิ๊กโฉ่ว
          cream: '#F5F1E8',    // พื้นนวล
          pink: '#F7B5A6',     // แก้มชมพู
          dark: '#1C2C28',     // สีเขียวเข้มสำหรับข้อความหลัก
        },
        mystery: {
          purple: '#6B4E9E',   // สีม่วงแยกโหมด Mystery Shopper
          light: '#F3E8FF',
        }
      },
      fontFamily: {
        sans: ['"Sarabun"', '"Noto Sans Thai"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
