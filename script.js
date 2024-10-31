class Player {
    constructor(name, color) {
        this.name = name;
        this.color = color;
        this.chipCount = 0;
    }
}

let playerInTurn = null;
let players = [];

class Gameboard {
    constructor(height, width) {
        this.height = height;
        this.width = width;
        this.gameActive = false;
        this.slots = Array.from(Array(height), () => new Array(width).fill(0));
    }

    // Build the gameboard
    build() {
        let gameboard = document.getElementById("gameboard");

        for (let i = 0; i < this.width; i++) {
            const elem = document.createElement('div');
            elem.classList.add('gameboard-col');
            for (let j = 0; j < this.height; j++) {
                const slot = document.createElement('div');
                const square = document.createElement('div');
                const circle = document.createElement('div');

                square.classList.add('square','brown');
                circle.classList.add('white','circle');

                slot.classList.add('gameboard-slot');
                slot.id = "slot" + String(i) + String(j);

                slot.appendChild(square);
                slot.appendChild(circle);
                elem.appendChild(slot);
            }
            elem.id = "column" + String(i);
            gameboard.appendChild(elem);
        }
    }

    // Advance to the next turn
    nextTurn() {
        if (playerInTurn == players[0]) {
            this.showOverlay(players[1].name, "nextTurn");
            playerInTurn = players[1];
        } else {
            this.showOverlay(players[0].name, "nextTurn");
            playerInTurn = players[0];
        }
    }

    // Perform logic required to execute the player's turn
    takeTurn(column, player) {
        let countFilled = 0;
        let colNum = column.id.split("column")[1];
        for (let i = 0; i < this.slots.length; i++) {
            if (this.slots[i][colNum] != 0) {
                countFilled += 1;
            }
        }
        let fillIdx = column.children.length - countFilled - 1;

        this.animateFall(fillIdx, column, player);
        this.updateSlots(fillIdx, colNum, player);
        let winner = this.checkWinner(Number(fillIdx), Number(colNum), player);
        if (!winner) {
            this.nextTurn();
        }
        else {
            this.showOverlay(player.name, "win");
        }
    }

    updateSlots(fillIdx, colNum, player) {
        if (player.color == "red") {
            this.slots[fillIdx][colNum] = 1
            player.chipCount += 1;
            this.updatePlayerChips(player);
        }
        else {
            this.slots[fillIdx][colNum] = 2;
            player.chipCount += 1;
            this.updatePlayerChips(player);
        }
    }

    // Helper delay function
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Animate placing the discs into the visual board
    async animateFall(fillIdx, column, player) {
        let i = 0;
        let colNum = column.id.split("column")[1];
        for (let slot of column.children) {
            for (let child of slot.children) {
                if (
                    child.classList.contains('circle') && 
                    child.classList.contains('white') 
                ) {
                    child.classList.add(player.color);
                    child.classList.remove('white');
                    await this.delay(200);
                    child.classList.remove(player.color);
                    child.classList.add('white');
                }
            }
            i += 1;
            if (i == fillIdx) {
                break;
            }
        }

        // column is filled
        if (fillIdx < 0) {
            return;
        }

        // set the last one to filled
        let lastSlot = column.children[fillIdx];
        lastSlot.children[1].classList.add(player.color);
        lastSlot.children[1].classList.remove('white');
        lastSlot.classList.add('filled');
    }

    // Show overlay message when game events happen
    async showOverlay(playerName, messageType) {
        let overlayElem = document.getElementById("overlay");
        let overlayText = document.getElementById("overlay-message");

        await this.delay(2000);

        if (messageType == "nextTurn") {
            overlayText.textContent = `Now it is ${playerName}'s turn.`;
            overlayElem.classList.remove("hidden");
            await this.delay(2000);
            overlayElem.classList.add("hidden");
        }
        else {
            overlayText.textContent = `${playerName} wins! Refresh to play again.`;
            overlayElem.classList.remove("hidden");
        }
    }

    // check winner
    checkWinner(i,j, player) {
        if (
            this.checkHorizontalWins(i,j,player) ||
            this.checkVerticalWins(i,j,player) ||
            this.checkDiagonalWins(i,j,player)
        ) {
            return true;
        }
        return false;
    }

    // check for 4 adjacent player discs to the left and right of the current disc
    checkHorizontalWins(i, j, player) {
        let row = i;
        let playerNum = player.color == "red" ? 1 : 2;
        let count = 0;
        // Check forwards
        for (let k = j; k < this.slots[0].length; k++) {
            if (this.slots[row][k] == playerNum) {
                count++;
                if (count == 4) {
                    return true;
                }
            }
            else {
                break;
            }
        }
        // Check backwards
        for (let k = j-1; k >= 0; k--) {
            if (this.slots[row][k] == playerNum) {
                count++;
                if (count == 4) {
                    return true;
                }
            }
            else {
                break;
            }
        }
        return false;
    }

