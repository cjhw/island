import { useState } from 'react';
import { Content } from '../../runtime/Content';
import 'uno.css';

export function Layout() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <div>
        <h1 p="2" m="2">
          Common Content
        </h1>
        <h1>Doc Content</h1>
        <Content />
      </div>
    </div>
  );
}
