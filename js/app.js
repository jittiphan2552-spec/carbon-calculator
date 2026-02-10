// ===================================
// Carbon Footprint Calculator
// Main Application Logic
// ===================================

import { db } from './firebase-config.js';
import { collection, addDoc, getDocs, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ===================================
// ค่าคงที่สำหรับการคำนวณ
// อ้างอิงจาก: TGO, กรมควบคุมมลพิษ
// ===================================
const CO2_RATES = {
    // การเดินทาง (kg CO2 ต่อ km)
    transport: {
        'walk': 0,
        'motorcycle': 0.08,
        'car-small': 0.12,
        'car-medium': 0.15,
        'suv': 0.22,
        'bus': 0.04,
        'bts': 0.02
    },
    
    // ไฟฟ้า (kg CO2 ต่อ kWh) - ค่าเฉลี่ยไทย
    electricity: 0.55,
    
    // น้ำ (kg CO2 ต่อ ลบ.ม.)
    water: 0.34,
    
    // อาหาร (kg CO2 ต่อปี)
    diet: {
        'vegan': 730,
        'vegetarian': 1095,
        'mixed': 1825,
        'meat-heavy': 2555
    }
};

// ค่าคงที่อื่นๆ
const AVERAGE_THAI_CO2 = 3500; // kg/ปี
const TREE_ABSORPTION = 20; // kg CO2/ต้น/ปี
const KWH_PER_BAHT = 4.2; // บาทต่อหน่วย (ค่าเฉลี่ย)
const WATER_M3_PER_BAHT = 15; // บาทต่อลูกบาศก์เมตร

// ===================================
// DOM Elements
// ===================================
const form = document.getElementById('carbonForm');
const resultSection = document.getElementById('resultSection');
const btnReset = document.getElementById('btnReset');
const loadingOverlay = document.getElementById('loadingOverlay');

// ===================================
// Mobile Menu Toggle
// ===================================
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    
    if (hamburger && navMenu) {
        // Toggle menu
        hamburger.addEventListener('click', function(e) {
            e.stopPropagation();
            this.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // ปิดเมนูเมื่อกดลิงก์
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
        
        // ปิดเมนูเมื่อกดนอกเมนู
        document.addEventListener('click', function(e) {
            if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }
});

// ===================================
// Event Listeners
// ===================================
if (form) {
    form.addEventListener('submit', handleFormSubmit);
}

if (btnReset) {
    btnReset.addEventListener('click', resetCalculator);
}

// Smooth scroll สำหรับลิงก์
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===================================
// ฟังก์ชันคำนวณ CO2
// ===================================
async function handleFormSubmit(e) {
    e.preventDefault();
    
    // แสดง loading
    showLoading(true);
    
    // ดึงข้อมูลจากฟอร์ม
    const formData = {
        userName: document.getElementById('userName').value || 'ผู้ใช้ไม่ระบุชื่อ',
        vehicleType: document.getElementById('vehicleType').value,
        distance: parseFloat(document.getElementById('distance').value) || 0,
        electricBill: parseFloat(document.getElementById('electricBill').value) || 0,
        householdSize: parseInt(document.getElementById('householdSize').value) || 1,
        waterBill: parseFloat(document.getElementById('waterBill').value) || 0,
        dietType: document.getElementById('dietType').value
    };
    
    // Validate
    if (!formData.vehicleType) {
        alert('กรุณาเลือกประเภทพาหนะ');
        showLoading(false);
        return;
    }
    
    try {
        // คำนวณ CO2 แต่ละหมวด
        const co2Results = calculateCO2(formData);
        
        // แสดงผล
        displayResults(co2Results);
        
        // บันทึกลง Firebase (ถ้ามี)
        if (db) {
            await saveToFirebase(formData, co2Results);
        }
        
        // ซ่อน loading
        showLoading(false);
        
        // เลื่อนไปที่ผลลัพธ์
        setTimeout(() => {
            resultSection.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }, 100);
        
    } catch (error) {
        console.error('เกิดข้อผิดพลาด:', error);
        alert('เกิดข้อผิดพลาดในการคำนวณ กรุณาลองอีกครั้ง');
        showLoading(false);
    }
}

// ===================================
// ฟังก์ชันคำนวณ CO2 หลัก
// ===================================
function calculateCO2(data) {
    // 1. การเดินทาง (ต่อวัน × 365 วัน)
    const transportCO2 = data.distance * CO2_RATES.transport[data.vehicleType] * 365;
    
    // 2. ไฟฟ้า (หารด้วยจำนวนคนในบ้าน)
    const electricKwh = (data.electricBill / KWH_PER_BAHT) * 12; // ต่อปี
    const electricCO2 = (electricKwh * CO2_RATES.electricity) / data.householdSize;
    
    // 3. น้ำ
    const waterM3 = (data.waterBill / WATER_M3_PER_BAHT) * 12; // ต่อปี
    const waterCO2 = (waterM3 * CO2_RATES.water) / data.householdSize;
    
    // 4. อาหาร
    const foodCO2 = CO2_RATES.diet[data.dietType];
    
    // รวมทั้งหมด
    const totalCO2 = transportCO2 + electricCO2 + waterCO2 + foodCO2;
    
    return {
        transport: Math.round(transportCO2),
        electric: Math.round(electricCO2),
        water: Math.round(waterCO2),
        food: Math.round(foodCO2),
        total: Math.round(totalCO2)
    };
}

// ===================================
// แสดงผลลัพธ์
// ===================================
function displayResults(results) {
    // แสดง result section
    resultSection.classList.remove('hidden');
    
    // แสดงค่า CO2 พร้อม animation
    animateNumber('totalCO2', results.total);
    animateNumber('transportCO2', results.transport);
    animateNumber('electricCO2', results.electric);
    animateNumber('waterCO2', results.water);
    animateNumber('foodCO2', results.food);
    
    // คำนวณเปรียบเทียบ
    const percentage = (results.total / AVERAGE_THAI_CO2) * 100;
    const comparisonBar = document.getElementById('comparisonBar');
    const comparisonText = document.getElementById('comparisonText');
    
    // แสดง progress bar แบบ animate
    setTimeout(() => {
        comparisonBar.style.width = Math.min(percentage, 100) + '%';
    }, 300);
    
    // ข้อความเปรียบเทียบ
    if (percentage < 70) {
        comparisonText.textContent = `🎉 ยอดเยี่ยม! คุณปล่อย CO₂ น้อยกว่าค่าเฉลี่ย ${(100-percentage).toFixed(0)}%`;
        comparisonText.style.color = '#27ae60';
        comparisonBar.style.background = 'linear-gradient(90deg, #27ae60, #2ecc71)';
    } else if (percentage < 90) {
        comparisonText.textContent = `👍 ดีมาก คุณปล่อย CO₂ น้อยกว่าค่าเฉลี่ย ${(100-percentage).toFixed(0)}%`;
        comparisonText.style.color = '#2ecc71';
        comparisonBar.style.background = 'linear-gradient(90deg, #2ecc71, #3498db)';
    } else if (percentage < 110) {
        comparisonText.textContent = '📊 ปานกลาง คุณปล่อย CO₂ ใกล้เคียงค่าเฉลี่ย';
        comparisonText.style.color = '#f39c12';
        comparisonBar.style.background = 'linear-gradient(90deg, #f39c12, #e67e22)';
    } else {
        comparisonText.textContent = `⚠️ คุณปล่อย CO₂ สูงกว่าค่าเฉลี่ย ${(percentage-100).toFixed(0)}% ลองดูคำแนะนำด้านล่างนะคะ`;
        comparisonText.style.color = '#e74c3c';
        comparisonBar.style.background = 'linear-gradient(90deg, #e74c3c, #c0392b)';
    }
    
    // จำนวนต้นไม้ที่เทียบเท่า
    const treeCount = Math.ceil(results.total / TREE_ABSORPTION);
    document.getElementById('treeEquiv').textContent = treeCount.toLocaleString();
    
    // สร้างคำแนะนำ
    generateRecommendations(results);
}

// ===================================
// Animate ตัวเลข
// ===================================
function animateNumber(elementId, targetValue) {
    const element = document.getElementById(elementId);
    const duration = 1000; // 1 วินาที
    const steps = 50;
    const increment = targetValue / steps;
    let current = 0;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= targetValue) {
            element.textContent = targetValue.toLocaleString();
            clearInterval(timer);
        } else {
            element.textContent = Math.round(current).toLocaleString();
        }
    }, duration / steps);
}

