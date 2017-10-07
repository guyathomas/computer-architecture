# ISA
PC = 0x00
LOAD = 0x01
ADD = 0x02
STORE = 0x03
HALT = 0x04

def virtual_computer(memory, registers)
  while memory[registers[PC]] != HALT do
    op = memory[registers[PC]]
    registers[PC] += 1

    case op
    when LOAD
      register_address = memory[registers[PC]]

      registers[PC] += 1

      word_address = memory[registers[PC]]

      registers[PC] += 1

      word_value = memory[word_address] + (256 * memory[word_address + 1])

      registers[register_address] = word_value

    when ADD
      register_address_a = memory[registers[PC]]

      registers[PC] += 1

      register_address_b = memory[registers[PC]]

      registers[register_address_a] = registers[register_address_a] + registers[register_address_b]

      registers[PC] += 1

    when STORE
      register_address = memory[registers[PC]]

      registers[PC] += 1

      memory[registers[PC]] = registers[register_address]
    end
  end
end

# Load the program by hand
memory = [1,1,0x10,1,2,0x12,2,1,2,3,1,0x0e,4,0,0,0,2,0,3,0] # [ 0x01, 0x01, 0x10, 0x02 ... ]

registers = [ # 2 bytes wide
  0x0000, # PC
  0x0000, # A
  0x0000  # B
]

virtual_computer(memory, registers)
p memory # check out the new memory state
