from flask import Blueprint, request, jsonify
from db import db
from models.task import Task
from schemas.task_schema import TaskSchema, TaskUpdateSchema
from utils.reminders import calculate_task_stats
from datetime import datetime, date

tasks_bp = Blueprint('tasks', __name__)
task_schema = TaskSchema()
task_update_schema = TaskUpdateSchema()

@tasks_bp.route('/tasks', methods=['GET'])
def get_tasks():
    """Obtener todas las tareas"""
    try:
        tasks = Task.query.order_by(Task.created_at.desc()).all()
        return jsonify([task.to_dict() for task in tasks])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@tasks_bp.route('/tasks/<int:task_id>', methods=['GET'])
def get_task(task_id):
    """Obtener una tarea específica"""
    try:
        task = Task.query.get_or_404(task_id)
        return jsonify(task.to_dict())
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@tasks_bp.route('/tasks', methods=['POST'])
def create_task():
    """Crear una nueva tarea"""
    try:
        data = request.get_json()
        
        # Validar datos
        errors = task_schema.validate(data)
        if errors:
            return jsonify({'errors': errors}), 400
        
        # Crear tarea
        task = Task.from_dict(data)
        db.session.add(task)
        db.session.commit()
        
        return jsonify(task.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@tasks_bp.route('/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    """Actualizar una tarea completa"""
    try:
        task = Task.query.get_or_404(task_id)
        data = request.get_json()
        
        # Validar datos
        errors = task_schema.validate(data, partial=False)
        if errors:
            return jsonify({'errors': errors}), 400
        
        # Actualizar tarea
        task.title = data['title']
        task.description = data.get('description')
        task.deadline = datetime.strptime(data['deadline'], '%Y-%m-%d').date()
        task.priority = data.get('priority', 'medium')
        task.category = data.get('category')
        task.status = data.get('status', 'pending')
        
        db.session.commit()
        return jsonify(task.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@tasks_bp.route('/tasks/<int:task_id>', methods=['PATCH'])
def patch_task(task_id):
    """Actualizar parcialmente una tarea"""
    try:
        task = Task.query.get_or_404(task_id)
        data = request.get_json()
        
        # Validar datos
        errors = task_update_schema.validate(data)
        if errors:
            return jsonify({'errors': errors}), 400
        
        # Actualizar campos proporcionados
        if 'title' in data:
            task.title = data['title']
        if 'description' in data:
            task.description = data['description']
        if 'deadline' in data:
            task.deadline = datetime.strptime(data['deadline'], '%Y-%m-%d').date()
        if 'priority' in data:
            task.priority = data['priority']
        if 'category' in data:
            task.category = data['category']
        if 'status' in data:
            task.status = data['status']
        
        db.session.commit()
        return jsonify(task.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@tasks_bp.route('/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    """Eliminar una tarea"""
    try:
        task = Task.query.get_or_404(task_id)
        db.session.delete(task)
        db.session.commit()
        return jsonify({'message': 'Tarea eliminada correctamente'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@tasks_bp.route('/stats', methods=['GET'])
def get_stats():
    """Obtener estadísticas de tareas"""
    try:
        stats = calculate_task_stats()
        return jsonify(stats)
    except Exception as e:
        return jsonify({'error': str(e)}), 500