// ===================================
// สร้างคำแนะนำ
// ===================================
function generateRecommendations(results) {
    const recommendationsList = document.getElementById('recommendationsList');
    const recommendations = [];
    
    // แนะนำตามหมวดที่ CO2 สูง
    if (results.transport > 800) {
        recommendations.push({
            icon: 'fa-bus',
            text: 'ลองเปลี่ยนมาใช้ขนส่งสาธารณะ หรือ carpool ร่วมกับเพื่อนเพื่อลด CO₂ จากการเดินทาง'
        });
    }
    
    if (results.transport > 400 && results.transport <= 800) {
        recommendations.push({
            icon: 'fa-bicycle',
            text: 'สำหรับระยะทางสั้นๆ ลองเดินหรือปั่นจักรยานแทนการใช้รถ'
        });
    }
    
    if (results.electric > 1000) {
        recommendations.push({
            icon: 'fa-lightbulb',
            text: 'ปิดไฟและถอดปลั๊กเครื่องใช้ไฟฟ้าที่ไม่ได้ใช้งาน เปลี่ยนเป็นหลอด LED'
        });
    }
    
    if (results.electric > 600 && results.electric <= 1000) {
        recommendations.push({
            icon: 'fa-thermometer-half',
            text: 'ตั้งอุณหภูมิแอร์ที่ 25-26 องศา และทำความสะอาดแอร์เป็นประจำ'
        });
    }
    
    if (results.food > 2000) {
        recommendations.push({
            icon: 'fa-leaf',
            text: 'ลองลดการกินเนื้อสัตว์ 1-2 มื้อต่อสัปดาห์ เพิ่มผักและผลไม้ในมื้ออาหาร'
        });
    }
    
    if (results.water > 300) {
        recommendations.push({
            icon: 'fa-tint',
            text: 'อาบน้ำให้สั้นลง (5-7 นาที) ปิดก๊อกน้ำขณะแปรงฟัน และซ่อมก๊อกน้ำรั่ว'
        });
    }
    
    // คำแนะนำทั่วไป (แสดงเสมอ)
    recommendations.push({
        icon: 'fa-recycle',
        text: 'แยกขยะรีไซเคิล ลดการใช้พลาสติกแบบใช้ครั้งเดียวทิ้ง นำถุงผ้าไปช้อปปิ้ง'
    });
    
    recommendations.push({
        icon: 'fa-tree',
        text: 'ปลูกต้นไม้รอบบ้าน หรือร่วมบริจาคโครงการปลูกป่าเพื่อดูดซับ CO₂'
    });
    
    if (results.total < AVERAGE_THAI_CO2) {
        recommendations.push({
            icon: 'fa-heart',
            text: 'เยี่ยมมาก! แชร์ความรู้เรื่องการลดคาร์บอนให้กับเพื่อนๆ ด้วยนะคะ'
        });
    }
    
    // สร้าง HTML
    let html = '<ul>';
    recommendations.forEach(rec => {
        html += `
            <li>
                <i class="fas ${rec.icon}"></i>
                <span>${rec.text}</span>
            </li>
        `;
    });
    html += '</ul>';
    
    recommendationsList.innerHTML = html;
}

