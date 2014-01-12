var MIN_SWF_WIDTH = 180;
var AVATAR_WIDTH_AREA = 100;
var MIN_SWF_HEIGHT = 60;
var divSwfObjects = document.querySelector('#swfObjects');

// Browser features needed (27+ || 18+):
MutationObserver = MutationObserver || webkitMutationObserver;
if (!MutationObserver) {
    throw new Error('FLV needs MutationObserver support');
}

// Creating DOM elements

// Close button
var closeButtonEl = document.createElement('a');
closeButtonEl.setAttribute('class', 'close');
closeButtonEl.setAttribute('href', '#');
closeButtonEl.addEventListener('click', onCloseButtonClick);

// Not resize button
var notResizeButtonEl = document.createElement('a');
notResizeButtonEl.setAttribute('class', 'notResize');
notResizeButtonEl.setAttribute('href', '#');
notResizeButtonEl.addEventListener('click', onNotResizeButtonClick);

// Not resize button
var commentsButtonEl = document.createElement('a');
commentsButtonEl.setAttribute('class', 'comments');
commentsButtonEl.setAttribute('href', '#');
commentsButtonEl.addEventListener('click', function () {
    alert('Goto comments');
});

var divButtons = document.createElement('div');
divButtons.setAttribute('class', 'buttonsArea');
divButtons.appendChild(closeButtonEl);
divButtons.appendChild(notResizeButtonEl);
divButtons.appendChild(commentsButtonEl);

if (!divSwfObjects) {
    divSwfObjects = document.createElement('div');
    divSwfObjects.setAttribute('id', 'swfObjects');
}

function createViewPortDiv(swfObject) {
    var id = 'swfObject' + Date.now();
    var div = document.createElement('div');
    div.id = id;
    div.style.width = swfObject.clientWidth + 'px';
    div.style.height = swfObject.clientHeight + 'px';
    return div;
}

// List useful cached elements, to don't run query every time
var els = {
    body: this.document.body,
    content: document.querySelector('#content'),
    leftCol: document.querySelector('#leftCol'),
    buttons: divButtons
};

var dimensions = {
    defaultWidth: MIN_SWF_WIDTH,
    defaultHeight: MIN_SWF_HEIGHT,
    dockArea: MIN_SWF_WIDTH,
    maxVideoSize: MIN_SWF_WIDTH + AVATAR_WIDTH_AREA,
    fbRightBar: 1546
}


// HELPERS

