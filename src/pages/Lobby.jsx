import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import styles from "./Lobby.module.css";
import { collection, query, onSnapshot, updateDoc, doc } from "firebase/firestore";
import { db } from "../main";


function Lobby() {
    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const lobbyCode = searchParams.get('lobbyCode');
    const sessionID = searchParams.get('session');
    const userType = searchParams.get('userType');
    const [player, setPlayer] = useState('');
    const [playerName, setPlayerName] = useState('');
    const playerCollectionRef = collection(db, "lobbies", lobbyCode, "players");
    const [showProfile, setShowProfile] = useState([]);
    const [player2Profile, setPlayer2Profile] = useState('guest');
    const [player1Profile, setPlayer1Profile] = useState('host');


// Listen for changes in playerCollectionRef
useEffect(() => {
    handleSetPlayer();
    const unsubscribe = onSnapshot(query(playerCollectionRef), (snapshot) => {
        snapshot.docChanges().forEach((change) => {
            if (change.type === "modified") {
            const doc = change.doc;
            const name = doc.data().name;
            console.log(`Name changed to ${name} for player of type ${doc.data().userType}`);
            if (doc.data().userType === 'host') {
                console.log("I am now on the host side. changes...");
                setPlayer1Profile(name);
            } else {
                console.log("I am now on the guest side.");
                setPlayer2Profile(name);
            }
            }
        });
    });

    // Clean up the listener when component unmounts
    return () => {
    unsubscribe();
    };
  }, []); // Empty dependency array to run the effect only once

  // Update the showProfile component when player profiles change
    useEffect(() => {
        const unsubscribe2 = onSnapshot(query(playerCollectionRef), (snapshot) => {
        const profiles = snapshot.docs.map((doc) => {
        const playerName = doc.data().name;
        const playerProfile = userType === 'host' ? player1Profile : player2Profile;
        return (
            <div key={doc.id} className={styles.user}>
            {userType === doc.data().userType ? (
                <div
                contentEditable
                value={playerName}
                suppressContentEditableWarning
                onKeyDown={handleKeyDown}
                className={styles.userName}
                >
                {playerProfile}
                </div>
            ) : (
                <div value={playerName} className={styles.userName}>
                {playerProfile === player1Profile ? player2Profile : player1Profile}
                </div>
            )}
            </div>
        );
    });
    
        setShowProfile(profiles);
        });

        return () => {
            unsubscribe2();
        }
    }, [player1Profile, player2Profile, userType, playerCollectionRef]);

    
    
    

    const handleSetPlayer = async () => {
        await new Promise(resolve => {
            if (userType === 'guest') {
                console.log("me first");
                setPlayer('player 2');
            } else {
                console.log("me first");
                setPlayer('player 1');
            }
            resolve();
        });
    }

    async function handleKeyDown(event) {
        var value = event.target.textContent;
        if (event.key === 'Enter') {
            event.preventDefault();
            setPlayerName(value);
        }
    }



    useEffect(() => {
        const updateDocRef = async () => {
            console.log("Player Collection Ref: ", playerCollectionRef);
            console.log("Player: ", player);
            try {
                await updateDoc(doc(playerCollectionRef, player), { 
                    name: playerName
                });
            } catch (error) {
                console.error("Error updating document:", error);
            }
        };
        console.log("Player Name: ", playerName);
        updateDocRef();
    }, [playerName]); // eslint-disable-line 

    function handleDisconnectClick() {
        navigate('gog-arbiter/');
    }

    return (
        <div className={styles.mainContainer}>
            <div className={styles.topContainer}>
                <div className={styles.lobbyHeader}>
                    <h1 className={styles.title}>Welcome to Your Lobby!</h1>
                    <button onClick={() => navigate('/gog-arbiter')} className={styles.button}>Main Menu</button>
                </div>
                <div className={styles.lobbyContent}>
                    <h2 className={styles.title}>Lobby Code: {lobbyCode}</h2>
                    <p>Share this code with other players to join the lobby.</p>
                    <button onClick={handleDisconnectClick} className={styles.button}>Disconnect</button>
                </div>
            </div>
            <div className={styles.bottomContainer}>
                <div className={styles.userContainer}> 
                    Players
                    <div className={styles.userCasing}>
                        {showProfile}
                    </div>
                </div>
                <div className={styles.chatContainer}>another div here</div>
            </div>
            
        </div>
    );
}

export default Lobby;
