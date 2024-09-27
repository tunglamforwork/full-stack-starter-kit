/***
*
*   SIGN UP STEP 1
*   Signup form for account owners
*   Step 1: create account
*   Step 2: verify email address
*   Step 3: select plan
*
**********/

import React, { useContext } from 'react';
import { AuthContext, Animate, Row, Card, SocialSignin, Form, Link } from 'components/lib';

export function Signup(props){

  const context = useContext(AuthContext);
  
  return(
    <Animate type='pop'>
      <Row title='Create Your Account'>
        <Card loading={ false } restrictWidth center>

          <SocialSignin network={['facebook', 'twitter']} showOr signup />

          <Form
            inputs={{
              name: {
                label: 'First Name',
                type: 'text',
                required: true,
                errorMessage: 'Please enter your first name'
              },
              email: {
                label: 'Email',
                type: 'email',
                required: true,
              },
              password: {
                label: 'Password',
                type: 'password',
                required: true,
                complexPassword: true
              },
              confirm_password: {
                type: 'hidden',
                value: null,
              },
            }}
            url='/api/account'
            method='POST'
            buttonText='Create Account'
            callback={ context.signin }/>

            <div className='mt-4'>
              Already registered? <Link url='/signin' text='Sign In' />
            </div>

        </Card>
      </Row>
    </Animate>
  );
}
