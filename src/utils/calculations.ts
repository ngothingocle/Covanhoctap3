import { Course, Student } from '../types';

/**
 * Tính Điểm trung bình các môn theo thuật toán:
 * Tổng (Điểm tổng kết từng môn * Số tín chỉ tương ứng) / Tổng số tín chỉ của tất cả các môn đã có điểm.
 * Làm tròn 2 chữ số thập phân.
 */
export function calculateStudentGPA(
  student: Student,
  courses: Course[]
): {
  gpa: number | null;
  totalCredits: number;
  gradedCredits: number;
  owedCoursesCount: number;
  owedCourses: Course[];
  totalAbsentPeriods: number;
} {
  let totalScoreWeight = 0;
  let gradedCredits = 0;
  let totalCredits = 0;
  const owedCourses: Course[] = [];
  let totalAbsentPeriods = 0;

  courses.forEach((course) => {
    totalCredits += course.credits;
    const gradeInfo = student.grades?.[course.id];

    if (gradeInfo) {
      totalAbsentPeriods += gradeInfo.absentPeriods || 0;

      if (gradeInfo.finalGrade !== null && gradeInfo.finalGrade !== undefined && !isNaN(gradeInfo.finalGrade)) {
        totalScoreWeight += gradeInfo.finalGrade * course.credits;
        gradedCredits += course.credits;

        if (gradeInfo.finalGrade < 4.0) {
          owedCourses.push(course);
        }
      }
    }
  });

  const gpa = gradedCredits > 0 ? Number((totalScoreWeight / gradedCredits).toFixed(2)) : null;

  return {
    gpa,
    totalCredits,
    gradedCredits,
    owedCoursesCount: owedCourses.length,
    owedCourses,
    totalAbsentPeriods,
  };
}

/**
 * Tính xếp loại học lực dựa trên điểm hệ 10
 */
export function getAcademicClassification(gpa: number | null): {
  rank: string;
  badgeColor: string;
} {
  if (gpa === null) return { rank: 'Chưa xét', badgeColor: 'bg-slate-100 text-slate-700' };
  if (gpa >= 9.0) return { rank: 'Xuất sắc', badgeColor: 'bg-emerald-100 text-emerald-800 font-semibold' };
  if (gpa >= 8.0) return { rank: 'Giỏi', badgeColor: 'bg-blue-100 text-blue-800 font-semibold' };
  if (gpa >= 6.5) return { rank: 'Khá', badgeColor: 'bg-amber-100 text-amber-800 font-semibold' };
  if (gpa >= 5.0) return { rank: 'Trung bình', badgeColor: 'bg-orange-100 text-orange-800 font-semibold' };
  if (gpa >= 4.0) return { rank: 'Yếu', badgeColor: 'bg-red-100 text-red-700 font-semibold' };
  return { rank: 'Kém (Nợ nhiều)', badgeColor: 'bg-red-200 text-red-900 font-bold' };
}

/**
 * Lấy nhãn và màu sắc cho loại hình cư trú
 */
export function getResidenceInfo(type: Student['residenceType']): {
  label: string;
  badgeColor: string;
} {
  switch (type) {
    case 'tro':
      return { label: 'Ở trọ', badgeColor: 'bg-amber-50 text-amber-700 border-amber-200' };
    case 'ktx':
      return { label: 'Ký túc xá (KTX)', badgeColor: 'bg-blue-50 text-blue-700 border-blue-200' };
    case 'nguoi_than':
      return { label: 'Nhà người thân', badgeColor: 'bg-purple-50 text-purple-700 border-purple-200' };
    case 'nha_rieng':
    default:
      return { label: 'Nhà riêng / Gia đình', badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  }
}
