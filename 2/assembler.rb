require 'set'

str = <<-STR
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
STR
#
# assembles to:
#
# memory
# 01 01 10 01 02 12 02 01 02 03 01 0e 04 00 00 00 02 00 03 00

def assemble(source)
  instructions = {
    'load_word' => 0x01,
    'add' => 0x02,
    'store_word' => 0x03,
    'halt' => 0x04
  }

  instruction_params = ->(name) do
    case name
    when 'load_word', 'store_word'
      [ 'register', 'label_reference' ]
    when 'add'
      [ 'register', 'register' ]
    when 'halt'
      []
    end
  end

  registers = { 'reg_a' => 0x01, 'reg_b' => 0x02 }

  directives = Set.new(['.text', '.data', '.int'])

  token_class = ->(val) do
    if directives.include?(val)
      val[1..-1] + '_directive'
    elsif instructions.keys.include?(val)
      'instruction'
    elsif val =~ /reg_/
      'register'
    elsif val[-1] == ':'
      'label_declaration'
    elsif !!(val =~ /\A[-+]?[0-9]+\z/)
      'number'
    else
      'label_reference'
    end
  end

  mem = Array.new(20, 0)
  code_start = 0
  data_start = 0x0e
  mem_pos = {
    'code' => code_start,
    'data' => data_start
  }

  section = 'code'
  refs = Array.new
  decs = Hash.new

  # first pass, assemble

  tokens = source.split(/\n/).join(' ').split(' ').map do |token|
    {
      class: token_class.call(token),
      value: token
    }
  end

  token_pos = 0

  lookahead = -> do
    if token_pos == tokens.length
      'EOF'
    else
      tokens[token_pos][:class]
    end
  end

  consume = ->(expected_class = nil) do
    actual_class = tokens[token_pos][:class]
    value = tokens[token_pos][:value]
    token_pos += 1

    if expected_class && actual_class != expected_class
      raise "expected token #{value} to be of class #{expected_class} but was #{actual_class}"
    end

    return value
  end

  while lookahead.call != 'EOF'
    case lookahead.call
    when 'text_directive'
      section = 'code'
      consume.call

    when 'data_directive'
      section = 'data'
      consume.call

    when 'label_declaration'
      decs[consume.call[0..-2]] = mem_pos[section] # e.g. 'x' => 42

    when 'int_directive'
      consume.call # skip '.int'
      num = consume.call('number').to_i
      little_end = num % 256
      big_end = num / 256
      mem[mem_pos[section]] = little_end
      mem_pos[section] += 1
      mem[mem_pos[section]] = big_end
      mem_pos[section] += 1

    when 'instruction'
      name = consume.call # e.g. 'load_word'
      mem[mem_pos[section]] = instructions[name] # byte val of instruction
      mem_pos[section] += 1

      instruction_params.call(name).each do |param_name| # e.g. ['reg', 'label']
        case param_name
        when 'register'
          reg_val = registers[consume.call(param_name)]
          mem[mem_pos[section]] = reg_val
          mem_pos[section] += 1

        when 'label_reference'
          refs << [mem_pos[section], consume.call(param_name)] # e.g. [12, 'x']
          mem_pos[section] += 1 # leave gap to fill in with address later
        end
      end
    end
  end

  # second pass: fill in refs from decs
  refs.each do |target_location, name|
    value = decs[name]
    raise "no label declaration for #{name}" unless value
    mem[target_location] = value
  end

  return mem
end

memory = assemble(str)
p memory
p memory == [1,1,0x10,1,2,0x12,2,1,2,3,1,0x0e,4,0,0,0,2,0,3,0]
