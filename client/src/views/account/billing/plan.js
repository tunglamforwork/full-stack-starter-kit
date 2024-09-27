/***
*
*   BILLING / PLAN
*   Update the billing plan
*
**********/

import React, { useContext } from 'react';
import { AuthContext, Card, Form, Message, usePlans } from 'components/lib';

export function BillingPlan(props){

  const plans = usePlans();
  const context = useContext(AuthContext);

  return (
    <Card loading={ plans.loading || props.subscription.loading } restrictWidth className={ props.className }>

      { props.subscription?.data?.object && 
        <Message 
          type='info'
          title='Your Billing Cycle'
          text={ `${props.subscription.data.object.current_period_start} to ${props.subscription.data.object.current_period_end}` }
        />
      }

      <Form
        inputs={{
          plan: {
            label: 'Your subscription plan',
            type: 'select',
            required: true,
            default: plans?.data?.active,
            options: plans?.data?.list
          }
        }}
        url='/api/account/plan'
        method='PATCH'
        buttonText='Update Plan'
        callback={(res) => {

          context.update({ plan: res.data.data.plan });

        }}
      />
  </Card>
  )
} 