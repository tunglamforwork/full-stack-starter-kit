/***
*
*   IMAGE
*   Import the image before passing it to this component
*
*   PROPS
*   source: imported source
*   alt: alt description
*   title: description
*   className: inject a custom class object
*
**********/

import { ClassHelper } from 'components/lib';
import Style from './image.tailwind.js';

export function Image(props){

  const imageStyle = ClassHelper(Style, props);

  return(
    <img
      src={ props.source }
      alt={ props.alt }
      title={ props.title }
      className={ imageStyle }
    />
  );
}