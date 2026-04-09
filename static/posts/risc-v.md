Proprietary instruction set architectures (ISAs) like x86 and Arm have held processor design in a chokehold for decades. These architectures impose heavy licencing fees and rigid restrictions that prevent hardware customisation. RISC-V is the open alternative: a royalty-free ISA that permits anyone to build custom processors without asking for permission or paying a tax. I see this as the democratisation of hardware. Recent developments in China, including Beijing’s [hedge on RISC-V](https://www.tomshardware.com/pc-components/cpus/chinese-government-shifts-focus-from-x86-and-arm-cpus-promoting-the-adoption-of-risc-v-chips) and [new chips](https://www.tomshardware.com/pc-components/cpus/chinas-push-for-chip-independence-continues-with-its-first-risc-v-server-cpu) that rival Western designs in performance, suggest that the architecture has moved from an academic experiment to a geopolitical necessity.

## Origins and Principles

RISC-V began at the University of California, Berkeley, in 2010. Krste Asanović and David Patterson intended to create a clean-slate ISA for research and education. I initially assumed the name was pronounced "risk-vee," but it is "risk-five," denoting the fifth major Reduced Instruction Set Computer design from the Berkeley lineage. This history is documented in Patterson's paper, [“The Case for RISC”](https://courses.cs.washington.edu/courses/cse548/08wi/papers/Case_for_RISC.pdf).

The project is built on three core tenets. First, it is open and free under a permissive BSD-style licence. Second, the design is simple. It avoids the architectural baggage accumulated by x86 over 40 years, which makes the hardware easier to implement and verify. Third, it is stable. Once the base ISA and extensions are ratified, they are frozen. New functionality is added only through optional extensions, ensuring long-term software compatibility. The non-profit RISC-V International governs the standard to prevent the fragmentation that eventually killed Unix.

## The Base ISA

The RISC-V design philosophy is modular. A small, mandatory base ISA provides core functionality, while optional extensions add features like floating-point math or vector processing. The foundation is the base integer ISA, primarily **RV32I** (32-bit) or **RV64I** (64-bit). An **RV32E** variant with 16 registers exists for extremely constrained embedded systems.

The base ISA contains fewer than 50 instructions — just enough to support a complete software toolchain. It uses a load-store architecture where memory access is handled by explicit load (`lw`, `ld`) and store (`sw`, `sd`) instructions. Computational instructions like `add` or `and` operate only on registers. I think the hardwired zero register (`x0`) is an elegant design choice. It allows the instruction set to remain small by turning a `move` instruction into a pseudo-instruction for adding zero to a register.

Consider how a simple array sum compiles to RV32I. The arguments arrive in registers `a0` and `a1` per the standard calling convention:

```mipsasm
# a0: pointer to array
# a1: size of array
sum_array:
    li   t0, 0         # t0 = i = 0
    li   t1, 0         # t1 = sum = 0
loop:
    bge  t0, a1, end   # if (i >= size), branch to end
    slli t2, t0, 2     # t2 = i * 4 (calculate byte offset)
    add  t2, a0, t2    # t2 = base address + offset
    lw   t3, 0(t2)     # t3 = load value from memory (array[i])
    add  t1, t1, t3    # sum = sum + array[i]
    addi t0, t0, 1     # i++
    j    loop
end:
    mv   a0, t1        # set return value to sum
    ret                # return
```

The logic is predictable because the instruction encoding is regular. Fields for source and destination registers are always in the same place. This simplifies the instruction decode stage in a processor pipeline and reduces the power required for logic switching.

## Standard Extensions

Modularity is the primary strength of RISC-V. Designers only implement the extensions their application requires, which reduces silicon area and power consumption.

- **M (Multiplication and Division)**: Adds instructions for integer math like `mul` and `rem`.
- **A (Atomic)**: Provides operations for multithreading synchronisation, such as mutexes and semaphores.
- **F & D (Floating-Point)**: Defines separate registers for single- and double-precision math compliant with [IEEE 754-2008](https://en.wikipedia.org/wiki/IEEE_754-2008_revision).
- **C (Compressed)**: Defines 16-bit encodings for the most common 32-bit instructions. This reduces code size by 30%, which is vital for embedded systems.
- **V (Vector)**: Adds SIMD capabilities. I find the vector extension impressive because it is VLEN-agnostic. A binary compiled for a 128-bit vector unit will run on a 512-bit unit without modification.

A typical Linux-capable processor uses the **RV64G** profile, where "G" is shorthand for the **IMAFD** extensions. To run an operating system, the hardware must also implement the **Supervisor (S) mode** from the Privileged Specification, which enables virtual memory and page tables.

## Ecosystem and Adoption

An ISA is only as good as its software ecosystem. RISC-V has reached critical mass in just over a decade. Support is now mainline in both **GCC** and **LLVM/Clang**. Linux support is robust, with active ports for all major distributions. Support also exists for FreeBSD and real-time operating systems like FreeRTOS or Zephyr.

In the embedded and IoT space, RISC-V is already dominant. Companies like Espressif have shipped hundreds of millions of RISC-V microcontrollers. Western Digital is transitioning its entire storage controller business to RISC-V. NVIDIA uses RISC-V cores as internal management processors within its GPUs.

High-performance computing is the next frontier. The European Processor Initiative is using RISC-V for exascale supercomputer accelerators. While x86 still dominates the desktop, the rise of affordable Linux-capable boards like the VisionFive 2 means the gap is closing.

## Security and Transparency

The security community generally agrees that "security through obscurity" is a failure. The open nature of RISC-V allows for public scrutiny of the ISA and its implementations. Researchers can formally verify designs and look for architectural vulnerabilities without reverse-engineering a proprietary black box. This follows [Kerckhoffs's principle](https://en.wikipedia.org/wiki/Kerckhoffs%27s_principle): a system should be secure even if everything about it is public.

Vulnerabilities like Spectre and Meltdown were implementation flaws in specific microarchitectures, not flaws in an ISA definition. Any processor can have these bugs, but the RISC-V community is developing standardised security features to mitigate them. **Physical Memory Protection (PMP)** enforces access permissions between privilege levels. The **Zk** extension family provides constant-time instructions for cryptographic algorithms to prevent side-channel attacks. The ability to audit the design from the high-level spec down to the hardware description logic gives implementers control over their security posture that proprietary ISAs cannot match.