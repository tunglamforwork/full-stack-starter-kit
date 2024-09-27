/***
*
*   SIGN UP STEP 2
*   Signup form for account owners
*   Step 1: create account
*   Step 2: verify email address
*   Step 3: select plan
*
**********/

import React, { useContext } from 'react';
import { Animate, AuthContext, Row, Card, PaymentForm, usePlans, Link, useNavigate, Event } from 'components/lib';

export function SignupPlan(props){

  const context = useContext(AuthContext);
  const navigate = useNavigate();
  const plans = usePlans();
  const plan = window.location.hash.substring(1);

  if (!plans.data)
    return false;

  return(
    <Animate type='pop'>
      <Row title='Select Your Plan'>
        <Card loading={ false } restrictWidth center>

          <PaymentForm
            inputs={{
              plan: {
                label: 'Plan',
                type: 'select',
                options: plans.data.list,
                default: plan,
                required: true,
              },
              token: {
                label: 'Credit Card',
                type: 'creditcard',
                required: true,
              }
            }}
            url='/api/account/plan'
            method='POST'
            buttonText='Save Plan'
            callback={ res => {

              // save the plan to context, then redirect
              Event('selected_plan', { plan: res.data.plan });
              context.update({ plan: res.data.plan, subscription: res.data.subscription });
              navigate(res.data.onboarded ? '/dashboard' : '/welcome');

            }}
          />

          <div className='mt-4'>
            <Link url='/account/profile' text='Manage Your Account' />
          </div>
          
        </Card>
      </Row>
    </Animate>
  );
}
