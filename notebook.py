#!/usr/bin/env python
# -*- coding: utf-8 -*-
import bottle, hashlib, json, db
from models import User, Notebook, Note, Base
from beaker.middleware  import SessionMiddleware
from sqlalchemy.orm.exc import NoResultFound
from sqlalchemy import or_
import re

bottle.debug(True)

session_opts = {
    'session.type': 'file',
    'session.cookie_expires': False,
    'session.data_dir': '/tmp/coursework_webdev/session_data',
    'session.auto': True
}

app = bottle.app()
app.install(db.sqlalchemy_plugin)
app = SessionMiddleware(app, session_opts)

@bottle.hook('before_request')
def before_request():
    session = bottle.request.environ.get('beaker.session')
    if not session.get('user_id',0) \
        and bottle.request.path.startswith('/api') \
        and not bottle.request.path.startswith('/api/signin') \
        and not bottle.request.path.startswith('/api/signup'):
        bottle.abort(401,'Unauthorized')


@bottle.route('/static/<filepath:path>')
def server_static(filepath):
    return bottle.static_file(filepath, root='./static')


@bottle.route('/')
def main():
    session = bottle.request.environ.get('beaker.session')
    user_id = session.get('user_id',0)
    if user_id:
        return bottle.template('home_auth')
    else:
        return bottle.template('home_non_auth')

@bottle.route('/logout')
def logout():
    session = bottle.request.environ.get('beaker.session')
    session['user_id'] = 0
    bottle.redirect('/')

#api
@bottle.route('/api/user', method="GET")
def user_info(db):
    session = bottle.request.environ.get('beaker.session')
    user_id = session.get('user_id',0)
    if user_id:
        try:
            user = db.query(User).filter_by(id = user_id).one();
            return json.dumps(user.to_dict(), ensure_ascii=False)
        except NoResultFound:
            return {}
    else:
        bottle.abort(403, 'Forbidden')

@bottle.route('/api/signin', method="POST")
def signin(db):
    session = bottle.request.environ.get('beaker.session')
    username = bottle.request.forms.username.strip().lower()
    password = bottle.request.forms.password
    try:
        user = db.query(User).filter_by(
            name=username, password=hashlib.sha256(password).hexdigest()).one()
    except NoResultFound:
        try:
            user = db.query(User).filter_by(
                email=username, password=hashlib.sha256(password).hexdigest()).one()
        except NoResultFound:
            return {'ok':False}            
    session['user_id'] = user.id
    return {'ok':True}

@bottle.route('/api/signup', method="POST")
def signin(db):
    session = bottle.request.environ.get('beaker.session')
    username = bottle.request.forms.username.strip().lower()
    email = bottle.request.forms.email.strip().lower()
    username_re = re.compile(r'^[_0-9A-Za-z]{5,20}$')
    email_re = re.compile(r'^[a-zA-Z0-9._%-+]+@[a-zA-Z0-9._%-]+.[a-zA-Z]{2,6}$')
    password = bottle.request.forms.password
    if not username_re.match(username):
        return {'ok':False,'msg':u"Имя пользователя должно быть не менее 5 и \
не более 20 символов, и содержать латинские буквы и цифры и знак подчеркивания"}
    if not email_re.match(email):
        return {'ok':False, 'msg': u"Неправильный формат e-mail"}
    if len(password) < 6:
        return {'ok':False,'msg':u"Пароль должен содержать не менее 7 символов"}
    user = db.query(User).filter(or_(User.name==username,User.email==email)).first()
    if not user:
        new_user = User(name = username, 
                        password=hashlib.sha256(password).hexdigest(),
                        email = email)
        new_user_notebook = Notebook(name=u"Блокнот", deflt=True)
        new_user_notebook.user = new_user
        new_note = Note(text=u"Добро пожаловать в Notebook!", title=u"Первая заметка");
        new_user_notebook.notes.append(new_note);
        db.add(new_user)
        db.commit()
        session['user_id'] = new_user.id
        return {'ok':True, 'msg':u"Пользователь {0} создан.".format(new_user.name)}
    else:
        return {'ok':False,'msg':u"Пользователь с таким именем или адресом e-mail уже существует"}


