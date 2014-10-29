function BoxWidget(widgetElem) {
    this.widgetElem = widgetElem;
    this.settings = widgetElem.data('settings');
    this.dialog = widgetElem.find('.widget-dialog');
    delete this.settings.render_content;
}

$.extend(BoxWidget.prototype, {
    run: function run() {},

    runEdit: function runEdit() {
        var self = this;
        var dialog = self.dialog;
        var save = dialog.find('.we-save-button');
        var title = dialog.find('.we-widget-title');
        var border = dialog.find('.we-widget-border');
        var content = dialog.find('.we-widget-content');

        title.val(self.settings.title || '');
        border.prop('checked', self.settings.border || false);
        content.val(self.settings.content || '');
        content.trigger('input');

        save.on('click', function(){
            self.settings.title = title.val();
            self.settings.border = border.is(':checked');
            self.settings.content = content.val();
            self.settings.empty = self.settings.content == '';
            updateWidget(self.widgetElem, self.settings);
        });
    }
});
