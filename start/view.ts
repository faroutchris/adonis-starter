import edge from 'edge.js'

edge.global('clamp', (num: number, min: number, max: number) => Math.min(Math.max(num, min), max))
