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

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async animateFall(countFilled, column, player) {
        let k = 1;
        let i = 0;
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
            if (i == countFilled) {
                break;
            }
        }

        // set the last one to filled
        let lastIdx = column.children.length-countFilled-1;
        let lastSlot = column.children[lastIdx];
        console.log("LAST INDEX, to be filled:",lastIdx);
        if (player == "red") {
            this.slots[lastIdx][colNum] = 1
        }
        else {
            this.slots[lastIdx][colNum] = 2;
        }
        this.delay(200);
        lastSlot.children[1].classList.add(player);
        lastSlot.children[1].classList.remove('white');
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
        for (let child of slot.children) {
            if (child.classList.contains('circle')) {
                if (!child.classList.contains(playerInTurn)) {
                    child.classList.remove('white');
                    child.classList.add(playerInTurn);  
                }
            }
        }
    });
    gameboardCol.addEventListener('mouseout', () => {
        let slot = document.getElementById("slot" + gameboardCol.id.split("column")[1] + "0");
        for (let child of slot.children) {
            if (!child.classList.contains('white')) {
                child.classList.remove(playerInTurn);
                child.classList.add('white');  
            }
        }
    });
}
