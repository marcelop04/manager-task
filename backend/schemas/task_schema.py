from marshmallow import Schema, fields, validate, validates_schema, ValidationError
from datetime import datetime, date

class TaskSchema(Schema):
    id = fields.Int(dump_only=True)
    title = fields.Str(required=True, validate=validate.Length(min=1, max=500))
    description = fields.Str(allow_none=True)
    deadline = fields.Date(required=True)
    priority = fields.Str(validate=validate.OneOf(['low', 'medium', 'high']))
    category = fields.Str(allow_none=True, validate=validate.Length(max=100))
    status = fields.Str(validate=validate.OneOf(['pending', 'in-progress', 'completed']))
    created_at = fields.DateTime(dump_only=True)
    
    @validates_schema
    def validate_deadline(self, data, **kwargs):
        if 'deadline' in data and data['deadline']:
            if data['deadline'] < date.today():
                raise ValidationError('La fecha límite no puede ser en el pasado')

class TaskUpdateSchema(Schema):
    title = fields.Str(validate=validate.Length(min=1, max=500))
    description = fields.Str(allow_none=True)
    deadline = fields.Date()
    priority = fields.Str(validate=validate.OneOf(['low', 'medium', 'high']))
    category = fields.Str(allow_none=True, validate=validate.Length(max=100))
    status = fields.Str(validate=validate.OneOf(['pending', 'in-progress', 'completed']))
    
    @validates_schema
    def validate_deadline(self, data, **kwargs):
        if 'deadline' in data and data['deadline']:
            if data['deadline'] < date.today():
                raise ValidationError('La fecha límite no puede ser en el pasado')