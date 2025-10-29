
  import { createRoot } from "react-dom/client";
  import App from "./App.jsx";
  import "./index.css";
  import { Provider } from 'react-redux';
  import store from './app/store';
  
  const rootElement = document.getElementById("root");
  if (rootElement) {
    createRoot(rootElement).render(
      <Provider store={store}>
        <App />
      </Provider>
  
  );
  }
  