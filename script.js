let playerInTurn = "red";
let players = ["red","blue"]

class Gameboard {
    constructor(height, width) {
        this.height = height;
        this.width = width;
        this.slots = Array.from(Array(height), () => new Array(width).fill(0));
        this.build();
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
            playerInTurn = "blue";
        } else {
            playerInTurn = "red";
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

        this.animateFall(countFilled, column, player);
        this.nextTurn();
    }

    // Helper delay function
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Animate placing the discs into the visual board
    async animateFall(countFilled, column, player) {
        let i = 0;
        let fillIdx = column.children.length - countFilled - 1;
        let colNum = column.id.split("column")[1];
        for (let slot of column.children) {
            for (let child of slot.children) {
                if (child.classList.contains('circle') && (child.classList.contains('white')) ) {
                    child.classList.add(player);
                    child.classList.remove('white');
                    await this.delay(200);
                    child.classList.remove(player);
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
        if (player == "red") {
            this.slots[fillIdx][colNum] = 1
        }
        else {
            this.slots[fillIdx][colNum] = 2;
        }
        this.delay(200);
        lastSlot.children[1].classList.add(player);
        lastSlot.children[1].classList.remove('white');
        lastSlot.classList.add('filled');
        this.checkWinner(Number(fillIdx), Number(colNum), player);
    }

    // check winner
    checkWinner(i,j, player) {
        this.checkHorizontalWins(i,j,player);
        this.checkVerticalWins(i,j,player);
        this.checkDiagonalWins(i,j,player);
    }

    checkHorizontalWins(i, j, player) {
        let row = i;
        let playerNum = player == "red" ? 1 : 2;
        let count = 0;
        // Check forwards
        for (let k = j; k < this.slots[0].length; k++) {
            if (this.slots[row][k] == playerNum) {
                count++;
                if (count == 4) {
                    console.log("forwards hz winner: ", player);
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
                    console.log("hz winner: ", player);
                }
            }
            else {
                break;
            }
        }
    }

    checkVerticalWins(i, j, player) {
        let col = j;
        let playerNum = player == "red" ? 1 : 2;
        let count = 0;
        for (let k = i; k < this.slots.length; k++) {
            if (this.slots[k][col] == playerNum) {
                count++;
                if (count == 4) {
                    console.log("vertical winner: ", player);
                }
            }
            else {
                break;
            }
        }
    }

    checkDiagonalWins(i,j,player) {
        let count = 0;
        let playerNum = player == "red" ? 1 : 2;
        
        let k = i;
        let l = j;

        // down right
        while (l >= 0 && k >= 0 && l < this.slots[0].length && k < this.slots.length) {
            if (this.slots[k][l] == playerNum) {
                count++;
                if (count == 4) {
                    console.log("downright winner: ", player);
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
                    console.log("upleft winner: ", player);
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
                    console.log("upright winner: ", player);
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
                    console.log("downleft winner: ", player);
                }
            }
            else {
                break;
            }
            k++;
            l--;
        }
    }
}

let gameboard = new Gameboard(6,7);

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
            circle.classList.remove('white',players[0],players[1]);
            circle.classList.add(playerInTurn);
        }
    });
    gameboardCol.addEventListener('mouseout', () => {
        let slot = document.getElementById("slot" + gameboardCol.id.split("column")[1] + "0");
        if (!slot.classList.contains('filled')) {
            let circle = slot.children[1];
            circle.classList.remove(players[0],players[1]);
            circle.classList.add('white'); 
        }
    });
}
