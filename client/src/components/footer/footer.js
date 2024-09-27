/***
*
*   FOOTER (homepage)
*   Static homepage footer
*
**********/

import { Animate, Row, Content, Link } from 'components/lib'
import Style from './footer.tailwind.js';

export function Footer(props){

  return (
    <Animate type='slideup'>
      <footer className={ Style.footer }>
        <Row>
          <Content>

            <nav className={ Style.nav }>
              <Link url='/' text='Home' className={ Style.link } color='dark'/>
              <Link url='/pricing' text='Pricing' className={ Style.link } color='dark' />
              <Link url='/signin' text='Sign in' className={ Style.link } color='dark' />
              <Link url='/signup' text='Sign up' className={ Style.link } color='dark' />
              <Link url='/terms' text='Terms' className={ Style.link } color='dark' />
              <Link url='/privacy' text='Privacy' className={ Style.link } color='dark' />
              <Link url='/contact' text='Contact' className={ Style.link } color='dark' />
            </nav>

            <div className={ Style.copyright }>{ `Copyright © Gravity ${new Date().getFullYear()}`}</div>
            <address className={ Style.address }>Gravity Inc. 42 The Milky Way. The Universe</address>

          </Content>
        </Row>
      </footer>
    </Animate>
  );
}