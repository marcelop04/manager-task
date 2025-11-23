from flask import Flask, jsonify
import psycopg2
from urllib.parse import urlparse
import os

app = Flask(__name__)

@app.route('/')
def home():
    return jsonify({"message": "Debug app running"})

@app.route('/test-connection')
def test_connection():
    """Probar conexión DIRECTA a PostgreSQL sin SQLAlchemy"""
    db_url = "postgresql://finanzas_db_5z88_user:CqbMoMD12LCgyzFWJgU2YpzpTDLu2F27@dpg-d3ab5cvdiees73d4cteg-a.virginia-postgres.render.com/finanzas_db_5z88"
    
    try:
        # Intentar conectar SIN SSL primero
        conn = psycopg2.connect(db_url)
        cur = conn.cursor()
        cur.execute("SELECT version()")
        version = cur.fetchone()
        conn.close()
        
        return jsonify({
            'status': 'success', 
            'version': version[0],
            'ssl': 'no',
            'message': 'Conexión SIN SSL exitosa'
        })
    except Exception as e:
        error_no_ssl = str(e)
    
    try:
        # Intentar conectar CON SSL
        conn = psycopg2.connect(db_url, sslmode='require')
        cur = conn.cursor()
        cur.execute("SELECT version()")
        version = cur.fetchone()
        conn.close()
        
        return jsonify({
            'status': 'success', 
            'version': version[0],
            'ssl': 'yes',
            'message': 'Conexión CON SSL exitosa'
        })
    except Exception as e:
        error_with_ssl = str(e)
    
    return jsonify({
        'status': 'error',
        'errors': {
            'sin_ssl': error_no_ssl,
            'con_ssl': error_with_ssl
        },
        'message': 'Ambos métodos fallaron'
    }), 500

@app.route('/test-pg8000')
def test_pg8000():
    """Probar conexión con pg8000"""
    try:
        import pg8000
        from urllib.parse import urlparse
        
        # Parsear la URL manualmente
        url = urlparse("postgresql://finanzas_db_5z88_user:CqbMoMD12LCgyzFWJgU2YpzpTDLu2F27@dpg-d3ab5cvdiees73d4cteg-a.virginia-postgres.render.com/finanzas_db_5z88")
        
        conn = pg8000.connect(
            user=url.username,
            password=url.password,
            host=url.hostname,
            port=url.port or 5432,
            database=url.path[1:],  # Quitar el / inicial
            ssl=True
        )
        
        cur = conn.cursor()
        cur.execute("SELECT version()")
        version = cur.fetchone()
        conn.close()
        
        return jsonify({
            'status': 'success', 
            'version': version[0],
            'driver': 'pg8000',
            'message': 'Conexión pg8000 exitosa'
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'driver': 'pg8000',
            'message': f'Error pg8000: {str(e)}'
        }), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)