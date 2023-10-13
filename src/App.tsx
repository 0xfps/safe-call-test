import './App.css';
import Safe from './components/Safe';

function App() {
  return (
    <>
      Hello there, we'll be doing stuff with Safe (Refresh and it's gone).<br />
      We'll be sending a simple increment call to a contract at 0xA5E65B84a8d9ae43854Bfc0102C6e41591F46664 on Goerli.
      <br /><br />
      <Safe />
    </>
  );
}

export default App;
