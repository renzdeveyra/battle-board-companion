import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { db } from '../main';
import { doc, setDoc, getDoc, collection } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";
import styles from './Home.module.css';


function Home() {
    const [lobbyCode, setLobbyCode] = useState('');
    const navigate = useNavigate();

    const [showInputField, setShowInputField] = useState(false);

    function generateLobbyCode() {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    async function checkIfLobbyExists() {
        const lobbyDocRef = doc(db, "lobbies", lobbyCode);
        const docSnap = await getDoc(lobbyDocRef);
        
        return docSnap.exists();
    }

    function generateSessionID(length) {
        var result = '';
        var characters = 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz0123456789';
        for ( var i = 0; i < length; i++ ) {
           result += characters.charAt(Math.floor(Math.random() * characters.length));
        }

        return result;
    }

    async function handleJoinGameClick() {
        if (lobbyCode.length == 6) {
            const lobbyExists = await checkIfLobbyExists();
            if (lobbyExists) {
                console.log("Lobby exists.");
                const userType = 'guest';
                const sessionID = generateSessionID(20);
                const auth = getAuth();
                const user2Credential = await signInAnonymously(auth); 
                console.log("You're all set to join!");
                console.log("User 2 Credential: ", user2Credential);
                console.log("User 2 UID: ", user2Credential.user.uid);
                const lobbyDocRef = doc(db, "lobbies", lobbyCode);
                const playerInfo = {
                    name: '',
                    UID: user2Credential.user.uid,
                    sessionID: sessionID, 
                    userType: userType
                }
                const playerCollectionRef = collection(lobbyDocRef, "players");
                const player2DocRef = doc(playerCollectionRef, "player 2");
                setDoc(player2DocRef, playerInfo);
                navigate(`lobby?lobbyCode=${lobbyCode}&session=${sessionID}&userType=${userType}`);
            } else {
                console.error("Lobby does not exist.");
                setLobbyCode('');
            }       
        } else {
            console.error("Lobby code must be 6 characters long.");
            setLobbyCode('');
        }
    }

    function handleInputChange(event) {
        var value = event.target.value;
        value = value.replace(/[^0-9A-Za-z]/g, '').substring(0, 6).toUpperCase();
        console.log(`Lobby Code: ${value}`);
        setLobbyCode(value);
    }

    useEffect(() => {
        const generatedLobbyCode = generateLobbyCode();
        setLobbyCode(generatedLobbyCode);
        console.log(`Lobby Code at page mount: ${lobbyCode}`);
    }, []) // eslint-disable-line

    const addDocToFirestore = async () => {
        try {
            console.log('Writing document...');
            console.log(`Lobby Code: ${lobbyCode}`);
            const lobbyDocRef = doc(db, "lobbies", lobbyCode);
            await setDoc(lobbyDocRef, {
                lobbyCode: lobbyCode
            });
            const docSnap = await getDoc(doc(db, "lobbies", lobbyCode));
            if (docSnap.exists()) {
                console.log("Document successfully written!");
                console.log("Document data:", docSnap.data());
            } 
        } catch (error) {
            console.error("Error adding document: ", error);
        }
    }   
    
    async function handleNewGameClick() {
        if (!showInputField) {
            if (lobbyCode !== '') {
                try {
                    const userType = 'host';
                    const sessionID = generateSessionID(20);
                    const auth = getAuth();
                    await addDocToFirestore();
                    const user1Credential = await signInAnonymously(auth); 
                    console.log("You're good to go, host!");
                    console.log("User 1 Credentials: ", user1Credential);
                    console.log("User 1 UID: ", user1Credential.user.uid);
                    const lobbyDocRef = doc(db, "lobbies", lobbyCode);
                    const playerInfo = {
                        name: null,
                        UID: user1Credential.user.uid,
                        sessionID: sessionID,
                        userType: userType
                    }
                    const playerCollectionRef = collection(lobbyDocRef, "players");
                    const player1DocRef = doc(playerCollectionRef, "player 1");
                    setDoc(player1DocRef, playerInfo);
                    navigate(`lobby?lobbyCode=${lobbyCode}&session=${sessionID}&userType=${userType}`);
                } catch (error) {
                    console.error("Error adding document:", error);
                }
            } else {
                setLobbyCode(generateLobbyCode());
            }
        } else {
            setShowInputField(false);
        }
    }

    async function handleJoinGameClicks() {
        showInputField ? handleJoinGameClick() : (setShowInputField(true), setLobbyCode(''));
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Welcome to GoG Arbiter Online</h1>
            <button onClick={handleNewGameClick} className={styles.button}>New Game</button>
            <button onClick={handleJoinGameClicks} className={styles.button}>Join Game</button>
            {showInputField && <input type="text" placeholder="Enter Lobby Code" value={lobbyCode} onChange={handleInputChange} className={styles.field}/>}
        </div> 
    );
}

export default Home;