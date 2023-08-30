import "./App.css"
import { Routes, Route } from "react-router-dom";
import { useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Lobby from "./pages/Lobby";

function App() {
    console.log("App");
    return (
        <Routes>
            <Route path="/gog-arbiter" element={<Home />} />
            <Route path="/gog-arbiter/lobby" element={<LobbyContainer />} />
        </Routes>
    )
}

function LobbyContainer() {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const lobbyCode = searchParams.get('lobbyCode');
    const sessionID = searchParams.get('session');
    const userType = searchParams.get('userType');

    return (
        <Lobby lobbyCode={lobbyCode} session={sessionID} userType={userType} />
    )
}

export default App;