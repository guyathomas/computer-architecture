const ram = [ /**/ 0x01, 0x01, 0x10, /**/ 0x01, 0x02, 0x12, /**/ 0x02, 0x01, 0x02,  /**/0x03, 0x01, 0x0E, /**/ 0x04, null, 0x00, 0x00, 0xff, 0x00, 0xff, 0x00 ];
const register = [0, null, null];

const LOAD = 0x01;
const ADD = 0x02;
const STORE = 0x03;
const HALT = 0x04;

const operate = (instruction, arg1, arg2) => {
	switch (instruction) {
		case LOAD:
			register[arg1] = ram[arg2] + (ram[arg2 + 1] << 8);
			break;
		case ADD:
			register[arg1] += register[arg2]
			break;
		case STORE:
			ram[arg2] = register[arg1] & 0x00ff;
			ram[arg2 + 1] = register[arg1] >> 8;
			break;
		case HALT:
			break;
		default:
	}
}

while (ram[register[0]] !== HALT) {
	const pc = register[0];
	operate(ram[pc], ram[pc + 1], ram[pc + 2]);
	register[0] += 3;
}

console.log(ram)