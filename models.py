from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, UnicodeText, Unicode, Boolean, ForeignKey
from sqlalchemy.orm import relationship, backref
from sqlalchemy.ext.associationproxy import association_proxy
import json

Base = declarative_base()

class User(Base):
    __tablename__ = 'user'
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    password = Column(String(64), nullable=False) #sha256
    email = Column(String(250),   nullable=False)    
    notebooks = relationship("Notebook", backref="user")
    admin = Column(Boolean, default=False)
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email
        }

class Notebook(Base):
    __tablename__ = 'notebook'
    id = Column(Integer, primary_key=True)
    name = Column(Unicode(100))    
    notes = relationship("Note", backref="notebook")
    deflt = Column(Boolean, default=False) 
    published = Column(Boolean, default=False) 
    user_id = Column(Integer, ForeignKey('user.id'))

    def to_dict(self):
        return {
            'id':self.id,
            'name':self.name,
            'deflt':self.deflt,
            'published':self.published,
            'user_id': self.user_id,
            'count': len(self.notes)
        }

class Note(Base):
    __tablename__ = 'note'
    id = Column(Integer, primary_key=True)
    notebook_id = Column(Integer, ForeignKey('notebook.id'))
    title = Column(Unicode(100)) 
    text = Column(UnicodeText)

    def to_dict(self):
        return {
            'id':self.id,
            'notebook_id':self.notebook_id,
            'title':self.title,
            'text':self.text
        }