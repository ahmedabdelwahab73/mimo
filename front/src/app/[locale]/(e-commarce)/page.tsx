import SwigerLanding from './componanets/SwigerLanding';
import Packages from './componanets/Packages';
import Testimonials from './componanets/Testimonials';
import Partners from './componanets/Partners';
import Container from '@/components/Container';
import { getLocale, getTranslations } from 'next-intl/server';

const Mainpage = async () => {
	const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
	const locale = await getLocale();
	const t = await getTranslations('HomePage');

	// Fetch slider data from the backend API
	let sliderData = [];
	try {
		const res = await fetch(`${apiUrl}/api/home/sliders`, {
			headers: {
				'lang': locale,
			},
			cache: 'no-store',
			// next: { revalidate: 120 }

		});
		if (res.ok) {
			const data = await res.json();

			sliderData = data;
		}
	} catch (error) {
		console.error('Failed to fetch slider data:', error);
	}

	const isAr = locale === 'ar';

	return (
		<div className='w-full mx-auto Landing overflow-hidden'>
			<div className='h-[60vh] w-full'>
				<SwigerLanding
					SliderData={sliderData}
					apiUrl={apiUrl}
				/>
			</div>
			<Container>
				<Packages
					title={t('ourpackagess')}
					viewmore={t('viewmore')}
					ViewDetails={t('ViewDetails')}
					DesignYourPackage={t('DesignYourPackage')}
					DesignYourPackageDesc={t('DesignYourPackageDesc')}
					StartDesigning={t('StartDesigning')}
					apiUrl={apiUrl}
				/>
				<Testimonials
					title={t('testimonials')}
					ShareYourExperience={t('ShareYourExperience')}
				/>
				<Partners />
			</Container>
		</div>
	)
}

export default Mainpage;