    // check for 4 adjacent player discs below the current disc
    checkVerticalWins(i, j, player) {
        let col = j;
        let playerNum = player.color == "red" ? 1 : 2;
        let count = 0;
        for (let k = i; k < this.slots.length; k++) {
            if (this.slots[k][col] == playerNum) {
                count++;
                if (count == 4) {
                    return true;
                }
            }
            else {
                break;
            }
        }
        return false;
    }

    // check for 4 adjacent player discs in the diagonals surrounding the current disc
    checkDiagonalWins(i,j,player) {
        let count = 0;
        let playerNum = player.color == "red" ? 1 : 2;
        
        let k = i;
        let l = j;

        // down right
        while (l >= 0 && k >= 0 && l < this.slots[0].length && k < this.slots.length) {
            if (this.slots[k][l] == playerNum) {
                count++;
                if (count == 4) {
                    return true;
                }
            }
            else {
                break;
            }
            k++;
            l++;
        }
        k = i-1;
        l = j-1;
        // upleft
        while (l >= 0 && k >= 0 && l < this.slots[0].length && k < this.slots.length) {
            if (this.slots[k][l] == playerNum) {
                count++;
                if (count == 4) {
                    return true;
                }
            }
            else {
                break;
            }
            k--;
            l--;
        }
        count = 0;
        k = i;
        l = j;
        // up right
        while (l >= 0 && k >= 0 && l < this.slots[0].length && k < this.slots.length) {
            if (this.slots[k][l] == playerNum) {
                count++;
                if (count == 4) {
                    return true;
                }
            }
            else {
                break;
            }
            k--;
            l++;
        }
        k = i+1;
        l = j-1;
        // down left
        while (l >= 0 && k >= 0 && l < this.slots[0].length && k < this.slots.length) {
            if (this.slots[k][l] == playerNum) {
                count++;
                if (count == 4) {
                    return true;
                }
            }
            else {
                break;
            }
            k++;
            l--;
        }

        return false;
    }

    // add the event listeners needed to do game animation/logic
    addGameboardListeners() {
        // Add event listeners
        let gameboardCols = document.getElementsByClassName('gameboard-col');
        for (let gameboardCol of gameboardCols) {
            gameboardCol.addEventListener('click', () => {
                let columnObj = document.getElementById(gameboardCol.id);
                gameboard.takeTurn(columnObj, playerInTurn);
            });
            gameboardCol.addEventListener('mouseover', () => {
                let slot = document.getElementById("slot" + gameboardCol.id.split("column")[1] + "0");
                if (!slot.classList.contains('filled')) {
                    let circle = slot.children[1];
                    circle.classList.remove('white',players[0].color,players[1].color);
                    circle.classList.add(playerInTurn.color);
                }
            });
            gameboardCol.addEventListener('mouseout', () => {
                let slot = document.getElementById("slot" + gameboardCol.id.split("column")[1] + "0");
                if (!slot.classList.contains('filled')) {
                    let circle = slot.children[1];
                    circle.classList.remove(players[0].color,players[1].color);
                    circle.classList.add('white'); 
                }
            });
        }
    }

    // Update player's chips played display
    updatePlayerChips(player) {
        let playerChipItem = document.getElementById(`player-${player.color}-chipcount`);
        playerChipItem.textContent = player.chipCount;
    }
}

let gameboard = new Gameboard(6,7);

// Beginning logic after form submit
document.getElementById('btn-submit').addEventListener('click', (event) => {
    event.preventDefault();

    // hide the welcome page and show the gameboard header (gameboard built below)
    document.getElementById("welcome-page").classList.add('hidden');
    document.getElementById('gameboard-header-container').classList.remove('hidden');

    // extract players' names from the form
    let player1Name = document.getElementById('player-one-field').value;
    let player2Name = document.getElementById('player-two-field').value;
    
    let player1GameNameElem = document.getElementById('player-red-name');
    let player2GameNameElem = document.getElementById('player-blue-name');

    // show the gameboard header and set player names
    player1GameNameElem.textContent = player1Name;
    player2GameNameElem.textContent = player2Name;

    // Reset the form
    document.getElementById('player-form').reset();
    
    // Create the players (more work todo here to transfer Players to objects)
    let player1 = new Player(player1Name, "red");
    let player2 = new Player(player2Name, "blue");
    players = [player1,player2];
    playerInTurn = player1;
    
    // Build the gameboard
    gameboard.build();
    gameboard.addGameboardListeners();
})
