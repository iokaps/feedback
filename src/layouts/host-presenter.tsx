import { Logo } from '@/components/logo';
import { kmClient } from '@/services/km-client';
import { gameConfigStore } from '@/state/stores/game-config-store';
import { cn } from '@/utils/cn';
import { useSnapshot } from '@kokimoki/app';
import * as React from 'react';

interface LayoutProps {
	children?: React.ReactNode;
	className?: string;
}

const HostPresenterRoot = ({ children, className }: LayoutProps) => (
	<div
		className={cn(
			'from-bg-light to-primary-light grid min-h-dvh grid-rows-[auto_1fr_auto] bg-gradient-to-b',
			className
		)}
	>
		{children}
	</div>
);

const HostPresenterHeader = ({ children, className }: LayoutProps) => {
	const { logoUrl } = useSnapshot(gameConfigStore.proxy);
	const isPresenter = React.useMemo(
		() => kmClient.clientContext.mode === 'presenter',
		[]
	);

	return (
		<header
			className={cn(
				'from-primary sticky top-0 z-10 bg-gradient-to-r to-cyan-500 shadow-lg backdrop-blur-xs',
				className
			)}
		>
			<div className="container mx-auto flex items-center justify-between p-4">
				{logoUrl && isPresenter ? (
					<img src={logoUrl} alt="Event Logo" className="h-12 object-contain" />
				) : logoUrl ? (
					<img src={logoUrl} alt="Event Logo" className="h-9 object-contain" />
				) : (
					<Logo />
				)}
				{children}
			</div>
		</header>
	);
};

const HostPresenterMain = ({ children, className }: LayoutProps) => (
	<main
		className={cn('container mx-auto flex items-center px-4 py-16', className)}
	>
		{children}
	</main>
);

const HostPresenterFooter = ({ children, className }: LayoutProps) => (
	<footer
		className={cn(
			'border-primary sticky bottom-0 z-10 border-t-2 bg-white/95 shadow-lg backdrop-blur-xs',
			className
		)}
	>
		<div className="container mx-auto flex items-center justify-between p-4">
			{children}
		</div>
	</footer>
);

/**
 * Layout components for the `host` and `presenter` modes
 *
 * These compound components can be used to structure the host/presenter view
 * and provide a consistent layout across different screens.
 */
export const HostPresenterLayout = {
	Root: HostPresenterRoot,
	Header: HostPresenterHeader,
	Main: HostPresenterMain,
	Footer: HostPresenterFooter
};
