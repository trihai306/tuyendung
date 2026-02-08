import { useState } from 'react';
import { useAppSelector } from '../../app/hooks';
import { Input, Textarea, Button } from '../../components/ui';

export function CandidateProfilePage() {
    const { user } = useAppSelector((state) => state.auth);
    const [activeTab, setActiveTab] = useState<'info' | 'cv' | 'settings'>('info');

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 mb-6 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-3xl">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </span>
                    </div>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">{user?.name || 'Ứng viên'}</h1>
                        <p className="text-slate-500 dark:text-slate-400 mb-3">{user?.email}</p>
                        <div className="flex flex-wrap gap-2">
                            <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-sm font-medium rounded-full">
                                Ứng viên
                            </span>
                            <span className="px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-sm font-medium rounded-full">
                                Hồ sơ chưa hoàn thiện
                            </span>
                        </div>
                    </div>
                    <Button size="sm">
                        Chỉnh sửa
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="border-b border-slate-200 dark:border-slate-700">
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
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
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
                                <Input
                                    label="Họ và tên"
                                    type="text"
                                    defaultValue={user?.name || ''}
                                />
                                <Input
                                    label="Email"
                                    type="email"
                                    defaultValue={user?.email || ''}
                                    disabled
                                />
                                <Input
                                    label="Số điện thoại"
                                    type="tel"
                                    placeholder="Nhập số điện thoại"
                                />
                                <Input
                                    label="Ngày sinh"
                                    type="date"
                                />
                                <div className="md:col-span-2">
                                    <Input
                                        label="Địa chỉ"
                                        type="text"
                                        placeholder="Nhập địa chỉ của bạn"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <Textarea
                                        label="Giới thiệu bản thân"
                                        rows={4}
                                        placeholder="Viết vài dòng giới thiệu về bản thân..."
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <Button>Lưu thay đổi</Button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'cv' && (
                        <div className="space-y-6">
                            <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 text-center">
                                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-slate-800 dark:text-white mb-2">Tải lên CV của bạn</h3>
                                <p className="text-slate-500 dark:text-slate-400 mb-4">Hỗ trợ định dạng PDF, DOC, DOCX (tối đa 5MB)</p>
                                <Button>Chọn file</Button>
                            </div>

                            <div>
                                <h3 className="text-lg font-medium text-slate-800 dark:text-white mb-4">CV đã tải lên</h3>
                                <p className="text-slate-500 dark:text-slate-400">Bạn chưa tải lên CV nào</p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-medium text-slate-800 dark:text-white mb-4">Đổi mật khẩu</h3>
                                <div className="space-y-4 max-w-md">
                                    <Input
                                        label="Mật khẩu hiện tại"
                                        type="password"
                                    />
                                    <Input
                                        label="Mật khẩu mới"
                                        type="password"
                                    />
                                    <Input
                                        label="Xác nhận mật khẩu mới"
                                        type="password"
                                    />
                                    <Button>Cập nhật mật khẩu</Button>
                                </div>
                            </div>

                            <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                                <h3 className="text-lg font-medium text-slate-800 dark:text-white mb-4">Thông báo</h3>
                                <div className="space-y-3">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                                        <span className="text-slate-700 dark:text-slate-300">Nhận thông báo việc làm mới qua email</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                                        <span className="text-slate-700 dark:text-slate-300">Thông báo khi có phản hồi từ nhà tuyển dụng</span>
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
