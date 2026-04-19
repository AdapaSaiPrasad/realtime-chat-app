import Login from "./pages/Login";
import Register from "./pages/Register";
import Chat from "./pages/Chat"

function App() {
  const path=window.location.pathname

  if(path=="/chat"){
    return <Chat/>
  }
  return(
  <>
  <Login />
  <Register/>
  
  </>)
}
export default App;