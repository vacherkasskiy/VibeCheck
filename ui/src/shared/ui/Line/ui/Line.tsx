import React from 'react';

export const Line = ({ className, ...props }: React.SVGProps<SVGSVGElement>) =>  (
		<svg
			className={className}
			viewBox="0 0 257 34"
			preserveAspectRatio="xMidYMid meet"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M4.50098 28.7672C52.6288 19.2875 169.608 1.26328 252.501 5.00318"
				stroke="url(#paint0_linear_88_315)"
				strokeWidth="9"
				strokeLinecap="round"
			/>
			<defs>
				<linearGradient
					id="paint0_linear_88_315"
					x1="4.50098"
					y1="16.6336"
					x2="252.501"
					y2="16.6336"
					gradientUnits="userSpaceOnUse"
				>
					<stop stopColor="#3C1CFF" />
					<stop offset="0.275" stopColor="#9A4CFF" />
					<stop offset="0.635" stopColor="#E647A6" />
					<stop offset="1" stopColor="#FFCA8B" />
				</linearGradient>
			</defs>
		</svg>
);
