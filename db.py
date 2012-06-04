from sqlalchemy.orm import sessionmaker
from sqlalchemy import  create_engine
from bottle.ext import sqlalchemy

engine = create_engine("sqlite:///database.sqlite")

sqlalchemy_plugin = sqlalchemy.Plugin(
    engine, # SQLAlchemy engine created with create_engine function.
    None, # SQLAlchemy metadata, required only if create=True.
    keyword='db', # Keyword used to inject session database in a route (default 'db').
    create=False, # If it is true, execute `metadata.create_all(engine)` when plugin is applied (default False).
    commit=False, # If it is true, plugin commit changes after route is executed (default True).
    use_kwargs=False # If it is true and keyword is not defined, plugin uses **kwargs argument to inject session database (default False).
)