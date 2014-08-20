import inspect
import json
import re

import markdown
from flask import render_template, redirect, url_for, jsonify, request, Markup, g
from sqlalchemy.exc import SQLAlchemyError

from ..core import db
from ..menu import menu, breadcrumb, make_breadcrumb
from ..models import Event, Page
from . import bp

counter = 0


@bp.route('/')
@menu('index')
def index():
    conference = Event.query.first()
    if conference is None or Page.query.filter_by(id=conference.main_page_id).first() is None:
        db.drop_all()
        db.create_all()
        conference = Event()
        db.session.add(conference)
        db.session.commit()
        page = Page(event_id=conference.id)
        db.session.add(page)
        db.session.commit()
        conference.main_page_id = page.id
        db.session.commit()
    wvars = {
        'main_page_id': conference.main_page_id,
        'page_id': conference.main_page_id
    }
    return render_template('index.html', **wvars)


@bp.route('/edit/<int:id>')
@menu('edit')
def edit(id):
    page = Page.query.filter_by(id=id).first_or_404()
    page_content = {}
    global counter
    counter = 0
    for col in page.content:
        page_content[col] = []
        for container in page.content[col]:
            new_container = []
            page_content[col].append(new_container)
            for widget in container:
                new_container.append(render_widget(widget, True))
    wvars = {
        'cols': page.columns,
        'content': page_content,
        'page_id': id,
        'edit': True
    }
    return render_template('edit.html', **wvars)


@bp.route('/edit/<int:id>', methods=('PATCH',))
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


@bp.route('/view/<int:id>')
@menu('view')
def view(id):
    page = Page.query.filter_by(id=id).first_or_404()
    page_content = {}
    global counter
    counter = 0
    for col in page.content:
        page_content[col] = []
        for container in page.content[col]:
            new_container = []
            page_content[col].append(new_container)
            for widget in container:
                new_container.append(render_widget(widget, False))
    wvars = {
        'cols': page.columns,
        'content': page_content,
        'page_id': id,
        'edit': False
    }
    return render_template('view.html', **wvars)


def render_widget(settings, edit=False):
    global counter
    counter += 1
    wvars = {
        'settings': settings,
        'edit': edit,
        'counter': counter
    }
    if settings['type'] == 'box' and wvars.get('settings', {}).get('content', None):
        wvars['settings']['render_content'] = Markup(markdown.markdown(wvars['settings']['content']))
    return render_template('widgets/{0}.html'.format(settings['type']), **wvars)


@bp.route('/render/', methods=('POST',))
def render():
    data = request.get_json()
    return render_widget(data['settings'], data['edit'])


def fetch_data(page_id, data_type):
    page = Page.query.filter_by(id=page_id).first_or_404()
    event = Event.query.filter_by(id=page.event_id).first_or_404()
    return event.fetch(data_type)


@bp.route('/fetch/<int:id>')
def fetch(id):
    data_type = request.args['data_type']
    return jsonify(data=fetch_data(id, data_type))
