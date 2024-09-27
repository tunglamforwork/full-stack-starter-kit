/***
*
*   PROGRESS STEPS
*   Steps are used to indicate the current point in a
*   multi-stage process, such as filling in a long form
*
*   PROPS
*   items: array of objects containing keys: name, url
*   and completed (bool)
*
**********/

import { Link } from 'components/lib'
import Style from './steps.module.scss';

export function ProgressSteps(props){

  return(
    <ol className={ Style.steps }>
      { props.items &&
        Object.keys(props.items).map(item => {

          item = props.items[item];

          return (
            <li key={ item.name } className={ item.completed ? Style.complete : undefined }>
              { item.url ? 
                <Link url={ item.url } text={ item.name }/> :
                <span>{ item.name }</span> 
              }
            </li>
          );
      })}
    </ol>
  )
}
