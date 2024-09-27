import { Dashboard } from 'views/dashboard/dashboard';
import { Help } from 'views/dashboard/help';
import { OnboardingView } from 'views/onboarding/onboarding';

const Routes = [
  {
    path: '/dashboard',
    view: Dashboard,
    layout: 'app',
    permission: 'user',
    title: 'Dashboard'
  },
  {
    path: '/welcome',
    view: OnboardingView,
    layout: 'onboarding',
    permission: 'user',
    title: 'Welcome'
  },
  {
    path: '/help',
    view: Help,
    layout: 'app',
    permission: 'user',
    title: 'Get Help'
  },
]

export default Routes;
