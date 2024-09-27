/***
*
*   BILLING
*   Change subscription, update card details or view past invoices
*
**********/

import React, { Fragment, useContext } from 'react';
import { AuthContext, AccountNav, TabView, Message, Animate, useAPI } from 'components/lib';

import { BillingPlan } from './plan';
import { BillingCard } from './card';
import { BillingInvoices } from './invoices';

const Messages = require('./messages.json');

export function Billing(props){

  // state/context
  const context = useContext(AuthContext);

  // fetch subscription
  const subscription = useAPI('/api/account/subscription');
  const isPaid = context.user.plan === 'free' ? false : true;
  const labels = ['Plan']; if (isPaid) labels.push('Card', 'Invoices');

  return (
    <Fragment>

      <AccountNav/>
      <Animate>

        { !subscription?.loading && 
          (subscription?.data?.status !== 'active' && subscription?.data?.status !== 'trialing') &&
          <Message { ...Messages[subscription.data?.status] } />
        }

        <TabView name='Billing' labels={ labels }>

          <BillingPlan subscription={ subscription } />

          { isPaid && 
          <BillingCard /> }

          { isPaid && 
          <BillingInvoices /> }

        </TabView>
      </Animate>
    </Fragment>
  );
}
