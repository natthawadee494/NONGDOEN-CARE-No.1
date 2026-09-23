# NSW CARE AutoSave FIX

เวอร์ชันนี้แก้ระบบบันทึกข้อมูลให้เชื่อม Google Sheets อัตโนมัติ

Apps Script:
https://script.google.com/macros/s/AKfycbyjRXtsUKZprrFkCM9Z9R0Iffw137qzKL8y10Pz19SaeoQ1dwKwVwtVW8dFNu5yhp3Y/exec

ขั้นตอน:
1. นำ `google-apps-script/Code.gs` ไปวางใน Apps Script
2. Run `setupNSWCare`
3. Run `testNSWCareWrite`
4. Deploy เป็น Web app และสร้าง New version
5. Push โปรเจกต์ชุดนี้ขึ้น GitHub
6. ให้ Vercel deploy ใหม่
7. เปิดเว็บแล้วข้อมูลจะ autosave ไป Google Sheets

Spreadsheet ID ถูกกำหนดไว้ใน Code.gs แล้ว
