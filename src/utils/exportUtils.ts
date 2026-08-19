import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { ClassGroup, CounselingLog, Course, Student } from '../types';
import { calculateStudentGPA, getAcademicClassification, getResidenceInfo } from './calculations';

/**
 * Xuất Bảng điểm & Điểm danh lớp ra file Excel (.xlsx)
 */
export function exportClassGradesToExcel(
  classGroup: ClassGroup,
  students: Student[],
  courses: Course[]
) {
  const headers = [
    'STT',
    'Mã SV',
    'Họ và tên',
    'Giới tính',
    'Năm sinh',
    'Cán bộ lớp',
    'Hình thức cư trú',
    'SĐT SV',
    'SĐT Người thân',
    ...courses.map((c) => `${c.courseName} (${c.credits} TC) - Điểm`),
    ...courses.map((c) => `${c.courseName} - Vắng (tiết)`),
    'Điểm TB (GPA)',
    'Xếp loại',
    'Môn nợ',
    'Tổng tiết vắng',
  ];

  const dataRows = students.map((st, index) => {
    const calc = calculateStudentGPA(st, courses);
    const classification = getAcademicClassification(calc.gpa);
    const resInfo = getResidenceInfo(st.residenceType);

    const row: any[] = [
      index + 1,
      st.studentCode,
      st.fullName,
      st.gender,
      st.birthYear,
      st.isClassOfficer ? st.officerPosition || 'Cán bộ lớp' : '',
      resInfo.label,
      st.studentPhone,
      st.relativePhone,
    ];

    // Điểm từng môn
    courses.forEach((c) => {
      const g = st.grades?.[c.id]?.finalGrade;
      row.push(g !== null && g !== undefined ? g : '');
    });

    // Tiết vắng từng môn
    courses.forEach((c) => {
      const v = st.grades?.[c.id]?.absentPeriods || 0;
      row.push(v);
    });

    row.push(calc.gpa !== null ? calc.gpa : 'Chưa có');
    row.push(classification.rank);
    row.push(calc.owedCoursesCount > 0 ? calc.owedCourses.map((c) => c.courseName).join(', ') : 'Không');
    row.push(calc.totalAbsentPeriods);

    return row;
  });

  const ws = XLSX.utils.aoa_to_sheet([
    [`DANH SÁCH LỚP & BẢNG ĐIỂM - ${classGroup.name} (${classGroup.code})`],
    [`Cố vấn học tập: ${classGroup.advisorName} - SĐT: ${classGroup.advisorPhone}`],
    [`Năm học / Khóa: ${classGroup.academicYear}`],
    [],
    headers,
    ...dataRows,
  ]);

  // Set column widths
  ws['!cols'] = [
    { wch: 6 },
    { wch: 14 },
    { wch: 24 },
    { wch: 10 },
    { wch: 12 },
    { wch: 16 },
    { wch: 20 },
    { wch: 14 },
    { wch: 25 },
    ...courses.map(() => ({ wch: 18 })),
    ...courses.map(() => ({ wch: 16 })),
    { wch: 14 },
    { wch: 14 },
    { wch: 24 },
    { wch: 14 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Danh sách & Điểm');
  XLSX.writeFile(wb, `Danh_Sach_${classGroup.code}_Bang_Diem.xlsx`);
}

/**
 * Xuất Hồ sơ chi tiết một Sinh viên ra file Excel
 */
export function exportStudentToExcel(
  student: Student,
  classGroup: ClassGroup,
  courses: Course[],
  counselingLogs: CounselingLog[]
) {
  const calc = calculateStudentGPA(student, courses);
  const classification = getAcademicClassification(calc.gpa);
  const resInfo = getResidenceInfo(student.residenceType);

  const studentLogs = counselingLogs.filter((l) => l.studentId === student.id || l.studentCode === student.studentCode);

  // Sheet 1: Thông tin cá nhân
  const personalData = [
    ['CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM'],
    ['Độc lập - Tự do - Hạnh phúc'],
    [''],
    ['HỒ SƠ CỐ VẤN HỌC TẬP SINH VIÊN'],
    [''],
    ['1. THÔNG TIN CHUNG:'],
    ['Mã sinh viên:', student.studentCode, 'Họ và tên:', student.fullName],
    ['Lớp:', `${classGroup.name} (${classGroup.code})`, 'Khóa / Năm học:', classGroup.academicYear],
    ['Năm sinh:', student.birthYear, 'Giới tính:', student.gender],
    ['Dân tộc:', student.ethnicity, 'Cán bộ lớp:', student.isClassOfficer ? student.officerPosition || 'Có' : 'Không'],
    ['Số điện thoại SV:', student.studentPhone, 'SĐT Người thân:', student.relativePhone],
    ['Địa chỉ thường trú:', student.permanentAddress],
    [''],
    ['2. TÌNH TRẠNG CƯ TRÚ:'],
    ['Hình thức cư trú:', resInfo.label],
    ['Địa chỉ nhà trọ:', student.boardingAddress || 'Không có'],
    ['SĐT chủ trọ:', student.landlordPhone || 'Không có'],
    ['Số phòng KTX:', student.dormRoom || 'Không có'],
    ['Địa chỉ người thân:', student.relativeAddress || 'Không có'],
    [''],
    ['3. TỔNG KẾT HỌC TẬP:'],
    ['Điểm trung bình (GPA):', calc.gpa !== null ? calc.gpa : 'Chưa có', 'Xếp loại:', classification.rank],
    ['Tổng số tín chỉ:', calc.totalCredits, 'Tín chỉ đã tính điểm:', calc.gradedCredits],
    ['Số môn nợ (Điểm < 4.0):', calc.owedCoursesCount, 'Môn nợ:', calc.owedCourses.map((c) => c.courseName).join(', ') || 'Không'],
    ['Tổng số tiết vắng:', calc.totalAbsentPeriods],
    ['Ghi chú của Cố vấn:', student.notes || ''],
  ];

  // Sheet 2: Chi tiết môn học
  const gradeHeaders = ['Mã môn', 'Tên môn học', 'Số tín chỉ', 'Điểm tổng kết', 'Tình trạng nợ môn', 'Số tiết vắng'];
  const gradeRows = courses.map((c) => {
    const g = student.grades?.[c.id]?.finalGrade;
    const v = student.grades?.[c.id]?.absentPeriods || 0;
    const isOwed = g !== null && g !== undefined && g < 4.0;
    return [
      c.courseCode,
      c.courseName,
      c.credits,
      g !== null && g !== undefined ? g : 'Chưa có',
      isOwed ? 'NỢ MÔN (<4.0)' : 'Đạt',
      v,
    ];
  });

  // Sheet 3: Nhật ký trò chuyện
  const logHeaders = ['Ngày', 'Vấn đề trao đổi', 'Phương án giải quyết', 'Kết quả đạt được', 'Ghi chú theo dõi'];
  const logRows = studentLogs.map((l) => [l.date, l.topic, l.solution, l.result, l.followUp || '']);

  const wb = XLSX.utils.book_new();
  const ws1 = XLSX.utils.aoa_to_sheet(personalData);
  const ws2 = XLSX.utils.aoa_to_sheet([['CHI TIẾT MÔN HỌC & ĐIỂM SỐ'], [], gradeHeaders, ...gradeRows]);
  const ws3 = XLSX.utils.aoa_to_sheet([['NHẬT KÝ TRÒ CHUYỆN VÀ TƯ VẤN'], [], logHeaders, ...logRows]);

  XLSX.utils.book_append_sheet(wb, ws1, 'Hồ sơ cá nhân');
  XLSX.utils.book_append_sheet(wb, ws2, 'Môn học & Điểm');
  XLSX.utils.book_append_sheet(wb, ws3, 'Nhật ký tư vấn');

  XLSX.writeFile(wb, `Ho_So_${student.studentCode}_${student.fullName.replace(/\s+/g, '_')}.xlsx`);
}

/**
 * Xuất Hồ sơ Sinh viên ra file Word (.doc)
 */
export function exportStudentToWord(
  student: Student,
  classGroup: ClassGroup,
  courses: Course[],
  counselingLogs: CounselingLog[]
) {
  const calc = calculateStudentGPA(student, courses);
  const classification = getAcademicClassification(calc.gpa);
  const resInfo = getResidenceInfo(student.residenceType);
  const studentLogs = counselingLogs.filter((l) => l.studentId === student.id || l.studentCode === student.studentCode);

  const htmlContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <title>Hồ sơ sinh viên ${student.fullName}</title>
      <style>
        body { font-family: 'Times New Roman', serif; font-size: 13pt; line-height: 1.5; color: #111; }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .title { font-size: 16pt; font-weight: bold; margin-top: 15px; margin-bottom: 5px; text-transform: uppercase; color: #b91c1c; }
        .subtitle { font-size: 13pt; margin-bottom: 20px; color: #1e3a8a; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 15px; }
        th, td { border: 1px solid #333; padding: 6px 10px; font-size: 12pt; text-align: left; }
        th { background-color: #f3f4f6; font-weight: bold; }
        .section-title { font-size: 14pt; font-weight: bold; color: #ea580c; border-bottom: 1.5px solid #ea580c; padding-bottom: 4px; margin-top: 20px; }
        .badge-debt { color: #dc2626; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="center">
        <p style="margin:0; font-size: 12pt;">BỘ GIÁO DỤC VÀ ĐÀO TẠO - TRƯỜNG ĐẠI HỌC</p>
        <p style="margin:0; font-weight: bold; font-size: 12pt;">HỆ THỐNG CỐ VẤN HỌC TẬP - NGỌC LÊ</p>
        <p style="margin:0; font-size: 11pt;">Hotline: 0948090287 - Email: ngoclecyt@gmail.com</p>
        <hr style="border: 0.5px solid #666; width: 40%; margin: 8px auto;" />
        <h1 class="title">TRÍCH XUẤT HỒ SƠ SINH VIÊN</h1>
        <p class="subtitle">Lớp: ${classGroup.name} (${classGroup.code}) | Khóa: ${classGroup.academicYear}</p>
      </div>

      <div class="section-title">I. THÔNG TIN CÁ NHÂN & LIÊN HỆ</div>
      <table>
        <tr>
          <td width="20%" class="bold">Mã Sinh viên:</td>
          <td width="30%">${student.studentCode}</td>
          <td width="20%" class="bold">Họ và tên:</td>
          <td width="30%" class="bold" style="color:#1d4ed8;">${student.fullName}</td>
        </tr>
        <tr>
          <td class="bold">Năm sinh:</td>
          <td>${student.birthYear}</td>
          <td class="bold">Giới tính:</td>
          <td>${student.gender}</td>
        </tr>
        <tr>
          <td class="bold">Dân tộc:</td>
          <td>${student.ethnicity}</td>
          <td class="bold">Cán bộ lớp:</td>
          <td>${student.isClassOfficer ? `<span class="bold">${student.officerPosition || 'Cán bộ lớp'}</span>` : 'Sinh viên'}</td>
        </tr>
        <tr>
          <td class="bold">Điện thoại SV:</td>
          <td>${student.studentPhone}</td>
          <td class="bold">SĐT Người thân:</td>
          <td>${student.relativePhone}</td>
        </tr>
        <tr>
          <td class="bold">Địa chỉ thường trú:</td>
          <td colspan="3">${student.permanentAddress}</td>
        </tr>
      </table>

      <div class="section-title">II. TÌNH TRẠNG CƯ TRÚ</div>
      <table>
        <tr>
          <td width="25%" class="bold">Hình thức cư trú:</td>
          <td colspan="3" class="bold">${resInfo.label}</td>
        </tr>
        ${
          student.residenceType === 'tro'
            ? `<tr>
                <td class="bold">Địa chỉ nhà trọ:</td>
                <td>${student.boardingAddress || 'Chưa cập nhật'}</td>
                <td class="bold">SĐT chủ trọ:</td>
                <td>${student.landlordPhone || 'Chưa cập nhật'}</td>
              </tr>`
            : ''
        }
        ${
          student.residenceType === 'ktx'
            ? `<tr>
                <td class="bold">Số phòng KTX:</td>
                <td colspan="3">${student.dormRoom || 'Chưa cập nhật'}</td>
              </tr>`
            : ''
        }
        ${
          student.residenceType === 'nguoi_than'
            ? `<tr>
                <td class="bold">Thông tin nhà người thân:</td>
                <td colspan="3">${student.relativeAddress || 'Chưa cập nhật'}</td>
              </tr>`
            : ''
        }
      </table>

      <div class="section-title">III. KẾT QUẢ HỌC TẬP & ĐIỂM DANH THEO MÔN</div>
      <p><b>Điểm trung bình (GPA):</b> <span style="font-size:14pt; color:#1d4ed8; font-weight:bold;">${calc.gpa !== null ? calc.gpa : 'Chưa có'}</span> | <b>Xếp loại:</b> ${classification.rank} | <b>Tổng tiết vắng:</b> ${calc.totalAbsentPeriods} tiết</p>
      ${calc.owedCoursesCount > 0 ? `<p class="badge-debt">⚠️ CẢNH BÁO: Sinh viên nợ ${calc.owedCoursesCount} môn: ${calc.owedCourses.map((c) => c.courseName).join(', ')}</p>` : '<p style="color: #059669; font-weight: bold;">✓ Không có môn nợ (Đã đạt tất cả các môn xét điểm)</p>'}

      <table>
        <thead>
          <tr>
            <th width="10%">Mã môn</th>
            <th width="35%">Tên môn học</th>
            <th width="10%">Tín chỉ</th>
            <th width="15%">Điểm tổng kết</th>
            <th width="15%">Trạng thái</th>
            <th width="15%">Số tiết vắng</th>
          </tr>
        </thead>
        <tbody>
          ${courses
            .map((c) => {
              const grade = student.grades?.[c.id]?.finalGrade;
              const absent = student.grades?.[c.id]?.absentPeriods || 0;
              const isOwed = grade !== null && grade !== undefined && grade < 4.0;
              return `
                <tr>
                  <td>${c.courseCode}</td>
                  <td>${c.courseName}</td>
                  <td align="center">${c.credits}</td>
                  <td align="center" class="bold">${grade !== null && grade !== undefined ? grade : '-'}</td>
                  <td align="center" class="${isOwed ? 'badge-debt' : ''}">${isOwed ? 'Nợ môn (<4.0)' : grade !== null ? 'Đạt' : 'Chưa có điểm'}</td>
                  <td align="center">${absent > 0 ? `<span style="color:#ea580c; font-weight:bold;">${absent}</span>` : '0'}</td>
                </tr>
              `;
            })
            .join('')}
        </tbody>
      </table>

      <div class="section-title">IV. NHẬT KÝ TRÒ CHUYỆN & TƯ VẤN CỦA CỐ VẤN HỌC TẬP</div>
      ${
        studentLogs.length === 0
          ? '<p><i>Chưa có nhật ký trao đổi riêng với sinh viên này.</i></p>'
          : `<table>
              <thead>
                <tr>
                  <th width="15%">Ngày</th>
                  <th width="30%">Vấn đề trao đổi</th>
                  <th width="30%">Phương án giải quyết</th>
                  <th width="25%">Kết quả đạt được</th>
                </tr>
              </thead>
              <tbody>
                ${studentLogs
                  .map(
                    (l) => `
                  <tr>
                    <td>${l.date}</td>
                    <td>${l.topic}</td>
                    <td>${l.solution}</td>
                    <td>${l.result}${l.followUp ? `<br><i>Ghi chú: ${l.followUp}</i>` : ''}</td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>`
      }

      <div style="margin-top: 40px; float: right; text-align: center; width: 250px;">
        <p style="margin-bottom: 60px;"><i>Ngày ..... tháng ..... năm 20...</i><br><b>CỐ VẤN HỌC TẬP</b></p>
        <p><b>${classGroup.advisorName}</b></p>
      </div>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff' + htmlContent], {
    type: 'application/msword;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Ho_So_${student.studentCode}_${student.fullName.replace(/\s+/g, '_')}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Xuất Danh sách Nhật ký trò chuyện ra file Excel
 */
export function exportCounselingLogsToExcel(
  classGroup: ClassGroup,
  counselingLogs: CounselingLog[]
) {
  const headers = ['STT', 'Ngày', 'Mã SV', 'Họ tên Sinh viên', 'Vấn đề trao đổi', 'Phương án giải quyết', 'Kết quả đạt được', 'Ghi chú theo dõi'];
  const rows = counselingLogs.map((l, idx) => [
    idx + 1,
    l.date,
    l.studentCode,
    l.studentName,
    l.topic,
    l.solution,
    l.result,
    l.followUp || '',
  ]);

  const ws = XLSX.utils.aoa_to_sheet([
    [`NHẬT KÝ TRÒ CHUYỆN VÀ TƯ VẤN SINH VIÊN - ${classGroup.name}`],
    [`Cố vấn học tập: ${classGroup.advisorName} - ${classGroup.advisorPhone}`],
    [],
    headers,
    ...rows,
  ]);

  ws['!cols'] = [
    { wch: 6 },
    { wch: 14 },
    { wch: 14 },
    { wch: 24 },
    { wch: 35 },
    { wch: 35 },
    { wch: 35 },
    { wch: 25 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Nhật ký tư vấn');
  XLSX.writeFile(wb, `Nhat_Ky_Tu_Van_${classGroup.code}.xlsx`);
}

/**
 * Xuất Hồ sơ Sinh viên ra PDF chuẩn in ấn trực tiếp hoặc jsPDF
 */
export function printOrExportPDF(student: Student, classGroup: ClassGroup, courses: Course[], counselingLogs: CounselingLog[]) {
  const calc = calculateStudentGPA(student, courses);
  const classification = getAcademicClassification(calc.gpa);
  const resInfo = getResidenceInfo(student.residenceType);
  const studentLogs = counselingLogs.filter((l) => l.studentId === student.id || l.studentCode === student.studentCode);

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Vui lòng cho phép popup để xuất PDF/In ấn hồ sơ sinh viên!');
    return;
  }

  const printContent = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <title>Hồ sơ sinh viên - ${student.fullName} (${student.studentCode})</title>
      <style>
        @page { size: A4; margin: 15mm; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; font-size: 13px; line-height: 1.5; color: #1e293b; margin: 0; padding: 15px; }
        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #ea580c; padding-bottom: 12px; margin-bottom: 18px; }
        .header-title { font-size: 16px; font-weight: bold; color: #c2410c; }
        .title { text-align: center; font-size: 20px; font-weight: 800; color: #b91c1c; margin: 10px 0 4px; text-transform: uppercase; }
        .sub-title { text-align: center; color: #1d4ed8; font-size: 14px; font-weight: 600; margin-bottom: 20px; }
        .section-title { font-size: 14px; font-weight: 700; color: #c2410c; background-color: #fff7ed; padding: 6px 12px; border-left: 4px solid #ea580c; margin-top: 18px; margin-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
        th, td { border: 1px solid #cbd5e1; padding: 7px 10px; font-size: 12px; }
        th { background-color: #f8fafc; font-weight: 600; text-align: left; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 600; }
        .badge-red { background-color: #fee2e2; color: #991b1b; }
        .badge-green { background-color: #dcfce7; color: #166534; }
        .badge-blue { background-color: #dbeafe; color: #1e40af; }
        .highlight { font-weight: bold; color: #1d4ed8; }
        .footer { margin-top: 30px; display: flex; justify-content: flex-end; }
        .signature-box { text-align: center; width: 220px; }
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="margin-bottom: 15px; padding: 10px; background: #e0f2fe; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
        <span>👉 Bấm nút bên phải để In hoặc Lưu dưới dạng <b>PDF</b>:</span>
        <button onclick="window.print()" style="background: #ea580c; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; cursor: pointer;">🖨️ In / Lưu PDF</button>
      </div>

      <div class="header">
        <div>
          <div class="header-title">ỨNG DỤNG CỐ VẤN HỌC TẬP - NGỌC LÊ</div>
          <div>Khoa Công nghệ Thông tin - Cố vấn: <b>${classGroup.advisorName}</b></div>
        </div>
        <div style="text-align: right; font-size: 12px; color: #64748b;">
          <div>Hotline: <b>0948090287</b></div>
          <div>Email: <b>ngoclecyt@gmail.com</b></div>
        </div>
      </div>

      <div class="title">HỒ SƠ THEO DÕI SINH VIÊN</div>
      <div class="sub-title">Lớp: ${classGroup.name} (${classGroup.code}) | Khóa: ${classGroup.academicYear}</div>

      <div class="section-title">1. THÔNG TIN CÁ NHÂN & LIÊN HỆ</div>
      <table>
        <tr>
          <td width="20%"><b>Mã Sinh viên:</b></td>
          <td width="30%" class="highlight">${student.studentCode}</td>
          <td width="20%"><b>Họ và tên:</b></td>
          <td width="30%" class="highlight" style="font-size:14px;">${student.fullName}</td>
        </tr>
        <tr>
          <td><b>Năm sinh:</b></td>
          <td>${student.birthYear}</td>
          <td><b>Giới tính:</b></td>
          <td>${student.gender}</td>
        </tr>
        <tr>
          <td><b>Dân tộc:</b></td>
          <td>${student.ethnicity}</td>
          <td><b>Cán bộ lớp:</b></td>
          <td>${student.isClassOfficer ? `<span class="badge badge-blue">✓ ${student.officerPosition || 'Cán bộ lớp'}</span>` : 'Sinh viên'}</td>
        </tr>
        <tr>
          <td><b>SĐT Sinh viên:</b></td>
          <td><b>${student.studentPhone}</b></td>
          <td><b>SĐT Người thân:</b></td>
          <td><b>${student.relativePhone}</b></td>
        </tr>
        <tr>
          <td><b>Địa chỉ thường trú:</b></td>
          <td colspan="3">${student.permanentAddress}</td>
        </tr>
      </table>

      <div class="section-title">2. TÌNH TRẠNG CƯ TRÚ</div>
      <table>
        <tr>
          <td width="25%"><b>Hình thức:</b></td>
          <td colspan="3"><span class="badge badge-green">${resInfo.label}</span></td>
        </tr>
        ${
          student.residenceType === 'tro'
            ? `<tr>
                <td><b>Địa chỉ nhà trọ:</b></td>
                <td>${student.boardingAddress || 'Chưa có'}</td>
                <td><b>SĐT Chủ trọ:</b></td>
                <td><b>${student.landlordPhone || 'Chưa có'}</b></td>
              </tr>`
            : ''
        }
        ${
          student.residenceType === 'ktx'
            ? `<tr>
                <td><b>Số phòng KTX:</b></td>
                <td colspan="3"><b>${student.dormRoom || 'Chưa có'}</b></td>
              </tr>`
            : ''
        }
        ${
          student.residenceType === 'nguoi_than'
            ? `<tr>
                <td><b>Địa chỉ người thân:</b></td>
                <td colspan="3">${student.relativeAddress || 'Chưa có'}</td>
              </tr>`
            : ''
        }
      </table>

      <div class="section-title">3. KẾT QUẢ HỌC TẬP & DANH SÁCH MÔN HỌC</div>
      <div style="display: flex; gap: 15px; margin-bottom: 10px;">
        <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 8px 12px; border-radius: 6px; flex: 1;">
          <b>Điểm TB (GPA):</b> <span style="font-size: 16px; font-weight: bold; color: #1d4ed8;">${calc.gpa !== null ? calc.gpa : 'Chưa có'}</span>
          <span style="margin-left: 10px;" class="badge badge-blue">${classification.rank}</span>
        </div>
        <div style="background: #fff7ed; border: 1px solid #fed7aa; padding: 8px 12px; border-radius: 6px; flex: 1;">
          <b>Tổng số tiết vắng:</b> <span style="font-size: 16px; font-weight: bold; color: #ea580c;">${calc.totalAbsentPeriods} tiết</span>
        </div>
        <div style="background: ${calc.owedCoursesCount > 0 ? '#fee2e2' : '#dcfce7'}; border: 1px solid ${calc.owedCoursesCount > 0 ? '#fca5a5' : '#86efac'}; padding: 8px 12px; border-radius: 6px; flex: 1;">
          <b>Môn nợ (&lt; 4.0):</b> <span style="font-size: 16px; font-weight: bold; color: ${calc.owedCoursesCount > 0 ? '#b91c1c' : '#166534'};">${calc.owedCoursesCount} môn</span>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th width="12%">Mã môn</th>
            <th>Tên môn học</th>
            <th width="10%" style="text-align: center;">Tín chỉ</th>
            <th width="15%" style="text-align: center;">Điểm tổng kết</th>
            <th width="15%" style="text-align: center;">Trạng thái</th>
            <th width="15%" style="text-align: center;">Số tiết vắng</th>
          </tr>
        </thead>
        <tbody>
          ${courses
            .map((c) => {
              const grade = student.grades?.[c.id]?.finalGrade;
              const absent = student.grades?.[c.id]?.absentPeriods || 0;
              const isOwed = grade !== null && grade !== undefined && grade < 4.0;
              return `
                <tr>
                  <td><b>${c.courseCode}</b></td>
                  <td>${c.courseName}</td>
                  <td align="center">${c.credits}</td>
                  <td align="center"><b>${grade !== null && grade !== undefined ? grade : '-'}</b></td>
                  <td align="center">
                    ${isOwed ? '<span class="badge badge-red">Nợ môn (&lt;4)</span>' : grade !== null ? '<span class="badge badge-green">Đạt</span>' : '<span style="color:#94a3b8;">Chưa nhập</span>'}
                  </td>
                  <td align="center">${absent > 0 ? `<b style="color:#ea580c;">${absent} tiết</b>` : '0'}</td>
                </tr>
              `;
            })
            .join('')}
        </tbody>
      </table>

      <div class="section-title">4. NHẬT KÝ TRÒ CHUYỆN VÀ TƯ VẤN</div>
      ${
        studentLogs.length === 0
          ? '<p style="color: #64748b; font-style: italic;">Chưa có buổi tư vấn nào được ghi nhận cho sinh viên này.</p>'
          : `<table>
              <thead>
                <tr>
                  <th width="15%">Ngày</th>
                  <th width="28%">Vấn đề trao đổi</th>
                  <th width="28%">Phương án giải quyết</th>
                  <th width="29%">Kết quả đạt được</th>
                </tr>
              </thead>
              <tbody>
                ${studentLogs
                  .map(
                    (l) => `
                  <tr>
                    <td><b>${l.date}</b></td>
                    <td>${l.topic}</td>
                    <td>${l.solution}</td>
                    <td>${l.result}${l.followUp ? `<br><small style="color:#ea580c;">Ghi chú: ${l.followUp}</small>` : ''}</td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>`
      }

      <div class="footer">
        <div class="signature-box">
          <div><i>Cần Thơ, ngày ..... tháng ..... năm 20...</i></div>
          <div style="font-weight: bold; margin-top: 4px; margin-bottom: 50px;">CỐ VẤN HỌC TẬP</div>
          <div style="font-weight: bold; color: #1e293b;">${classGroup.advisorName}</div>
          <div style="font-size: 11px; color: #64748b;">${classGroup.advisorPhone}</div>
        </div>
      </div>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(printContent);
  printWindow.document.close();
}
