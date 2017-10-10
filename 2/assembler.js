const sourceCode = `
  .text
  load_word reg_a x
  load_word reg_b y
  add reg_a reg_b
  store_word reg_a out
  halt
  .data
  out: .int 0
  x:   .int 2
  y:   .int 3
`;

function assemble(source) {
    const instructions = {
        load_word: 0x01,
        add: 0x02,
        store_word: 0x03,
        halt: 0x04
    };

    const instruction_params = (name) => {
        switch (name) {
            case 'load_word':
                return ['register', 'label_reference'];
                break;
            case 'store_word':
                return ['register', 'label_reference'];
                break;
            case 'add':
                return ['register', 'register'];
                break;
            case 'halt':
                return [];
                break;
        }
    };

    const registers = { reg_a: 0x01, reg_b: 0x02 };
    const directives = new Set(['.text', '.data', '.int']);

    const token_class = (val) => {
        if (directives.has(val)) {
            return val.slice(1) + '_directive';
        } else if (instructions[val]) {
            return 'instruction';
        } else if (val.slice(0, 4) === 'reg_') {
            return 'register'
        } else if (!isNaN(val)) {
            return 'number';
        } else if (val[val.length - 1] === ':') {
            return 'label_declaration'
        } else {
            return 'label_reference';
        }
    };

    const mem = new Array(20).fill(0);
    let code_start = 0;
    let data_start = 0x0e;
    let mem_pos = { code: code_start, data: data_start };
    let section = 'code';
    
    const refs = [];
    const decs = {};

    // First pass: assemble, build refs and decs
    const tokens = source
        .replace(/\n/g, " ")
        .split(" ")
        .filter(v => !!v)
        .map(val => ({
            val: val,
            class: token_class(val)
        }));

    let token_pos = 0;
    const lookAhead = () => {
        if (token_pos === tokens.length) {
            return 'EOF';
        } else {
            return tokens[token_pos].class;
        }
    };

    const consume = (expected_class) => {
        const token = tokens[token_pos++];
        const actual_class = token.class;
        const val = token.val;
        if (expected_class && actual_class !== expected_class) {
            console.log(`Expected token ${actual_class} to be of class ${expected_class}`)
        }
        return val;
    };

    while (lookAhead() !== 'EOF') {
        switch (lookAhead()) {
            case 'text_directive':
                section = 'code';
                consume();
                break;
            case 'data_directive':
                section = 'data';
                consume();
                break;
            case 'label_declaration':
                const declaration = consume();
                decs[declaration.slice(0, declaration.length - 1)] = mem_pos[section];
                break;
            case 'int_directive':
                consume(); // Skip '.int' 
                num = parseInt(consume('number'));
                mem[mem_pos[section]++] = num & 0x00ff;
                mem[mem_pos[section]++] = num >> 8;
                break;
            case 'instruction':
                let name = consume(); // e.g. 'load_word'
                mem[mem_pos[section]++] = instructions[name] // byte val of instruction
                instruction_params(name).forEach(param_name => {
                    switch (param_name) {
                        case 'register':
                            mem[mem_pos[section]++] = registers[consume(param_name)];
                            break;
                        case 'label_reference':
                            refs.push([mem_pos[section], consume(param_name)]) // e.g. [12, 'x']
                            mem_pos[section]++ // leave gap to fill in with address later
                                break;
                    }
                })
                break;
        }
    }

    // second pass: fill in refs from decs
    refs.forEach(ref => {
        const [ target_location, name ] = ref;
        value = decs[name];
        mem[target_location] = value;
        if (!decs[name]) {
            console.log(`No label declaration for ${name}`)
        }
    })

    return mem;
}

const result = assemble(sourceCode);
const answer = [1, 1, 0x10, 1, 2, 0x12, 2, 1, 2, 3, 1, 0x0e, 4, 0, 0, 0, 2, 0, 3, 0];
console.log(result);
console.log('Result matches the answer?', answer.reduce((acc, val, i) => acc && (val === result[i])))