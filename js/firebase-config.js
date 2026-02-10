// ===================================
// Firebase Configuration
// แก้ไขข้อมูลตรงนี้ให้ตรงกับ Firebase Project ของคุณ
// ===================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ⚠️ สำคัญ: เปลี่ยนค่าเหล่านี้ให้ตรงกับโปรเจคของคุณ
// คัดลอกจาก Firebase Console → Project Settings → Your apps
const firebaseConfig = {
  apiKey: "AIzaSyCQ8GVYPqY968yA4AM0HIEfIOVKCXZLPEM",
  authDomain: "carbon-calculator-4b0ae.firebaseapp.com",
  projectId: "carbon-calculator-4b0ae",
  storageBucket: "carbon-calculator-4b0ae.firebasestorage.app",
  messagingSenderId: "341026119037",
  appId: "1:341026119037:web:e5b47219cee421dacb8014",
  measurementId: "G-0QGXFRM2XS"
};

// เริ่มต้น Firebase
let app;
let db;

try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log("✅ Firebase เชื่อมต่อสำเร็จ!");
} catch (error) {
    console.error("❌ Firebase เชื่อมต่อล้มเหลว:", error);
}

// Export เพื่อใช้ในไฟล์อื่น
export { db };