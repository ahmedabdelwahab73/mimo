import type { Metadata } from "next";
export const metadata: Metadata = {
	title: "Mimo | Login",
	description: "تسجيل الدخول إلى لوحة تحكم استوديو ميمو للتصوير الفوتوغرافي.",
	icons: {
		icon: '/small.png',
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<main className="">
			{children}
		</main>
	);
}
