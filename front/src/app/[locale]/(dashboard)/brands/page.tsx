"use client"
import React, { useState, useEffect, useRef } from 'react'
import { Plus, Trash2, ImageIcon, Loader2, X, Upload, Save } from 'lucide-react'
import { apiFetch } from '@/app/[locale]/lib/api'
import { compressImage } from '@/utils/imageUtils';
import ProgressBar from '../componanets/ProgressBar';

interface Partner {
	_id: string;
	title: string;
	image: string;
}

const BrandsManagement = () => {
	const [partners, setPartners] = useState<Partner[]>([])
	const [loading, setLoading] = useState(true)
	const [modalOpen, setModalOpen] = useState(false)
	const [formData, setFormData] = useState({ title: '', image: null as File | null })
	const [preview, setPreview] = useState<string | null>(null)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [deletingId, setDeletingId] = useState<string | null>(null)
	const fileInputRef = useRef<HTMLInputElement>(null)

	const fetchPartners = async () => {
		try {
			setLoading(true)
			const res = await apiFetch('/dashboard/partners')
			if (!res.ok) throw new Error('Failed to fetch')
			const data = await res.json()
			setPartners(data)
		} catch (error) {
			console.error('Error fetching partners:', error)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchPartners()
	}, [])

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (file) {
			try {
				// Compress partner logo to 800px
				const compressedBlob = await compressImage(file, 800, 800, 0.7);
				const compressedFile = new File([compressedBlob], file.name, {
					type: 'image/jpeg',
					lastModified: Date.now(),
				});

				setFormData({ ...formData, image: compressedFile })
				const reader = new FileReader()
				reader.onloadend = () => setPreview(reader.result as string)
				reader.readAsDataURL(compressedFile)
			} catch (error) {
				console.error('Partner logo compression failed:', error);
				// Fallback to original file
				setFormData({ ...formData, image: file })
				const reader = new FileReader()
				reader.onloadend = () => setPreview(reader.result as string)
				reader.readAsDataURL(file)
			}
		}
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!formData.image) return alert('يرجى اختيار صورة')

		let retries = 3;
		let success = false;

		while (retries > 0 && !success) {
			setIsSubmitting(true)
			const body = new FormData()
			body.append('title', formData.title)
			body.append('image', formData.image)

			try {
				const res = await apiFetch('/dashboard/partners', {
					method: 'POST',
					body,
					timeout: 60000 // 60 seconds timeout
				})
				if (res.ok) {
					setModalOpen(false)
					setFormData({ title: '', image: null })
					setPreview(null)
					fetchPartners()
					success = true;
				} else {
					const err = await res.json()
					alert(err.message || 'فشلت عملية الإضافة')
					break; // Don't retry on non-timeout errors
				}
			} catch (error: any) {
				if (error.message === 'TIMEOUT' && retries > 1) {
					retries--;
					console.warn(`Partner upload timed out. Retrying... (${3 - retries}/3)`);
					setIsSubmitting(false); // Reset progress bar
					await new Promise(resolve => setTimeout(resolve, 500)); // Small delay before retry
					continue;
				}
				console.error('Error adding partner:', error)
				alert(error.message || 'حدث خطأ غير متوقع');
				break;
			}
		}
		if (success) {
			setIsSubmitting(false);
			// Give the progress bar 800ms for completion animation before the modal closes
			await new Promise(resolve => setTimeout(resolve, 800));
		} else {
			setIsSubmitting(false);
		}
	}

	const handleDelete = async (id: string) => {
		if (!confirm('هل أنت متأكد من الحذف؟')) return
		try {
			setDeletingId(id);
			const res = await apiFetch(`/dashboard/partners/${id}`, {
				method: 'DELETE',
			})
			if (res.ok) fetchPartners()
		} catch (error) {
			console.error('Error deleting partner:', error)
		} finally {
			setDeletingId(null);
		}
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold text-foreground">شركاء النجاح / البراندات</h1>
					<p className="text-muted-foreground text-sm">إدارة شعارات الشركاء والبراندات المعروضة في الموقع</p>
				</div>
				<button
					onClick={() => setModalOpen(true)}
					className="flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-primary/20 font-bold"
				>
					<Plus size={20} />
					إضافة جديد
				</button>
			</div>

			{loading ? (
				<div className="flex flex-col items-center justify-center py-32 gap-4">
					<Loader2 className="w-12 h-12 text-primary animate-spin opacity-50" />
					<p className="text-muted-foreground font-medium">جاري جلب البيانات...</p>
				</div>
			) : (
				<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
					{partners.map((partner) => (
						<div key={partner._id} className="group relative bg-card/40 backdrop-blur-xl border border-border rounded-3xl p-6 hover:border-primary/50 transition-all overflow-hidden shadow-xl">
							<div className="aspect-square flex items-center justify-center mb-4">
								<img
									src={partner.image.startsWith('/uploads') ? `http://localhost:5000${partner.image}` : partner.image}
									alt={partner.title}
									className="max-w-full max-h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
								/>
							</div>
							<p className="text-center font-bold text-sm truncate">{partner.title}</p>
							<button
								onClick={() => handleDelete(partner._id)}
								disabled={deletingId === partner._id}
								className={`absolute top-4 left-4 w-10 h-10 flex items-center justify-center rounded-xl transition-all shadow-sm ${deletingId === partner._id
										? 'bg-muted text-muted-foreground cursor-not-allowed'
										: 'bg-rose-500/10 text-rose-600 hover:bg-rose-600 hover:text-white'
									}`}
							>
								{deletingId === partner._id ? (
									<Loader2 size={18} className="animate-spin" />
								) : (
									<Trash2 size={18} />
								)}
							</button>
						</div>
					))}
				</div>
			)}

			{modalOpen && (
				<div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
					<div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
					<div className="relative bg-card border border-border w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in">
						<div className="p-8 border-b border-border/50 flex items-center justify-between">
							<h3 className="text-xl font-black">إضافة شريك جديد</h3>
							<button
								onClick={() => setModalOpen(false)}
								className="cursor-pointer p-3 hover:bg-red-100 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-200/40 rounded-2xl transition-all max-h-[44px]"
							>
								<X size={20} />
							</button>
						</div>
						<form onSubmit={handleSubmit} className="p-8 space-y-6 text-right">
							<div className="space-y-2">
								<label className="text-xs font-black text-muted-foreground/80 mr-1">الاسم / العنوان</label>
								<input
									type="text"
									required
									value={formData.title}
									onChange={(e) => setFormData({ ...formData, title: e.target.value })}
									className="w-full bg-background border-1 border-blue-500/70 focus:border-blue-500 focus:border rounded-2xl px-5 py-3.5 outline-none focus:shadow-none transition-all text-sm font-black shadow-sm"
									placeholder="اسم البراند أو الشريك"
								/>
							</div>
							<div className="space-y-2">
								<label className="text-xs font-black text-muted-foreground/80 mr-1">الشعار (Logo)</label>
								<div
									onClick={() => fileInputRef.current?.click()}
									className="w-full aspect-square rounded-3xl border-2 border-dashed border-border hover:border-primary transition-all overflow-hidden flex flex-col items-center justify-center bg-background/50 cursor-pointer"
								>
									{preview ? (
										<img src={preview} alt="Preview" className="w-full h-full object-contain p-4" />
									) : (
										<div className="flex flex-col items-center gap-2 text-muted-foreground">
											<Upload size={32} />
											<span className="text-xs font-bold">اختيار صورة الشعار</span>
										</div>
									)}
								</div>
								<input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
							</div>

							<ProgressBar isUploading={isSubmitting} />

							<div className="pt-6 border-t border-border/50 flex items-center gap-4 w-full">
								<button
									type="submit"
									disabled={isSubmitting}
									className="cursor-pointer flex-1 flex items-center justify-center gap-3 bg-primary text-white py-4 rounded-2xl hover:opacity-95 active:scale-95 transition-all font-black shadow-xl shadow-primary/30 disabled:opacity-50"
								>
									<Save size={20} />
									{isSubmitting ? 'جاري الحفظ...' : 'حفظ الآن'}
								</button>
								<button
									type="button"
									onClick={() => setModalOpen(false)}
									className="cursor-pointer px-15 flex items-center justify-center gap-3 bg-red-500 text-white py-4 rounded-2xl hover:opacity-95 active:scale-95 transition-all font-black shadow-xl shadow-primary/30"
								>
									إلغاء
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	)
}

export default BrandsManagement;
