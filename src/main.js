window.onload = function() {
    const canvas = document.getElementById('gameCanvas');
    const context = canvas.getContext('2d');
    
    canvas.width = 300;
    canvas.height = 600;

    context.fillStyle = '#222';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Placeholder for game loop and logic
    console.log('Tetris Crypto Tournament Initialized');
};
