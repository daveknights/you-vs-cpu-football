const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const canvasDimensions = [0, 0, canvas.width, canvas.height];
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
let playing = true;
let pXSpeed = 0;
let pYSpeed = 0;
let ballSpeed = 0;
let ball = {x: centerX, y: centerY};
let player = {x: 350, y: centerY - 20, score: 0};
let pKeeper = {y: centerY, direction: 'down'};
let opponent = {x: 700, y: centerY, score: 0};
let oKeeper = {y: centerY, direction: 'down'};
let hasBall = '';
let goalScored = false;

const makeRect = (col, [x,y,w,h]) => {
    ctx.beginPath();
    ctx.fillStyle = col;
    ctx.rect(x,y,w,h)
    ctx.fill();
};

const makeStrokeRect = (col, [x,y,w,h]) => {
    ctx.beginPath();
    ctx.strokeStyle = col;
    ctx.strokeRect(x,y,w,h);
};

const addShadow = () => {
    ctx.shadowColor = "#040";
    ctx.shadowOffsetY = 4;
    ctx.shadowBlur = 4;
};

const elements = {
    pitch: () => {
        makeRect('green', [...canvasDimensions]);
        ctx.beginPath();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 3;
        ctx.moveTo(centerX, 0);
        ctx.lineTo(centerX, canvas.height);
        ctx.stroke();
    },
    penalyAreas: () => {
        makeStrokeRect('white', [-3, 100, 135, 250]);
        makeStrokeRect('white', [668, 100, 135, 250]);
    },
    centreCircle: () => {
        ctx.beginPath();
        ctx.strokeStyle = 'white';
        ctx.arc(centerX, centerY, 100, 0, 2 * Math.PI);
        ctx.stroke();
    },
    goals: () => {
        makeRect('white', [0, 150, 10, 10]);
        makeRect('white', [0, 290, 10, 10]);

        makeRect('white', [canvas.width - 10, 150, 10, 10]);
        makeRect('white', [canvas.width - 10, 290, 10, 10]);
    },
    ball: () => {
        ctx.beginPath();
        ctx.fillStyle = 'white';
        ctx.save();
        addShadow();
        ctx.arc(ball.x += ballSpeed, ball.y, 12, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();
    },
    opponent: () => {
        makeRect('black', [opponent.x, opponent.y - 60, 25, 10]);
        makeRect('pink', [opponent.x, opponent.y - 50, 25, 20]);
        ctx.save();
        addShadow();
        makeRect('blue', [opponent.x, opponent.y - 30, 25, 40]);
        ctx.restore();
    },
    opponentKeeper: () => {
        makeRect('lime', [778, oKeeper.y - 20, 20, 40]);
        makeRect('brown', [781, oKeeper.y - 10, 17, 20]);
    },
    player: () => {
        makeRect('yellow', [player.x += pXSpeed, (player.y += pYSpeed) - 60, 25, 10]);
        makeRect('pink', [player.x, player.y - 50, 25, 20]);
        ctx.save();
        addShadow();
        makeRect('red', [player.x, player.y - 30, 25, 40]);
        ctx.restore();
    },
    playerKeeper: () => {
        makeRect('yellow', [2, pKeeper.y - 20, 20, 40]);
        makeRect('brown', [2, pKeeper.y - 10, 17, 20]);
    },
    score: () => {
        ctx.font = '24px sans-serif';
        ctx.fillStyle = 'black';
        ctx.fillText(`Score: ${player.score} - ${opponent.score}`, 10, 30);
    },
    gameOver: () => {
        ctx.font = '70px sans-serif';
        ctx.strokeStyle = '#800';
        ctx.strokeText('Game Over', centerX - 200, centerY + 15);
    }
}

const keyPressed = e => {
    pXSpeed = 0;
    pYSpeed = 0;

    switch (e.keyCode) {
        case 32: // space (shoot)
            // Can only shoot when on target
            if (player.x > 640 && ball.y > 165 && ball.y < 285) {
                hasBall === 'player'&& (ballSpeed = 2);
            }
            break;
        case 37: // left
            if (hasBall === 'player') {
                player.x > 50 && (pXSpeed = -1.25);
            } else {
                player.x > 50 && (pXSpeed = -1.5);
            }
            break;
        case 38: // up
            pYSpeed = -1
            hasBall === 'player' && (ball.y -= 5);
            break;
        case 39: // right
            if (hasBall === 'player') {
                player.x < 720 && (pXSpeed = 1.25);
            } else {
                player.x < 720 && (pXSpeed = 1.5);
            }
            break;
        case 40: // down
            pYSpeed = 1;
            hasBall === 'player' && (ball.y += 5);
            break;
    }
}

const keyReleased = () => {
    pXSpeed = 0;
    pYSpeed = 0;
};

const reset = (scorer) => {
    goalScored = false;
    ball.x = centerX;
    ball.y = centerY;
    ballSpeed = 0;

    opponent.y = centerY

    if (scorer === 'player') {
        player.x = 100;
        player.y = centerY + 30
        opponent.x = 450;
    } else {
        player.x = 350;
        player.y = centerY - 20
        opponent.x = 700;
    }
};

const defendTheGoal = () => {
    // Move opponent keeper when player attacking
    if (hasBall === 'player' && player.x > 500) {
        if (oKeeper.direction === 'down') {
            oKeeper.y += 1;

            if (oKeeper.y > 266) {
                oKeeper.direction = 'up'
            }
        } else {
            oKeeper.y -= 1;

            if (oKeeper.y < 184) {
                oKeeper.direction = 'down'
            }
        }
    }
    // Move player's keeper when opponent attacking
    if (hasBall === 'opponent' && opponent.x < 300) {
        if (pKeeper.direction === 'down') {
            pKeeper.y += 1;

            if (pKeeper.y > 266) {
                pKeeper.direction = 'up'
            }
        } else {
            pKeeper.y -= 1;

            if (pKeeper.y < 184) {
                pKeeper.direction = 'down'
            }
        }
    }
};

const checkForSaves = () => {
    // Opponent keeper saves ball
    if (ball.x >= 766) {
       if (oKeeper.y >= ball.y - 23 && oKeeper.y <= ball.y + 23) {
           hasBall = '';
           ball.x -= 150;
           ballSpeed = 0;
       }
   }
   // Player's keeper saves ball
   if (ball.x <= 40) {
       if (pKeeper.y >= ball.y - 23 && pKeeper.y <= ball.y + 23) {
           hasBall = '';
           ball.x += 150;
           ballSpeed = 0;
       }
   }
};

const checkForGoal = () => {
    if (ball.x > 795) {
        player.score += 1;
        goalScored = true;
        reset('player');
    } else if (ball.x < 5) {
        opponent.score += 1;
        goalScored = true;
        reset('opponent');
    }
};

const draw = () => {
    ctx.clearRect(...canvasDimensions);

    elements.pitch();
    elements.penalyAreas();
    elements.centreCircle();
    elements.score();
    elements.goals();

    if (player.score < 5 && opponent.score < 5) {
        // Show elements during game play
        elements.opponent();
        elements.opponentKeeper();
        elements.player();
        elements.playerKeeper();
        (ball.x > 0 && ball.x < 800) && elements.ball();
    } else {
        // Show at game end
        elements.gameOver();
        playing = false;
    }

    // Move ball forward while player has possesion
    if ((ball.x >= player.x + 30 && ball.x <= player.x + 35) && (player.y >= ball.y - 10 && player.y <= ball.y + 10)) {
        hasBall = 'player';
        ball.x += 5;
    } else if ((ball.x < player.x + 50 && ball.x > player.x + 40) || (player.y < ball.y - 10 && player.y > ball.y + 10)) {
        hasBall = '';
    }

    // Move ball while opponene has possesion
    if (opponent.x === ball.x + 12 && opponent.y === ball.y && opponent.x > 135) {
        hasBall = 'opponent';
        ball.x -= 5;
    } else if (hasBall === 'opponent') {
        // Player shoots
        if (opponent.x <= 135) {
            // ball.x -= 5;
            opponent.x += 1;
            ballSpeed = -2;
            hasBall = '';
        } else {
            if (opponent.y < centerY) {
                opponent.x += 1;
                opponent.y += 0.5;

                if (ball.y !== centerY) {
                    ball.x += 1;
                    ball.y += 0.5;
                }
            } else if (opponent.y > centerY) {
                opponent.x += 1;
                opponent.y -= 0.5;

                if (ball.y !== centerY) {
                    ball.x += 1;
                    ball.y -= 0.5;
                }
            }
        }
    }

    // Move opponent towards the ball if player has possesion
    if (opponent.x < ball.x + 12 && ball.x < 750) {
        opponent.x += 1;
    } else if (opponent.x > ball.x + 12 && ball.x > 0) {
        opponent.x -= 1;
    }
    if (opponent.y < ball.y) {
        opponent.y += 0.5;
    } else if (opponent.y > ball.y) {
        opponent.y -= 0.5;
    }

    defendTheGoal();
    checkForSaves();
    !goalScored && checkForGoal();

    if (playing) {
        requestAnimationFrame(draw);
    }
};

requestAnimationFrame(draw);
document.onkeydown = keyPressed;
document.onkeyup = keyReleased;
