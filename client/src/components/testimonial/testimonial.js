/***
*
*   TESTIMONIAL
*   Create a testimonial with a quote, author image and name
*
*   PROPS
*   text: the quotation
*   author: name of the author (optional)
*   image - imported image object (optional)
*
**********/

import { Image } from 'components/lib';
import Style from './testimonial.tailwind.js';

export function Testimonial(props){

  return(
    <div className={ props.className || '' }>

      { props.image &&
        <Image
          source={ props.image }
          alt={ props.author }
          className={ Style.image }
        />
      }

      <blockquote className={ Style.blockquote }>

        "{ props.text }"
         { props.author && 
          <cite className={ Style.cite }>
            – { props.author }
          </cite> }

      </blockquote>
    </div>
  );
}