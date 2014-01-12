var LEFT_COL_SIZE = 180;
var AVATAR_WIDTH_AREA = 100;
var HEIGHT = 60;
var videosSelector = '.swfObject';
var placeEl = document.querySelector('#pagelet_dock');

var divSwfObjects = document.querySelector('#swfObjects');

// Browser features needed (27+ || 18+):
MutationObserver = MutationObserver || webkitMutationObserver;
if (!MutationObserver) {
    throw new Error('FLV needs MutationObserver support');
}

// Close button
var closeButtonEl = document.createElement('a');
closeButtonEl.setAttribute('data-hover', 'tooltip');
closeButtonEl.setAttribute('data-tooltip-position', 'below');
closeButtonEl.setAttribute('data-tooltip-alighn', 'right');
closeButtonEl.setAttribute('class', 'closeTheater');
closeButtonEl.setAttribute('href', '#');
closeButtonEl.setAttribute('role', 'button');
closeButtonEl.style.position = 'absolute';
closeButtonEl.style.right = '3px';
closeButtonEl.style.top = '0px';

closeButtonEl.addEventListener('click', function () {
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
});

var closeButtonDiv = document.createElement('div');
closeButtonDiv.setAttribute('class', 'fbPhotoSnowlift');
closeButtonDiv.appendChild(closeButtonEl);
closeButtonDiv.style.position = 'absolute';
closeButtonDiv.style.width = '18px';
closeButtonDiv.style.height = '50px';
closeButtonDiv.style.right = '-19px';
closeButtonDiv.style.top = '0px';
closeButtonDiv.style.background = 'white';

// List useful cached elements, to don't run query every time
var els = {
    body: this.document.body,
    content: document.querySelector('#content'),
    leftCol: document.querySelector('#leftCol'),
    closeButton: closeButtonDiv
};

var dimensions = {
    defaultWidth: LEFT_COL_SIZE,
    defaultHeight: HEIGHT,
    dockArea: LEFT_COL_SIZE,
    maxVideoSize: LEFT_COL_SIZE + AVATAR_WIDTH_AREA,
    fbRightBar: 1546
}


var updateVideoSizeST;
function updateDimensions() {
    var area = els.body.clientWidth - els.content.clientWidth;
    var pageletTicker = document.querySelector('#pagelet_ticker');
    if (pageletTicker) {
        area -= pageletTicker.clientWidth;
    }
    if (area < 0) {
        area = leftCol.clientWidth;
    } else {
        // Only left size of the area plus leftCol width
        area = (area / 2) + leftCol.clientWidth;
    }
    
    dimensions.dockArea = area;
    dimensions.maxVideoSize = area + AVATAR_WIDTH_AREA;
}

