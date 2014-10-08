var draggableOpts = {
    handle: '.ui-icon.ui-icon-arrow-4',
    revert: true,
    start: function(event, ui) {
        var element = ui.helper;
        element.addClass('on-foreground');
        if (element.hasClass('lvl-1-cnt')) {
            showDroppables($('.lvl-1-cnt'));
        } else if (element.hasClass('lvl-2-cnt')) {
            showDroppables($('.lvl-1-cnt'));
            showDroppables($('.lvl-2-cnt'));
        } else if (element.hasClass('widget')) {
            showDroppables($('.lvl-1-cnt'));
            showDroppables($('.lvl-2-cnt'));
            showDroppables($('.widget'));
        }
        hideDroppables(element);
        $('.lvl-1-cnt, .lvl-2-cnt, .widget').each(function(){
            var elem = $(this);
            var elemClass;
            if (elem.hasClass('lvl-1-cnt')) {
                elemClass = 'lvl-1-cnt';
            } else if (elem.hasClass('lvl-2-cnt')) {
                elemClass = 'lvl-2-cnt';
            } else if (elem.hasClass('widget')) {
                elemClass = 'widget';
                var secondLvlCnt = elem.parent('.lvl-2-cnt');
                if (!secondLvlCnt.siblings('.lvl-2-cnt').length) {
                    hideDroppables(elem);
                }
            }
            if (elem.next().hasClass(elemClass)) {
                if (elem.next().next().length) {
                    if (elem.hasClass('lvl-1-cnt') || elem.hasClass('widget')) {
                        elem.children('.droppable-south').hide();
                        elem.children('.widget-content').children('.droppable-south').hide();
                    } else if (elem.hasClass('lvl-2-cnt')) {
                        elem.children('.droppable-east').hide();
                    }
                } else if (!elem.is(element)) {
                    var lastElem = elem.next();
                    if (elem.hasClass('lvl-1-cnt') || elem.hasClass('widget')) {
                        lastElem.children('.droppable-north').hide();
                        lastElem.children('.widget-content').children('.droppable-north').hide();
                    } else if (lastElem.hasClass('lvl-2-cnt')) {
                        lastElem.children('.droppable-west').hide();
                    }
                }
            }
        });
    },
    stop: function(event, ui) {
        var element = ui.helper;
        element.removeClass('on-foreground');
        refreshElements();
        hideAllDroppables();
    }
}

var droppableOpts = {
    tolerance: 'pointer',
    hoverClass: 'droppable-hover',
    drop: function(event, ui) {
        var draggableElem = ui.draggable;
        var droppableElem = $(this);
        var parentElem = droppableElem.parent();
        if (parentElem.hasClass('widget-content')) {
            parentElem = parentElem.parent();
        }
        draggableElem.detach();
        if (droppableElem.hasClass('droppable-north') || droppableElem.hasClass('droppable-west')) {
            parentElem.before(draggableElem);
        } else if (droppableElem.hasClass('droppable-south') || droppableElem.hasClass('droppable-east')) {
            parentElem.after(draggableElem);
        }
    }
}

function showDroppables(elements) {
    elements.each(function(){
        var element = $(this);
        element.children('.droppable-token').show();
        (element.children('.widget-content').children('.droppable-token')).show();
    });
}
function hideDroppables(elements) {
    elements.each(function(){
        var element = $(this);
        element.children('.droppable-token').hide();
        element.children('.widget-content').children('.droppable-token').hide();
    });
}
function hideAllDroppables() {
    $('.droppable-token').hide();
}

function getContainerIcons() {
    var iconsContainer = $('<div>', {
        'class': 'container-icons'
    });
    var drag = $('<span>', {
        'class': 'ui-icon ui-icon-arrow-4'
    });
    var trash = $('<span>', {
        'class': 'ui-icon ui-icon-trash'
    });
    var copy = $('<span>', {
        'class': 'ui-icon ui-icon-copy'
    });
    drag.appendTo(iconsContainer);
    trash.appendTo(iconsContainer);
    copy.appendTo(iconsContainer);
    bindContainerIcons(iconsContainer);
    return iconsContainer;
}
function bindContainerIcons(iconsContainer) {
    var trash = iconsContainer.find('.ui-icon.ui-icon-trash');
    var copy = iconsContainer.find('.ui-icon.ui-icon-copy');
    trash.on('click', function(){
        var iconsContainer = $(this).parent('.container-icons');
        var container = iconsContainer.parent('.widget-cnt');
        container.remove();
        refreshElements();
    });
    copy.on('click', function(){
        var container = $(this).parent('.container-icons').parent('.widget-cnt');
        var newContainer = container.clone();
        var iconsContainer = newContainer.children('.container-icons');
        bindContainerIcons(iconsContainer);
        container.after(newContainer);
        newContainer.find('.widget').each(function(){
            reloadWidget($(this));
        });
        newContainer.draggable(draggableOpts);
        newContainer.children('.droppable-token').droppable(droppableOpts);
        refreshElements();
    });
}

