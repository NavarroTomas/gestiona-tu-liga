import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

export function CrownIcon(props: IconProps) {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}><path d="m3.5 7 4.4 3.2L12 4l4.1 6.2L20.5 7l-1.7 10H5.2L3.5 7Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><path d="M6 20h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>;
}

export function UsersIcon(props: IconProps) {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}><path d="M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM3.5 20v-1.6A4.4 4.4 0 0 1 7.9 14h2.2a4.4 4.4 0 0 1 4.4 4.4V20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><path d="M15.5 5.2a3 3 0 0 1 0 5.6M16.8 14.2a4 4 0 0 1 3.7 4V20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>;
}

export function TrophyIcon(props: IconProps) {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}><path d="M8 4h8v3.5c0 3-1.75 5.5-4 5.5s-4-2.5-4-5.5V4Z" stroke="currentColor" strokeWidth="1.6"/><path d="M8 6H5.8c0 3 1.2 4.7 3.6 5.2M16 6h2.2c0 3-1.2 4.7-3.6 5.2M12 13v3.2M8.5 20h7M9.5 16.5h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>;
}

export function FieldIcon(props: IconProps) {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}><rect x="3" y="5" width="18" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.6"/><path d="M12 5v14M3 9h4v6H3M21 9h-4v6h4" stroke="currentColor" strokeWidth="1.4"/><circle cx="12" cy="12" r="2.2" stroke="currentColor" strokeWidth="1.4"/></svg>;
}

export function BallIcon(props: IconProps) {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6"/><path d="m12 8 3.2 2.3-1.2 3.8h-4l-1.2-3.8L12 8ZM8.8 10.3 6 8.7M15.2 10.3 18 8.7M10 14.1 8.8 17M14 14.1l1.2 2.9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>;
}

export function ArrowIcon(props: IconProps) {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}><path d="M5 12h13M14 8l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