if (!divSwfObjects) {
    divSwfObjects = document.createElement('div');
    divSwfObjects.setAttribute('id', 'swfObjects');
    divSwfObjects.style.position = 'fixed';
    divSwfObjects.style.bottom = '28px';
    divSwfObjects.style.left = '0px';
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


function storeOriginalValues(element) {
    storeDimensions(element);
    
    // Dataset is only for strings, so it must be outside
    if (!element.originalParent) {
        element.originalParent = element.parentElement;
    }
    
    var iframe = element.querySelector('iframe');
    storeDimensions(iframe);
}

function squizeVideo(element, width, height) {
    if (!width) {
        width = dimensions.defaultWidth;
    }
    if (!height) {
        height = dimensions.defaultHeight
    }
    
    // Resize elements to the divSwfObjects size
    element.style.width = width + 'px';
    element.style.height = height + 'px';
    
    var iframe = element.querySelector('iframe');
    
    iframe.setAttribute('width', width);
    iframe.setAttribute('height', height);
}

function videoToOriginalSize(element) {
    element.style.width = element.dataset.originalWidth + 'px';
    element.style.height = element.dataset.originalHeight + 'px';
    iframe = element.querySelector('iframe');
    iframe.setAttribute('width', iframe.dataset.originalWidth);
    iframe.setAttribute('height', iframe.dataset.originalHeight);
}

function elementWidth(element) {
    var max = (dimensions.dockArea > element.dataset.originalWidth) 
                    ? element.dataset.originalWidth
                    : dimensions.dockArea;
    return max;
}

function aiMinimize(element) {
    // If there is only one video and the screensize permite it's original size
    // will not resize
    
    var videos = document.querySelectorAll(videosSelector);
    
    // If only one video
    if (videos.length === 1) {
        // There is area available for original size?
        if (elementWidth(element) === (+ element.dataset.originalWidth)) {
            videoToOriginalSize(element);
        } else {
            // if not, so squizeVideo
            squizeVideo(element, elementWidth(element), (+ element.dataset.originalHeight));
        }
    } else {
        squizeVideo(element, elementWidth(element));
    }
}

function isElementInViewport(el) {
    var rect = el.getBoundingClientRect();

    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

function onMouseEnter(event) {
    // mouseEnter handler, add menus to the video
    
    console.log('mouseEnter', this, event);
    
    // Append close button
    //this.appendChild(els.closeButton);
}

function onMouseLeave(event) {
    // mouseEnter handler
    
    console.log('mouseLeave', this, event);
    
    // Remove close button
    //this.removeChild(els.closeButton);
}

function onMouseOver(event) {
    // mouseEnter handler
    
    console.log('mouseOver', this, event);
    
    // Only work over iframe elements
    var iframe = event.relatedTarget;
    if (iframe.tagName !== 'IFRAME') {
        iframe = event.target;
        if (iframe.tagName !== 'IFRAME') {
            return;
        }
    }
    
    console.log('ifrmae');
    
    // Append close button
    iframe.parentElement.appendChild(els.closeButton);
}

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

function createViewPortDiv(swfObject) {
    var id = 'swfObject' + Date.now();
    var div = document.createElement('div');
    div.id = id;
    div.style.width = swfObject.clientWidth + 'px';
    div.style.height = swfObject.clientHeight + 'px';
    return div;
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
    
    // Move the element to videosList
    divSwfObjects.appendChild(swfObject);
    
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
                if (el.className.contains('swfObject')) {
                    swfObject = el;
                }
            });

            // Check if the parentElement doesn't exist and is the first removedNodes
            if (Array.prototype.every.call(mutation.removedNodes, function (node) {
                return !node.parentElement;
            }) && !removedNodes) {
                removedNodes = mutation.removedNodes;
                restorePlace = mutation.target;
            }

            if (swfObject && removedNodes) {
                swfObject.dataRemovedNodes = removedNodes;
                swfObject.dataRestorePlace = restorePlace;
            }

            // Found our target, store and disconnect the observers
            if (swfObject && removedNodes) {
                observer.disconnect();
            }
            
            // Workaround to execute only once
            if (swfObject.dataset.placeId) {
                return;
            }
            
            // Init the video, move to right place and put new mask insted
            initVideo(swfObject, mutation.target);
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

function init() {
    // Execute onLoad or right after
    
    // Append the divSwfObjects in the placeEl
    placeEl.appendChild(divSwfObjects);
    
    // Will work on all children elements, don't need lot of events
    // forget about memory leeks in events without DOM objects...
    // there is only one event to rule then all! :D
    divSwfObjects.addEventListener('mouseenter', onMouseEnter);
    divSwfObjects.addEventListener('mouseleave', onMouseLeave);
    divSwfObjects.addEventListener('mouseover', onMouseOver);
    
    // Update the window dimensions
    updateDimensions();
    
    // User already watching a video, need to move it
    var videos = document.querySelectorAll('#contentCol .swfObject');
    
    console.log('ini videos', videos);
    
    Array.prototype.forEach.call(videos, function (element) {
        // Init the video, move to right place and put new mask insted
        initVideo(element, element.parentElement);
    });
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

// Change the video positions becouse user used scroll or resize window
window.addEventListener('scroll', moveVideos);
window.addEventListener('resize', moveVideos);

document.addEventListener('click', onWindowClick, true);