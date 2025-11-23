from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from sqlalchemy import text
import os
import time
from db import db
from routes.tasks import tasks_bp

load_dotenv()

def create_app():
    app = Flask(__name__)
    
    # FORZAR psycopg2 como driver
    database_url = os.getenv('DATABASE_URL')
    if database_url and database_url.startswith('postgresql://'):
        database_url = database_url.replace('postgresql://', 'postgresql+psycopg2://')
    
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
        'pool_recycle': 300,
        'pool_pre_ping': True,
        'connect_args': {
            'sslmode': 'require'
        }
    }
    app.config['JSON_SORT_KEYS'] = False
    
    # Inicializar extensiones
    db.init_app(app)
    CORS(app)
    
    # Registrar blueprints
    app.register_blueprint(tasks_bp, url_prefix='/api')
    
    # Health check
    @app.route('/health')
    def health():
        try:
            db.session.execute(text('SELECT 1'))
            db_status = 'connected'
        except Exception as e:
            db_status = f'error: {str(e)}'
        
        return {
            'status': 'healthy', 
            'message': 'Task Manager API is running',
            'database': db_status,
            'timestamp': time.time()
        }
    
    @app.route('/test-db')
    def test_db():
        try:
            result = db.session.execute(text('SELECT version()'))
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
    
    try:
        with app.app_context():
            db.create_all()
            print("✅ Tablas creadas/existen")
    except Exception as e:
        print(f"⚠️ Error creando tablas: {e}")
    
    app.run(debug=os.getenv('FLASK_ENV') == 'development', host='0.0.0.0', port=5000)