function isElementInViewport(el) {
    var rect = el.getBoundingClientRect();

    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// MOUSE EVENTS:

function onCloseButtonClick() {
    // onCLick remove video from the left list
    var videoDiv = this.parentElement
        .parentElement;
        
    videoDiv.parentElement.removeChild(videoDiv);
    
    // There is cache from old element?
    var removedNodes = videoDiv.dataRemovedNodes;
    var restorePlace = videoDiv.dataRestorePlace;
    var placeId = videoDiv.dataset.placeId;
    if (!removedNodes || removedNodes.length === 0 || !placeId) {
        return;
    }
    
    // There is a place in DOM for me?
    var oldPlaceEl = document.querySelector('#' + placeId);
    if (!oldPlaceEl) {
        return;
    }
    
    // List and append elements to it old place
    Array.prototype.forEach.call(removedNodes, function (element) {
        console.log('restoring', restorePlace, 'to', element);
        restorePlace.appendChild(element);
    });
    
    // div has complete his task and now it can die in peace
    // I see you in the GC dudes
    oldPlaceEl.parentElement.removeChild(oldPlaceEl);
    
    // Reset the placeId to generete a new one when new iframe is generated
    videoDiv.dataset.placeId = '';
}

function onNotResizeButtonClick() {
    // onCLick remove video from the left list
    var videoDiv = this.parentElement
        .parentElement;
        
    var notResize = videoDiv.getAttribute('data-notresize');
    
    if (notResize !== 'active') {
        videoDiv.setAttribute('data-notresize', 'active');
    } else {
        videoDiv.removeAttribute('data-notresize');
    }
}

function onMouseOver(event) {
    // mouseEnter handler
    
    // Only work over iframe elements
    var target = event.relatedTarget;
    if (target.tagName !== 'IFRAME') {
        target = event.target;
        if (target.tagName !== 'IFRAME') {
            target = event.relatedTarget;
        }
    }
    if (target.className !== 'mask') {
        target = event.target;
        if (target.className !== 'mask') {
            return;
        }
    }
    
    console.log('mouseOver', this, event);
    
    mouseOverWorkaround(target);
    
    // Append close button
    target.parentElement.appendChild(els.buttons);
}

// Compatibility workaround methods:

function mouseOverWorkaround(target) {
    // Workaround for iframe mouseOver
    var masks = divSwfObjects.querySelectorAll('.mask');
    Array.prototype.forEach.call(masks, function (el) {
        el.style.display = 'block';
    });
    
    if (target.className !== 'mask') {
        target = target.querySelector('.mask');
    }
    
    if (target) {
        target.style.display = 'none';
    }
}

function storeDimensions(element) {
    // Store the original dimensions from a element in it dataset
    
    if (!element.dataset.originalWidth) {
        element.dataset.originalWidth = element.clientWidth;
    }
    if (!element.dataset.originalHeight) {
        element.dataset.originalHeight = element.clientHeight;
    }
}

function createWorkaroundDiv() {
    var div = document.createElement('div');
    div.style.width = '100%';
    div.style.height = '100%';
    div.style.position = 'absolute';
    div.style.top = '0';
    div.style.left = '0';
    div.className = 'mask';
    return div;
}

// Moving around the video elements

function fixedMoveTo(element, destine) {
    // Dock the target in the same place as destine
    
    position = destine.getBoundingClientRect();
    
    element.style.position = 'fixed';
    element.style.left = position.left + 'px';
    element.style.top = position.top + 'px';
    element.style.right = '';
    element.style.bottom = '';
}

function resetFixed(element) {
    element.style.left = '';
    element.style.top = '';
    element.style.right = '';

    element.style.position = 'relative';
    element.style.paddingBottom = '4px';
    element.style.bottom = '0px';
}

function initVideo(swfObject, maskElement) {
    // Execute all the procedure to init a video element
    
    // Store the dimensions
    storeDimensions(swfObject);
    
    // Insert the mask div with dimensions with an ID
    var div = createViewPortDiv(swfObject);
    maskElement.appendChild(div);
    
    // Store the ID
    swfObject.dataset.placeId = div.id;
    
    // Create workAroundMaskDiv
    swfObject.appendChild(createWorkaroundDiv());
    
    // Move the element to videosList
    if (divSwfObjects.children.length > 0) {
        divSwfObjects.insertBefore(swfObject, divSwfObjects.children[0]);
    } else {
        divSwfObjects.insertBefore(swfObject);
    }
    
    // Move to original position
    moveVideos();
}

function onWindowClick(event) {
    // If is a /ajax/flash/expand_inline do:
    
    // detect the element (do it until found A or BODY)
    var target = event.target;
    
    while (target && target.tagName !== 'A') {
        target = target.parentElement;
    }
    
    // Isn't an anchor tag
    if (!target) {
        return;
    }
    
    // A check if contains ajaxify propertie
    var ajaxify = target.getAttribute('ajaxify');
    if (!ajaxify) {
        return
    }
    
    // Check if contains /ajax/flash/expand_inline
    if (!ajaxify.contains('/ajax/flash/expand_inline')) {
        return;
    }
    
    console.log('target', target);
    
    var swfObject;
    var removedNodes;
    var restorePlace;
    
    // create an observer instance
    var observer = new MutationObserver(function (mutations) {
        // Search for mutations
        mutations.forEach(function (mutation) {
            // We need to know if childList has changed
            console.log('mutation', mutation.type, mutation);
            if (mutation.type !== 'childList') {
                return;
            }
            
            // Search the swfObject
            Array.prototype.forEach.call(mutation.addedNodes, function (el) {
                console.log('Added nodes:', el);
                if (el.className.contains('swfObject')) {
                    swfObject = el;
                } else {
                    // Search on childrens:
                    swfObject = el.querySelector('.swfObject');
                }
                if (!swfObject && el.parentElement.className.contains('swfObject')) {
                    swfObject = el.parentElement;
                }
            });

            // Check if the parentElement doesn't exist and is the first removedNodes
            if (!removedNodes) {
                removedNodes = mutation.removedNodes;
                restorePlace = mutation.target;
            }

            if (swfObject && removedNodes) {
                swfObject.dataRemovedNodes = removedNodes;
                swfObject.dataRestorePlace = restorePlace;
            }

            // Found our target, store and disconnect the observers
            if (swfObject && removedNodes) {
                console.log('Mutation disconnect');
                observer.disconnect();
                
                if (!swfObject.dataset.placeId)
                // Init the video, move to right place and put new mask insted
                initVideo(swfObject, swfObject.parentElement);
            }
        });
    });
    
    // configuration of the observer:
    var config = { attributes: false, childList: true, characterData: false };
     
    // pass in the target node, as well as the observer options
    
    // Find the container base element
    var container = target.parentElement;
    while (container && container.parentElement.children.length === 1) {
        observer.observe(container, config);
        container = container.parentElement;
    }
    observer.observe(container, config);
    container = container.parentElement;
    while (container && container.parentElement.children.length === 1) {
        observer.observe(container, config);
        container = container.parentElement;
    }
    observer.observe(container, config);
    
}

function moveVideos() {
    // Move videos in the screen, if it's visible on DOM, keep on timeline
    // but when not, move it to the left corner with other videos
    
    var videos = divSwfObjects.children;
    
    Array.prototype.forEach.call(videos, function (element) {
        // There is original position on DOM?
        var placeElement = document.querySelector('#' + element.dataset.placeId);
        if (!placeElement) {
            resetFixed(element);
            return;
        }
        
        if (!isElementInViewport(placeElement)) {
            resetFixed(element);
            return;
        }
        
        fixedMoveTo(element, placeElement);
    });
}

function swfObjectsUpdatePosition() {
    var fbChatSidebar = document.querySelector('.fbChatSidebar');
    if (!fbChatSidebar) {
        return;
    }
    
    sidebarBounding = fbChatSidebar.getBoundingClientRect()
    
    var sidebarRight = Math.round(sidebarBounding.left + sidebarBounding.width);
    
    if (sidebarRight === document.body.clientWidth) {
        return;
    }
    
    // This is for the new Facebook interface, need to update with resize event
    divSwfObjects.style.left = sidebarRight + 'px';
}

function init() {
    // Execute onLoad or right after
    
    // Find divPageletDock element
    var divPageletDock = document.querySelector('#pagelet_dock');
    
    // Append the divSwfObjects in the placeEl
    divPageletDock.appendChild(divSwfObjects);
    
    // Will work on all children elements, don't need lot of events
    // forget about memory leeks in events without DOM objects...
    // there is only one event to rule then all! :D
    divSwfObjects.addEventListener('mouseover', onMouseOver);
    
    // User already watching a video, need to move it
    var videos = document.querySelectorAll('#contentCol .swfObject');
    
    console.log('ini videos', videos);
    
    Array.prototype.forEach.call(videos, function (element) {
        // Init the video, move to right place and put new mask insted
        initVideo(element, element.parentElement);
    });
    
    // Update docking position
    swfObjectsUpdatePosition();
    
    // Change the video positions becouse user used scroll or resize window
    window.addEventListener('scroll', moveVideos);
    window.addEventListener('resize', moveVideos);
    window.addEventListener('resize', swfObjectsUpdatePosition);
    window.addEventListener('popstate', moveVideos);
    
    document.addEventListener('click', onWindowClick, true);
}

// ------------- Listeners -------------

// After DOM load, store the window dimensions
window.addEventListener('load', init);

// Workaround if DOM already loaded
setTimeout(init, 50);

// When resize update the window dimensions
// window.addEventListener('resize', function () {
//     updateDimensions()
//     clearTimeout(updateVideoSizeST);
//     setTimeout(function () {
//         manipulateVideos();
//     }, 500);
// });