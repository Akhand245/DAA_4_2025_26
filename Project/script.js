class GraphVisualizer {
    constructor() {
        this.canvas = document.getElementById('graphCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.nodes = [];
        this.edges = [];
        this.draggingNode = null;
        this.mouseDownNode = null;
        this.mouseDownPosition = null;
        this.dragThreshold = 6;
        this.selectedStart = null;
        this.selectedEnd = null;
        this.pendingEdgeStart = null;
        this.currentMode = 'start';
        this.algorithm = 'dijkstra';
        this.isRunning = false;
        this.steps = 0;

        this.modeHint = document.getElementById('modeHint');
        this.edgeWeightInput = document.getElementById('edgeWeightInput');
        this.startLegendText = document.getElementById('startLegendText');
        this.endLegendText = document.getElementById('endLegendText');
        this.visitedLegendText = document.getElementById('visitedLegendText');
        this.pathLegendText = document.getElementById('pathLegendText');
        this.modeButtons = document.querySelectorAll('[data-mode]');

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.generateRandomGraph();
        this.updateLegend();
        this.updateModeUI();
        this.draw();
    }

    setupEventListeners() {
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('mouseleave', () => this.handlePointerLeave());
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());

        document.getElementById('randomGraphBtn').addEventListener('click', () => this.generateRandomGraph());
        document.getElementById('clearGraphBtn').addEventListener('click', () => this.clearGraph());
        document.getElementById('runBtn').addEventListener('click', () => this.runAlgorithm());
        document.getElementById('algorithmSelect').addEventListener('change', (e) => {
            this.algorithm = e.target.value;
        });

        this.modeButtons.forEach((button) => {
            button.addEventListener('click', () => this.setMode(button.dataset.mode));
        });
    }

    getCanvasCoordinates(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;

        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }

    findNodeAt(x, y) {
        return this.nodes.find((node) => Math.hypot(node.x - x, node.y - y) < 25);
    }

    handleMouseDown(e) {
        if (this.isRunning) {
            return;
        }

        const { x, y } = this.getCanvasCoordinates(e);
        this.mouseDownNode = this.findNodeAt(x, y);

        if (this.currentMode === 'move' && this.mouseDownNode) {
            this.mouseDownPosition = { x, y };
        } else {
            this.mouseDownPosition = null;
        }
    }

    handleMouseMove(e) {
        if (!this.mouseDownNode || this.currentMode !== 'move' || !this.mouseDownPosition) {
            return;
        }

        const { x, y } = this.getCanvasCoordinates(e);
        const movedEnough =
            Math.hypot(x - this.mouseDownPosition.x, y - this.mouseDownPosition.y) > this.dragThreshold;

        if (movedEnough) {
            this.draggingNode = this.mouseDownNode;
        }

        if (this.draggingNode) {
            this.draggingNode.x = x;
            this.draggingNode.y = y;
            this.draw();
        }
    }

    handleMouseUp(e) {
        if (this.isRunning) {
            return;
        }

        const { x, y } = this.getCanvasCoordinates(e);
        const clickedNode = this.findNodeAt(x, y);

        if (this.draggingNode) {
            this.draggingNode = null;
            this.mouseDownNode = null;
            this.mouseDownPosition = null;
            return;
        }

        if (this.currentMode === 'add-node' && !clickedNode) {
            this.addNode(x, y);
        } else if (clickedNode) {
            if (this.currentMode === 'start') {
                this.setStartNode(clickedNode);
            } else if (this.currentMode === 'end') {
                this.setEndNode(clickedNode);
            } else if (this.currentMode === 'add-edge') {
                this.handleEdgeSelection(clickedNode);
            }
        }

        this.mouseDownNode = null;
        this.mouseDownPosition = null;
        this.updateLegend();
        this.updateModeUI();
        this.draw();
    }

    handlePointerLeave() {
        this.draggingNode = null;
        this.mouseDownNode = null;
        this.mouseDownPosition = null;
    }

    setMode(mode) {
        this.currentMode = mode;
        if (mode !== 'add-edge') {
            this.pendingEdgeStart = null;
        }
        this.updateModeUI();
        this.draw();
    }

    updateModeUI() {
        this.modeButtons.forEach((button) => {
            button.classList.toggle('active', button.dataset.mode === this.currentMode);
            button.classList.toggle('active-tool', button.dataset.mode === this.currentMode);
        });

        let message = 'Click a node to choose the start point.';
        if (this.currentMode === 'end') {
            message = 'Click a node to choose the end point.';
        } else if (this.currentMode === 'move') {
            message = 'Drag any node to reposition your graph.';
        } else if (this.currentMode === 'add-node') {
            message = 'Click on any empty space in the canvas to add a new node.';
        } else if (this.currentMode === 'add-edge') {
            message = this.pendingEdgeStart
                ? `Choose the second node for ${this.pendingEdgeStart.label}.`
                : 'Click two nodes to connect them using the selected distance.';
        }

        this.modeHint.textContent = message;
    }

    generateRandomGraph() {
        this.nodes = [];
        this.edges = [];
        this.selectedStart = null;
        this.selectedEnd = null;
        this.pendingEdgeStart = null;
        this.resetStats();

        const nodeCount = 6 + Math.floor(Math.random() * 5);
        for (let i = 0; i < nodeCount; i++) {
            this.nodes.push(this.createNode(
                100 + Math.random() * 600,
                100 + Math.random() * 300,
                i
            ));
        }

        for (let i = 0; i < this.nodes.length; i++) {
            for (let j = i + 1; j < this.nodes.length; j++) {
                if (Math.random() < 0.4) {
                    this.edges.push({
                        from: this.nodes[i],
                        to: this.nodes[j],
                        weight: 1 + Math.floor(Math.random() * 9),
                        type: 'normal'
                    });
                }
            }
        }

        this.updateLegend();
        this.updateModeUI();
        this.draw();
    }

    clearGraph() {
        this.nodes = [];
        this.edges = [];
        this.selectedStart = null;
        this.selectedEnd = null;
        this.pendingEdgeStart = null;
        this.resetStats();
        this.updateLegend();
        this.updateModeUI();
        this.draw();
    }

    createNode(x, y, id = this.nodes.length) {
        return {
            id,
            x,
            y,
            label: this.getNodeLabel(id),
            dist: Infinity,
            prev: null,
            visited: false,
            type: 'normal'
        };
    }

    addNode(x, y) {
        const node = this.createNode(x, y, this.nodes.length);
        this.nodes.push(node);
        this.resetVisualization();
    }

    getNodeLabel(index) {
        let label = '';
        let value = index;

        do {
            label = String.fromCharCode(65 + (value % 26)) + label;
            value = Math.floor(value / 26) - 1;
        } while (value >= 0);

        return label;
    }

    setStartNode(node) {
        this.selectedStart = node;
        if (this.selectedEnd === node) {
            this.selectedEnd = null;
        }
        this.resetVisualization();
    }

    setEndNode(node) {
        this.selectedEnd = node;
        if (this.selectedStart === node) {
            this.selectedStart = null;
        }
        this.resetVisualization();
    }

    handleEdgeSelection(node) {
        if (!this.pendingEdgeStart) {
            this.pendingEdgeStart = node;
            this.updateModeUI();
            return;
        }

        if (this.pendingEdgeStart === node) {
            this.pendingEdgeStart = null;
            this.updateModeUI();
            return;
        }

        const weight = Number(this.edgeWeightInput.value);
        if (!Number.isFinite(weight) || weight <= 0) {
            alert('Please enter a valid positive distance.');
            return;
        }

        this.addOrUpdateEdge(this.pendingEdgeStart, node, weight);
        this.pendingEdgeStart = null;
        this.resetVisualization();
        this.updateModeUI();
    }

    addOrUpdateEdge(from, to, weight) {
        const existingEdge = this.edges.find((edge) =>
            (edge.from === from && edge.to === to) || (edge.from === to && edge.to === from)
        );

        if (existingEdge) {
            existingEdge.weight = weight;
            existingEdge.type = 'normal';
            return;
        }

        this.edges.push({
            from,
            to,
            weight,
            type: 'normal'
        });
    }

    resetStats() {
        this.steps = 0;
        document.getElementById('distance').textContent = 'Distance: --';
        document.getElementById('steps').textContent = 'Steps: 0';
        document.getElementById('time').textContent = 'Time: 0ms';
    }

    resetVisualization() {
        this.nodes.forEach((node) => {
            node.dist = Infinity;
            node.prev = null;
            node.visited = false;
            node.type = 'normal';
        });

        this.edges.forEach((edge) => {
            edge.type = 'normal';
        });

        this.resetStats();
        this.updateLegend();
    }

    updateLegend() {
        const visitedCount = this.nodes.filter((node) => node.visited).length;
        const pathCount = this.getPathNodeCount();

        this.startLegendText.textContent = `Start: ${this.selectedStart ? this.selectedStart.label : 'Not selected'}`;
        this.endLegendText.textContent = `End: ${this.selectedEnd ? this.selectedEnd.label : 'Not selected'}`;
        this.visitedLegendText.textContent = `Visited: ${visitedCount}`;
        this.pathLegendText.textContent = `Shortest Path: ${pathCount} node${pathCount === 1 ? '' : 's'}`;
    }

    getPathNodeCount() {
        if (!this.selectedStart || !this.selectedEnd || this.selectedEnd.dist === Infinity) {
            return 0;
        }

        let count = 1;
        let current = this.selectedEnd;

        while (current.prev) {
            count += 1;
            current = current.prev;
        }

        return count;
    }

    async runAlgorithm() {
        if (this.isRunning) {
            return;
        }

        if (!this.selectedStart || !this.selectedEnd) {
            alert('Select both start and end nodes using the buttons under the graph.');
            return;
        }

        if (this.nodes.length === 0 || this.edges.length === 0) {
            alert('Create a graph first by adding nodes and edges.');
            return;
        }

        this.isRunning = true;
        this.pendingEdgeStart = null;
        this.resetVisualization();
        document.getElementById('runBtn').disabled = true;

        const startTime = performance.now();
        this.selectedStart.dist = 0;

        if (this.algorithm === 'dijkstra') {
            await this.dijkstra();
        } else {
            await this.bellmanFord();
        }

        const endTime = performance.now();
        this.highlightPath();

        document.getElementById('distance').textContent =
            `Distance: ${this.selectedEnd.dist === Infinity ? '∞' : this.selectedEnd.dist}`;
        document.getElementById('steps').textContent = `Steps: ${this.steps}`;
        document.getElementById('time').textContent = `Time: ${Math.round(endTime - startTime)}ms`;

        this.updateLegend();
        this.draw();
        this.isRunning = false;
        document.getElementById('runBtn').disabled = false;
    }

    highlightPath() {
        if (this.selectedEnd.dist === Infinity) {
            return;
        }

        let current = this.selectedEnd;
        current.type = 'path';

        while (current.prev !== null) {
            const previous = current.prev;
            previous.type = previous === this.selectedStart ? 'normal' : 'path';
            const edge = this.edges.find((item) =>
                (item.from === current && item.to === previous) ||
                (item.from === previous && item.to === current)
            );

            if (edge) {
                edge.type = 'path';
            }

            current = previous;
        }
    }

    getNeighbors(node) {
        return this.edges
            .filter((edge) => edge.from === node || edge.to === node)
            .map((edge) => ({
                node: edge.from === node ? edge.to : edge.from,
                weight: edge.weight
            }));
    }

    async dijkstra() {
        const queue = [...this.nodes];

        while (queue.length > 0) {
            queue.sort((a, b) => a.dist - b.dist);
            const current = queue.shift();

            if (!current || current.dist === Infinity) {
                break;
            }

            if (current.visited) {
                continue;
            }

            current.visited = true;
            if (current !== this.selectedStart && current !== this.selectedEnd) {
                current.type = 'visited';
            }

            this.steps += 1;
            this.updateLegend();
            this.draw();
            await this.sleep(250);

            if (current === this.selectedEnd) {
                break;
            }

            for (const neighbor of this.getNeighbors(current)) {
                if (current.dist + neighbor.weight < neighbor.node.dist) {
                    neighbor.node.dist = current.dist + neighbor.weight;
                    neighbor.node.prev = current;
                }
            }
        }
    }

    async bellmanFord() {
        const totalNodes = this.nodes.length;

        for (let i = 0; i < totalNodes - 1; i++) {
            let updated = false;

            for (const edge of this.edges) {
                if (edge.from.dist !== Infinity && edge.from.dist + edge.weight < edge.to.dist) {
                    edge.to.dist = edge.from.dist + edge.weight;
                    edge.to.prev = edge.from;
                    updated = true;
                }

                if (edge.to.dist !== Infinity && edge.to.dist + edge.weight < edge.from.dist) {
                    edge.from.dist = edge.to.dist + edge.weight;
                    edge.from.prev = edge.to;
                    updated = true;
                }
            }

            this.nodes.forEach((node) => {
                if (node.dist !== Infinity) {
                    node.visited = true;
                    if (node !== this.selectedStart && node !== this.selectedEnd && node.type !== 'path') {
                        node.type = 'visited';
                    }
                }
            });

            this.steps += 1;
            this.updateLegend();
            this.draw();
            await this.sleep(220);

            if (!updated) {
                break;
            }
        }
    }

    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#f8f9ff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        for (const edge of this.edges) {
            const isPathEdge = edge.type === 'path';
            this.ctx.strokeStyle = isPathEdge ? '#56ab2f' : '#d4dae5';
            this.ctx.lineWidth = isPathEdge ? 4 : 2;
            this.ctx.beginPath();
            this.ctx.moveTo(edge.from.x, edge.from.y);
            this.ctx.lineTo(edge.to.x, edge.to.y);
            this.ctx.stroke();

            const midX = (edge.from.x + edge.to.x) / 2;
            const midY = (edge.from.y + edge.to.y) / 2;
            this.ctx.fillStyle = 'white';
            this.ctx.beginPath();
            this.ctx.arc(midX, midY, 15, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.strokeStyle = '#cfd6e4';
            this.ctx.lineWidth = 1.5;
            this.ctx.stroke();

            this.ctx.fillStyle = '#444';
            this.ctx.font = 'bold 13px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(edge.weight, midX, midY);
        }

        if (this.pendingEdgeStart) {
            this.ctx.strokeStyle = '#667eea';
            this.ctx.lineWidth = 3;
            this.ctx.setLineDash([8, 6]);
            this.ctx.beginPath();
            this.ctx.arc(this.pendingEdgeStart.x, this.pendingEdgeStart.y, 34, 0, Math.PI * 2);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
        }

        for (const node of this.nodes) {
            let color = '#667eea';
            if (node === this.selectedStart) {
                color = '#ff6b6b';
            } else if (node === this.selectedEnd) {
                color = '#4ecdc4';
            } else if (node.type === 'path') {
                color = '#56ab2f';
            } else if (node.type === 'visited') {
                color = '#ffe66d';
            }

            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, 25, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 3;
            this.ctx.stroke();

            this.ctx.fillStyle = 'white';
            this.ctx.font = 'bold 18px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(node.label, node.x, node.y);

            if (node.dist !== Infinity) {
                this.ctx.fillStyle = '#333';
                this.ctx.font = '12px Arial';
                this.ctx.fillText(node.dist.toString(), node.x, node.y + 38);
            }
        }

        this.ctx.fillStyle = 'rgba(21, 32, 67, 0.82)';
        this.ctx.fillRect(12, 12, 365, 68);
        this.ctx.fillStyle = 'white';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('Use the buttons below: Start, End, Add Node, Add Edge', 26, 34);
        this.ctx.fillText('Tip: choose Add Edge, then click 2 nodes to set distance', 26, 57);
    }
}

function scrollToVisualizer() {
    document.getElementById('visualizer').scrollIntoView({ behavior: 'smooth' });
}

window.addEventListener('load', () => {
    new GraphVisualizer();
});
