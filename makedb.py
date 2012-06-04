#!/usr/bin/env python
# -*- coding: utf-8 -*-
import db
import os
import hashlib
from sqlalchemy.orm import sessionmaker
from models import User, Notebook, Note, Base
import random, codecs

try:
    os.unlink('database.sqlite')
except OSError:
    pass
Base.metadata.create_all(db.engine)

def pwd_hash(t):
    return hashlib.sha256(t).hexdigest()

Session = sessionmaker(bind=db.engine)
session = Session()
admin_user = User(name="admin", admin=True, password=hashlib.sha256("admin").hexdigest(), email="admin@test.ru" )
ntb = Notebook( name=u"Блокнот", deflt=True, published=False)
ntb.notes = [ 
                Note(title=u'Заголовок заметки', text=u"Добро пожаловать, admin")
            ]
ntb.user = admin_user
session.add(admin_user)
session.commit()        

#fill database

f = open('/usr/share/dict/words')
allwords = []
users = []
for a in f:
    if 7 < len(a) < 10:
        allwords.append(a.strip().lower())
    if len(a) == int(random.uniform(8,1500)):
        if(len(a) < 12):
            users.append(a.strip().lower())
f.close()
#testtext.txt contain text for notes
f = codecs.open('testtext.txt', "r", "utf-8")
ntext = []
for a in f:
    a = a.strip()
    if len(a) > 5:
        ntext.append(a) 
f.close()


for usr_name in users[:30]:
    usr = User(name=usr_name, password=pwd_hash(usr_name), email=usr_name+"@test.com")
    dntb = Notebook( name=u"Блокнот", deflt=True, published=False)
    dntb.notes = [ Note(title=u"Первая запись", text=u"Добро пожаловать в Notebook, {0} !".format(usr_name)) ]
    dntb.user = usr    
    _k = int(random.uniform(1,len(users)-20))
    for i in range( int(random.uniform(1,15))):
        ntb = Notebook(name=unicode(allwords[int(random.uniform(0,len(allwords)-2))]))
        for x in range(int(random.uniform(1,15))):
            _j = int(random.uniform(1,len(ntext)-50)) 
            txt = ntext[_j: _j+ int(random.uniform(1,30)) ]
            ntb.notes.append(Note(text=" ".join(txt), title=ntb.name+" #"+str(x)))
        ntb.user = usr
    session.add(usr)
    session.commit()
