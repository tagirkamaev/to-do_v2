import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { projectService, Project, CreateProjectData } from "../../services/projectService";
import { AxiosError } from "axios";

interface ProjectsState {
  projects: Project[];
  currentProject: Project | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProjectsState = {
  projects: [],
  currentProject: null,
  loading: false,
  error: null,
};

// async thunks
export const fetchProjects = createAsyncThunk(
  "projects/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await projectService.getProjects();
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return rejectWithValue(axiosError.response?.data?.message || "Failed to fetch projects");
    }
  }
);

export const fetchProject = createAsyncThunk(
  "projects/fetchOne",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await projectService.getProject(id);
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return rejectWithValue(axiosError.response?.data?.message || "Failed to fetch project");
    }
  }
);

export const createProject = createAsyncThunk(
  "projects/create",
  async (data: CreateProjectData, { rejectWithValue }) => {
    try {
      return await projectService.createProject(data);
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return rejectWithValue(axiosError.response?.data?.message || "Failed to create project");
    }
  }
);

export const updateProject = createAsyncThunk(
  "projects/update",
  async ({ id, data }: { id: string; data: Partial<CreateProjectData> }, { rejectWithValue }) => {
    try {
      return await projectService.updateProject(id, data);
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return rejectWithValue(axiosError.response?.data?.message || "Failed to update project");
    }
  }
);

export const deleteProject = createAsyncThunk(
  "projects/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await projectService.deleteProject(id);
      return id;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return rejectWithValue(axiosError.response?.data?.message || "Failed to delete project");
    }
  }
);

// slice
const projectsSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    clearProjectsError: state => {
      state.error = null;
    },
    setCurrentProject: (state, action) => {
      state.currentProject = action.payload;
    },
    clearCurrentProject: state => {
      state.currentProject = null;
    },
  },
  extraReducers: builder => {
    builder
      // Получение всех проектов
      .addCase(fetchProjects.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Получение одного проекта
      .addCase(fetchProject.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProject.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProject = action.payload;
      })
      .addCase(fetchProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Создание проекта
      .addCase(createProject.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.loading = false;
        state.projects.push(action.payload);
      })
      .addCase(createProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Обновление проекта
      .addCase(updateProject.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.loading = false;
        // Обновляем проект в массиве
        const index = state.projects.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.projects[index] = action.payload;
        }
        // Если это текущий проект, обновляем и его
        if (state.currentProject && state.currentProject._id === action.payload._id) {
          state.currentProject = action.payload;
        }
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Удаление проекта
      .addCase(deleteProject.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.loading = false;
        // Удаляем проект из массива
        state.projects = state.projects.filter(p => p._id !== action.payload);
        // Если удалили текущий проект, очищаем его
        if (state.currentProject && state.currentProject._id === action.payload) {
          state.currentProject = null;
        }
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearProjectsError, setCurrentProject, clearCurrentProject } = projectsSlice.actions;

export default projectsSlice.reducer;
