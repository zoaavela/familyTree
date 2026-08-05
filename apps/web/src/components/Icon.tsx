type IconName =
  | 'tree' | 'user' | 'settings' | 'sparkle' | 'plus' | 'arrow-right'
  | 'arrow-left' | 'search' | 'orbit' | 'photo' | 'calendar' | 'link'
  | 'chevron-down' | 'more' | 'target' | 'users' | 'sidebar';

const PATHS: Record<IconName, string> = {
  tree: 'M10 17v-4m0 0L6 9m4 4l4-4M6 9a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Zm8 0a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Zm-4 8a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z',
  user: 'M10 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-6 7a6 6 0 0 1 12 0',
  users: 'M8 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm5.5-4.6a2.5 2.5 0 0 1 0 4.7M3 16a5 5 0 0 1 10 0m1.5-5.3A5 5 0 0 1 17 15.5',
  settings: 'M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm7-2.5-1.6-.5a5.6 5.6 0 0 0-.6-1.5l.8-1.5-1.6-1.6-1.5.8a5.6 5.6 0 0 0-1.5-.6L10.5 3h-1l-.5 1.6a5.6 5.6 0 0 0-1.5.6l-1.5-.8-1.6 1.6.8 1.5a5.6 5.6 0 0 0-.6 1.5L3 10v1l1.6.5c.1.5.3 1 .6 1.5l-.8 1.5 1.6 1.6 1.5-.8c.5.3 1 .5 1.5.6l.5 1.6h1l.5-1.6c.5-.1 1-.3 1.5-.6l1.5.8 1.6-1.6-.8-1.5c.3-.5.5-1 .6-1.5L17 11v-1Z',
  sparkle: 'M10 3v3m0 8v3m7-7h-3M6 10H3m11.9-4.9-2.1 2.1M7.2 12.8l-2.1 2.1m9.8 0-2.1-2.1M7.2 7.2 5.1 5.1',
  plus: 'M10 4v12M4 10h12',
  'arrow-right': 'M4 10h12m-5-5 5 5-5 5',
  'arrow-left': 'M16 10H4m5 5-5-5 5-5',
  search: 'M9 15A6 6 0 1 0 9 3a6 6 0 0 0 0 12Zm4.5-1.5L17 17',
  orbit: 'M10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7.5-3c0 2-3.4 3.6-7.5 3.6S2.5 12 2.5 10 5.9 6.4 10 6.4s7.5 1.6 7.5 3.6Z',
  photo: 'M4 5h12v10H4V5Zm0 7 3-3 4 4m2-2 3 3M12.5 8.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z',
  calendar: 'M4 6h12v10H4V6Zm0 3h12M7 4v3m6-3v3',
  link: 'M8.5 11.5 11.5 8.5M8 6.5 9.7 4.8a3 3 0 1 1 4.3 4.2l-1.7 1.7m-4.6-.4-1.7 1.7a3 3 0 1 0 4.3 4.2l1.6-1.7',
  'chevron-down': 'm6 8 4 4 4-4',
  more: 'M5 10h.01M10 10h.01M15 10h.01',
  target: 'M10 17a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm0-4a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  sidebar: 'M3 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5Zm5-2v14',
};

export function Icon({
  name,
  size = 18,
  className,
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