function containerWrap(element, lvl) {
    var container = $('<div>', {
        'class': 'widget-cnt lvl-' + lvl + '-cnt'
    });
    element.wrap(container);
    container = element.parent('.lvl-' + lvl + '-cnt');
    var containerIcons = getContainerIcons();
    element.before(containerIcons);
    var firstDroppablePos = 'north';
    var secondDroppablePos = 'south';
    if (lvl == 2) {
        firstDroppablePos = 'east';
        secondDroppablePos = 'west';
    }
    var firstDroppable = $('<div>', {
        'class': 'droppable-token droppable-' + firstDroppablePos
    });
    var secondDroppable = $('<div>', {
        'class': 'droppable-token droppable-' + secondDroppablePos
    });
    element.before(firstDroppable);
    element.before(secondDroppable);
    container.draggable(draggableOpts);
    container.children('.droppable-token').droppable(droppableOpts);
}

// The refresh functions are used to refresh the widgets/containers aspect (icons, position, etc... not content)
function refreshElements() {
    var mainCnt = $('.main-cnt');
    refreshContainers();
    refreshWidgets();
    $('body').trigger('refreshFinished');
}
function refreshContainers() {
    $('.widget-cnt').each(function(){
        var container = $(this);
        if (!container.find('.widget').length) {
            container.remove();
        } else if ((container.hasClass('.lvl-1-cnt') && container.parent().hasClass('.lvl-1-cnt')) || (container.hasClass('.lvl-2-cnt') && container.parent().hasClass('.lvl-2-cnt'))) {
            container.children('.container-icons, .droppable-token').remove();
            container.children().unwrap();
        }
    });
}
function refreshWidgets() {
    wrapWidgets();
    moveWidgets();
}
function wrapWidgets() {
    $('.widget').each(function(){
        var widget = $(this);
        wrapWidget(widget);
    });
}
function wrapWidget(widget) {
    if (!widget.parents('.lvl-2-cnt').length) {
        containerWrap(widget, 2);
    }
    if (!widget.parents('.lvl-1-cnt').length) {
        var secondLvlCnt = widget.parents('.lvl-2-cnt');
        containerWrap(secondLvlCnt, 1);
    }
}
function moveWidgets() {
    $('.lvl-2-cnt').each(function(){
        var secondLvlCnt = $(this);
        if (!secondLvlCnt.siblings('.lvl-2-cnt').length) {
            var widgets = secondLvlCnt.find('.widget:not(:last-child)');
            widgets.each(function(){
                var widget = $(this);
                var firstLvlCnt = widget.parents('.lvl-1-cnt');
                widget.detach();
                firstLvlCnt.before(widget);
                wrapWidget(widget);
            });
        }
    });
}

function getSerializedLayout() {
    var mainCnt = $('.main-cnt');
    var content = [];
    var firstLvlCntCount = 0;
    mainCnt.find('.lvl-1-cnt').each(function(){
        var firstLvlCnt = $(this);
        content[firstLvlCntCount] = [];
        var secondLvlCntCount = 0;
        firstLvlCnt.find('.lvl-2-cnt').each(function(){
            var secondLvlCnt = $(this);
            content[firstLvlCntCount][secondLvlCntCount] = [];
            var widgetCount = 0;
            secondLvlCnt.find('.widget').each(function(){
                var widget = $(this);
                content[firstLvlCntCount][secondLvlCntCount][widgetCount] = widget.data('settings');
                widgetCount++;
            });
            secondLvlCntCount++;
        });
        firstLvlCntCount++;
    });
    return JSON.stringify(content);
}

function saveLayout() {
    $.ajax({
        type: 'PATCH',
        url: $('#save').data('url'),
        contentType: 'application/json',
        dataType: 'json',
        data: getSerializedLayout(),
        error: function() {
            alert('Error: couldn\'t save correctly!');
        }
    });
}

function bindSelectMenus(element) {
    element.on('click', function(e){
        e.preventDefault();
        var elemText = element.text();
        var dropup = element.parents('.dropup');
        dropup.find('.dropdown-toggle').html(elemText+' <span class="caret"></span>');
        dropup.find('input').val(elemText.toLowerCase());
    });
}

$(document).ready(function() {
    "use strict";

    var mainCnt = $('.main-cnt');

    $('#add-widget').on('click', function(){
        var settings = {
            type: $('#widget-select input').val(),
            empty: true
        };
        renderWidget(settings).done(function(newWidget){
            newWidget.appendTo(mainCnt);
            refreshElements();
            $('body').trigger('inizialize-widgets');
        });
    });

    $('#show-layout').on('click', function(){
        $('.main-cnt').toggleClass('edit-mode');
        refreshElements();
    });

    $('#save').on('click', function(){
        saveLayout();
    });
    $('#discard').on('click', function(){
        location.reload();
    });

    $('.widget-cnt, .widget').draggable(draggableOpts);
    $('.droppable-token').droppable(droppableOpts);

    $('#widget-select li a').each(function(){
        bindSelectMenus($(this));
    });

    $('.container-icons').each(function(){
        bindContainerIcons($(this));
    });

    refreshElements();

});
