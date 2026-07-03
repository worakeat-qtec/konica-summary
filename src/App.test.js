import { render, screen } from '@testing-library/react';
import App from './App';

test('renders printer report workflow', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /รายงานการใช้เครื่อง KONICA/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /คำนวณยอดการใช้งาน/i })).toBeInTheDocument();
});
