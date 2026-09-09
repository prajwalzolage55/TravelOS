// ============================================
// TravelOS — Core Trip Graph Engine
// ============================================
// Uses graphology for in-memory graph operations
// This is the heart of the system — one graph, three applications

import {
  Trip,
  TripNode,
  TripEdge,
  Disruption,
  ImpactedNode,
  RecoveryOption,
  RecoveryChange,
  SlackWindow,
} from '@/lib/utils/types';

// ---------- Graph Construction ----------

export class TripGraph {
  private nodes: Map<string, TripNode>;
  private edges: Map<string, TripEdge>;
  private adjacencyList: Map<string, string[]>; // nodeId -> [edgeIds]
  private reverseAdjacency: Map<string, string[]>; // nodeId -> [incoming edgeIds]

  constructor(trip?: Trip) {
    this.nodes = new Map();
    this.edges = new Map();
    this.adjacencyList = new Map();
    this.reverseAdjacency = new Map();

    if (trip) {
      this.buildFromTrip(trip);
    }
  }

  buildFromTrip(trip: Trip): void {
    // Add all nodes
    trip.nodes.forEach((node) => {
      this.addNode(node);
    });

    // Add all edges
    trip.edges.forEach((edge) => {
      this.addEdge(edge);
    });
  }

  addNode(node: TripNode): void {
    this.nodes.set(node.id, { ...node });
    if (!this.adjacencyList.has(node.id)) {
      this.adjacencyList.set(node.id, []);
    }
    if (!this.reverseAdjacency.has(node.id)) {
      this.reverseAdjacency.set(node.id, []);
    }
  }

  addEdge(edge: TripEdge): void {
    this.edges.set(edge.id, { ...edge });
    const outgoing = this.adjacencyList.get(edge.source) || [];
    outgoing.push(edge.id);
    this.adjacencyList.set(edge.source, outgoing);

    const incoming = this.reverseAdjacency.get(edge.target) || [];
    incoming.push(edge.id);
    this.reverseAdjacency.set(edge.target, incoming);
  }

  getNode(nodeId: string): TripNode | undefined {
    return this.nodes.get(nodeId);
  }

  getEdge(edgeId: string): TripEdge | undefined {
    return this.edges.get(edgeId);
  }

  getAllNodes(): TripNode[] {
    return Array.from(this.nodes.values());
  }

  getAllEdges(): TripEdge[] {
    return Array.from(this.edges.values());
  }

  getOutgoingEdges(nodeId: string): TripEdge[] {
    const edgeIds = this.adjacencyList.get(nodeId) || [];
    return edgeIds.map((id) => this.edges.get(id)!).filter(Boolean);
  }

  getIncomingEdges(nodeId: string): TripEdge[] {
    const edgeIds = this.reverseAdjacency.get(nodeId) || [];
    return edgeIds.map((id) => this.edges.get(id)!).filter(Boolean);
  }

  getDownstreamNodes(nodeId: string): TripNode[] {
    const downstream: TripNode[] = [];
    const visited = new Set<string>();
    const queue = [nodeId];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;
      visited.add(current);

      const outgoing = this.getOutgoingEdges(current);
      for (const edge of outgoing) {
        const targetNode = this.nodes.get(edge.target);
        if (targetNode && !visited.has(edge.target)) {
          downstream.push(targetNode);
          queue.push(edge.target);
        }
      }
    }

