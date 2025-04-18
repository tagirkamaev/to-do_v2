import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { taskService, Task, CreateTaskData } from "../../services/taskService";
import { AxiosError } from "axios";

// state type
interface TasksState {
  tasks: Task[];
  currentTask: Task | null;
  loading: boolean;
  error: string | null;
  filter: {
    project: string | null;
    status: string | null;
    priority: string | null;
    search: string;
  };
}

const initialState: TasksState = {
  tasks: [],
  currentTask: null,
  loading: false,
  error: null,
  filter: {
    project: null,
    status: null,
    priority: null,
    search: "",
  },
};

export const fetchTasks = createAsyncThunk("tasks/fetchAll", async (_, { rejectWithValue }) => {
  try {
    return await taskService.getTasks();
  } catch (error: unknown) {
    const axiosError = error as AxiosError<{ message?: string }>;
    return rejectWithValue(axiosError.response?.data?.message || "Failed to fetch tasks");
  }
});

export const fetchTasksByProject = createAsyncThunk(
  "tasks/fetchByProject",
  async (projectId: string, { rejectWithValue }) => {
    try {
      return await taskService.getTasksByProject(projectId);
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return rejectWithValue(
        axiosError.response?.data?.message || "Failed to fetch tasks for project"
      );
    }
  }
);

export const fetchTask = createAsyncThunk(
  "tasks/fetchOne",
  async (id: string, { rejectWithValue }) => {
    try {
      return await taskService.getTask(id);
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return rejectWithValue(axiosError.response?.data?.message || "Failed to fetch task");
    }
  }
);

export const createTask = createAsyncThunk(
  "tasks/create",
  async (data: CreateTaskData, { rejectWithValue }) => {
    try {
      return await taskService.createTask(data);
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return rejectWithValue(axiosError.response?.data?.message || "Failed to create task");
    }
  }
);

export const updateTask = createAsyncThunk(
  "tasks/update",
  async ({ id, data }: { id: string; data: Partial<CreateTaskData> }, { rejectWithValue }) => {
    try {
      return await taskService.updateTask(id, data);
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return rejectWithValue(axiosError.response?.data?.message || "Failed to update task");
    }
  }
);

export const deleteTask = createAsyncThunk(
  "tasks/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await taskService.deleteTask(id);
      return id; // Возвращаем ID удаленной задачи
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return rejectWithValue(axiosError.response?.data?.message || "Failed to delete task");
    }
  }
);

// slice
const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    clearTasksError: state => {
      state.error = null;
    },
    setCurrentTask: (state, action) => {
      state.currentTask = action.payload;
    },
    clearCurrentTask: state => {
      state.currentTask = null;
    },
    // Фильтры
    setProjectFilter: (state, action) => {
      state.filter.project = action.payload;
    },
    setStatusFilter: (state, action) => {
      state.filter.status = action.payload;
    },
    setPriorityFilter: (state, action) => {
      state.filter.priority = action.payload;
    },
    setSearchFilter: (state, action) => {
      state.filter.search = action.payload;
    },
    clearFilters: state => {
      state.filter = {
        project: null,
        status: null,
        priority: null,
        search: "",
      };
    },
  },
  extraReducers: builder => {
    builder
      // Получение всех задач
      .addCase(fetchTasks.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Получение задач по проекту
      .addCase(fetchTasksByProject.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasksByProject.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchTasksByProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Получение одной задачи
      .addCase(fetchTask.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTask.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTask = action.payload;
      })
      .addCase(fetchTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Создание задачи
      .addCase(createTask.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks.push(action.payload);
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Обновление задачи
      .addCase(updateTask.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.loading = false;
        // Обновляем задачу в массиве
        const index = state.tasks.findIndex(t => t._id === action.payload._id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        // Если это текущая задача, обновляем и её
        if (state.currentTask && state.currentTask._id === action.payload._id) {
          state.currentTask = action.payload;
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Удаление задачи
      .addCase(deleteTask.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.loading = false;
        // Удаляем задачу из массива
        state.tasks = state.tasks.filter(t => t._id !== action.payload);
        // Если удалили текущую задачу, очищаем её
        if (state.currentTask && state.currentTask._id === action.payload) {
          state.currentTask = null;
        }
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearTasksError,
  setCurrentTask,
  clearCurrentTask,
  setProjectFilter,
  setStatusFilter,
  setPriorityFilter,
  setSearchFilter,
  clearFilters,
} = tasksSlice.actions;

export default tasksSlice.reducer;
