import React, { useEffect, useState } from 'react';

interface ProgressBarProps {
	isUploading: boolean;
	onComplete?: () => void;
}

const ProgressBar = ({ isUploading, onComplete }: ProgressBarProps) => {
	const [progress, setProgress] = useState(0);

	useEffect(() => {
		let interval: NodeJS.Timeout;

		if (isUploading) {
			setProgress(0);
			// Simulate progress
			interval = setInterval(() => {
				setProgress((prev) => {
					if (prev < 30) return prev + Math.random() * 10;
					if (prev < 60) return prev + Math.random() * 5;
					if (prev < 90) return prev + Math.random() * 2;
					return prev + 0.1; // Slow down near the end
				});
			}, 200);
		} else if (progress > 0) {
			setProgress(100);
			const timeout = setTimeout(() => {
				setProgress(0);
				if (onComplete) onComplete();
			}, 500);
			return () => clearTimeout(timeout);
		}

		return () => {
			if (interval) clearInterval(interval);
		};
	}, [isUploading]);

	if (progress === 0 && !isUploading) return null;

	return (
		<div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-4 relative">
			<div
				className="h-full bg-primary transition-all duration-300 ease-out flex items-center justify-end"
				style={{ width: `${Math.min(progress, 100)}%` }}
			>
				<div className="h-full w-4 bg-white/20 animate-pulse" />
			</div>
			{progress < 100 && (
				<span className="absolute inset-0 flex items-center justify-center text-[8px] font-black text-primary/40 uppercase tracking-tighter">
					جاري الرفع... {Math.round(progress)}%
				</span>
			)}
		</div>
	);
};

export default ProgressBar;
