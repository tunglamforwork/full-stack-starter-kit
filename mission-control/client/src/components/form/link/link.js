import { Link } from 'components/lib';
import Style from './link.tailwind.js';

export function FormLink(props){

  return (
    <Link 
      url={ props.url } 
      text={ props.text } 
      className={ Style.link }
    />
  );
}