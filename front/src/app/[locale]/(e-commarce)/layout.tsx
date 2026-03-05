import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import ScrollDownIndicator from "@/components/ScrollDownIndicator";
import { EcommerceProvider } from "@/context/EcommerceContext";
import Aside from "@/components/e-commarce/aside";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
	const resolvedParams = await params;
	const locale = resolvedParams.locale;
	const t = await getTranslations({ locale, namespace: 'Metadata' });

	return {
		title: t('title'),
		description: t('description'),
		icons: {
			icon: "/small.png",
		},
		verification: {
			google: 'jZm3qvBgkvN62UZ-BagZ9zINJCWdP23sG9FDPnqq1yQ',
		}
	};
}

export default function EcommerceLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<EcommerceProvider>
			<ScrollDownIndicator />
			<Aside />
			<Header />
			<main className="h-[100vh] overflow-auto main-element">
				{children}
				<Footer />
			</main>
		</EcommerceProvider>
	);
}
