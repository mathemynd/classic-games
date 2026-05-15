const GameLogger = (() => {
  const hasStorage = typeof localStorage !== 'undefined';
  let gameId = null;
  let buffer = [];
  let currentHourKey = null;

  function generateGameId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function getHourKey() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}-${hh}`;
  }

  function timestamp() {
    return new Date().toISOString();
  }

  function log(event, data) {
    const entry = {
      ts: timestamp(),
      game_id: gameId,
      event: event,
      ...data,
    };
    buffer.push(entry);
    flush();
  }

  function flush() {
    if (!hasStorage) { buffer = []; return; }
    const hourKey = getHourKey();
    if (hourKey !== currentHourKey) {
      currentHourKey = hourKey;
    }
    const key = `game_log_${currentHourKey}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    existing.push(...buffer);
    localStorage.setItem(key, JSON.stringify(existing));
    buffer = [];
  }

  function startGame(gameType) {
    gameId = generateGameId();
    log('GAME_START', { game_type: gameType });
  }

  function endGame(result, winner) {
    log('GAME_END', { result: result, winner: winner || null });
  }

  function move(player, action, boardIdx, cellIdx) {
    log('MOVE', { player, action, board: boardIdx, cell: cellIdx });
  }

  function boardWon(player, boardIdx) {
    log('BOARD_WON', { player, board: boardIdx });
  }

  function boardDraw(boardIdx) {
    log('BOARD_DRAW', { board: boardIdx });
  }

  function gameWon(player) {
    endGame('WIN', player);
  }

  function gameDraw() {
    endGame('DRAW');
  }

  function reset(gameType) {
    log('RESET', { game_type: gameType });
    gameId = generateGameId();
  }

  function exportLogs() {
    if (!hasStorage) return [];
    const allLogs = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('game_log_')) {
        const entries = JSON.parse(localStorage.getItem(key));
        allLogs.push(...entries);
      }
    }
    allLogs.sort((a, b) => a.ts.localeCompare(b.ts));
    return allLogs;
  }

  function downloadLogs() {
    const logs = exportLogs();
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `game-logs-${getHourKey()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return {
    startGame,
    move,
    boardWon,
    boardDraw,
    gameWon,
    gameDraw,
    reset,
    exportLogs,
    downloadLogs,
  };
})();
