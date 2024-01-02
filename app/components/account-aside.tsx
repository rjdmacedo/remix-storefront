import {
  BookOpenIcon,
  UserCircleIcon,
  FingerPrintIcon,
  ShoppingBagIcon,
} from '@heroicons/react/24/outline';

import {cn} from '~/lib/utils';
import {Link} from '~/components/link';
import {buttonVariants} from '~/components/ui';

const navigation = [
  {name: 'Profile', href: '/account/profile', icon: UserCircleIcon},
  {name: 'Security', href: '/account/security', icon: FingerPrintIcon},
  {name: 'Addresses', href: '/account/addresses', icon: BookOpenIcon},
  {name: 'Orders', href: '/account/orders', icon: ShoppingBagIcon},
];

export function AccountAside() {
  return (
    <aside className="flex overflow-x-auto border-b border-secondary lg:block lg:w-64 lg:flex-none lg:border-0 hidden-scroll px-1 pt-1 pb-2 lg:pb-1">
      <nav className="flex-none px-0">
        <ul className="flex gap-x-3 gap-y-1 whitespace-nowrap lg:flex-col">
          {navigation.map((item) => (
            <li key={item.name} className="group">
              <Link
                to={item.href}
                className={({isActive}) =>
                  cn(
                    buttonVariants({variant: 'ghost'}),
                    {'text-primary bg-accent': isActive},
                    'flex gap-x-3 text-sm leading-6 font-semibold justify-start group-hover:text-primary',
                  )
                }
              >
                <item.icon
                  className={cn('h-6 w-6 shrink-0')}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
