import React, { useState, useEffect } from 'react';
import {
  TabType,
  AppState,
  User,
  Student,
  AttendanceStatus,
  Assignment,
  GoogleSheetsConfig,
} from './types';
import {
  getInitialAppState,
  saveAppState,
  DEMO_TEACHER,
  DEMO_STUDENT,
  getDefaultInitialState,
} from './utils/storage';
import { TopBar } from './components/TopBar';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';
import { LandingPage } from './components/LandingPage';
import { HomeTab } from './components/HomeTab';
import { StudentPortalTab } from './components/StudentPortalTab';
import { SeatingTab } from './components/SeatingTab';
import { GradingTab } from './components/GradingTab';
import { HomeworkTab } from './components/HomeworkTab';
import { StudentsTab } from './components/StudentsTab';
import { TeacherToolsTab } from './components/TeacherToolsTab';
import { GoogleSheetsTab } from './components/GoogleSheetsTab';
import { ProfileTab } from './components/ProfileTab';
import { LoginModal } from './components/LoginModal';
import { RegisterModal } from './components/RegisterModal';
import { StudentDetailModal } from './components/StudentDetailModal';
import { LineModal } from './components/LineModal';
import { ImageViewerModal } from './components/ImageViewerModal';
import { SchoolMarchModal } from './components/SchoolMarchModal';
import { playClick, playSuccess, setGlobalAudioEnabled } from './utils/audio';
import { loadCloudState, saveCloudState, logCloudEvent } from './utils/cloudSync';

