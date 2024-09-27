import { CardElement } from '@stripe/react-stripe-js';
import { Label, Error, ClassHelper } from 'components/lib';
import Style from './input.tailwind.js';

export function CardInput(props){

  const error = props.errorMessage || 'Please provide valid credit card details';

  const cardStyle = ClassHelper(Style, {

    textbox: true, 
    cardbox: true,
    className: props.className, 
    error: props.valid === false,

  });

  return(
    <div className={ Style.input }>

      <Label
        text={ props.label }
        required={ props.required }
        for={ props.name }
      />

      <CardElement
        className={ cardStyle }
        style={{ base: { fontFamily: 'source sans pro', fontSize: '15px' }}}
      />

      { props.valid === false && <Error message={ error }/> }

    </div>
  );
}
