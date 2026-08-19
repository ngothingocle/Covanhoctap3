export type UserRole = 'advisor' | 'class_officer';

export type ResidenceType = 'tro' | 'ktx' | 'nguoi_than' | 'nha_rieng';

export type Gender = 'Nam' | 'Nữ';

export interface AbsenceLogEntry {
  id: string;
  date: string; // YYYY-MM-DD
  periods: number; // Số tiết vắng
  reason?: string;
  recordedBy: string; // Tên người ghi nhận (Cán bộ lớp hoặc Cố vấn)
  recordedRole: UserRole;
  createdAt: string;
}

export interface StudentCourseGrade {
  courseId: string;
  finalGrade: number | null; // Điểm tổng kết (hệ 10), ví dụ: 8.5
  isOwed: boolean; // Tự động true nếu finalGrade !== null && finalGrade < 4.0
  absentPeriods: number; // Tổng số tiết vắng môn này
  absenceLogs: AbsenceLogEntry[]; // Chi tiết các lần vắng
}

export interface Student {
  id: string;
  studentCode: string; // Mã Sinh viên
  fullName: string; // Họ và tên
  classId: string; // Thuộc lớp
  birthYear: string; // Năm sinh hoặc ngày sinh (ví dụ 2004 hoặc 15/08/2004)
  gender: Gender; // Giới tính
  ethnicity: string; // Dân tộc (Kinh, Tày, Thái, v.v.)
  permanentAddress: string; // Địa chỉ thường trú
  studentPhone: string; // SĐT SV
  relativePhone: string; // SĐT người thân
  
  // Tình trạng cư trú
  residenceType: ResidenceType;
  boardingAddress?: string; // Địa chỉ nhà trọ (nếu ở trọ)
  landlordPhone?: string; // SĐT chủ trọ (nếu ở trọ)
  dormRoom?: string; // Số phòng KTX (nếu ở KTX)
  relativeAddress?: string; // Địa chỉ / Họ tên người thân (nếu ở nhà người thân)
  
  // Cán bộ lớp
  isClassOfficer: boolean; // Cán bộ lớp (được đánh dấu & cấp quyền truy cập)
  officerPosition?: string; // Chức vụ: Lớp trưởng, Lớp phó, Bí thư, v.v.
  officerPassword?: string; // Mật khẩu đăng nhập của cán bộ (mặc định = mã SV)
  
  grades: Record<string, StudentCourseGrade>; // Key là courseId
  notes?: string;
}

export interface Course {
  id: string;
  courseCode: string; // Mã môn học
  courseName: string; // Tên môn học
  credits: number; // Số tín chỉ
  semester: string; // Học kỳ (HK1, HK2, ...)
  academicYear: string; // Năm học
  classId?: string; // Thuộc lớp nào (hoặc môn chung)
}

export interface CounselingLog {
  id: string;
  classId: string;
  studentId: string;
  studentCode: string;
  studentName: string;
  date: string; // Ngày (YYYY-MM-DD)
  topic: string; // Vấn đề trao đổi
  solution: string; // Phương án giải quyết
  result: string; // Kết quả đạt được
  followUp?: string; // Ghi chú theo dõi
  createdAt: string;
}

export interface ClassGroup {
  id: string;
  code: string; // Mã lớp: DH22TH01
  name: string; // Tên lớp
  academicYear: string; // Khóa / Năm học: 2022 - 2026
  department: string; // Khoa / Ngành
  advisorName: string; // Tên Cố vấn học tập (Ngọc Lê)
  advisorPhone: string; // SĐT: 0948090287
}

export interface UserSession {
  role: UserRole;
  username: string;
  displayName: string;
  classId?: string; // Lớp được phân quyền nếu là cán bộ lớp
  studentId?: string; // ID sinh viên nếu là cán bộ lớp
  position?: string;
}

export interface AppState {
  classes: ClassGroup[];
  activeClassId: string;
  students: Student[];
  courses: Course[];
  counselingLogs: CounselingLog[];
  advisorAccount: {
    username: string; // 0948090287
    password: string; // sekoyeuanh
    phone: string; // 0948090287
    email: string; // ngoclecyt@gmail.com
    fullName: string; // Cố vấn học tập - Ngọc Lê
  };
}
