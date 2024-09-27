import Style from './content.tailwind.js';

export function Content({ children }){

  return (
    <div className={ Style.content }>
      { children }
    </div>
  );
}