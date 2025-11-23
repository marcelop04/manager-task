from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import create_engine
from sqlalchemy.pool import StaticPool
import os

db = SQLAlchemy()

def init_db(app):
    """Inicializar la base de datos con manejo de errores"""
    try:
        with app.app_context():
            db.create_all()
            print("✅ Tablas de la base de datos creadas exitosamente")
    except Exception as e:
        print(f"❌ Error creando tablas: {e}")