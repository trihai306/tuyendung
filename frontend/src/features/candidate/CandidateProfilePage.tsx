import { useState } from 'react';
import { useAppSelector } from '../../app/hooks';

export function CandidateProfilePage() {
    const { user } = useAppSelector((state) => state.auth);
    const [activeTab, setActiveTab] = useState<'info' | 'cv' | 'settings'>('info');

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-3xl">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </span>
                    </div>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-slate-800 mb-1">{user?.name || 'Ứng viên'}</h1>
                        <p className="text-slate-500 mb-3">{user?.email}</p>
                        <div className="flex flex-wrap gap-2">
                            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-sm font-medium rounded-full">
                                Ứng viên
                            </span>
                            <span className="px-3 py-1 bg-amber-50 text-amber-600 text-sm font-medium rounded-full">
                                Hồ sơ chưa hoàn thiện
                            </span>
                        </div>
                    </div>
                    <button className="px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors">
                        Chỉnh sửa
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="border-b border-slate-200">
                    <nav className="flex">
                        {[
                            { id: 'info', label: 'Thông tin cá nhân' },
                            { id: 'cv', label: 'CV & Hồ sơ' },
                            { id: 'settings', label: 'Cài đặt tài khoản' },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                                className={`px-6 py-4 text-sm font-medium transition-colors relative ${activeTab === tab.id
                                        ? 'text-emerald-600'
                                        : 'text-slate-500 hover:text-slate-800'
                                    }`}
                            >
                                {tab.label}
                                {activeTab === tab.id && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />
                                )}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="p-6">
                    {activeTab === 'info' && (
                        <div className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Họ và tên</label>
                                    <input
                                        type="text"
                                        defaultValue={user?.name || ''}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                                    <input
                                        type="email"
                                        defaultValue={user?.email || ''}
                                        disabled
                                        className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-slate-50 text-slate-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Số điện thoại</label>
                                    <input
                                        type="tel"
                                        placeholder="Nhập số điện thoại"
                                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Ngày sinh</label>
                                    <input
                                        type="date"
                                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Địa chỉ</label>
                                    <input
                                        type="text"
                                        placeholder="Nhập địa chỉ của bạn"
                                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Giới thiệu bản thân</label>
                                    <textarea
                                        rows={4}
                                        placeholder="Viết vài dòng giới thiệu về bản thân..."
                                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <button className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors">
                                    Lưu thay đổi
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'cv' && (
                        <div className="space-y-6">
                            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center">
                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-slate-800 mb-2">Tải lên CV của bạn</h3>
                                <p className="text-slate-500 mb-4">Hỗ trợ định dạng PDF, DOC, DOCX (tối đa 5MB)</p>
                                <button className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors">
                                    Chọn file
                                </button>
                            </div>

                            <div>
                                <h3 className="text-lg font-medium text-slate-800 mb-4">CV đã tải lên</h3>
                                <p className="text-slate-500">Bạn chưa tải lên CV nào</p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-medium text-slate-800 mb-4">Đổi mật khẩu</h3>
                                <div className="space-y-4 max-w-md">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Mật khẩu hiện tại</label>
                                        <input
                                            type="password"
                                            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Mật khẩu mới</label>
                                        <input
                                            type="password"
                                            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Xác nhận mật khẩu mới</label>
                                        <input
                                            type="password"
                                            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        />
                                    </div>
                                    <button className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors">
                                        Cập nhật mật khẩu
                                    </button>
                                </div>
                            </div>

                            <div className="border-t border-slate-200 pt-6">
                                <h3 className="text-lg font-medium text-slate-800 mb-4">Thông báo</h3>
                                <div className="space-y-3">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                                        <span className="text-slate-700">Nhận thông báo việc làm mới qua email</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                                        <span className="text-slate-700">Thông báo khi có phản hồi từ nhà tuyển dụng</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
