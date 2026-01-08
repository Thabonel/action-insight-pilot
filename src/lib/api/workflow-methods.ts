
import { BaseApiClient } from './base-api-client';
import { ApiResponse, Workflow } from '../api-client-interface';

export class WorkflowMethods extends BaseApiClient {
  async getAll(): Promise<ApiResponse<Workflow[]>> {
    throw new Error('getAll not implemented - use Supabase client directly');
  }

  async create(workflow: Partial<Workflow>): Promise<ApiResponse<Workflow>> {
    throw new Error('create not implemented - use Supabase client directly');
  }

  async update(id: string, workflow: Partial<Workflow>): Promise<ApiResponse<Workflow>> {
    throw new Error('update not implemented - use Supabase client directly');
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    throw new Error('delete not implemented - use Supabase client directly');
  }

  async execute(id: string, input?: Record<string, unknown>): Promise<ApiResponse<Record<string, unknown>>> {
    throw new Error('execute not implemented - use Supabase client directly');
  }
}

