/***
*
*   HOMEPAGE
*   Homepage template with features, testimonials and CTA
*
**********/

import React, { Fragment } from 'react';
import { Row, Button, Hero, Features, Testimonial } from 'components/lib';
import ImgDashboard from './images/dashboard.png';
import ImgKyleGawley from './images/kyle-gawley.jpg';

export function Home(props){

  return(
    <Fragment>

      <Hero
        title='Build a Node.js & React SaaS app at warp speed'
        tagline='Gravity is the leading Node.js & React SaaS boilerplate. Get all features you need in a single install.'
        image={ ImgDashboard }
      />

      <Row title='Features' color='white'>
        <Features />
      </Row>

      <Row color='brand'>
        <Testimonial
          text='Gravity saved me weeks of development time and thousands of dollars by eliminating the need to hire a developer to built the necessary infrastructure for my app. I had a beautiful product with billing capabilities in a matter of minutes!'
          author='Kyle Gawley, Gravity Founder'
          image={ ImgKyleGawley }
        />
      </Row>

      <Row title='Kickstart Your SaaS App Today' align='center'>
        <Button goto='/signup' text='Sign Up Now' className='inline-block' big/>
      </Row>
    </Fragment>
  );
}
