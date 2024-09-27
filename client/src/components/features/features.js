/***
*
*   FEATURES
*   Feature list for use on home/landing pages
*
**********/

import { Grid, Icon, ClassHelper } from 'components/lib';
import Style from './features.tailwind.js';

export function Features(props){

  return(
    <Grid cols={ 3 }>

      <Feature 
        icon='credit-card' 
        title='Subscription Payments'
        desc='Monetise your SaaS application with a powerful billing system that uses Stripe.'
      />

      <Feature 
        icon='droplet' 
        title='React UI'
        desc='Create beautiful user interfaces without any design skills.'
      />

      <Feature 
        icon='unlock' 
        title='Users & Authentication'
        desc='Secure authentication with brute-force protection, account lockouts and 2FA.'
      />

      <Feature 
        icon='twitter' 
        title='Social Logins'
        desc='Users can sign in using their favourite social media accounts.'
      />

      <Feature 
        icon='settings' 
        title='REST API'
        desc='Blazing fast REST API with token authentication and API keys.'
      />    

      <Feature 
        icon='database' 
        title='Choose Your Database'
        desc='Use MySQL, Mongo, Postgres, SQLite and more with Knex & Mongoose.'
      />

      <Feature 
        icon='users' 
        title='Teams'
        desc='Empower users to work with teammates using a seamless invite system.'
      />     

      <Feature 
        icon='mail' 
        title='Email Notifications'
        desc='Send beautiful email notifications without touching HTML.'
      />   

      <Feature 
        icon='bar-chart' 
        title='Mission Control'
        desc='Manage your users from your master dashboard - no more database diving.'
      />    

      <Feature 
        icon='box' 
        title='Pre-built Components'
        desc='From tables and forms to charts and icons, Gravity has everything you need.'
      />    

      <Feature 
        icon='code' 
        title='Integration Tests'
        desc='Hunt down and annihilate bugs in seconds with integration tests.'
      />    

      <Feature 
        icon='lock' 
        title='Security & Permissions'
        desc='Manage permissions and restrict access for each user group.'
      />   

      <Feature 
        icon='heart' 
        title='User Feedback'
        desc='Collect user feedback and view reports without external tools.'
      />    

      <Feature 
        icon='heart' 
        title='User Onboarding'
        desc='Increase user engagement and retention with user-onboarding flows.'
      />  

      <Feature 
        icon='log-in' 
        title='User Impersonation'
        desc='Log into user accounts and fix issues faster than ever.'
      />    

      <Feature 
        icon='clipboard' 
        title='Error & Event Logging'
        desc='Errors and user events are logged with analytics - no need for external tools.'
      />    

      <Feature 
        icon='slack' 
        title='Slack Community'
        desc='Concierge onboarding plus a private community of experienced developers.'
      />  

      <Feature 
        icon='github' 
        title='1 Year of Updates'
        desc='Get access to a repo with continuous updates. Only $195/yr after the first year.'
      />      

    </Grid>
  );
}

function Feature(props){

  const featureStyle = ClassHelper(Style, {
    
    feature: true, 
    className: props.className  
  
  });

  return (
    <div className={ featureStyle }>

      <Icon image={ props.icon } size={ 16 } className={ Style.icon } />

      <h3 className={ Style.title }>
        { props.title }
      </h3>
      
      <p className={ Style.description }>{ props.desc }</p>

    </div>
  );
}
