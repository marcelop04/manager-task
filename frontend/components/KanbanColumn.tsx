import React from "react";
import { Droppable, Draggable } from "react-beautiful-dnd";
import { Task } from "../types/Task";
import { TaskCard } from "./TaskCard";

interface KanbanColumnProps {
  title: string;
  tasks: Task[];
  status: Task["status"];
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: number) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  title,
  tasks,
  status,
  onEditTask,
  onDeleteTask,
}) => {
  return (
    <div className="kanban-column">
      <div className="column-header">
        <h3>{title}</h3>
        <span className="task-count">{tasks.length}</span>
      </div>

      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`task-list ${
              snapshot.isDraggingOver ? "dragging-over" : ""
            }`}
          >
            {tasks.map((task, index) => (
              <Draggable
                key={task.id}
                draggableId={task.id.toString()}
                index={index}
              >
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`task-item ${
                      snapshot.isDragging ? "dragging" : ""
                    }`}
                  >
                    <TaskCard
                      task={task}
                      onEdit={onEditTask}
                      onDelete={onDeleteTask}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};