@bottle.route('/api/notebook', method='GET')
def get_all_notebooks(db):
    session = bottle.request.environ.get('beaker.session')
    user_id = session.get('user_id',0)
    if user_id:
        try:
            notebooks = db.query(Notebook).filter_by(user_id = user_id).all()
            return json.dumps([ notebook.to_dict() for notebook in notebooks ], ensure_ascii=False)
        except NoResultFound:
            return {}
    else:
        bottle.abort(403, 'Forbidden')

@bottle.route('/api/notebook', method='POST')        
def create_notebook(db):
    session = bottle.request.environ.get('beaker.session')
    user_id = session.get('user_id',0)
    try:
        data = bottle.request.json
        try:
            new_notebook = Notebook(user_id = user_id, name=data['name'] )
        except KeyError:
            return {}
        db.add(new_notebook)
        db.commit()
        return json.dumps(new_notebook.to_dict(), ensure_ascii=False)
    except NoResultFound:
        return {}


@bottle.route('/api/notebook/<notebook_id:int>', method='PUT')        
def update_notebook(notebook_id, db):
    session = bottle.request.environ.get('beaker.session')
    user_id = session.get('user_id')
    data = bottle.request.json
    try:
        new_name = data['name'].strip()
    except:
        bottle.abort(404, 'Wrong parameters')
    try:
        notebook = db.query(Notebook).filter_by(user_id = user_id, id = notebook_id).one()
        notebook.name = new_name;
        db.commit()
        res = notebook.to_dict()
        res['notes'] = [note.to_dict() for note in notebook.notes] 
        return json.dumps(res, ensure_ascii=False)
        #return json.dumps(notebook.to_dict(), ensure_ascii=False)
    except NoResultFound:
        return {}

@bottle.route('/api/notebook/<notebook_id:int>', method='GET')
def get_notes(notebook_id, db):    
    session = bottle.request.environ.get('beaker.session')
    user_id = session.get('user_id',0)
    if user_id:
        try:
            notebook = db.query(Notebook).filter_by(user_id = user_id, id = notebook_id).one()
            notes = db.query(Note).filter_by(notebook_id = notebook_id).all()
            res = notebook.to_dict()
            res['notes'] = [note.to_dict() for note in notes] 
            return json.dumps(res, ensure_ascii=False)
        except NoResultFound:
            return {}
    else:
        bottle.abort(403, 'Forbidden')

@bottle.route('/api/note', method='POST')
def new_note(db):    
    session = bottle.request.environ.get('beaker.session')
    user_id = session.get('user_id')    
    data = bottle.request.json
    try:
        notebook_id = data['notebook_id']
    except KeyError:
        bottle.abort(400,"not enough parameters")
    try:
        notebook = db.query(Notebook).filter_by(user_id = user_id, id = notebook_id).one()
        try:
            new_note = Note(title=data['title'], text=data['text'], notebook_id=notebook.id)
        except KeyError:
            bottle.abort(400,"not enough parameters")
        db.add(new_note)
        db.commit()
        #notes = db.query(Note).filter_by(notebook_id = notebook_id).all()
        return json.dumps(new_note.to_dict(), ensure_ascii=False)
    except NoResultFound:
        bottle.abort(406,"error")

@bottle.route('/api/notebook/<notebook_id:int>', method='DELETE')
def get_note(notebook_id, db): 
    session = bottle.request.environ.get('beaker.session')   
    user_id = session.get('user_id')
    try:
        notebook = db.query(Notebook).filter_by(user_id = user_id, id = notebook_id, deflt=False).one()
        db.delete(notebook)
        db.commit()
        return {}
    except NoResultFound:
        return {}  

