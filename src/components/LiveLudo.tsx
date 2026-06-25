import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Dices, Users, Home, Trophy, AlertTriangle, MessageSquare, Mic, Volume2, MicOff, Plus, LogIn, Wallet } from 'lucide-react';
import { auth, db } from '../firebase';
import { doc, onSnapshot, collection, addDoc, updateDoc, deleteDoc, query, where, getDocs, getDoc, increment, serverTimestamp, setDoc } from 'firebase/firestore';
import LudoGrid, { PieceState } from './LudoGrid';
import AgoraRTC, { IAgoraRTCClient, IMicrophoneAudioTrack, IAgoraRTCRemoteUser } from 'agora-rtc-sdk-ng';

AgoraRTC.setLogLevel(4);

const AUDIO_DICE_ROLL = new Audio("https://cdn.pixabay.com/download/audio/2021/08/04/audio_38f2940263.mp3?filename=dice-roll-46011.mp3");
const AUDIO_PIECE_MOVE = new Audio("https://cdn.pixabay.com/download/audio/2022/03/15/audio_27ce09ce5c.mp3?filename=pop-39222.mp3");
const AUDIO_KNOCKOUT = new Audio("https://cdn.pixabay.com/download/audio/2022/03/15/audio_b2f9f17028.mp3?filename=punch-140236.mp3");

const DiceFace = ({ value }: { value: number }) => {
  return (
    <div className="w-full h-full relative flex items-center justify-center rounded-xl lg:rounded-2xl">
      <div className="absolute inset-0 bg-black/20 rounded-xl lg:rounded-2xl translate-y-2 translate-x-1 blur-[2px]"></div>
      <div className="absolute inset-0 bg-linear-to-tr from-white/10 to-white/40 rounded-xl lg:rounded-2xl shadow-[inset_0_4px_6px_rgba(255,255,255,0.4),0_2px_4px_rgba(0,0,0,0.3)] border-t border-l border-white/50 backdrop-blur-sm -translate-y-1"></div>
      <span className="text-4xl lg:text-5xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] z-10 -translate-y-1">{value}</span>
    </div>
  );
};

