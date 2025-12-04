import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

// Create localized navigation components
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
