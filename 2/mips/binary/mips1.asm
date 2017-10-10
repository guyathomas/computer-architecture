# Convert ascii string of binary digits to integer
#
# $a0 - input, pointer to null-terminated string of 1's and 0's
# $v0 - output, integer form of binary string
# $t0 - ascii value of the char pointed to
# $t1 - integer value (0 or 1) of the char pointed to

.globl binary_convert

binary_convert:
        li      $v0, 0                  # Reset accumulator to 0.

loop:
        lb      $t0, 0($a0)             # Load a character,
        beq     $t0, $zero, end         # if it is null then return.
        sll     $v0, $v0, 1             # Otherwise shift accumulator left,
        addi    $t1, $t0, -48           # calculate the value of the character,
        or      $v0, $v0, $t1           # and add that to the accumulator.
        addi    $a0, $a0, 1             # Finally, increment the pointer
        j       loop                    # and loop.

end:
        jr $ra