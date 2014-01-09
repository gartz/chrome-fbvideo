var LEFT_COL_SIZE = 180;
var AVATAR_WIDTH_AREA = 100;
var HEIGHT = 60;
var videosSelector = '.swfObject';
var placeEl = document.querySelector('#pagelet_dock');
var destineEl = document.querySelector('#youtubeVideos');

// List useful cached elements, to don't run query every time
var els = {
    body: this.document.body,
    content: document.querySelector('#content'),
    leftCol: document.querySelector('#leftCol')
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
        console.log(pageletTicker.clientWidth);
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

setTimeout(updateDimensions, 50);

window.addEventListener('load', updateDimensions);

window.addEventListener('resize', function () {
    updateDimensions()
    clearTimeout(updateVideoSizeST);
    setTimeout(function () {
        manipulateVideos();
    }, 500);
});

window.addEventListener('scroll', manipulateVideos);

if (!destineEl) {
    destineEl = document.createElement('div');
    destineEl.setAttribute('id', 'youtubeVideos');
    destineEl.style.position = 'fixed';
    destineEl.style.bottom = '28px';
    destineEl.style.left = '0px';
    placeEl.appendChild(destineEl);
}

function squizeVideo(element, width, height) {
    if (!width) {
        width = dimensions.defaultWidth;
    }
    if (!height) {
        height = dimensions.defaultHeight
    }
    
    // Resize elements to the destineEl size
    
    if (!element.dataset.originalWidth) {
        element.dataset.originalWidth = element.clientWidth;
    }
    element.style.width = width + 'px';
    
    if (!element.dataset.originalHeight) {
        element.dataset.originalHeight = element.clientHeight;
    }
    element.style.height = height + 'px';
    
    if (!element.dataset.originalParent) {
        element.dataset.originalParent = element.parentElement;
    }
    
    var iframe = element.querySelector('iframe');
    
    if (!iframe.dataset.originalWidth) {
        iframe.dataset.originalWidth = iframe.getAttribute('width');
    }
    iframe.setAttribute('width', width);
    
    if (!iframe.dataset.originalHeight) {
        iframe.dataset.originalHeight = iframe.getAttribute('height');
    }
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

function onMouseEnter(event) {
    // mouseEnter handler, will resize to original size, and change zIndex;
    
    videoToOriginalSize(this);
    this.style.bottom = '0px';
    
}

function onMouseLeave(event) {
    // mouseEnter handler, will resize to original size, and change zIndex;
    squizeVideo(this, elementWidth(this));
    
    
    this.style.bottom = '0px';
}

function isElementInViewport(el) {
    var rect = el.getBoundingClientRect();

    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /*or $(window).height() */
        rect.right <= (window.innerWidth || document.documentElement.clientWidth) /*or $(window).width() */
    );
}

function manipulateVideos() {
    var videos = document.querySelectorAll(videosSelector);
    Array.prototype.forEach.call(videos, function(element) {
        // Don't touch video stage
        if (element.parentElement.className === 'videoStage') return;
        if (!isElementInViewport(element) && element.parentElement !== destineEl) {
            destineEl.insertBefore(element);
            
            while (element.classList.length !== 1) {
                var clas = element.classList[0];
                if (clas !== 'swfObject') {
                    element.classList.remove(clas);
                } else {
                    clas = element.classList[1];
                    if (clas) {
                        element.classList.remove(clas);
                    }
                }
            }
            
            squizeVideo(element);
            element.style.position = 'relative';
            element.style.paddingBottom = '4px';
            
            
            element.addEventListener('mouseenter', onMouseEnter);
            element.addEventListener('mouseleave', onMouseLeave);
        }
        if (element.parentElement === destineEl && element.clientWidth !== dimensions.dockArea) {
           squizeVideo(element, elementWidth(element));
        }
    });    
}
