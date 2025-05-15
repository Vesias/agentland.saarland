import React from 'react';

// Placeholder for navigation items
interface NavItem {
  name: string;
  href: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>; // Use React.ComponentType
  current: boolean; // To indicate active link
  children?: NavItem[]; // For nested navigation
}

// Example Icon (replace with actual icons e.g. from Heroicons)
// This type is generally fine, but ensure it's compatible with React.ComponentType
const ExampleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

// Explicitly type navigationItems to ensure compatibility
const navigationItems: Array<NavItem> = [
  { name: 'Dashboard Overview', href: '/dashboard', icon: ExampleIcon, current: true },
  { name: 'Agent Status', href: '/dashboard/agents', icon: ExampleIcon, current: false },
  { name: 'Workflow Monitoring', href: '/dashboard/workflows', icon: ExampleIcon, current: false },
  { name: 'Knowledge Management', href: '/dashboard/knowledge', icon: ExampleIcon, current: false },
  { name: 'Regional Integration', href: '/dashboard/regional', icon: ExampleIcon, current: false },
  { name: 'System Health', href: '/dashboard/health', icon: ExampleIcon, current: false },
  { name: 'Settings', href: '/dashboard/settings', icon: ExampleIcon, current: false },
  // TODO: Add more navigation items based on the dashboard evolution plan
];

const SidebarNavigation: React.FC = () => {
  return (
    <div className="w-64 bg-gray-800 text-white flex flex-col">
      {/* Sidebar header / Logo */}
      <div className="h-16 flex items-center justify-center px-4 shadow-md">
        <span className="text-xl font-semibold">AgentLand</span>
        {/* Or an actual logo image */}
        {/* <img className="h-8 w-auto" src="/logo.svg" alt="AgentLand Saarland" /> */}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navigationItems.map((item) => (
          <a
            key={item.name}
            href={item.href}
            className={`
              group flex items-center px-2 py-2 text-sm font-medium rounded-md
              ${item.current
                ? 'bg-gray-900 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }
            `}
          >
            {item.icon && (
              <item.icon
                className={`
                  mr-3 flex-shrink-0 h-6 w-6
                  ${item.current ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-300'}
                `}
                aria-hidden="true"
              />
            )}
            {item.name}
          </a>
        ))}
      </nav>

      {/* Sidebar Footer (Optional) */}
      {/* <div className="p-4 border-t border-gray-700">
        <p className="text-xs text-gray-400">&copy; {new Date().getFullYear()} AgentLand</p>
      </div> */}
    </div>
  );
};

export default SidebarNavigation;
