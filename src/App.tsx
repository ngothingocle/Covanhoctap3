import React, { useState, useEffect } from 'react';
import { AppState, ClassGroup, CounselingLog, Course, Student, UserRole, UserSession } from './types';
import { loadAppState, saveAppState, loadUserSession, saveUserSession, resetToDefaultData } from './utils/storage';
import { calculateStudentGPA } from './utils/calculations';

// Components
import { Header } from './components/Header';
import { Navbar, TabType } from './components/Navbar';
import { DashboardOverview } from './components/DashboardOverview';
import { StudentList } from './components/StudentList';
import { CourseGradeList } from './components/CourseGradeList';
import { AttendanceTracker } from './components/AttendanceTracker';
import { CounselingJournal } from './components/CounselingJournal';
import { LoginModal } from './components/LoginModal';
import { ForgotPasswordModal } from './components/ForgotPasswordModal';
import { StudentModal } from './components/StudentModal';
import { StudentDossierModal } from './components/StudentDossierModal';
import { ClassManagerModal } from './components/ClassManagerModal';
import { AccountManagerModal } from './components/AccountManagerModal';
import { ImportModal } from './components/ImportModal';

export default function App() {
  const [appState, setAppState] = useState<AppState>(() => loadAppState());
  const [session, setSession] = useState<UserSession | null>(() => loadUserSession());
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');

  // Modals state
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
  const [showDossierModal, setShowDossierModal] = useState(false);
  const [selectedStudentForDossier, setSelectedStudentForDossier] = useState<Student | null>(null);
  const [showClassManager, setShowClassManager] = useState(false);
  const [showAccountManager, setShowAccountManager] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // Sync state to LocalStorage
  useEffect(() => {
    saveAppState(appState);
  }, [appState]);

  // Sync session to LocalStorage
  useEffect(() => {
    saveUserSession(session);
    if (session?.role === 'class_officer') {
      setCurrentTab('attendance');
      if (session.classId) {
        setAppState((prev) => ({
          ...prev,
          activeClassId: session.classId!,
        }));
      }
    }
  }, [session]);

  const activeClass =
    appState.classes.find((c) => c.id === appState.activeClassId) ||
    appState.classes[0] || {
      id: 'default',
      code: 'DH22TH01',
      name: 'Lớp Mặc Định',
      academicYear: '2022-2026',
      department: 'Công nghệ thông tin',
      advisorName: appState.advisorAccount.fullName,
      advisorPhone: appState.advisorAccount.phone,
    };

  const classStudents = appState.students.filter(
    (s) => s.classId === activeClass.id
  );

  const classCourses = appState.courses.filter(
    (c) => !c.classId || c.classId === activeClass.id
  );

  // Metrics for badges
  const owedCount = classStudents.filter(
    (s) => calculateStudentGPA(s, classCourses).owedCoursesCount > 0
  ).length;

  const counselingCount = appState.counselingLogs.filter(
    (l) => l.classId === activeClass.id
  ).length;

  // --- Handlers ---
  const handleSelectClass = (classId: string) => {
    setAppState((prev) => ({
      ...prev,
      activeClassId: classId,
    }));
  };

  const handleLoginSuccess = (userSession: UserSession) => {
    setSession(userSession);
    if (userSession.role === 'class_officer') {
      setCurrentTab('attendance');
      if (userSession.classId) {
        setAppState((prev) => ({
          ...prev,
          activeClassId: userSession.classId!,
        }));
      }
    } else {
      setCurrentTab('dashboard');
    }
  };

  const handleLogout = () => {
    setSession(null);
    setShowLoginModal(true);
  };

  // Student Handlers
  const handleSaveStudent = (studentData: Partial<Student>) => {
    setAppState((prev) => {
      if (studentToEdit) {
        // Update existing
        return {
          ...prev,
          students: prev.students.map((s) =>
            s.id === studentToEdit.id ? ({ ...s, ...studentData } as Student) : s
          ),
        };
      } else {
        // Add new
        const newStudent: Student = {
          id: `st-${Date.now()}`,
          studentCode: studentData.studentCode || '',
          fullName: studentData.fullName || '',
          classId: studentData.classId || prev.activeClassId,
          birthYear: studentData.birthYear || '2004',
          gender: studentData.gender || 'Nam',
          ethnicity: studentData.ethnicity || 'Kinh',
          permanentAddress: studentData.permanentAddress || '',
          studentPhone: studentData.studentPhone || '',
          relativePhone: studentData.relativePhone || '',
          residenceType: studentData.residenceType || 'tro',
          boardingAddress: studentData.boardingAddress,
          landlordPhone: studentData.landlordPhone,
          dormRoom: studentData.dormRoom,
          relativeAddress: studentData.relativeAddress,
          isClassOfficer: studentData.isClassOfficer || false,
          officerPosition: studentData.officerPosition,
          officerPassword: studentData.officerPassword || studentData.studentCode,
          grades: {},
          notes: studentData.notes,
        };
        return {
          ...prev,
          students: [newStudent, ...prev.students],
        };
      }
    });
  };

  const handleDeleteStudent = (studentId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sinh viên này khỏi danh sách lớp?')) {
      setAppState((prev) => ({
        ...prev,
        students: prev.students.filter((s) => s.id !== studentId),
        counselingLogs: prev.counselingLogs.filter((l) => l.studentId !== studentId),
      }));
    }
  };

  const handleImportStudents = (newStudents: Partial<Student>[]) => {
    setAppState((prev) => ({
      ...prev,
      students: [...(newStudents as Student[]), ...prev.students],
    }));
  };

  // Course & Grade Handlers
  const handleAddCourse = (newCourse: Partial<Course>) => {
    setAppState((prev) => ({
      ...prev,
      courses: [...prev.courses, newCourse as Course],
    }));
  };

  const handleEditCourse = (courseId: string, updated: Partial<Course>) => {
    setAppState((prev) => ({
      ...prev,
      courses: prev.courses.map((c) =>
        c.id === courseId ? ({ ...c, ...updated } as Course) : c
      ),
    }));
  };

  const handleDeleteCourse = (courseId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa môn học này?')) {
      setAppState((prev) => ({
        ...prev,
        courses: prev.courses.filter((c) => c.id !== courseId),
      }));
    }
  };

  const handleUpdateGrade = (
    studentId: string,
    courseId: string,
    finalGrade: number | null
  ) => {
    setAppState((prev) => ({
      ...prev,
      students: prev.students.map((st) => {
        if (st.id !== studentId) return st;
        const currentGrade = st.grades?.[courseId] || {
          courseId,
          finalGrade: null,
          isOwed: false,
          absentPeriods: 0,
          absenceLogs: [],
        };
        const isOwed = finalGrade !== null && finalGrade < 4.0;

        return {
          ...st,
          grades: {
            ...st.grades,
            [courseId]: {
              ...currentGrade,
              finalGrade,
              isOwed,
            },
          },
        };
      }),
    }));
  };

  // Attendance Handlers
  const handleRecordAbsence = (
    studentId: string,
    courseId: string,
    periods: number,
    date: string,
    reason: string
  ) => {
    const newLog = {
      id: `abs-${Date.now()}`,
      date,
      periods,
      reason,
      recordedBy: session?.displayName || 'Cán bộ lớp',
      recordedRole: session?.role || 'class_officer',
      createdAt: new Date().toISOString(),
    };

    setAppState((prev) => ({
      ...prev,
      students: prev.students.map((st) => {
        if (st.id !== studentId) return st;
        const currentGrade = st.grades?.[courseId] || {
          courseId,
          finalGrade: null,
          isOwed: false,
          absentPeriods: 0,
          absenceLogs: [],
        };

        const updatedLogs = [newLog, ...(currentGrade.absenceLogs || [])];
        const newTotalAbsent = updatedLogs.reduce((sum, l) => sum + l.periods, 0);

        return {
          ...st,
          grades: {
            ...st.grades,
            [courseId]: {
              ...currentGrade,
              absentPeriods: newTotalAbsent,
              absenceLogs: updatedLogs,
            },
          },
        };
      }),
    }));
  };

  const handleDeleteAbsenceLog = (studentId: string, courseId: string, logId: string) => {
    setAppState((prev) => ({
      ...prev,
      students: prev.students.map((st) => {
        if (st.id !== studentId) return st;
        const currentGrade = st.grades?.[courseId];
        if (!currentGrade) return st;

        const updatedLogs = (currentGrade.absenceLogs || []).filter((l) => l.id !== logId);
        const newTotalAbsent = updatedLogs.reduce((sum, l) => sum + l.periods, 0);

        return {
          ...st,
          grades: {
            ...st.grades,
            [courseId]: {
              ...currentGrade,
              absentPeriods: newTotalAbsent,
              absenceLogs: updatedLogs,
            },
          },
        };
      }),
    }));
  };

  // Counseling Handlers
  const handleAddCounselingLog = (log: Partial<CounselingLog>) => {
    setAppState((prev) => ({
      ...prev,
      counselingLogs: [log as CounselingLog, ...prev.counselingLogs],
    }));
  };

  const handleEditCounselingLog = (logId: string, updated: Partial<CounselingLog>) => {
    setAppState((prev) => ({
      ...prev,
      counselingLogs: prev.counselingLogs.map((l) =>
        l.id === logId ? ({ ...l, ...updated } as CounselingLog) : l
      ),
    }));
  };

  const handleDeleteCounselingLog = (logId: string) => {
    if (window.confirm('Bạn có chắc muốn xóa nhật ký tư vấn này?')) {
      setAppState((prev) => ({
        ...prev,
        counselingLogs: prev.counselingLogs.filter((l) => l.id !== logId),
      }));
    }
  };

  // Class Management Handlers
  const handleAddClass = (classData: Partial<ClassGroup>) => {
    setAppState((prev) => ({
      ...prev,
      classes: [...prev.classes, classData as ClassGroup],
      activeClassId: classData.id || prev.activeClassId,
    }));
  };

  const handleEditClass = (classId: string, updated: Partial<ClassGroup>) => {
    setAppState((prev) => ({
      ...prev,
      classes: prev.classes.map((c) =>
        c.id === classId ? ({ ...c, ...updated } as ClassGroup) : c
      ),
    }));
  };

  const handleDeleteClass = (classId: string) => {
    if (window.confirm('Bạn có chắc muốn xóa lớp này? Sinh viên thuộc lớp cũng sẽ bị gỡ.')) {
      setAppState((prev) => {
        const remaining = prev.classes.filter((c) => c.id !== classId);
        return {
          ...prev,
          classes: remaining,
          activeClassId: remaining[0]?.id || '',
          students: prev.students.filter((s) => s.classId !== classId),
          counselingLogs: prev.counselingLogs.filter((l) => l.classId !== classId),
        };
      });
    }
  };

  // Account Management Handlers
  const handleUpdateAdvisorAccount = (accountData: AppState['advisorAccount']) => {
    setAppState((prev) => ({
      ...prev,
      advisorAccount: accountData,
    }));
    if (session?.role === 'advisor') {
      setSession({
        role: 'advisor',
        username: accountData.username,
        displayName: accountData.fullName,
      });
    }
  };

  const handleUpdateOfficerPassword = (studentId: string, newPassword: string) => {
    setAppState((prev) => ({
      ...prev,
      students: prev.students.map((s) =>
        s.id === studentId ? { ...s, officerPassword: newPassword } : s
      ),
    }));
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      {/* Header Bar */}
      <Header
        session={session}
        classes={appState.classes}
        activeClassId={appState.activeClassId}
        onSelectClass={handleSelectClass}
        onOpenLogin={() => setShowLoginModal(true)}
        onLogout={handleLogout}
        onOpenClassManager={() => setShowClassManager(true)}
        onOpenAccountManager={() => setShowAccountManager(true)}
        onOpenForgotPassword={() => setShowForgotPasswordModal(true)}
      />

      {/* Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        userRole={session?.role || 'advisor'}
        studentCount={classStudents.length}
        courseCount={classCourses.length}
        counselingCount={counselingCount}
        owedCount={owedCount}
      />

      {/* Main App Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* If Class Officer: ONLY allow Attendance Tab */}
        {session?.role === 'class_officer' ? (
          <AttendanceTracker
            classGroup={activeClass}
            courses={classCourses}
            students={classStudents}
            session={session}
            onRecordAbsence={handleRecordAbsence}
            onDeleteAbsenceLog={handleDeleteAbsenceLog}
          />
        ) : (
          /* Advisor Views */
          <>
            {currentTab === 'dashboard' && (
              <DashboardOverview
                activeClass={activeClass}
                students={classStudents}
                courses={classCourses}
                counselingLogs={appState.counselingLogs}
                onNavigate={setCurrentTab}
                onOpenAddStudent={() => {
                  setStudentToEdit(null);
                  setShowStudentModal(true);
                }}
                onOpenImport={() => setShowImportModal(true)}
                onSelectStudentForDossier={(st) => {
                  setSelectedStudentForDossier(st);
                  setShowDossierModal(true);
                }}
              />
            )}

            {currentTab === 'students' && (
              <StudentList
                classGroup={activeClass}
                students={classStudents}
                courses={classCourses}
                counselingLogs={appState.counselingLogs}
                onAddStudent={() => {
                  setStudentToEdit(null);
                  setShowStudentModal(true);
                }}
                onEditStudent={(st) => {
                  setStudentToEdit(st);
                  setShowStudentModal(true);
                }}
                onDeleteStudent={handleDeleteStudent}
                onOpenImport={() => setShowImportModal(true)}
                onSelectStudentForDossier={(st) => {
                  setSelectedStudentForDossier(st);
                  setShowDossierModal(true);
                }}
                onOpenCounselingForStudent={(st) => {
                  setSelectedStudentForDossier(st);
                  setCurrentTab('counseling');
                }}
              />
            )}

            {currentTab === 'grades' && (
              <CourseGradeList
                classGroup={activeClass}
                courses={classCourses}
                students={classStudents}
                onAddCourse={handleAddCourse}
                onEditCourse={handleEditCourse}
                onDeleteCourse={handleDeleteCourse}
                onUpdateGrade={handleUpdateGrade}
                onSelectStudentForDossier={(st) => {
                  setSelectedStudentForDossier(st);
                  setShowDossierModal(true);
                }}
              />
            )}

            {currentTab === 'attendance' && (
              <AttendanceTracker
                classGroup={activeClass}
                courses={classCourses}
                students={classStudents}
                session={session}
                onRecordAbsence={handleRecordAbsence}
                onDeleteAbsenceLog={handleDeleteAbsenceLog}
              />
            )}

            {currentTab === 'counseling' && (
              <CounselingJournal
                classGroup={activeClass}
                students={classStudents}
                counselingLogs={appState.counselingLogs}
                onAddLog={handleAddCounselingLog}
                onEditLog={handleEditCounselingLog}
                onDeleteLog={handleDeleteCounselingLog}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div>
            Hệ thống <b>Cố vấn học tập - Ngọc Lê</b> | Hotline: <b>0948090287</b> - Email: <b>ngoclecyt@gmail.com</b>
          </div>
          <div>
            © 2025 Quản lý Cố vấn Học tập & Điểm danh Sinh viên
          </div>
        </div>
      </footer>

      {/* --- Modals --- */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        appState={appState}
        onLoginSuccess={handleLoginSuccess}
        onOpenForgotPassword={() => {
          setShowLoginModal(false);
          setShowForgotPasswordModal(true);
        }}
      />

      <ForgotPasswordModal
        isOpen={showForgotPasswordModal}
        onClose={() => setShowForgotPasswordModal(false)}
        appState={appState}
        onFillCredentials={(u, p) => {
          setSession({
            role: 'advisor',
            username: u,
            displayName: appState.advisorAccount.fullName,
          });
          setCurrentTab('dashboard');
        }}
      />

      <StudentModal
        isOpen={showStudentModal}
        onClose={() => {
          setShowStudentModal(false);
          setStudentToEdit(null);
        }}
        onSave={handleSaveStudent}
        studentToEdit={studentToEdit}
        classGroup={activeClass}
      />

      <StudentDossierModal
        isOpen={showDossierModal}
        onClose={() => {
          setShowDossierModal(false);
          setSelectedStudentForDossier(null);
        }}
        student={selectedStudentForDossier}
        classGroup={activeClass}
        courses={classCourses}
        counselingLogs={appState.counselingLogs}
      />

      <ClassManagerModal
        isOpen={showClassManager}
        onClose={() => setShowClassManager(false)}
        classes={appState.classes}
        activeClassId={appState.activeClassId}
        onSelectClass={handleSelectClass}
        onAddClass={handleAddClass}
        onEditClass={handleEditClass}
        onDeleteClass={handleDeleteClass}
      />

      <AccountManagerModal
        isOpen={showAccountManager}
        onClose={() => setShowAccountManager(false)}
        appState={appState}
        onUpdateAdvisorAccount={handleUpdateAdvisorAccount}
        onUpdateOfficerPassword={handleUpdateOfficerPassword}
        onRestoreBackup={(newState) => setAppState(newState)}
      />

      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        classGroup={activeClass}
        onImportStudents={handleImportStudents}
      />
    </div>
  );
}
