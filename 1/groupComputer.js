const ram = [ /**/ 0x01, 0x01, 0x10, /**/ 0x01, 0x02, 0x12, /**/ 0x02, 0x01, 0x02,  /**/0x03, 0x01, 0x0E, /**/ 0x04, null, 0x00, 0x00, 0x06, 0x00, 0x03, 0x00 ];

const LOADW = 0x01;
const ADD = 0x02;
const STOREW = 0x03;
const HALT = 0x04;
const SUBTRACT = 0x05;
const MULTIPLY = 0x06;
const DIVIDE = 0x07;

let registers = [null, null];

let address = 0;

while (ram[address] !== HALT) {
    let operation = ram[address];
    let arg1 = ram[address + 1];
    let arg2 = ram[address + 2];
    
    execute(operation, arg1, arg2);

    address += 3;
}

console.log(ram);


function execute(operation, arg1, arg2) {
    switch (operation) {
        case LOADW:
            registers[arg1 - 1] = ram[arg2] + (ram[arg2 + 1] << 8);
            console.log('LOADW', arg1, arg2, registers);
            break;
        case ADD: {
            let a = registers[0];
            let b = registers[1];
            registers[0] = a + b;
            console.log('ADD', arg1, arg2, registers);
            break;
        }
        case SUBTRACT: {
            let a = registers[0];
            let b = registers[1];
            registers[0] = a - b;
            console.log('SUBTRACT', arg1, arg2, registers);
            break;
        }
        case STOREW: {
            let a = registers[0];
            ram[arg2] = (0xFF & a); // Low
            ram[arg2 + 1] = (a >> 8); // High
            console.log('STOREW', arg1, arg2, registers);
            break;
        }
        case MULTIPLY: {
            let a = registers[0];
            let b = registers[1];
            registers[0] = a * b;
            break
        }
        case DIVIDE: {
            let a = registers[0];
            let b = registers[1];
            registers[0] = Math.floor(a / b);
            break;
        }
        case HALT:
            break;
    }
}
