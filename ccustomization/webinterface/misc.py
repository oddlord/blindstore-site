import inspect
import json
import re

from flask import render_template, redirect, url_for, jsonify, request
from sqlalchemy.exc import SQLAlchemyError

from ..core import db
from ..layout import widgets
from ..models import Event, Page
from . import bp


def get_classes(module):
    classes_list = []
    for name, obj in inspect.getmembers(module):
        if inspect.isclass(obj) and name[0] != '_':
            pretty_name = ' '.join(re.findall('[A-Z][^A-Z]*', name))
            classes_list.append(pretty_name)
    classes_list.sort()
    return classes_list

COLS = 2
ROWS = 8
widget_list = get_classes(widgets)


@bp.route('/')
def index():
    conference = Event.query.first()
    if conference is None or Page.query.filter_by(id=conference.main_page_id).first() is None:
        db.drop_all()
        db.create_all()
        page = Page()
        db.session.add(page)
        db.session.commit()
        conference = Event(page.id)
        db.session.add(conference)
        db.session.commit()
    wvars = {
        'main_page_id': conference.main_page_id
    }
    return render_template('index.html', **wvars)


@bp.route('/edit/<id>')
def edit(id):
    page = Page.query.filter_by(id=id).first()
    if page is None:
        return redirect(url_for(".index"))
    wvars = {
        'cols': page.columns,
        'content': page.content,
        'page_id': id
    }
    return render_template('edit.html', **wvars)


@bp.route('/edit/<id>', methods=('PATCH',))
def update(id):
    page = Page.query.filter_by(id=id).first_or_404()
    page.content = request.get_json()
    page.columns = len(page.content)
    try:
        db.session.commit()
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify(error=str(e)), 400
    return jsonify()


@bp.route('/view/<id>')
def view(id):
    page = Page.query.filter_by(id=id).first()
    if page is None:
        return redirect(url_for(".index"))
    wvars = {
        'cols': COLS,
        'rows': ROWS,
        'page_id': id
    }
    return render_template('view.html', **wvars)
