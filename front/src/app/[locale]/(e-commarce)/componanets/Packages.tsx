"use client"
import React, { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import PackageCard from './PackageCard';
import { apiFetch } from '@/app/[locale]/lib/api';
import { useParams } from 'next/navigation';
import { ItemspackageType } from '@/app/types/e-commarce/package.types';
import { Loader2 } from 'lucide-react';
import HeadingTitle from './HeadingTitle';
import CustomPackageCard from './CustomPackageCard';


type IProps = {
	title: string;
	viewmore: string;
	ViewDetails: string;
	DesignYourPackage: string;
	DesignYourPackageDesc: string;
	StartDesigning: string;
	apiUrl: string;
}

const Packages = ({ title, viewmore, ViewDetails, DesignYourPackage, DesignYourPackageDesc, StartDesigning, apiUrl }: IProps) => {
	const params = useParams();
	const locale = params?.locale as string || 'ar';
	const [packages, setPackages] = useState<ItemspackageType[]>([]);
	const [customPackageImages, setCustomPackageImages] = useState<string[]>([]);
	const [loading, setLoading] = useState(true);
	const [activeCardId, setActiveCardId] = useState<string | null>(null);
	const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

	useEffect(() => {
		const fetchPackages = async () => {
			try {
				setLoading(true);
				const res = await apiFetch('/home/packages');
				if (res.ok) {
					const data = await res.json();
					const mappedData: ItemspackageType[] = data.map((item: any) => ({
						id: item._id,
						title: locale === 'ar' ? item['name-ar'] : item['name-en'],
						description: (item[`point-${locale}`] && item[`point-${locale}`].length > 0)
							? item[`point-${locale}`].join(' • ')
							: (item.point && item.point.length > 0 ? item.point.join(' • ') : ''),
						points: item[`point-${locale}`] || item.point || [],
						price: item.price,
						offer: item.offer,
						subnameEn: item['subname-en'],
						image: item.default_image
							? (item.default_image.startsWith('/uploads')
								? `${apiUrl}${item.default_image}`
								: item.default_image)
							: null
					}));
					setPackages(mappedData);
				}

				// Fetch custom package images
				const customImgRes = await apiFetch('/custom-package-images', {
					headers: { 'lang': locale }
				});
				if (customImgRes.ok) {
					const customImgData = await customImgRes.json();
					if (customImgData && customImgData.length > 0) {
						// Assuming data structure based on previous context: it's an array of groups, each has 'images' array.
						// We'll flatten them or take the first active one.
						const activeImages: string[] = [];
						customImgData.forEach((group: any) => {
							if (group.active !== 0 && group.images) {
								activeImages.push(...group.images);
							}
						});
						setCustomPackageImages(activeImages);
					}
				}
			} catch (error) {
				console.error('Error fetching packages:', error);
			} finally {
				setLoading(false);
			}
		};
		fetchPackages();
	}, [locale, apiUrl]);

	useEffect(() => {
		if (loading || packages.length === 0) return;

		// We consider it "mobile/touch" if either it doesn't support hover OR the window is small
		const isTouchOrMobile = window.matchMedia('(hover: none), (pointer: coarse), (max-width: 1024px)').matches;
		if (!isTouchOrMobile) return;

		const visibilityMap = new Map<string, number>();

		const observer = new IntersectionObserver(
			(entries) => {
				// Update ratios for cards that just changed
				entries.forEach((entry) => {
					const id = entry.target.getAttribute('data-card-id');
					if (id) {
						visibilityMap.set(id, entry.isIntersecting ? entry.intersectionRatio : 0);
					}
				});

				// Find the card with the highest visibility ratio
				let maxRatio = 0;
				let currentActiveId: string | null = null;

				visibilityMap.forEach((ratio, id) => {
					if (ratio > maxRatio) {
						maxRatio = ratio;
						currentActiveId = id;
					}
				});

				// If the most visible card is at least 30% visible, activate it
				if (currentActiveId && maxRatio > 0.3) {
					setActiveCardId(currentActiveId);
				} else {
					setActiveCardId(null);
				}
			},
			{
				rootMargin: '-10% 0px -10% 0px',
				threshold: [0, 0.2, 0.4, 0.6, 0.8, 1.0], // Check visibility at these intervals
			}
		);

		cardRefs.current.forEach((el) => observer.observe(el));

		return () => {
			observer.disconnect();
		};
	}, [packages, loading]);

	const setCardRef = useCallback((id: string) => (el: HTMLDivElement | null) => {
		if (el) cardRefs.current.set(id, el);
		else cardRefs.current.delete(id);
	}, []);


	if (loading) {
		return (
			<div className="flex flex-col items-center justify-center py-32 gap-4">
				<Loader2 className="w-12 h-12 text-primary animate-spin opacity-50" />
			</div>
		);
	}

	if (packages.length === 0) return null;

	return (
		<div className='py-16'>
			<div className="flex flex-col items-center mb-16 max-ssmd:mb-10">
				<HeadingTitle>
					{title}
					<span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-primary rounded-full opacity-80"></span>
				</HeadingTitle>
			</div>
			<div className='grid gap-6 grid-cols-3 max-mxmd:grid-cols-2 max-ssmd:grid-cols-1 max-mxxmd:gap-3 relative'>
				{packages.slice(0, 5).map((item, index) => (
					<div
						key={item.id}
						data-card-id={item.id}
						ref={setCardRef(item.id)}
					>
						<PackageCard
							item={item}
							index={index}
							ViewDetails={ViewDetails}
							priority={index < 3}
							locale={locale}
							isScrollActive={activeCardId === item.id}
						/>
					</div>
				))}

				{/* Custom Package Box */}
				<CustomPackageCard
					customPackageImages={customPackageImages}
					DesignYourPackage={DesignYourPackage}
					DesignYourPackageDesc={DesignYourPackageDesc}
					StartDesigning={StartDesigning}
					locale={locale}
					apiUrl={apiUrl}
				/>
				{packages?.length > 5 && (
					<Link href="/more-packages"
						className='mt-10 ml-auto underline absolute -bottom-10 right-2
						text-Brown-color 
						rounded-full text-sm font-bold transition-colors duration-300
					cursor-pointer'>
						{viewmore}
					</Link>
				)}
			</div>
		</div>
	);
};

export default Packages;
