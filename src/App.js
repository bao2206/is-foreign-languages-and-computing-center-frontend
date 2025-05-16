import logo from './logo.svg';
import './App.css';
import './i18n';
import AppRoutes from './routes/AppRoutes';
import { BrowserRouter } from 'react-router-dom';



function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
