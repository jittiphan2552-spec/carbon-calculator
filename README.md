# 🌍 Carbon Footprint Calculator

โปรเจคคำนวณคาร์บอนฟุตพริ้นท์ส่วนบุคคล เพื่อช่วยให้ตระหนักถึงผลกระทบที่เรามีต่อสิ่งแวดล้อม

## 📚 แรงบันดาลใจ

จากปัญหาโลกร้อนที่ทวีความรุนแรงขึ้นทุกปี โปรเจคนี้จึงถูกสร้างขึ้นเพื่อให้ผู้คนสามารถคำนวณและติดตามปริมาณก๊าซเรือนกระจกที่ตนเองปล่อยออกมา พร้อมทั้งได้รับคำแนะนำในการลดคาร์บอนฟุตพริ้นท์

## ✨ ฟีเจอร์

- 🚗 คำนวณ CO₂ จากการเดินทาง (รถยนต์ มอเตอร์ไซค์ รถเมล์ BTS)
- ⚡ คำนวณจากการใช้ไฟฟ้า
- 💧 คำนวณจากการใช้น้ำ
- 🍽️ คำนวณจากรูปแบบการบริโภคอาหาร
- 📊 เปรียบเทียบกับค่าเฉลี่ยคนไทย
- 💡 คำแนะนำการลดคาร์บอนแบบเฉพาะบุคคล
- 📈 แสดงสถิติและกราฟ
- 📱 รองรับการใช้งานบนมือถือ (Responsive)

## 🛠️ เทคโนโลยีที่ใช้

- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **Database:** Firebase Firestore
- **Charts:** Chart.js
- **Icons:** Font Awesome
- **Fonts:** Google Fonts (Prompt)

## 📦 การติดตั้ง

### 1. Clone โปรเจค
```bash
git clone https://github.com/yourusername/carbon-calculator.git
cd carbon-calculator
```

### 2. ตั้งค่า Firebase
1. สร้างโปรเจคใน [Firebase Console](https://console.firebase.google.com)
2. เปิดใช้งาน Firestore Database
3. คัดลอก Configuration
4. แก้ไขไฟล์ `js/firebase-config.js`

### 3. เปิดด้วย Live Server
- ใช้ VS Code Extension: Live Server
- หรือเปิด `index.html` ในเบราว์เซอร์

## 🚀 การ Deploy

### Deploy ด้วย Netlify
```bash
# Drag & Drop โฟลเดอร์ทั้งหมดลงใน Netlify
```

### Deploy ด้วย Firebase Hosting
```bash
firebase init hosting
firebase deploy
```

## 📖 วิธีใช้งาน

1. เปิดเว็บไซต์
2. กรอกข้อมูลการใช้งานในแต่ละหมวด
3. กดปุ่ม "คำนวณเลย"
4. ดูผลลัพธ์และคำแนะนำ

## 🎓 ข้อมูลอ้างอิง

- [องค์การบริหารจัดการก๊าซเรือนกระจก (TGO)](https://www.tgo.or.th)
- [กรมควบคุมมลพิษ](https://www.pcd.go.th)
- [IPCC Guidelines](https://www.ipcc.ch)
- [Carbon Trust](https://www.carbontrust.com)

## 📊 สถิติโปรเจค

- ⭐ Stars: 0
- 🍴 Forks: 0
- 🐛 Issues: 0

## 👨‍💻 ผู้พัฒนา

**ชื่อของคุณ**
- 📧 Email: your.email@example.com
- 🌐 Website: yourwebsite.com
- 📱 GitHub: [@yourusername](https://github.com/yourusername)

## 📄 License

MIT License - ใช้งานได้อย่างอิสระ

## 🙏 ขอบคุณ

- ขอบคุณ Firebase สำหรับ backend service ฟรี
- ขอบคุณ Chart.js สำหรับ library กราฟ
- ขอบคุณทุกคนที่ใช้งานและให้ feedback

---

⭐ ถ้าชอบโปรเจคนี้ กด Star ได้เลยนะคะ!