    return downstream;
  }

  // ---------- Disruption Impact Propagation ----------

  propagateDisruption(disruption: Disruption): ImpactedNode[] {
    const impacted: ImpactedNode[] = [];
    const visited = new Set<string>();
    const queue: Array<{
      nodeId: string;
      delayMinutes: number;
      depth: number;
      parentCostImpact: number;
    }> = [];

    // Start from the disrupted node
    const disruptedNode = this.nodes.get(disruption.nodeId);
    if (!disruptedNode) return impacted;

    // Mark the disrupted node
    const delayMins = disruption.type === 'cancellation' ? 9999 : (disruption.delayMinutes || 0);

    impacted.push({
      nodeId: disruption.nodeId,
      node: disruptedNode,
      impactType: disruption.type === 'cancellation' ? 'cancelled' : 'delayed',
      delayMinutes: delayMins,
      costImpact: disruption.type === 'cancellation' ? -disruptedNode.cost : 0,
      propagationDepth: 0,
      explanation:
        disruption.type === 'cancellation'
          ? `${disruptedNode.title} has been cancelled.`
          : `${disruptedNode.title} is delayed by ${disruption.delayMinutes} minutes.`,
    });

    visited.add(disruption.nodeId);

    // Add downstream nodes to queue
    const outgoing = this.getOutgoingEdges(disruption.nodeId);
    for (const edge of outgoing) {
      queue.push({
        nodeId: edge.target,
        delayMinutes: Math.round(delayMins * edge.riskPropagation),
        depth: 1,
        parentCostImpact: 0,
      });
    }

    // BFS propagation
    while (queue.length > 0) {
      const { nodeId, delayMinutes: propagatedDelay, depth, parentCostImpact } = queue.shift()!;
      if (visited.has(nodeId)) continue;
      visited.add(nodeId);

      const node = this.nodes.get(nodeId);
      if (!node) continue;

      // Check incoming edge buffer
      const incomingEdges = this.getIncomingEdges(nodeId);
      const relevantEdge = incomingEdges.find((e) => visited.has(e.source));
      const buffer = relevantEdge?.timeBufferMinutes || 0;
      const effectiveDelay = Math.max(0, propagatedDelay - buffer);

      if (effectiveDelay === 0 && disruption.type !== 'cancellation') continue;

      // Determine impact type
      let impactType: ImpactedNode['impactType'];
      if (disruption.type === 'cancellation' && relevantEdge?.dependencyType === 'hard') {
        impactType = 'needs-rebooking';
      } else if (effectiveDelay > 60) {
        impactType = 'needs-rebooking';
      } else if (effectiveDelay > 30) {
        impactType = 'at-risk';
      } else {
        impactType = 'delayed';
      }

      const costImpact =
        impactType === 'needs-rebooking'
          ? node.cost * (1 - node.refundPercentage / 100)
          : 0;

      const explanation = this.generateImpactExplanation(node, impactType, effectiveDelay, depth);

      impacted.push({
        nodeId,
        node,
        impactType,
        delayMinutes: effectiveDelay,
        costImpact,
        propagationDepth: depth,
        explanation,
      });

      // Continue propagation to downstream
      const outgoingEdges = this.getOutgoingEdges(nodeId);
      for (const edge of outgoingEdges) {
        if (!visited.has(edge.target)) {
          queue.push({
            nodeId: edge.target,
            delayMinutes: Math.round(effectiveDelay * edge.riskPropagation),
            depth: depth + 1,
            parentCostImpact: costImpact,
          });
        }
      }
    }

    return impacted;
  }

  private generateImpactExplanation(
    node: TripNode,
    impactType: ImpactedNode['impactType'],
    delayMinutes: number,
    depth: number
  ): string {
    const chain = depth === 1 ? 'directly' : `through a chain of ${depth} dependencies`;

    switch (impactType) {
      case 'delayed':
        return `${node.title} will be delayed by ~${delayMinutes} minutes ${chain}. The time buffer should absorb most of the impact.`;
      case 'at-risk':
        return `${node.title} is at risk — the ${delayMinutes}-minute delay ${chain} may cause you to miss this booking. Consider backup options.`;
      case 'needs-rebooking':
        return `${node.title} needs rebooking — the ${delayMinutes}-minute delay ${chain} makes the original timing impossible. ${
          node.refundPercentage > 0
            ? `You can recover ${node.refundPercentage}% (₹${Math.round(node.cost * node.refundPercentage / 100)}) of the cost.`
            : 'Unfortunately this booking is non-refundable.'
        }`;
      case 'cancelled':
        return `${node.title} must be cancelled due to upstream cancellation.`;
      default:
        return `${node.title} is affected by the disruption.`;
    }
  }

  // ---------- Recovery Plan Generation ----------

  generateRecoveryOptions(
    disruption: Disruption,
    impactedNodes: ImpactedNode[]
  ): RecoveryOption[] {
    const options: RecoveryOption[] = [];

    // Option 1: Minimal changes (reschedule what we can, keep what we can)
    options.push(this.generateMinimalRecovery(disruption, impactedNodes));

    // Option 2: Optimized for cost (cheapest solution, may lose time)
    options.push(this.generateCostOptimizedRecovery(disruption, impactedNodes));

    // Option 3: Optimized for time (keep original schedule as close as possible)
    options.push(this.generateTimeOptimizedRecovery(disruption, impactedNodes));

    // Rank by confidence
    options.sort((a, b) => b.confidenceScore - a.confidenceScore);
    options.forEach((opt, idx) => {
      opt.rank = idx + 1;
      opt.recommended = idx === 0;
    });

    return options;
  }

  private generateMinimalRecovery(
    disruption: Disruption,
    impactedNodes: ImpactedNode[]
  ): RecoveryOption {
    const changes: RecoveryChange[] = [];
    let totalCostDelta = 0;
    let totalTimeDelta = 0;
    let refundAmount = 0;

    for (const impacted of impactedNodes) {
      if (impacted.propagationDepth === 0) {
        // The disrupted node itself
        if (disruption.type === 'cancellation') {
          changes.push({
            originalNodeId: impacted.nodeId,
            action: 'replace',
            costDelta: impacted.node.cost * 0.3, // 30% premium for last-minute rebooking
            explanation: `Replace with next available ${impacted.node.type}. Expect ~30% price premium for last-minute booking.`,
          });
          totalCostDelta += impacted.node.cost * 0.3;
          refundAmount += impacted.node.cost * (impacted.node.refundPercentage / 100);
        } else {
          changes.push({
            originalNodeId: impacted.nodeId,
            action: 'keep',
            costDelta: 0,
            explanation: `Keep the delayed ${impacted.node.type}. It will arrive ${disruption.delayMinutes} minutes late.`,
          });
          totalTimeDelta += disruption.delayMinutes || 0;
        }
        continue;
      }

      switch (impacted.impactType) {
        case 'delayed':
          changes.push({
            originalNodeId: impacted.nodeId,
            action: 'keep',
            costDelta: 0,
            explanation: `Keep ${impacted.node.title} — the delay is within the time buffer.`,
          });
          break;
        case 'at-risk':
          changes.push({
            originalNodeId: impacted.nodeId,
            action: 'keep',
            costDelta: 0,
            explanation: `Keep ${impacted.node.title} but monitor closely. Contact provider to inform about possible late arrival.`,
          });
          break;
        case 'needs-rebooking':
          changes.push({
            originalNodeId: impacted.nodeId,
            action: 'reschedule',
            newDetails: {
              startTime: this.shiftTime(impacted.node.startTime, impacted.delayMinutes),
              endTime: this.shiftTime(impacted.node.endTime, impacted.delayMinutes),
            },
            costDelta: impacted.node.cost * 0.1,
            explanation: `Reschedule ${impacted.node.title} by ${impacted.delayMinutes} minutes. Minor rebooking fee may apply.`,
          });
          totalCostDelta += impacted.node.cost * 0.1;
          break;
        case 'cancelled':
          changes.push({
            originalNodeId: impacted.nodeId,
            action: 'cancel',
            costDelta: -impacted.node.cost * (impacted.node.refundPercentage / 100),
            explanation: `Cancel ${impacted.node.title} and claim ${impacted.node.refundPercentage}% refund.`,
          });
          refundAmount += impacted.node.cost * (impacted.node.refundPercentage / 100);
          break;
      }
    }

    return {
      id: `recovery-minimal-${Date.now()}`,
      title: 'Minimal Changes',
      description: 'Make the fewest changes possible. Keep what works, reschedule what must change.',
      changes,
      totalCostDelta,
      totalTimeDelta,
      refundAmount,
      confidenceScore: 85,
      rationale: '',
      pros: ['Fewest changes to your plan', 'Lowest additional cost', 'Most of your bookings remain intact'],
      cons: ['Some activities may feel rushed', 'Less buffer time for the rest of the trip'],
      rank: 1,
      recommended: true,
    };
  }

  private generateCostOptimizedRecovery(
    disruption: Disruption,
    impactedNodes: ImpactedNode[]
  ): RecoveryOption {
    const changes: RecoveryChange[] = [];
    let totalCostDelta = 0;
    let refundAmount = 0;

    for (const impacted of impactedNodes) {
      if (impacted.impactType === 'needs-rebooking' || impacted.impactType === 'cancelled') {
        // Cancel and claim refund instead of rebooking
        changes.push({
          originalNodeId: impacted.nodeId,
          action: 'cancel',
          costDelta: -impacted.node.cost * (impacted.node.refundPercentage / 100),
          explanation: `Cancel ${impacted.node.title} and claim ₹${Math.round(impacted.node.cost * impacted.node.refundPercentage / 100)} refund. Find a free alternative instead.`,
        });
        refundAmount += impacted.node.cost * (impacted.node.refundPercentage / 100);
        totalCostDelta -= impacted.node.cost * (impacted.node.refundPercentage / 100);
      } else {
        changes.push({
          originalNodeId: impacted.nodeId,
          action: 'keep',
          costDelta: 0,
          explanation: `Keep ${impacted.node.title} as-is.`,
        });
      }
    }

    return {
      id: `recovery-cost-${Date.now()}`,
      title: 'Budget Saver',
      description: 'Minimize financial impact. Cancel disrupted bookings, claim refunds, find free alternatives.',
      changes,
      totalCostDelta,
      totalTimeDelta: 0,
      refundAmount,
      confidenceScore: 72,
      rationale: '',
      pros: ['Saves the most money', 'Maximizes refund recovery', 'Creates free time for spontaneous exploration'],
      cons: ['You lose some planned experiences', 'Need to find replacement activities', 'May miss out on pre-booked experiences'],
      rank: 2,
      recommended: false,
    };
  }

  private generateTimeOptimizedRecovery(
    disruption: Disruption,
    impactedNodes: ImpactedNode[]
  ): RecoveryOption {
    const changes: RecoveryChange[] = [];
    let totalCostDelta = 0;
    let refundAmount = 0;

    for (const impacted of impactedNodes) {
      if (impacted.propagationDepth === 0 && disruption.type === 'cancellation') {
        // Replace disrupted node with premium fast alternative
        changes.push({
          originalNodeId: impacted.nodeId,
          action: 'replace',
          costDelta: impacted.node.cost * 0.5,
          explanation: `Replace with premium express ${impacted.node.type} to maintain original schedule. Higher cost but no time lost.`,
        });
        totalCostDelta += impacted.node.cost * 0.5;
        refundAmount += impacted.node.cost * (impacted.node.refundPercentage / 100);
      } else if (impacted.impactType === 'needs-rebooking') {
        // Pay premium to keep original time
        changes.push({
          originalNodeId: impacted.nodeId,
          action: 'replace',
          costDelta: impacted.node.cost * 0.4,
          explanation: `Book express/premium alternative for ${impacted.node.title} to stay on schedule. Premium pricing applies.`,
        });
        totalCostDelta += impacted.node.cost * 0.4;
      } else {
        changes.push({
          originalNodeId: impacted.nodeId,
          action: 'keep',
          costDelta: 0,
          explanation: `Keep ${impacted.node.title} — timing is preserved.`,
        });
      }
    }

    return {
      id: `recovery-time-${Date.now()}`,
      title: 'Time Keeper',
      description: 'Preserve your original schedule at any cost. Pay premium for express alternatives.',
      changes,
      totalCostDelta,
      totalTimeDelta: 0,
      refundAmount,
      confidenceScore: 65,
      rationale: '',
      pros: ['Original schedule mostly preserved', 'No missed experiences', 'Minimal disruption to your plans'],
      cons: ['Significantly higher cost', 'Premium alternatives may be less comfortable', 'Refunds may not cover the premium'],
      rank: 3,
      recommended: false,
    };
  }

  // ---------- Slack Time Detection ----------

  detectSlackWindows(minGapMinutes: number = 60): SlackWindow[] {
    const sortedNodes = this.getAllNodes()
      .filter((n) => n.status !== 'cancelled')
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    const slackWindows: SlackWindow[] = [];

    for (let i = 0; i < sortedNodes.length - 1; i++) {
      const currentEnd = new Date(sortedNodes[i].endTime);
      const nextStart = new Date(sortedNodes[i + 1].startTime);
      const gapMinutes = (nextStart.getTime() - currentEnd.getTime()) / (1000 * 60);

      if (gapMinutes >= minGapMinutes) {
        slackWindows.push({
          startTime: sortedNodes[i].endTime,
          endTime: sortedNodes[i + 1].startTime,
          durationMinutes: gapMinutes,
          location: sortedNodes[i].location, // assume same location as previous activity
          afterNodeId: sortedNodes[i].id,
          beforeNodeId: sortedNodes[i + 1].id,
          budget: 2000, // default remaining budget per slot
        });
      }
    }

    return slackWindows;
  }

  // ---------- Risk Scoring ----------

  updateNodeRisk(
    nodeId: string,
    weatherRisk: number,
    historicalDelay: number,
    providerReliability: number
  ): void {
    const node = this.nodes.get(nodeId);
    if (!node) return;

    // Weighted risk score
    const riskScore = Math.round(
      weatherRisk * 0.4 + historicalDelay * 0.35 + (100 - providerReliability) * 0.25
    );

    node.riskScore = riskScore;
    node.riskLevel = riskScore > 70 ? 'high' : riskScore > 40 ? 'medium' : 'low';

    const factors: string[] = [];
    if (weatherRisk > 50) factors.push('Adverse weather conditions');
    if (historicalDelay > 50) factors.push('Route has history of delays');
    if (providerReliability < 50) factors.push('Provider has mixed reliability');
    node.riskFactors = factors;

    this.nodes.set(nodeId, node);
  }

  // ---------- Utility ----------

  private shiftTime(isoTime: string, minutesToAdd: number): string {
    const date = new Date(isoTime);
    date.setMinutes(date.getMinutes() + minutesToAdd);
    return date.toISOString();
  }

  getTotalCost(): number {
    let total = 0;
    this.nodes.forEach((node) => {
      if (node.status !== 'cancelled') {
        total += node.cost;
      }
    });
    return total;
  }

  getNodesByStatus(status: TripNode['status']): TripNode[] {
    return this.getAllNodes().filter((n) => n.status === status);
  }

  getNodesByType(type: TripNode['type']): TripNode[] {
    return this.getAllNodes().filter((n) => n.type === type);
  }

  // Serialize graph back to Trip-compatible format
  toTrip(originalTrip: Trip): Trip {
    return {
      ...originalTrip,
      nodes: this.getAllNodes(),
      edges: this.getAllEdges(),
      totalCost: this.getTotalCost(),
    };
  }
}
