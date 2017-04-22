export class NFANode {
    /** Start State */
    isStartState: boolean;
    /** Accept State */
    isAcceptState: boolean;
    children: NFAEdge[];
    label: string;

    private get image(): string {
        if (this.isStartState && this.isAcceptState) {
            return "start_accept_state.svg";
        }
        if (this.isAcceptState) {
            return "accept_state.svg";
        }
        if (this.isStartState) {
            return "start_state.svg";
        }
        return "";
    }

    private get origin(): {x: number, y: number} {
        return {
            x: this.isStartState ? 10 : 0,
            y: 0
        }
    }

    private get shape(): string {
        if (this.isStartState || this.isAcceptState) {
            return "image";
        }
        return "circle";
    }
}

export class NFAEdge {
    symbol: string;
    destination: NFANode;

    private get label() {
        if (this.symbol.length > 0) {
            return this.symbol;
        } else {
            return "λ";
        }
    }
}

export class NFAGraph {
    nodes: NFANode[];
    // startState: NFANode;
}

export type Nodes = NFANode;
export type Edges = NFAEdge;
export type Graph = NFAGraph;

export class State {
    constructor(public active: NFANode[],
        public inputLeft: string) {

    }
}

function isEmpty(label?: string) {
    if (label !== undefined) {
        if (label !== "") {
            return false;
        }
    }

    return true;
}

export function start(input: NFAGraph, data: string): State | boolean {
    let starts = new Set<NFANode>();
    const accepts = new Set<NFANode>();

    for (const node of input.nodes) {
        if (node.isStartState) {
            starts.add(node);
        }

        if (node.isAcceptState) {
            accepts.add(node);
        }

        if (node.children) {
            let transitions = new Set<string>();
            for (const edge of node.children) {
                if (edge.symbol.length > 1) {
                    throw new Error(`Edge ${edge.symbol} must be one symbol`);
                }
                transitions.add(edge.symbol);
            }
        }
    }

    if (starts.size === 0) {
        throw new Error("Must have at least one start state");
    }
    if (accepts.size === 0) {
        throw new Error("Must have at least one accept state");
    }

    const initialActive = new Set<NFANode>();
    for (const state of starts) {
        visitNode(state, initialActive);
    }
    console.log("initialActive", initialActive);

    return new State([...initialActive], data);
}


function visitNode(node: NFANode, destinations: Set<NFANode>) {
    destinations.add(node);
    for (const edge of node.children) {
        if (edge.symbol === "") {
            if (!destinations.has(edge.destination)) {
                visitNode(edge.destination, destinations);
            }
        }
    }
}

export function step(current: State): State | boolean {
    if (current.inputLeft.length === 0) {
        return current.active.reduce((a, b) => b.isAcceptState === true || a, false);
    }
    const destinations = new Set<NFANode>();
    for (const activeNode of current.active) {
        for (const edge of activeNode.children) {
            if (edge.symbol === current.inputLeft[0]) {
                visitNode(edge.destination, destinations);
            }
        }
    }

    if (destinations.size === 0) {
        return false;
    } else {
        return new State([...destinations], current.inputLeft.substr(1));
    }
}