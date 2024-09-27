import { Signup } from 'views/auth/signup/account';
import { SignupPlan } from 'views/auth/signup/plan';
import { SignupUser } from 'views/auth/signup/user';
import { SignupVerification } from 'views/auth/signup/verify';
import { Signin } from 'views/auth/signin';
import { SigninOTP } from 'views/auth/signin/otp';
import { SocialSignin } from 'views/auth/signin/social';
import { ForgotPassword } from 'views/auth/signin/forgotpassword';
import { ResetPassword } from 'views/auth/signin/resetpassword';
import { MagicSignin } from 'views/auth/signin/magic';
import { ImpersonateSignin } from 'views/auth/signin/impersonate';

const Routes = [
  {
    path: '/signup',
    view: Signup,
    layout: 'auth',
    title: 'Sign up to Gravity'
  },
  { 
    path: '/signup/verify',
    view: SignupVerification,
    layout: 'auth',
    title: 'Please verify your email address'
  },
  {
    path: '/signup/plan',
    view: SignupPlan,
    layout: 'auth',
    permission: 'owner',
    title: 'Sign up to Gravity'
  },
  {
    path: '/signup/user',
    view: SignupUser,
    layout: 'auth',
    title: 'Sign up to Gravity'
  },
  {
    path: '/signin',
    view: Signin,
    layout: 'auth',
    title: 'Welcome to Gravity'
  },
  {
    path: '/signin/otp',
    view: SigninOTP,
    layout: 'auth',
    title: 'Enter verification code'
  },
  {
    path: '/signin/social',
    view: SocialSignin,
    layout: 'auth',
    title: 'Completing Sign In'
  },
  {
    path: '/magic',
    view: MagicSignin,
    layout: 'auth',
    title: 'Sign In'
  },
  {
    path: '/forgotpassword',
    view: ForgotPassword,
    layout: 'auth',
    title: 'Forgot Your Password?'
  },
  {
    path: '/resetpassword',
    view: ResetPassword,
    layout: 'auth',
    title: 'Reset Your Password'
  },
  {
    path: '/signin/impersonate',
    view: ImpersonateSignin,
    layout: 'auth',
    title: 'Sign in via Mission Control'
  },
]

export default Routes;