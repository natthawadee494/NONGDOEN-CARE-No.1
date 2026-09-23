export type TabType = 'home' | 'student-portal' | 'seating' | 'grading' | 'homework' | 'students' | 'tools' | 'sheets' | 'profile';
export type UserRole = 'teacher' | 'student';
export type ThemeColor = 'rose' | 'sakura' | 'lavender' | 'mint' | 'sky' | 'official';
export interface User { id:string; role:UserRole; login?:string; email?:string; prefix:string; firstName:string; lastName:string; nickname?:string; room?:string; number?:number; phone?:string; bio?:string; exp?:number; avatarUrl?:string; avatarSize?:number; themeColor?:ThemeColor; }
export type StudentStatus = 'normal'|'risk'|'special_care';
export interface Student { id:string; prefix:string; firstName:string; lastName:string; nickname:string; room:string; number:number; phone?:string; email?:string; status:StudentStatus; exp:number; avatarUrl?:string; notes?:string; }
export type EvalType = 'score'|'pass_fail'|'check';
export type AssignmentStatus = 'open'|'closed';
export interface Assignment { id:string; room:string; title:string; subject:string; description:string; dueDate:string; evalType:EvalType; maxScore:number; imageUrl?:string; teacherId?:string; createdAt:string; status:AssignmentStatus; }
export type SubmissionStatus = 'submitted'|'graded'|'late'|'pending';
export interface Submission { id:string; assignmentId:string; studentId:string; studentName?:string; room?:string; submittedAt:string; status:SubmissionStatus; score?:number; note?:string; feedback?:string; imageUrl?:string; fileUrl?:string; }
export type AttendanceStatus = 'มา'|'สาย'|'ลา'|'ขาด';
export interface AttendanceRecord { id:string; date:string; studentId:string; room:string; status:AttendanceStatus; updatedAt:string; updatedBy?:string; }
export interface Subject { id:string; name:string; groupName:string; }
export interface GoogleSheetsConfig { sheetUrl:string; sheetName:string; lastSyncedAt?:string; autoSync:boolean; isConnected:boolean; statusMsg?:string; }
export interface AppState { currentUser:User|null; currentRoom:string; activeTab:TabType; soundEnabled:boolean; rooms:string[]; students:Student[]; assignments:Assignment[]; submissions:Submission[]; attendance:AttendanceRecord[]; subjects:Subject[]; users:User[]; sheetsConfig:GoogleSheetsConfig; }
