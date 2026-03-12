import { RangeToSerialize, NodeInfo } from "interfaces/CommentInterface";
const SELECTORS: string = [
  "text",
  "a",
  "div",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "body .article-content_list-item, body .article-content_list-item *",
  "body .single-content *",
  "p",
].join(", ");

export function getDefaultRangeToSerialize(): RangeToSerialize {
  return {
    start: {
      selector: "",
      childNodeIndex: 0,
      offset: 0,
    },
    end: {
      selector: "",
      childNodeIndex: 0,
      offset: 0,
    },
  };
}

export function childNodeIndexOf(parentNode: Node, childNode: Node): number {
  const index = [...parentNode.childNodes]
    .map((cn) => cn as Node)
    .indexOf(childNode);
  return index !== -1 ? index : 0;
}

function computedNthIndex(node: Node): number {
  let result = 0;
  if (node.parentNode === null) {
    return result;
  }
  const childNodes: Node[] = [...node.parentNode.childNodes].map(
    (cn) => cn as Node
  );
  let elementsWithSameTag = 0;
  for (let i = 0; i < childNodes.length; i++) {
    if (childNodes[i] === node) {
      result = elementsWithSameTag + 1;
      break;
    }
    if (childNodes[i].nodeName === node.nodeName) {
      elementsWithSameTag++;
    }
  }
  return result;
}

function generateSelector(node: Node): string {
  let currentNode: Node | null = node;
  const tagNames: string[] = [];
  while (currentNode) {
    let tagName: string | undefined = currentNode.nodeName;
    if (tagName[0] === "#") {
      tagName = undefined;
    }
    if (tagName) {
      const nthIndex: number = computedNthIndex(currentNode);

      let selector = tagName;
      if (nthIndex > 1) {
        selector += ":nth-of-type(" + nthIndex + ")";
      }
      tagNames.push(selector);
    }
    currentNode = currentNode.parentNode;
  }
  return tagNames.reverse().join(" > ").toLowerCase();
}

export function serializeRange(range: Range): RangeToSerialize {
  return {
    start: {
      selector: generateSelector(range.startContainer),
      childNodeIndex: childNodeIndexOf(
        range.startContainer.parentNode as Node,
        range.startContainer
      ),
      offset: range.startOffset,
    },
    end: {
      selector: generateSelector(range.endContainer),
      childNodeIndex: childNodeIndexOf(
        range.endContainer.parentNode as Node,
        range.endContainer
      ),
      offset: range.endOffset,
    },
  };
}

function findNode(nodeInfo: NodeInfo): Node | null {
  const element = document.querySelector(nodeInfo.selector);
  console.log(nodeInfo.selector, element);
  if (!element) {
    // throw new Error('Unable to find element with selector: ' + nodeInfo.selector)
    return null;
  }
  return element.childNodes[nodeInfo.childNodeIndex];
}

export function deserializeRange(
  rangeToSerialize: RangeToSerialize
): Range | null {
  // console.log("deserializeRange", rangeToSerialize)
  const range: Range = document.createRange();
  const startNode = findNode(rangeToSerialize.start);
  const endNode = findNode(rangeToSerialize.end);
  if (!startNode || !endNode) {
    return null;
  }
  try {
    range.setStart(startNode, rangeToSerialize.start.offset);
  } catch (e) {
    range.setStart(startNode, 0);
  }
  try {
    range.setEnd(endNode, rangeToSerialize.end.offset);
  } catch (e) {
    range.setEnd(startNode, 0);
  }
  return range;
}

export function getSafeRanges(range: Range): Range[] {
  const allNodesInRange: Node[] = getRangeNodes(
    range.startContainer,
    range.endContainer
  );
  const allRanges: Range[] = createRanges(range, allNodesInRange);
  const filtredRanges: Range[] = filterRanges(allRanges, allNodesInRange);
  return filtredRanges;
}

function getRangeNodes(startNode: Node, endNode: Node, filter?: Function) {
  if (startNode == endNode && startNode.childNodes.length === 0) {
    return [startNode];
  }
  const nodes: Node[] = [];
  let currentNode: Node | null = startNode;
  let result: Node | null = null;
  let skipChildren = false;
  while (currentNode !== null && currentNode !== endNode) {
    if (!nodes.includes(currentNode)) {
      nodes.push(currentNode);
    }
    result = null;
    skipChildren =
      currentNode.lastChild !== null && nodes.includes(currentNode.lastChild);
    if (
      !skipChildren &&
      currentNode.firstChild !== null &&
      !nodes.includes(currentNode.firstChild)
    ) {
      result = currentNode.firstChild;
    }
    result = result || currentNode.nextSibling || currentNode.parentNode;
    currentNode = result;
  }
  if (!nodes.includes(endNode)) {
    nodes.push(endNode);
  }
  return nodes;
}

function createRanges(sourceRange: Range, nodesInRange: Node[]): Range[] {
  const result: Range[] = [];
  if (nodesInRange.length === 1) {
    return [sourceRange];
  }
  for (let i = 0; i < nodesInRange.length; i++) {
    const range = document.createRange();
    if (i === 0) {
      range.setStart(nodesInRange[i], sourceRange.startOffset);
      range.setEndAfter(nodesInRange[i]);
    } else if (i === nodesInRange.length - 1) {
      range.setStartBefore(nodesInRange[i]);
      range.setEnd(nodesInRange[i], sourceRange.endOffset);
    } else {
      range.selectNode(nodesInRange[i]);
    }
    result.push(range);
  }
  return result;
}

function filterRanges(ranges: Range[], nodes: Node[]): Range[] {
  const result: Range[] = [];
  // let use: boolean
  for (let i = 0; i < ranges.length; i++) {
    if (
      nodes[i].nodeType === Node.TEXT_NODE &&
      nodes[i].parentNode &&
      (nodes[i].parentNode as Element).matches(SELECTORS)
    ) {
      result.push(ranges[i]);
    }
    // use = false
    // try {
    // 	use = (nodes[i] as Element).matches(selectors)
    // } catch (e) {
    // 	console.log(123)
    // 	use = nodes[i].nodeType === nodeType
    // }
    // if (use) {
    // 	result.push(ranges[i])
    // }
  }
  return result;
}
