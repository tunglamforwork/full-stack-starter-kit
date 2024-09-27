/***
*
*   AUTH LAYOUT
*   Layout for the signup/signin pages
*
**********/

import { HomeNav } from 'components/lib';
import Style from './auth.tailwind.js';

export function AuthLayout(props){

  return (
    <main className={ Style.auth }>
      <HomeNav/>
      { <props.children {...props.data }/> }
    </main>
  );
}
