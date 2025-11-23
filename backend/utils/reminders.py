from datetime import datetime, date, timedelta
from models.task import Task

def get_overdue_tasks():
    """Obtener tareas vencidas"""
    today = date.today()
    return Task.query.filter(
        Task.deadline < today,
        Task.status != 'completed'
    ).all()

def get_due_soon_tasks(days=3):
    """Obtener tareas próximas a vencer"""
    today = date.today()
    due_date = today + timedelta(days=days)
    return Task.query.filter(
        Task.deadline >= today,
        Task.deadline <= due_date,
        Task.status != 'completed'
    ).all()

def calculate_task_stats():
    """Calcular estadísticas de tareas"""
    from db import db
    
    total = Task.query.count()
    pending = Task.query.filter_by(status='pending').count()
    in_progress = Task.query.filter_by(status='in-progress').count()
    completed = Task.query.filter_by(status='completed').count()
    
    # Tareas vencidas
    today = date.today()
    overdue = Task.query.filter(
        Task.deadline < today,
        Task.status != 'completed'
    ).count()
    
    # Tareas próximas a vencer (3 días)
    due_soon = get_due_soon_tasks().count()
    
    # Estadísticas por prioridad
    by_priority = {
        'low': Task.query.filter_by(priority='low').count(),
        'medium': Task.query.filter_by(priority='medium').count(),
        'high': Task.query.filter_by(priority='high').count()
    }
    
    # Estadísticas por categoría
    category_stats = db.session.execute(
        "SELECT category, COUNT(*) as count FROM tasks WHERE category IS NOT NULL GROUP BY category"
    ).fetchall()
    
    by_category = [{'category': row[0], 'count': row[1]} for row in category_stats]
    
    return {
        'total': total,
        'pending': pending,
        'inProgress': in_progress,
        'completed': completed,
        'overdue': overdue,
        'dueSoon': due_soon,
        'byPriority': by_priority,
        'byCategory': by_category
    }