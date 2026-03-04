"use client"
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import DashContainer from '../DashContainer/DashContainer';
import { LayoutDashboard, Bell, User, Settings, LogOut, X, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { useSidebar } from '../SidebarContext'
import { apiFetch } from '../../../lib/api'

const DashHeader = () => {
	const { toggle } = useSidebar();
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [isSettingsOpen, setIsSettingsOpen] = useState(false);
	const [isSuccessPopupOpen, setIsSuccessPopupOpen] = useState(false);
	const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false); // Added state
	const dropdownRef = useRef<HTMLDivElement>(null);

	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState({ type: '', text: '' });
	const [formData, setFormData] = useState({
		currentPassword: '',
		newUsername: '',
		newPassword: ''
	});
	const [currentUsername, setCurrentUsername] = useState('مسؤول النظام');
	const [showCurrentPassword, setShowCurrentPassword] = useState(false);
	const [showNewPassword, setShowNewPassword] = useState(false);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsDropdownOpen(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	useEffect(() => {
		if (typeof window !== 'undefined') {
			try {
				const userStr = localStorage.getItem('user');
				if (userStr) {
					const userObj = JSON.parse(userStr);
					const name = userObj.username || userObj.name || 'مسؤول النظام';
					setCurrentUsername(name);
					setFormData(prev => ({ ...prev, newUsername: name }));
				}
			} catch (e) { }
		}
	}, [isSettingsOpen]); // Update when modal opens

	const handleLogout = () => {
		localStorage.removeItem('accessToken');
		localStorage.removeItem('refreshToken');
		localStorage.removeItem('user');
		window.location.replace('/mimo');
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value
		});
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setMessage({ type: '', text: '' });

		try {
			const res = await apiFetch('/users/update-credentials', {
				method: 'PUT',
				body: JSON.stringify(formData),
			});

			const data = await res.json();

			if (res.ok) {
				setMessage({ type: 'success', text: data.message || 'تم تحديث البيانات بنجاح' });
				if (formData.newUsername) {
					try {
						const userStr = localStorage.getItem('user');
						if (userStr) {
							const userObj = JSON.parse(userStr);
							userObj.username = formData.newUsername;
							userObj.name = formData.newUsername;
							localStorage.setItem('user', JSON.stringify(userObj));
							setCurrentUsername(formData.newUsername);
						}
					} catch (e) { }
				}
				setIsSettingsOpen(false);
				setIsSuccessPopupOpen(true);
				setTimeout(() => {
					setIsSuccessPopupOpen(false);
					setMessage({ type: '', text: '' });
					handleLogout();
				}, 2500);
			} else {
				setMessage({ type: 'error', text: data.message || 'حدث خطأ أثناء التحديث' });
			}
		} catch (error) {
			setMessage({ type: 'error', text: 'حدث خطأ في الاتصال بالخادم' });
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<header className='h-16 border-b border-border bg-card/30 backdrop-blur-md sticky top-0 left-0 right-0 z-50 px-0'>
				<DashContainer isHeader className="h-full flex items-center justify-between">
					<div className="flex items-center gap-5">
						<button className="cursor-pointer w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300"
							onClick={toggle}
						>
							<LayoutDashboard className="text-white w-6 h-6" />
						</button>
						<Link href="/dash-home" className="flex items-center group">
							<span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent hidden sm:block">
								لوحة الإدارة
							</span>
						</Link>
					</div>

					<div className="flex items-center gap-2 md:gap-4 lg:ml-64">
						{/* Profile Dropdown */}
						<div className="relative" ref={dropdownRef}>
							<div
								className="flex items-center gap-2 md:gap-3 pl-2 cursor-pointer hover:bg-secondary/50 p-1 pr-3 rounded-full transition-all"
								onClick={() => setIsDropdownOpen(!isDropdownOpen)}
							>
								<div className="text-left hidden sm:block">
									<p className="text-sm font-bold leading-tight line-clamp-1">مسؤول النظام</p>
									<p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{currentUsername}</p>
								</div>
								<div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gradient-primary p-[2px]">
									<div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden">
										<User className="text-primary w-5 h-5 md:w-6 md:h-6" />
									</div>
								</div>
							</div>

							{/* Dropdown Menu */}
							{isDropdownOpen && (
								<div className="absolute left-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-lg overflow-hidden py-1 z-50 animate-in fade-in slide-in-from-top-2">
									<button
										onClick={() => {
											setIsSettingsOpen(true);
											setIsDropdownOpen(false);
										}}
										className="cursor-pointer w-full flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-secondary hover:text-primary transition-colors text-right"
									>
										<Settings size={18} />
										<span>اعداد الحساب</span>
									</button>
									<div className="h-px bg-border my-1"></div>
									<button
										onClick={() => {
											setIsLogoutModalOpen(true);
											setIsDropdownOpen(false);
										}}
										className="cursor-pointer w-full flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-secondary hover:text-primary transition-colors text-right"
									>
										<LogOut size={18} />
										<span>تسجيل الخروج</span>
									</button>
								</div>
							)}
						</div>
					</div>
				</DashContainer>
			</header>

			{/* Settings Modal */}
			{isSettingsOpen && (
				<div
					className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
					onClick={() => setIsSettingsOpen(false)}
				>
					<div
						className="bg-card w-full max-w-md rounded-2xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-200"
						onClick={e => e.stopPropagation()}
						dir="rtl"
					>
						<div className="p-5 border-b border-border flex items-center justify-between bg-secondary/30">
							<h3 className="text-xl font-bold">إعدادات الحساب</h3>
							<button
								onClick={() => setIsSettingsOpen(false)}
								className="cursor-pointer p-3 hover:bg-red-100 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-200/40 rounded-2xl transition-all max-h-[44px]"
							>
								<X size={20} />
							</button>
						</div>

						<div className="p-6">
							{message.text && (
								<div className={`p-4 mb-6 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-100/10 text-green-500 border border-green-500/20' : 'bg-red-100/10 text-red-500 border border-red-500/20'}`}>
									{message.text}
								</div>
							)}

							<form onSubmit={handleSubmit} className="space-y-5">
								<div>
									<label className="block text-sm font-medium text-muted-foreground mb-2">
										اسم المستخدم الجديد
									</label>
									<input
										type="text"
										name="newUsername"
										value={formData.newUsername}
										onChange={handleChange}
										className="w-full px-4 py-3 rounded-xl border border-border bg-background/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
										placeholder="اسم المستخدم الحالي"
									/>
								</div>

								<div className="pt-4 border-t border-border/50">
									<label className="block text-sm font-medium text-muted-foreground mb-2">
										كلمة المرور الحالية (مطلوب)
									</label>
									<div className="relative">
										<input
											type={showCurrentPassword ? "text" : "password"}
											name="currentPassword"
											required
											value={formData.currentPassword}
											onChange={handleChange}
											className="w-full px-4 py-3 pl-10 rounded-xl border border-border bg-background/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
											placeholder="أدخل كلمة المرور الحالية"
										/>
										<button
											type="button"
											className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors focus:outline-none"
											onClick={() => setShowCurrentPassword(!showCurrentPassword)}
										>
											{showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
										</button>
									</div>
								</div>

								<div>
									<label className="block text-sm font-medium text-muted-foreground mb-2">
										كلمة المرور الجديدة (اختياري)
									</label>
									<div className="relative">
										<input
											type={showNewPassword ? "text" : "password"}
											name="newPassword"
											value={formData.newPassword}
											onChange={handleChange}
											className="w-full px-4 py-3 pl-10 rounded-xl border border-border bg-background/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
											placeholder="أدخل كلمة المرور الجديدة (أو اتركها فارغة)"
										/>
										<button
											type="button"
											className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors focus:outline-none"
											onClick={() => setShowNewPassword(!showNewPassword)}
										>
											{showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
										</button>
									</div>
								</div>

								<div className="pt-4">
									<button
										type="submit"
										disabled={loading || !formData.currentPassword}
										className="w-full py-3.5 bg-gradient-primary text-white rounded-xl font-bold text-sm shadow-lg hover:shadow-primary/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5"
									>
										{loading ? 'جاري التحديث...' : 'حفظ التغييرات'}
									</button>
								</div>
							</form>
						</div>
					</div>
				</div>
			)}

			{/* Success Popup Modal */}
			{isSuccessPopupOpen && (
				<div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
					<div className="bg-card w-full max-w-sm rounded-3xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-500 p-8 flex flex-col items-center justify-center text-center">
						<div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
							<CheckCircle className="w-10 h-10 text-green-500 animate-bounce" />
						</div>
						<h3 className="text-2xl font-bold mb-2">نجاح!</h3>
						<p className="text-muted-foreground mb-6">تم تحديث بيانات الحساب بنجاح.</p>
						<p className="text-sm text-primary font-medium animate-pulse">جاري تسجيل الخروج...</p>
					</div>
				</div>
			)}

			{/* Logout Confirmation Modal */}
			{isLogoutModalOpen && (
				<div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
					<div
						className="bg-card w-full max-w-sm rounded-[2rem] shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-200"
						dir="rtl"
					>
						<div className="p-8 pb-10 flex flex-col items-center text-center">
							<div className="w-20 h-20 rounded-full bg-rose-500/10 flex items-center justify-center mb-6 shadow-inner text-rose-500">
								<LogOut size={40} className="mr-1" />
							</div>

							<h3 className="text-2xl font-black mb-3">تسجيل الخروج</h3>
							<p className="text-muted-foreground font-medium leading-relaxed mb-8">
								هل أنت متأكد أنك تريد تسجيل الخروج من لوحة التحكم؟
							</p>

							<div className="flex w-full gap-3">
								<button
									onClick={handleLogout}
									className="flex-1 bg-rose-500 text-white py-3.5 rounded-2xl font-black hover:bg-rose-600 transition-all hover:shadow-lg hover:shadow-rose-500/20 active:scale-[0.98]"
								>
									تأكيد الخروج
								</button>
								<button
									onClick={() => setIsLogoutModalOpen(false)}
									className="flex-1 bg-secondary text-foreground py-3.5 rounded-2xl font-bold hover:bg-secondary/70 transition-all active:scale-[0.98]"
								>
									إلغاء
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
};

export default DashHeader
