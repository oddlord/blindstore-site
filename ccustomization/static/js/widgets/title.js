function TitleWidget(widgetElem) {
    Widget.call(this, widgetElem);
}
TitleWidget.prototype = Object.create(Widget.prototype);
TitleWidget.prototype.constructor = TitleWidget;

$.extend(TitleWidget.prototype, {
    run: function run() {},

    runEdit: function runEdit() {
        var self = this;
        var dialog = self.dialog;
        var save = dialog.find('.we-save-button');
        var title = dialog.find('.we-widget-title');
        var subtitle = dialog.find('.we-widget-subtitle');
        var border = dialog.find('.we-widget-border');

        border.prop('checked', self.settings.border || false);
        if (self.settings.content != undefined) {
            title.val(self.settings.content.title || '');
            subtitle.val(self.settings.content.subtitle.replace(/<\/h3>\n<h3>/g, '\n') || '');
        }

        save.on('click', function(){
            self.settings.border = border.is(':checked');
            self.settings.content = {
                title: title.val(),
                subtitle: subtitle.val().replace(/\n/g, '</h3>\n<h3>')
            };
            self.settings.empty = self.settings.content.title == '';
            self.update();
        });
    }
});