interface JoinRequest {
  userId: string;
  userName: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface Room {
  id: string;
  hostId: string;
  hostName: string;
  roomCode?: string;
  stake: number;
  players: string[];
  maxPlayers: 2 | 4;
  status: 'waiting' | 'ready' | 'playing' | 'finished';
  winner?: string;
  joinRequests?: JoinRequest[];
  createdAt: any;
  exitedPlayers?: string[];
  missedTurns?: { [playerId: string]: number };
  turnStartedAt?: number;
  isRolling?: boolean;
  lastDiceRoll?: number | null;
  pieces?: PieceState[];
  turn?: 'red' | 'green' | 'yellow' | 'blue';
  messages?: { sender: string; text: string }[];
  lastEmote?: { id: string; emoji: string; userId: string; timestamp?: number };
}

export default function LiveLudo() {
  const [isInRoom, setIsInRoom] = useState(false);
  const [roomStake, setRoomStake] = useState<number>(0);
  const [balance, setBalance] = useState(0);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [customStake, setCustomStake] = useState<number>(100);
  const [createMaxPlayers, setCreateMaxPlayers] = useState<2 | 4>(2);
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
    
    // Prevent multiple active rooms
    const hasActiveRoom = rooms.some(r => r.hostId === auth.currentUser?.uid && r.status === 'waiting');
    if (hasActiveRoom) {
      alert("You already have a waiting room. Please return to it or cancel it before creating a new one.");
      return;
    }

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
        maxPlayers: createMaxPlayers,
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

  const cancelRoomFromLobby = async (roomId: string, stake: number) => {
    if (!auth.currentUser) return;
    try {
      const roomRef = doc(db, "ludo_rooms", roomId);
      const roomSnap = await getDoc(roomRef);
      if (roomSnap.exists()) {
        const roomData = roomSnap.data() as Room;
        if (roomData.status === 'waiting' && roomData.hostId === auth.currentUser.uid) {
          await updateDoc(doc(db, "users", auth.currentUser.uid), {
            balance: increment(stake)
          });
          await deleteDoc(roomRef);
        }
      }
    } catch (e) {
      console.error("Error cancelling room:", e);
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
          
          <div className="flex flex-col gap-3 w-full">
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs text-slate-400 font-bold uppercase block mb-2">Stake (₹)</label>
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
              <div className="flex-1">
                <label className="text-xs text-slate-400 font-bold uppercase block mb-2">Players</label>
                <select
                  value={createMaxPlayers}
                  onChange={(e) => setCreateMaxPlayers(Number(e.target.value) as 2 | 4)}
                  className="bg-[#05100a] border border-slate-700 rounded-lg px-3 py-3 text-white font-bold w-full focus:outline-none focus:border-[#00ff88]/50 focus:ring-1 focus:ring-[#00ff88]/50"
                >
                  <option value={2}>2 Players</option>
                  <option value={4}>4 Players</option>
                </select>
              </div>
            </div>
            <button 
              onClick={handleCreateRoom}
              className="bg-[#00ff88] text-[#020503] h-12.5 px-8 flex-1 rounded-lg font-bold hover:bg-[#00ff88]/90 transition-colors flex items-center justify-center gap-2"
            >
              Create Game
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

                {room.hostId === auth.currentUser?.uid ? (
                   <div className="flex w-full">
                     <button 
                       onClick={(e) => { e.stopPropagation(); cancelRoomFromLobby(room.id, room.stake); }}
                       className="w-1/3 bg-[#2a1111] border-t border-red-500/50 text-red-500 py-3 font-bold hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
                     >
                       Cancel
                     </button>
                     <button 
                       onClick={() => handleJoinRoom(room)}
                       className="w-2/3 bg-[#112a1e] border-t border-l border-[#00ff88]/50 text-[#00ff88] py-3 font-bold hover:bg-[#00ff88] hover:text-[#020503] transition-all flex items-center justify-center gap-2"
                     >
                       <LogIn size={18} /> Return
                     </button>
                   </div>
                ) : (
                  <button 
                    onClick={() => handleJoinRoom(room)}
                    className="w-full bg-[#112a1e] border-t border-[#00ff88]/50 text-[#00ff88] py-3 font-bold hover:bg-[#00ff88] hover:text-[#020503] transition-all flex items-center justify-center gap-2"
                  >
                    <LogIn size={18} /> Join & Play
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Subcomponent for the actual Game Board
const INITIAL_PIECES: PieceState[] = [
  { id: 'r1', color: 'red', position: -1 },
  { id: 'r2', color: 'red', position: -1 },
  { id: 'r3', color: 'red', position: -1 },
  { id: 'r4', color: 'red', position: -1 },
  { id: 'g1', color: 'green', position: -1 },
  { id: 'g2', color: 'green', position: -1 },
  { id: 'g3', color: 'green', position: -1 },
  { id: 'g4', color: 'green', position: -1 },
  { id: 'y1', color: 'yellow', position: -1 },
  { id: 'y2', color: 'yellow', position: -1 },
  { id: 'y3', color: 'yellow', position: -1 },
  { id: 'y4', color: 'yellow', position: -1 },
  { id: 'b1', color: 'blue', position: -1 },
  { id: 'b2', color: 'blue', position: -1 },
  { id: 'b3', color: 'blue', position: -1 },
  { id: 'b4', color: 'blue', position: -1 },
];

const EMOJIS = [
  "👍", "👎", "😂", "😡", "😭", "🎲", "🔥", "🎉", "😱", "😎", "💔", "👏", "🏆", "🎮", "🚀", "💀", "👀", "🙌",
  "🍑", "🍆", "👅", "💦", "😈", "🤡", "💩", "🖕", "🤬", "😏", "🥴", "🤫", "🤪", "🤑", "🥵", "😵", "🤤", "🤭", "🍻", "🍾", "💸", "💣"
];

function LudoBoard({ stake, onLeave, roomId }: { stake: number, onLeave: () => void, roomId: string | null }) {
  const [turn, setTurn] = useState<"red" | "green" | "yellow" | "blue">("red");
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const [showMicConfirm, setShowMicConfirm] = useState(false);
  const [showMicError, setShowMicError] = useState(false);
  const [micErrorMsg, setMicErrorMsg] = useState("");
  const isProcessingMoveRef = React.useRef(false);
  const [roomData, setRoomData] = useState<Room | null>(null);
  const roomDataRef = React.useRef<Room | null>(null);
  const [winner, setWinner] = useState<string | null>(null);
  
  const [pieces, setPieces] = useState<PieceState[]>(INITIAL_PIECES);
  const [chatMessages, setChatMessages] = useState<{sender: string, text: string}[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [consecutiveSixes, setConsecutiveSixes] = useState(0);
  
  const [countdown, setCountdown] = useState<number | null>(null);
  const hasCountedDown = React.useRef(false);
  const hasClaimedWin = React.useRef(false);

  const [isMicEnabled, setIsMicEnabled] = useState(false);
  const [agoraClient, setAgoraClient] = useState<IAgoraRTCClient | null>(null);
  const [localAudioTrack, setLocalAudioTrack] = useState<IMicrophoneAudioTrack | null>(null);
  const [remoteUsers, setRemoteUsers] = useState<any[]>([]);
  const [floatingEmotes, setFloatingEmotes] = useState<{id: string, emoji: string, userId: string}[]>([]);

  const finalIsRolling = isRolling || roomData?.isRolling;
  const finalDiceValue = diceValue || roomData?.lastDiceRoll;

  useEffect(() => {
     if (roomData?.lastEmote && roomData.lastEmote.id) {
         setFloatingEmotes(prev => [...prev, roomData.lastEmote!]);
         setTimeout(() => {
             setFloatingEmotes(prev => prev.filter(e => e.id !== roomData.lastEmote?.id));
         }, 3000);
     }
  }, [roomData?.lastEmote?.id]);

  // Initialize Agora
  useEffect(() => {
    if (!roomId || !auth.currentUser) return;
    let client: IAgoraRTCClient;
    const initAgora = async () => {
      try {
        client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
        setAgoraClient(client);

        client.on("user-published", async (user: IAgoraRTCRemoteUser, mediaType: "audio" | "video") => {
          await client.subscribe(user, mediaType);
          if (mediaType === "audio") {
            user.audioTrack?.play();
            setRemoteUsers((prev) => [...prev, user]);
          }
        });

        client.on("user-unpublished", (user: IAgoraRTCRemoteUser, mediaType: "audio" | "video") => {
          if (mediaType === "audio") {
             setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
          }
        });

        const appId = import.meta.env.VITE_AGORA_APP_ID; 
        if (appId) {
          try {
             await client.join(appId, roomId, null, null);
          } catch (joinErr) {
             console.warn("Agora join failed. Check VITE_AGORA_APP_ID.");
          }
        } else {
           console.warn("VITE_AGORA_APP_ID not set. Voice chat broadcast is disabled.");
        }
      } catch (error) {
        console.error("Agora init error:", error);
      }
    };
    initAgora();

    return () => {
      if (client) {
         client.leave();
      }
    };
  }, [roomId]);

  useEffect(() => {
    if (!roomId) return;
    const unsub = onSnapshot(doc(db, "ludo_rooms", roomId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as any;
        setRoomData(data);
        roomDataRef.current = data;
        if (data.winner) setWinner(data.winner);
        if (data.pieces) setPieces(data.pieces);
        if (data.turn) setTurn(data.turn);
        if (data.messages) setChatMessages(data.messages);
      } else {
        const rData = roomDataRef.current;
        if (rData && (rData.status === 'waiting' || rData.status === 'ready')) {
           if (auth.currentUser?.uid && rData.players?.includes(auth.currentUser.uid) && rData.hostId !== auth.currentUser?.uid) {
              alert("The host has cancelled the room. Your stake has been refunded.");
              updateBalanceDB(stake);
           } else if (rData.hostId !== auth.currentUser?.uid) {
              alert("The host has cancelled the room.");
           }
        }
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
    if (roomData?.status === 'finished') {
      if (roomData.winner === auth.currentUser?.uid && !hasClaimedWin.current) {
        hasClaimedWin.current = true;
        const winAmount = stake * (roomData?.players?.length || 2) * 0.97;
        updateBalanceDB(winAmount).then(() => {
          alert(`Congratulations! You Won ₹${winAmount}!`);
          onLeave();
        });
      } else if (roomData.winner !== auth.currentUser?.uid) {
        // Loser or spectator
        alert("Game Over! The match has finished.");
        onLeave();
      }
    }
  }, [roomData?.status, roomData?.winner]);

  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCountdown(null);
    }
  }, [countdown]);

  const requestMicPermission = async (silentMode = false) => {
    const savedPermission = localStorage.getItem('ludo_mic_permission');
    if (silentMode && savedPermission === 'denied') return;

    try {
      const track = await AgoraRTC.createMicrophoneAudioTrack();
      setLocalAudioTrack(track);
      setIsMicEnabled(true);
      localStorage.setItem('ludo_mic_permission', 'granted');
      if (agoraClient && agoraClient.connectionState === "CONNECTED") {
         await agoraClient.publish([track]);
      }
    } catch (error: any) {
      console.warn("Mic permission denied or not available", error);
      setIsMicEnabled(false);
      localStorage.setItem('ludo_mic_permission', 'denied');
      if (!silentMode) {
          setMicErrorMsg(error?.message || "Permission Denied");
          setShowMicError(true);
      }
    }
    setShowMicConfirm(false);
  };

  const toggleMic = async () => {
    if (isMicEnabled && localAudioTrack) {
       if (agoraClient && agoraClient.connectionState === "CONNECTED") {
          try { await agoraClient.unpublish([localAudioTrack]); } catch(e){}
       }
       localAudioTrack.close();
       setLocalAudioTrack(null);
       setIsMicEnabled(false);
    } else {
       const savedPermission = localStorage.getItem('ludo_mic_permission');
       if (savedPermission === 'granted') {
         await requestMicPermission(false);
       } else {
         setShowMicConfirm(true);
       }
    }
  };

  const sendEmote = async (emoji: string) => {
    if (!roomId || !auth.currentUser) return;
    try {
      await updateDoc(doc(db, "ludo_rooms", roomId), {
        lastEmote: {
           id: Date.now().toString() + Math.random().toString(),
           emoji,
           userId: auth.currentUser.uid
        }
      });
    } catch (e) {}
  };

  const startGame = async () => {
    if (!roomId) return;
    try {
      await updateDoc(doc(db, "ludo_rooms", roomId), {
        status: 'playing',
        pieces: INITIAL_PIECES,
        turn: 'red',
        turnStartedAt: Date.now(),
        exitedPlayers: [],
        missedTurns: {},
        messages: [{ sender: 'System', text: 'Game Started!' }]
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
    } catch (error) {
      console.error("Error updating balance:", error);
    }
  };

  const getNextTurn = (currentTurn: string, roomPlayers: string[], exitedPlayers: string[] = []): string => {
     const COLORS = ['red', 'green', 'yellow', 'blue'];
     const numPlayers = roomPlayers.length || 2;
     let nextColorIndex = (COLORS.indexOf(currentTurn) + 1) % numPlayers;
     
     // Skip exited players, limit to avoid infinite loop
     for (let i = 0; i < numPlayers; i++) {
        const checkColor = COLORS[nextColorIndex];
        const checkPlayerId = roomPlayers[nextColorIndex];
        if (checkPlayerId && exitedPlayers.includes(checkPlayerId)) {
            nextColorIndex = (nextColorIndex + 1) % numPlayers;
        } else {
            break;
        }
     }
     return COLORS[nextColorIndex];
  };

  const handleTurnTimeout = async () => {
      if (!roomId || !roomData) return;
      const COLORS = ['red', 'green', 'yellow', 'blue'];
      const currentTurnPlayer = roomData.players[COLORS.indexOf(turn)];
      if (!currentTurnPlayer) return;

      const newMissedTurns = { ...(roomData.missedTurns || {}) };
      newMissedTurns[currentTurnPlayer] = (newMissedTurns[currentTurnPlayer] || 0) + 1;
      
      const newExitedPlayers = [...(roomData.exitedPlayers || [])];
      let newStatus = roomData.status;
      let newWinner = roomData.winner;

      if (newMissedTurns[currentTurnPlayer] >= 3 && !newExitedPlayers.includes(currentTurnPlayer)) {
          newExitedPlayers.push(currentTurnPlayer);
          const activePlayers = roomData.players.filter(p => !newExitedPlayers.includes(p));
          if (activePlayers.length <= 1) {
             newStatus = 'finished';
             newWinner = activePlayers[0] || roomData.players[0]; // Remaining player wins
          }
      }

      let newPieces = pieces.map(p => ({ ...p }));
      let getAnotherTurn = false;
      let usedDiceValue = diceValue || Math.floor(Math.random() * 6) + 1;
      if (usedDiceValue === 6) getAnotherTurn = true;
      
      // Auto move logic
      let movablePieces = newPieces.filter(p => p.color === turn && ((p.position === -1 && usedDiceValue === 6) || (p.position >= 0 && p.position + usedDiceValue <= 56)));
      if (movablePieces.length > 0) {
          AUDIO_PIECE_MOVE.currentTime = 0;
          AUDIO_PIECE_MOVE.play().catch(() => {});
          let p = movablePieces[0]; // just pick the first valid piece
          if (p.position === -1) {
              p.position = 0;
          } else {
              p.position += usedDiceValue;
              if (p.position === 56) getAnotherTurn = true;
          }
          
          // Check Knockouts
          if (p.position >= 0 && p.position <= 50) {
             const offset = p.color === 'red' ? 0 : p.color === 'green' ? 13 : p.color === 'yellow' ? 26 : 39;
             const absolutePos = (p.position + offset) % 52;
             const SAFE_SQUARES = [0, 8, 13, 21, 26, 34, 39, 47];
             if (!SAFE_SQUARES.includes(absolutePos)) {
                for (let i = 0; i < newPieces.length; i++) {
                   const otherP = newPieces[i];
                   if (otherP.color !== p.color && otherP.position >= 0 && otherP.position <= 50) {
                      const otherOffset = otherP.color === 'red' ? 0 : otherP.color === 'green' ? 13 : otherP.color === 'yellow' ? 26 : 39;
                      const otherAbsolutePos = (otherP.position + otherOffset) % 52;
                      if (otherAbsolutePos === absolutePos) {
                         otherP.position = -1; // KNOCKED OUT
                         getAnotherTurn = true;
                         AUDIO_KNOCKOUT.currentTime = 0;
                         AUDIO_KNOCKOUT.play().catch(() => {});
                      }
                   }
                }
             }
          }
      }

      // Check win condition
      const myHomePieces = newPieces.filter(piece => piece.color === turn && piece.position === 56).length;
      if (myHomePieces === 4) {
          newStatus = 'finished';
          newWinner = currentTurnPlayer;
      }

      const nextTurn = (!getAnotherTurn || newMissedTurns[currentTurnPlayer] >= 3) ? getNextTurn(turn, roomData.players, newExitedPlayers) : turn;
      
      try {
         const updates: any = { 
             turn: nextTurn, 
             turnStartedAt: Date.now(), 
             missedTurns: newMissedTurns,
             exitedPlayers: newExitedPlayers,
             pieces: newPieces
         };
         if (newStatus === 'finished') {
             updates.status = newStatus;
             updates.winner = newWinner;
         }
         await updateDoc(doc(db, "ludo_rooms", roomId), updates);
         setDiceValue(null);
         setIsRolling(false);
      } catch (e) {}
  };

  const [timeLeft, setTimeLeft] = useState<number>(15);
  const timeoutHandledRef = React.useRef(false);

  useEffect(() => {
    if (roomData?.status !== 'playing' || !roomData?.turnStartedAt) return;
    
    timeoutHandledRef.current = false;
    
    const interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - roomData.turnStartedAt!) / 1000);
        const remaining = Math.max(0, 15 - elapsed);
        setTimeLeft(remaining);
        
        if (remaining === 0 && !timeoutHandledRef.current) {
            timeoutHandledRef.current = true;
            const COLORS = ['red', 'green', 'yellow', 'blue'];
            const myColor = COLORS[roomData?.players?.indexOf(auth.currentUser?.uid || '') || 0];
            const isHostActive = roomData?.hostId === auth.currentUser?.uid;
            
            // Allow the player whose turn it is to handle it, OR the host as a fallback
            if (turn === myColor || isHostActive) {
                handleTurnTimeout();
            }
        }
    }, 500);
    return () => clearInterval(interval);
  }, [roomData?.turnStartedAt, roomData?.status, turn]);
  const syncState = async (newPieces: PieceState[], nextTurn: "red" | "green" | "yellow" | "blue", isWin: boolean = false) => {
     if (!roomId) return;
     try {
       const COLORS = ['red', 'green', 'yellow', 'blue'];
       const currentTurnPlayer = roomData?.players?.[COLORS.indexOf(turn)];
       const newMissedTurns = { ...(roomData?.missedTurns || {}) };
       
       if (currentTurnPlayer) {
           newMissedTurns[currentTurnPlayer] = 0;
       }

       const updates: any = { pieces: newPieces, turn: nextTurn, turnStartedAt: Date.now(), missedTurns: newMissedTurns, lastDiceRoll: null, isRolling: false };
       if (isWin) {
         updates.status = 'finished';
         updates.winner = auth.currentUser?.uid;
       }
       await updateDoc(doc(db, "ludo_rooms", roomId), updates);
     } catch(e){}
  };

  const handlePieceClick = (piece: PieceState) => {
     if (!diceValue || isProcessingMoveRef.current) return;
     if (roomData?.exitedPlayers?.includes(auth.currentUser?.uid || '')) return;

     const COLORS = ['red', 'green', 'yellow', 'blue'];
     const myColor = COLORS[roomData?.players?.indexOf(auth.currentUser?.uid || '') || 0];

     if (piece.color !== turn) return; 
     if (piece.color !== myColor && (roomData?.players?.length ?? 0) > 1) {
         // Prevent moving opponents pieces
         return;
     }

     const newPieces = pieces.map(p => ({ ...p }));
     const idx = newPieces.findIndex(p => p.id === piece.id);
     const p = newPieces[idx];
     let moved = false;
     let getAnotherTurn = diceValue === 6;

     if (p.position === -1) {
         if (diceValue === 6) {
             p.position = 0;
             moved = true;
         }
     } else if (p.position >= 0 && p.position <= 50) {
         if (p.position + diceValue <= 56) {
             p.position += diceValue;
             moved = true;
         }
     } else if (p.position >= 51 && p.position <= 56) {
         if (p.position + diceValue <= 56) {
             p.position += diceValue;
             moved = true;
             if (p.position === 56) getAnotherTurn = true; // Extra turn for reaching home!
         }
     }
     
     if (moved) {
        AUDIO_PIECE_MOVE.currentTime = 0;
        AUDIO_PIECE_MOVE.play().catch(() => {});
        isProcessingMoveRef.current = true;
        // Check Knockouts
        if (p.position >= 0 && p.position <= 50) {
           const offset = p.color === 'red' ? 0 : p.color === 'green' ? 13 : p.color === 'yellow' ? 26 : 39;
           const absolutePos = (p.position + offset) % 52;
           const SAFE_SQUARES = [0, 8, 13, 21, 26, 34, 39, 47];
           if (!SAFE_SQUARES.includes(absolutePos)) {
              for (let i = 0; i < newPieces.length; i++) {
                 const otherP = newPieces[i];
                 if (otherP.color !== p.color && otherP.position >= 0 && otherP.position <= 50) {
                    const otherOffset = otherP.color === 'red' ? 0 : otherP.color === 'green' ? 13 : otherP.color === 'yellow' ? 26 : 39;
                    const otherAbsolutePos = (otherP.position + otherOffset) % 52;
                    if (otherAbsolutePos === absolutePos) {
                       otherP.position = -1; // KNOCKED OUT
                       getAnotherTurn = true;
                       AUDIO_KNOCKOUT.currentTime = 0;
                       AUDIO_KNOCKOUT.play().catch(() => {});
                    }
                 }
              }
           }
        }

        setPieces(newPieces);
        
        let nextTurn = turn;
        if (!getAnotherTurn) {
            nextTurn = getNextTurn(turn, roomData?.players || [], roomData?.exitedPlayers || []) as any;
        }
        setDiceValue(null);
        
        // Check win condition
        const myHomePieces = newPieces.filter(piece => piece.color === turn && piece.position === 56).length;
        const isWin = myHomePieces === 4;
        
        syncState(newPieces, nextTurn, isWin);
        setTimeout(() => { isProcessingMoveRef.current = false; }, 500);
     }
  };

  const rollDice = () => {
    if (isRolling || diceValue !== null) return;
    
    const COLORS = ['red', 'green', 'yellow', 'blue'];
    const playerIndex = roomData?.players?.indexOf(auth.currentUser?.uid || '') ?? -1;
    const myColor = COLORS[playerIndex >= 0 ? playerIndex : 0];

    if (roomData?.exitedPlayers?.includes(auth.currentUser?.uid || '')) {
       return;
    }

    if (roomData && turn !== myColor) {
      if ((roomData?.players?.length ?? 0) > 1) { // Only enforce turn switching strictly in multiplayer matches
          alert("Not your turn!");
          return;
      }
    }

    AUDIO_DICE_ROLL.currentTime = 0;
    AUDIO_DICE_ROLL.play().catch(() => {});
    setIsRolling(true);
    if (roomId) updateDoc(doc(db, "ludo_rooms", roomId), { isRolling: true }).catch(()=>{});

    setTimeout(() => {
      const val = Math.floor(Math.random() * 6) + 1;
      
      let nextSixes = val === 6 ? consecutiveSixes + 1 : 0;
      setConsecutiveSixes(nextSixes);

      if (roomId) updateDoc(doc(db, "ludo_rooms", roomId), { isRolling: false, lastDiceRoll: val }).catch(()=>{});

      if (nextSixes === 3) {
          const COLORS = ['red', 'green', 'yellow', 'blue'];
          const nextTurn = getNextTurn(turn, roomData?.players || [], roomData?.exitedPlayers || []) as any;
          setDiceValue(null);
          setConsecutiveSixes(0);
          syncState(pieces, nextTurn, false);
          setIsRolling(false);
          return;
      }
      
      let hasValidMove = false;
      for (const piece of pieces) {
         if (piece.color !== turn) continue;
         if (piece.position === -1 && val === 6) hasValidMove = true;
         if (piece.position >= 0 && piece.position + val <= 56) hasValidMove = true;
      }

      if (!hasValidMove) {
          const nextTurn = val === 6 ? turn : getNextTurn(turn, roomData?.players || [], roomData?.exitedPlayers || []) as any;
          setDiceValue(null);
          syncState(pieces, nextTurn, false);
      } else {
          setDiceValue(val);
      }
      setIsRolling(false);
    }, 500);
  };


  const sendMessage = async (text: string) => {
    if (!text.trim() || !roomId || !auth.currentUser) return;
    const isHostObj = roomData?.hostId === auth.currentUser?.uid;
    const myName = (auth.currentUser.email || "Player").split('@')[0];
    
    const newMsg = { sender: myName, text };
    try {
      await updateDoc(doc(db, "ludo_rooms", roomId), {
        messages: [...chatMessages, newMsg]
      });
      setChatInput("");
    } catch(e) {}
  };

  const isHost = roomData?.hostId === auth.currentUser?.uid;
  const isPlaying = roomData?.status === 'playing';

  const [opponentName, setOpponentName] = useState('Opponent');

  useEffect(() => {
     if (roomData && roomData.players) {
        const otherId = roomData.players.find((id: string) => id !== auth.currentUser?.uid);
        if (otherId) {
           getDoc(doc(db, "users", otherId)).then(snap => {
              if (snap.exists()) {
                 const data = snap.data();
                 setOpponentName(data.firstName || data.name || data.email?.split('@')[0] || 'Opponent');
              } else {
                 if (isHost) {
                    const req = roomData.joinRequests?.find((r: any) => r.userId === otherId);
                    if (req) setOpponentName(req.userName.split('@')[0]);
                 } else {
                    setOpponentName(roomData.hostName?.split('@')[0] || 'Opponent');
                 }
              }
           });
        }
     }
  }, [roomData?.players, isHost]);

  const handleQuitClick = () => {
    setShowQuitConfirm(true);
  };

  const executeQuit = async () => {
    setShowQuitConfirm(false);
    if (!auth.currentUser || !roomId) {
      onLeave();
      return;
    }

    if (isPlaying) {
      const newExitedPlayers = [...(roomData?.exitedPlayers || []), auth.currentUser.uid];
      const activePlayers = roomData?.players?.filter((p: string) => !newExitedPlayers.includes(p)) || [];
      
      try {
        const updates: any = { exitedPlayers: newExitedPlayers };
        if (activePlayers.length <= 1) {
           updates.status = 'finished';
           updates.winner = activePlayers[0] || roomData?.players?.[0];
        } else {
           const COLORS = ['red', 'green', 'yellow', 'blue'];
           const pIndex = roomData?.players?.indexOf(auth.currentUser.uid);
           if (pIndex !== undefined && turn === COLORS[pIndex]) {
               updates.turn = getNextTurn(turn, roomData.players, newExitedPlayers);
               updates.turnStartedAt = Date.now();
           }
        }
        await updateDoc(doc(db, "ludo_rooms", roomId), updates);
      } catch(e) {}
    } else if (roomData?.status === 'waiting' || roomData?.status === 'ready') {
      if (isHost) {
        try {
          await updateDoc(doc(db, "users", auth.currentUser.uid), { balance: increment(stake) });
          await deleteDoc(doc(db, "ludo_rooms", roomId));
        } catch(e) {}
      } else {
        try {
          await updateDoc(doc(db, "users", auth.currentUser.uid), { balance: increment(stake) });
          const newPlayers = roomData.players.filter((p: string) => p !== auth.currentUser?.uid);
          await updateDoc(doc(db, "ludo_rooms", roomId), { 
            players: newPlayers,
            status: 'waiting'
          });
        } catch(e) {}
      }
    }
    
    onLeave();
  };

  const renderFloatingEmotes = (userId: string | undefined) => {
     if (!userId) return null;
     const userEmotes = floatingEmotes.filter(e => e.userId === userId);
     return (
        <AnimatePresence>
          {userEmotes.map((e, idx) => (
             <motion.div
               key={e.id}
               initial={{ opacity: 0, y: 0, scale: 0.5 }}
               animate={{ opacity: 1, y: -40 - (idx * 20), scale: 1.5 }}
               exit={{ opacity: 0, y: -80, scale: 0.8 }}
               transition={{ duration: 1.5 }}
               className="absolute pointer-events-none text-3xl z-50 drop-shadow-xl"
               style={{ left: '50%', top: '0%', transform: 'translate(-50%, -50%)' }}
             >
               {e.emoji}
             </motion.div>
          ))}
        </AnimatePresence>
     );
  };

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
            {(roomData?.players?.length ?? 0) > 1 ? (
               <>
                 <h3 className="text-2xl font-bold text-white mb-2">Players Joined: {roomData?.players?.length} / {roomData?.maxPlayers || 2}</h3>
                 <p className="text-slate-400 mb-6 font-medium">Ready to start the match for ₹{stake * (roomData?.players?.length ?? 2) * 0.97}</p>
                 {isHost ? (
                    <button onClick={startGame} className="bg-[#00ff88] text-[#020503] px-8 py-3 rounded-xl font-bold text-lg hover:opacity-90 transition-all font-orbitron tracking-wider">START GAME NOW</button>
                 ) : (
                    <p className="text-[#00ff88] animate-pulse font-medium">Waiting for host to start the game...</p>
                 )}
               </>
            ) : (
               <>
                 <div className="w-16 h-16 border-4 border-[#00ff88]/20 border-t-[#00ff88] rounded-full animate-spin mx-auto mb-4"></div>
                 <h3 className="text-xl font-bold text-white mb-2">Waiting for opponent to join... ({roomData?.players?.length || 1} / {roomData?.maxPlayers || 2})</h3>
                 <p className="text-slate-400 mb-4">Share your room code: <span className="font-mono bg-slate-800 px-2 py-1 rounded text-[#00ff88]">{roomData?.roomCode}</span></p>
                 
                 {isHost && roomData?.joinRequests && roomData.joinRequests.some((r: any) => r.status === 'pending') && (
                   <div className="mt-6 border-t border-slate-800 pt-6">
                     <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">Join Requests</h4>
                     <div className="space-y-3">
                       {roomData.joinRequests.filter((r: any) => r.status === 'pending').map((req: any, i: number) => (
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
                                   const newPlayers = [...(roomData.players || []), req.userId];
                                   const newRequests = roomData.joinRequests!.map((r: any) => r.userId === req.userId ? { ...r, status: 'accepted' as const } : r);
                                   await updateDoc(doc(db, "ludo_rooms", roomId), {
                                     joinRequests: newRequests,
                                     players: newPlayers,
                                     status: newPlayers.length >= (roomData.maxPlayers || 2) ? 'ready' : 'waiting'
                                   });
                                 } catch(e) {}
                               }}
                               className="bg-[#00ff88] hover:opacity-90 text-[#020503] text-sm font-bold px-4 py-1.5 rounded-lg"
                             >Accept</button>
                             <button 
                               onClick={async () => {
                                 if (!roomId) return;
                                 try {
                                   const newRequests = roomData.joinRequests!.map((r: any) => r.userId === req.userId ? { ...r, status: 'rejected' as const } : r);
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
          <div className="w-full max-w-2xl flex flex-col items-center justify-center p-2 lg:p-6 mb-8 mt-4 relative">
            
            <div className="w-full flex justify-between items-center px-2 mb-4 z-10 relative">
               {/* Player 1 (Red) */}
               <div className={`relative px-4 py-2 flex flex-col items-center justify-center rounded-xl border-2 shadow-xl bg-linear-to-b from-[#8f1212] to-[#4a0606] ${turn === 'red' ? 'border-[#ffce33] scale-110 z-20' : 'border-[#2a0e0e] opacity-80'} transition-all`}>
                  {renderFloatingEmotes(roomData?.players?.[0])}
                  {turn === 'red' && <span className="absolute -top-3 right-0 bg-white text-black font-black text-xs px-2 py-0.5 rounded-full shadow-md animate-bounce">{timeLeft}s</span>}
                  <span className={`text-white font-bold tracking-wider ${roomData?.exitedPlayers?.includes(roomData?.players?.[0] || '') ? 'line-through text-red-400' : ''}`}>
                    {!roomData?.players?.[0] ? 'EMPTY' : roomData.players[0] === auth.currentUser?.uid ? 'YOU' : 'P1'}
                  </span>
                  {roomData?.exitedPlayers?.includes(roomData?.players?.[0] || '') && <span className="text-[10px] text-red-300 font-bold">QUIT</span>}
               </div>

               {/* Player 2 (Green) */}
               <div className={`relative px-4 py-2 flex flex-col items-center justify-center rounded-xl border-2 shadow-xl bg-linear-to-b from-[#13662a] to-[#083013] ${turn === 'green' ? 'border-[#ffce33] scale-110 z-20' : 'border-[#0a1f0f] opacity-80'} transition-all`}>
                  {renderFloatingEmotes(roomData?.players?.[1])}
                  {turn === 'green' && <span className="absolute -top-3 right-0 bg-white text-black font-black text-xs px-2 py-0.5 rounded-full shadow-md animate-bounce">{timeLeft}s</span>}
                  <span className={`text-white font-bold tracking-wider ${roomData?.exitedPlayers?.includes(roomData?.players?.[1] || '') ? 'line-through text-red-400' : ''}`}>
                    {!roomData?.players?.[1] ? 'EMPTY' : roomData.players[1] === auth.currentUser?.uid ? 'YOU' : 'P2'}
                  </span>
                  {roomData?.exitedPlayers?.includes(roomData?.players?.[1] || '') && <span className="text-[10px] text-red-300 font-bold">QUIT</span>}
               </div>
            </div>

            {/* The main active game area */}
            <div className="w-full aspect-square relative max-w-[90vw]">
               <div className="w-full h-full flex items-center justify-center">
                  <LudoGrid pieces={pieces} onPieceClick={handlePieceClick} />
               </div>
            </div>

            <div className="w-full flex justify-between items-center px-2 mt-4 z-10 relative">
               {/* Player 4 (Blue) */}
               {roomData?.maxPlayers === 4 ? (
                 <div className={`relative px-4 py-2 flex flex-col items-center justify-center rounded-xl border-2 shadow-xl bg-linear-to-b from-[#143e7a] to-[#071933] ${turn === 'blue' ? 'border-[#ffce33] scale-110 z-20' : 'border-[#030912] opacity-80'} transition-all`}>
                    {renderFloatingEmotes(roomData?.players?.[3])}
                    {turn === 'blue' && <span className="absolute -top-3 right-0 bg-white text-black font-black text-xs px-2 py-0.5 rounded-full shadow-md animate-bounce">{timeLeft}s</span>}
                    <span className={`text-white font-bold tracking-wider ${roomData?.exitedPlayers?.includes(roomData?.players?.[3] || '') ? 'line-through text-red-400' : ''}`}>
                       {!roomData?.players?.[3] ? 'EMPTY' : roomData.players[3] === auth.currentUser?.uid ? 'YOU' : 'P4'}
                    </span>
                    {roomData?.exitedPlayers?.includes(roomData?.players?.[3] || '') && <span className="text-[10px] text-red-300 font-bold">QUIT</span>}
                 </div>
               ) : <div className="invisible px-4 py-2">EMPTY</div>}

               {/* Roll Dice Action Area */}
               <div className="flex flex-col items-center gap-2 pointer-events-auto">
                  <div 
                     onClick={rollDice}
                     className={`w-16 h-16 lg:w-20 lg:h-20 border-2 rounded-2xl flex items-center justify-center shadow-[0_5px_20px_rgba(0,0,0,0.8)] transform transition-transform ${turn === 'red' ? 'bg-linear-to-br from-[#ef4444] to-[#991b1b] border-[#ffce33]' : turn === 'green' ? 'bg-linear-to-br from-[#22c55e] to-[#14532d] border-[#ffce33]' : turn === 'yellow' ? 'bg-linear-to-br from-[#eab308] to-[#713f12] border-[#ffce33]' : 'bg-linear-to-br from-[#3b82f6] to-[#1e3a8a] border-[#ffce33]'} ${finalIsRolling || roomData?.exitedPlayers?.includes(auth.currentUser?.uid || '') ? 'scale-90 scale-x-[-1] rotate-720! duration-1000 origin-center opacity-80' : 'hover:scale-105 duration-200 cursor-pointer animate-pulse'}`}
                  >
                    {!finalIsRolling && finalDiceValue ? (
                       <DiceFace value={finalDiceValue} />
                    ) : (
                      <Dices className={`w-8 h-8 lg:w-10 lg:h-10 text-white drop-shadow-xl ${finalIsRolling ? 'animate-spin' : ''}`} />
                    )}
                  </div>
                  <div className="bg-black/80 px-3 py-1 rounded-full text-[10px] text-white font-bold shadow-xl border border-white/20 uppercase tracking-wider backdrop-blur-md">
                     {turn} Turn
                  </div>
               </div>

               {/* Player 3 (Yellow) */}
               {roomData?.maxPlayers === 4 ? (
                 <div className={`relative px-4 py-2 flex flex-col items-center justify-center rounded-xl border-2 shadow-xl bg-linear-to-b from-[#a3790f] to-[#4d3805] ${turn === 'yellow' ? 'border-[#ffce33] scale-110 z-20' : 'border-[#291e03] opacity-80'} transition-all`}>
                    {renderFloatingEmotes(roomData?.players?.[2])}
                    {turn === 'yellow' && <span className="absolute -top-3 right-0 bg-white text-black font-black text-xs px-2 py-0.5 rounded-full shadow-md animate-bounce">{timeLeft}s</span>}
                    <span className={`text-white font-bold tracking-wider ${roomData?.exitedPlayers?.includes(roomData?.players?.[2] || '') ? 'line-through text-red-400' : ''}`}>
                       {!roomData?.players?.[2] ? 'EMPTY' : roomData.players[2] === auth.currentUser?.uid ? 'YOU' : 'P3'}
                    </span>
                    {roomData?.exitedPlayers?.includes(roomData?.players?.[2] || '') && <span className="text-[10px] text-red-300 font-bold">QUIT</span>}
                 </div>
               ) : <div className="invisible px-4 py-2">EMPTY</div>}
            </div>
          </div>
        )}
      </div>

      {/* Right Axis: Chat & Controls */}
      <div className="w-full lg:w-80 flex flex-col gap-4 lg:h-[calc(100vh-96px)]">
         {/* Chat Box */}
         <div className="h-72 lg:flex-1 bg-[#0b1711] border border-slate-800 rounded-xl flex flex-col overflow-hidden relative lg:min-h-100">
            <div className="p-3 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
               <span className="text-white font-medium flex items-center gap-2"><MessageSquare size={16}/> Voice & Chat</span>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-3 flex flex-col">
               <div className="text-center text-xs text-slate-500 mb-4 bg-slate-800/30 py-1 rounded">
                 {isPlaying ? "System: Game Started. Good luck!" : "System: Waiting for opponent..."}
               </div>
               {chatMessages.map((msg, i) => (
                 <div key={i} className={`flex flex-col ${msg.sender === (auth.currentUser?.email?.split('@')[0]) ? 'items-end' : 'items-start'}`}>
                   <span className="text-[10px] text-slate-500 mb-1">{msg.sender}</span>
                   <span className={`px-3 py-2 rounded-xl text-sm ${msg.sender === 'System' ? 'bg-slate-800 text-slate-400 w-full text-center' : msg.sender === (auth.currentUser?.email?.split('@')[0]) ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-800 text-white rounded-bl-none'}`}>{msg.text}</span>
                 </div>
               ))}
            </div>

            {/* Quick Emoji Bar */}
            <div className="p-2 border-t border-slate-800 bg-slate-900/30 flex gap-2 overflow-x-auto hide-scrollbar">
               {EMOJIS.map(emoji => (
                  <button 
                    key={emoji} 
                    onClick={() => sendEmote(emoji)}
                    className="text-xl hover:bg-slate-700 p-1.5 rounded-lg transition-colors shrink-0"
                  >
                    {emoji}
                  </button>
               ))}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-slate-800 bg-slate-900/50 flex gap-2 bg-linear-to-t from-slate-950 to-transparent items-center">
               <input 
                 type="text" 
                 value={chatInput}
                 onChange={e => setChatInput(e.target.value)}
                 onKeyDown={e => e.key === 'Enter' && sendMessage(chatInput)}
                 placeholder="Say something..." 
                 className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00ff88] transition-colors" 
               />
               <button 
                 onClick={toggleMic}
                 className={`p-2 rounded-lg transition-colors border shadow-md relative ${isMicEnabled ? 'bg-green-600/20 text-green-500 border-green-500/50' : 'bg-red-900/40 text-red-500 border-red-500/30'}`}
                 title={isMicEnabled ? "Turn Mic Off" : "Turn Mic On"}
               >
                 {isMicEnabled ? <Mic size={18} /> : <MicOff size={18} />}
                 {isMicEnabled && <span className="absolute max-w-none -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping"></span>}
               </button>
            </div>
         </div>

         <div className="bg-[#0b1711] border border-slate-800 rounded-xl p-4 flex justify-between items-center shrink-0">
            <div>
               <p className="text-xs text-slate-400">Prize Pool</p>
               <p className="text-xl font-bold text-[#f0b429]">₹ {isPlaying ? stake * (roomData?.players?.length || 2) * 0.97 : 0}</p>
            </div>
            <button onClick={handleQuitClick} className="text-white hover:text-white bg-red-600/80 hover:bg-red-600 px-4 py-1.5 rounded-lg text-sm transition-colors border border-red-50 shadow-md">
              Quit
            </button>
         </div>
      </div>

      {showQuitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0b1711] border border-slate-800 p-6 rounded-2xl max-w-sm w-full mx-4 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-2">Are you sure?</h3>
            <p className="text-slate-400 mb-6">
              {isPlaying ? "If you leave now, you will lose the game and your bet." : "Leave this room? Your bet will be refunded."}
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowQuitConfirm(false)}
                className="flex-1 px-4 py-2 rounded-lg bg-slate-800 text-white font-bold hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={executeQuit}
                className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 transition-colors"
              >
                Confirm Quit
              </button>
            </div>
          </div>
        </div>
      )}

      {showMicError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0b1711] border border-red-500/30 p-6 rounded-2xl max-w-sm w-full mx-4 shadow-xl">
            <h3 className="text-xl font-bold text-red-500 mb-2">Microphone Blocked</h3>
            <p className="text-slate-400 mb-4 text-sm">
              Error: {micErrorMsg}
            </p>
            <p className="text-white mb-6 text-sm font-medium">
              If you are in the AI Studio preview, the browser blocks microphone access. <br/><br/>
              Please <strong>OPEN THE APP IN A NEW TAB</strong> using the arrow icon in the top right corner.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowMicError(false)}
                className="flex-1 px-4 py-2 rounded-lg bg-slate-800 text-white font-bold hover:bg-slate-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showMicConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0b1711] border border-slate-800 p-6 rounded-2xl max-w-sm w-full mx-4 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-2">Microphone Access</h3>
            <p className="text-slate-400 mb-6">
              Do you want to allow microphone access to talk with other players in this room?
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => {
                  setShowMicConfirm(false);
                  localStorage.setItem('ludo_mic_permission', 'denied');
                }}
                className="flex-1 px-4 py-2 rounded-lg bg-slate-800 text-white font-bold hover:bg-slate-700 transition-colors"
              >
                Not Now
              </button>
              <button 
                onClick={() => requestMicPermission(false)}
                className="flex-1 px-4 py-2 rounded-lg bg-[#00ff88] text-[#020503] font-bold hover:bg-[#00ff88]/90 transition-colors"
              >
                Allow
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
