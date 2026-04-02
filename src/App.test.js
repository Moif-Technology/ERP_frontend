import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './app/App';

test('app mounts', () => {
  const { container } = render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
  expect(container).toBeTruthy();
});
