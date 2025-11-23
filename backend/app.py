from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from sqlalchemy import text  # ← AGREGAR ESTA IMPORTACIÓN
import os
import time
from db import db
from routes.tasks import tasks_bp

load_dotenv()

def create_app():
    app = Flask(__name__)
    
    # Configuración (MANTENER pg8000)
    database_url = os.getenv('DATABASE_URL')
    
    # Usar pg8000 como driver de PostgreSQL
    if database_url and database_url.startswith('postgresql://'):
        database_url = database_url.replace('postgresql://', 'postgresql+pg8000://')
    
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
        'pool_recycle': 300,
        'pool_pre_ping': True
    }
    app.config['JSON_SORT_KEYS'] = False
    
    # Inicializar extensiones
    db.init_app(app)
    CORS(app)
    
    # Registrar blueprints
    app.register_blueprint(tasks_bp, url_prefix='/api')
    
    # Health check mejorado
    @app.route('/health')
    def health():
        try:
            # Intentar conectar a la base de datos (CORREGIDO)
            db.session.execute(text('SELECT 1'))  # ← USAR text()
            db_status = 'connected'
        except Exception as e:
            db_status = f'error: {str(e)}'
        
        return {
            'status': 'healthy', 
            'message': 'Task Manager API is running',
            'database': db_status,
            'timestamp': time.time()
        }
    
    # Ruta de prueba de base de datos
    @app.route('/test-db')
    def test_db():
        try:
            result = db.session.execute(text('SELECT version()'))  # ← USAR text()
            version = result.scalar()
            return jsonify({
                'status': 'success',
                'database_version': version,
                'message': 'Conexión a PostgreSQL exitosa'
            })
        except Exception as e:
            return jsonify({
                'status': 'error',
                'message': f'Error conectando a PostgreSQL: {str(e)}'
            }), 500
    
    return app

if __name__ == '__main__':
    app = create_app()
    
    # Solo crear tablas si estamos en desarrollo
    if os.getenv('FLASK_ENV') == 'development':
        with app.app_context():
            db.create_all()
    
    app.run(debug=os.getenv('FLASK_ENV') == 'development', host='0.0.0.0', port=5000)