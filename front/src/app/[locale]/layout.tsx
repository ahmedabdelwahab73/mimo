import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Open_Sans, Fira_Code, Dancing_Script, Poppins } from "next/font/google";
import { ThemeWrapper } from "@/components/ThemeWrapper";
import { cookies } from "next/headers";
import { SpeedInsights } from '@vercel/speed-insights/next';
import '@/app/[locale]/globals.scss';
const openSans = Open_Sans({
	variable: "--font-open-sans",
	subsets: ["latin"],
	weight: ["300", "400", "500", "600", "700", "800"],
	display: "swap",
});

const poppins = Poppins({
	variable: "--font-poppins",
	subsets: ["latin"],
	weight: ["300", "400", "500", "600", "700"],
	display: "swap",
});

const firaCode = Fira_Code({
	variable: "--font-fira-code",
	subsets: ["latin"],
	display: "swap",
});

const dancingScript = Dancing_Script({
	variable: "--font-dancing-script",
	subsets: ["latin"],
	display: "swap",
});

export function generateStaticParams() {
	return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
	children,
	params
}: {
	children: React.ReactNode;
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;

	// التأكد من أن اللغة مدعومة
	if (!routing.locales.includes(locale as any)) {
		notFound();
	}

	// تفعيل اللغة للـ static rendering
	setRequestLocale(locale);

	// تحميل ملفات الترجمة
	const messages = await getMessages();

	// قراءة الكوكيز للإعدادات التانية (Theme)
	const cookieStore = await cookies();
	const themeCookie = cookieStore?.get("theme");
	const savedTheme = themeCookie?.value || "light";

	return (
		<html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} className={savedTheme} suppressHydrationWarning>
			<body className={`
        ${openSans.variable} 
        ${firaCode.variable}
        ${dancingScript.variable} 
        ${poppins.variable}
        antialiased font-sans
      `}>
				<NextIntlClientProvider messages={messages}>
					<ThemeWrapper
						attribute="class"
						defaultTheme="system"
						enableSystem
						themes={['light', 'dark', 'system']}
						savedTheme={savedTheme}
					>
						{/* <main> */}
						{children}
						{/* </main> */}
					</ThemeWrapper>
				</NextIntlClientProvider>
				<SpeedInsights />
			</body>
		</html>
	);
}