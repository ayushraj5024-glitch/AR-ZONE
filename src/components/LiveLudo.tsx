import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Dices, Users, Home, Trophy, AlertTriangle, MessageSquare, Mic, Volume2, Plus, LogIn, Wallet } from 'lucide-react';
import { auth, db } from '../firebase';
import { doc, onSnapshot, collection, addDoc, updateDoc, deleteDoc, query, where, getDocs, getDoc, increment, serverTimestamp, setDoc } from 'firebase/firestore';
import LudoGrid from './LudoGrid';

interface JoinRequest {
  userId: string;
  userName: string;
  status: 'pending' | 'accepted' | 'rejected';
}

interface Room {
  id: string;
  hostId: string;
  hostName: string;
  roomCode?: string;
  stake: number;
  players: string[];
  status: 'waiting' | 'ready' | 'playing' | 'finished';
  winner?: string;
  joinRequests?: JoinRequest[];
  createdAt: any;
}

export default function LiveLudo() {
  const [isInRoom, setIsInRoom] = useState(false);
  const [roomStake, setRoomStake] = useState<number>(0);
  const [balance, setBalance] = useState(0);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [customStake, setCustomStake] = useState<number>(100);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  
  const [joinCode, setJoinCode] = useState("");
  const [pendingJoinRoomId, setPendingJoinRoomId] = useState<string | null>(null);

  // Fetch real balance
  useEffect(() => {
    if (!auth.currentUser) return;
    const userRef = doc(db, "users", auth.currentUser.uid);
    const unsub = onSnapshot(userRef, async (docSn) => {
      if (docSn.exists()) {
        setBalance(Number(docSn.data()?.balance || 0));
      } else {
        // Initialize new user with test balance
        try {
          await setDoc(userRef, {
            balance: 5000,
            email: auth.currentUser?.email || "",
            createdAt: serverTimestamp()
          });
          setBalance(5000);
        } catch(e) {
          console.error("Failed to initialize user balance", e);
        }
      }
    });
    return () => unsub();
  }, []);

  // Fetch available rooms
  useEffect(() => {
    const q = query(collection(db, "ludo_rooms"), where("status", "==", "waiting"));
    const unsub = onSnapshot(q, (snapshot) => {
      const fetchedRooms: Room[] = [];
      snapshot.forEach(doc => {
        const data = { id: doc.id, ...doc.data() } as Room;
        if (data.stake && data.stake > 0) {
          fetchedRooms.push(data);
        }
      });
      setRooms(fetchedRooms);
    });
    return () => unsub();
  }, []);

  // Listen for join request status
  useEffect(() => {
    if (!pendingJoinRoomId || !auth.currentUser) return;
    const unsub = onSnapshot(doc(db, "ludo_rooms", pendingJoinRoomId), (docSnap) => {
      if (docSnap.exists() && auth.currentUser) {
        const room = { id: docSnap.id, ...docSnap.data() } as Room;
        if (room.players.includes(auth.currentUser.uid)) {
          // Accepted! Deduct stake and enter game
          updateDoc(doc(db, "users", auth.currentUser.uid), {
             balance: increment(-room.stake)
          });
          setPendingJoinRoomId(null);
          setCurrentRoomId(room.id);
          setRoomStake(room.stake);
          setIsInRoom(true);
        } else {
          // Check if rejected
          const req = room.joinRequests?.find(r => r.userId === auth.currentUser?.uid);
          if (req?.status === 'rejected') {
            setPendingJoinRoomId(null);
            alert("Your request was rejected by the host.");
          }
        }
      } else {
        setPendingJoinRoomId(null);
        alert("The room was closed.");
      }
    });
    return () => unsub();
  }, [pendingJoinRoomId]);

  const handleCreateRoom = async () => {
    if (!auth.currentUser) return;
    if (customStake < 10) {
      alert("Minimum stake is ₹10");
      return;
    }
    if (balance < customStake) {
      alert("Insufficient balance!");
      return;
    }

    try {
      const roomCode = Math.floor(100000 + Math.random() * 900000).toString();
      const roomRef = await addDoc(collection(db, "ludo_rooms"), {
        hostId: auth.currentUser.uid,
        hostName: auth.currentUser.email || "Player",
        roomCode,
        stake: customStake,
        players: [auth.currentUser.uid],
        status: 'waiting',
        joinRequests: [],
        createdAt: serverTimestamp()
      });
      
      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        balance: increment(-customStake)
      });

      setCurrentRoomId(roomRef.id);
      setRoomStake(customStake);
      setIsInRoom(true);
    } catch (error) {
      console.error("Error creating room:", error);
      alert("Failed to create room.");
    }
  };

  const handleJoinRoom = async (room: Room) => {
    if (!auth.currentUser) return;
    if (balance < room.stake) {
      alert("Insufficient balance!");
      return;
    }
    if (room.hostId === auth.currentUser.uid) {
      // Re-joining own room that was already created
      setCurrentRoomId(room.id);
      setRoomStake(room.stake);
      setIsInRoom(true);
      return;
    }

    try {
      const roomRef = doc(db, "ludo_rooms", room.id);
      const existingRequests = room.joinRequests || [];
      const existing = existingRequests.find(r => r.userId === auth.currentUser?.uid);
      if (existing && existing.status === 'pending') {
        alert("Join request already sent! Waiting for host to accept.");
        return;
      }
      if (existing && existing.status === 'rejected') {
        alert("Your request was rejected by the host.");
        return;
      }

      await updateDoc(roomRef, {
        joinRequests: [...existingRequests.filter(r => r.userId !== auth.currentUser?.uid), {
          userId: auth.currentUser.uid,
          userName: auth.currentUser.email || "Player",
          status: 'pending'
        }]
      });
      
      setPendingJoinRoomId(room.id);
    } catch (error) {
      console.error("Error joining room:", error);
      alert("Failed to join room.");
    }
  };

  const joinRoomByCode = async () => {
    if (!joinCode) return;
    const q = query(collection(db, "ludo_rooms"), where("roomCode", "==", joinCode), where("status", "==", "waiting"));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      alert("Invalid room code or room is no longer waiting.");
      return;
    }
    const room = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Room;
    handleJoinRoom(room);
  };

  const handleLeaveGame = async () => {
    setIsInRoom(false);
    if (currentRoomId) {
      try {
        const roomRef = doc(db, "ludo_rooms", currentRoomId);
        const roomSnap = await getDoc(roomRef);
        if (roomSnap.exists()) {
          const roomData = roomSnap.data() as Room;
          // If host leaves an unplayed room, refund stake and delete room
          if (roomData.status === 'waiting' && roomData.hostId === auth.currentUser?.uid) {
            await updateDoc(doc(db, "users", auth.currentUser!.uid), {
              balance: increment(roomStake)
            });
            await deleteDoc(roomRef);
          }
        }
      } catch (e) {
        console.error("Error leaving room:", e);
      }
    }
    setCurrentRoomId(null);
  };

  if (isInRoom) {
    return <LudoBoard stake={roomStake} onLeave={handleLeaveGame} roomId={currentRoomId} />;
  }

  return (
    <div className="p-4 lg:p-8 w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      {/* Top Bar with Balance */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#05100a] p-4 rounded-xl shadow-sm border border-[#00ff88]/20">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Dices className="text-[#00ff88] w-8 h-8" />
            Live Ludo <span className="text-[#f0b429] text-[10px] uppercase ml-2 bg-[#f0b429]/20 px-2 py-1 rounded inline-flex items-center font-bold">Multiplayer</span>
          </h2>
          <div className="text-sm text-slate-400 mt-1 flex items-center space-x-2 font-medium">
            <span className="hover:text-slate-200 cursor-pointer transition-colors">Home</span>
            <span className="text-slate-600">/</span>
            <span className="text-white">Live Ludo</span>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-[#020503] px-4 py-2 rounded-lg border border-slate-700 shadow-sm cursor-default">
          <Wallet className="w-5 h-5 text-[#00ff88]" />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Balance
            </span>
            <span className="text-lg font-bold text-white leading-none">
              ₹
              {(balance || 0).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Action Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Create Room Panel */}
        <div className="bg-linear-to-br from-[#0b1711] to-[#020503] p-6 rounded-xl border border-slate-800 hover:border-[#00ff88]/30 transition-all flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Plus className="text-[#00ff88] w-5 h-5" /> Host a Game
            </h3>
            <p className="text-sm text-slate-400 mb-6">Create a room, set your stake, and share the code to invite opponents.</p>
          </div>
          
          <div className="flex items-end gap-3 w-full">
            <div className="flex-1">
              <label className="text-xs text-slate-400 font-bold uppercase block mb-2">Stake Amount (₹)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₹</span>
                <input 
                  type="number" 
                  value={customStake}
                  onChange={(e) => setCustomStake(Number(e.target.value))}
                  min="10"
                  className="bg-[#05100a] border border-slate-700 rounded-lg pl-8 pr-3 py-3 text-white font-bold w-full focus:outline-none focus:border-[#00ff88]/50 focus:ring-1 focus:ring-[#00ff88]/50"
                />
              </div>
            </div>
            <button 
              onClick={handleCreateRoom}
              className="bg-[#00ff88] text-[#020503] h-12.5 px-8 rounded-lg font-bold hover:bg-[#00ff88]/90 transition-colors flex items-center gap-2"
            >
              Create
            </button>
          </div>
        </div>

        {/* Join Room Panel */}
        <div className="bg-linear-to-br from-indigo-950/20 to-[#020503] p-6 rounded-xl border border-slate-800 hover:border-indigo-500/30 transition-all flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <LogIn className="text-indigo-400 w-5 h-5" /> Join by Code
            </h3>
            <p className="text-sm text-slate-400 mb-6">Enter a 6-digit room code to join an existing private match.</p>
          </div>

          <div className="flex items-end gap-3 w-full">
            {pendingJoinRoomId ? (
              <div className="w-full bg-[#0b1711] p-4 rounded-lg border border-indigo-500/50 text-indigo-400 flex items-center justify-between gap-4">
                <span className="font-bold flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></div>
                  Waiting for Host...
                </span>
                <button 
                  onClick={async () => {
                    if (!pendingJoinRoomId || !auth.currentUser) return;
                    try {
                      const roomRef = doc(db, "ludo_rooms", pendingJoinRoomId);
                      const roomSnap = await getDoc(roomRef);
                      if (roomSnap.exists()) {
                        const rData = roomSnap.data();
                        const existingRequests = rData.joinRequests || [];
                        await updateDoc(roomRef, {
                          joinRequests: existingRequests.filter((r: any) => r.userId !== auth.currentUser?.uid)
                        });
                      }
                    } catch (e) {}
                    setPendingJoinRoomId(null);
                  }}
                  className="bg-red-500/20 text-red-500 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-500/30 transition-colors"
                  >
                  Cancel
                </button>
              </div>
            ) : (
               <>
                <div className="flex-1">
                  <label className="text-xs text-slate-400 font-bold uppercase block mb-2">Room Code</label>
                  <input 
                    type="text" 
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.replace(/\D/g, '').substring(0, 6))}
                    placeholder="123456"
                    className="bg-[#05100a] border border-slate-700 rounded-lg px-4 py-3 text-white font-bold tracking-widest w-full focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50"
                  />
                </div>
                <button 
                  onClick={joinRoomByCode}
                  disabled={!joinCode || joinCode.length < 6}
                  className="bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white h-12.5 px-8 rounded-lg font-bold hover:bg-indigo-500 transition-colors flex items-center gap-2"
                >
                  Join
                </button>
               </>
            )}
          </div>
        </div>
      </div>

      {/* Available Rooms */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Users className="text-[#00ff88]" /> Waiting Players
        </h3>
        {rooms.length === 0 ? (
          <div className="bg-[#0b1711] border border-slate-800 rounded-xl p-8 text-center text-slate-400">
            No open rooms right now. Be the first to create one!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <div key={room.id} className="bg-[#0b1711] border border-slate-800 rounded-xl overflow-hidden hover:border-[#00ff88]/50 transition-colors relative group flex flex-col">
                <div className="p-4 flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold text-lg uppercase">
                      {(room.hostName || "Player").substring(0, 1)}
                    </div>
                    <div>
                      <p className="text-white font-medium">{(room.hostName || "Player").split('@')[0]}</p>
                      <p className="text-xs text-slate-400">Waiting for opponent...</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <p className="text-slate-400 text-sm">Entry Fee</p>
                      <p className="text-2xl font-bold text-white">₹ {(room.stake || 0).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-400 text-sm">Prize Pool</p>
                      <p className="text-xl font-bold text-[#f0b429]">₹ {((room.stake || 0) * 2 * 0.97).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => handleJoinRoom(room)}
                  className="w-full bg-[#112a1e] border-t border-[#00ff88]/50 text-[#00ff88] py-3 font-bold hover:bg-[#00ff88] hover:text-[#020503] transition-all flex items-center justify-center gap-2"
                >
                  <LogIn size={18} /> {room.hostId === auth.currentUser?.uid ? 'Return to Room' : 'Join & Play'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Subcomponent for the actual Game Board
function LudoBoard({ stake, onLeave, roomId }: { stake: number, onLeave: () => void, roomId: string | null }) {
  const [turn, setTurn] = useState<"red" | "green">("red");
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [roomData, setRoomData] = useState<Room | null>(null);
  const [winner, setWinner] = useState<string | null>(null);
  
  const [countdown, setCountdown] = useState<number | null>(null);
  const hasCountedDown = React.useRef(false);

  useEffect(() => {
    if (!roomId) return;
    const unsub = onSnapshot(doc(db, "ludo_rooms", roomId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as Room;
        setRoomData(data);
        if (data.winner) setWinner(data.winner);
      } else {
        // Room deleted
        onLeave();
      }
    });
    return () => unsub();
  }, [roomId]);

  useEffect(() => {
    if (roomData?.status === 'playing' && !hasCountedDown.current) {
      setCountdown(5);
      hasCountedDown.current = true;
    }
  }, [roomData?.status]);

  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCountdown(null);
    }
  }, [countdown]);

  const startGame = async () => {
    if (!roomId) return;
    try {
      await updateDoc(doc(db, "ludo_rooms", roomId), {
        status: 'playing'
      });
    } catch (error) {
      console.error("Error starting game:", error);
    }
  };

  const updateBalanceDB = async (amount: number) => {
    if (!auth.currentUser) return;
    try {
      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        balance: increment(amount)
      });
      // Also log transaction (skipping complex transaction logic for simplicity here)
    } catch (error) {
      console.error("Error updating balance:", error);
    }
  };

  const handleWinMock = async () => {
    // Demo function: end game and award pot
    if (!roomId || !auth.currentUser) return;
    try {
      await updateDoc(doc(db, "ludo_rooms", roomId), {
        status: 'finished',
        winner: auth.currentUser.uid
      });
      const winAmount = stake * 2 * 0.97;
      
      // We explicitly deducted the stake upon creation/join, so we add the full win amount here.
      await updateBalanceDB(winAmount); 
      alert(`You Won ₹${winAmount}!`);
      onLeave();
    } catch(e) {}
  };

  const rollDice = () => {
    if (turn !== "red") return;
    setIsRolling(true);
    setTimeout(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1);
      setIsRolling(false);
      // Mock turn switch
      setTurn("green");
      setTimeout(() => {
        setTurn("red"); // back to red
        setDiceValue(null);
      }, 3000);
    }, 800);
  };

  const isHost = roomData?.hostId === auth.currentUser?.uid;
  const isPlaying = roomData?.status === 'playing';

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#020503] p-4 flex flex-col lg:flex-row gap-6 relative">
      
      {countdown !== null && (
        <div className="absolute inset-0 z-50 bg-[#020503]/90 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl">
           <motion.div 
             key={countdown} 
             initial={{ scale: 0.5, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             exit={{ scale: 1.5, opacity: 0 }}
             transition={{ duration: 0.5 }}
             className="text-8xl font-bold text-[#00ff88] mb-8 font-orbitron"
           >
             {countdown}
           </motion.div>
           <h2 className="text-3xl font-bold text-white tracking-widest uppercase font-exo">Match Starting</h2>
           <p className="text-slate-400 mt-2 font-medium">Get ready to roll...</p>
        </div>
      )}

      {/* Left Axis: Game Board area */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {!isPlaying ? (
          <div className="w-full max-w-150 mb-8 bg-[#0b1711] border border-[#00ff88]/30 p-8 rounded-2xl text-center">
            {roomData?.status === 'ready' ? (
               <>
                 <h3 className="text-2xl font-bold text-white mb-4">Opponent Joined!</h3>
                 <p className="text-slate-400 mb-6 font-medium">Ready to start the match for ₹{stake * 2 * 0.97}</p>
                 {isHost ? (
                    <button onClick={startGame} className="bg-[#00ff88] text-[#020503] px-8 py-3 rounded-xl font-bold text-lg hover:opacity-90 transition-all font-orbitron tracking-wider">START GAME NOW</button>
                 ) : (
                    <p className="text-[#00ff88] animate-pulse font-medium">Waiting for host to start the game...</p>
                 )}
               </>
            ) : (
               <>
                 <div className="w-16 h-16 border-4 border-[#00ff88]/20 border-t-[#00ff88] rounded-full animate-spin mx-auto mb-4"></div>
                 <h3 className="text-xl font-bold text-white mb-2">Waiting for opponent to join...</h3>
                 <p className="text-slate-400 mb-4">Share your room code: <span className="font-mono bg-slate-800 px-2 py-1 rounded text-[#00ff88]">{roomData?.roomCode}</span></p>
                 
                 {isHost && roomData?.joinRequests && roomData.joinRequests.some(r => r.status === 'pending') && (
                   <div className="mt-6 border-t border-slate-800 pt-6">
                     <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">Join Requests</h4>
                     <div className="space-y-3">
                       {roomData.joinRequests.filter(r => r.status === 'pending').map((req, i) => (
                         <div key={i} className="flex items-center justify-between bg-slate-900 border border-slate-700 p-3 rounded-xl">
                           <div className="flex flex-col text-left">
                             <span className="text-white font-bold">{req.userName.split('@')[0]}</span>
                             <span className="text-xs text-slate-400">Wants to play</span>
                           </div>
                           <div className="flex items-center gap-2">
                             <button 
                               onClick={async () => {
                                 if (!roomId) return;
                                 try {
                                   const newRequests = roomData.joinRequests!.map(r => r.userId === req.userId ? { ...r, status: 'accepted' as const } : r);
                                   await updateDoc(doc(db, "ludo_rooms", roomId), {
                                     joinRequests: newRequests,
                                     players: [...roomData.players, req.userId],
                                     status: 'ready'
                                   });
                                 } catch(e) {}
                               }}
                               className="bg-[#00ff88] hover:opacity-90 text-[#020503] text-sm font-bold px-4 py-1.5 rounded-lg"
                             >Accept</button>
                             <button 
                               onClick={async () => {
                                 if (!roomId) return;
                                 try {
                                   const newRequests = roomData.joinRequests!.map(r => r.userId === req.userId ? { ...r, status: 'rejected' as const } : r);
                                   await updateDoc(doc(db, "ludo_rooms", roomId), {
                                     joinRequests: newRequests
                                   });
                                 } catch(e) {}
                               }}
                               className="bg-red-500/20 hover:bg-red-500/30 text-red-500 border border-red-500/50 text-sm font-bold px-4 py-1.5 rounded-lg"
                             >Reject</button>
                           </div>
                         </div>
                       ))}
                     </div>
                   </div>
                 )}
               </>
            )}
          </div>
        ) : (
          <div className="w-full max-w-200 flex items-center justify-center p-2 lg:p-6 relative">
            {/* The main active game area matching the image structure closely */}
            <div className="w-full aspect-square relative">
               
               {/* Player 1 (Red - Top Left) */}
               <div className={`absolute -top-12 -left-12 lg:-top-8 lg:-left-20 w-24 lg:w-32 z-10 p-2 rounded-xl border-2 shadow-2xl bg-linear-to-b from-[#8f1212] to-[#4a0606] ${turn === 'red' ? 'border-[#ffce33]' : 'border-[#2a0e0e]'}`}>
                  <div className="bg-[#cc2b2b] rounded-lg p-1 aspect-square mb-2 relative overflow-hidden border border-black/50">
                     <Users className="w-full h-full text-white/50" />
                     {turn === 'red' && <div className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full animate-pulse m-1"></div>}
                  </div>
                  <div className="text-center">
                     <p className="text-white text-[10px] lg:text-xs font-bold uppercase tracking-wider">You</p>
                     <p className="text-[#ffce33] text-[9px] lg:text-[10px] font-bold font-mono leading-none">₹{stake.toLocaleString()}</p>
                  </div>
               </div>

               {/* Player 2 (Green - Top Right) */}
               <div className={`absolute -top-12 -right-12 lg:-top-8 lg:-right-20 w-24 lg:w-32 z-10 p-2 rounded-xl border-2 shadow-2xl bg-linear-to-b from-[#13662a] to-[#083013] ${turn === 'green' ? 'border-[#ffce33]' : 'border-[#0a1f0f]'}`}>
                  <div className="bg-[#2d9e47] rounded-lg p-1 aspect-square mb-2 relative overflow-hidden border border-black/50">
                     <Users className="w-full h-full text-white/50" />
                     {turn === 'green' && <div className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full animate-pulse m-1"></div>}
                  </div>
                  <div className="text-center">
                     <p className="text-white text-[10px] lg:text-xs font-bold uppercase tracking-wider">Opponent</p>
                     <p className="text-[#ffce33] text-[9px] lg:text-[10px] font-bold font-mono leading-none">₹{stake.toLocaleString()}</p>
                  </div>
               </div>

               {/* Center Board Layout */}
               <div className="w-full h-full flex items-center justify-center p-4">
                  <LudoGrid onWin={handleWinMock} />
               </div>

               {/* Player 3 (Blue - Bottom Left - Inactive) */}
               <div className={`absolute -bottom-12 -left-12 lg:-bottom-8 lg:-left-20 w-24 lg:w-32 z-10 p-2 rounded-xl border-2 shadow-2xl bg-linear-to-b from-[#103a7a] to-[#061836] border-[#0a1526] opacity-50`}>
                  <div className="bg-[#2267c7] rounded-lg p-1 aspect-square mb-2 relative overflow-hidden border border-black/50 flex items-center justify-center">
                     <Users className="w-8 h-8 text-white/30" />
                  </div>
                  <div className="text-center">
                     <p className="text-slate-400 text-[10px] lg:text-xs font-bold uppercase tracking-wider">Empty</p>
                  </div>
               </div>

               {/* Player 4 (Yellow - Bottom Right - Inactive) */}
               <div className={`absolute -bottom-12 -right-12 lg:-bottom-8 lg:-right-20 w-24 lg:w-32 z-10 p-2 rounded-xl border-2 shadow-2xl bg-linear-to-b from-[#99700b] to-[#402d02] border-[#291f03] opacity-50`}>
                  <div className="bg-[#e2a818] rounded-lg p-1 aspect-square mb-2 relative overflow-hidden border border-black/50 flex items-center justify-center">
                     <Users className="w-8 h-8 text-white/30" />
                  </div>
                  <div className="text-center">
                     <p className="text-slate-400 text-[10px] lg:text-xs font-bold uppercase tracking-wider">Empty</p>
                  </div>
               </div>

               {/* Roll Dice Action Area */}
               <div className="absolute -left-16 lg:-left-28 top-1/2 -translate-y-1/2 flex flex-col items-center gap-3">
                  <div className="w-20 h-20 bg-slate-900 border-2 border-slate-700 rounded-xl flex items-center justify-center shadow-lg transform transition-transform hover:scale-105 cursor-pointer">
                    {isRolling ? (
                      <Dices className="w-10 h-10 animate-spin text-slate-400" />
                    ) : diceValue ? (
                      <span className="text-4xl font-black text-white">{diceValue}</span>
                    ) : (
                      <Dices className="w-10 h-10 text-white" />
                    )}
                  </div>
                  <button 
                    onClick={rollDice}
                    disabled={turn !== 'red' || isRolling}
                    className="bg-[#cc2b2b] hover:bg-[#a12020] disabled:opacity-50 disabled:grayscale text-white px-6 py-2 rounded-full font-bold shadow-lg shadow-black/50 text-sm tracking-widest border-2 border-white/20 whitespace-nowrap"
                  >
                    ROLL
                  </button>
               </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Axis: Chat & Controls */}
      <div className="w-full lg:w-80 flex flex-col gap-4">
         <div className="bg-[#0b1711] border border-slate-800 rounded-xl p-4 flex justify-between items-center">
            <div>
               <p className="text-xs text-slate-400">Prize Pool</p>
               <p className="text-xl font-bold text-[#f0b429]">₹ {isPlaying ? stake * 2 * 0.97 : 0}</p>
            </div>
            <button onClick={onLeave} className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg text-sm transition-colors">
              Quit
            </button>
         </div>

         {/* Chat Box */}
         <div className="flex-1 bg-[#0b1711] border border-slate-800 rounded-xl flex flex-col overflow-hidden">
            <div className="p-3 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
               <span className="text-white font-medium flex items-center gap-2"><MessageSquare size={16}/> Livestream Chat</span>
               <Volume2 size={18} className="text-slate-400 cursor-pointer hover:text-white" />
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
               <div className="text-center text-xs text-slate-500 mb-4 bg-slate-800/30 py-1 rounded">
                 {isPlaying ? "System: Game Started. You play as Red." : "System: Waiting for opponent..."}
               </div>
            </div>
            {/* Input */}
            <div className="p-3 border-t border-slate-800 bg-slate-900/50 flex gap-2">
               <input type="text" placeholder="Send a message..." className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500 transition-colors" />
               <button className="bg-slate-700 hover:bg-slate-600 text-white p-2 rounded-lg transition-colors">
                 <Mic size={18} />
               </button>
            </div>
         </div>
      </div>

    </div>
  );
}