// ===================================
// บันทึกลง Firebase
// ===================================
async function saveToFirebase(formData, results) {
    if (!db) {
        console.log('Firebase ไม่พร้อมใช้งาน ข้ามการบันทึก');
        return;
    }
    
    try {
        const docRef = await addDoc(collection(db, "carbonRecords"), {
            // ข้อมูลพื้นฐาน
            userName: formData.userName,
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleDateString('th-TH'),
            
            // ข้อมูลที่กรอก
            vehicleType: formData.vehicleType,
            distance: formData.distance,
            electricBill: formData.electricBill,
            householdSize: formData.householdSize,
            waterBill: formData.waterBill,
            dietType: formData.dietType,
            
            // ผลลัพธ์
            co2Transport: results.transport,
            co2Electric: results.electric,
            co2Water: results.water,
            co2Food: results.food,
            co2Total: results.total,
            
            // เพิ่มข้อมูลเพื่อการวิเคราะห์
            comparedToAverage: parseFloat(((results.total / AVERAGE_THAI_CO2) * 100).toFixed(2)),
            belowAverage: results.total < AVERAGE_THAI_CO2
        });
        
        console.log("✅ บันทึกสำเร็จ! Document ID:", docRef.id);
    } catch (error) {
        console.error("❌ เกิดข้อผิดพลาดในการบันทึก:", error);
        // ไม่ alert เพื่อไม่ให้รบกวนผู้ใช้
    }
}

// ===================================
// Reset Calculator
// ===================================
function resetCalculator() {
    form.reset();
    resultSection.classList.add('hidden');
    
    // เลื่อนกลับไปด้านบน
    window.scrollTo({ 
        top: 0, 
        behavior: 'smooth' 
    });
}

// ===================================
// Show/Hide Loading
// ===================================
function showLoading(show) {
    if (loadingOverlay) {
        if (show) {
            loadingOverlay.classList.remove('hidden');
        } else {
            loadingOverlay.classList.add('hidden');
        }
    }
}

// ===================================
// เริ่มต้นแอพ
// ===================================
console.log("🌍 Carbon Calculator พร้อมใช้งาน!");
console.log("ℹ️ เวอร์ชัน 1.0.0");