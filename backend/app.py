from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os
from db import db
from routes.tasks import tasks_bp

load_dotenv()

def create_app():
    app = Flask(__name__)
    
    # Configuración
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JSON_SORT_KEYS'] = False
    
    # Inicializar extensiones
    db.init_app(app)
    CORS(app)
    
    # Registrar blueprints
    app.register_blueprint(tasks_bp, url_prefix='/api')
    
    # Health check
    @app.route('/health')
    def health():
        return {'status': 'healthy', 'message': 'Task Manager API is running'}
    
    return app

if __name__ == '__main__':
    app = create_app()
    with app.app_context():
        db.create_all()
    app.run(debug=True, host='0.0.0.0', port=5000)