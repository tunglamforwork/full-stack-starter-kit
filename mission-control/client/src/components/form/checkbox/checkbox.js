import { Label } from 'components/lib';
import Style from './checkbox.tailwind.js';

export function Checkbox(props){

  return (
    <div>
      <input
        type='checkbox'
        name={ props.name }
        id={ props.option }
        value={ props.option }
        className={ Style.input }
        checked={ props.checked ? 'checked' : '' }
        onChange={ e => props.callback(props.index, props.checked, props.option)}
      />

      <Label
        text={ props.option }
        required={ props.required }
        for={ props.option }
        className={ Style.label }
      />
    </div>
  );
}