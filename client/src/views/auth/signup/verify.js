/***
*
*   SIGN UP STEP 2
*   Verify email address
*   Step 1: create account
*   Step 2: verify email address
*   Step 3: select plan
*
**********/

import React, { useContext, useState, useEffect, useRef } from 'react';
import Axios from 'axios';
import { AuthContext, Animate, Row, Card, Message, Link, useLocation, useNavigate } from 'components/lib';

export function SignupVerification(props){

  const location = useLocation();
  const navigate = useNavigate();
  const qs = location.search;
  const authContext = useRef(useContext(AuthContext));

  const [message, setMessage] = useState({ 

    type: 'info',
    title: 'Please Check Your Email',
    text: 'Please click the link in the email we sent to verify your account.', 
    button: {
      text: 'Re-Send Verification Email',
      action: resendVerificationEmail
    }

  });

  useEffect(() => {
    const verifyToken = async (token) => {
      
      try {

        setMessage({

          type: 'success',
          title: 'Verifying...',
          text: 'Please wait a moment while we verify your email.',
          button: false,

        })

        const res = await Axios.post('/api/user/verify', { token: token });        
        Axios.defaults.headers.common['Authorization'] = 'Bearer ' + res.data.token;
        authContext.current.update({ verified: true, token: res.data.token });
        return navigate(authContext.current.user.permission === 'user' ? '/welcome' : '/signup/plan');
      
      }
      catch (err){
  
        // // token isnt for this account, force signout
        if (err.response?.status === 401) 
          return authContext.signout();

        setMessage({
      
          type: 'error',
          title: 'Verification Link Has Expired',
          text: 'Please re-send the verification email and try again',
          button: {
            text: 'Re-Send Verification Email',
            action: resendVerificationEmail
          }
        });
      }
    }

    if (qs.includes('?token=')){
      
      // check token exists
      verifyToken(qs.substring(qs.indexOf('?token=')+7));

    }
  }, [qs, authContext, navigate]);

  async function resendVerificationEmail(){

    setMessage({

      type: 'success',
      title: 'Please Check Your Email',
      text: 'Please click the link in the email we sent to verify your account.', 

    })

    await Axios({ method: 'post', url: '/api/user/verify/request' });

  }

  return(
    <Animate type='pop'>
      <Row title='Verify Your Email Address'>
        <Card loading={ false } restrictWidth center>

          <Message 
            type={ message.type }
            title={ message.title }
            text={ message.text }
            buttonText={ message.button?.text }
            buttonAction={ message.button?.action }
          />

          <div className='mt-4'>
            <Link url='/account/profile' text='Manage Your Account' />
          </div>

        </Card>
      </Row>
    </Animate>
  );
}
