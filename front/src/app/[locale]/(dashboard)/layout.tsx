import type { Metadata } from "next";
import DashboardClient from "./DashboardClient";

export const metadata: Metadata = {
	title: "Mimo | Dashboard",
	description: "لوحة تحكم إدارة محتوى استوديو ميمو لخدمات التصوير الفوتوغرافي Mimo Studio Admin Panel.",
	icons: {
		icon: "/small.png",
	},
};

export default function DashboardLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return <DashboardClient>{children}</DashboardClient>;
}