@bottle.route('/api/note/<note_id:int>', method='PUT')
def update_note(note_id, db):    
    session = bottle.request.environ.get('beaker.session')
    user_id = session.get('user_id',0)
    try:
        data = bottle.request.json;
        note = db.query(Note).filter_by( id = data['id']).one()
        if note.notebook.user_id != user_id:
            bottle.abort(401,'Unauthorized')
        note.title = data['title']
        note.text = data['text']
        db.commit()
        return note.to_dict();
    except NoResultFound:
        bottle.abort(404, 'Not Found')          

@bottle.route('/api/note/<note_id:int>', method="DELETE")
def delete_note(note_id, db):    
    session = bottle.request.environ.get('beaker.session')
    user_id = session.get('user_id')
    try:
        note = db.query(Note).filter_by(id = note_id).one()
        if note.notebook.user_id != user_id:
            bottle.abort(401,'Unauthorized')
        db.delete(note)
        db.commit()
        return {};
    except NoResultFound:
            bottle.abort(404, 'Not Found')

#admin api

@bottle.route('/admin')
def admin_page(db):
    session = bottle.request.environ.get('beaker.session')
    user_id = session.get('user_id',0)
    if user_id:
        try:
            user = db.query(User).filter_by(id=user_id, admin=True).one()
            if user.admin:
                return bottle.template('admin')
            else:
                bottle.redirect('/')
        except NoResultFound:
            bottle.redirect('/')    
    else:
        bottle.redirect('/')


@bottle.route('/api/admin/user', method="GET")
def admin_get_users(db):
    session = bottle.request.environ.get('beaker.session')
    user_id = session.get('user_id')   
    try:
        user = db.query(User).filter_by(id=user_id, admin=True).one()
        users = db.query(User).all()
        return json.dumps([usr.to_dict() for usr in users], ensure_ascii=False);
    except NoResultFound:
        return {}

@bottle.route('/api/admin/user/<user_id:int>', method="GET")
def admin_get_user(user_id, db):
    session = bottle.request.environ.get('beaker.session')
    cur_user_id = session.get('user_id')   
    try:
        user = db.query(User).filter_by(id=cur_user_id, admin=True).one()
        if user:
            user2 = db.query(User).filter_by(id=user_id).one()
            res = user2.to_dict()
            res["notebooks"] = [ntb.to_dict() for ntb in user2.notebooks]
            return json.dumps(res , ensure_ascii=False);
        else:
            bottle.abort(401,"Unauthorized")
    except NoResultFound:
        return {}

@bottle.route('/api/admin/notebook/<notebook_id:int>', method="GET")
def admin_get_notebook(notebook_id, db):
    session = bottle.request.environ.get('beaker.session')
    cur_user_id = session.get('user_id')   
    try:
        user = db.query(User).filter_by(id=cur_user_id, admin=True).one()
        if user:
            notebook = db.query(Notebook).filter_by(id=notebook_id).one()
            res = notebook.to_dict()
            res["notes"] = [note.to_dict() for note in notebook.notes]
            return json.dumps(res , ensure_ascii=False);
        else:
            bottle.abort(401,"Unauthorized")
    except NoResultFound:
        return {}        

@bottle.route('/api/admin/note/<note_id:int>', method="DELETE")
def admin_get_notebook(note_id, db):
    session = bottle.request.environ.get('beaker.session')
    cur_user_id = session.get('user_id')   
    try:
        user = db.query(User).filter_by(id=cur_user_id, admin=True).one()
        if user:
            note = db.query(Note).filter_by(id=note_id).one()
            db.delete(note)
            db.commit()
            return {}
        else:
            bottle.abort(401,"Unauthorized")
    except NoResultFound:
        return {}     

@bottle.route('/api/admin/notebook/<notebook_id:int>', method="DELETE")
def admin_get_notebook(notebook_id, db):
    session = bottle.request.environ.get('beaker.session')
    cur_user_id = session.get('user_id')   
    try:
        user = db.query(User).filter_by(id=cur_user_id, admin=True).one()
        if user:
            notebook = db.query(Notebook).filter_by(id=notebook_id).one()
            db.delete(notebook)
            db.commit()
            return {}
        else:
            bottle.abort(401,"Unauthorized")
    except NoResultFound:
        return {}

bottle.run(app=app)