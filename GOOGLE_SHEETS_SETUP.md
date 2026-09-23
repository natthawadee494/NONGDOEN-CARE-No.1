# NSW CARE — Google Sheets Auto Save

ไฟล์ชุดนี้ตั้งค่า Apps Script URL ใหม่ไว้แล้ว:

https://script.google.com/macros/s/AKfycbyjRXtsUKZprrFkCM9Z9R0Iffw137qzKL8y10Pz19SaeoQ1dwKwVwtVW8dFNu5yhp3Y/exec

และตั้งค่า Spreadsheet ID ที่ใช้เก็บข้อมูลไว้แล้วใน `google-apps-script/Code.gs`

## ทำครั้งเดียวใน Google Apps Script

1. เปิด Apps Script โปรเจกต์ที่ใช้กับ NSW CARE
2. แทนที่ `Code.gs` ด้วยไฟล์ในโฟลเดอร์ `google-apps-script`
3. กด Save
4. เลือกฟังก์ชัน `setupNSWCare` แล้วกด Run
5. อนุญาตสิทธิ์ Google Sheets เมื่อ Google ขอ
6. เลือกฟังก์ชัน `testNSWCareWrite` แล้วกด Run
7. กลับไปที่ Google Sheet แล้วตรวจสอบชีต `AppState` ต้องมีข้อมูลแถวที่ 2
8. ไปที่ Deploy → Manage deployments → Edit → New version → Deploy
9. ตั้ง Execute as: Me
10. ตั้ง Who has access: Anyone (หรือสิทธิ์ที่องค์กรของคุณอนุญาต)
11. ใช้ URL `/exec` ที่ได้ใน `src/utils/cloudSync.ts`

## ฝั่งเว็บไซต์

โค้ดจะ:
- โหลดข้อมูลจาก Google Sheets เมื่อเปิดเว็บ
- บันทึก AppState ลง Google Sheets อัตโนมัติหลังข้อมูลในระบบเปลี่ยน
- เก็บ Users, Students, Assignments, Submissions, Attendance และ Subjects
- มี localStorage เป็นตัวสำรองในเครื่อง

ไม่ต้องใส่ URL ใหม่เองในโค้ด เพราะ ZIP นี้ใส่ไว้ให้แล้ว

## ทดสอบ API

เปิด:

https://script.google.com/macros/s/AKfycbyjRXtsUKZprrFkCM9Z9R0Iffw137qzKL8y10Pz19SaeoQ1dwKwVwtVW8dFNu5yhp3Y/exec?action=ping

และ:

https://script.google.com/macros/s/AKfycbyjRXtsUKZprrFkCM9Z9R0Iffw137qzKL8y10Pz19SaeoQ1dwKwVwtVW8dFNu5yhp3Y/exec?action=getState

ถ้า `ping` ตอบ `success: true` แปลว่า Web App ทำงาน
ถ้า `getState` ยังไม่มีข้อมูล หลังเปิดเว็บครั้งแรกระบบจะสร้าง `AppState` ให้อัตโนมัติ

## สำคัญ

หลังแก้ `Code.gs` ทุกครั้ง ต้องสร้าง **New version** ใน Manage deployments ไม่เช่นนั้น `/exec` อาจยังใช้โค้ดเวอร์ชันเก่า
