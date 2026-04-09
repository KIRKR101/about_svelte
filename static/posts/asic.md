A CPU is a generalist. It can run your browser, your music, and your taxes, switching between tasks by executing software instructions one after another. An ASIC does one thing. That's the entire point -- and it's why they're faster, cheaper to run at scale, and more power-efficient than anything general-purpose.

The trade-off is obvious: you can't reprogram one. Once the silicon is cut, the function is fixed. That's a serious commitment, which is why the decision to build an ASIC rather than use something reconfigurable is never taken lightly.

![A tray of application-specific integrated circuit (ASIC) chips](https://upload.wikimedia.org/wikipedia/commons/7/79/SSDTR-ASIC_technology.jpg)
*Figure 1: A tray of ASIC chips*

---

### How custom is "custom"?

Not all ASICs are designed the same way. There's a spectrum, and where you land on it depends on how much time, money, and performance you need.

At one extreme is full-custom design. Engineers place every transistor by hand, routing every wire themselves. The results are extraordinary -- maximum speed, minimum area -- but the cost and time involved mean it's reserved for analog circuits and components where nothing else will do.

Most digital ASICs use standard-cell design instead. Rather than building from individual transistors, engineers assemble circuits from a pre-built library of logic gates: ANDs, ORs, flip-flops. EDA (Electronic Design Automation) tools handle the physical placement and routing automatically. It's a genuine compromise in the best sense -- you get extremely complex chips without the years of manual work full-custom demands.

Gate arrays sit somewhere in between. The silicon wafer is pre-fabricated with a generic grid of unconnected logic, and customisation happens only in the final metal layers. This cuts manufacturing time and reduces non-recurring engineering costs significantly. Modern "structured ASICs" take this further by pre-defining not just raw logic but entire blocks -- processors, memory -- leaving engineers to connect the pieces rather than design them.

---

### Everything on one chip

As fabrication has improved, "one chip, one function" has given way to something more ambitious. A System-on-Chip integrates an entire system -- processor cores, memory, graphics, I/O, specialised accelerators -- onto a single piece of silicon. This is how virtually every modern ASIC is built.

The reason SoCs don't take decades to design is IP cores. Rather than building a USB controller or an Arm processor from scratch, teams license pre-verified blocks of logic and drop them in. A block comes in two forms: a soft macro, which is a flexible HDL description that can be adapted to different manufacturing processes, or a hard macro, which is a fixed physical layout optimised for one specific process. Hard macros perform predictably; soft macros travel better.

![Microscope photograph of a gate-array ASIC](https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/S-MOS_Systems_ASIC_SLA6140.jpg/1280px-S-MOS_Systems_ASIC_SLA6140.jpg)
*Figure 2: A gate-array ASIC under a microscope. This design uses less than 20% of its available logic gates*

---

### Getting from idea to silicon

The design flow for a digital ASIC runs roughly as follows.

First, engineers write the chip's behaviour in a Hardware Description Language -- Verilog or VHDL -- producing what's called an RTL model. This gets simulated exhaustively before anything else happens, because a bug found in simulation costs almost nothing. The same bug found after fabrication costs months and millions.

Once the RTL is verified, a synthesis tool compiles it into a gate-level netlist: a detailed map of standard cells and the connections between them. Place-and-route tools then take that netlist and physically arrange the cells on the silicon floor plan, routing the metal wires that connect them. At this scale -- millions of cells -- this is entirely automated.

Before the design goes to a foundry, it passes through sign-off: timing analysis, design rule checks, a battery of final verification steps. Once it clears, the layout is sent for fabrication. You then wait several months for physical silicon to arrive back.

This is the process behind Apple's custom chips, Google's Tensor Processing Units, and the networking ASICs routing traffic across the internet.

---

### ASIC or FPGA?

An FPGA is a chip you can reprogram. You can buy one this afternoon and have logic running on it by tonight, with no NRE costs and no commitment. For prototypes, research, and low-volume products, this is nearly always the right answer.

The case for an ASIC is volume and performance. An ASIC built for a specific task will always outperform an FPGA implementation of the same logic -- higher speed, higher throughput, lower power draw. The NRE costs are real (design effort plus the photolithographic masks alone runs into the millions), but those costs are fixed. Spread across ten million units, they become trivial. An FPGA's per-unit cost doesn't scale the same way.

The decision usually comes down to one question: how many are you shipping? For anything mass-market, the ASIC's economics eventually win. For anything else, the FPGA's flexibility is hard to argue with.