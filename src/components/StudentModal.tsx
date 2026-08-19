import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Phone,
  Home,
  Building,
  ShieldCheck,
  Save,
  AlertCircle,
  Key,
} from 'lucide-react';
import { ClassGroup, Gender, ResidenceType, Student } from '../types';

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (studentData: Partial<Student>) => void;
  studentToEdit?: Student | null;
  classGroup: ClassGroup;
}

export const StudentModal: React.FC<StudentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  studentToEdit,
  classGroup,
}) => {
  const [studentCode, setStudentCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [birthYear, setBirthYear] = useState('2004');
  const [gender, setGender] = useState<Gender>('Nam');
  const [ethnicity, setEthnicity] = useState('Kinh');
  const [permanentAddress, setPermanentAddress] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [relativePhone, setRelativePhone] = useState('');
  
  // Residence
  const [residenceType, setResidenceType] = useState<ResidenceType>('tro');
  const [boardingAddress, setBoardingAddress] = useState('');
  const [landlordPhone, setLandlordPhone] = useState('');
  const [dormRoom, setDormRoom] = useState('');
  const [relativeAddress, setRelativeAddress] = useState('');

  // Class Officer
  const [isClassOfficer, setIsClassOfficer] = useState(false);
  const [officerPosition, setOfficerPosition] = useState('Lớp trưởng');
  const [officerPassword, setOfficerPassword] = useState('');

  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (studentToEdit) {
      setStudentCode(studentToEdit.studentCode);
      setFullName(studentToEdit.fullName);
      setBirthYear(studentToEdit.birthYear || '2004');
      setGender(studentToEdit.gender || 'Nam');
      setEthnicity(studentToEdit.ethnicity || 'Kinh');
      setPermanentAddress(studentToEdit.permanentAddress || '');
      setStudentPhone(studentToEdit.studentPhone || '');
      setRelativePhone(studentToEdit.relativePhone || '');
      setResidenceType(studentToEdit.residenceType || 'tro');
      setBoardingAddress(studentToEdit.boardingAddress || '');
      setLandlordPhone(studentToEdit.landlordPhone || '');
      setDormRoom(studentToEdit.dormRoom || '');
      setRelativeAddress(studentToEdit.relativeAddress || '');
      setIsClassOfficer(studentToEdit.isClassOfficer || false);
      setOfficerPosition(studentToEdit.officerPosition || 'Lớp trưởng');
      setOfficerPassword(studentToEdit.officerPassword || studentToEdit.studentCode);
      setNotes(studentToEdit.notes || '');
    } else {
      // Reset defaults for new student
      setStudentCode(`SV22${Math.floor(1000 + Math.random() * 9000)}`);
      setFullName('');
      setBirthYear('2004');
      setGender('Nam');
      setEthnicity('Kinh');
      setPermanentAddress('');
      setStudentPhone('');
      setRelativePhone('');
      setResidenceType('tro');
      setBoardingAddress('');
      setLandlordPhone('');
      setDormRoom('');
      setRelativeAddress('');
      setIsClassOfficer(false);
      setOfficerPosition('Lớp trưởng');
      setOfficerPassword('');
      setNotes('');
    }
    setError(null);
  }, [studentToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentCode.trim() || !fullName.trim()) {
      setError('Vui lòng nhập Mã Sinh viên và Họ tên đầy đủ!');
      return;
    }

    const payload: Partial<Student> = {
      studentCode: studentCode.trim(),
      fullName: fullName.trim(),
      classId: classGroup.id,
      birthYear: birthYear.trim(),
      gender,
      ethnicity: ethnicity.trim(),
      permanentAddress: permanentAddress.trim() || 'Chưa cập nhật',
      studentPhone: studentPhone.trim(),
      relativePhone: relativePhone.trim(),
      residenceType,
      boardingAddress: residenceType === 'tro' ? boardingAddress.trim() : undefined,
      landlordPhone: residenceType === 'tro' ? landlordPhone.trim() : undefined,
      dormRoom: residenceType === 'ktx' ? dormRoom.trim() : undefined,
      relativeAddress: residenceType === 'nguoi_than' ? relativeAddress.trim() : undefined,
      isClassOfficer,
      officerPosition: isClassOfficer ? officerPosition.trim() : undefined,
      officerPassword: isClassOfficer ? (officerPassword.trim() || studentCode.trim()) : undefined,
      notes: notes.trim(),
    };

    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-orange-200 overflow-hidden my-8">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-red-600 via-orange-600 to-blue-700 p-5 text-white flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-xs">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">
                {studentToEdit ? 'Chỉnh sửa Thông tin Sinh viên' : 'Thêm Sinh viên Mới'}
              </h3>
              <p className="text-xs text-orange-100">
                Lớp: {classGroup.name} ({classGroup.code})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Thông tin cơ bản */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-orange-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-orange-100 pb-1">
              <User className="w-4 h-4 text-orange-600" />
              1. Thông tin Cá nhân Sinh viên
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mã Sinh viên (*):
                </label>
                <input
                  type="text"
                  required
                  value={studentCode}
                  onChange={(e) => setStudentCode(e.target.value)}
                  placeholder="Ví dụ: SV220101"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Họ và tên Sinh viên (*):
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn Hùng"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Giới tính:
                </label>
                <div className="flex gap-4 pt-1">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value="Nam"
                      checked={gender === 'Nam'}
                      onChange={() => setGender('Nam')}
                      className="text-orange-600 focus:ring-orange-500"
                    />
                    <span>Nam</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value="Nữ"
                      checked={gender === 'Nữ'}
                      onChange={() => setGender('Nữ')}
                      className="text-orange-600 focus:ring-orange-500"
                    />
                    <span>Nữ</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Năm sinh / Ngày sinh:
                </label>
                <input
                  type="text"
                  value={birthYear}
                  onChange={(e) => setBirthYear(e.target.value)}
                  placeholder="2004 hoặc 15/08/2004"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Dân tộc:
                </label>
                <input
                  type="text"
                  value={ethnicity}
                  onChange={(e) => setEthnicity(e.target.value)}
                  placeholder="Kinh, Tày, Khmer, Hoa..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Số điện thoại Sinh viên:
                </label>
                <input
                  type="text"
                  value={studentPhone}
                  onChange={(e) => setStudentPhone(e.target.value)}
                  placeholder="0912345678"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                SĐT Người thân (Kèm họ tên & vai vế):
              </label>
              <input
                type="text"
                value={relativePhone}
                onChange={(e) => setRelativePhone(e.target.value)}
                placeholder="Ví dụ: 0903123456 (Bố - Nguyễn Văn Thành)"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Địa chỉ thường trú (Hộ khẩu):
              </label>
              <input
                type="text"
                value={permanentAddress}
                onChange={(e) => setPermanentAddress(e.target.value)}
                placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Section 2: Tình trạng Cư trú */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-blue-100 pb-1">
              <Home className="w-4 h-4 text-blue-600" />
              2. Tình trạng Cư trú hiện tại
            </h4>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Hình thức cư trú:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'tro', label: '🏠 Ở trọ' },
                  { id: 'ktx', label: '🏢 Ở KTX' },
                  { id: 'nguoi_than', label: '👥 Nhà người thân' },
                  { id: 'nha_rieng', label: '🏡 Nhà riêng' },
                ].map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => setResidenceType(item.id as ResidenceType)}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition text-center ${
                      residenceType === item.id
                        ? 'bg-blue-50 border-blue-500 text-blue-800 ring-1 ring-blue-500'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* If Ở trọ */}
            {residenceType === 'tro' && (
              <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2.5">
                <div>
                  <label className="block text-xs font-bold text-amber-900 mb-1">
                    Địa chỉ nhà trọ:
                  </label>
                  <input
                    type="text"
                    value={boardingAddress}
                    onChange={(e) => setBoardingAddress(e.target.value)}
                    placeholder="Số nhà, hẻm, đường, khu vực..."
                    className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-amber-900 mb-1">
                    SĐT Chủ nhà trọ:
                  </label>
                  <input
                    type="text"
                    value={landlordPhone}
                    onChange={(e) => setLandlordPhone(e.target.value)}
                    placeholder="Ví dụ: 0987654321 (Bác Ba chủ trọ)"
                    className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* If KTX */}
            {residenceType === 'ktx' && (
              <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
                <label className="block text-xs font-bold text-blue-900 mb-1">
                  Số phòng KTX & Khu Ký túc xá:
                </label>
                <input
                  type="text"
                  value={dormRoom}
                  onChange={(e) => setDormRoom(e.target.value)}
                  placeholder="Ví dụ: Phòng B2-304 (KTX Khu B)"
                  className="w-full px-3 py-2 bg-white border border-blue-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            )}

            {/* If Nhà người thân */}
            {residenceType === 'nguoi_than' && (
              <div className="p-3.5 bg-purple-50/70 border border-purple-200 rounded-xl space-y-2">
                <label className="block text-xs font-bold text-purple-900 mb-1">
                  Địa chỉ và Họ tên người thân ở cùng:
                </label>
                <input
                  type="text"
                  value={relativeAddress}
                  onChange={(e) => setRelativeAddress(e.target.value)}
                  placeholder="Ví dụ: Nhà Dì Út - Số 123 CMT8, Ninh Kiều, Cần Thơ"
                  className="w-full px-3 py-2 bg-white border border-purple-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Section 3: Cán bộ lớp & Phân quyền ứng dụng */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-emerald-100 pb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              3. Phân quyền Cán bộ lớp (Cấp quyền Điểm danh)
            </h4>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isClassOfficer}
                  onChange={(e) => setIsClassOfficer(e.target.checked)}
                  className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500 cursor-pointer"
                />
                <span>Đánh dấu là Cán bộ lớp (Được cấp tài khoản đăng nhập vào app)</span>
              </label>

              {isClassOfficer && (
                <div className="pt-2 border-t border-slate-200 space-y-3 animate-in fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Chức vụ Cán bộ:
                      </label>
                      <select
                        value={officerPosition}
                        onChange={(e) => setOfficerPosition(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                      >
                        <option value="Lớp trưởng">Lớp trưởng</option>
                        <option value="Lớp phó Học tập">Lớp phó Học tập</option>
                        <option value="Lớp phó Đời sống">Lớp phó Đời sống</option>
                        <option value="Bí thư Chi đoàn">Bí thư Chi đoàn</option>
                        <option value="Phó Bí thư">Phó Bí thư</option>
                        <option value="Ủy viên BCH">Ủy viên BCH</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                        <Key className="w-3.5 h-3.5 text-orange-600" />
                        Mã đăng nhập (Mật khẩu):
                      </label>
                      <input
                        type="text"
                        value={officerPassword}
                        onChange={(e) => setOfficerPassword(e.target.value)}
                        placeholder={`Mặc định: ${studentCode || 'Mã SV'}`}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-semibold"
                      />
                      <span className="text-[10px] text-slate-500 mt-0.5 block">
                        Tài khoản: <b>{studentCode}</b> | Mật khẩu: <b>{officerPassword || studentCode}</b>
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-900">
                    ℹ️ Cán bộ lớp này sẽ có thể đăng nhập vào ứng dụng và <b>chỉ được phép thực hiện Điểm danh sinh viên vắng học</b>.
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Ghi chú */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Ghi chú riêng của Cố vấn học tập:
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ghi chú về hoàn cảnh, tính cách, theo dõi đặc biệt..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white text-xs font-bold rounded-xl shadow-md shadow-orange-500/20 transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{studentToEdit ? 'Lưu Thay đổi' : 'Lưu Sinh viên'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
