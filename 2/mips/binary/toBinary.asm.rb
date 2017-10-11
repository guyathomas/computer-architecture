.globl binary_convert

add $v0, $zero, $zero # Initialize the return value to 0
add $t1, $zero, $zero # initialize $t1 to zero

binary_convert:

lb $t0, 0($a0) # set $t0 to byte at $a0 
beq $t0, 0x00, end 
addi $t1, $t0, -48 
sll $v0, $v0, 1
or $v0, $v0, $t1
addi $t0, $t0, 1
j binary_convert

end:
jr $ra