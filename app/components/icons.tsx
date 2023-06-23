import type {LucideProps} from 'lucide-react';
import {
  X,
  Moon,
  User,
  File,
  Home,
  LogIn,
  LogOut,
  Search,
  Circle,
  Laptop,
  Loader2,
  UserPlus,
  SunMedium,
  AppWindow,
  ShoppingBag,
  SidebarOpen,
  type Icon as LucideIcon,
} from 'lucide-react';

export type Icon = LucideIcon;

export const Icons = {
  Close: X,
  File,
  Moon,
  Home,
  User,
  LogIn,
  LogOut,
  Search,
  Circle,
  Laptop,
  Loader: Loader2,
  UserPlus,
  AppWindow,
  SunMedium,
  ShoppingBag,
  SidebarOpen,
  Tailwind: (props: LucideProps) => (
    <svg viewBox="0 0 24 24" {...props}>
      <path
        d="M12.001,4.8c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624 C13.666,10.618,15.027,12,18.001,12c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624 C16.337,6.182,14.976,4.8,12.001,4.8z M6.001,12c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624 c1.177,1.194,2.538,2.576,5.512,2.576c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624 C10.337,13.382,8.976,12,6.001,12z"
        fill="currentColor"
      />
    </svg>
  ),
};
