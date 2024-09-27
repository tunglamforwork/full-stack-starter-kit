/***
*
*   SOCIAL SIGN IN BUTTONS
*   To sign up/in with Facebook, Google or Microsoft
*
**********/

import { useState } from 'react';
import { Button } from 'components/lib';
import { ClassHelper, Grid } from 'components/lib';
import settings from 'settings';
import Style from './social.module.scss';

export function SocialSignin(props){

  const [loading, setLoading] = useState(props.network?.map(x => { return { [x]: false }}));
  const serverURL = settings[process.env.NODE_ENV].server_url;

  // construct query string
  let qs = '';
  if (props.invite) qs = `?invite=${props.invite}`;
  if (props.signup) qs = '?signup=1'


  return (
    <div className={ Style.signinButtons }>
      <Grid cols={ 2 }>
        { props.network?.map(n => {

          const css = ClassHelper(Style, { [n]: true, signinButton: true });
          
          return (
            <Button  
              key={ n }
              loading={ loading[n] }
              icon={['fab', n]}
              iconPack='fontawesome'
              iconSize='1x'
              iconButton
              className={ css }
              action={ () => setLoading({ [n]: true }) }
              url={ `${serverURL}/auth/${n}${qs}` }
              text={ `Use ${n.charAt(0).toUpperCase() + n.slice(1)}` }
            />
          )
        })}
      </Grid>

      { props.showOr && 
        <span className={ Style.or }>or</span> }

    </div>
  );
}
