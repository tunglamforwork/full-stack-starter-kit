/***
*
*   SUB NAV
*   Sub navigation element (located underneath the header).
*
**********/

import { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext, } from 'components/lib';
import './sub.scss';

export function SubNav(props){

  const context = useContext(AuthContext);

  return(
    <nav className='subnav'>
      { props.items?.map(item => {
        
        if (item.permission && !context.permission[item.permission])
          return false

        return (
          <NavLink
            key={ item.label }
            to={ item.link }
            activeclassname='active'
            className='item'>

            { item.label }

          </NavLink>
        );
      })}
    </nav>
  );
}
