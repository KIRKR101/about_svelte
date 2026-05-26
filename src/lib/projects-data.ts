// Static projects data for client-side use
export const projects = [
	{
		id: 'wasmagick',
		title: 'WASMagick',
		link: 'https://wasmagick.kirkr.xyz',
		github: 'https://github.com/Kirkr101/WASMagick-svelte',
		description:
			'I built this to run ImageMagick directly in the browser using WebAssembly. There are no servers or uploads, everything happens locally and instantly. I recently improved the UI with a compare feature, refactored main thread behaviour to a web worker, and fixed awkward zoom behaviour. Next up is adding bilateral blur and Canny edge detection.',
		tech: ['Svelte 5', 'WebAssembly', 'TypeScript']
	},
	{
		id: 'voxor',
		title: 'Voxor',
		link: 'https://voxor.kirkr.xyz',
		github: 'https://github.com/Kirkr101/Voxor',
		description:
			'A self-hosted chat platform I wrote in Flask to avoid arbitrary file size limits and paywalls. I have added Slack-style message threading, typing indicators, soft-deletion, and a CMD+K quick-search modal. It also renders LaTeX on the fly.',
		tech: ['Python', 'Flask', 'JavaScript', 'Tailwind']
	},
	{
		id: 'audioshare-sv',
		title: 'Audioshare',
		link: null,
		github: 'https://github.com/Kirkr101/audioshare-sv',
		description:
			'I got tired of Next.js and rewrote this entire music streaming site in SvelteKit to speed up builds. It streams any kind of audio format, including lossless, while parsing metadata and covers automatically. I recently finished building a keyboard-navigated queue system and a cleaner media player. It exists to let me share huge, uncompressed music files without quality loss.',
		tech: ['Svelte 5', 'TypeScript', 'Drizzle', 'SQLite']
	},
	{
		id: 'dezoomify-rs-jxl',
		title: 'Dezoomify-rs-jxl',
		link: null,
		github: 'https://github.com/Kirkr101/dezoomify-rs-jxl',
		description:
			'I fork and maintain this Rust utility to download and stitch massive, zoomable images from museum archives. I added JPEG XL output with multi-threaded encoding and proper colour profile preservation, which means you get archival-grade images without filling your hard drive. This was driven by the need for better compression, fast decoding, and lossless encoding for Open Gallery (below), which downloads images that are more than a gigabyte in size.',
		tech: ['Rust']
	},
	{
		id: 'cpusim',
		title: 'CPUsim',
		link: null,
		github: 'https://github.com/Kirkr101/CPUsim',
		description:
			'I wrote this 16-bit CPU simulation in C from scratch to figure out how computers actually work at the bare metal after reading Noam Nisan\'s "The Elements of Computing Systems". It includes an assembler to compile my own custom text assembly into binaries, and a simulator to execute them. It handles the basics like arithmetic, stack operations, and function calls, and writing it was a great lesson in CPU architecture.',
		tech: ['C']
	},
	{
		id: 'rmt-debrid',
		title: 'Rmt-Debrid',
		link: null,
		github: 'https://github.com/Kirkr101/RMT-Debrid',
		description:
			'A FastAPI dashboard I built to manage torrent downloads through Real-Debrid from anywhere. It handles magnets and direct links, updating you in real time over WebSockets. It started as a quick script, but I rewrote it as a download manager so I could rely on it daily.',
		tech: ['Python', 'FastAPI', 'WebSocket']
	},
	{
		id: 'streamline',
		title: 'Streamline',
		link: null,
		github: 'https://github.com/Kirkr101/Streamline',
		description:
			'A Rust-based CLI utility I wrote to copy huge folders across my local network without the overhead of SFTP or Samba. It zips, chunks, and transfers data in parallel, then verifies integrity with SHA256 hashes.',
		tech: ['Rust']
	},
	{
		id: 'linux-keylogger',
		title: 'Linux Keylogger',
		link: null,
		github: 'https://github.com/KIRKR101/linux_keylogger',
		description:
			'A lightweight keylogger daemon I wrote in C that hooks directly into Linux input device drivers. It runs silently in the background and writes keystrokes to a log, purely as an exercise in writing low-level system services ;).',
		tech: ['C']
	},
	{
		id: 'open-gallery',
		title: 'Open Gallery',
		link: null,
		github: 'https://github.com/KIRKR101/open-gallery',
		description:
			'I scraped the National Gallery’s collection and built this Go web app to browse artworks with their full historical metadata. It includes search, filtering, and a simple admin panel.',
		tech: ['Go', 'SQLite']
	}
];
