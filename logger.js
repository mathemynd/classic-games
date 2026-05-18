const GameLogger = (function() {
  let gameId = null;
  let currentGameType = null;

  function getHourKey() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    return `game_log_${year}-${month}-${day}-${hour}`;
  }

  function generateGameId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }

  function log(event, data) {
    const entry = {
      ts: new Date().toISOString(),
      game_id: gameId,
      event: event,
      ...data
    };
    
    const key = getHourKey();
    const existing = localStorage.getItem(key);
    const logs = existing ? JSON.parse(existing) : [];
    logs.push(entry);
    localStorage.setItem(key, JSON.stringify(logs));
  }

  function endGame(result, winner) {
    const data = { result };
    if (winner !== undefined) {
      data.winner = winner;
    }
    log('GAME_END', data);
  }

  return {
    startGame: function(gameType) {
      gameId = generateGameId();
      currentGameType = gameType;
      log('GAME_START', { game_type: gameType });
    },

    move: function(player, action, boardIdx, cellIdx) {
      const data = { player, action };
      if (boardIdx !== null && boardIdx !== undefined) {
        data.board = boardIdx;
      }
      if (cellIdx !== null && cellIdx !== undefined) {
        data.cell = cellIdx;
      }
      log('MOVE', data);
    },

    boardWon: function(player, boardIdx) {
      log('BOARD_WON', { player, board: boardIdx });
    },

    boardDraw: function(boardIdx) {
      log('BOARD_DRAW', { board: boardIdx });
    },

    gameWon: function(player) {
      endGame('WIN', player);
    },

    gameDraw: function() {
      endGame('DRAW');
    },

    reset: function(gameType) {
      log('RESET', { game_type: gameType });
      gameId = generateGameId();
      currentGameType = gameType;
    },

    exportLogs: function() {
      const allLogs = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('game_log_')) {
          allLogs[key] = JSON.parse(localStorage.getItem(key));
        }
      }
      return allLogs;
    },

    downloadLogs: function() {
      const logs = this.exportLogs();
      const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `game_logs_${new Date().toISOString()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };
})();
