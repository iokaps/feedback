import { Logo } from '@/components/logo';
import { cn } from '@/utils/cn';
import * as React from 'react';

interface LayoutProps {
	children?: React.ReactNode;
	className?: string;
}

const PlayerRoot = ({ children, className }: LayoutProps) => (
	<div
		className={cn(
			'from-bg-light to-primary-light grid min-h-dvh grid-rows-[auto_1fr_auto] bg-gradient-to-b',
			className
		)}
	>
		{children}
	</div>
);

const PlayerHeader = ({ children, className }: LayoutProps) => (
	<header
		className={cn(
			'from-primary sticky top-0 z-10 bg-gradient-to-r to-cyan-500 shadow-lg backdrop-blur-xs',
			className
		)}
	>
		<div className="container mx-auto flex items-center justify-between p-4">
			<Logo />
			<div className="text-white">{children}</div>
		</div>
	</header>
);

const PlayerMain = ({ children, className }: LayoutProps) => (
	<main
		className={cn('container mx-auto flex items-center px-4 py-16', className)}
	>
		{children}
	</main>
);

const PlayerFooter = ({ children, className }: LayoutProps) => (
	<footer
		className={cn(
			'border-primary sticky bottom-0 z-10 border-t-2 bg-white/95 shadow-lg backdrop-blur-xs',
			className
		)}
	>
		<div className="container mx-auto flex justify-center p-4">{children}</div>
	</footer>
);

/**
 * Layout components for the `player` mode
 *
 * These compound components can be used to structure the player view
 * and provide a consistent layout across different screens.
 */
export const PlayerLayout = {
	Root: PlayerRoot,
	Header: PlayerHeader,
	Main: PlayerMain,
	Footer: PlayerFooter
};
