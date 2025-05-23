export interface TodoItem {
  title: string;
  id: string;
  createdBy: string;
  createdAt: string;
}

export interface TodoListService {
  createTodo(input: { title: string; entityRef?: string }): Promise<TodoItem>;

  listTodos(): Promise<{ items: TodoItem[] }>;

  getTodo(request: { id: string }): Promise<TodoItem>;
}
