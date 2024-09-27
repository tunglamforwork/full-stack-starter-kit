import { ClassHelper } from 'components/lib';
import Style from './row.tailwind.js';

export function TitleRow(props){

  const titleRowStyle = ClassHelper(Style, {

    row: true,
    className: props.className

  })

  return (
    <section className={ titleRowStyle }>

      { props.title && 
        <h2 className={ Style.title }>
          { props.title }
        </h2> }
      
      <div className={ Style.actions }>
        { props.children }
      </div>
      
    </section>
  )
}