/***
*
*   ONBOARDING LAYOUT
*   Simple layout to focus on user onboarding actions
*
**********/

import Style from './onboarding.tailwind.js';

export function OnboardingLayout(props){

  return (
    <main className={ Style.onboarding }>

      { <props.children {...props.data }/> }

    </main>
  );
}