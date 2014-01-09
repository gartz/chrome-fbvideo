var LEFT_COL_SIZE = 180;
var HEIGHT = 60;
var videosSelector = '.swfObject';
var placeEl = document.querySelector('#pagelet_dock div div div');

var destineEl = document.querySelector('#youtubeVideos');
if (!destineEl) {
    destineEl = document.createElement('div');
    destineEl.setAttribute('id', 'youtubeVideos');
    destineEl.style.position = 'fixed';
    destineEl.style.bottom = '28px';
    destineEl.style.left = '0px';
    placeEl.appendChild(destineEl);
}

function squizeVideo(element) {
    // Resize elements to the destineEl size
    
    if (!element.dataOriginalWidth) {
        element.dataOriginalWidth = element.style.width;
    }
    element.style.width = LEFT_COL_SIZE + 'px';
    
    if (!element.dataOriginalHeight) {
        element.dataOriginalHeight = element.style.height;
    }
    element.style.height = HEIGHT + 'px';
    
    if (!element.dataOriginalParent) {
        element.dataOriginalParent = element.parentElement;
    }
    
    var iframe = element.querySelector('iframe');
    
    if (!iframe.dataOriginalWidth) {
        iframe.dataOriginalWidth = iframe.getAttribute('width');
    }
    iframe.setAttribute('width', LEFT_COL_SIZE);
    
    if (!iframe.dataOriginalHeight) {
        iframe.dataOriginalHeight = iframe.getAttribute('height');
    }
    iframe.setAttribute('height', HEIGHT);
}

function squizeResetVideo(element) {
    element.style.width = element.dataOriginalWidth + 'px';
    element.style.height = element.dataOriginalHeight + 'px';
    iframe = element.querySelector('iframe');
    iframe.setAttribute('width', iframe.dataOriginalWidth);
    iframe.setAttribute('height', iframe.dataOriginalHeight);
}

function onMouseEnter(event) {
    // mouseEnter handler, will resize to original size, and change zIndex;
    
    squizeResetVideo(this);
    this.style.position = 'relative';
    this.style.bottom = (parseInt(this.dataOriginalHeight) - 60) + 'px';
    
}

function onMouseLeave(event) {
    // mouseEnter handler, will resize to original size, and change zIndex;
    squizeVideo(this);
    
    this.style.position = 'initial';
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

setInterval(function () {
    var videos = document.querySelectorAll(videosSelector);
    Array.prototype.forEach.call(videos, function(element) {
        // Don't touch video stage
        if (element.parentElement.className === 'videoStage') return;
        if (!isElementInViewport(element) && element.parentElement !== destineEl) {
            destineEl.insertBefore(element);
            
            squizeVideo(element);
            element.addEventListener('mouseenter', onMouseEnter);
            element.addEventListener('mouseleave', onMouseLeave);
        }
    });    
}, 1e3);
