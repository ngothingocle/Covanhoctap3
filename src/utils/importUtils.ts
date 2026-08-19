import * as XLSX from 'xlsx';
import { Student, Gender, ResidenceType } from '../types';

export interface ParsedStudentRow {
  studentCode: string;
  fullName: string;
  birthYear: string;
  gender: Gender;
  ethnicity: string;
  permanentAddress: string;
  studentPhone: string;
  relativePhone: string;
  residenceType: ResidenceType;
  boardingAddress?: string;
  landlordPhone?: string;
  dormRoom?: string;
  relativeAddress?: string;
  isClassOfficer: boolean;
  officerPosition?: string;
}

/**
 * Tạo và tải xuống file mẫu Excel để Cố vấn học tập nhập liệu
 */
export function downloadStudentImportTemplate() {
  const headers = [
    'Mã Sinh Viên (*)',
    'Họ Và Tên (*)',
    'Giới Tính (Nam/Nữ)',
    'Năm Sinh',
    'Dân Tộc',
    'Địa Chỉ Thường Trú',
    'Số Điện Thoại SV',
    'SĐT Người Thân',
    'Hình Thức Cư Trú (Ở trọ / KTX / Nhà người thân / Nhà riêng)',
    'Địa Chỉ Nhà Trọ (nếu ở trọ)',
    'SĐT Chủ Trọ (nếu ở trọ)',
    'Số Phòng KTX (nếu ở KTX)',
    'Địa Chỉ Nhà Người Thân (nếu ở nhà người thân)',
    'Cán Bộ Lớp? (Có / Không)',
    'Chức Vụ Cán Bộ (Lớp trưởng / Lớp phó / Bí thư)',
  ];

  const sampleRows = [
    [
      'SV220199',
      'Lê Thị Thu Cúc',
      'Nữ',
      '2004',
      'Kinh',
      'Số 56 Trần Hưng Đạo, P. An Phú, Ninh Kiều, Cần Thơ',
      '0949112233',
      '0913998877 (Bố Lê Văn An)',
      'Ở trọ',
      'Hẻm 12 Đường 30/4, Xuân Khánh',
      '0988776655 (Bác Bảy)',
      '',
      '',
      'Có',
      'Lớp phó Đời sống',
    ],
    [
      'SV220200',
      'Trần Minh Đức',
      'Nam',
      '2004',
      'Kinh',
      'Ấp Bình Thạnh, Huyện Châu Thành, Bến Tre',
      '0938445566',
      '0908112233 (Mẹ Nguyễn Thị Mai)',
      'KTX',
      '',
      '',
      'Phòng A3-205',
      '',
      'Không',
      '',
    ],
  ];

  const ws = XLSX.utils.aoa_to_sheet([
    ['MẪU NHẬP DANH SÁCH SINH VIÊN - CỐ VẤN HỌC TẬP NGỌC LÊ'],
    ['Lưu ý: Các cột có dấu (*) là bắt buộc. Cán bộ lớp ghi "Có" để được cấp quyền đăng nhập.'],
    [],
    headers,
    ...sampleRows,
  ]);

  ws['!cols'] = [
    { wch: 18 },
    { wch: 25 },
    { wch: 14 },
    { wch: 12 },
    { wch: 12 },
    { wch: 35 },
    { wch: 16 },
    { wch: 25 },
    { wch: 22 },
    { wch: 25 },
    { wch: 18 },
    { wch: 18 },
    { wch: 25 },
    { wch: 16 },
    { wch: 20 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Mau_Nhap_SV');
  XLSX.writeFile(wb, 'Mau_Nhap_Danh_Sach_Sinh_Vien.xlsx');
}

/**
 * Đọc file Excel / CSV và chuyển thành danh sách sinh viên
 */
export async function parseFileToStudents(file: File): Promise<ParsedStudentRow[]> {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  
  // Chuyển sheet thành dạng json mảng các mảng
  const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  if (rows.length === 0) {
    throw new Error('File trống, vui lòng chọn file có dữ liệu.');
  }

  // Tìm dòng tiêu đề (header row)
  let headerRowIndex = -1;
  for (let i = 0; i < Math.min(rows.length, 10); i++) {
    const row = rows[i];
    if (
      row &&
      row.some(
        (cell: any) =>
          typeof cell === 'string' &&
          (cell.toLowerCase().includes('mã sv') ||
            cell.toLowerCase().includes('mã sinh viên') ||
            cell.toLowerCase().includes('họ và tên') ||
            cell.toLowerCase().includes('họ tên') ||
            cell.toLowerCase().includes('student code'))
      )
    ) {
      headerRowIndex = i;
      break;
    }
  }

  if (headerRowIndex === -1) {
    // Nếu không tìm thấy, lấy dòng 0 làm header
    headerRowIndex = 0;
  }

  const headers: string[] = (rows[headerRowIndex] || []).map((h: any) =>
    String(h || '').trim().toLowerCase()
  );

  // Mapping vị trí cột
  const findCol = (keywords: string[]) => {
    return headers.findIndex((h) => keywords.some((k) => h.includes(k)));
  };

  const codeIdx = findCol(['mã sv', 'mã sinh viên', 'masv', 'mssv', 'mã']);
  const nameIdx = findCol(['họ và tên', 'họ tên', 'tên', 'hoten', 'fullname']);
  const genderIdx = findCol(['giới tính', 'gioitinh', 'phái', 'gender']);
  const birthIdx = findCol(['năm sinh', 'ngày sinh', 'namsinh', 'ngaysinh', 'ns', 'dob']);
  const ethnicityIdx = findCol(['dân tộc', 'dantoc', 'ethnic']);
  const addrIdx = findCol(['thường trú', 'địa chỉ', 'diachi', 'hộ khẩu', 'quê quán']);
  const phoneIdx = findCol(['sđt sv', 'sđt sinh viên', 'điện thoại sv', 'sdt sv', 'phone']);
  const relPhoneIdx = findCol(['người thân', 'phụ huynh', 'cha mẹ', 'bố mẹ', 'sđt ph', 'sdt ph']);
  const resIdx = findCol(['cư trú', 'ở trọ', 'chỗ ở', 'hình thức']);
  const boardAddrIdx = findCol(['nhà trọ', 'địa chỉ trọ']);
  const landlordIdx = findCol(['chủ trọ', 'sđt trọ', 'sdt chu tro']);
  const dormIdx = findCol(['ktx', 'ký túc', 'phòng ktx']);
  const relAddrIdx = findCol(['nhà người thân', 'ở nhờ']);
  const officerIdx = findCol(['cán bộ', 'ban cán sự', 'lớp trưởng', 'chức vụ']);

  const parsedStudents: ParsedStudentRow[] = [];

  for (let i = headerRowIndex + 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r || r.length === 0) continue;

    const studentCode = codeIdx >= 0 && r[codeIdx] ? String(r[codeIdx]).trim() : '';
    const fullName = nameIdx >= 0 && r[nameIdx] ? String(r[nameIdx]).trim() : '';

    if (!studentCode && !fullName) continue; // Bỏ qua dòng trống

    const rawGender = genderIdx >= 0 && r[genderIdx] ? String(r[genderIdx]).trim().toLowerCase() : '';
    const gender: Gender = rawGender.includes('nữ') || rawGender === 'f' ? 'Nữ' : 'Nam';

    const rawRes = resIdx >= 0 && r[resIdx] ? String(r[resIdx]).trim().toLowerCase() : '';
    let residenceType: ResidenceType = 'tro';
    if (rawRes.includes('ktx') || rawRes.includes('ký túc')) {
      residenceType = 'ktx';
    } else if (rawRes.includes('người thân') || rawRes.includes('ở nhờ')) {
      residenceType = 'nguoi_than';
    } else if (rawRes.includes('nhà riêng') || rawRes.includes('gia đình')) {
      residenceType = 'nha_rieng';
    }

    const rawOfficer = officerIdx >= 0 && r[officerIdx] ? String(r[officerIdx]).trim() : '';
    const isOfficer =
      rawOfficer.toLowerCase().includes('có') ||
      rawOfficer.toLowerCase().includes('yes') ||
      rawOfficer.toLowerCase().includes('trưởng') ||
      rawOfficer.toLowerCase().includes('phó') ||
      rawOfficer.toLowerCase().includes('bí thư');

    parsedStudents.push({
      studentCode: studentCode || `SV${Math.floor(100000 + Math.random() * 900000)}`,
      fullName: fullName || 'Chưa rõ họ tên',
      birthYear: birthIdx >= 0 && r[birthIdx] ? String(r[birthIdx]).trim() : '2004',
      gender,
      ethnicity: ethnicityIdx >= 0 && r[ethnicityIdx] ? String(r[ethnicityIdx]).trim() : 'Kinh',
      permanentAddress: addrIdx >= 0 && r[addrIdx] ? String(r[addrIdx]).trim() : 'Chưa cập nhật',
      studentPhone: phoneIdx >= 0 && r[phoneIdx] ? String(r[phoneIdx]).trim() : '',
      relativePhone: relPhoneIdx >= 0 && r[relPhoneIdx] ? String(r[relPhoneIdx]).trim() : '',
      residenceType,
      boardingAddress: boardAddrIdx >= 0 && r[boardAddrIdx] ? String(r[boardAddrIdx]).trim() : '',
      landlordPhone: landlordIdx >= 0 && r[landlordIdx] ? String(r[landlordIdx]).trim() : '',
      dormRoom: dormIdx >= 0 && r[dormIdx] ? String(r[dormIdx]).trim() : '',
      relativeAddress: relAddrIdx >= 0 && r[relAddrIdx] ? String(r[relAddrIdx]).trim() : '',
      isClassOfficer: isOfficer,
      officerPosition: isOfficer ? rawOfficer || 'Cán bộ lớp' : undefined,
    });
  }

  return parsedStudents;
}
