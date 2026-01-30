// ============ CONFIG & STATE ============
   const defaultConfig = {
     platform_title: 'NEXUS GAMING',
     tagline: 'Enter the digital realm',
     welcome_message: 'Welcome back, Champion!',
     featured_title: 'Featured Games',
     primary_color: '#ec4899',
     surface_color: '#1e1b4b',
     text_color: '#ffffff',
     accent_color: '#06b6d4',
     secondary_color: '#a855f7'
   };
   
   let config = { ...defaultConfig };
   let currentUser = null;
   let allUsers = [];
   let allScores = [];
   let allGameData = [];
   let currentLeaderboardFilter = 'all';
   
   const DEFAULT_GAMES = [
     { id: 'snake', name: '🐍 Snake', description: 'Classic arcade action', color: 'from-green-500 to-emerald-600', enabled: true },
     { id: 'memory', name: '🧠 Memory Match', description: 'Test your memory skills', color: 'from-purple-500 to-pink-600', enabled: true },
     { id: 'clicker', name: '👆 Speed Clicker', description: 'Click faster than light', color: 'from-orange-500 to-red-600', enabled: true },
     { id: 'reaction', name: '⚡ Reaction Time', description: 'Lightning reflexes', color: 'from-yellow-500 to-orange-600', enabled: true },
     { id: 'tictactoe', name: '⭕ Tic Tac Toe', description: 'Strategic thinking', color: 'from-blue-500 to-indigo-600', enabled: true },
     { id: 'coinflip', name: '🪙 Coin Flip', description: 'Test your luck', color: 'from-yellow-400 to-amber-500', enabled: true },
     { id: 'wordle', name: '📝 Word Guess', description: 'Crack the code', color: 'from-teal-500 to-emerald-600', enabled: true },
     { id: 'simon', name: '🎵 Simon Says', description: 'Pattern perfection', color: 'from-pink-500 to-rose-600', enabled: true },
     { id: 'pong', name: '🏓 Pong', description: 'Retro paddle action', color: 'from-violet-500 to-purple-600', enabled: true },
     { id: 'minesweeper', name: '💣 Minesweeper', description: 'Careful navigation', color: 'from-gray-500 to-slate-600', enabled: true }
   ];
   
   let gameState = {
     currentGame: null,
     score: 0
   };
   
   // ============ SDK MOCK (Modified for Local Use) ============
   // This mock simulates the external SDK so the site works locally.
   const windowMock = {
       elementSdk: {
           init: async () => {},
           config: defaultConfig
       },
       dataSdk: {
           init: async () => ({ isOk: true }),
           create: async (data) => {
               if(data.type === 'user') allUsers.push(data);
               if(data.type === 'score') allScores.push(data);
               return { isOk: true };
           }
       }
   };
   
   // ============ UI FUNCTIONS ============
   function scrollToSection(id) {
     document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
   }
   
   function showAuthModal() {
     document.getElementById('auth-modal').classList.remove('hidden');
     showLogin();
   }
   
   function closeAuthModal() {
     document.getElementById('auth-modal').classList.add('hidden');
   }
   
   function showLogin() {
     document.getElementById('login-form').classList.remove('hidden');
     document.getElementById('register-form').classList.add('hidden');
     document.getElementById('auth-modal-title').textContent = 'SIGN IN';
   }
   
   function showRegister() {
     document.getElementById('login-form').classList.add('hidden');
     document.getElementById('register-form').classList.remove('hidden');
     document.getElementById('auth-modal-title').textContent = 'CREATE ACCOUNT';
   }
   
   // ============ AUTH ============
   async function handleLogin() {
     const username = document.getElementById('login-username').value.trim();
     const errorEl = document.getElementById('login-error');
     
     if (!username) {
       errorEl.textContent = 'Please enter a username';
       errorEl.classList.remove('hidden');
       return;
     }
     
     // MOCK LOGIN LOGIC
     // Since we don't have a backend, we just "fake" log the user in
     const user = { username: username, avatar_color: '#ec4899', is_admin: false };
     
     currentUser = user;
     closeAuthModal();
     updateNavbar();
     errorEl.classList.add('hidden');
   }
   
   async function handleRegister() {
     // For local demo, register just logs you in
     handleLogin();
   }
   
   function handleLogout() {
     currentUser = null;
     updateNavbar();
   }
   
   function updateNavbar() {
     const nav = document.getElementById('main-nav');
     const userInfo = document.getElementById('nav-user-info');
     const loginBtn = document.getElementById('nav-login-btn');
     const logoutBtn = document.getElementById('nav-logout-btn');
     const adminBtn = document.getElementById('nav-admin-btn');
     
     nav.classList.remove('hidden');
     
     if (currentUser) {
       userInfo.classList.remove('hidden');
       loginBtn.classList.add('hidden');
       logoutBtn.classList.remove('hidden');
       
       if (currentUser.is_admin) {
         adminBtn.classList.remove('hidden');
       } else {
         adminBtn.classList.add('hidden');
       }
       
       document.getElementById('nav-username').textContent = currentUser.username;
       document.getElementById('nav-avatar').textContent = currentUser.username.charAt(0).toUpperCase();
       document.getElementById('nav-avatar').style.backgroundColor = currentUser.avatar_color;
       
       document.getElementById('nav-user-score').textContent = `0 pts`;
     } else {
       userInfo.classList.add('hidden');
       loginBtn.classList.remove('hidden');
       logoutBtn.classList.add('hidden');
       adminBtn.classList.add('hidden');
     }
   }
   
   // ============ GAMES ============
   function getActiveGames() {
     return [...DEFAULT_GAMES];
   }
   
   function renderGames() {
     const grid = document.getElementById('games-grid');
     const GAMES = getActiveGames();
     
     grid.innerHTML = GAMES.map(game => `
       <div class="game-card glass rounded-2xl overflow-hidden cursor-pointer" onclick="startGame('${game.id}')">
         <div class="spotlight h-48 bg-gradient-to-br ${game.color} flex items-center justify-center relative">
           <span class="text-7xl">${game.name.split(' ')[0]}</span>
           <div class="absolute top-3 right-3 bg-black/50 px-3 py-1 rounded-full text-xs">
             Play Now
           </div>
         </div>
         <div class="p-6">
           <h3 class="font-display text-xl mb-2">${game.name}</h3>
           <p class="text-gray-400 mb-4">${game.description}</p>
           <div class="flex items-center justify-between">
             <span class="text-sm text-pink-400">High Score: ${getHighScore(game.id)}</span>
             <button class="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg text-sm font-semibold">
               Play →
             </button>
           </div>
         </div>
       </div>
     `).join('');
   }
   
   function getHighScore(gameId) {
     const scores = allScores.filter(s => s.game_id === gameId);
     return scores.length > 0 ? Math.max(...scores.map(s => s.score)).toLocaleString() : '0';
   }
   
   function startGame(gameId) {
     if (!currentUser) {
       showAuthModal();
       return;
     }
     
     const GAMES = getActiveGames();
     const game = GAMES.find(g => g.id === gameId);
     if (!game) return;
     
     gameState.currentGame = gameId;
     gameState.score = 0;
     
     document.getElementById('game-modal').classList.remove('hidden');
     document.getElementById('game-modal-title').textContent = game.name;
     document.getElementById('game-score').textContent = '0';
     
     renderGameContent(gameId);
   }
   
   function closeGameModal() {
     document.getElementById('game-modal').classList.add('hidden');
     if (window.snakeInterval) clearInterval(window.snakeInterval);
     if (window.clickerInterval) clearInterval(window.clickerInterval);
     if (window.reactionTimeout) clearTimeout(window.reactionTimeout);
   }
   
   function renderGameContent(gameId) {
     const container = document.getElementById('game-container');
     
     switch(gameId) {
       case 'snake':
         container.innerHTML = `
           <div class="text-center">
             <canvas id="snake-canvas" width="400" height="400" class="border-2 border-green-500 rounded-lg"></canvas>
             <p class="text-gray-400 mt-4">Use arrow keys to move</p>
             <button onclick="initSnakeGame()" class="mt-4 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg font-bold">Start Game</button>
           </div>
         `;
         break;
       case 'memory':
         renderMemoryGame(container);
         break;
       case 'clicker':
         renderClickerGame(container);
         break;
       case 'reaction':
         renderReactionGame(container);
         break;
       case 'tictactoe':
         renderTicTacToeGame(container);
         break;
       case 'coinflip':
         renderCoinFlipGame(container);
         break;
       case 'wordle':
         renderWordleGame(container);
         break;
       case 'simon':
         renderSimonGame(container);
         break;
       case 'pong':
         renderPongGame(container);
         break;
       case 'minesweeper':
         renderMinesweeperGame(container);
         break;
       default:
         container.innerHTML = '<p class="text-center text-gray-400">Game coming soon!</p>';
     }
   }
   
   // --- GAME LOGIC IMPLEMENTATIONS ---
   
   function initSnakeGame() {
     const canvas = document.getElementById('snake-canvas');
     const ctx = canvas.getContext('2d');
     const gridSize = 20;
     const tileCount = 20;
     
     let snake = [{ x: 10, y: 10 }];
     let food = { x: 15, y: 15 };
     let dx = 0, dy = 0;
     let score = 0;
     
     function placeFood() {
       food = {
         x: Math.floor(Math.random() * tileCount),
         y: Math.floor(Math.random() * tileCount)
       };
     }
     
     function draw() {
       ctx.fillStyle = '#0a0a0f';
       ctx.fillRect(0, 0, canvas.width, canvas.height);
       
       ctx.fillStyle = '#ef4444';
       ctx.beginPath();
       ctx.arc(food.x * gridSize + gridSize/2, food.y * gridSize + gridSize/2, gridSize/2 - 2, 0, Math.PI * 2);
       ctx.fill();
       
       snake.forEach((segment, index) => {
         ctx.fillStyle = index === 0 ? '#10b981' : '#059669';
         ctx.fillRect(segment.x * gridSize + 1, segment.y * gridSize + 1, gridSize - 2, gridSize - 2);
       });
     }
     
     function update() {
       if (dx === 0 && dy === 0) return;
       
       const head = { x: snake[0].x + dx, y: snake[0].y + dy };
       
       if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount || 
           snake.some(s => s.x === head.x && s.y === head.y)) {
         gameOver();
         return;
       }
       
       snake.unshift(head);
       
       if (head.x === food.x && head.y === food.y) {
         score += 10;
         document.getElementById('game-score').textContent = score;
         placeFood();
       } else {
         snake.pop();
       }
     }
     
     async function gameOver() {
       clearInterval(window.snakeInterval);
       // Mock Save Score
       console.log("Game over! Score:", score);
       ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
       ctx.fillRect(0, 0, canvas.width, canvas.height);
       ctx.fillStyle = '#fff';
       ctx.font = '24px Russo One';
       ctx.textAlign = 'center';
       ctx.fillText('GAME OVER', canvas.width/2, canvas.height/2);
     }
     
     document.onkeydown = (e) => {
       switch(e.key) {
         case 'ArrowUp': if (dy !== 1) { dx = 0; dy = -1; } break;
         case 'ArrowDown': if (dy !== -1) { dx = 0; dy = 1; } break;
         case 'ArrowLeft': if (dx !== 1) { dx = -1; dy = 0; } break;
         case 'ArrowRight': if (dx !== -1) { dx = 1; dy = 0; } break;
       }
     };
     
     if (window.snakeInterval) clearInterval(window.snakeInterval);
     window.snakeInterval = setInterval(() => { update(); draw(); }, 100);
     draw();
   }
   
   // Memory Match Game
   function renderMemoryGame(container) {
     const emojis = ['🎮', '🎯', '🎲', '🎪', '🎨', '🎭', '🎸', '🎺'];
     const cards = [...emojis, ...emojis].sort(() => Math.random() - 0.5);
     
     let flipped = [];
     let matched = [];
     let moves = 0;
     
     container.innerHTML = `
       <div class="text-center">
         <div class="grid grid-cols-4 gap-3 max-w-md mx-auto mb-4">
           ${cards.map((emoji, i) => `
             <div class="memory-card w-20 h-20 cursor-pointer perspective-1000" data-index="${i}">
               <div class="memory-card-inner w-full h-full relative transition-transform duration-500" style="transform-style: preserve-3d;">
                 <div class="memory-card-front absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-3xl" style="backface-visibility: hidden;">❓</div>
                 <div class="memory-card-back absolute inset-0 bg-gray-800 rounded-lg flex items-center justify-center text-4xl" style="backface-visibility: hidden; transform: rotateY(180deg);">${emoji}</div>
               </div>
             </div>
           `).join('')}
         </div>
         <p class="text-gray-400">Moves: <span id="memory-moves">0</span></p>
       </div>
     `;
     
     window.memoryState = { cards, flipped, matched, moves };
     
     container.querySelectorAll('.memory-card').forEach((card, index) => {
       card.onclick = () => memoryFlipCard(index);
     });
   }
   
   async function memoryFlipCard(index) {
     const state = window.memoryState;
     if (state.flipped.length >= 2 || state.flipped.includes(index) || state.matched.includes(index)) return;
     
     const card = document.querySelector(`.memory-card[data-index="${index}"] .memory-card-inner`);
     card.style.transform = 'rotateY(180deg)';
     state.flipped.push(index);
     
     if (state.flipped.length === 2) {
       state.moves++;
       document.getElementById('memory-moves').textContent = state.moves;
       
       const [first, second] = state.flipped;
       const firstEmoji = state.cards[first];
       const secondEmoji = state.cards[second];
       
       if (firstEmoji === secondEmoji) {
         state.matched.push(first, second);
         state.flipped = [];
         
         const score = Math.max(1000 - state.moves * 50, 100);
         document.getElementById('game-score').textContent = score;
       } else {
         setTimeout(() => {
           document.querySelector(`.memory-card[data-index="${first}"] .memory-card-inner`).style.transform = 'rotateY(0deg)';
           document.querySelector(`.memory-card[data-index="${second}"] .memory-card-inner`).style.transform = 'rotateY(0deg)';
           state.flipped = [];
         }, 1000);
       }
     }
   }
   
   // Speed Clicker Game
   function renderClickerGame(container) {
     container.innerHTML = `
       <div class="text-center">
         <p class="text-2xl mb-4">Click as fast as you can!</p>
         <p class="text-gray-400 mb-6">Time: <span id="clicker-time" class="text-cyan-400 font-bold text-2xl">10</span>s</p>
         <button id="clicker-btn" class="w-48 h-48 rounded-full bg-gradient-to-br from-orange-500 to-red-600 text-7xl shadow-2xl hover:scale-105 transition disabled:opacity-50" disabled>
           👆
         </button>
         <p class="mt-8 text-4xl font-bold text-cyan-400">Clicks: <span id="clicker-count">0</span></p>
         <button onclick="startClickerGame()" class="mt-6 px-8 py-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg font-bold text-lg">Start</button>
       </div>
     `;
   }
   
   async function startClickerGame() {
     let timeLeft = 10;
     window.clickerClicks = 0;
     
     const btn = document.getElementById('clicker-btn');
     btn.disabled = false;
     btn.onclick = () => {
       window.clickerClicks++;
       document.getElementById('clicker-count').textContent = window.clickerClicks;
       document.getElementById('game-score').textContent = window.clickerClicks * 10;
     };
     
     document.getElementById('clicker-count').textContent = '0';
     document.getElementById('clicker-time').textContent = '10';
     
     if (window.clickerInterval) clearInterval(window.clickerInterval);
     window.clickerInterval = setInterval(async () => {
       timeLeft--;
       document.getElementById('clicker-time').textContent = timeLeft;
       
       if (timeLeft <= 0) {
         clearInterval(window.clickerInterval);
         btn.disabled = true;
         console.log("Clicker ended. Score:", window.clickerClicks * 10);
       }
     }, 1000);
   }
   
   // Reaction Time Game
   function renderReactionGame(container) {
     container.innerHTML = `
       <div class="text-center">
         <div id="reaction-box" class="w-80 h-80 mx-auto rounded-3xl bg-red-500 flex items-center justify-center cursor-pointer transition-all shadow-2xl" onclick="reactionClick()">
           <p id="reaction-text" class="text-2xl font-bold px-8">Click to Start</p>
         </div>
         <p class="mt-8 text-gray-400 text-lg">Best Time: <span id="reaction-best" class="text-cyan-400 font-bold text-2xl">---</span>ms</p>
       </div>
     `;
     
     window.reactionState = { waiting: false, startTime: 0, canClick: true };
   }
   
   async function reactionClick() {
     const state = window.reactionState;
     const box = document.getElementById('reaction-box');
     const text = document.getElementById('reaction-text');
     
     if (!state.canClick) return;
     
     if (!state.waiting) {
       state.waiting = true;
       state.canClick = false;
       box.className = 'w-80 h-80 mx-auto rounded-3xl bg-yellow-500 flex items-center justify-center cursor-pointer transition-all shadow-2xl';
       text.textContent = 'Wait for green...';
       
       const delay = 1000 + Math.random() * 3000;
       window.reactionTimeout = setTimeout(() => {
         state.startTime = Date.now();
         state.canClick = true;
         box.className = 'w-80 h-80 mx-auto rounded-3xl bg-green-500 flex items-center justify-center cursor-pointer transition-all shadow-2xl';
         text.textContent = 'CLICK NOW!';
       }, delay);
     } else {
       const reactionTime = Date.now() - state.startTime;
       const score = Math.max(1000 - reactionTime, 100);
       
       document.getElementById('game-score').textContent = score;
       
       box.className = 'w-80 h-80 mx-auto rounded-3xl bg-blue-500 flex items-center justify-center cursor-pointer transition-all shadow-2xl';
       text.innerHTML = `${reactionTime}ms<br><span class="text-lg">Click to try again</span>`;
       
       document.getElementById('reaction-best').textContent = reactionTime;
       
       state.waiting = false;
       state.canClick = true;
     }
   }
   
   // Tic Tac Toe Game
   function renderTicTacToeGame(container) {
     container.innerHTML = `
       <div class="text-center">
         <p class="text-2xl mb-6">Play against the AI</p>
         <div id="ttt-board" class="grid grid-cols-3 gap-3 max-w-sm mx-auto mb-6">
           ${[...Array(9)].map((_, i) => `
             <button onclick="tttMove(${i})" class="w-28 h-28 bg-blue-500/20 border-3 border-blue-500/50 rounded-xl text-5xl font-bold hover:bg-blue-500/30 transition"></button>
           `).join('')}
         </div>
         <p id="ttt-status" class="text-2xl text-cyan-400 mb-6">Your turn (X)</p>
         <button onclick="renderTicTacToeGame(document.getElementById('game-container'))" class="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg font-bold">New Game</button>
       </div>
     `;
     window.tttState = { board: Array(9).fill(null), isPlayerTurn: true, gameOver: false };
   }
   
   async function tttMove(index) {
     const state = window.tttState;
     if (state.gameOver || !state.isPlayerTurn || state.board[index]) return;
     
     state.board[index] = 'X';
     updateTTTBoard();
     
     if (checkTTTWinner('X')) {
       document.getElementById('ttt-status').textContent = '🎉 You Win!';
       state.gameOver = true;
       document.getElementById('game-score').textContent = 100;
       return;
     }
     
     if (state.board.every(cell => cell !== null)) {
       document.getElementById('ttt-status').textContent = '🤝 Draw!';
       state.gameOver = true;
       return;
     }
     
     state.isPlayerTurn = false;
     document.getElementById('ttt-status').textContent = 'AI thinking...';
     setTimeout(() => aiTTTMove(), 500);
   }
   
   function aiTTTMove() {
     const state = window.tttState;
     const empty = state.board.map((cell, i) => cell === null ? i : null).filter(i => i !== null);
     if (empty.length === 0) return;
     
     const move = empty[Math.floor(Math.random() * empty.length)];
     state.board[move] = 'O';
     updateTTTBoard();
     
     if (checkTTTWinner('O')) {
       document.getElementById('ttt-status').textContent = '😔 AI Wins!';
       state.gameOver = true;
       return;
     }
     
     if (state.board.every(cell => cell !== null)) {
       document.getElementById('ttt-status').textContent = '🤝 Draw!';
       state.gameOver = true;
       return;
     }
     
     state.isPlayerTurn = true;
     document.getElementById('ttt-status').textContent = 'Your turn (X)';
   }
   
   function updateTTTBoard() {
     const buttons = document.querySelectorAll('#ttt-board button');
     window.tttState.board.forEach((cell, i) => {
       buttons[i].textContent = cell || '';
       buttons[i].style.color = cell === 'X' ? '#10b981' : '#06b6d4';
     });
   }
   
   function checkTTTWinner(player) {
     const board = window.tttState.board;
     const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
     return wins.some(combo => combo.every(i => board[i] === player));
   }
   
   // Coin Flip Game
   function renderCoinFlipGame(container) {
     container.innerHTML = `
       <div class="text-center">
         <p class="text-2xl mb-8">Choose Heads or Tails</p>
         <div id="coin-display" class="w-40 h-40 mx-auto mb-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-6xl shadow-2xl">
           🪙
         </div>
         <p id="coin-result" class="text-3xl text-cyan-400 mb-8 h-10"></p>
         <div class="flex gap-6 justify-center mb-6">
           <button onclick="flipCoin('heads')" class="px-10 py-5 bg-gradient-to-br from-yellow-500 to-amber-600 text-white font-bold rounded-xl hover:scale-105 transition text-2xl shadow-xl">
             HEADS
           </button>
           <button onclick="flipCoin('tails')" class="px-10 py-5 bg-gradient-to-br from-amber-500 to-orange-600 text-white font-bold rounded-xl hover:scale-105 transition text-2xl shadow-xl">
             TAILS
           </button>
         </div>
         <p class="text-gray-400 text-xl">Streak: <span id="coin-streak" class="text-cyan-400 font-bold text-2xl">0</span></p>
       </div>
     `;
     window.coinStreak = 0;
   }
   
   async function flipCoin(choice) {
     const coin = document.getElementById('coin-display');
     const result = document.getElementById('coin-result');
     
     coin.style.animation = 'none';
     setTimeout(() => {
       coin.style.animation = 'float 0.5s ease-in-out 3';
     }, 10);
     
     setTimeout(async () => {
       const outcome = Math.random() < 0.5 ? 'heads' : 'tails';
       coin.textContent = outcome === 'heads' ? '👑' : '🦅';
       
       if (choice === outcome) {
         window.coinStreak++;
         result.textContent = '🎉 You Win!';
         result.style.color = '#10b981';
         const score = window.coinStreak * 10;
         document.getElementById('game-score').textContent = score;
       } else {
         result.textContent = '😔 You Lose!';
         result.style.color = '#ef4444';
         window.coinStreak = 0;
       }
       
       document.getElementById('coin-streak').textContent = window.coinStreak;
     }, 1500);
   }
   
   // Wordle Game
   function renderWordleGame(container) {
     const words = ['GAMES', 'SCORE', 'PLAYS', 'WORLD', 'HEART', 'LIGHT', 'SOUND', 'POWER', 'MUSIC', 'HAPPY'];
     const word = words[Math.floor(Math.random() * words.length)];
     
     container.innerHTML = `
       <div class="text-center max-w-sm mx-auto">
         <p class="text-2xl mb-6">Guess the 5-letter word</p>
         <div id="wordle-grid" class="mb-6">
           ${[...Array(6)].map(() => `
             <div class="flex gap-2 mb-2 justify-center">
               ${[...Array(5)].map(() => `
                 <div class="w-14 h-14 border-2 border-gray-600 rounded-lg flex items-center justify-center text-2xl font-bold"></div>
               `).join('')}
             </div>
           `).join('')}
         </div>
         <input type="text" id="wordle-input" maxlength="5" class="w-full bg-black/50 border border-cyan-500/30 rounded-lg px-4 py-3 text-white text-center text-xl uppercase mb-3 focus:border-cyan-500 focus:outline-none" placeholder="Enter word">
         <button onclick="submitWordleGuess()" class="w-full px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-bold rounded-lg hover:from-teal-600 hover:to-emerald-700 transition">Submit</button>
         <p id="wordle-message" class="mt-4 text-xl h-8"></p>
       </div>
     `;
     
     window.wordleState = { word, guesses: 0, gameOver: false };
     
     document.getElementById('wordle-input').addEventListener('keypress', (e) => {
       if (e.key === 'Enter') submitWordleGuess();
     });
   }
   
   async function submitWordleGuess() {
     const state = window.wordleState;
     if (state.gameOver) return;
     
     const input = document.getElementById('wordle-input');
     const guess = input.value.toUpperCase();
     
     if (guess.length !== 5) {
       document.getElementById('wordle-message').textContent = 'Must be 5 letters!';
       return;
     }
     
     const grid = document.getElementById('wordle-grid');
     const row = grid.children[state.guesses];
     const cells = row.children;
     
     for (let i = 0; i < 5; i++) {
       cells[i].textContent = guess[i];
       if (guess[i] === state.word[i]) {
         cells[i].style.background = '#10b981';
         cells[i].style.borderColor = '#10b981';
       } else if (state.word.includes(guess[i])) {
         cells[i].style.background = '#f59e0b';
         cells[i].style.borderColor = '#f59e0b';
       } else {
         cells[i].style.background = '#6b7280';
         cells[i].style.borderColor = '#6b7280';
       }
     }
     
     state.guesses++;
     input.value = '';
     
     if (guess === state.word) {
       document.getElementById('wordle-message').textContent = '🎉 You won!';
       document.getElementById('wordle-message').style.color = '#10b981';
       const score = (7 - state.guesses) * 20;
       document.getElementById('game-score').textContent = score;
       state.gameOver = true;
     } else if (state.guesses >= 6) {
       document.getElementById('wordle-message').textContent = `Word was ${state.word}`;
       document.getElementById('wordle-message').style.color = '#ef4444';
       state.gameOver = true;
     }
   }
   
   // Simon Says Game
   function renderSimonGame(container) {
     container.innerHTML = `
       <div class="text-center">
         <p class="text-2xl mb-6">Watch and repeat the pattern</p>
         <div class="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-6">
           <button onclick="simonClick(0)" class="simon-btn w-36 h-36 rounded-xl transition-all" data-color="0" style="background: #ef4444;"></button>
           <button onclick="simonClick(1)" class="simon-btn w-36 h-36 rounded-xl transition-all" data-color="1" style="background: #10b981;"></button>
           <button onclick="simonClick(2)" class="simon-btn w-36 h-36 rounded-xl transition-all" data-color="2" style="background: #3b82f6;"></button>
           <button onclick="simonClick(3)" class="simon-btn w-36 h-36 rounded-xl transition-all" data-color="3" style="background: #f59e0b;"></button>
         </div>
         <p id="simon-status" class="text-2xl mb-6">Round: <span id="simon-round">0</span></p>
         <button onclick="startSimonGame()" class="px-8 py-3 bg-gradient-to-r from-pink-500 to-rose-600 rounded-lg font-bold text-lg">Start</button>
       </div>
     `;
     window.simonState = { sequence: [], playerSequence: [], round: 0, playing: false, canClick: false };
   }
   
   function startSimonGame() {
     window.simonState = { sequence: [], playerSequence: [], round: 0, playing: true, canClick: false };
     nextSimonRound();
   }
   
   function nextSimonRound() {
     const state = window.simonState;
     state.round++;
     state.sequence.push(Math.floor(Math.random() * 4));
     state.playerSequence = [];
     document.getElementById('simon-round').textContent = state.round;
     document.getElementById('game-score').textContent = state.round * 10;
     playSimonSequence();
   }
   
   function playSimonSequence() {
     const state = window.simonState;
     state.canClick = false;
     let i = 0;
     
     const interval = setInterval(() => {
       if (i >= state.sequence.length) {
         clearInterval(interval);
         state.canClick = true;
         return;
       }
       
       flashSimonButton(state.sequence[i]);
       i++;
     }, 800);
   }
   
   function flashSimonButton(color) {
     const buttons = document.querySelectorAll('.simon-btn');
     const btn = buttons[color];
     const original = btn.style.background;
     btn.style.filter = 'brightness(1.5)';
     btn.style.transform = 'scale(0.95)';
     
     setTimeout(() => {
       btn.style.filter = 'brightness(1)';
       btn.style.transform = 'scale(1)';
     }, 400);
   }
   
   async function simonClick(color) {
     const state = window.simonState;
     if (!state.playing || !state.canClick) return;
     
     flashSimonButton(color);
     state.playerSequence.push(color);
     
     const index = state.playerSequence.length - 1;
     if (state.playerSequence[index] !== state.sequence[index]) {
       document.getElementById('simon-status').innerHTML = `<span class="text-red-400">Game Over! Round: ${state.round}</span>`;
       state.playing = false;
       return;
     }
     
     if (state.playerSequence.length === state.sequence.length) {
       state.canClick = false;
       setTimeout(() => nextSimonRound(), 1000);
     }
   }
   
   // Pong Game
   function renderPongGame(container) {
     container.innerHTML = `
       <div class="text-center">
         <canvas id="pong-canvas" width="600" height="400" class="border-2 border-purple-500 rounded-xl"></canvas>
         <p class="text-gray-400 mt-4 text-lg">Use ↑↓ arrow keys to move</p>
         <button onclick="startPongGame()" class="mt-4 px-8 py-3 bg-gradient-to-r from-violet-500 to-purple-600 rounded-lg font-bold text-lg">Start Game</button>
       </div>
     `;
   }
   
   async function startPongGame() {
     const canvas = document.getElementById('pong-canvas');
     const ctx = canvas.getContext('2d');
     
     const game = {
       paddle: { x: 10, y: canvas.height / 2 - 40, width: 10, height: 80, dy: 0 },
       aiPaddle: { x: canvas.width - 20, y: canvas.height / 2 - 40, width: 10, height: 80 },
       ball: { x: canvas.width / 2, y: canvas.height / 2, dx: 4, dy: 4, radius: 8 },
       score: 0
     };
     
     document.onkeydown = (e) => {
       if (e.key === 'ArrowUp') game.paddle.dy = -6;
       if (e.key === 'ArrowDown') game.paddle.dy = 6;
     };
     
     document.onkeyup = (e) => {
       if (e.key === 'ArrowUp' || e.key === 'ArrowDown') game.paddle.dy = 0;
     };
     
     function draw() {
       ctx.fillStyle = '#0a0a0f';
       ctx.fillRect(0, 0, canvas.width, canvas.height);
       
       ctx.fillStyle = '#a855f7';
       ctx.fillRect(game.paddle.x, game.paddle.y, game.paddle.width, game.paddle.height);
       ctx.fillRect(game.aiPaddle.x, game.aiPaddle.y, game.aiPaddle.width, game.aiPaddle.height);
       
       ctx.fillStyle = '#fff';
       ctx.beginPath();
       ctx.arc(game.ball.x, game.ball.y, game.ball.radius, 0, Math.PI * 2);
       ctx.fill();
     }
     
     function update() {
       game.paddle.y += game.paddle.dy;
       if (game.paddle.y < 0) game.paddle.y = 0;
       if (game.paddle.y + game.paddle.height > canvas.height) game.paddle.y = canvas.height - game.paddle.height;
       
       if (game.ball.y < game.aiPaddle.y + game.aiPaddle.height / 2) game.aiPaddle.y -= 4;
       if (game.ball.y > game.aiPaddle.y + game.aiPaddle.height / 2) game.aiPaddle.y += 4;
       
       game.ball.x += game.ball.dx;
       game.ball.y += game.ball.dy;
       
       if (game.ball.y - game.ball.radius < 0 || game.ball.y + game.ball.radius > canvas.height) {
         game.ball.dy *= -1;
       }
       
       if (game.ball.x - game.ball.radius < game.paddle.x + game.paddle.width &&
           game.ball.y > game.paddle.y && game.ball.y < game.paddle.y + game.paddle.height) {
         game.ball.dx *= -1;
         game.score += 10;
         document.getElementById('game-score').textContent = game.score;
       }
       
       if (game.ball.x + game.ball.radius > game.aiPaddle.x &&
           game.ball.y > game.aiPaddle.y && game.ball.y < game.aiPaddle.y + game.aiPaddle.height) {
         game.ball.dx *= -1;
       }
       
       if (game.ball.x < 0) {
         clearInterval(window.pongInterval);
         ctx.fillStyle = '#fff';
         ctx.font = '32px Russo One';
         ctx.textAlign = 'center';
         ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
       }
       
       if (game.ball.x > canvas.width) {
         game.ball.x = canvas.width / 2;
         game.ball.y = canvas.height / 2;
         game.ball.dx *= -1;
       }
     }
     
     if (window.pongInterval) clearInterval(window.pongInterval);
     window.pongInterval = setInterval(() => { update(); draw(); }, 1000 / 60);
   }
   
   // Minesweeper Game
   function renderMinesweeperGame(container) {
     const size = 8;
     const mines = 10;
     
     const board = Array(size).fill().map(() => Array(size).fill(0));
     const revealed = Array(size).fill().map(() => Array(size).fill(false));
     const flagged = Array(size).fill().map(() => Array(size).fill(false));
     
     let placed = 0;
     while (placed < mines) {
       const x = Math.floor(Math.random() * size);
       const y = Math.floor(Math.random() * size);
       if (board[y][x] !== -1) {
         board[y][x] = -1;
         placed++;
       }
     }
     
     for (let y = 0; y < size; y++) {
       for (let x = 0; x < size; x++) {
         if (board[y][x] === -1) continue;
         let count = 0;
         for (let dy = -1; dy <= 1; dy++) {
           for (let dx = -1; dx <= 1; dx++) {
             const ny = y + dy, nx = x + dx;
             if (ny >= 0 && ny < size && nx >= 0 && nx < size && board[ny][nx] === -1) count++;
           }
         }
         board[y][x] = count;
       }
     }
     
     container.innerHTML = `
       <div class="text-center">
         <p class="text-xl mb-4">Left click to reveal, right click to flag</p>
         <div id="mine-grid" class="inline-block bg-gray-800 p-3 rounded-xl">
           ${board.map((row, y) => `
             <div class="flex">
               ${row.map((cell, x) => `
                 <button class="mine-cell w-9 h-9 border border-gray-600 bg-gray-700 text-sm font-bold hover:bg-gray-600" 
                         data-x="${x}" data-y="${y}"
                         onclick="revealMineCell(${x}, ${y})"
                         oncontextmenu="flagMineCell(event, ${x}, ${y})">
                 </button>
               `).join('')}
             </div>
           `).join('')}
         </div>
         <p id="mine-status" class="mt-4 text-xl"></p>
       </div>
     `;
     
     window.mineState = { board, revealed, flagged, gameOver: false };
   }
   
   function revealMineCell(x, y) {
     const state = window.mineState;
     if (state.gameOver || state.revealed[y][x] || state.flagged[y][x]) return;
     
     state.revealed[y][x] = true;
     const cell = document.querySelector(`[data-x="${x}"][data-y="${y}"]`);
     
     if (state.board[y][x] === -1) {
       cell.textContent = '💣';
       cell.style.background = '#ef4444';
       document.getElementById('mine-status').innerHTML = '<span class="text-red-400">Game Over!</span>';
       state.gameOver = true;
       revealAllMines();
       return;
     }
     
     cell.style.background = '#374151';
     const num = state.board[y][x];
     if (num > 0) {
       cell.textContent = num;
       const colors = ['#3b82f6', '#10b981', '#ef4444', '#8b5cf6', '#f59e0b', '#ec4899'];
       cell.style.color = colors[num - 1] || '#fff';
     }
     
     if (num === 0) {
       for (let dy = -1; dy <= 1; dy++) {
         for (let dx = -1; dx <= 1; dx++) {
           const ny = y + dy, nx = x + dx;
           if (ny >= 0 && ny < state.board.length && nx >= 0 && nx < state.board[0].length) {
             if (!state.revealed[ny][nx]) revealMineCell(nx, ny);
           }
         }
       }
     }
     
     checkMineWin();
   }
   
   function flagMineCell(e, x, y) {
     e.preventDefault();
     const state = window.mineState;
     if (state.gameOver || state.revealed[y][x]) return;
     
     state.flagged[y][x] = !state.flagged[y][x];
     const cell = document.querySelector(`[data-x="${x}"][data-y="${y}"]`);
     cell.textContent = state.flagged[y][x] ? '🚩' : '';
     
     checkMineWin();
     return false;
   }
   
   function revealAllMines() {
     const state = window.mineState;
     for (let y = 0; y < state.board.length; y++) {
       for (let x = 0; x < state.board[0].length; x++) {
         if (state.board[y][x] === -1) {
           const cell = document.querySelector(`[data-x="${x}"][data-y="${y}"]`);
           cell.textContent = '💣';
           cell.style.background = '#991b1b';
         }
       }
     }
   }
   
   async function checkMineWin() {
     const state = window.mineState;
     let allSafe = true;
     
     for (let y = 0; y < state.board.length; y++) {
       for (let x = 0; x < state.board[0].length; x++) {
         if (state.board[y][x] !== -1 && !state.revealed[y][x]) {
           allSafe = false;
         }
       }
     }
     
     if (allSafe && !state.gameOver) {
       document.getElementById('mine-status').innerHTML = '<span class="text-emerald-400">🎉 You Win!</span>';
       state.gameOver = true;
       const score = 200;
       document.getElementById('game-score').textContent = score;
     }
   }
   
   // ============ LEADERBOARDS ============
   function filterLeaderboard(filter) {
     currentLeaderboardFilter = filter;
     
     document.querySelectorAll('.leaderboard-filter').forEach(btn => {
       if (btn.dataset.filter === filter) {
         btn.className = 'leaderboard-filter px-5 py-2 rounded-full glass border-2 border-pink-500 text-pink-300 font-semibold';
       } else {
         btn.className = 'leaderboard-filter px-5 py-2 rounded-full glass-dark text-gray-300';
       }
     });
     
     updateLeaderboard();
   }
   
   function updateLeaderboard() {
     let scores = [...allScores];
     
     if (currentLeaderboardFilter !== 'all') {
       scores = scores.filter(s => s.game_id === currentLeaderboardFilter);
     }
     
     scores.sort((a, b) => b.score - a.score);
     
     // Top 3 Podium
     const podium = document.getElementById('podium');
     const top3 = scores.slice(0, 3);
     
     podium.innerHTML = [1, 0, 2].map(index => {
       const entry = top3[index];
       if (!entry) return '<div></div>';
       
       const ranks = ['rank-1', 'rank-2', 'rank-3'];
       const heights = ['h-40', 'h-48', 'h-32'];
       const medals = ['🥇', '🥈', '🥉'];
       
       return `
         <div class="text-center ${index === 0 ? 'order-2' : index === 1 ? 'order-1' : 'order-3'}">
           <div class="w-16 h-16 mx-auto rounded-full ${ranks[index]} flex items-center justify-center text-2xl mb-2 font-bold text-white">
             ${medals[index]}
           </div>
           <p class="font-bold mb-1">${entry.username}</p>
           <p class="text-2xl font-bold text-yellow-400">${entry.score.toLocaleString()}</p>
           <div class="${ranks[index]} ${heights[index]} rounded-t-2xl mt-4 flex items-end justify-center pb-4">
             <span class="text-white font-bold text-3xl">${index + 1}</span>
           </div>
         </div>
       `;
     }).join('');
     
     // Rest of leaderboard
     const list = document.getElementById('leaderboard-list');
     const rest = scores.slice(3, 20);
     
     if (rest.length === 0 && top3.length === 0) {
       list.innerHTML = '<p class="text-center text-gray-400 py-8">No scores yet. Be the first!</p>';
       return;
     }
     
     list.innerHTML = rest.map((score, i) => {
       const game = getActiveGames().find(g => g.id === score.game_id);
       return `
         <div class="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition ${currentUser && score.username === currentUser.username ? 'bg-pink-500/10 border border-pink-500/30' : ''}">
           <span class="text-xl font-bold w-8 text-gray-400">#${i + 4}</span>
           <div class="flex-1">
             <p class="font-semibold">${score.username}</p>
             <p class="text-xs text-gray-400">${game ? game.name : score.game_id}</p>
           </div>
           <p class="text-xl font-bold text-cyan-400">${score.score.toLocaleString()}</p>
         </div>
       `;
     }).join('');
   }
   
   // ============ STATS ============
   function updateStats() {
     document.getElementById('stat-players').textContent = allUsers.length.toLocaleString();
     document.getElementById('stat-games').textContent = getActiveGames().length;
     document.getElementById('stat-matches').textContent = allScores.length.toLocaleString();
     document.getElementById('stat-online').textContent = Math.min(allUsers.length, Math.floor(allUsers.length * 0.3) + 1);
   }
   
   // ============ INIT ============
   
   async function initLocal() {
       renderGames();
       updateStats();
       
       // Add some dummy data so the leaderboard isn't empty
       allUsers.push({ username: 'DemoUser', avatar_color: '#ec4899', is_admin: false });
       allScores.push({ username: 'DemoUser', game_id: 'snake', score: 150 });
       
       updateStats();
       updateLeaderboard();
   }
   
   initLocal();