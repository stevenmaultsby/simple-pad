export enum ColorType {
    WHITE = "#ffffff",
    BLACK = "#000000",
    GREEN = "#008000",
    RED = "#ff0000",
    BLUE = "#0000ff",
    BLUEVIOLET = "#8a2be2",
    TEAL = "#008080",
    TRANSPARANT = "transparent",
}

export function clearSelection() {
    if (window.getSelection) {
        if (window.getSelection()?.empty) {  // Chrome
            window.getSelection()?.empty();
        } else if (window.getSelection()?.removeAllRanges) {  // Firefox
            window.getSelection()?.removeAllRanges();
        }
    } else if (document.getSelection) {  // IE?
        document.getSelection()?.empty();
    }
}

// OLD
export function getSafeRanges(range: Range): Range[] {
    // let range = {...dangerous}
    const commonAncestorContainer = range.commonAncestorContainer

    // Starts -- Work inward from the start, selecting the largest safe range
    let startContainers: Node[] = []
    let startContainer: Node | null = range.startContainer
    while(startContainer !== commonAncestorContainer && startContainer !== null) {
        startContainers.push(startContainer)
        startContainer = startContainer.parentNode
    }
    
    let rs: Range[] = []
    for (let i = 0; i < startContainers.length; i++) {
        const xs = document.createRange()
        if (i) {
            xs.setStartAfter(startContainers[i - 1])
            xs.setEndAfter(startContainers[i].lastChild as Node)
        } else {
            xs.setStart(startContainers[i], range.startOffset)
            xs.setEndAfter((startContainers[i].nodeType == Node.TEXT_NODE) ? startContainers[i] : startContainers[i].lastChild as Node)
        }
        // console.log(xs)
        rs.push(xs)
    }

    // Ends -- basically the same code reversed
    let endContainers: Node[] = []
    let endContainer: Node | null = range.endContainer
    while(endContainer !== commonAncestorContainer && endContainer !== null) {
        endContainers.push(endContainer)
        endContainer = endContainer.parentNode
    }

    let re: Range[] = []
    for (let i = 0; i < endContainers.length; i++) {
        const xe = document.createRange();
        if (i) {
            xe.setStartBefore(endContainers[i].firstChild as Node)
            xe.setEndBefore(endContainers[i - 1])
        } else {
            xe.setStartBefore((endContainers[i].nodeType == Node.TEXT_NODE) ? endContainers[i] : endContainers[i].firstChild as Node)
            xe.setEnd(endContainers[i], range.endOffset)
        }
        // console.log(xe)
        re.unshift(xe)
    }

    // Middle -- the uncaptured middle
    if ((startContainers.length > 0) && (endContainers.length > 0)) {
        var xm = document.createRange();
        xm.setStartAfter(startContainers[startContainers.length - 1])
        xm.setEndBefore(endContainers[endContainers.length - 1])
    } else {
        return [range]
    }

    
    // Concat
    let response = rs.concat(xm).concat(re);
    // console.log(response)

    // for (let i = 0; i < ranges.length; i++) {
    //     if ((ranges[i] as Element))
    // }


    // Send to Console
    return response;
}
