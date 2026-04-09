The earliest computers were installations rather than devices. They occupied entire rooms with racks of electronics, thick wiring bundles, and panels of status lights. Operating them required teams of specialists to manage power and cooling. Programming often meant physically rewiring sections of the machine by hand. To change a program was to change the wiring, a process that frequently took days.

Computing is now scattered through the environment. Laptops and phones are merely the surface. Autonomous vehicles process sensor data in real time via embedded controllers, while robotics systems fold perception and motion planning directly into their silicon. Network routers push enormous volumes of traffic through the internet using specialised packet-processing logic. A PlayStation contains hardware more powerful than the supercomputers of the 1990s.

## The Hierarchy of Abstractions

Modern computer architecture is a hierarchy of abstractions. Each layer hides the mechanics of everything below it. At the base, electrons move through semiconductors. These form transistors and circuits described by register-transfer level (RTL) representations. Above these, microarchitectures implement an instruction set architecture (ISA). Higher layers include operating systems and virtual machines that manage hardware resources and present controlled environments to programs.

The practical result is a total separation of concerns. A programmer writing a sorting algorithm in a high-level language never considers transistor switching. Circuit designers do not worry about how an operating system schedules threads. Abstraction allows the system to scale in complexity without any one person having to hold the entire map in their head. 

The definition of computer architecture has expanded. In the 1950s, architects focused on the layers between circuits and operating systems: execution logic and memory organisation. By the 1990s, power consumption and manufacturing costs became central concerns as transistor counts climbed into the millions. Today, parallel architectures, hardware accelerators, and security mechanisms are the primary focus. The boundaries between hardware design and systems software have been obscured.

## Physical Substrates and Logic

Technology moves fast, but software patterns persist. New transistor designs and fabrication processes change what is physically buildable within a few years. Integrated circuits replaced vacuum tubes; VLSI pushed transistor counts into the billions. Each shift enables architectures that were previously impossible.

Software influences hardware through a feedback loop. As programmers build complex systems, specific inefficiencies become obvious. Accumulated knowledge of how programs behave at runtime informs hardware design. Architects optimise for the workloads that dominate real use, such as matrix multiplication for machine learning. Instruction sets change to match common programming idioms, and compilers become more efficient at translating high-level abstractions into machine code. You cannot design hardware well without understanding the software it will host.

## Constraints and Trade-offs

Performance is the most visible metric, but it is rarely the only one. Manufacturing cost dictates what reaches the market. A chip that performs brilliantly but costs too much to fabricate remains a laboratory curiosity. Power consumption is a hard limit for mobile devices and data centres where heat dissipation and electricity costs are direct expenses. Reliability is the final constraint: systems must function despite component failures or transient errors.

Architectural design is a balancing act. A supercomputer prioritises raw throughput. A smartphone must stay cool in a pocket while running on a battery. This is why a mobile chip and a data centre CPU look nothing alike, even though both execute the same software.

## Mechanical Origins

Nineteenth-century computing was purely mechanical. Charles Babbage designed the Difference Engine to compute polynomial tables and the Analytical Engine as a programmable, general-purpose machine. It featured a "mill" for processing and a "store" for memory. Ada Lovelace worked with Babbage and wrote the first algorithm for machine execution -- a method for computing Bernoulli numbers. She provided a clear analysis of the machine's limits, realising it could only do what it was ordered to perform.

By 1890, Herman Hollerith's electromechanical tabulating machines used punched cards to process the US census. This reduced a task that would have taken a decade to less than a year. Hollerith later founded the company that became IBM. In 1941, Konrad Zuse built the Z3 in Germany, the first programmable, automatic digital computer. In Britain, the Colossus machines at Bletchley Park used electronics to break German cipher traffic. These were fast but fixed to specific tasks.

## ENIAC and the Stored-Program Shift

The Electronic Numerical Integrator and Computer (ENIAC) was the most significant machine of the 1940s. It weighed 30 tons and used 18,000 vacuum tubes to calculate ballistics tables for the US Army. It could do in hours what took human calculators weeks.

ENIAC had a fundamental flaw: it lacked a stored program. Programming it meant configuring external patch cables. Changing a computation took two days of rewiring. The machine was fast at arithmetic but glacially slow to reprogram. This made it useful for repetitive ballistics calculations but poorly suited for general research.

John von Neumann articulated the solution. Building on thinking by J. Presper Eckert and John Mauchly, he described the stored-program computer. The idea is to store instructions in memory alongside data, using the same format. You load a new program into memory instead of rewiring the machine. I find the "von Neumann architecture" label unfortunate; it is a misnomer that obscures the engineering contributions of the ENIAC team. 

By 1948, the Manchester Small-Scale Experimental Machine ran the world's first stored program -- a factorisation calculation that took 52 minutes. EDSAC followed in 1949. UNIVAC I became the first commercial computer sold in the United States in 1951, later used to predict a presidential election on television.

## Reliability and Early Instruction Sets

Vacuum tubes generated heat and failed constantly. Operators found dead tubes in ENIAC by smell or by looking for those that had gone dark. Early memory was equally fragile. Mercury delay lines and Williams tubes were temperature-sensitive and required frequent calibration. The mean time between failures for the Whirlwind computer at MIT was only 20 minutes. Early computing history is a story of engineers coaxing machines to stay alive long enough to finish a calculation.

Instruction sets were minimal. Most machines had fewer than 20 instructions: load, store, add, and jump. These architectures used an accumulator model where one register held the operand for arithmetic. This kept hardware simple because registers were expensive to implement.

Iterating through an array required programmers to write code that modified its own instructions. The program would update the address field of its next load instruction after each loop iteration. This self-modifying code was inefficient and difficult to debug. Tom Kilburn solved this in the 1950s with the index register. Programs could keep a base address in the instruction and add the register's value automatically. The code doing the work was no longer tangled with the code managing addresses.

Modern processors have moved to general-purpose registers. Addressing modes now handle complex data structures like linked lists or trees automatically. In the 1950s, the programmer's mental model matched the physical hardware. Today, that connection is severed. 

Layers of virtual memory and high-level languages ensure that programmers rarely consider the physical state of the silicon.