export default function App() {
  const [appState, setAppState] = useState<AppState>(() => getInitialAppState());
  const [cloudReady, setCloudReady] = useState(false);

  // Mobile drawer state (3 ขีด / Hamburger menu)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3000);
  };

  // Modals state
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [registerRole, setRegisterRole] = useState<'teacher' | 'student'>('teacher');
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<Student | null>(null);
  const [isLineModalOpen, setIsLineModalOpen] = useState(false);
  const [isMarchModalOpen, setIsMarchModalOpen] = useState(false);
  const [imageViewerState, setImageViewerState] = useState<{
    isOpen: boolean;
    url: string | null;
    caption?: string;
  }>({
    isOpen: false,
    url: null,
    caption: '',
  });

  // Load shared cloud data once, then persist every meaningful app-state change.
  // currentUser / activeTab remain browser-local so one user's session never
  // becomes the session for every other visitor.
  useEffect(() => {
    let alive = true;

    (async () => {
      const remote = await loadCloudState();

      if (!alive) return;

      if (remote) {
        setAppState((prev) => ({
          ...prev,
          ...remote,
          currentUser: prev.currentUser,
          activeTab: prev.activeTab,
          currentRoom: prev.currentRoom || remote.currentRoom || 'ป.1',
        }));
      }

      setCloudReady(true);
    })();

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    saveAppState(appState);

    if (!cloudReady) return;

    const timer = window.setTimeout(() => {
      void saveCloudState(appState);
    }, 500);

    return () => window.clearTimeout(timer);
  }, [appState, cloudReady]);

  // Sync sound setting
  useEffect(() => {
    setGlobalAudioEnabled(appState.soundEnabled);
  }, [appState.soundEnabled]);

  // Safeguard role tabs: if student, can only view home, student-portal, profile
  useEffect(() => {
    if (
      appState.currentUser?.role === 'student' &&
      appState.activeTab !== 'home' &&
      appState.activeTab !== 'student-portal' &&
      appState.activeTab !== 'profile'
    ) {
      setAppState((prev) => ({ ...prev, activeTab: 'home' }));
    }
  }, [appState.currentUser?.role, appState.activeTab]);

  const todayDate = new Date().toISOString().slice(0, 10);

  // Tab changing
  const handleTabChange = (tab: string) => {
    playClick();
    setAppState((prev) => ({ ...prev, activeTab: tab as TabType }));
    setIsMobileSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Room changing
  const handleRoomChange = (room: string) => {
    if (appState.currentUser?.role === 'student') {
      showToast('นักเรียนจะดูได้เฉพาะห้องเรียนของตนเองเท่านั้น');
      return;
    }
    playClick();
    setAppState((prev) => ({ ...prev, currentRoom: room }));
    showToast(`เปลี่ยนเป็นชั้น ${room} แล้ว`);
  };

  // Quick Demo Teacher
  const handleQuickDemoTeacher = () => {
    playSuccess();
    setAppState((prev) => ({
      ...prev,
      currentUser: DEMO_TEACHER,
      activeTab: 'home',
    }));
    showToast('เข้าสู่ระบบในฐานะ ครูแคร์ (ทดลองใช้)');
  };

  // Quick Demo Student
  const handleQuickDemoStudent = () => {
    playSuccess();
    setAppState((prev) => ({
      ...prev,
      currentUser: DEMO_STUDENT,
      currentRoom: DEMO_STUDENT.room || 'ป.1',
      activeTab: 'student-portal',
    }));
    showToast('เข้าสู่ระบบในฐานะ น้องเดิ่น (ทดลองใช้)');
  };

  // Switch role quick toggle
  const handleSwitchRole = (role: 'teacher' | 'student') => {
    playSuccess();
    if (role === 'teacher') {
      setAppState((prev) => ({
        ...prev,
        currentUser: DEMO_TEACHER,
        activeTab: 'home',
      }));
      showToast('สลับเข้าสู่ระบบ: ครูแคร์');
    } else {
      setAppState((prev) => ({
        ...prev,
        currentUser: DEMO_STUDENT,
        currentRoom: DEMO_STUDENT.room || 'ป.1',
        activeTab: 'student-portal',
      }));
      showToast('สลับเข้าสู่ระบบ: น้องเดิ่น');
    }
  };

  // Login handler
  const handleLogin = (user: User) => {
    setAppState((prev) => {
      const exists = prev.users.some((u) => u.id === user.id);
      return {
        ...prev,
        currentUser: user,
        currentRoom: user.role === 'student' && user.room ? user.room : prev.currentRoom,
        users: exists ? prev.users : [...prev.users, user],
        activeTab: user.role === 'student' ? 'student-portal' : 'home',
      };
    });
    setIsLoginModalOpen(false);
    void logCloudEvent('LOGIN', user, { source: 'web' });
    showToast(`ยินดีต้อนรับ ${user.prefix || ''}${user.firstName}`);
  };

  // Register handler
  const handleRegister = (user: User) => {
    setAppState((prev) => {
      const nextUsers = [...prev.users, user];
      let nextStudents = [...prev.students];
      if (user.role === 'student') {
        const studentExists = nextStudents.some((s) => s.id === user.id);
        if (!studentExists) {
          nextStudents.push({
            id: user.id,
            prefix: user.prefix || 'เด็กชาย',
            firstName: user.firstName,
            lastName: user.lastName,
            nickname: user.nickname || user.firstName,
            room: user.room || 'ป.1',
            number: user.number || 1,
            phone: user.phone || '0910610997',
            email: user.email,
            status: 'normal',
            exp: 50,
          });
        }
      }
      return {
        ...prev,
        currentUser: user,
        currentRoom: user.role === 'student' && user.room ? user.room : prev.currentRoom,
        users: nextUsers,
        students: nextStudents,
        activeTab: user.role === 'student' ? 'student-portal' : 'home',
      };
    });
    setIsRegisterModalOpen(false);
    void logCloudEvent('REGISTER', user, { source: 'web' });
    showToast(`ลงทะเบียนสำเร็จ ยินดีต้อนรับ ${user.prefix || ''}${user.firstName}`);
  };

  // Logout handler
  const handleLogout = () => {
    playClick();
    const user = appState.currentUser;
    setAppState((prev) => ({
      ...prev,
      currentUser: null,
    }));
    void logCloudEvent('LOGOUT', user, { source: 'web' });
    setIsLoginModalOpen(false);
    showToast('ออกจากระบบเรียบร้อย');
  };

  // Open register with preset role
  const handleOpenRegister = (rolePreset: 'teacher' | 'student') => {
    setRegisterRole(rolePreset);
    setIsLoginModalOpen(false);
    setIsRegisterModalOpen(true);
  };

  // Attendance update
  const handleUpdateAttendance = (
    studentId: string,
    room: string,
    status: AttendanceStatus,
    date: string
  ) => {
    setAppState((prev) => {
      const existingIdx = prev.attendance.findIndex(
        (a) =>
          a.studentId === studentId &&
          a.room === room &&
          a.date === date
      );
      let updatedAttendance = [...prev.attendance];
      if (existingIdx >= 0) {
        updatedAttendance[existingIdx] = {
          ...updatedAttendance[existingIdx],
          status,
          updatedAt: new Date().toISOString(),
        };
      } else {
        updatedAttendance.push({
          id: `att-${studentId}-${date}`,
          date,
          studentId,
          room,
          status,
          updatedAt: new Date().toISOString(),
          updatedBy: prev.currentUser?.firstName || 'คุณครู',
        });
      }
      return { ...prev, attendance: updatedAttendance };
    });
  };

  // Mark all present
  const handleMarkAllPresent = (room: string, date: string) => {
    setAppState((prev) => {
      const roomStudents = prev.students.filter((s) => s.room === room);
      const otherAttendance = prev.attendance.filter(
        (a) => a.room !== room || a.date !== date
      );
      const newAttendance = roomStudents.map((s) => ({
        id: `att-${s.id}-${date}`,
        date,
        studentId: s.id,
        room,
        status: 'มา' as AttendanceStatus,
        updatedAt: new Date().toISOString(),
        updatedBy: prev.currentUser?.firstName || 'คุณครู',
      }));
      return {
        ...prev,
        attendance: [...otherAttendance, ...newAttendance],
      };
    });
    showToast(`บันทึกการมาเรียนครบทุกคนในชั้น ${room} แล้ว`);
  };

  // Reward EXP
  const handleRewardExp = (studentId: string, expAmount: number) => {
    setAppState((prev) => ({
      ...prev,
      students: prev.students.map((s) =>
        s.id === studentId ? { ...s, exp: (s.exp || 0) + expAmount } : s
      ),
    }));
    showToast(`เพิ่ม +${expAmount} EXP คะแนนความดีแล้ว!`);
  };

  // Add Assignment
  const handleAddAssignment = (asg: Assignment) => {
    setAppState((prev) => ({
      ...prev,
      assignments: [asg, ...prev.assignments],
    }));
    showToast(`สั่งการบ้าน "${asg.title}" สำเร็จ`);
  };

  // Grade Submission
  const handleGradeSubmission = (
    assignmentId: string,
    studentId: string,
    score: number | undefined,
    feedback: string
  ) => {
    setAppState((prev) => {
      const idx = prev.submissions.findIndex(
        (sub) => sub.assignmentId === assignmentId && sub.studentId === studentId
      );
      let updatedSubs = [...prev.submissions];
      if (idx >= 0) {
        updatedSubs[idx] = {
          ...updatedSubs[idx],
          score: score !== undefined ? score : 0,
          feedback,
          status: 'graded',
        };
      } else {
        updatedSubs.push({
          id: `sub-${Date.now()}-${studentId}`,
          assignmentId,
          studentId,
          score: score !== undefined ? score : 0,
          feedback,
          submittedAt: new Date().toISOString(),
          status: 'graded',
        });
      }
      return { ...prev, submissions: updatedSubs };
    });
  };

  // Submit Homework by Student
  const handleSubmitHomework = (
    assignmentId: string,
    studentId: string,
    fileUrl?: string,
    note?: string
  ) => {
    setAppState((prev) => {
      const newSub = {
        id: `sub-${Date.now()}-${studentId}`,
        assignmentId,
        studentId,
        fileUrl,
        note: note || 'กรณีส่งแล้ว',
        submittedAt: new Date().toISOString(),
        status: 'submitted' as const,
      };
      return {
        ...prev,
        submissions: [
          newSub,
          ...prev.submissions.filter(
            (s) => s.assignmentId !== assignmentId || s.studentId !== studentId
          ),
        ],
      };
    });
    showToast('บันทึกส่งการบ้านเรียบร้อยแล้ว!');
  };

  // Toggle Homework submission by student or teacher
  const handleToggleSubmission = (
    assignmentId: string,
    studentId: string,
    isSubmitted: boolean,
    fileUrl?: string,
    note?: string
  ) => {
    setAppState((prev) => {
      if (!isSubmitted) {
        return {
          ...prev,
          submissions: prev.submissions.filter(
            (s) => s.assignmentId !== assignmentId || s.studentId !== studentId
          ),
        };
      }
      const newSub = {
        id: `sub-${Date.now()}-${studentId}`,
        assignmentId,
        studentId,
        fileUrl,
        note: note || 'กรณีส่งแล้ว',
        submittedAt: new Date().toISOString(),
        status: 'submitted' as const,
      };
      return {
        ...prev,
        submissions: [
          newSub,
          ...prev.submissions.filter(
            (s) => s.assignmentId !== assignmentId || s.studentId !== studentId
          ),
        ],
      };
    });
    showToast(isSubmitted ? 'บันทึกแล้ว: ส่งแล้ว ✓' : 'ยกเลิกการส่งการบ้านแล้ว');
  };

  // View image in modal
  const handleViewImage = (url: string, caption?: string) => {
    setImageViewerState({
      isOpen: true,
      url,
      caption,
    });
  };

  // Add Student
  const handleAddStudent = (std: Student) => {
    setAppState((prev) => ({
      ...prev,
      students: [...prev.students, std],
    }));
    showToast(`เพิ่ม ${std.prefix}${std.firstName} เรียบร้อยแล้ว`);
  };

  // Update Student
  const handleUpdateStudent = (std: Student) => {
    setAppState((prev) => ({
      ...prev,
      students: prev.students.map((s) => (s.id === std.id ? std : s)),
    }));
    showToast('บันทึกการแก้ไขข้อมูลนักเรียนแล้ว');
  };

  // Delete Student
  const handleDeleteStudent = (id: string) => {
    setAppState((prev) => ({
      ...prev,
      students: prev.students.filter((s) => s.id !== id),
      attendance: prev.attendance.filter((a) => a.studentId !== id),
      submissions: prev.submissions.filter((s) => s.studentId !== id),
    }));
    if (selectedStudentForDetail?.id === id) {
      setSelectedStudentForDetail(null);
    }
    showToast('ลบข้อมูลนักเรียนออกจากระบบแล้ว');
  };

  // Clear room students
  const handleClearRoomStudents = (room: string) => {
    setAppState((prev) => ({
      ...prev,
      students: prev.students.filter((s) => s.room !== room),
      attendance: prev.attendance.filter((a) => a.room !== room),
    }));
    showToast(`ล้างข้อมูลนักเรียนชั้น ${room} เรียบร้อยแล้ว`);
  };

  // Google Sheets Config update
  const handleUpdateSheetsConfig = (config: GoogleSheetsConfig) => {
    setAppState((prev) => ({
      ...prev,
      sheetsConfig: config,
    }));
    showToast('บันทึกการตั้งค่า Google Sheets แล้ว');
  };

  // Google Sheets Sync Assignments
  const handleSyncAssignments = (fetched: Assignment[]) => {
    setAppState((prev) => {
      const existingIds = new Set(prev.assignments.map((a) => a.id));
      const newItems = fetched.filter((f) => !existingIds.has(f.id));
      return {
        ...prev,
        assignments: [...newItems, ...prev.assignments],
      };
    });
    showToast(`ซิงค์ข้อมูลการบ้านแล้ว ${fetched.length} รายการ`);
  };

  // Profile update
  const handleUpdateUser = (updated: Partial<User>) => {
    if (!appState.currentUser) return;
    const nextUser = { ...appState.currentUser, ...updated };
    setAppState((prev) => ({
      ...prev,
      currentUser: nextUser,
      users: prev.users.map((u) => (u.id === nextUser.id ? nextUser : u)),
    }));
    showToast('บันทึกข้อมูลส่วนตัวเรียบร้อย');
  };

  // Reset default data
  const handleResetDefaultData = () => {
    if (window.confirm('คุณต้องการรีเซ็ตข้อมูลทั้งหมดกลับเป็นค่าเริ่มต้นหรือไม่?')) {
      const initial = getDefaultInitialState();
      setAppState(initial);
      showToast('รีเซ็ตข้อมูลทั้งหมดกลับเป็นค่าเริ่มต้นแล้ว');
    }
  };

  // Import backup
  const handleImportBackup = (state: AppState) => {
    setAppState(state);
    showToast('นำเข้าข้อมูลสำรองสำเร็จ!');
  };

  // 1. Unauthenticated landing view (exact 100% clone of original landing page!)
  if (!appState.currentUser) {
    return (
      <>
        <LandingPage
          onLogin={handleLogin}
          onRegister={handleRegister}
          onQuickDemoTeacher={handleQuickDemoTeacher}
          onQuickDemoStudent={handleQuickDemoStudent}
          existingStudents={appState.students}
        />

        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-2 animate-bounce">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <span>{toastMessage}</span>
          </div>
        )}
      </>
    );
  }

  // 2. Authenticated Main Application Layout
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-rose-500 selection:text-white">
      {/* Sidebar (Desktop static fixed left, Mobile slide-in drawer) */}
      <Sidebar
        activeTab={appState.activeTab}
        onSelectTab={handleTabChange}
        currentRoom={appState.currentRoom}
        onChangeRoom={handleRoomChange}
        currentUser={appState.currentUser}
        onLogout={handleLogout}
        onOpenMarchModal={() => setIsMarchModalOpen(true)}
        onSwitchRole={handleSwitchRole}
        sheetsConfig={appState.sheetsConfig}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
      />

      {/* Main Content Area (padded on left for desktop sidebar: lg:pl-72) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72 transition-all">
        {/* Top Header Bar */}
        <TopBar
          currentUser={appState.currentUser}
          onOpenMarchModal={() => setIsMarchModalOpen(true)}
          onOpenProfile={() => handleTabChange('profile')}
          onOpenLogin={() => setIsLoginModalOpen(true)}
          onLogout={handleLogout}
          onSwitchRole={handleSwitchRole}
        />

        {/* Content Tabs Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-12">
          {appState.activeTab === 'home' && (
            <HomeTab
              students={appState.students}
              assignments={appState.assignments}
              submissions={appState.submissions}
              attendance={appState.attendance}
              subjects={appState.subjects}
              currentRoom={appState.currentRoom}
              currentUser={appState.currentUser}
              todayDate={todayDate}
              sheetsConfig={appState.sheetsConfig}
              onNavigateTab={handleTabChange}
              onOpenLineModal={() => setIsLineModalOpen(true)}
              onOpenMarchModal={() => setIsMarchModalOpen(true)}
              onOpenSheetsModal={() => handleTabChange('sheets')}
            />
          )}

          {appState.activeTab === 'student-portal' && (
            <StudentPortalTab
              currentUser={appState.currentUser}
              students={appState.students}
              assignments={appState.assignments}
              submissions={appState.submissions}
              onSubmitHomework={handleSubmitHomework}
              onToggleHomeworkStatus={handleToggleSubmission}
              onViewImage={handleViewImage}
            />
          )}

          {appState.activeTab === 'seating' && (
            <SeatingTab
              currentRoom={appState.currentRoom}
              students={appState.students}
              attendance={appState.attendance}
              todayDate={todayDate}
              onUpdateAttendance={handleUpdateAttendance}
              onMarkAllPresent={handleMarkAllPresent}
              onRewardExp={handleRewardExp}
              onOpenStudentDetail={(std) => setSelectedStudentForDetail(std)}
              onOpenLineModal={() => setIsLineModalOpen(true)}
            />
          )}

          {appState.activeTab === 'grading' && (
            <GradingTab
              currentRoom={appState.currentRoom}
              currentUser={appState.currentUser}
              students={appState.students}
              assignments={appState.assignments}
              submissions={appState.submissions}
              subjects={appState.subjects}
              onAddAssignment={handleAddAssignment}
              onGradeSubmission={handleGradeSubmission}
              onViewImage={handleViewImage}
              onOpenSheetsModal={() => handleTabChange('sheets')}
            />
          )}

          {appState.activeTab === 'homework' && (
            <HomeworkTab
              currentRoom={appState.currentRoom}
              students={appState.students}
              assignments={appState.assignments}
              submissions={appState.submissions}
              onToggleSubmission={handleToggleSubmission}
              onViewImage={handleViewImage}
              onOpenLineModal={() => setIsLineModalOpen(true)}
            />
          )}

          {appState.activeTab === 'students' && (
            <StudentsTab
              currentRoom={appState.currentRoom}
              students={appState.students}
              onAddStudent={handleAddStudent}
              onUpdateStudent={handleUpdateStudent}
              onDeleteStudent={handleDeleteStudent}
              onClearRoomStudents={handleClearRoomStudents}
              onOpenStudentDetail={(std) => setSelectedStudentForDetail(std)}
            />
          )}

          {appState.activeTab === 'tools' && (
            <TeacherToolsTab
              currentRoom={appState.currentRoom}
              students={appState.students}
              onRewardExp={handleRewardExp}
            />
          )}

          {appState.activeTab === 'sheets' && (
            <GoogleSheetsTab
              assignments={appState.assignments}
              sheetsConfig={appState.sheetsConfig}
              onUpdateSheetsConfig={handleUpdateSheetsConfig}
              onSyncAssignments={handleSyncAssignments}
            />
          )}

          {appState.activeTab === 'profile' && (
            <ProfileTab
              currentUser={appState.currentUser}
              appState={appState}
              onUpdateUser={handleUpdateUser}
              onImportBackup={handleImportBackup}
              onResetDefaultData={handleResetDefaultData}
              assignments={appState.assignments}
              sheetsConfig={appState.sheetsConfig}
              onUpdateSheetsConfig={handleUpdateSheetsConfig}
              onSyncAssignments={handleSyncAssignments}
            />
          )}
        </main>

        {/* Official School Footer */}
        <Footer
          onNavigateTab={handleTabChange}
          onOpenLineModal={() => setIsLineModalOpen(true)}
          currentUser={appState.currentUser}
        />
      </div>

      {/* Global Modals */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLogin}
        onOpenRegister={handleOpenRegister}
      />

      <RegisterModal
        isOpen={isRegisterModalOpen}
        role={registerRole}
        onClose={() => setIsRegisterModalOpen(false)}
        onRegister={handleRegister}
        onOpenLogin={() => {
          setIsRegisterModalOpen(false);
          setIsLoginModalOpen(true);
        }}
      />

      <StudentDetailModal
        student={selectedStudentForDetail}
        attendance={appState.attendance}
        assignments={appState.assignments}
        submissions={appState.submissions}
        onClose={() => setSelectedStudentForDetail(null)}
        onRewardExp={handleRewardExp}
      />

      <LineModal
        isOpen={isLineModalOpen}
        onClose={() => setIsLineModalOpen(false)}
        currentRoom={appState.currentRoom}
        todayDate={todayDate}
        students={appState.students}
        attendance={appState.attendance}
        assignments={appState.assignments}
        submissions={appState.submissions}
      />

      <ImageViewerModal
        isOpen={imageViewerState.isOpen}
        imageUrl={imageViewerState.url}
        caption={imageViewerState.caption}
        onClose={() => setImageViewerState({ isOpen: false, url: null })}
      />

      <SchoolMarchModal
        isOpen={isMarchModalOpen}
        onClose={() => setIsMarchModalOpen(false)}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
